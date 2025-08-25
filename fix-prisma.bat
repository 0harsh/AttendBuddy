@echo off
echo Fixing Prisma Client Generation...
echo.

echo Step 1: Setting PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo.

echo Step 2: Regenerating Prisma client...
npx prisma generate
echo.

echo Step 3: Pushing database schema...
npx prisma db push
echo.

echo Done! Prisma client should now recognize the timezone field.
pause
