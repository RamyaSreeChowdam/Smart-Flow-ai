@echo off
echo =============================================
echo   SmartFlow AI - Seeding Demo Data
echo =============================================
echo.
cd /d %~dp0backend
node seed.js
echo.
echo Done! You can now use demo@smartflow.ai / demo1234
pause
