pushd %CD%

rm -rf node_modules

REM call npm install -g npm
REM If you screw up your npm veresion (which may happen with 3.X series on Windows)
REM follow these instructions https://www.npmjs.com/package/npm-windows-upgrade)
call npm install -g node-gyp
call npm install -g electron-packager
call npm install -g less

call "C:\Program Files (x86)\Microsoft Visual Studio 12.0\VC\vcvarsall.bat" x86

set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

if ["%YGGDRASIL_VERSION%"] == [""] goto setVersion
goto versionIsSet

:setVersion
set YGGDRASIL_VERSION=0.0.0

:versionIsSet
set YGGDRASIL_DEPLOY_DIR=..\deploy
set YGGDRASIL_ELECTRON_VERSION=0.36.7
set YGGDRASIL_ELECTRON_ARCH=ia32

set npm_config_runtime=electron
set npm_config_target=%YGGDRASIL_ELECTRON_VERSION%
set npm_config_arch=%YGGDRASIL_ELECTRON_ARCH%
set npm_config_disturl=https://atom.io/download/atom-shell

call npm install --production

call lessc ./css/styles.less ./css/styles.css

rename js\settings.json settings.json.dev
rename js\settings.json.prod settings.json

call electron-packager ./ nrf-connect --platform=win32 --arch=%YGGDRASIL_ELECTRON_ARCH% --version=%YGGDRASIL_ELECTRON_VERSION% --overwrite --out=%YGGDRASIL_DEPLOY_DIR% --icon=nrfconnect.ico --app-version=%YGGDRASIL_VERSION% --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright="Nordic Semiconductor" --version-string.FileDescription="nRF Connect" --version-string.OriginalFilename="nrf-connect.exe" --version-string.FileVersion=%YGGDRASIL_VERSION% --version-string.ProductVersion=%YGGDRASIL_VERSION% --version-string.ProductName="nRF Connect" --version-string.InternalName="nRF Connect"

copy yggdrasil_installer.nsi %YGGDRASIL_DEPLOY_DIR%
copy nrfconnect.ico %YGGDRASIL_DEPLOY_DIR%
copy node_modules\pc-ble-driver-js\driver\lib\s130_nrf51_ble_driver.dll %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32
copy README.md %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\README.txt
copy LICENSE %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\LICENSE
mkdir %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\hex
copy node_modules\pc-ble-driver-js\driver\hex\connectivity_115k2_with_s130_1.0.0.hex %YGGDRASIL_DEPLOY_DIR%\nrf-connect-win32-ia32\hex\connectivity_115k2_with_s130_1.0.0.hex

cd %YGGDRASIL_DEPLOY_DIR%

echo "Need to set SIGNTOOL_PATH and SIGNTOOL_PASSWORD environment variables for the next command to work"
if ["%SIGNTOOL_PATH%"] == [""] goto buildInstaller
%SIGNTOOL_PATH%\signtool.exe sign /v /ac %SIGNTOOL_PATH%\MSCV-VSClass3.cer /f %SIGNTOOL_PATH%\nordic_code_signing_certificate.pfx /p %SIGNTOOL_PASSWORD% /n "Nordic Semiconductor ASA" /t http://timestamp.verisign.com/scripts/timstamp.dll /d "nRF Connect - %YGGDRASIL_VERSION%" ./nrf-connect-win32-ia32/nrf-connect.exe

:buildInstaller
"c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi
rename nrf-connect_installer.exe nrf-connect_v%YGGDRASIL_VERSION%_installer.exe

echo "Need to set SIGNTOOL_PATH and SIGNTOOL_PASSWORD environment variables for the next command to work"
if ["%SIGNTOOL_PATH%"] == [""] goto cleanup
%SIGNTOOL_PATH%\signtool.exe sign /v /ac %SIGNTOOL_PATH%\MSCV-VSClass3.cer /f %SIGNTOOL_PATH%\nordic_code_signing_certificate.pfx /p %SIGNTOOL_PASSWORD% /n "Nordic Semiconductor ASA" /t http://timestamp.verisign.com/scripts/timstamp.dll /d "nRF Connect installer - %YGGDRASIL_VERSION%" nrf-connect_v%YGGDRASIL_VERSION%_installer.exe

:cleanup
popd

rename js\settings.json settings.json.prod
rename js\settings.json.dev settings.json
