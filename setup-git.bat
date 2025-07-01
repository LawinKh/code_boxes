@echo off
echo Initializing Git repository for Multi-Language Code Editor...
echo.

REM Initialize git repository
git init

REM Add all files to staging
git add .

REM Create initial commit
git commit -m "Initial commit: Multi-language code editor with responsive design"

echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Go to GitHub.com and create a new private repository
echo 2. Copy the repository URL
echo 3. Run: git remote add origin [YOUR_REPOSITORY_URL]
echo 4. Run: git push -u origin main
echo.
pause
