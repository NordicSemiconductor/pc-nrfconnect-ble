'use strict';

import React from 'react';

var Connector = React.createClass({
    _calculateConnectorBox: function(sourceRect, targetRect) {
        var top = -2 + targetRect.height/2; 
        //var bottom = Math.max(targetRect.bottom - targetRect.height/2, sourceRect.bottom - sourceRect.height/2);
        var height = 4 + (sourceRect.top + sourceRect.height/2) - (targetRect.top + targetRect.height/2);
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

        return (<svg style={{position: 'absolute', left: connectorBox.left,top: connectorBox.top, width:connectorBox.width, height:connectorBox.height}}>
            <line x1="0" y1={connectorBox.height - 2} x2={connectorBox.width/2} y2={connectorBox.height - 2} stroke="black" strokeWidth="3" strokeLinecap="square"/>
            <line x1={connectorBox.width/2} y1={connectorBox.height - 2} x2={connectorBox.width/2} y2="2" stroke="black" strokeWidth="3" strokeLinecap="square"/>
            <line x1={connectorBox.width/2} y1="2" x2={connectorBox.width} y2="2" stroke="black" strokeWidth="3" strokeLinecap="square"/>
            </svg>);
    }
});

module.exports = Connector;