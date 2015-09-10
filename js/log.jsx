'use strict';

var React = require('react');
var Reflux = require('reflux');
var logStore = require('./stores/logStore.js');
var moment = require('moment');

function entryClassName(entry) {
    switch(entry.level) {
        case 0:
            return 'log-trace';
        case 1:
            return 'log-debug';
        case 2:
            return 'log-info';
        case 3:
            return 'log-warning';
        case 4:
            return 'log-error';
        case 5:
            return 'log-fatal';
        default:
            return 'log-unknown';
    }
}

var Infinite = require('react-infinite');

var LogContainer = React.createClass({
    mixins: [Reflux.connect(logStore)],
    getInitialState: function() {
        return {
            isInfiniteLoading: false,
            elements: [],
            follow: false
        }
    },
    componentWillUpdate: function() {
        this.createElementsForLogEntries();
    },
    createElementsForLogEntries: function() {
        for (var i = this.state.elements.length, j = this.state.logEntries.length; i < j; i++) {
            var entry = this.state.logEntries[i];
            this.state.elements.push(this.createElement(entry, i));
        }
    },
    createElement: function(entry, i) {
        var className = "log-entry " + entryClassName(entry);
        return <div className={className} key={entry.id}>
            <div className="time">{moment(new Date(entry.time)).format('HH:mm:ss.SSSS')}</div>
            <div className="message">{entry.message}</div>
        </div>
    },
    toggleFollow: function() {
        this.setState({follow: !this.state.follow});
    },
    clearLog: function() {
        this.state.elements.length = 0;
        this.state.logEntries.length = 0;
        this.setState(this.state);
    },
    _getClassForFollow: function() {
        return "btn btn-default btn-nordic " + (this.state.follow ? "active" : "");
    },
    render: function() {
        return <div className="log-wrap">
            <div className="log-header">
                <div className="log-header-text">Log</div>
                <div className="log-header-buttons">
                    <button type="button" title="Clear log" className="btn btn-default btn-nordic" onClick={this.clearLog}>
                        <span className="icon-trash" aria-hidden="true" />
                    </button>
                    <button type="button" title="Scroll automatically" className={this._getClassForFollow()} onClick={this.toggleFollow}>
                        <span className="icon-down" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <Infinite elementHeight={20}
                             containerHeight={155}
                             infiniteLoadBeginBottomOffset={135}
                             className="infinite-log"
                             follow={this.state.follow}
                             >
                {this.state.elements}
            </Infinite>
        </div>;
    }
});

module.exports = LogContainer;
