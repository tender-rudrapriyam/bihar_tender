@echo off
REM Bihar Tender Monitor - Git Push Script
REM Pushes to: https://github.com/tender-rudrapriyam/bihar_tender.git

echo ========================================
echo Pushing to GitHub Repository
echo Repository: https://github.com/tender-rudrapriyam/bihar_tender.git
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if git is initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    git remote add origin https://github.com/tender-rudrapriyam/bihar_tender.git
)

REM Rename master to main if needed
git branch -M main

REM Add all files
echo [INFO] Adding files...
git add .

REM Commit
echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" (
    set commit_msg=Update Bihar Tender Monitor - %date% %time%
)
git commit -m "%commit_msg%"

REM Push to GitHub
echo.
echo [INFO] Pushing to GitHub...

REM Use GitHub token from .env if available
for /f "tokens=2 delims==" %%a in ('findstr /i "GITHUB_TOKRN" .env 2^>nul') do set GITHUB_TOKEN=%%a
if defined GITHUB_TOKEN (
    echo [INFO] Using GitHub token from .env...
    git push https://%GITHUB_TOKEN%@github.com/tender-rudrapriyam/bihar_tender.git main
) else (
    git push -u origin main
)

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo View at: https://github.com/tender-rudrapriyam/bihar_tender
    echo.
    echo Next Steps:
    echo 1. Configure GitHub Secrets for CI/CD
    echo 2. Go to: https://github.com/tender-rudrapriyam/bihar_tender/settings/secrets/actions
    echo 3. Add required secrets (see GITHUB_SETUP.md)
    echo.
) else (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo You may need to:
    echo 1. Set up Git credentials
    echo 2. Configure Git user:
    echo    git config --global user.name "Your Name"
    echo    git config --global user.email "your.email@example.com"
    echo 3. Check repository permissions
    echo 4. Pull latest changes: git pull origin main --rebase
    echo.
)

pause
