#!/bin/bash

#Exit immediately if something fails
set -e

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
export YGGDRASIL_ELECTRON_VERSION=1.2.8
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
    export YGGDRASIL_ICON=packages/nrfconnect-loader/resources/icon.icns
    export YGGDRASIL_NAME=nrf-connect
    export YGGDRASIL_APP_NAME=nRF\ Connect
    export COMMANDLINE_TOOLS_FILE=nRF5x-Command-Line-Tools_9_2_1_OSX.tar
    export COMMANDLINE_TOOLS_EXTRACT_TARGET="$YGGDRASIL_APP_NAME.app/Contents/Frameworks"
    ;;
  Linux)
    echo 'Detected platform is Linux'
    export YGGDRASIL_PLATFORM=linux
    export YGGDRASIL_ICON=packages/nrfconnect-loader/resources/icon.png
    export YGGDRASIL_NAME=nrf-connect
    export YGGDRASIL_APP_NAME=nrf-connect
    export COMMANDLINE_TOOLS_FILE=nRF5x-Command-Line-Tools_9_2_1_Linux-x86_64.tar
    export COMMANDLINE_TOOLS_EXTRACT_TARGET=
    ;;
  *)
    echo 'Not able to detect platform, quitting.'
    exit -1
    ;;
esac

export YGGDRASIL_APP_DIR="$YGGDRASIL_APP_NAME-$YGGDRASIL_PLATFORM-$npm_config_arch"
export YGGDRASIL_APP_ROOT_DIR="$YGGDRASIL_DEPLOY_DIR/$YGGDRASIL_APP_DIR"

npm run clean
npm install
npm test
npm run prune-production

electron-packager packages/nrfconnect-loader "$YGGDRASIL_APP_NAME" --platform=$YGGDRASIL_PLATFORM --arch=$npm_config_arch --icon=$YGGDRASIL_ICON --version=$npm_config_target --overwrite --out=$YGGDRASIL_DEPLOY_DIR --app-version=$YGGDRASIL_VERSION --version-string.CompanyName="Nordic Semiconductor ASA" --version-string.LegalCopyright="Nordic Semiconductor ASA" --version-string.FileDescription="nRF Connect" --version-string.OriginalFilename="nrfconnect" --version-string.FileVersion="$YGGDRASIL_VERSION" --version-string.ProductVersion="$YGGDRASIL_FULL_VERSION" --version-string.ProductName="$YGGDRASIL_NAME" --version-string.InternalName="$YGGDRASIL_NAME"

cp LICENSE "$YGGDRASIL_APP_ROOT_DIR/LICENSE"
tar xvf nrfjprog/$COMMANDLINE_TOOLS_FILE --strip=2 -C $YGGDRASIL_DEPLOY_DIR
mv "$YGGDRASIL_DEPLOY_DIR/lib"* "$YGGDRASIL_APP_ROOT_DIR/$COMMANDLINE_TOOLS_EXTRACT_TARGET"

pushd .

cd "$YGGDRASIL_DEPLOY_DIR"
tar czf $YGGDRASIL_NAME-$YGGDRASIL_FULL_VERSION-$YGGDRASIL_PLATFORM-$npm_config_arch.tar.gz "$YGGDRASIL_APP_DIR"

popd
