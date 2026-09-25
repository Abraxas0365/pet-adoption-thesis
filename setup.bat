@echo off
setlocal

echo ========================================
echo          PawMatch Setup
echo ========================================
echo.

REM ========================================
REM 1. Root dependencies
REM ========================================

echo [1/4] Installing root dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install root dependencies.
    pause
    exit /b 1
)

REM ========================================
REM 2. Next.js Frontend
REM ========================================

echo.
echo [2/4] Setting up Next.js frontend...

cd nextjs-frontend

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Next.js dependencies.
    cd ..
    pause
    exit /b 1
)

if not exist ".env.local" (
    copy ".env.example" ".env.local"
)

cd ..

REM ========================================
REM 3. Laravel Backend
REM ========================================

echo.
echo [3/4] Setting up Laravel backend...

cd api-backend

call composer install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Laravel dependencies.
    cd ..
    pause
    exit /b 1
)

if not exist ".env" (
    copy ".env.example" ".env"
)

call php artisan key:generate

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to generate Laravel application key.
    cd ..
    pause
    exit /b 1
)

cd ..

REM ========================================
REM 4. FastAPI Microservice
REM ========================================

echo.
echo [4/4] Setting up FastAPI microservice...

cd microservice

if not exist ".venv" (
    python -m venv .venv
)

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create Python virtual environment.
    cd ..
    pause
    exit /b 1
)

".venv\Scripts\python.exe" -m pip install --upgrade pip
".venv\Scripts\python.exe" -m pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Python dependencies.
    cd ..
    pause
    exit /b 1
)

if not exist ".env" (
    copy ".env.example" ".env"
)

cd ..

REM ========================================
REM Complete
REM ========================================

echo.
echo ========================================
echo        PawMatch Setup Complete!
echo ========================================
echo.
echo You can now start all services with:
echo.
echo     npm run dev
echo.
echo Service URLs:
echo     Next.js  - http://localhost:3000
echo     Laravel  - http://localhost:8000
echo     FastAPI  - http://localhost:8001
echo.

pause