@echo off
echo ========================================
echo    Shoe AR Development Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Python found: 
python --version

echo.
echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Change to the correct directory
cd /d "%~dp0"

REM Start the Python HTTP server
python -m http.server 8000

echo.
echo Server stopped.
pause
