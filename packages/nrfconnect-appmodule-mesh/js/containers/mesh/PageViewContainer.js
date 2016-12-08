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

import React, {PropTypes} from 'react';
import {List, Record} from 'immutable';


import Component from 'react-pure-render/component';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import MultiInitContainer from './pages/MultiInitContainer';
import QuickStartContainer from './pages/QuickStartContainer';
import MultipProgramContainer from './pages/MultipProgramContainer';
import GatwayNodeContainer from './pages/GatewayNodeContainer';
import DFUContainer from './pages/DFUContainer';
import AboutContainer from './pages/AboutContainer';

import * as DeviceDetailsActions from '../../actions/deviceDetailsActions';
import * as AdapterActions from '../../actions/mesh/meshAdapterActions';
import * as MultiProgActions from '../../actions/mesh/nRF5MultiProgActions';


class PageViewContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            pageView,
            closeAdapter,
            adapter,
            addSelectedSNRS,
            multiProg,
        } = this.props;

        const PageToDisplay = (page) => {

            if (page !== 'GatewayNode') {
                if (adapter.api.selectedAdapter) {
                    console.log("Closing adapt");

                    const selectedAdapter = adapter.api.selectedAdapter;
                    closeAdapter(selectedAdapter);
                }

            }
            if (page !== 'Program') {
                if (multiProg.snrSelected.size != 0){
                    addSelectedSNRS(List())
                }
            }


            switch (page) {
                case 'Intro':
                    return (<QuickStartContainer />);
                    break;
                case 'Program':
                    return (<MultipProgramContainer />);
                    break;
                case 'Initialize':
                    
                    return (<MultiInitContainer />);
                    break;
                case 'GatewayNode':
                    return (<GatwayNodeContainer />);
                    break;
                case 'DFU':
                    return (<DFUContainer />);
                    break;
                case 'About':
                    return (<AboutContainer />);
                    break;
                default:
                    return (<h1> default </h1>);
                    break;
            }
        }

        return (
            <div className='left-space' >
                <br />
                {PageToDisplay(pageView) }
            </div >
        );
    }
};

function mapStateToProps(state) {
    const {
        meshPageSelector,
        adapter,
        multiProg,
    } = state;
    const pageView = meshPageSelector.get('selectedPage');
    return {
        pageView: pageView,
        adapter,
        multiProg,
    };
};


function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch),
        bindActionCreators(MultiProgActions, dispatch),
    );
    return retval;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PageViewContainer);

PageViewContainer.propTypes = {

};
