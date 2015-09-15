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
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

var run = require('gulp-run');
var runSequence = require('run-sequence');

var path = require('path');
var fs = require('fs');

/* var lame = require('lame');
var Speaker = require('speaker'); */

var driver_root_location = '../spike_javascript_native';
var driver_location = driver_root_location + '/build/Debug/ble_driver_js.node';

function swallowError (error) {
    // If you want details of the error in the console
    // To convert from wav to MP3 (with lame): lame alarm.wav alarm.mp3 -V9
    console.log(error.toString());
    this.emit('end');
}

/* Not working
gulp.task('build', function(){
  return
    gulp.src('js//**//*.js')
    .pipe(babel())
    .on('error', swallowError)
    .pipe(gulp.dest('dist'));
});

*/

gulp.task('copy-ble-driver', function() {
    gulp.src([ driver_root_location + "/interim/**/*"]).pipe(
        gulp.dest('./node_modules')
    );

    gulp.src(driver_location).pipe(
        gulp.dest('./node_modules/ble_driver')
    );
});

gulp.task('compile-ble-driver', function() {
  new run.Command('cmake-js -D', {"cwd": path.resolve(driver_root_location)}).exec();
});

gulp.task('prepare-ble-driver', function() {
  runSequence('copy-ble-driver',
              'compile-ble-driver', 'copy-ble-driver');
});

gulp.task('default', ['run']);

gulp.task('run', function() {
  var electron_path = fs.readFileSync("node_modules/electron-prebuilt/path.txt");
  run(electron_path + " .", { verbosity: 3 }).exec();
});

gulp.task('watch', function() {
  //gulp.watch(['js/**/*.js', 'js/**/*.jsx'], [ 'build' ]);
  gulp.watch([driver_root_location + '/**/*.cpp'], ['prepare-ble-driver']);
});
