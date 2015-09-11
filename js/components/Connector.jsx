'use strict';

import React from 'react';

var Connector = React.createClass({
    _calculateConnectorBox: function(sourceRect, targetRect) {
        var strokeWidth = 3;
        this.sourceRectMid = sourceRect.top - targetRect.top + sourceRect.height/2;
        this.targetRectMid = (targetRect.height/2);

        var top = -(strokeWidth + 1)/2 + (this.sourceRectMid < this.targetRectMid ? this.sourceRectMid : this.targetRectMid);
        var height = 2*((strokeWidth + 1)/2) + Math.abs(this.sourceRectMid - this.targetRectMid);
        var width = targetRect.left - (sourceRect.left + sourceRect.width);
        return {
            top: top,
            left: -width,
            width: width,
            height: height
        };
    },
    render: function() {
        var sourceElement = document.getElementById(this.props.sourceId);
        var targetElement = document.getElementById(this.props.targetId);

        var sourceRect = sourceElement.getBoundingClientRect();
        var targetRect = targetElement.getBoundingClientRect();

        var connectorBox = this._calculateConnectorBox(sourceRect, targetRect);

        var sourceYCoordinate = this.sourceRectMid < this.targetRectMid ? 2 : connectorBox.height - 2;
        var targetYCoordinate = this.sourceRectMid < this.targetRectMid ? connectorBox.height - 2 : 2;

        return (<svg style={{position: 'absolute', left: connectorBox.left, top: connectorBox.top, width: connectorBox.width, height: connectorBox.height}}>
            <line x1="0" y1={sourceYCoordinate} x2={connectorBox.width/2} y2={sourceYCoordinate} stroke="black" strokeWidth="3" strokeLinecap="square"/>
            <line x1={connectorBox.width/2} y1={sourceYCoordinate} x2={connectorBox.width/2} y2={targetYCoordinate} stroke="black" strokeWidth="3" strokeLinecap="square"/>
            <line x1={connectorBox.width/2} y1={targetYCoordinate}s x2={connectorBox.width} y2={targetYCoordinate} stroke="black" strokeWidth="3" strokeLinecap="square"/>
            </svg>);
    }
});

module.exports = Connector;
