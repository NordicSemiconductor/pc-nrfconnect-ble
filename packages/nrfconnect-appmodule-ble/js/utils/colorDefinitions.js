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
