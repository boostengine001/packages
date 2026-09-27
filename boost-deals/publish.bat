@echo off
cd /d "%~dp0"
for /f "delims=" %%i in ('node -p "require('./package.json').name + ' v' + require('./package.json').version"') do set PKG=%%i
echo ==============================================
echo Building and Publishing %PKG%
echo ==============================================

REM Bump patch version first — npm forbids publishing an already-published
REM version, and re-publishing the same number is the most common failure here.
call npm version patch --no-git-tag-version
if %errorlevel% neq 0 (
  echo Version bump failed! Exiting...
  exit /b %errorlevel%
)

call npm run build
if %errorlevel% neq 0 (
  echo Build failed! Exiting...
  exit /b %errorlevel%
)

call npm test
if %errorlevel% neq 0 (
  echo Tests failed! Exiting...
  exit /b %errorlevel%
)

echo Publishing %PKG% to npm...
call npm publish --access public
if %errorlevel% neq 0 (
  echo Publish failed! Exiting...
  exit /b %errorlevel%
)
echo Finished! %PKG%
