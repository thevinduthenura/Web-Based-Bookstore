@echo off
:: Sarasavi Pages - Restart SQL Server Express to apply TCP/IP & Authentication settings
echo ========================================================
echo   Restarting SQL Server (SQLEXPRESS) Service...
echo ========================================================
echo.
net stop "MSSQL$SQLEXPRESS"
net start "MSSQL$SQLEXPRESS"
echo.
echo ========================================================
echo   SQL Server has been restarted successfully!
echo   TCP/IP (Port 1433) and Mixed Mode are now active.
echo ========================================================
pause
