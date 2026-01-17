$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "== Bihar Tender Deploy Helper ==" -ForegroundColor Cyan

# 1) Ensure git push
Write-Host "Pushing latest changes..." -ForegroundColor Yellow
& "$root\git-push.bat"

Write-Host "" 
Write-Host "Next steps on Railway (manual UI):" -ForegroundColor Cyan
Write-Host "1) Create TWO services from this repo:" -ForegroundColor White
Write-Host "   - Backend service: root=backend, build= 'npm install && npx prisma generate', start='npm start'" -ForegroundColor White
Write-Host "   - Frontend service: root=frontend, build='npm install && npm run build', start='npm run start'" -ForegroundColor White
Write-Host "2) Add Railway Postgres and set DATABASE_URL for backend" -ForegroundColor White
Write-Host "3) Set VITE_API_BASE in frontend to backend URL" -ForegroundColor White
Write-Host "4) Add custom domain rudrapriyam.in to frontend service and update DNS" -ForegroundColor White

Write-Host "Deploy helper complete." -ForegroundColor Green
