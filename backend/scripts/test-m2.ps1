# ScholarTrack Milestone 2 smoke test.  Usage (from the backend folder, server running):
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-m2.ps1
param([string]$Base = "http://localhost:8080")
$script:pass = 0; $script:fail = 0

function Call($method, $path, $token, $body) {
  $h = @{}
  if ($token) { $h["Authorization"] = "Bearer $token" }
  try {
    $p = @{ Method = $method; Uri = "$Base$path"; Headers = $h; UseBasicParsing = $true }
    if ($body) { $p["Body"] = ($body | ConvertTo-Json -Depth 5); $p["ContentType"] = "application/json" }
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

$hod = Login "hod" "hod123"; $t1 = Login "teacher" "teacher123"; $t2 = Login "teacher2" "teacher123"; $stu = Login "student" "student123"
Check "logins (hod, teacher, teacher2, student)" ($hod -and $t1 -and $t2 -and $stu) "a login failed - is the server running with seed data?"

$r = Call "GET" "/api/v1/departments" $stu $null
Check "student can list departments" ($r.Status -eq 200 -and $r.Json.data.Count -ge 1) "status $($r.Status)"
$r = Call "GET" "/api/v1/subjects?semesterNo=5" $stu $null
Check "5 subjects in semester 5" ($r.Status -eq 200 -and $r.Json.data.Count -ge 5) "status $($r.Status)"
$r = Call "GET" "/api/v1/classes" $hod $null
$classA = ($r.Json.data | Where-Object { $_.name -eq "CSE-A" }).id
$classB = ($r.Json.data | Where-Object { $_.name -eq "CSE-B" }).id
Check "classes CSE-A and CSE-B exist" ($classA -and $classB) "status $($r.Status)"
$r = Call "GET" "/api/v1/departments" $null $null
Check "no token -> 401" ($r.Status -eq 401) "status $($r.Status)"

$r = Call "GET" "/api/v1/hod/students?size=5" $hod $null
Check "HOD paged student list (size 5)" ($r.Status -eq 200 -and $r.Json.data.content.Count -eq 5 -and $r.Json.data.totalElements -ge 10) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/students?q=ananya" $hod $null
Check "HOD search 'ananya' finds 1" ($r.Status -eq 200 -and $r.Json.data.totalElements -eq 1) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/students" $stu $null
Check "student on HOD route -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/teachers" $hod $null
Check "HOD lists teachers (>=2)" ($r.Status -eq 200 -and $r.Json.data.Count -ge 2) "status $($r.Status)"

$r = Call "GET" "/api/v1/students/me" $stu $null
Check "student sees own profile" ($r.Status -eq 200 -and $r.Json.data.rollNo -eq "CSE2301" -and $r.Json.data.className -eq "CSE-A") "status $($r.Status)"
$r = Call "GET" "/api/v1/students/me/subjects" $stu $null
Check "student sees 5 subjects of own class" ($r.Status -eq 200 -and $r.Json.data.Count -eq 5) "status $($r.Status)"
$r = Call "GET" "/api/v1/students/me" $t1 $null
Check "teacher on student-only route -> 403" ($r.Status -eq 403) "status $($r.Status)"

$r = Call "GET" "/api/v1/teachers/me/assignments" $t1 $null
Check "teacher has 3 assignments" ($r.Status -eq 200 -and $r.Json.data.Count -eq 3) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classA/students" $t1 $null
Check "teacher sees CSE-A students (7)" ($r.Status -eq 200 -and $r.Json.data.Count -ge 7) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classB/students" $t1 $null
Check "teacher NOT assigned to CSE-B -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classB/students" $t2 $null
Check "teacher2 sees CSE-B students (3)" ($r.Status -eq 200 -and $r.Json.data.Count -eq 3) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/nothing-here" $t1 $null
Check "unknown route -> 404 (not 500)" ($r.Status -eq 404) "status $($r.Status)"

$suffix = Get-Random -Minimum 1000 -Maximum 9999
$r = Call "POST" "/api/v1/hod/departments" $hod @{ code = "T$suffix"; name = "Test Dept $suffix" }
Check "HOD creates department -> 201" ($r.Status -eq 201) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/departments" $hod @{ code = "T$suffix"; name = "Duplicate" }
Check "duplicate department -> 409" ($r.Status -eq 409) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/students" $hod @{ username = "x"; email = "bad"; fullName = ""; password = "1"; rollNo = ""; classId = $null }
Check "invalid student body -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/students" $hod @{ username = "new$suffix"; email = "new$suffix@scholartrack.local"; fullName = "New Student $suffix"; password = "secret123"; rollNo = "NEW$suffix"; classId = $classA }
Check "HOD creates student -> 201" ($r.Status -eq 201) "status $($r.Status)"
$r = Call "POST" "/api/v1/auth/login" $null @{ username = "new$suffix"; password = "secret123" }
Check "new student can log in" ($r.Status -eq 200) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/departments" $t1 @{ code = "ZZ"; name = "No" }
Check "teacher cannot create department -> 403" ($r.Status -eq 403) "status $($r.Status)"

Write-Host ""
Write-Host "Result: $($script:pass) passed, $($script:fail) failed" -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
