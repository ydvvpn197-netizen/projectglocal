@echo off
echo Adding files...
git add .

echo Committing changes...
git commit -m "Fix GitHub Pages deployment - Remove duplicate addPoints method and update workflow"

echo Pushing to GitHub...
git push origin main

echo Done!
pause
