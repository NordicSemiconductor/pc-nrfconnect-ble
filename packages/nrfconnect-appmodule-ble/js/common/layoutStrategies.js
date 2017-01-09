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

function horizontal(sourceRect, targetRect, strokeWidth) {
    const sourceRectMid = sourceRect.top - targetRect.top + sourceRect.height / 2;
    const targetRectMid = (targetRect.height / 2);

    function calculateBoundingBox() {
        const top = -(strokeWidth + 1) / 2 + (sourceRectMid < targetRectMid ? sourceRectMid : targetRectMid);
        const height = 2 * ((strokeWidth + 1) / 2) + Math.abs(sourceRectMid - targetRectMid);
        const width = targetRect.left - (sourceRect.left + sourceRect.width);

        return {
            top: top,
            left: -width,
            width: width,
            height: height,
        };
    }

    const connectorBox = calculateBoundingBox();
    const sourceYCoordinate = sourceRectMid < targetRectMid ? 2 : connectorBox.height - 2;
    const targetYCoordinate = sourceRectMid < targetRectMid ? connectorBox.height - 2 : 2;

    const lineCoordinates = [
        { x: 0, y: sourceYCoordinate },
        { x: connectorBox.width / 2, y: sourceYCoordinate },
        { x: connectorBox.width / 2, y: targetYCoordinate },
        { x: connectorBox.width,   y: targetYCoordinate },
    ];

    return {
        boundingBox: connectorBox,
        lineCoordinates: lineCoordinates,
    };
}

function vertical(sourceRect, targetRect, strokeWidth) {
    const sourceRectYEntry = sourceRect.top - targetRect.top + 20;
    // const targetRectXEntry = targetRect.width / 2;

    function calculateBoundingBox() {
        return {
            top: -(strokeWidth + 1) / 2 + sourceRectYEntry,
            left: -(targetRect.left - (sourceRect.left + sourceRect.width)),
            width: (strokeWidth + 1) / 2 + (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width),
            height: (strokeWidth + 1) / 2 + Math.abs(sourceRectYEntry),
        };
    }

    const boundingBox = calculateBoundingBox();
    const lineCoordinates = [
        { x: 0, y: 2 },
        { x: boundingBox.width - 2, y: 2 },
        { x: boundingBox.width - 2, y: boundingBox.height },
    ];

    return {
        boundingBox: boundingBox,
        lineCoordinates: lineCoordinates,
    };
}

export default function(strategy) {
    if (strategy === 'vertical') {
        return vertical;
    } else if (strategy === 'horizontal') {
        return horizontal;
    } else {
        // Do something funny.
        return undefined;
    }
}
