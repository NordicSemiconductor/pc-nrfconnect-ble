npm install -g npm
npm install -g node-gyp
npm install -g electron-packager
#npm install -g flatten-packages
npm install -g less

export npm_config_runtime=electron
export npm_config_runtime_version=0.30.3
export npm_config_arch=x64


npm i --ignore-scripts sqlite3
cd node_modules/sqlite3
npm run prepublish
node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/node-v44-linux-x64
node-gyp rebuild --target=0.30.3 --arch=x64 --target_platform=linux --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/node-v44-linux-x64
cd ../..
npm install
chown swdev_build: node_modules -R


#flatten-packages

lessc ./css/styles.less ./css/styles.css

electron-packager ./ yggdrasil --platform=linux --arch=x64 --version=0.30.3 --out=../deploy2 --icon=Nordic_N_HI.ico --app-version=0.0.1 --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright = "LegalCopyright" --version-string.FileDescription = "FileDescription" --version-string.OriginalFilename = "OriginalFilename" --version-string.FileVersion = "FileVersion" --version-string.ProductVersion = "ProductVersion" --version-string.ProductName = "ProductName" --version-string.InternalName = "InternalName"

cp yggdrasil_installer.nsi ../deploy/

cd ..

chown swdev_build: deploy -R

