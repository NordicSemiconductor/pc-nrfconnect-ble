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
            elements: []
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
    render: function() {
        return <Infinite elementHeight={30}
                         containerHeight={250}
                         infiniteLoadBeginBottomOffset={200}
                         className="infinite-log"
                         follow={false}
                         >
            {this.state.elements}
        </Infinite>;
    }
});

module.exports = LogContainer;
