@echo off
setlocal EnableDelayedExpansion
title ATHAR - launcher
cd /d "%~dp0"

set "PORT=5180"
set "URL=http://localhost:%PORT%"
set "LOG=logs\athar-dev.log"

echo ==================================================
echo   ATHAR
echo   Port: %PORT%
echo ==================================================
echo.

if not exist "logs" mkdir "logs"

rem ---- already up? then just open the browser ----
call :findpid
if defined FOUNDPID (
  echo Already running as PID !FOUNDPID! - opening the browser.
  start "" "%URL%"
  goto :done
)

rem ---- dependencies: first run only, never on every start ----
if not exist "node_modules" (
  echo First run: installing dependencies. This takes a few minutes...
  echo ---- npm install %DATE% %TIME% ---->> "%LOG%"
  call npm install >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo.
    echo npm install FAILED. Open this file to see why:
    echo   %CD%\%LOG%
    echo.
    pause
    exit /b 1
  )
)

echo Starting the server...
echo Log file: %CD%\%LOG%
echo.>> "%LOG%"
echo ==== start %DATE% %TIME% ====>> "%LOG%"
start "ATHAR server" /min cmd /c "npm run dev >> logs\athar-dev.log 2>&1"

rem ---- wait for the port to answer ----
echo Waiting for it to come up...
set /a tries=0
:wait
ping -n 3 127.0.0.1 >nul
call :findpid
if defined FOUNDPID goto ready
set /a tries+=1
if !tries! lss 60 goto wait

echo.
echo The server did not come up in time.
echo Open this file to see why:
echo   %CD%\%LOG%
echo.
pause
exit /b 1

:ready
echo Ready. Server PID is !FOUNDPID!.
>"logs\athar.pid" echo !FOUNDPID!
start "" "%URL%"
goto :done

rem ---- which process owns our port? that one, and only that one ----
:findpid
set "FOUNDPID="
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr /c:":%PORT% "') do (
  if not defined FOUNDPID set "FOUNDPID=%%p"
)
exit /b

:done
echo.
echo ATHAR is running at %URL%
echo You can close this window - the server keeps running.
echo To stop it later, double-click STOP-ATHAR.bat
echo.
timeout /t 8 >nul
