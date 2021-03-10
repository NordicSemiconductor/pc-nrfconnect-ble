/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';

const SUCCESS = 'success';
const ERROR = 'error';

const TextInput = props => {
    const {
        id,
        inline,
        validationState,
        label,
        labelClassName,
        wrapperClassName,
        buttonAfter,
        value,
        ...newProps
    } = props;
    const classProp = inline && { className: 'form-inline' };
    const realValue = `${value}`;

    if (validationState === SUCCESS) {
        newProps.isValid = true;
    }
    if (validationState === ERROR) {
        newProps.isInvalid = true;
    }

    return (
        <Form.Group controlId={id} {...classProp}>
            {label && (
                <Form.Label className={labelClassName}>{label}</Form.Label>
            )}
            <InputGroup className={wrapperClassName}>
                <Form.Control value={realValue} {...newProps} />
                {buttonAfter && (
                    <InputGroup.Append>{buttonAfter}</InputGroup.Append>
                )}
            </InputGroup>
        </Form.Group>
    );
};

TextInput.propTypes = {
    buttonAfter: PropTypes.node,
    className: PropTypes.string,
    hasFeedback: PropTypes.bool,
    id: PropTypes.string,
    inline: PropTypes.bool,
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    title: PropTypes.string,
    validationState: PropTypes.string,
    wrapperClassName: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

TextInput.defaultProps = {
    buttonAfter: null,
    className: null,
    hasFeedback: false,
    id: '',
    inline: true,
    label: '',
    labelClassName: 'col-md-3 text-right',
    onChange: null,
    placeholder: '',
    title: null,
    validationState: null,
    value: null,
    wrapperClassName: 'col-md-9',
};

export default TextInput;
