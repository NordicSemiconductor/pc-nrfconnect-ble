'use strict';

import _ from 'underscore';
import React from 'react';

var AddNewItem = React.createClass({
    componentWillReceiveProps: function(nextProps) {
        //if we're selected through keyboard navigation, we need to make sure we're visible
        let selectedId = nextProps.selected && nextProps.selected._addBtnId;
        if (nextProps.id === selectedId && nextProps.onRequestVisibility) {
            nextProps.onRequestVisibility();
        }
    },

    render: function() {
        let bars = _.times(this.props.bars, i => <div className={'bar' + (i + 1)} key={i}></div>);
        let selectedId = this.props.selected && this.props.selected._addBtnId;
        let backgroundColor = this.props.id === selectedId ? 'rgb(179,225,245)' : 'rgb(255,255,255)';
        return (
            <div className='add-new' style={{backgroundColor: backgroundColor}} onClick={this.props.onClick}>
                {bars}
                <div className='content-wrap'>
                    <div className='content padded-row'>
                        <span className='icon-wrap'><i className='icon-slim icon-plus-circled'></i></span>
                        <span>{this.props.text}</span>
                    </div>
                </div>
            </div>
        );
    },
});

module.exports = AddNewItem;
