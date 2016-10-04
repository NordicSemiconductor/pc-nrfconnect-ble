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

import React, { PropTypes } from 'react';
import { Button }  from 'react-bootstrap';

export default class DfuButton extends React.PureComponent {
    static propTypes = {
        dfuInProgress: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
    };

    render() {
        const { dfuInProgress, disabled, onClick } = this.props;

        let labelString;
        let iconName;

        if (dfuInProgress) {
            labelString = 'Stop DFU';
            iconName = 'icon-stop';
        } else {
            labelString = 'Start DFU';
            iconName = 'icon-play';
        }

        return (
            <Button bsStyle='primary' disabled={disabled} className='btn-nordic pull-right' onClick={onClick}>
                <span className={iconName} />
                {labelString}
            </Button>
        );
    }
}
