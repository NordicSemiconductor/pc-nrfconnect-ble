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

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PageHeader, Button, Tab, Tabs, Checkbox, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import path from 'path';

import DfuContainer from '../../containers/DfuContainer'
import MeshMultipleDeviceInitForm from '../../components/mesh/rightSideTabs/MeshMultipleDeviceInitForm';
import * as AdapterActions from '../../actions/mesh/meshAdapterActions';
import * as AppActions from '../../actions/appActions';
import * as MultiProgActions from '../../actions/mesh/nRF5MultiProgActions';
import { getHexPath } from '../../utils/platform'



const familyOptions = {
    'NRF51': ' --family NRF51',
    'NRF52': ' --family NRF52'
}

class DiscoveredDevices extends Component {
    constructor(props) {
        super(props);

        /* An array of all device's snrs that are connected to the PC. */
        this.connectedSnrs = [];

        /* Default options for nrf5_multi_prog.exe. These can be changed by user in the Program tab of the right side bar. */
        this.erase = ' -e';
        this.family = familyOptions.NRF51;
        this.file = '';
        this.reset = ' -r';
        this.snrs = '';
        this.verify = ' -v';
        
        this.file = getHexPath('nrf-connect-mesh-official-serial-gateway-fw_nRF51')
        
    }

    render() {
        const {
            adapter,
            multiProg,
            nRF5MultiProg,
            showCustomFileInForm,
            resetMultipleDevices,
            initMultipleDevices,
            toggleRightSideBar,
            addSelectedSNRS, 

        } = this.props;

        const { isRightSideBarCollapsed } = this.props.app;

        const altPrograms = [
            { name: "Standard Gateway", choosen: true },
            { name: "Custom Program", choosen: false },
        ]

        this.connectedSnrs = adapter.api.adapters.map(device => { // TODO: Only multiple select component needs to be re-rendered.
            return device;
        });

        function sliceZeros(snr) {
            while (snr[0] == 0) {
                snr = snr.slice(1);
            }
            return snr;
        }

        return (
            <div className="input-max-size" >
                <h4> Program multiple devices</h4>
                <br />

                <FormGroup controlId="deviceSelect" >
                    <ControlLabel>Choose firmware software</ControlLabel>
                    <FormControl componentClass="select" placeholder="Select firmware"
                        onChange={(input) => {
                            let options = input.target.options;
                            if (options[0].selected) {
                                this.file = path.resolve(__dirname)+'\\..\\..\\..\\nrf-connect-mesh-official-serial-gateway-fw.hex' //TODO: Make general
                                console.log(this.file);
                                showCustomFileInForm(false);
                            } else if (options[1].selected) {
                                showCustomFileInForm(true);
                            }
                        } }>
                        {
                            altPrograms.map((com, i) => (<option key={i} value={com.name}>{com.name}</option>))
                        }
                    </FormControl>
                </FormGroup>

                {multiProg.showCustomFile &&
                    <FormGroup  controlId="formControlsFile">
                        <ControlLabel>Program file</ControlLabel>
                        <FormControl type="file" onChange={(input) => { this.file = input.target.files[0].path; console.log(input.target.files[0].path); } }/>
                    </FormGroup>
                }


                <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Family</ControlLabel>
                    <FormControl componentClass="select" onChange={(input) => { this.family = input.target.value } } placeholder="select" >
                        <option value={familyOptions.NRF51}>nRF51</option>
                        <option value={familyOptions.NRF52}>nRF52</option>
                    </FormControl>
                </FormGroup>



                <FormGroup controlId="formControlsSelectMultiple">
                    <ControlLabel>Devices to program</ControlLabel>
                    <FormControl componentClass="select" multiple onChange={(input) => {
                        let options = input.target.options;
                        this.snrs = ' -s';
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].selected) {
                                this.snrs += (' ' + sliceZeros(options[i].value));
                                addSelectedSNRS(this.snrs)
                            }
                        }
                    } }>
                        {this.connectedSnrs.map(device => {
                            return <option key={'key' + device.instanceId} value={device.instanceId}>{device.instanceId} - {device.state.port}</option>;
                        }) }
                    </FormControl>
                </FormGroup>


                <Button disabled={multiProg.isRunning || (multiProg.snrSelected.size==0)} style={{ width: "100%" }} bsStyle='primary' onClick={() => {
                    //let commandString = ' program -f ' + this.file + this.erase + this.family + this.reset + this.verify;
                    if (this.family == familyOptions.NRF52){
                        this.file = getHexPath('nrf-connect-mesh-official-serial-gateway-fw_nRF52')
                    } else {
                        this.file = getHexPath('nrf-connect-mesh-official-serial-gateway-fw_nRF51')
                    }

                    let commandString = ' program -f ' + this.file + this.erase + this.family + this.reset + this.verify;
                    if (this.snrs != '') { /* If no snrs are selected, the default behavior of nRF5 multi prog is to program all connected devices. */
                        commandString += this.snrs;
                    } else {
                        console.error("No devices was selected");
                        return;
                    }

                    if (this.props.logger.running) {
                        nRF5MultiProg(commandString, this.props.logger.logger);
                    } else {
                        nRF5MultiProg(commandString);
                    }
                } }>
                    { multiProg.isRunning &&
                        <span className="spinner">
                            <i className="icon-arrows-cw"></i>
                        </span>
                    }
                    Program</Button>
            </div>

        );
    }
}

function mapStateToProps(state) {
    const {
        adapter,
        logger,
        app,
        multiProg,
    } = state;

    return {
        app,
        adapter,
        logger,
        multiProg
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch),
        bindActionCreators(AppActions, dispatch),
        bindActionCreators(MultiProgActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DiscoveredDevices);

DiscoveredDevices.propTypes = {
};

