npm install -g npm
npm install -g node-gyp
npm install -g electron-packager
#npm install -g flatten-packages
npm install -g less

export npm_config_runtime=electron
export npm_config_target=0.30.3
export npm_config_arch=x64

npm install --production
chown swdev_build: node_modules -R

#flatten-packages

lessc ./css/styles.less ./css/styles.css

electron-packager ./ yggdrasil --platform=linux --arch=x64 --version=0.30.3 --out=../deploy --icon=Nordic_N_HI.ico --app-version=0.0.1 --version-string.CompanyName="Nordic Semiconductor" --version-string.LegalCopyright = "LegalCopyright" --version-string.FileDescription = "FileDescription" --version-string.OriginalFilename = "OriginalFilename" --version-string.FileVersion = "FileVersion" --version-string.ProductVersion = "ProductVersion" --version-string.ProductName = "ProductName" --version-string.InternalName = "InternalName"

cp yggdrasil_installer.nsi ../deploy/

cd ..

chown swdev_build: deploy -R

