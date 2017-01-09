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

import {remote} from 'electron';
import { logger } from '../logging';
import 'nrfconnect-core/css/colordefinitions.less';

const CSS_CLASS_PREFIX = 'colordefinition';
const FALLBACK_COLOR = {r: 255, g: 0, b: 0};

const colors = initColors(findColorDefinitionRules());

function initColors(rules) {
    let colors = {};
    rules.forEach(rule => {
        const regex = new RegExp(`.${CSS_CLASS_PREFIX}-(.*)`);
        let key = regex.exec(rule.selectorText)[1];
        colors[key] = rule.style['color'];
    });
    return colors;
}

function findColorDefinitionRules() {
    let rules = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
        let cssRules = document.styleSheets[i].cssRules;
        for (let j = 0; j < cssRules.length; j++) {
            let rule = cssRules[j];
            if (rule.selectorText && rule.selectorText.indexOf(CSS_CLASS_PREFIX) !== -1) {
                rules.push(rule);
            }
        }
    }
    return rules;
}

export function getColor(color) {
    const rgbString = colors[color];
    if (!rgbString) {
        logger.debug('Color ' + color + ' is not defined');
        return FALLBACK_COLOR;
    }
    const rgbArray = rgbString.replace(/[^\d,]/g, '').split(',');
    return {
        r: rgbArray[0],
        g: rgbArray[1],
        b: rgbArray[2]
    }
}
