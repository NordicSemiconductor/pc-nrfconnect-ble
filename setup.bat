call npm install -g npm
call npm install -g bower
call npm install -g node-gyp
call npm install -g electron-packager
call npm install -g flatten-packages
call npm install -g less

call bower install

set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

set npm_config_runtime=electron
set npm_config_runtime_version=0.30.3
set npm_config_arch=ia32

call npm i --ignore-scripts sqlite3
cd node_modules\sqlite3
call npm run prepublish
call node-gyp configure --module_name=node_sqlite3 --module_path=..\lib\binding\node-v44-win32-ia32
call node-gyp rebuild --target=0.30.3 --arch=ia32 --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=..\lib\binding\node-v44-win32-ia32
cd ..\..
call npm install --production

call flatten-packages

call lessc ./css/styles.less ./css/styles.css

call electron-packager ./ yggdrasil --platform=win32 --arch=ia32 --version=0.30.3 --out=../deploy --icon=Nordic_N_HI.ico --app-version=0.0.1 --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright = "LegalCopyright" --version-string.FileDescription = "FileDescription" --version-string.OriginalFilename = "OriginalFilename" --version-string.FileVersion = "FileVersion" --version-string.ProductVersion = "ProductVersion" --version-string.ProductName = "ProductName" --version-string.InternalName = "InternalName"

cp yggdrasil_installer.nsi ../deploy/

cd ../deploy/

call "c:\Program Files (x86)\NSIS\makensis.exe" yggdrasil_installer.nsi
