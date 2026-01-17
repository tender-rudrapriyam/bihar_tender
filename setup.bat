@echo off
echo ========================================
echo Bihar Tender Monitor - Windows Setup
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Please install npm first.
    pause
    exit /b 1
)

echo [OK] npm version:
npm --version
echo.

:: Create .env
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please edit .env file with your configuration
) else (
    echo [OK] .env file exists
)
echo.

:: Install backend
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed
echo.

:: Generate Prisma
echo Generating Prisma client...
call npx prisma generate
echo.

:: Ask about migrations
echo Database setup...
echo Make sure PostgreSQL is running and DATABASE_URL is set in .env
set /p migrate="Run database migrations now? (y/n): "
if /i "%migrate%"=="y" (
    call npx prisma migrate dev --name init
    if %errorlevel% equ 0 (
        echo [OK] Migrations completed
    ) else (
        echo [WARNING] Migrations failed. Run later with: npx prisma migrate dev
    )
)

cd ..

:: Install scraper
echo.
echo Installing scraper dependencies...
cd scraper
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install scraper dependencies
    pause
    exit /b 1
)

echo [OK] Scraper dependencies installed
cd ..

:: Create directories
echo.
echo Creating log directories...
if not exist backend\logs mkdir backend\logs
if not exist scraper\logs mkdir scraper\logs
if not exist scraper\downloads mkdir scraper\downloads
echo [OK] Log directories created

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Make sure PostgreSQL is running
echo 3. Run backend: cd backend ^&^& npm run dev
echo 4. Run scraper: cd scraper ^&^& npm start
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
pause
