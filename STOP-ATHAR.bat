@echo off
setlocal EnableDelayedExpansion
title Stop ATHAR
cd /d "%~dp0"

set "PORT=5180"

echo ==================================================
echo   Stopping ATHAR (port %PORT%)
echo ==================================================
echo.

rem Only the process listening on THIS project's port is touched.
rem There is no blanket taskkill on node.exe, so other projects keep running.
set "FOUNDPID="
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr /c:":%PORT% "') do (
  if not defined FOUNDPID set "FOUNDPID=%%p"
)

if not defined FOUNDPID (
  echo ATHAR is not running on port %PORT%. Nothing to stop.
  goto :end
)

echo Stopping PID !FOUNDPID! and its child processes...
taskkill /PID !FOUNDPID! /T /F
if exist "logs\athar.pid" del "logs\athar.pid"
echo.
echo Stopped. Other projects were not touched.

:end
echo.
timeout /t 6 >nul
