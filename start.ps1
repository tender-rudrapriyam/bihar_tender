$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting backend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $root && npm run dev --prefix backend"

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $root && npm run dev --prefix frontend"

Write-Host "Done. Backend on http://localhost:5000, Frontend on http://localhost:5173" -ForegroundColor Green
