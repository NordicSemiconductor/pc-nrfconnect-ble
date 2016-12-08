/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

// We use this file in index.js, so we can't use `import`
const exec = require('child_process').exec;
const getExecutableSuffix  = require('./platform').getExecutableSuffix;
const kill = require('tree-kill');
const os = require('os');
const pidof = require('pidof');


function killProcessWithName(name) {
    const fullName = name + getExecutableSuffix();
    // For some reason, we had to use only 15 chars in the name.. ?
    const pname = fullName.slice(0,15);
    const killedProcesses = {};
    const go = () => {
        pidof(pname, (err, pid) => {
            if (!err && pid && killedProcesses[pid] === undefined) {
                kill(pid);
                killedProcesses[pid] = true;
                // Kill processes untill all are killed :)
                console.log(`kill pid ${pid}`);
            }
        });
    }
    go();
}

function killProcessWithNameWindows(name) {
    if (os.platform() !== 'win32') {
        throw new Error('This function will only work on windows platforms.');
    } else {
        const rttLoggerCleanup = exec(`tasklist /v /fo csv | findstr /i "${name}"`);

        rttLoggerCleanup.stdout.on('data', data => {
            let csvOutputProcesses = data.split('\n');
            for (let i = 0; i < csvOutputProcesses.length; i++) {
                let processArray = csvOutputProcesses[i].split(',');
                if (processArray.length >= 2) {
                    if (processArray[0] === '"rtt-logger.exe"'); {
                        kill(parseInt(processArray[1].replace('"', '').replace('"', '')));
                    }
                }
            }
        });

        rttLoggerCleanup.stderr.on('data', data => {
            console.log('stderr: ', data);
            console.log('rtt_logger.exe processes spawned by nRF Connect may still be running after the application is closed!');
        });

        rttLoggerCleanup.on('close', code => {
            console.log('killProcessWithNameWindows exited with error code: ', code);
            if (code !== 0) {
                console.log('rtt_logger.exe processes spawned by nRF Connect may still be running after the application is closed!');
            }
        });
    }
}

exports.killProcessWithName = killProcessWithName;
exports.killProcessWithNameWindows = killProcessWithNameWindows;
