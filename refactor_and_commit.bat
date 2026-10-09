@echo off
REM CampusBite 50-Commit Minimization Launcher
echo Starting 50-Commit Code Minimization Engine...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0refactor_and_commit.ps1"
pause
