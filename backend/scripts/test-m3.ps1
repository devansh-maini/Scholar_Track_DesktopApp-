# ScholarTrack Milestone 3 smoke test.  Usage (from the backend folder, server running):
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-m3.ps1
param([string]$Base = "http://localhost:8080")
$script:pass = 0; $script:fail = 0

function Call($method, $path, $token, $body) {
  $h = @{}
  if ($token) { $h["Authorization"] = "Bearer $token" }
  try {
    $p = @{ Method = $method; Uri = "$Base$path"; Headers = $h; UseBasicParsing = $true }
    if ($body) { $p["Body"] = ($body | ConvertTo-Json -Depth 8); $p["ContentType"] = "application/json" }
    $r = Invoke-WebRequest @p
    return @{ Status = [int]$r.StatusCode; Json = ($r.Content | ConvertFrom-Json) }
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return @{ Status = $code; Json = $null }
  }
}
function Check($name, $ok, $detail) {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "FAIL  $name  ($detail)" -ForegroundColor Red; $script:fail++ }
}
function Login($u, $p) { return (Call "POST" "/api/v1/auth/login" $null @{ username = $u; password = $p }).Json.data.token }

$hod = Login "hod" "hod123"; $t1 = Login "teacher" "teacher123"; $t2 = Login "teacher2" "teacher123"
$stu = Login "student" "student123"; $stu5 = Login "student5" "student123"; $stu6 = Login "student6" "student123"
Check "logins" ($hod -and $t1 -and $t2 -and $stu -and $stu5 -and $stu6) "login failed - restart server so M3 seed data is created"

$classes = (Call "GET" "/api/v1/classes" $hod $null).Json.data
$classA = ($classes | Where-Object { $_.name -eq "CSE-A" }).id
$classB = ($classes | Where-Object { $_.name -eq "CSE-B" }).id
$subs = (Call "GET" "/api/v1/subjects?semesterNo=5" $hod $null).Json.data
$aoa = ($subs | Where-Object { $_.code -eq "CS501" }).id
$cn  = ($subs | Where-Object { $_.code -eq "CS504" }).id
$me  = (Call "GET" "/api/v1/students/me" $stu $null).Json.data
Check "setup ids found" ($classA -and $classB -and $aoa -and $cn -and $me.id) "missing ids"

# ---------- student: attendance ----------
$r = Call "GET" "/api/v1/students/me/attendance" $stu $null
$a = $r.Json.data
Check "student attendance summary (5 subjects, totals > 0)" ($r.Status -eq 200 -and $a.subjects.Count -eq 5 -and $a.total -gt 0 -and $a.percent -le 100) "status $($r.Status)"
$r5 = (Call "GET" "/api/v1/students/me/attendance" $stu5 $null).Json.data
$r6 = (Call "GET" "/api/v1/students/me/attendance" $stu6 $null).Json.data
Check "high-attendance student (student5) not flagged" ($r5.percent -ge 75 -and -not $r5.lowAttendance) "percent $($r5.percent)"
Check "low-attendance student (student6) flagged" ($r6.percent -lt 75 -and $r6.lowAttendance) "percent $($r6.percent)"
$formulaOk = $true
foreach ($s in $r6.subjects) {
  $n = $s.classesNeededFor75
  if (($s.attended + $n) * 4 -lt 3 * ($s.total + $n)) { $formulaOk = $false }
  if ($n -gt 0 -and ($s.attended + $n - 1) * 4 -ge 3 * ($s.total + $n - 1)) { $formulaOk = $false }
}
Check "classesNeededFor75 is exact and minimal for every subject" $formulaOk "formula mismatch"

# ---------- student: marks / results ----------
$r = Call "GET" "/api/v1/students/me/marks" $stu $null
Check "student marks (>= 10 rows: midterm+internal x 5 subjects)" ($r.Status -eq 200 -and $r.Json.data.Count -ge 10) "status $($r.Status)"
$r = Call "GET" "/api/v1/students/me/results" $stu $null
$res = $r.Json.data
Check "SGPA/CGPA in range 0-10, 4 previous semesters" ($r.Status -eq 200 -and $res.sgpa -gt 0 -and $res.sgpa -le 10 -and $res.cgpa -gt 0 -and $res.cgpa -le 10 -and $res.previous.Count -eq 4) "status $($r.Status)"
$res6 = (Call "GET" "/api/v1/students/me/results" $stu6 $null).Json.data
Check "weak student (student6) has lower SGPA than student5" ($res6.sgpa -lt (Call "GET" "/api/v1/students/me/results" $stu5 $null).Json.data.sgpa) "sgpa $($res6.sgpa)"

# ---------- teacher: attendance ----------
$today = (Get-Date).ToString("yyyy-MM-dd")
$sheet = (Call "GET" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/attendance?date=$today" $t1 $null)
Check "teacher gets attendance sheet for CSE-A / CS501" ($sheet.Status -eq 200 -and $sheet.Json.data.Count -ge 7) "status $($sheet.Status)"
$records = @(); $i = 0
foreach ($row in $sheet.Json.data) { $st = "PRESENT"; if ($i -eq 0) { $st = "ABSENT" }; $records += @{ studentId = $row.studentId; status = $st }; $i++ }
$r = Call "PUT" "/api/v1/teachers/me/attendance" $t1 @{ classId = $classA; subjectId = $aoa; date = $today; records = $records }
Check "teacher marks attendance (upsert)" ($r.Status -eq 200 -and $r.Json.data.saved -eq $records.Count) "status $($r.Status)"
$after = (Call "GET" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/attendance?date=$today" $t1 $null).Json.data
Check "sheet now shows saved statuses (first ABSENT, rest PRESENT)" ($after[0].status -eq "ABSENT" -and $after[1].status -eq "PRESENT") "statuses not saved"
$future = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
$r = Call "PUT" "/api/v1/teachers/me/attendance" $t1 @{ classId = $classA; subjectId = $aoa; date = $future; records = $records }
Check "future attendance date -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "PUT" "/api/v1/teachers/me/attendance" $t1 @{ classId = $classA; subjectId = $aoa; date = $today; records = @(@{ studentId = $me.id; status = "MAYBE" }) }
Check "invalid attendance status -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/attendance?date=notadate" $t1 $null
Check "bad date parameter -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classB/subjects/$cn/attendance?date=$today" $t1 $null
Check "teacher not assigned to CSE-B -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classA/subjects/$cn/attendance?date=$today" $t1 $null
Check "teacher not assigned to CS504 -> 403" ($r.Status -eq 403) "status $($r.Status)"
$bStu = (Call "GET" "/api/v1/teachers/me/classes/$classB/students" $t2 $null).Json.data[0].id
$r = Call "PUT" "/api/v1/teachers/me/attendance" $t1 @{ classId = $classA; subjectId = $aoa; date = $today; records = @(@{ studentId = $bStu; status = "PRESENT" }) }
Check "student from another class -> 400" ($r.Status -eq 400) "status $($r.Status)"

# ---------- teacher -> student visibility (the integration scenario) ----------
$r = Call "PUT" "/api/v1/teachers/me/marks" $t1 @{ classId = $classA; subjectId = $aoa; assessmentType = "MIDTERM"; maxMarks = 30; entries = @(@{ studentId = $me.id; marks = 25 }) }
Check "teacher saves MIDTERM 25/30 for student" ($r.Status -eq 200 -and $r.Json.data.saved -eq 1) "status $($r.Status)"
$mm = (Call "GET" "/api/v1/students/me/marks" $stu $null).Json.data | Where-Object { $_.subjectCode -eq "CS501" -and $_.assessmentType -eq "MIDTERM" }
Check "student immediately sees 25 / 30" ([double]$mm.marks -eq 25 -and [double]$mm.maxMarks -eq 30) "marks $($mm.marks)"
$r = Call "PUT" "/api/v1/teachers/me/marks" $t1 @{ classId = $classA; subjectId = $aoa; assessmentType = "MIDTERM"; maxMarks = 30; entries = @(@{ studentId = $me.id; marks = 31 }) }
Check "marks above maximum -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "PUT" "/api/v1/teachers/me/marks" $t1 @{ classId = $classA; subjectId = $aoa; assessmentType = "MIDTERM"; maxMarks = 30; entries = @(@{ studentId = $me.id; marks = -1 }) }
Check "negative marks -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/marks" $t1 $null
Check "teacher lists class marks" ($r.Status -eq 200 -and $r.Json.data.Count -ge 14) "status $($r.Status)"
$r = Call "PUT" "/api/v1/teachers/me/marks" $t1 @{ classId = $classA; subjectId = $cn; assessmentType = "MIDTERM"; maxMarks = 30; entries = @(@{ studentId = $me.id; marks = 20 }) }
Check "marks for a subject the teacher doesn't teach -> 403" ($r.Status -eq 403) "status $($r.Status)"

# ---------- coursework ----------
$my = (Call "GET" "/api/v1/students/me/coursework" $stu $null).Json.data
Check "student sees 10 assignments incl. PENDING ones" ($my.Count -ge 10 -and ($my | Where-Object { $_.status -eq "PENDING" -or $_.status -eq "SUBMITTED" }).Count -ge 5) "count $($my.Count)"
$open = $my | Where-Object { $_.subjectCode -eq "CS501" -and $_.title -eq "Assignment 2" } | Select-Object -First 1
$r = Call "POST" "/api/v1/students/me/coursework/$($open.id)/submit" $stu @{ content = "https://example.edu/my-work" }
Check "student submits Assignment 2 (on time)" ($r.Status -eq 200 -and $r.Json.data.status -eq "SUBMITTED") "status $($r.Status)"
$r = Call "POST" "/api/v1/students/me/coursework/$($open.id)/submit" $stu @{ content = "" }
Check "empty submission -> 400" ($r.Status -eq 400) "status $($r.Status)"

$d = (Get-Date).AddDays(10).ToString("yyyy-MM-ddTHH:mm:ss")
$r = Call "POST" "/api/v1/teachers/me/coursework" $t1 @{ classId = $classA; subjectId = $aoa; title = "Quiz $(Get-Random)"; description = "Test"; deadline = $d; maxMarks = 10 }
Check "teacher creates assignment -> 201" ($r.Status -eq 201) "status $($r.Status)"
$past = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss")
$r = Call "POST" "/api/v1/teachers/me/coursework" $t1 @{ classId = $classA; subjectId = $aoa; title = "Bad"; deadline = $past; maxMarks = 10 }
Check "past deadline -> 400" ($r.Status -eq 400) "status $($r.Status)"
$list = (Call "GET" "/api/v1/teachers/me/coursework" $t1 $null).Json.data
$a1 = $list | Where-Object { $_.subjectCode -eq "CS501" -and $_.title -eq "Assignment 1" } | Select-Object -First 1
$subm = (Call "GET" "/api/v1/teachers/me/coursework/$($a1.id)/submissions" $t1 $null).Json.data
Check "teacher sees submissions for Assignment 1" ($subm.Count -ge 1) "count $($subm.Count)"
$sid = $subm[0].id
$r = Call "PUT" "/api/v1/teachers/me/coursework/$($a1.id)/submissions/$sid/evaluate" $t1 @{ marks = 8; feedback = "Well done" }
Check "teacher evaluates a submission" ($r.Status -eq 200 -and $r.Json.data.status -eq "EVALUATED" -and [double]$r.Json.data.marks -eq 8) "status $($r.Status)"
$r = Call "PUT" "/api/v1/teachers/me/coursework/$($a1.id)/submissions/$sid/evaluate" $t1 @{ marks = 11; feedback = "x" }
Check "evaluation above max -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/coursework/$($a1.id)/submissions" $t2 $null
Check "other teacher cannot see these submissions -> 403" ($r.Status -eq 403) "status $($r.Status)"

# ---------- HOD + security ----------
$r = Call "GET" "/api/v1/hod/students/$($me.id)/performance" $hod $null
Check "HOD sees student performance (attendance + results)" ($r.Status -eq 200 -and $r.Json.data.results.cgpa -gt 0 -and $r.Json.data.attendance.total -gt 0) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/students/$($me.id)/performance" $t1 $null
Check "teacher on HOD performance route -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/coursework" $stu $null
Check "student on teacher route -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/students/me/results" $null $null
Check "no token -> 401" ($r.Status -eq 401) "status $($r.Status)"

Write-Host ""
Write-Host "Result: $($script:pass) passed, $($script:fail) failed" -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
