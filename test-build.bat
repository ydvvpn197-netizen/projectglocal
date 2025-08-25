@echo off
echo Testing build process...
echo.

echo Installing dependencies...
npm ci

echo.
echo Building project...
npm run build:prod

echo.
echo Build test completed!
pause
