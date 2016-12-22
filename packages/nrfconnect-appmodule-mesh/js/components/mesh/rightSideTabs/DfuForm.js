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

import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form'

import { Button, Form, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

export const fields = [
    'application',
    'companyId',
    'applicationId',
    'applicationVersion',
    'softdevice',
    'device',
    'file',
]

const isHex = string => string && /^(0x)?[0-9a-f]+$/.test(string.toLowerCase());

const validate = values => {
    const errors = {}
    // if (!values.application && (file.value==='custom')) {
    //     errors.application = 'Must select a .hex application'
    // }
    for (let field of ['companyId', 'applicationId', 'applicationVersion', 'softdevice']) {
        if (!isHex(values[field])) {
            errors[field] = 'Must be hexadecimal'
        }
    }
    // hardcoded.. :(
    if (values.device === 'No devices found.') {
        errors.device = 'Must select a device'
    }
    return errors
}

class DfuForm extends Component {
    render() {
        const {
            fields: {
                application,
                companyId,
                applicationId,
                applicationVersion,
                softdevice,
                device,
                file,
            },
            handleSubmit,
            devices,
            dfu,
            showCustomFileAct,
            hideCustomFileAct,
        } = this.props;
        const noComs = devices.length === 0;
        if (noComs) {
            devices.push('No devices found.')
        }

        const altPrograms = [
            { name: "Standard Gateway", choosen: true },
            { name: "Custom Program", choosen: false },
        ]

        return (
            <Form onSubmit={handleSubmit}>
                <br />

                <FormGroup controlId="defaultDFU" initialValue='NRF51Dongle'>
                    <ControlLabel>Firmware</ControlLabel>
                    <FormControl componentClass="select"
                        {...file} >
                        
                        <option key={100} value="default">Choose a hexFile</option>
                        <option key={0} value="NRF51Dongle">Default Blinky for NRF51</option>
                        <option key={1} value="NRF52">Default Blinky for NRF52</option>
                        <option key={2} value="custom">Custom file</option>

                    </FormControl>
                    {device.touched && device.error && <div>{device.error}</div>}
                </FormGroup>

                {(file.value==='custom') && <FormGroup controlId="dfuFileSelector">
                    <ControlLabel>New program file</ControlLabel>
                    <FormControl
                        type="file"
                        onChange={e => {
                            e.preventDefault();
                            const file = e.target.files[0];
                            this.props.fields.application.onChange(file);
                        }}
                        />
                    {application.touched && application.error && <div>{application.error}</div>}
                </FormGroup>}

                <FormGroup controlId="dfuSDVersion">
                    <ControlLabel>
                        Softdevice
                    </ControlLabel>
                    <FormControl type="text" placeholder="0x0064" value="0x0064" {...softdevice} />
                    {softdevice.touched && softdevice.error && <div>{softdevice.error}</div>}
                </FormGroup>

                <FormGroup controlId="dfuCompanyId">
                    <ControlLabel>
                        Company ID
                    </ControlLabel>
                    <FormControl type="text" placeholder="0x00000059" {...companyId} />
                    {companyId.touched && companyId.error && <div>{companyId.error}</div>}
                </FormGroup>

                <FormGroup controlId="dfuAppId">
                    <ControlLabel>
                        App ID
                    </ControlLabel>
                    <FormControl type="text" placeholder="0x01" {...applicationId} />
                    {applicationId.touched && applicationId.error && <div>{applicationId.error}</div>}
                </FormGroup>

                <FormGroup controlId="dfuAppVersion">
                    <ControlLabel>
                        App Version
                    </ControlLabel>
                    <FormControl type="text" placeholder="0x02" {...applicationVersion} />
                    {applicationVersion.touched && applicationVersion.error && <div>{applicationVersion.error}</div>}
                </FormGroup>

                <FormGroup controlId="deviceSelect" initialValue='COM12'>
                    <ControlLabel>DFU Gateway node </ControlLabel>
                    <FormControl disabled={noComs} componentClass="select" placeholder="select device"
                        initialValue={100}
                        {...device}>
                        <option key={100} value="">Choose device</option>
                        {
                            devices.map((com, i) => (<option key={i} value={com.port+"@"+com.serialNumber}>{com.serialNumber} - {com.port}</option>))
                        }
                    </FormControl>
                    {device.touched && device.error && <div>{device.error}</div>}
                </FormGroup>

                <Button bsStyle='primary' type='submit'>
                    Start
                </Button>
                <br />
                <div>
                    {dfu.isRunning &&
                        <ControlLabel>DFU in progress:
                            <span className="spinner">
                                <i className="icon-arrows-cw"></i>
                            </span>
                            <div>
                                <p> Please wait... </p>
                            </div>
                        </ControlLabel>
                    }
                </div>
            </Form>
        )
    }
}

export default reduxForm({
    form: 'simple',
    fields,
    validate
})(DfuForm);
