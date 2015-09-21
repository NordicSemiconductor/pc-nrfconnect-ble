# Installation procedure

Install NodeJS and Python 2.7 and run the following commands:

```
npm install -g npm
npm install -g bower
npm install -g node-gyp
bower install
```

## WIN32 specific procedure
Setup environment variable VCTargetsPath to:

```
set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V120

-- or --

Start VS2013 x86 Native Tools Command Prompt
```

Run the following commands:
```
set npm_config_runtime=electron
set npm_config_target=0.30.3
set npm_config_arch=ia32

npm install
```

## Linux specific procedure
For Linux:

Install node and npm:
```
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
sudo apt-get install nodejs
```

Let CMake know where the ble driver is:
```
export PC_BLE_DRIVER_DIR=(path to pc-ble-driver release folder, or pc-ble-driver-js root folder)
```

Let the pc-ble-driver know that we are using electron and which version and architecture:
```
export npm_config_runtime=electron
export npm_config_target=0.30.3
export npm_config_arch=x64
```

npm install

## OS X specific procedure
For OS X:

Let CMake know where the ble driver is:
```
export PC_BLE_DRIVER_DIR=(path to pc-ble-driver release folder, or pc-ble-driver-js root folder)
```

Let the pc-ble-driver know that we are using electron and which version and architecture:
```
export npm_config_runtime=electron
export npm_config_target=0.30.3
export npm_config_arch=x64
```

npm install

# Run the Yggdrasil application
```
gulp run
```

# Build packager
```
npm install electron-packager -g
electron-packager ./ yggdrasil --platform=win32 --arch=ia32 --version=0.30.3 --out=../pc-yggdrasil-deploy
```
Current issues:
* style.less: Need to prefix all includes with resources/app/
* compileAnInsertLess.js: Need to prefix css with resources/app/
* need to copy driver dll file to build/Release folder.
