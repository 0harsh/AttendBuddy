@echo off
echo 🌱 Starting database seeding...
echo.
node prisma/seed.js
echo.
echo ✅ Seeding completed! Press any key to exit...
pause >nul
