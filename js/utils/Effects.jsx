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
        var options = options || {};
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

    ensureAnimationLoopStarted: (function() {
        //closure trickery to make it impossible to start animationLoop twice
        var animationLoopStarted = false;
        return function() {
            if (!animationLoopStarted) {
                animationLoopStarted = true;

                function animationLoop(time) {
                    requestAnimationFrame(animationLoop);
                    TWEEN.update(time);
                }

                animationLoop();
            }
        };
    })(),
};

module.exports = {Effects};
