echo off
echo "Pushing the current directory onto the stack to easier come back to it at end of script"
pushd %CD%

echo "Removing node_modules to ensure clean build"
rmdir /s /q node_modules

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
call "C:\Program Files (x86)\Microsoft Visual Studio 12.0\VC\vcvarsall.bat" x86

echo "Setting up Visual Studio Target Path"
set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

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
set YGGDRASIL_ELECTRON_VERSION=0.36.7
set YGGDRASIL_ELECTRON_ARCH=ia32

echo "Setting up electron information"
set npm_config_runtime=electron
set npm_config_target=%YGGDRASIL_ELECTRON_VERSION%
set npm_config_arch=%YGGDRASIL_ELECTRON_ARCH%
set npm_config_disturl=https://atom.io/download/atom-shell

echo "Install production"
call npm install --production

echo "Run less"
call lessc ./css/styles.less ./css/styles.css

echo "Setting up release settings"
rename js\settings.json settings.json.dev
rename js\settings.json.prod settings.json

echo "Copy driver"
copy node_modules\pc-ble-driver-js\build\driver\Release\pc-ble-driver.dll node_modules\pc-ble-driver-js\build\Release\pc-ble-driver.dll

echo "Copy runtime redistributable files for Visual Studio"
copy "C:\Program Files (x86)\Microsoft Visual Studio 12.0\VC\redist\x86\Microsoft.VC120.CRT\*.dll" node_modules\pc-ble-driver-js\build\Release\

echo "Packaging"
call electron-packager ./ nrf-connect --platform=win32 --arch=%YGGDRASIL_ELECTRON_ARCH% --version=%YGGDRASIL_ELECTRON_VERSION% --overwrite --out=%YGGDRASIL_DEPLOY_DIR% --icon=nrfconnect.ico --app-version=%YGGDRASIL_VERSION% --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright="Nordic Semiconductor" --version-string.FileDescription="nRF Connect" --version-string.OriginalFilename="nrf-connect.exe" --version-string.FileVersion=%YGGDRASIL_VERSION% --version-string.ProductVersion=%YGGDRASIL_FULL_VERSION% --version-string.ProductName="nRF Connect" --version-string.InternalName="nRF Connect" --asar

copy yggdrasil_installer.nsi %YGGDRASIL_DEPLOY_DIR%
copy nrfconnect.ico %YGGDRASIL_DEPLOY_DIR%
copy README.md %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\README.txt
copy LICENSE %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\LICENSE
mkdir %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\hex
copy node_modules\pc-ble-driver-js\driver\hex\connectivity_115k2_with_s13*_2.0.1.hex %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\hex\
copy node_modules\pc-ble-driver-js\build\driver\Release\pc-ble-driver.dll %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\

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

rename js\settings.json settings.json.prod
rename js\settings.json.dev settings.json

echo "Finished"
