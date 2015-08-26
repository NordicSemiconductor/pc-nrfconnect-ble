'use strict';
var React = require('react');
var mui = require('material-ui');
var Paper = mui.Paper;

var SlideInView = React.createClass({
    getInitialState: function() {
        return {
            visible: false
        };
    },
    show: function() {
        this.setState({visible: true});
    },
    hide: function() {
        this.setState({visible: false});
    },
    render: function() {
        return (
            <Paper className="slidein" >
                <div className={(this.state.visible ? "visible ": "") + this.props.alignment}>
                    {this.props.children}
                </div>
            </Paper>
        );
    }
});

module.exports = SlideInView;