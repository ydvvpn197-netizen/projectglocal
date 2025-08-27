@echo off
title ProjectGlocal - Development Launcher
color 0A

echo.
echo ========================================
echo    ProjectGlocal Development Launcher
echo ========================================
echo.

:menu
echo Choose an option:
echo.
echo 1. Start Development Server
echo 2. Open Project in Cursor
echo 3. Install Dependencies
echo 4. Build for Production
echo 5. Run Tests
echo 6. Open Supabase Dashboard
echo 7. Deploy to GitHub Pages
echo 8. Open Mobile App (React Native)
echo 9. Exit
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto dev-server
if "%choice%"=="2" goto open-cursor
if "%choice%"=="3" goto install-deps
if "%choice%"=="4" goto build-prod
if "%choice%"=="5" goto run-tests
if "%choice%"=="6" goto supabase-dashboard
if "%choice%"=="7" goto deploy
if "%choice%"=="8" goto mobile-app
if "%choice%"=="9" goto exit
goto invalid

:dev-server
echo.
echo Starting development server...
echo.
npm run dev
goto menu

:open-cursor
echo.
echo Opening project in Cursor...
echo.
cursor .
goto menu

:install-deps
echo.
echo Installing dependencies...
echo.
npm install
echo.
echo Dependencies installed successfully!
pause
goto menu

:build-prod
echo.
echo Building for production...
echo.
npm run build
echo.
echo Build completed!
pause
goto menu

:run-tests
echo.
echo Running tests...
echo.
npm test
echo.
echo Tests completed!
pause
goto menu

:supabase-dashboard
echo.
echo Opening Supabase Dashboard...
echo.
start https://supabase.com/dashboard
goto menu

:deploy
echo.
echo Deploying to GitHub Pages...
echo.
call deploy.ps1
echo.
echo Deployment completed!
pause
goto menu

:mobile-app
echo.
echo Opening mobile app directory...
echo.
cd mobile
echo.
echo Mobile app directory opened.
echo To start the mobile app, run: npm start
echo.
pause
cd ..
goto menu

:invalid
echo.
echo Invalid choice. Please try again.
echo.
pause
goto menu

:exit
echo.
echo Thank you for using ProjectGlocal Development Launcher!
echo.
pause
exit
