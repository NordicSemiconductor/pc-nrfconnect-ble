REM call npm install -g npm
REM If you screw up your npm veresion (which may happen with 3.X series on Windows)
REM follow these instructions https://www.npmjs.com/package/npm-windows-upgrade)
call npm install -g node-gyp
call npm install -g electron-packager
call npm install -g flatten-packages
call npm install -g less

set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

set npm_config_runtime=electron
set npm_config_target=0.30.3
set npm_config_arch=ia32

set YGGDRASIL_VERSION=0.7.0
set YGGDRASIL_DEPLOY_DIR=..\deploy

call npm install --production

call flatten-packages

call lessc ./css/styles.less ./css/styles.css

call electron-packager ./ yggdrasil --platform=win32 --arch=ia32 --version=0.30.3 --overwrite --out=%YGGDRASIL_DEPLOY_DIR% --icon=nordic_logo.ico --app-version=%YGGDRASIL_VERSION% --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright = "Nordic Semiconductor" --version-string.FileDescription = "FileDescription" --version-string.OriginalFilename = "OriginalFilename" --version-string.FileVersion = "0.7.0" --version-string.ProductVersion = "0.7.0" --version-string.ProductName = "Yggdrasil" --version-string.InternalName = "Yggdrasil"

copy yggdrasil_installer.nsi %YGGDRASIL_DEPLOY_DIR%
copy nordic_logo.ico %YGGDRASIL_DEPLOY_DIR%
copy node_modules\pc-ble-driver-js\driver\lib\s130_nrf51_ble_driver.dll %YGGDRASIL_DEPLOY_DIR%\yggdrasil-win32-ia32

cd ..\deploy

"c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi

echo "Need to change password and copy in nrfgo-studio_codesigningcertificate in manually"
signtool.exe sign /v /ac MSCV-VSClass3.cer /f nrfgo-studio_codesigningcertificate.pfx /p PASSWORD /n %22Nordic Semiconductor ASA%22 /t $(timestampserver) /d %22Yggdrasil - 0.7.0 beta%22 ./yggdrasil-win32-ia32/yggdrasil.exe

"c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi

echo "Need to change password and copy in nrfgo-studio_codesigningcertificate in manually"
signtool.exe sign /v /ac MSCV-VSClass3.cer /f nrfgo-studio_codesigningcertificate.pfx /p PASSWORD /n %22Nordic Semiconductor ASA%22 /t $(timestampserver) /d %22Yggdrasil installer - 0.7.0 beta%22 yggdrasil_v0.7.0.exe