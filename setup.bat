REM call npm install -g npm
REM If you screw up your npm veresion (which may happen with 3.X series on Windows)
REM follow these instructions https://www.npmjs.com/package/npm-windows-upgrade)
call npm install -g node-gyp
call npm install -g electron-packager
call npm install -g flatten-packages
call npm install -g less

set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

set npm_config_runtime=electron
set npm_config_target=0.33.7
set npm_config_arch=ia32
set npm_config_disturl=https://atom.io/download/atom-shell

set YGGDRASIL_VERSION=0.7.0
set YGGDRASIL_DEPLOY_DIR=..\deploy

call npm install --production

call flatten-packages

call lessc ./css/styles.less ./css/styles.css

call electron-packager ./ yggdrasil --platform=win32 --arch=ia32 --version=0.30.3 --overwrite --out=%YGGDRASIL_DEPLOY_DIR% --icon=nordic_logo.ico --app-version=%YGGDRASIL_VERSION% --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright = "Nordic Semiconductor" --version-string.FileDescription = "FileDescription" --version-string.OriginalFilename = "OriginalFilename" --version-string.FileVersion = "0.7.0" --version-string.ProductVersion = "0.7.0" --version-string.ProductName = "Yggdrasil" --version-string.InternalName = "Yggdrasil"

copy yggdrasil_installer.nsi %YGGDRASIL_DEPLOY_DIR%
copy nordic_logo.ico %YGGDRASIL_DEPLOY_DIR%
copy node_modules\pc-ble-driver-js\driver\lib\s130_nrf51_ble_driver.dll %YGGDRASIL_DEPLOY_DIR%\yggdrasil-win32-ia32
copy README.md %YGGDRASIL_DEPLOY_DIR%\yggdrasil-win32-ia32\README.txt
copy LICENSE %YGGDRASIL_DEPLOY_DIR%\yggdrasil-win32-ia32\LICENSE
mkdir %YGGDRASIL_DEPLOY_DIR%\yggdrasil-win32-ia32\hex
copy node_modules\pc-ble-driver-js\driver\hex\connectivity_115k2_with_s130_1.0.0.hex %YGGDRASIL_DEPLOY_DIR%\yggdrasil-win32-ia32\hex\connectivity_115k2_with_s130_1.0.0.hex

cd ..\deploy

echo "Need to set SIGNTOOL_PATH and SIGNTOOL_PASSWORD environment variables for the next command to work"
%SIGNTOOL_PATH%\signtool.exe sign /v /ac %SIGNTOOL_PATH%\MSCV-VSClass3.cer /f %SIGNTOOL_PATH%\nordic_code_signing_certificate.pfx /p %SIGNTOOL_PASSWORD% /n "Nordic Semiconductor ASA" /t http://timestamp.verisign.com/scripts/timstamp.dll /d "Yggdrasil - 0.7.0" ./yggdrasil-win32-ia32/yggdrasil.exe

"c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi

echo "Need to set SIGNTOOL_PATH and SIGNTOOL_PASSWORD environment variables for the next command to work"
%SIGNTOOL_PATH%\signtool.exe sign /v /ac %SIGNTOOL_PATH%\MSCV-VSClass3.cer /f %SIGNTOOL_PATH%\nordic_code_signing_certificate.pfx /p %SIGNTOOL_PASSWORD% /n "Nordic Semiconductor ASA" /t http://timestamp.verisign.com/scripts/timstamp.dll /d "Yggdrasil installer - 0.7.0" yggdrasil-v0.7.0.exe
