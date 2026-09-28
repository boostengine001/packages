@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo 1. Bumping patch version in package.json...
echo ==============================================
call npm version patch --no-git-tag-version
if %errorlevel% neq 0 (
  echo [ERROR] Version bump failed! Exiting...
  exit /b %errorlevel%
)

echo ==============================================
echo 2. Building package (tsup)...
echo ==============================================
call npm run build
if %errorlevel% neq 0 (
  echo [ERROR] Build failed! Exiting...
  exit /b %errorlevel%
)

echo ==============================================
echo 3. Running verification test suite...
echo ==============================================
call npm test
if %errorlevel% neq 0 (
  echo [ERROR] Tests failed! Exiting...
  exit /b %errorlevel%
)

echo ==============================================
echo 4. Publishing @boostengine/communications to npm...
echo ==============================================
call npm publish --access public
if %errorlevel% neq 0 (
  echo [ERROR] Publish failed! Exiting...
  exit /b %errorlevel%
)

echo ==============================================
echo [SUCCESS] Package published to npm successfully!
echo ==============================================
endlocal

