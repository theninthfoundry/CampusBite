#!/usr/bin/env bash
# CampusBite 50-Commit Minimization Launcher for Git Bash / WSL
echo "Starting 50-Commit Code Minimization Engine..."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w "$PWD/refactor_and_commit.ps1" 2>/dev/null || echo "./refactor_and_commit.ps1")"
