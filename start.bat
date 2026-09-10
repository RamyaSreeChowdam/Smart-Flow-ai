@echo off
echo =============================================
echo   SmartFlow AI - Starting Application
echo =============================================
echo.
echo [1/2] Starting Backend (Node.js + Express + MongoDB Atlas)...
start "SmartFlow Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo Waiting for backend...
timeout /t 4 /nobreak > nul

echo [2/2] Starting Frontend (React + Vite)...
start "SmartFlow Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =============================================
echo   SmartFlow AI is starting!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api/health
echo.
echo   Demo Login:
echo   Email:    demo@smartflow.ai
echo   Password: demo1234
echo =============================================
pause
