sudo npm install -g node-gyp
sudo npm install -g electron-packager
sudo npm install -g less

export YGGDRASIL_VERSION=0.8.0
export YGGDRASIL_DEPLOY_DIR=../yggdrasil-deploy
export YGGDRASIL_ELECTRON_VERSION=0.35.4
export YGGDRASIL_ELECTRON_ARCH=x64

export npm_config_runtime=electron
export npm_config_target=$YGGDRASIL_ELECTRON_VERSION
export npm_config_arch=$YGGDRASIL_ELECTRON_ARCH
export npm_config_disturl=https://atom.io/download/atom-shell

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
export YGGDRASIL_APP_ROOT_DIR=$YGGDRASIL_DEPLOY_DIR/$YGGDRASIL_APP_DIR

rm -rf node_modules

mv js/settings.json js/settings.json.dev
mv js/settings.json.prod js/settings.json

npm install --production

lessc ./css/styles.less ./css/styles.css
electron-packager . $YGGDRASIL_NAME --platform=$YGGDRASIL_PLATFORM --arch=$npm_config_arch --icon=$YGGDRASIL_ICON --version=$npm_config_target --overwrite --out=$YGGDRASIL_DEPLOY_DIR --app-version=$YGGDRASIL_VERSION --version-string.CompanyName="Nordic Semiconductor ASA" --version-string.LegalCopyright="Nordic Semiconductor ASA" --version-string.FileDescription="" --version-string.OriginalFilename="" --version-string.FileVersion="$YGGDRASIL_VERSION" --version-string.ProductVersion="$YGGDRASIL_VERSION" --version-string.ProductName="$YGGDRASIL_NAME" --version-string.InternalName="$YGGDRASIL_NAME"

cp README.md $YGGDRASIL_APP_ROOT_DIR/README.txt
cp LICENSE $YGGDRASIL_APP_ROOT_DIR/LICENSE
mkdir $YGGDRASIL_APP_ROOT_DIR/hex
cp node_modules/pc-ble-driver-js/driver/hex/connectivity_115k2_with_s130_1.0.0.hex $YGGDRASIL_APP_ROOT_DIR/hex/connectivity_115k2_with_s130_1.0.0.hex

if [ "$YGGDRASIL_PLATFORM" == "linux" ]; then
  cp node_modules/pc-ble-driver-js/driver/lib/libs130_nrf51_ble_driver.so $YGGDRASIL_APP_ROOT_DIR
fi

pushd .

cd $YGGDRASIL_DEPLOY_DIR
tar czf $YGGDRASIL_NAME-$YGGDRASIL_VERSION-$YGGDRASIL_PLATFORM-$npm_config_arch.tar.gz $YGGDRASIL_APP_DIR

popd

mv js/settings.json js/settings.json.prod
mv js/settings.json.dev js/settings.json
