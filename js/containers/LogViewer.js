/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React, { PropTypes } from 'react';
import Infinite from 'react-infinite';

import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as LogActions from '../actions/logActions';
import LogEntry from '../components/LogEntry';

class LogContainer extends Component {
    constructor(props) {
        super(props);
        this.props.startReading();

        const { clear } = this.props;

        window.addEventListener('core:clear-log', () => { clear(); });
    }

    render() {
        const {
            autoScroll,
            logEntries,
            clear,
            toggleAutoScroll,
        } = this.props;

        return (<div className='log-wrap'>
            <div className='log-header'>
                <div className='log-header-text'>Log</div>
                <div className='padded-row log-header-buttons'>
                    <button type='button' title='Clear log' className='btn btn-primary btn-xs btn-nordic' onClick={() => clear()}>
                        <span className='icon-trash' aria-hidden='true' />
                    </button>
                    <button type='button' title='Scroll automatically' className={'btn btn-primary btn-xs btn-nordic ' + (autoScroll ? 'active' : '')} onClick={() => toggleAutoScroll()}>
                        <span className='icon-down' aria-hidden='true' />
                    </button>
                </div>
            </div>

            <Infinite elementHeight={20}
                             containerHeight={155}
                             infiniteLoadBeginEdgeOffset={135}
                             className='infinite-log'
                             autoScroll={autoScroll}
                             >
                 {logEntries.map(entry => <LogEntry {...{entry}} key={entry.id} />)}
            </Infinite>
        </div>);
    }
}

function mapStateToProps(state) {
    const { log } = state;

    return {
        logEntries: log.entries,
        autoScroll: log.autoScroll,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(LogActions, dispatch)
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogContainer);

LogContainer.propTypes = {
    logEntries: PropTypes.object.isRequired,
    autoScroll: PropTypes.bool.isRequired,
    toggleAutoScroll: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired,
    startReading: PropTypes.func.isRequired,
    stopReading: PropTypes.func.isRequired,
};
