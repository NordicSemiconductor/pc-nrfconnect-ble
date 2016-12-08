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
import { reduxForm } from 'redux-form';
import {
  Button,
  ButtonGroup,
  Form,
  FormGroup,
} from 'react-bootstrap'

import HexDecInput, { reduxFieldToNumber } from './HexDecInput'

export const fields = ['handle', 'handleValue']

const MeshDeviceControl = props => {
  const {
    toggleVisibilityHandleTable,
    isHandleTableVisible,
    isBroadcasting,
    startBroadcast,
    getHandleValue,
    enableHandle,
    generalMesh,
    // redux form
    fields: {
      handle,
      handleValue,
    },
    handleSubmit,
  } = props;

  const enablep = b => b ? 'enable' : 'disable';
  const capitalize = s => s[0].toUpperCase() + s.slice(1);

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <h4>
          Handle
        </h4>
        <HexDecInput
          id='DataHandle'
          placeholder='Data handle'
          fields={handle} />

        <FormGroup>
          <ButtonGroup>
          <Button onClick={() => getHandleValue(reduxFieldToNumber(handle))}> Get </Button>
          <Button onClick={() =>
            enableHandle(reduxFieldToNumber(handle), true)}>
            Enable
          </Button>
          <Button onClick={() =>
            enableHandle(reduxFieldToNumber(handle), false)}>
            Disable
          </Button>
          </ButtonGroup>
        </FormGroup>

        <FormGroup>
        <h4>Value</h4>
          <HexDecInput            
            id='DataHandleValue'
            placeholder='Value'
            fields={handleValue}
            disable={true}
            />

          <Button bsStyle='primary'
          onClick={() => {
            const h = reduxFieldToNumber(handle)
            const v =  handleValue.value.number //Number here is a string TODO: rename            
            generalMesh(h, v);
          }}> Set </Button>
        </FormGroup>

      </Form>
      <hr />

      Broadcasting is <div className='emph'>{enablep(isBroadcasting)}d</div>.
      {' '}
      <a href='#' onClick={() => startBroadcast(!isBroadcasting)}>
        {capitalize(enablep(!isBroadcasting))}
      </a> it?

      <hr />

      <Button bsStyle='link' onClick={toggleVisibilityHandleTable}>
          {isHandleTableVisible ? 'Hide' : 'Show'} handle table
      </Button>
    </div>
  )
}

const FormId = 'mesh-control';
export default reduxForm({
  form: FormId,
  fields,
})(MeshDeviceControl)
