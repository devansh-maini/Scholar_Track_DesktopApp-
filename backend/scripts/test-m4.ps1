# ScholarTrack Milestone 4 smoke test (fees, notices, complaints, syllabus, live WebSocket updates).
# Usage (from the backend folder, server running):
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-m4.ps1
param([string]$Base = "http://localhost:8080")
$script:pass = 0; $script:fail = 0
$WsBase = ($Base -replace '^http', 'ws') + "/ws"

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
function Titles($token, $query) { return @((Call "GET" "/api/v1/notices$query" $token $null).Json.data | ForEach-Object { $_.title }) }

# ---------- STOMP over WebSocket helpers ----------
function Send-Frame($ws, $text) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text + [char]0)
  $seg = [System.ArraySegment[byte]]::new($bytes)
  $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
}
function Receive-Frame($ws, $timeoutMs) {
  $buf = New-Object byte[] 16384
  $sb = New-Object System.Text.StringBuilder
  $cts = New-Object System.Threading.CancellationTokenSource($timeoutMs)
  try {
    do {
      $seg = [System.ArraySegment[byte]]::new($buf)
      $res = $ws.ReceiveAsync($seg, $cts.Token).GetAwaiter().GetResult()
      if ($res.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) { return "CLOSED" }
      [void]$sb.Append([System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Count))
    } while (-not $res.EndOfMessage)
    return $sb.ToString()
  } catch { return $null }
}
# Returns a connected+subscribed socket, or $null if the server rejected the CONNECT.
function Open-Stomp($token, $destination) {
  $ws = New-Object System.Net.WebSockets.ClientWebSocket
  try { $ws.ConnectAsync([Uri]$WsBase, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null } catch { return $null }
  $hdr = ""
  if ($token) { $hdr = "Authorization:Bearer $token`n" }
  Send-Frame $ws ("CONNECT`naccept-version:1.2`n" + $hdr + "`n")
  $f = Receive-Frame $ws 4000
  if (-not $f -or -not $f.StartsWith("CONNECTED")) { $ws.Dispose(); return $null }
  Send-Frame $ws ("SUBSCRIBE`nid:sub-0`ndestination:$destination`n`n")
  return $ws
}
function Wait-Event($ws, $type, $timeoutMs) {
  $deadline = (Get-Date).AddMilliseconds($timeoutMs)
  while ((Get-Date) -lt $deadline) {
    $left = [int]($deadline - (Get-Date)).TotalMilliseconds
    if ($left -le 0) { break }
    $f = Receive-Frame $ws $left
    if ($null -eq $f -or $f -eq "CLOSED") { return $false }
    if ($f -like "MESSAGE*" -and $f -like "*$type*") { return $true }
  }
  return $false
}

$hod = Login "hod" "hod123"; $t1 = Login "teacher" "teacher123"; $t2 = Login "teacher2" "teacher123"
$stu = Login "student" "student123"; $stu2 = Login "student2" "student123"; $stu4 = Login "student4" "student123"
$stu6 = Login "student6" "student123"; $stu8 = Login "student8" "student123"
Check "logins" ($hod -and $t1 -and $t2 -and $stu -and $stu2 -and $stu4 -and $stu6 -and $stu8) "login failed - delete the data folder and restart so M4 seed data is created"

$classes = (Call "GET" "/api/v1/classes" $hod $null).Json.data
$classA = ($classes | Where-Object { $_.name -eq "CSE-A" }).id
$classB = ($classes | Where-Object { $_.name -eq "CSE-B" }).id
$subs = (Call "GET" "/api/v1/subjects?semesterNo=5" $hod $null).Json.data
$aoa = ($subs | Where-Object { $_.code -eq "CS501" }).id
$cn  = ($subs | Where-Object { $_.code -eq "CS504" }).id
$me  = (Call "GET" "/api/v1/students/me" $stu $null).Json.data
$teachers = (Call "GET" "/api/v1/hod/teachers" $hod $null).Json.data
$teacherUserId = ($teachers | Where-Object { $_.username -eq "teacher" }).userId
Check "setup ids found" ($classA -and $classB -and $aoa -and $cn -and $me.id -and $teacherUserId) "missing ids"

# ======================= FEES =======================
$r = Call "GET" "/api/v1/students/me/fees" $stu $null
Check "student sees 2 fees; tuition PAID, exam fee outstanding" ($r.Status -eq 200 -and $r.Json.data.fees.Count -eq 2 -and (($r.Json.data.fees | Where-Object { $_.title -like "*Tuition*" }).status -eq "PAID") -and [double]$r.Json.data.totalOutstanding -gt 0) "status $($r.Status)"
$r = Call "GET" "/api/v1/students/me/fees" $stu4 $null
$tuition4 = $r.Json.data.fees | Where-Object { $_.title -like "*Tuition*" }
Check "student4 tuition OVERDUE with Rs.1500 late fee (outstanding 86500)" ($tuition4.status -eq "OVERDUE" -and [double]$tuition4.lateFeeApplied -eq 1500 -and [double]$tuition4.outstanding -eq 86500) "status $($tuition4.status) late $($tuition4.lateFeeApplied)"
$r = Call "GET" "/api/v1/hod/fees?q=CSE2302&size=10" $hod $null
$fee2 = $r.Json.data.content | Where-Object { $_.title -like "*Tuition*" } | Select-Object -First 1
Check "HOD finds student2 tuition fee (PARTIALLY_PAID)" ($r.Status -eq 200 -and $fee2.status -eq "PARTIALLY_PAID") "status $($fee2.status)"
$before = [double]$fee2.outstanding
$r = Call "POST" "/api/v1/hod/fees/$($fee2.id)/payments" $hod @{ amount = 100; method = "UPI"; reference = "TEST-$(Get-Random)" }
Check "HOD records a Rs.100 payment -> outstanding drops by 100" ($r.Status -eq 201 -and ([double]$r.Json.data.outstanding -eq ($before - 100))) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/fees/$($fee2.id)/payments" $hod @{ amount = 99999999; method = "CASH" }
Check "overpayment -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/fees/$($fee2.id)/payments" $hod @{ amount = -5; method = "CASH" }
Check "negative payment -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/fees/$($fee2.id)/payments" $stu2 @{ amount = 10; method = "CASH" }
Check "student cannot record payments -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/fees/summary" $hod $null
Check "HOD fee summary (billed, collected, outstanding, overdue count)" ($r.Status -eq 200 -and [double]$r.Json.data.totalOutstanding -gt 0 -and $r.Json.data.overdueCount -ge 2 -and [double]$r.Json.data.totalCollected -gt 0) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/fees?status=OVERDUE&size=50" $hod $null
Check "HOD filter status=OVERDUE" ($r.Status -eq 200 -and $r.Json.data.totalElements -ge 2 -and -not ($r.Json.data.content | Where-Object { $_.status -ne "OVERDUE" })) "status $($r.Status)"
$due = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
$r = Call "POST" "/api/v1/hod/fees" $hod @{ classId = $classB; title = "Lab Fee $(Get-Random)"; amount = 500; lateFee = 0; dueDate = $due }
Check "HOD bills a whole class -> 201 (3+ students)" ($r.Status -eq 201 -and $r.Json.data.created -ge 3) "status $($r.Status)"
$r = Call "POST" "/api/v1/hod/fees" $hod @{ classId = $classB; studentId = $me.id; title = "Bad"; amount = 500; lateFee = 0; dueDate = $due }
Check "fee with both studentId and classId -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/fees" $stu $null
Check "student on HOD fee route -> 403" ($r.Status -eq 403) "status $($r.Status)"

# ======================= NOTICES =======================
$tA = Titles $stu ""
Check "student (CSE-A) sees ALL + STUDENTS + own-class notices" (($tA -contains "Mid-Semester Exam Schedule") -and ($tA -contains "Fee Payment Reminder") -and ($tA -contains "AOA Tutorial Rescheduled")) "titles: $($tA -join ', ')"
Check "student does NOT see teacher-only, other-class or expired notices" (-not ($tA -contains "Faculty Meeting") -and -not ($tA -contains "CSE-B Lab Batch Change") -and -not ($tA -contains "Old Orientation Notice")) "titles: $($tA -join ', ')"
$tB = Titles $stu8 ""
Check "CSE-B student sees CSE-B notice but not CSE-A notice" (($tB -contains "CSE-B Lab Batch Change") -and -not ($tB -contains "AOA Tutorial Rescheduled")) "titles: $($tB -join ', ')"
$tT = Titles $t1 ""
Check "teacher sees TEACHERS notice, not STUDENTS-only notice" (($tT -contains "Faculty Meeting") -and -not ($tT -contains "Fee Payment Reminder")) "titles: $($tT -join ', ')"
Check "HOD hides expired by default, shows them with includeExpired=true" (-not ((Titles $hod "") -contains "Old Orientation Notice") -and ((Titles $hod "?includeExpired=true") -contains "Old Orientation Notice")) "expiry handling"
$first = (Call "GET" "/api/v1/notices" $stu $null).Json.data[0]
Check "URGENT notices are listed first" ($first.priority -eq "URGENT") "first priority $($first.priority)"

$nt = "Teacher Note $(Get-Random)"
$r = Call "POST" "/api/v1/notices" $t1 @{ title = $nt; description = "Bring your laptops."; priority = "NORMAL"; targetType = "CLASS"; targetId = $classA }
$myNoticeId = $r.Json.data.id
Check "teacher posts notice to own class -> 201" ($r.Status -eq 201) "status $($r.Status)"
Check "that notice reaches CSE-A student, not CSE-B student" ((Titles $stu "") -contains $nt -and -not ((Titles $stu8 "") -contains $nt)) "targeting wrong"
$r = Call "POST" "/api/v1/notices" $t1 @{ title = "X"; description = "x"; priority = "NORMAL"; targetType = "CLASS"; targetId = $classB }
Check "teacher posting to a class they don't teach -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "POST" "/api/v1/notices" $t1 @{ title = "X"; description = "x"; priority = "NORMAL"; targetType = "ALL" }
Check "teacher posting to ALL -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "POST" "/api/v1/notices" $stu @{ title = "X"; description = "x"; priority = "NORMAL"; targetType = "ALL" }
Check "student posting a notice -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "POST" "/api/v1/notices" $hod @{ title = "X"; description = "x"; priority = "NORMAL"; targetType = "CLASS" }
Check "CLASS notice without targetId -> 400" ($r.Status -eq 400) "status $($r.Status)"
$yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
$r = Call "POST" "/api/v1/notices" $hod @{ title = "X"; description = "x"; priority = "NORMAL"; targetType = "ALL"; expiryDate = $yesterday }
Check "expiry date in the past -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "POST" "/api/v1/notices" $hod @{ title = "Sem Notice $(Get-Random)"; description = "Semester 5 only"; priority = "IMPORTANT"; targetType = "SEMESTER"; targetId = 5 }
Check "HOD posts SEMESTER-targeted notice -> 201" ($r.Status -eq 201) "status $($r.Status)"
$hodNotice = (Call "GET" "/api/v1/notices" $hod $null).Json.data | Where-Object { $_.title -eq "Faculty Meeting" } | Select-Object -First 1
$r = Call "DELETE" "/api/v1/notices/$($hodNotice.id)" $t1 $null
Check "teacher deleting HOD's notice -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "DELETE" "/api/v1/notices/$myNoticeId" $t1 $null
Check "teacher deletes own notice" ($r.Status -eq 200) "status $($r.Status)"

# ======================= COMPLAINTS =======================
$r = Call "POST" "/api/v1/complaints" $stu @{ category = "ACADEMIC"; title = "Test complaint $(Get-Random)"; description = "Please review the quiz marking." }
$cid = $r.Json.data.id
Check "student submits complaint -> 201, status OPEN" ($r.Status -eq 201 -and $r.Json.data.status -eq "OPEN") "status $($r.Status)"
$r = Call "POST" "/api/v1/complaints" $stu @{ category = "ACADEMIC"; title = ""; description = "" }
Check "empty complaint -> 400" ($r.Status -eq 400) "status $($r.Status)"
Check "student sees own complaint, other student does not" ((@((Call "GET" "/api/v1/complaints" $stu $null).Json.data | Where-Object { $_.id -eq $cid }).Count -eq 1) -and (@((Call "GET" "/api/v1/complaints" $stu2 $null).Json.data | Where-Object { $_.id -eq $cid }).Count -eq 0)) "visibility wrong"
$r = Call "PUT" "/api/v1/complaints/$cid/assign" $stu @{ assigneeUserId = $teacherUserId }
Check "student cannot assign complaints -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "PUT" "/api/v1/complaints/$cid/assign" $hod @{ assigneeUserId = $teacherUserId }
Check "HOD assigns to teacher -> IN_PROGRESS" ($r.Status -eq 200 -and $r.Json.data.status -eq "IN_PROGRESS") "status $($r.Status)"
Check "teacher sees the assigned complaint" (@((Call "GET" "/api/v1/complaints" $t1 $null).Json.data | Where-Object { $_.id -eq $cid }).Count -eq 1) "not listed"
$r = Call "PUT" "/api/v1/complaints/$cid/status" $t2 @{ status = "RESOLVED"; resolution = "Not mine" }
Check "another teacher cannot update it -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "PUT" "/api/v1/complaints/$cid/status" $t1 @{ status = "RESOLVED"; resolution = "" }
Check "closing without a resolution note -> 400" ($r.Status -eq 400) "status $($r.Status)"
$r = Call "PUT" "/api/v1/complaints/$cid/status" $t1 @{ status = "RESOLVED"; resolution = "Marks rechecked and corrected." }
Check "assigned teacher resolves it" ($r.Status -eq 200 -and $r.Json.data.status -eq "RESOLVED" -and $r.Json.data.resolvedAt) "status $($r.Status)"
$r = Call "PUT" "/api/v1/complaints/$cid/status" $hod @{ status = "REJECTED"; resolution = "Too late" }
Check "closed complaint cannot change again -> 409" ($r.Status -eq 409) "status $($r.Status)"
$r = Call "GET" "/api/v1/complaints?status=RESOLVED" $hod $null
Check "HOD filters complaints by status" ($r.Status -eq 200 -and $r.Json.data.Count -ge 2 -and -not ($r.Json.data | Where-Object { $_.status -ne "RESOLVED" })) "status $($r.Status)"

# ======================= SYLLABUS =======================
$r = Call "GET" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/syllabus" $t1 $null
$syl = $r.Json.data
Check "teacher sees syllabus (6+ topics, 0-100 percent)" ($r.Status -eq 200 -and $syl.topics.Count -ge 6 -and $syl.percentComplete -ge 0 -and $syl.percentComplete -le 100) "status $($r.Status)"
$lastTopic = $syl.topics | Where-Object { -not $_.completed } | Select-Object -Last 1
$r = Call "PUT" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/syllabus/$($lastTopic.id)" $t1 @{ completed = $true }
Check "teacher marks a topic completed -> percent rises" ($r.Status -eq 200 -and $r.Json.data.percentComplete -gt $syl.percentComplete) "status $($r.Status)"
$mine = (Call "GET" "/api/v1/students/me/syllabus" $stu $null).Json.data | Where-Object { $_.subjectCode -eq "CS501" }
Check "student sees that topic as completed" ((($mine.topics | Where-Object { $_.id -eq $lastTopic.id }).completed) -eq $true) "not visible to student"
Call "PUT" "/api/v1/teachers/me/classes/$classA/subjects/$aoa/syllabus/$($lastTopic.id)" $t1 @{ completed = $false } | Out-Null
$r = Call "POST" "/api/v1/teachers/me/subjects/$aoa/syllabus" $t1 @{ unitNo = 4; title = "Extra topic $(Get-Random)" }
Check "teacher adds a topic to a subject they teach -> 201" ($r.Status -eq 201 -and $r.Json.data.topicsTotal -ge 7) "status $($r.Status)"
$r = Call "POST" "/api/v1/teachers/me/subjects/$cn/syllabus" $t1 @{ unitNo = 1; title = "Not mine" }
Check "adding a topic to a subject they don't teach -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/teachers/me/classes/$classB/subjects/$cn/syllabus" $t1 $null
Check "teacher not assigned to that class -> 403" ($r.Status -eq 403) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/syllabus-progress" $hod $null
Check "HOD syllabus overview (7 class-subject rows)" ($r.Status -eq 200 -and $r.Json.data.Count -ge 7) "status $($r.Status)"
$r = Call "GET" "/api/v1/hod/syllabus-progress" $stu $null
Check "student on HOD syllabus route -> 403" ($r.Status -eq 403) "status $($r.Status)"

# ======================= LIVE UPDATES (WebSocket / STOMP) =======================
$ws = Open-Stomp $null "/user/queue/events"
Check "WebSocket CONNECT without a token is rejected" ($null -eq $ws) "connection was accepted"
$ws = Open-Stomp "not.a.valid.token" "/user/queue/events"
Check "WebSocket CONNECT with an invalid token is rejected" ($null -eq $ws) "connection was accepted"

$ws = Open-Stomp $stu "/topic/everything"
$rejected = $true
if ($ws) { $f = Receive-Frame $ws 3000; $rejected = ($null -eq $f) -or ($f -eq "CLOSED") -or ($f -like "ERROR*") ; $ws.Dispose() }
Check "subscribing to anything except your own queue is rejected" $rejected "subscription was allowed"

$wsStu = Open-Stomp $stu "/user/queue/events"
$wsOther = Open-Stomp $stu2 "/user/queue/events"
$wsHod = Open-Stomp $hod "/user/queue/events"
Check "student, other student and HOD connect with valid tokens" ($wsStu -and $wsOther -and $wsHod) "a connection failed"
Start-Sleep -Milliseconds 500
Call "PUT" "/api/v1/teachers/me/marks" $t1 @{ classId = $classA; subjectId = $aoa; assessmentType = "INTERNAL"; maxMarks = 20; entries = @(@{ studentId = $me.id; marks = 17 }) } | Out-Null
Check "teacher saves marks -> that student receives MARKS_UPDATED live" (Wait-Event $wsStu "MARKS_UPDATED" 5000) "no event within 5s"
Check "HOD also receives MARKS_UPDATED live" (Wait-Event $wsHod "MARKS_UPDATED" 5000) "no event within 5s"
Check "a different student receives nothing (no data leak)" (-not (Wait-Event $wsOther "MARKS_UPDATED" 2500)) "other student got the event"
foreach ($w in @($wsStu, $wsOther, $wsHod)) { if ($w) { $w.Dispose() } }

$wsHod2 = Open-Stomp $hod "/user/queue/events"
Start-Sleep -Milliseconds 500
Call "POST" "/api/v1/hod/fees/$($fee2.id)/payments" $hod @{ amount = 50; method = "CASH" } | Out-Null
Check "fee payment -> HOD receives FEE_UPDATED live" (Wait-Event $wsHod2 "FEE_UPDATED" 5000) "no event within 5s"
if ($wsHod2) { $wsHod2.Dispose() }

$wsStu2 = Open-Stomp $stu "/user/queue/events"
Start-Sleep -Milliseconds 500
Call "POST" "/api/v1/notices" $hod @{ title = "Live Notice $(Get-Random)"; description = "Live push test"; priority = "NORMAL"; targetType = "STUDENTS" } | Out-Null
Check "HOD publishes notice -> student receives NOTICE_PUBLISHED live" (Wait-Event $wsStu2 "NOTICE_PUBLISHED" 5000) "no event within 5s"
if ($wsStu2) { $wsStu2.Dispose() }

Write-Host ""
Write-Host "Result: $($script:pass) passed, $($script:fail) failed" -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
