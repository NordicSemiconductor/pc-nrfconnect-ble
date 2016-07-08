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

import TWEEN from 'tween.js';

// Usage:
// if (this.animation) {
//     this.animation.stop();
// }
// var blue  = {r: 179, g: 225, b: 245};
// var white = {r: 255, g: 255, b: 255};
// this.animation = Effects.blink(this, 'backgroundColor', blue, white);

var Effects = {
    blink(reactElement, property, fromColor, toColor, opts) {
        this.ensureAnimationLoopStarted();
        var options = opts || {};
        var duration = options.duration || 2000;
        var easing = options.easing || TWEEN.Easing.Linear.None;
        return new TWEEN.Tween(fromColor)
            .to(toColor, duration)
            .easing(easing)
            .onUpdate(() => {
                reactElement[property] = fromColor;
                reactElement.forceUpdate();
            })
            .start();
    },

    ensureAnimationLoopStarted: (function () {
        //closure trickery to make it impossible to start animationLoop twice
        var animationLoopStarted = false;
        return function () {
            if (!animationLoopStarted) {
                animationLoopStarted = true;

                var animationLoop = function (time) {
                    requestAnimationFrame(animationLoop);
                    TWEEN.update(time);
                };

                animationLoop();
            }
        };
    })(),
};

module.exports = { Effects };
