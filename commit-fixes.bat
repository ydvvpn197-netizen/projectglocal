@echo off
echo Adding all changes...
git add .

echo.
echo Committing fixes...
git commit -m "Fix GitHub Pages deployment - Simplify Vite config and workflow"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Deployment fixes pushed successfully!
pause
