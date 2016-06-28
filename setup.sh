#!/bin/bash

#To ensure that bash is used. Taken from https://answers.atlassian.com/questions/28625/making-a-bamboo-script-execute-using-binbash
if [ "$(ps -p "$$" -o comm=)" != "bash" ]; then
    # Taken from http://unix-linux.questionfor.info/q_unix-linux-programming_85038.html
    bash "$0" "$@"
    exit "$?"
fi

#Only uncomment these to get the newest versions
#sudo npm install -g node-gyp
#sudo npm install -g electron-packager
#sudo npm install -g less

if [ "$YGGDRASIL_VERSION" = "" ]; then
    export YGGDRASIL_VERSION=0.0.0
    export YGGDRASIL_VERSION_NAME=""
fi

export YGGDRASIL_FULL_VERSION=$YGGDRASIL_VERSION$YGGDRASIL_VERSION_NAME

export YGGDRASIL_DEPLOY_DIR=../nrfconnect-deploy
export YGGDRASIL_ELECTRON_VERSION=0.36.7
export YGGDRASIL_ELECTRON_ARCH=x64
#export YGGDRASIL_ELECTRON_ARCH=ia32

export npm_config_runtime=electron
export npm_config_target=$YGGDRASIL_ELECTRON_VERSION
export npm_config_arch=$YGGDRASIL_ELECTRON_ARCH
export npm_config_disturl=https://atom.io/download/atom-shell

case "$(uname -s)" in
  Darwin)
    echo 'Detected platform is OS X'
    export YGGDRASIL_PLATFORM=darwin
    export YGGDRASIL_ICON=nrfconnect.icns
    export YGGDRASIL_NAME=nrf-connect
    export YGGDRASIL_APP_NAME="nRF Connect"
    export COMMANDLINE_TOOLS_FILE=nRF5x-Command-Line-Tools_8_5_0_OSX.tar
    export COMMANDLINE_TOOLS_EXTRACT_TARGET=
    ;;
  Linux)
    echo 'Detected platform is Linux'
    export YGGDRASIL_PLATFORM=linux
    export YGGDRASIL_ICON=nrfconnect.png
    export YGGDRASIL_NAME=nrf-connect
    export YGGDRASIL_APP_NAME=nrf-connect
    export COMMANDLINE_TOOLS_FILE=nRF5x-Command-Line-Tools_8_5_0_Linux-x86_64.tar
    export COMMANDLINE_TOOLS_EXTRACT_TARGET=nrf-connect.app/Contents/Frameworks/
    ;;
  *)
    echo 'Not able to detect platform, quitting.'
    exit -1
    ;;
esac

export YGGDRASIL_APP_DIR="$YGGDRASIL_APP_NAME-$YGGDRASIL_PLATFORM-$npm_config_arch"
export YGGDRASIL_APP_ROOT_DIR="$YGGDRASIL_DEPLOY_DIR/$YGGDRASIL_APP_DIR"

rm -rf node_modules

mv js/settings.json js/settings.json.dev
mv js/settings.json.prod js/settings.json

npm install --production

mkdir ./hex
cp node_modules/pc-ble-driver-js/pc-ble-driver/hex/*.hex ./hex/

lessc ./css/styles.less ./css/styles.css
electron-packager . "$YGGDRASIL_APP_NAME" --platform=$YGGDRASIL_PLATFORM --arch=$npm_config_arch --icon=$YGGDRASIL_ICON --version=$npm_config_target --overwrite --out=$YGGDRASIL_DEPLOY_DIR --app-version=$YGGDRASIL_VERSION --version-string.CompanyName="Nordic Semiconductor ASA" --version-string.LegalCopyright="Nordic Semiconductor ASA" --version-string.FileDescription="nRF Connect" --version-string.OriginalFilename="nrfconnect" --version-string.FileVersion="$YGGDRASIL_VERSION" --version-string.ProductVersion="$YGGDRASIL_FULL_VERSION" --version-string.ProductName="$YGGDRASIL_NAME" --version-string.InternalName="$YGGDRASIL_NAME"

cp README.md "$YGGDRASIL_APP_ROOT_DIR/README.txt"
cp LICENSE "$YGGDRASIL_APP_ROOT_DIR/LICENSE"
cp nordic_logo.png "$YGGDRASIL_APP_ROOT_DIR/nordic_logo.png"
tar xvf nrfjprog/$COMMANDLINE_TOOLS_FILE --strip=2 -C "$YGGDRASIL_APP_ROOT_DIR/$COMMANDLINE_TOOLS_EXTRACT_TARGET"

pushd .

cd "$YGGDRASIL_DEPLOY_DIR"
tar czf $YGGDRASIL_NAME-$YGGDRASIL_FULL_VERSION-$YGGDRASIL_PLATFORM-$npm_config_arch.tar.gz $YGGDRASIL_APP_DIR

popd

mv js/settings.json js/settings.json.prod
mv js/settings.json.dev js/settings.json
