echo off
echo "Pushing the current directory onto the stack to easier come back to it at end of script"
pushd %CD%

echo "Node version"
call node --version

echo "NPM version"
call npm --version

echo "Installing global npm requirements"
REM call npm install -g npm
REM If you mess up your npm version (which may happen with 3.X series on Windows)
REM follow these instructions https://www.npmjs.com/package/npm-windows-upgrade)
call npm install -g node-gyp
call npm install -g electron-packager
call npm install -g less

echo "Setting up Visual Studio environment"
call "C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\vcvarsall.bat" x86

echo "Setting up Visual Studio Target Path"
set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V140

echo "Checking if version is set"
if ["%YGGDRASIL_VERSION%"] == [""] goto setVersion
echo "Version is set"
goto versionSet

:setVersion
echo "Set version"
set YGGDRASIL_VERSION=0.0.0
set YGGDRASIL_VERSION_NAME=""

:versionSet
echo "Set full versionstring"
set YGGDRASIL_FULL_VERSION=%YGGDRASIL_VERSION%%YGGDRASIL_VERSION_NAME%

echo "Setting environment variables"
set YGGDRASIL_DEPLOY_DIR=c:\tmp\yggdrasil-deploy
set YGGDRASIL_ELECTRON_VERSION=1.2.8
set YGGDRASIL_ELECTRON_ARCH=ia32

echo "Setting up electron information"
set npm_config_runtime=electron
set npm_config_target=%YGGDRASIL_ELECTRON_VERSION%
set npm_config_arch=%YGGDRASIL_ELECTRON_ARCH%
set npm_config_disturl=https://atom.io/download/atom-shell

echo "Install production"
call npm run clean
call npm install
REM The npm test process hangs from time to time on Windows. Disabling tests on
REM Windows until we have a solution. Tests are still run on Linux and OSX.
REM call npm test
call npm run prune-production

echo "Packaging"
call electron-packager packages\nrfconnect-loader nrf-connect --platform=win32 --arch=%YGGDRASIL_ELECTRON_ARCH% --version=%YGGDRASIL_ELECTRON_VERSION% --overwrite --out=%YGGDRASIL_DEPLOY_DIR% --icon=packages\nrfconnect-loader\resources\icon.ico --app-version=%YGGDRASIL_VERSION% --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright="Nordic Semiconductor" --version-string.FileDescription="nRF Connect" --version-string.OriginalFilename="nrf-connect.exe" --version-string.FileVersion=%YGGDRASIL_VERSION% --version-string.ProductVersion=%YGGDRASIL_FULL_VERSION% --version-string.ProductName="nRF Connect" --version-string.InternalName="nRF Connect" --asar

copy installer\yggdrasil_installer.nsi %YGGDRASIL_DEPLOY_DIR%
copy installer\vc_redist_2015.x86.exe %YGGDRASIL_DEPLOY_DIR%
copy packages\nrfconnect-loader\resources\icon.ico %YGGDRASIL_DEPLOY_DIR%
copy packages\nrfconnect-loader\LICENSE %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\LICENSE

cd %YGGDRASIL_DEPLOY_DIR%

echo "Sign executable"
echo "Need to set SIGNTOOL_PATH and SIGNTOOL_PASSWORD environment variables for the next command to work"
if ["%SIGNTOOL_PATH%"] == [""] goto buildInstaller
%SIGNTOOL_PATH%\signtool.exe sign /v /ac %SIGNTOOL_PATH%\MSCV-VSClass3.cer /f %SIGNTOOL_PATH%\nordic_code_signing_certificate.pfx /p %SIGNTOOL_PASSWORD% /n "Nordic Semiconductor ASA" /t http://timestamp.verisign.com/scripts/timstamp.dll /d "nRF Connect - %YGGDRASIL_VERSION%" ./nrf-connect-win32-ia32/nrf-connect.exe

:buildInstaller
echo "Build installer"
"c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi
rename nrf-connect_installer.exe nrf-connect_v%YGGDRASIL_FULL_VERSION%_installer.exe

echo "Sign installer"
echo "Need to set SIGNTOOL_PATH and SIGNTOOL_PASSWORD environment variables for the next command to work"
if ["%SIGNTOOL_PATH%"] == [""] goto cleanup
%SIGNTOOL_PATH%\signtool.exe sign /v /ac %SIGNTOOL_PATH%\MSCV-VSClass3.cer /f %SIGNTOOL_PATH%\nordic_code_signing_certificate.pfx /p %SIGNTOOL_PASSWORD% /n "Nordic Semiconductor ASA" /t http://timestamp.verisign.com/scripts/timstamp.dll /d "nRF Connect installer - %YGGDRASIL_VERSION%" nrf-connect_v%YGGDRASIL_FULL_VERSION%_installer.exe

:cleanup
popd

echo "Finished"
