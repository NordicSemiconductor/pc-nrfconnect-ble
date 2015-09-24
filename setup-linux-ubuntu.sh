sudo npm install -g npm
sudo npm install -g node-gyp
sudo npm install -g electron-packager
sudo npm install -g flatten-packages
sudo npm install -g less

export npm_config_runtime=electron
export npm_config_target=0.30.3
export npm_config_arch=x64

export YGGDRASIL_VERSION=0.7.0
export YGGDRASIL_NAME=Yggdrasil
export DEPLOY_DIR=../yggdrasil-deploy

rm -rf node_modules

npm install --production

flatten-packages
lessc ./css/styles.less ./css/styles.css
electron-packager . $YGGDRASIL_NAME --platform=linux --arch=$npm_config_arch --version=$npm_config_target --overwrite --out=$DEPLOY_DIR --app-version=$YGGDRASIL_VERSION --version-string.CompanyName = "Nordic Semiconductor ASA" --version-string.LegalCopyright = "Nordic Semiconductor ASA" --version-string.FileDescription = "" --version-string.OriginalFilename = "" --version-string.FileVersion = "$YGGDRASIL_VERSION" --version-string.ProductVersion = "$YGGDRASIL_VERSION" --version-string.ProductName = "$YGGDRASIL_NAME" --version-string.InternalName = "$YGGDRASIL_NAME"

cp README.md $DEPLOY_DIR/yggdrasil-win32-ia32/README.txt
mkdir $DEPLOY_DIR/yggdrasil-win32-ia32/hex
cp node_modules/pc-ble-driver-js/driver/hex/connectivity_115k2_with_s130_1.0.0.hex $DEPLOY_DIR/yggdrasil-win32-ia32/hex/connectivity_115k2_with_s130_1.0.0.hex

tar czf $DEPLOY_DIR/$YGGDRASIL_NAME-$YGGDRASIL_VERSION-linux-$npm_config_arch.tar.gz $DEPLOY_DIR/$YGGDRASIL_NAME-linux-$npm_config_arch
