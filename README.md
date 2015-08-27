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
set npm_config_runtime_version=0.30.3
set npm_config_arch=ia32

npm i --ignore-scripts sqlite3
cd node_modules\sqlite3
npm run prepublish
node-gyp configure --module_name=node_sqlite3 --module_path=..\lib\binding\node-v44-win32-ia32
node-gyp rebuild --target=0.30.3 --arch=ia32 --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=..\lib\binding\node-v44-win32-ia32
cd ..\..
npm install
```

## OS X specific procedure
For OS X:

Let CMake know where the ble driver is:
```
export PC_BLE_DRIVER_DIR=/Users/torleifs/customers/nordic/build/release/
```

Handle sqlite build issues:

Use 'export' instead of 'set', i.e:
```
export npm_config_runtime=electron
export npm_config_runtime_version=0.30.3
export npm_config_arch=x64
```
http://verysimple.com/2015/05/30/using-node_sqlite3-with-electron/
https://github.com/mapbox/node-sqlite3/issues/357

# Run the Yggdrasil application
```
gulp run
```
