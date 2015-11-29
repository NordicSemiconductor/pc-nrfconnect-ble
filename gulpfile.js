/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

var gulp = require('gulp');

var run = require('gulp-run');
var runSequence = require('run-sequence');

var path = require('path');
var fs = require('fs');

/* var lame = require('lame');
var Speaker = require('speaker'); */

var driverRootLocation = '../spike_javascript_native';
var driverLocation = driverRootLocation + '/build/Debug/ble_driver_js.node';

function swallowError(error) {
    // If you want details of the error in the console
    // To convert from wav to MP3 (with lame): lame alarm.wav alarm.mp3 -V9
    console.log(error.toString());
    this.emit('end');
}

gulp.task('copy-ble-driver', function() {
    gulp.src([driverRootLocation + '/interim/**/*']).pipe(
        gulp.dest('./node_modules')
    );

    gulp.src(driverLocation).pipe(
        gulp.dest('./node_modules/ble_driver')
    );
});

gulp.task('compile-ble-driver', function() {
    new run.Command('cmake-js -D', {cwd: path.resolve(driverRootLocation)}).exec();
});

gulp.task('prepare-ble-driver', function() {
    runSequence('copy-ble-driver',
              'compile-ble-driver', 'copy-ble-driver');
});

gulp.task('default', ['run']);

gulp.task('run', function() {
    var electronPath = fs.readFileSync('node_modules/electron-prebuilt/path.txt');
    run(electronPath + ' .', { verbosity: 3 }).exec();
});

gulp.task('watch', function() {
    //gulp.watch(['js/**/*.js', 'js/**/*.jsx'], [ 'build' ]);
    gulp.watch([driverRootLocation + '/**/*.cpp'], ['prepare-ble-driver']);
});
