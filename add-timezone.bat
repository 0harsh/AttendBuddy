@echo off
echo Running timezone field migration...
node prisma/add-timezone-field.js
pause
