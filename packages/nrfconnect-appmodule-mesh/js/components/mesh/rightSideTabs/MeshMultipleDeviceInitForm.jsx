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

import React, { Component } from 'react'
import { reduxForm } from 'redux-form'
import HexDecInput, { reduxFieldToNumber } from '../HexDecInput'

import { Form, Button, FormControl, FormGroup, Col, ControlLabel} from 'react-bootstrap'

export const fields = ['minimalInterval', 'meshChannel', 'advertisingAddress'];

const DefaultData = {
  minimalInterval: {
    number: '100',
    type: 'Dec',
  },
  meshChannel: {
    number: '38',
    type: 'Dec',
  },
  advertisingAddress: {
    number: '0x8E89BED6',
    type: 'Hex',
  }
};

class MeshDeviceInitForm extends Component {
  constructor(props) {
    super(props);
    this.fillWithDefaultValues = () => this._fillWithDefaultValues();
  }

  _fillWithDefaultValues() {
    this.props.fields.minimalInterval.onChange(DefaultData.minimalInterval);
    this.props.fields.meshChannel.onChange(DefaultData.meshChannel);
    this.props.fields.advertisingAddress.onChange(DefaultData.advertisingAddress);
  }

  render() {
    const {
      fields: {
        minimalInterval,
        meshChannel,
        advertisingAddress,
      },
      handleSubmit,
      devices,
      initMultipleDevices,
      resetMultipleDevices
    } = this.props;

    return (
      <div className="input-max-size">
      <br />
        <Form >

          <HexDecInput id='MinimalInterval'
            placeholder='100'
            // placeholder='ms between something'
            label='Minimum Interval'
            fields={minimalInterval}
            disable={true}
            disableInput={true}
            />
          <HexDecInput id='MeshChannel'
            placeholder='38'
            // placeholder='The mesh channel'
            label='Mesh Channel'
            fields={meshChannel}
            disable={true}
            disableInput={true}
            />
          <HexDecInput id='AdvertisingAddress'
            placeholder='0x8E89BED6'
            // placeholder='Advertising address'
            label='Advertising Address'
            fields={advertisingAddress}
            disable={true}
            disableInput={true}
            />

          <ControlLabel>Devices to Initialize</ControlLabel>
          <FormControl componentClass="select" multiple onChange={(input) => {
            let options = input.target.options;
            this.selectedDevices = [];
            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) {
                this.selectedDevices.push({ port: options[i].value, instanceId: options[i].title });
              }
            }
          } }>

            {devices.map(device => {
              return <option key={device._instanceId} title={device._instanceId} value={device._state._port} >{device._instanceId} - {device.state.port}</option>;
            }) }
          </FormControl>

          <Button bsStyle='link'
            onClick={() => this.fillWithDefaultValues() }>
            Fill with default values
          </Button>

          <FormGroup>
            <Button
              bsStyle="primary"
              className="multipleDevices-init"
              onClick={() => {
                // TODO, change this back to being init, not reset
                // let adr = reduxFieldToNumber(advertisingAddress)
                // let channel = reduxFieldToNumber(meshChannel)
                // let min = reduxFieldToNumber(minimalInterval)
                // initMultipleDevices(this.selectedDevices, adr, min, channel);
                resetMultipleDevices(this.selectedDevices)
                
                
              } }
              >
              Initialize selected devices
            </Button>
            <br />
            <br />
            <Button
              bsStyle="danger"
              className="multipleDevices-reset"
              onClick={() => { resetMultipleDevices(this.selectedDevices) } }
              >
              Reset selected devices
            </Button>

          </FormGroup>
        </Form>
      </div>
    )
  }
}

const FormId = 'mesh-init';
export default reduxForm({
  form: FormId,
  fields,
})(MeshDeviceInitForm);
