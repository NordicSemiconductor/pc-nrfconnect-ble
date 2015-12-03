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
import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { DropdownButton, MenuItem } from 'react-bootstrap';

import * as AdapterActions from '../actions/adapterActions';

class AdapterSelector extends Component {
    constructor(props) {
        super(props);
    }

    focusOnComPorts() {
        var dropDown = React.findDOMNode(this.refs.comPortDropdown);
        dropDown.firstChild.click();
    }

    render() {
        const {
            adapters,
            adapterStatus,
            adapterIndicator,
        } = this.props.adapter;

        const {
            openAdapter,
        } = this.props;

        const adapterNodes = [];

        adapters.forEach((adapter, i) => {
            const port = adapter.get('port');
            adapterNodes.push(<MenuItem className='btn-primary' eventKey={port} onSelect={() => openAdapter(port)} key={i}>{port}</MenuItem>);
        });

        return (
            <span title='Select com port (Alt+P)'>
                <div className='padded-row'>
                    <DropdownButton id='navbar-dropdown' className='btn-primary btn-nordic' title={adapterStatus} ref='comPortDropdown'>
                        {adapterNodes}
                    </DropdownButton>
                    <div className={'indicator ' + adapterIndicator}></div>
                </div>
            </span>
        );
    }
}

function mapStateToProps(state) {
    const { adapter } = state;
    return { adapter: adapter, adapterStatus: adapter.adapterStatus, adapterIndicator: adapter.adapterIndicator, adapters: adapter.adapters };

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(AdapterActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps)(AdapterSelector);

AdapterSelector.propTypes = {
    adapters: PropTypes.object.isRequired,
    adapterStatus: PropTypes.string.isRequired,
    openAdapter: PropTypes.func.isRequired,
};
