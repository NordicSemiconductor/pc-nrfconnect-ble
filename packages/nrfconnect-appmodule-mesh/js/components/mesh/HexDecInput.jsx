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

import {
    ControlLabel,
    FormControl,
    FormGroup,
    InputGroup,
    Button,
} from 'react-bootstrap';

const swapNumberType = type => type == 'Dec' ? 'Hex' : 'Dec';
const typeToBase = type => type == 'Dec' ? 10 : 16;

export const changeBase = (type, num) => {
  if (num === '') return '';
  let base = typeToBase(type);
  let newBase = typeToBase(swapNumberType(type));
  let string = parseInt(num, base).toString(newBase);
  if (newBase == 16)
    string = '0x' + string.toUpperCase();
  return string;
}

// Take the redux field thing, and return a Number.
export const reduxFieldToNumber = reduxField => {
  // NOTE: assumes there are one two bases, 16 ('Hex'), 10.
  const { number, type } = reduxField.value;
  let num = number;
  if (type === 'Hex') {
    num = changeBase(type, number);
  }
  return parseInt(num, 10);
}

// NOTE: This is meant to be used with Redux Form
//
// id: Identifier for the field
// placeholder: Greyed out text, in the input by default
// label: Label above the field
// fields: The Redux Form value thing.
const HexDecInput = ({id, placeholder, label, fields, disable, disableInput}) => {
  let { number, type } = fields.value;
  if (number === undefined) number = ''
  if (type === undefined) type = 'Hex'
  if (disable === undefined ) disable = false
  if (disableInput === undefined ) disableInput = false
  return (
    <FormGroup controlId={'meshInit' + id}>
      {label &&
      <ControlLabel>
        { label }
      </ControlLabel>
      }
      <InputGroup>
      <FormControl
        type='text'
        disabled={disableInput}
        placeholder={placeholder}
        value={number}
        onChange={e => fields.onChange({
          type: type,
          number: e.target.value
        })}/>

        <InputGroup.Button>
        <Button disabled={disable} onClick={() => fields.onChange({
            number: changeBase(type, number),
            type: swapNumberType(type)
          })}>
        {type}
        </Button>
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  )
}

export default HexDecInput
