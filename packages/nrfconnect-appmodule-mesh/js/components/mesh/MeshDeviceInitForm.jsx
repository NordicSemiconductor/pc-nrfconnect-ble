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
import HexDecInput from './HexDecInput'

import { Form, Button } from 'react-bootstrap'

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
      handleSubmit
    } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
          <HexDecInput id='MinimalInterval'
              placeholder='ms between something'
              label='Minimal Interval'
              fields={minimalInterval}
              />
          <HexDecInput id='MeshChannel'
              placeholder='The mesh channel'
              label='Mesh Channel'
              fields={meshChannel}
              />
          <HexDecInput id='AdvertisingAddress'
              placeholder='The address to advertise on'
              label='Advertising Address'
              fields={advertisingAddress}
              />
            <Button bsStyle='link'
              onClick={() => this.fillWithDefaultValues()}>
              Fill with default values
            </Button>
          <Button bsStyle='primary' type='submit'>Initialize</Button>
      </Form>
    )
  }
}

const FormId = 'mesh-init';
export default reduxForm({
  form: FormId,
  fields,
})(MeshDeviceInitForm);
