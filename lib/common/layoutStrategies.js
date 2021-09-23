/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

function horizontal(sourceRect, targetRect, strokeWidth) {
    const sourceRectMid =
        sourceRect.top - targetRect.top + sourceRect.height / 2;
    const targetRectMid = targetRect.height / 2;

    function calculateBoundingBox() {
        const top =
            -((strokeWidth + 1) / 2) +
            (sourceRectMid < targetRectMid ? sourceRectMid : targetRectMid);
        const height =
            strokeWidth + 1 + Math.abs(sourceRectMid - targetRectMid);
        const width = targetRect.left - (sourceRect.left + sourceRect.width);

        return {
            top,
            left: -width,
            width,
            height,
        };
    }

    const connectorBox = calculateBoundingBox();
    const sourceYCoordinate =
        sourceRectMid < targetRectMid ? 2 : connectorBox.height - 2;
    const targetYCoordinate =
        sourceRectMid < targetRectMid ? connectorBox.height - 2 : 2;

    const lineCoordinates = [
        { x: 0, y: sourceYCoordinate },
        { x: connectorBox.width / 2, y: sourceYCoordinate },
        { x: connectorBox.width / 2, y: targetYCoordinate },
        { x: connectorBox.width, y: targetYCoordinate },
    ];

    return {
        boundingBox: connectorBox,
        lineCoordinates,
    };
}

function vertical(sourceRect, targetRect, strokeWidth) {
    const sourceRectYEntry = sourceRect.top - targetRect.top + 20;
    // const targetRectXEntry = targetRect.width / 2;

    function calculateBoundingBox() {
        return {
            top: -((strokeWidth + 1) / 2) + sourceRectYEntry,
            left: -(targetRect.left - (sourceRect.left + sourceRect.width)),
            width:
                (strokeWidth + 1) / 2 +
                (targetRect.left + targetRect.width / 2) -
                (sourceRect.left + sourceRect.width),
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
        boundingBox,
        lineCoordinates,
    };
}

// eslint-disable-next-line func-names
export default function (strategy) {
    if (strategy === 'vertical') {
        return vertical;
    }
    if (strategy === 'horizontal') {
        return horizontal;
    }
    // Do something funny.
    return undefined;
}
