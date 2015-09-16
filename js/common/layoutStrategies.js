'use strict';

module.exports = {
    horizontal: function(sourceRect, targetRect, strokeWidth) {
        var sourceRectMid = sourceRect.top - targetRect.top + sourceRect.height/2;
        var targetRectMid = (targetRect.height/2);

        function calculateBoundingBox(){
            var top = -(strokeWidth + 1)/2 + (sourceRectMid < targetRectMid ? sourceRectMid : targetRectMid);
            var height = 2*((strokeWidth + 1)/2) + Math.abs(sourceRectMid - targetRectMid);
            var width = targetRect.left - (sourceRect.left + sourceRect.width);
            return {
                top: top,
                left: -width,
                width: width,
                height: height
            };
        }

        var connectorBox = calculateBoundingBox();
        var sourceYCoordinate = sourceRectMid < targetRectMid ? 2 : connectorBox.height - 2;
        var targetYCoordinate = sourceRectMid < targetRectMid ? connectorBox.height - 2 : 2;
        var lineCoordinates = [
            {x: 0, y: sourceYCoordinate},
            {x: connectorBox.width/2, y: sourceYCoordinate},
            {x: connectorBox.width/2, y: targetYCoordinate},
            {x: connectorBox.width,   y: targetYCoordinate}];
        return {
            boundingBox: connectorBox,
            lineCoordinates: lineCoordinates
        };
    },
    vertical: function(sourceRect, targetRect, strokeWidth) {
        var sourceRectYEntry = sourceRect.top - targetRect.top + 20;
        var targetRectXEntry = targetRect.width / 2;
        function calculateBoundingBox() {
            return {
                top: -(strokeWidth + 1) / 2 + sourceRectYEntry,
                left: -(targetRect.left - (sourceRect.left + sourceRect.width)),
                width: (strokeWidth + 1) / 2 + (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width),
                height: (strokeWidth + 1) / 2 + Math.abs(sourceRectYEntry)
            };
        }
        var boundingBox = calculateBoundingBox();
        var lineCoordinates = [
            {x: 0, y: 2},
            {x: boundingBox.width - 2, y: 2},
            {x: boundingBox.width - 2, y: boundingBox.height}
        ];
        return {
            boundingBox: boundingBox,
            lineCoordinates: lineCoordinates
        };
    }
};
