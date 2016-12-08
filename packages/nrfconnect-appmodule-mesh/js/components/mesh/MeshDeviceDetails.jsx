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
import {Button, Panel} from 'react-bootstrap';
import Component from 'react-pure-render/component';
import MeshDeviceInitForm from './MeshDeviceInitForm';
import MeshDeviceControl from './MeshDeviceControl'
import { reduxFieldToNumber } from './HexDecInput'

export default class DeviceDetailsView extends Component {
    constructor(props) {
        super(props);
        this.initDevice = (values) => this._initDevice(values);
    }

    _initDevice(values) {
        const parsed = {};
        console.log('values: ', values);
        for (let field of Object.keys(values)) {
            const {
                number,
                type
            } = values[field];
            parsed[field] = parseInt(number, type === 'Dec' ? 10 : 16);
        }
        this.props.initDevice(parsed.meshChannel, parsed.minimalInterval, parsed.advertisingAddress);
    }

    render() {
        const {
            initValues,
            firmwareVersion,
            deviceName,
            serialNumber,
            generalMesh,
            expandSlot,
            getHandleValue,
            enableHandle,
            expandSlotValues,
            startBroadcast,
            radioReset,
            initDevice,
            isInitialized,
            toggleVisibilityHandleTable,
            isHandleTableVisible,
            isBroadcasting,
        } = this.props;

        let dirUpOrDown = (params) => {
            if (params) {
                return <span className='icon-right-dir' aria-hidden='true' />
            } else {
                return <span className='icon-down-dir' aria-hidden='true' />
            }
        };

        const PanelHeader = ({panelNumber, name}) => (
            <div onClick={() => { expandSlot(panelNumber); } }>
                <h4> {dirUpOrDown(expandSlotValues.get({ panelNumber })) } {name} </h4>
            </div>
        );

        return (
            <div className='device main-device standalone' >
                <div className='panel-and-header'>
                    { !isInitialized ? (
                        <div> 
                            <p> please program the divice with the correct firmware and initialize it. </p>
                         </div>
                    ) : (
                            <MeshDeviceControl
                                enableHandle={enableHandle}
                                generalMesh={generalMesh}
                                getHandleValue={getHandleValue}
                                isBroadcasting={isBroadcasting}
                                isHandleTableVisible={isHandleTableVisible}
                                startBroadcast={startBroadcast}
                                toggleVisibilityHandleTable={toggleVisibilityHandleTable}
                                onSubmit={() => { } }
                                />
                        ) }
                </div>
            </div>
        )
    }
}

DeviceDetailsView.propTypes = {
    deviceName: PropTypes.string
};
