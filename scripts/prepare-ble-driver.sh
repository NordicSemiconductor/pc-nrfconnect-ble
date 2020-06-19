#!/usr/bin/env bash

[ ! -d .git ] && echo "Not in repo's toplevel directory" && exit -1

# version of pc-ble-driver-js:
version=$(grep -Eo '"version":.*' node_modules/pc-ble-driver-js/package.json | cut -d '"' -f 4)

release="https://github.com/NordicSemiconductor/pc-ble-driver-js/releases/download/v${version}"

runtime="electron-v5.0"

for platform in linux-x64 darwin-x64 win32-ia32 ; do
    target="${runtime}-${platform}"
    file="pc-ble-driver-js-sd_api_v5-v${version}-${target}.tar.gz"

    echo "Downloading for ${target}..."
    curl -s -L -o "${file}" "${release}/${file}"

    echo "Extracting ${file}"
    tar xzf "${file}"

    for ext in node lib exp ; do
        for sdapi in sd_api_v2 sd_api_v5 ; do
            mv Release/pc-ble-driver-js-${sdapi}.${ext} Release/pc-ble-driver-js-${sdapi}-${platform}.${ext} 2>/dev/null
        done
    done

    rm "${file}"
done

rm -rf node_modules/pc-ble-driver-js/build/Release
mv Release node_modules/pc-ble-driver-js/build/
