@echo off
echo =========================================
echo    VIZAG STEEL - START MYSQL SERVICE
echo =========================================
echo.

echo Searching for your exact MySQL service name...
set SERVICE_NAME=
for /f "tokens=2" %%a in ('sc query state^= all ^| findstr /I "SERVICE_NAME:.*mysql"') do (
    set SERVICE_NAME=%%a
)

if "%SERVICE_NAME%"=="" (
    echo X Could not find any MySQL service!
    pause
    exit
)

echo Found MySQL service: %SERVICE_NAME%
echo Starting %SERVICE_NAME%...
net start "%SERVICE_NAME%"

echo.
echo If it says "The service was started successfully", go to VS Code and run: npm run setup-db
pause
