# ScholarTrack Milestone 5 smoke test: analytics + risk score, reports (PDF/CSV/Excel), AI assistant.
# Usage (from the backend folder, server running):
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-m5.ps1
# Sample report files are saved to scripts\sample-reports so you can open them.
param([string]$Base = "http://localhost:8080")
$script:pass = 0; $script:fail = 0
$sampleDir = Join-Path $PSScriptRoot "sample-reports"
New-Item -ItemType Directory -Force -Path $sampleDir | Out-Null

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
function Get-Raw($path, $token) {
  try {
    $r = Invoke-WebRequest -Uri "$Base$path" -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
    return @{ Status = [int]$r.StatusCode; Type = [string]$r.Headers["Content-Type"]; Disposition = [string]$r.Headers["Content-Disposition"]; Bytes = $r.RawContentStream.ToArray() }
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return @{ Status = $code; Type = ""; Disposition = ""; Bytes = @() }
  }
}
function Check($name, $ok, $detail) {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "FAIL  $name  ($detail)" -ForegroundColor Red; $script:fail++ }
}
function Login($u, $p) { return (Call "POST" "/api/v1/auth/login" $null @{ username = $u; password = $p }).Json.data.token }
function Is-Pdf($b) { return ($b.Length -gt 1000 -and [System.Text.Encoding]::ASCII.GetString($b, 0, 5) -eq "%PDF-") }
function Is-Xlsx($b) { return ($b.Length -gt 3000 -and $b[0] -eq 0x50 -and $b[1] -eq 0x4B) }
function Text($b) { return [System.Text.Encoding]::UTF8.GetString($b) }
function Save($name, $b) { [System.IO.File]::WriteAllBytes((Join-Path $sampleDir $name), [byte[]]$b) }

$hod = Login "hod" "hod123"; $t1 = Login "teacher" "teacher123"; $t2 = Login "teacher2" "teacher123"
$stu = Login "student" "student123"; $stu5 = Login "student5" "student123"; $stu6 = Login "student6" "student123"
Check "logins" ($hod -and $t1 -and $t2 -and $stu -and $stu5 -and $stu6) "login failed"

$classes = (Call "GET" "/api/v1/classes" $hod $null).Json.data
$classA = ($classes | Where-Object { $_.name -eq "CSE-A" }).id
$classB = ($classes | Where-Object { $_.name -eq "CSE-B" }).id
$subs = (Call "GET" "/api/v1/subjects?semesterNo=5" $hod $null).Json.data
$aoa = ($subs | Where-Object { $_.code -eq "CS501" }).id
$cn  = ($subs | Where-Object { $_.code -eq "CS504" }).id
$me  = (Call "GET" "/api/v1/students/me" $stu $null).Json.data
Check "setup ids found" ($classA -and $classB -and $aoa -and $cn -and $me.id) "missing ids"

# ======================= ANALYTICS =======================
$r = Call "GET" "/api/v1/hod/analytics/dashboard" $hod $null
$d = $r.Json.data
Check "HOD dashboard has all headline numbers" ($r.Status -eq 200 -and $d.totalStudents -ge 10 -and $d.totalTeachers -ge 2 -and $d.averageAttendance -gt 0 -and $d.averageAttendance -le 100 -and $d.averageCgpa -gt 0 -and $d.lowAttendanceCount -ge 1 -and $d.highRiskCount -ge 1 -and [double]$d.outstandingFees -gt 0) "status $($r.Status)"
Check "dashboard shows recent department activity" ($d.recentActivity.Count -ge 1) "no activity"
Check "teacher cannot open HOD dashboard -> 403" ((Call "GET" "/api/v1/hod/analytics/dashboard" $t1 $null).Status -eq 403) "not blocked"
Check "student cannot open HOD analytics -> 403" ((Call "GET" "/api/v1/hod/analytics/risk" $stu $null).Status -eq 403) "not blocked"
Check "no token -> 401" ((Call "GET" "/api/v1/hod/analytics/dashboard" $null $null).Status -eq 401) "not blocked"

$r = Call "GET" "/api/v1/hod/analytics/semesters" $hod $null
$sem5 = $r.Json.data | Where-Object { $_.semesterNo -eq 5 }
Check "semester analytics (semester 5 with 10+ students)" ($r.Status -eq 200 -and $sem5.students -ge 10 -and $sem5.averageAttendance -gt 0) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/analytics/classes" $hod $null
Check "class analytics (CSE-A and CSE-B)" ($r.Status -eq 200 -and (@($r.Json.data | Where-Object { $_.className -eq "CSE-A" -or $_.className -eq "CSE-B" }).Count -eq 2)) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/analytics/subjects" $hod $null
$sorted = $true; for ($i = 1; $i -lt $r.Json.data.Count; $i++) { if ($r.Json.data[$i].averagePercentage -lt $r.Json.data[$i - 1].averagePercentage) { $sorted = $false } }
Check "subject analytics: 5 subjects, weakest first" ($r.Status -eq 200 -and $r.Json.data.Count -eq 5 -and $sorted) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/analytics/attendance-trend" $hod $null
Check "attendance trend (15+ days, 0-100%)" ($r.Status -eq 200 -and $r.Json.data.Count -ge 15 -and -not ($r.Json.data | Where-Object { $_.percent -lt 0 -or $_.percent -gt 100 })) "status $($r.Status)"

$riskAll = (Call "GET" "/api/v1/hod/analytics/risk?size=100" $hod $null).Json.data.content
$v = $riskAll | Where-Object { $_.rollNo -eq "CSE2306" }
$ananya = $riskAll | Where-Object { $_.rollNo -eq "CSE2301" }
Check "risk list sorted highest score first" (($riskAll.Count -ge 10) -and ($riskAll[0].riskScore -ge $riskAll[$riskAll.Count - 1].riskScore)) "not sorted"
Check "weak student (Vikram, CSE2306) is HIGH risk" ($v.riskLevel -eq "HIGH" -and $v.riskScore -ge 55 -and $v.lowAttendance) "level $($v.riskLevel) score $($v.riskScore)"
$r = Call "GET" "/api/v1/hod/analytics/risk?level=HIGH" $hod $null
Check "risk filter level=HIGH returns only HIGH, includes Vikram" ($r.Status -eq 200 -and -not ($r.Json.data.content | Where-Object { $_.riskLevel -ne "HIGH" }) -and ($r.Json.data.content | Where-Object { $_.rollNo -eq "CSE2306" })) "status $($r.Status)"
Check "invalid risk level -> 400" ((Call "GET" "/api/v1/hod/analytics/risk?level=EXTREME" $hod $null).Status -eq 400) "not rejected"
$r = Call "GET" "/api/v1/hod/analytics/risk/$($v.studentId)" $hod $null
$sumContrib = 0; foreach ($c in $r.Json.data.risk.components) { $sumContrib += [double]$c.contribution }
Check "risk detail: 5 components that add up to the score, with reasons" ($r.Status -eq 200 -and $r.Json.data.risk.components.Count -eq 5 -and [math]::Abs($sumContrib - $r.Json.data.risk.score) -le 1.0 -and $r.Json.data.risk.reasons.Count -ge 1) "sum $sumContrib vs score $($r.Json.data.risk.score)"
Check "unknown student risk -> 404" ((Call "GET" "/api/v1/hod/analytics/risk/999999" $hod $null).Status -eq 404) "not 404"

$rv = Call "GET" "/api/v1/students/me/risk" $stu6 $null
Check "student6 sees own risk = HOD's number (same formula everywhere)" ($rv.Status -eq 200 -and $rv.Json.data.risk.score -eq $v.riskScore -and $rv.Json.data.risk.level -eq "HIGH") "own $($rv.Json.data.risk.score) vs HOD $($v.riskScore)"
$r5 = Call "GET" "/api/v1/students/me/risk" $stu5 $null
Check "strong student (student5) is LOW risk" ($r5.Json.data.risk.level -eq "LOW") "level $($r5.Json.data.risk.level)"
Check "teacher cannot use student risk route -> 403" ((Call "GET" "/api/v1/students/me/risk" $t1 $null).Status -eq 403) "not blocked"

$myRes = (Call "GET" "/api/v1/students/me/results" $stu $null).Json.data
$myAtt = (Call "GET" "/api/v1/students/me/attendance" $stu $null).Json.data
Check "HOD analytics match the student's own screens (SGPA and attendance)" (([math]::Abs($ananya.sgpa - $myRes.sgpa) -lt 0.011) -and ([math]::Abs($ananya.cgpa - $myRes.cgpa) -lt 0.011) -and ([math]::Abs($ananya.attendancePct - $myAtt.percent) -lt 0.011)) "SGPA $($ananya.sgpa) vs $($myRes.sgpa)"

$ids = "$($v.studentId),$($ananya.studentId),$($riskAll[0].studentId)"
$r = Call "GET" "/api/v1/hod/analytics/compare?studentIds=$ids" $hod $null
Check "compare 3 students" ($r.Status -eq 200 -and $r.Json.data.Count -ge 2) "status $($r.Status)"
Check "compare with 1 student -> 400" ((Call "GET" "/api/v1/hod/analytics/compare?studentIds=$($v.studentId)" $hod $null).Status -eq 400) "not rejected"
Check "compare with unknown student -> 404" ((Call "GET" "/api/v1/hod/analytics/compare?studentIds=$($v.studentId),999999" $hod $null).Status -eq 404) "not 404"
$r = Call "GET" "/api/v1/hod/analytics/low-attendance" $hod $null
$asc = $true; for ($i = 1; $i -lt $r.Json.data.Count; $i++) { if ($r.Json.data[$i].attendancePct -lt $r.Json.data[$i - 1].attendancePct) { $asc = $false } }
Check "low-attendance list: all < 75%, lowest first, includes Vikram" ($r.Status -eq 200 -and -not ($r.Json.data | Where-Object { $_.attendancePct -ge 75 }) -and $asc -and ($r.Json.data | Where-Object { $_.rollNo -eq "CSE2306" })) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classA/performance" $t1 $null
Check "teacher sees performance of own class (7+ students)" ($r.Status -eq 200 -and $r.Json.data.Count -ge 7) "status $($r.Status)"
Check "teacher not assigned to CSE-B -> 403" ((Call "GET" "/api/v1/teachers/me/classes/$classB/performance" $t1 $null).Status -eq 403) "not blocked"
Check "teacher2 sees CSE-B performance" ((Call "GET" "/api/v1/teachers/me/classes/$classB/performance" $t2 $null).Status -eq 200) "blocked"

# ======================= REPORTS =======================
$r = Get-Raw "/api/v1/reports/student/me?format=pdf" $stu
Check "student downloads own report as PDF" ($r.Status -eq 200 -and (Is-Pdf $r.Bytes) -and $r.Type -like "*pdf*" -and $r.Disposition -like "*attachment*") "status $($r.Status) type $($r.Type)"
if ($r.Status -eq 200) { Save "student-report.pdf" $r.Bytes }
$r = Get-Raw "/api/v1/reports/student/me?format=csv" $stu
$csv = Text $r.Bytes
Check "student report as CSV (name, SGPA, attendance table)" ($r.Status -eq 200 -and $csv -like "*Ananya Gupta*" -and $csv -like "*SGPA*" -and $csv -like "*Attendance by subject*") "status $($r.Status)"
if ($r.Status -eq 200) { Save "student-report.csv" $r.Bytes }
$r = Get-Raw "/api/v1/reports/student/me?format=xlsx" $stu
Check "student report as Excel (.xlsx)" ($r.Status -eq 200 -and (Is-Xlsx $r.Bytes)) "status $($r.Status) size $($r.Bytes.Length)"
if ($r.Status -eq 200) { Save "student-report.xlsx" $r.Bytes }
Check "unsupported format -> 400" ((Get-Raw "/api/v1/reports/student/me?format=docx" $stu).Status -eq 400) "not rejected"
Check "student cannot download another student's report -> 403" ((Get-Raw "/api/v1/reports/student/$($v.studentId)?format=pdf" $stu).Status -eq 403) "not blocked"
Check "teacher cannot use the student report route -> 403" ((Get-Raw "/api/v1/reports/student/me?format=pdf" $t1).Status -eq 403) "not blocked"
$r = Get-Raw "/api/v1/reports/student/$($v.studentId)?format=pdf" $hod
Check "HOD downloads any student's report" ($r.Status -eq 200 -and (Is-Pdf $r.Bytes)) "status $($r.Status)"

$r = Get-Raw "/api/v1/reports/department?format=pdf" $hod
Check "HOD downloads department performance report (PDF)" ($r.Status -eq 200 -and (Is-Pdf $r.Bytes)) "status $($r.Status)"
if ($r.Status -eq 200) { Save "department-report.pdf" $r.Bytes }
$r = Get-Raw "/api/v1/reports/department?format=xlsx" $hod
Check "department report as Excel" ($r.Status -eq 200 -and (Is-Xlsx $r.Bytes)) "status $($r.Status)"
if ($r.Status -eq 200) { Save "department-report.xlsx" $r.Bytes }
Check "student cannot download department report -> 403" ((Get-Raw "/api/v1/reports/department?format=pdf" $stu).Status -eq 403) "not blocked"
$r = Get-Raw "/api/v1/reports/fees?format=csv" $hod
Check "HOD fee report (CSV) lists fees" ($r.Status -eq 200 -and (Text $r.Bytes) -like "*Tuition*" -and (Text $r.Bytes) -like "*Outstanding*") "status $($r.Status)"
if ($r.Status -eq 200) { Save "fee-report.csv" $r.Bytes }
Check "teacher cannot download fee report -> 403" ((Get-Raw "/api/v1/reports/fees?format=csv" $t1).Status -eq 403) "not blocked"

$r = Get-Raw "/api/v1/reports/attendance?classId=$classA&format=csv" $t1
Check "teacher downloads attendance report for own class" ($r.Status -eq 200 -and (Text $r.Bytes) -like "*CSE2301*") "status $($r.Status)"
if ($r.Status -eq 200) { Save "attendance-cse-a.csv" $r.Bytes }
Check "teacher not assigned to CSE-B -> 403 on attendance report" ((Get-Raw "/api/v1/reports/attendance?classId=$classB&format=csv" $t1).Status -eq 403) "not blocked"
Check "teacher without classId -> 400" ((Get-Raw "/api/v1/reports/attendance?format=csv" $t1).Status -eq 400) "not rejected"
Check "HOD attendance report for all classes" ((Get-Raw "/api/v1/reports/attendance?format=pdf" $hod).Status -eq 200) "failed"
$r = Get-Raw "/api/v1/reports/marks?classId=$classA&subjectId=$aoa&format=csv" $t1
Check "teacher downloads marks report for own subject" ($r.Status -eq 200 -and (Text $r.Bytes) -like "*MIDTERM*") "status $($r.Status)"
Check "marks report for a subject they don't teach -> 403" ((Get-Raw "/api/v1/reports/marks?classId=$classA&subjectId=$cn&format=csv" $t1).Status -eq 403) "not blocked"
$r = Get-Raw "/api/v1/reports/assignments?classId=$classA&format=xlsx" $t1
Check "teacher downloads assignment report (Excel)" ($r.Status -eq 200 -and (Is-Xlsx $r.Bytes)) "status $($r.Status)"
$r = Get-Raw "/api/v1/reports/assignments?classId=$classA&format=csv" $hod
Check "assignment report lists Assignment 1 and 2" ($r.Status -eq 200 -and (Text $r.Bytes) -like "*Assignment 1*" -and (Text $r.Bytes) -like "*Assignment 2*") "status $($r.Status)"

# ======================= AI ASSISTANT =======================
Check "AI without token -> 401" ((Call "POST" "/api/v1/ai/chat" $null @{ message = "hi" }).Status -eq 401) "not blocked"
Check "AI with blank message -> 400" ((Call "POST" "/api/v1/ai/chat" $stu @{ message = "" }).Status -eq 400) "not rejected"

$cs = (Call "GET" "/api/v1/ai/context-preview" $stu $null).Json.data.context
Check "student AI context: own data (roll, SGPA, risk)" ($cs -like "*CSE2301*" -and $cs -like "*SGPA*" -and $cs -like "*RISK INDICATOR*") "context missing own data"
Check "student AI context does NOT contain other students" (-not ($cs -like "*Vikram Rathore*") -and -not ($cs -like "*Aditya Joshi*") -and -not ($cs -like "*CSE2306*")) "leaked another student"
$ct = (Call "GET" "/api/v1/ai/context-preview" $t1 $null).Json.data.context
Check "teacher AI context: own class only, flags weak students" ($ct -like "*CLASS CSE-A*" -and $ct -like "*Vikram Rathore*" -and -not ($ct -like "*CLASS CSE-B*") -and -not ($ct -like "*Aditya Joshi*")) "teacher scope wrong"
$ct2 = (Call "GET" "/api/v1/ai/context-preview" $t2 $null).Json.data.context
Check "teacher2 AI context covers both classes they teach" ($ct2 -like "*CLASS CSE-A*" -and $ct2 -like "*CLASS CSE-B*") "teacher2 scope wrong"
$ch = (Call "GET" "/api/v1/ai/context-preview" $hod $null).Json.data.context
Check "HOD AI context: dashboard, lowest semester, weak subjects, low-attendance + high-risk students" ($ch -like "*DASHBOARD*" -and $ch -like "*LOWEST-ATTENDANCE SEMESTER*" -and $ch -like "*SUBJECTS (weakest first)*" -and $ch -like "*Vikram Rathore*" -and $ch -like "*HIGH-RISK*") "HOD context incomplete"
Check "AI context never contains passwords or hashes" (-not (($cs + $ct + $ch) -match '(?i)password|\$2a\$')) "secret in context"

$r = Call "POST" "/api/v1/ai/chat" $stu @{ message = "Which subjects should I focus on this semester?" }
if ($r.Status -eq 200) {
  Check "AI chat answers (Groq key is configured)" ($r.Json.data.reply.Length -gt 10) "empty reply"
  Write-Host "      AI said: $($r.Json.data.reply.Substring(0, [math]::Min(160, $r.Json.data.reply.Length)))..." -ForegroundColor DarkGray
  $hist = (Call "GET" "/api/v1/ai/history" $stu $null).Json.data
  Check "AI history saved (question + answer)" ($hist.Count -ge 2) "history count $($hist.Count)"
} else {
  Check "AI unavailable/not configured -> clean 503 with a clear message, app keeps working" ($r.Status -eq 503) "status $($r.Status)"
  Write-Host "      (Set GROQ_API_KEY and restart the server to test real AI answers.)" -ForegroundColor Yellow
}
Check "clear AI history -> 200 and empty afterwards" ((Call "DELETE" "/api/v1/ai/history" $stu $null).Status -eq 200 -and (Call "GET" "/api/v1/ai/history" $stu $null).Json.data.Count -eq 0) "history not cleared"

Write-Host ""
Write-Host "Sample reports saved in: $sampleDir"
Write-Host "Result: $($script:pass) passed, $($script:fail) failed" -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
