/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import DfuForm from '../components/mesh/rightSideTabs/DfuForm';
import { logger } from '../logging';

import * as DfuActions from '../actions/mesh/dfuActions'

class DfuContainer extends Component {

    constructor(props) {
        super(props);
        this.runDFU = (arg) => this._runDFU(arg);
    }

    _runDFU(values) {
        this.props.runDFU(values);
        // Return false so we dont redirect the page
        return false;
    }

    render() {
        const { devices, dfu, showCustomFile, hideCustomFile } = this.props;
        return (
            <div className="input-max-size" >
                <DfuForm onSubmit={this.runDFU}
                    dfu={dfu}
                    devices={devices.map(d => d.state)}
                    showCustomFileAct={showCustomFile}
                    hideCustomFileAct={hideCustomFile}
                    />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        logger: state.logger,
        adapter: state.adapter,
        dfu: state.dfu,
    };
}

function mapDispatchToProps(dispatch) {
    return Object.assign({},
        bindActionCreators(DfuActions, dispatch),
    );
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DfuContainer);
