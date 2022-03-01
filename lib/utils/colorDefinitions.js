/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import { logger } from 'pc-nrfconnect-shared';

import '../../resources/css/colordefinitions.scss';

const CSS_CLASS_PREFIX = 'colordefinition';
const FALLBACK_COLOR = { r: 255, g: 0, b: 0 };

function initColors(rules) {
    const colors = {};
    rules.forEach(rule => {
        const regex = new RegExp(`.${CSS_CLASS_PREFIX}-(.*)`);
        const key = regex.exec(rule.selectorText)[1];
        colors[key] = rule.style.color;
    });
    return colors;
}

function findColorDefinitionRules() {
    const rules = [];
    for (let i = 0; i < document.styleSheets.length; i += 1) {
        const { cssRules } = document.styleSheets[i];
        for (let j = 0; j < cssRules.length; j += 1) {
            const rule = cssRules[j];
            if (
                rule.selectorText &&
                rule.selectorText.indexOf(CSS_CLASS_PREFIX) !== -1
            ) {
                rules.push(rule);
            }
        }
    }
    return rules;
}

const colors = initColors(findColorDefinitionRules());

export default {
    getColor(color) {
        const rgbString = colors[color];
        if (!rgbString) {
            logger.debug(`Color ${color} is not defined`);
            return FALLBACK_COLOR;
        }
        const rgbArray = rgbString.replace(/[^\d,]/g, '').split(',');
        return {
            r: rgbArray[0],
            g: rgbArray[1],
            b: rgbArray[2],
        };
    },
};
