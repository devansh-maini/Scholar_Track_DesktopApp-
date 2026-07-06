# Live-update demo: acts as the TEACHER and changes the student's midterm marks.
# Keep the desktop app open as the STUDENT (student / student123) on the Marks or Dashboard screen and watch it update
# without refreshing, with a toast and a bell notification.
# Usage:  powershell -ExecutionPolicy Bypass -File .\scripts\demo-live-update.ps1   [-Base http://localhost:8080]
param([string]$Base = "http://localhost:8080")

function Call($method, $path, $token, $body) {
  $h = @{}; if ($token) { $h["Authorization"] = "Bearer $token" }
  $p = @{ Method = $method; Uri = "$Base/api/v1$path"; Headers = $h; UseBasicParsing = $true }
  if ($body) { $p["Body"] = ($body | ConvertTo-Json -Depth 6); $p["ContentType"] = "application/json" }
  return (Invoke-WebRequest @p).Content | ConvertFrom-Json
}
$teacher = (Call "POST" "/auth/login" $null @{ username = "teacher"; password = "teacher123" }).data.token
$student = (Call "POST" "/auth/login" $null @{ username = "student"; password = "student123" }).data.token
$me = (Call "GET" "/students/me" $student $null).data
$classId = $me.classId
$subject = (Call "GET" "/subjects?semesterNo=5" $teacher $null).data | Where-Object { $_.code -eq "CS501" }
$marks = Get-Random -Minimum 12 -Maximum 30
Call "PUT" "/teachers/me/marks" $teacher @{ classId = $classId; subjectId = $subject.id; assessmentType = "MIDTERM"; maxMarks = 30; entries = @(@{ studentId = $me.id; marks = $marks }) } | Out-Null
Write-Host "Teacher saved CS501 MIDTERM = $marks / 30 for $($me.fullName). Check the student window now." -ForegroundColor Green
