@echo off
echo ==========================================
echo    VIZAG STEEL - MYSQL PASSWORD RESET
echo ==========================================
echo.

echo 1. Stopping MySQL Service...
net stop mysql80 >nul 2>&1
net stop mysql >nul 2>&1

echo 2. Creating password reset file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123'; > "%temp%\mysql-reset.txt"

echo 3. Applying new password (root123)...
start "" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file="%temp%\mysql-reset.txt"
timeout /t 10 /nobreak >nul

echo 4. Cleaning up...
taskkill /F /IM mysqld.exe >nul 2>&1
del "%temp%\mysql-reset.txt" >nul 2>&1

echo 5. Starting MySQL Service...
net start mysql80 >nul 2>&1
if errorlevel 1 net start mysql >nul 2>&1

echo.
echo ==========================================
echo ✅ DONE! YOUR NEW PASSWORD IS: root123
echo ==========================================
pause
