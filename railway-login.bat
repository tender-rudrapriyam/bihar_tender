@echo off
setlocal

for /f "tokens=2 delims==" %%a in ('findstr /i "RAILWAY_TOKEN" .env') do set TOKEN=%%a

if "%TOKEN%"=="" (
  echo [ERROR] RAILWAY_TOKEN not found in .env
  exit /b 1
)

set RAILWAY_TOKEN=%TOKEN%

call npx.cmd railway whoami
if errorlevel 1 (
  echo [ERROR] Railway login failed!
  exit /b 1
)