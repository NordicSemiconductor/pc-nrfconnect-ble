'use strict';

export const BLUE = 'blue';
export const SOFT_BLUE = 'soft_blue';
export const WHITE = 'white';

const colors = {
    blue: {r: 179, g: 225, b: 245},
    soft_blue: {r: 215, g:235, b: 244},
    white: {r: 255, g: 255, b: 255},
};

export function getColor(color) {
    const colorObject = colors[color];
    if (!colorObject) {
        return;
    }

    return Object.assign({}, colorObject);
}
