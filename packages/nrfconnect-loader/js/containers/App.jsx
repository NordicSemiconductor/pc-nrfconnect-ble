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

import 'nrfconnect-core/css/styles.less';

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AppmoduleLoader from '../components/AppmoduleLoader';
import { ErrorDialog } from 'nrfconnect-core';
import Immutable from 'immutable';
import { ipcRenderer } from 'electron';
import { loadAppmodulesAction } from '../actions/appActions';

class AppContainer extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        appmodules: PropTypes.instanceOf(Immutable.List).isRequired,
        onAppmoduleSelected: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.loadAppmodules();
    }

    render() {
        return (
            <div>
                <AppmoduleLoader
                    appmodules={this.props.appmodules}
                    onAppmoduleSelected={this.props.onAppmoduleSelected}
                />
                <ErrorDialog/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { app } = state;

    return {
        appmodules: app.appmodules
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onAppmoduleSelected: appmodule => ipcRenderer.send('load-appmodule', appmodule.name, appmodule.icon),
        loadAppmodules: () => dispatch(loadAppmodulesAction())
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer);
