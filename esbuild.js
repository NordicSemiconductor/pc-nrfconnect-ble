/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { sassPlugin, postcssModules } = require('esbuild-sass-plugin');
const esbuild = require('esbuild');

console.time('Initial build');

esbuild
    .build({
        entryPoints: ['./src/index.tsx'],
        outfile: './dist/bundle.js',
        target: 'chrome89',
        // platform: 'node',
        sourcemap: false,
        metafile: false,
        watch: false,
        format: 'cjs',
        external: [
            // node
            'fs',
            'zlib',
            'os',
            'http',
            'child_process',
            'crypto',
            'path',
            'https',
            'net',

            // launcher includes
            'electron',
            'serialport',
            '@electron/remote',
            'react',
            '@nordicsemiconductor/nrf-device-lib-js',
            'pc-nrfconnect-shared',

            // '*css',
            // '*package.json',
        ],
        publicPath: '[appPath]',
        loader: {
            '.json': 'json',

            '.eot': 'copy',
            '.ttf': 'copy',
            '.woff': 'copy',
            '.woff2': 'copy',

            '.gif': 'dataurl',
            '.svg': 'dataurl',
            '.png': 'file',
        },
        bundle: true,
        write: true,
        plugins: [
            sassPlugin({
                filter: /\.module\.scss/,
                quietDeps: false,
                transform: postcssModules({}),
            }),
            sassPlugin({
                filter: /\.scss$/,
                quietDeps: false,
            }),
        ],
    })
    .then(result => {
        console.timeEnd('Initial build');
        // fs.writeFileSync(
        //     'meta.json',
        //     JSON.stringify(result.metafile)
        // );
    });
