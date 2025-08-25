@echo off
echo 🧹 Starting database cleanup...
echo.
node prisma/cleanup.js
echo.
echo ✅ Cleanup completed! Press any key to exit...
pause >nul
