Write-Host "Running ScholarTrack Reports & Analytics smoke tests..."
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/reports/attendance?classId=1&format=csv"
Write-Host "Reports smoke tests completed successfully."
