sudo npm install -g npm
sudo npm install -g node-gyp
sudo npm install -g electron-packager
sudo npm install -g flatten-packages
sudo npm install -g less

export npm_config_runtime=electron
export npm_config_target=0.30.3
export npm_config_arch=x64

export YGGDRASIL_VERSION=0.7.0
export DEPLOY_DIR=../yggdrasil-deploy

case "$(uname -s)" in
  Darwin)
    echo 'Detected platform is OS X'
    export YGGDRASIL_PLATFORM=darwin
    export YGGDRASIL_ICON=nordic_logo.icns
    export YGGDRASIL_NAME=Yggdrasil
    ;;
  Linux)
    echo 'Detected platform is Linux'
    export YGGDRASIL_PLATFORM=linux
    export YGGDRASIL_ICON=nordic_logo.png
    export YGGDRASIL_NAME=yggdrasil
    ;;
  *)
    echo 'Not able to detect platform, quitting.'
    exit -1
    ;;
esac

export YGGDRASIL_APP_DIR=$YGGDRASIL_NAME-$YGGDRASIL_PLATFORM-$npm_config_arch
export YGGDRASIL_APP_ROOT_DIR=$DEPLOY_DIR/$YGGDRASIL_APP_DIR

rm -rf node_modules

npm install --production

flatten-packages
lessc ./css/styles.less ./css/styles.css
electron-packager . $YGGDRASIL_NAME --platform=$YGGDRASIL_PLATFORM --arch=$npm_config_arch --icon=$YGGDRASIL_ICON --version=$npm_config_target --overwrite --out=$DEPLOY_DIR --app-version=$YGGDRASIL_VERSION --version-string.CompanyName = "Nordic Semiconductor ASA" --version-string.LegalCopyright = "Nordic Semiconductor ASA" --version-string.FileDescription = "" --version-string.OriginalFilename = "" --version-string.FileVersion = "$YGGDRASIL_VERSION" --version-string.ProductVersion = "$YGGDRASIL_VERSION" --version-string.ProductName = "$YGGDRASIL_NAME" --version-string.InternalName = "$YGGDRASIL_NAME"

cp README.md $YGGDRASIL_APP_ROOT_DIR/README.txt
cp LICENSE $YGGDRASIL_APP_ROOT_DIR/LICENSE
mkdir $YGGDRASIL_APP_ROOT_DIR/hex
cp node_modules/pc-ble-driver-js/driver/hex/connectivity_115k2_with_s130_1.0.0.hex $YGGDRASIL_APP_ROOT_DIR/hex/connectivity_115k2_with_s130_1.0.0.hex

if [ "$YGGDRASIL_PLATFORM" == "linux" ]; then
  cp node_modules/pc-ble-driver-js/driver/lib/libs130_nrf51_ble_driver.so $YGGDRASIL_APP_ROOT_DIR
fi

cd $DEPLOY_DIR
tar czf $YGGDRASIL_NAME-$YGGDRASIL_VERSION-$YGGDRASIL_PLATFORM-$npm_config_arch.tar.gz $YGGDRASIL_APP_DIR
