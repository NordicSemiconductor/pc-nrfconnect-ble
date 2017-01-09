/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
    blink(reactElement, property, fromColor, toColor, options) {
        this.ensureAnimationLoopStarted();
        options = options || {};
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

                const animationLoop = function (time) {
                    requestAnimationFrame(animationLoop);
                    TWEEN.update(time);
                };

                animationLoop();
            }
        };
    })(),
};

module.exports = { Effects };
