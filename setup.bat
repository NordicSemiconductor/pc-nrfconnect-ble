call npm install -g npm
call npm install -g bower
call npm install -g node-gyp
call npm install -g electron-packager
call npm install -g flatten-packages
call npm install -g less

call bower install

set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

set npm_config_runtime=electron
set npm_config_target=0.30.3
set npm_config_arch=ia32

call npm install --production

call flatten-packages

call lessc ./css/styles.less ./css/styles.css

call electron-packager ./ yggdrasil --platform=win32 --arch=ia32 --version=0.30.3 --out=../deploy --icon=Nordic_N_HI.ico --app-version=0.0.1 --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright = "LegalCopyright" --version-string.FileDescription = "FileDescription" --version-string.OriginalFilename = "OriginalFilename" --version-string.FileVersion = "FileVersion" --version-string.ProductVersion = "ProductVersion" --version-string.ProductName = "ProductName" --version-string.InternalName = "InternalName"

cp yggdrasil_installer.nsi ../deploy/
cp Nordic_N_HI.ico ../deploy/

cd ../deploy/

call "c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi

echo Need to change password and copy in nrfgo-studio_codesigningcertificate in manually
signtool.exe sign /v /ac MSCV-VSClass3.cer /f nrfgo-studio_codesigningcertificate.pfx /p PASSWORD /n %22Nordic Semiconductor ASA%22 /t $(timestampserver) /d %22Yggdrasil - 0.0.1 beta%22 ./yggdrasil-win32-ia32/yggdrasil.exe

call "c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi

echo Need to change password and copy in nrfgo-studio_codesigningcertificate in manually
signtool.exe sign /v /ac MSCV-VSClass3.cer /f nrfgo-studio_codesigningcertificate.pfx /p PASSWORD /n %22Nordic Semiconductor ASA%22 /t $(timestampserver) /d %22Yggdrasil installer - 0.0.1 beta%22 yggdrasil_v0.0.1.exe