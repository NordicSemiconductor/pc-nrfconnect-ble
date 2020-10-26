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

/* eslint react/forbid-prop-types: off */

'use strict';

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';

import AdvertisingSetup from '../containers/AdvertisingSetup';
import SecurityParamsDialog from '../containers/SecurityParamsDialog';
import withHotkey from '../utils/withHotkey';
import Spinner from './Spinner';

const icon = require('../../resources/nordic_usb_icon.png');

const CentralDevice = ({
    id,
    name,
    address,
    advertising,
    onToggleAdvertising,
    onSaveSetup,
    onLoadSetup,
    onToggleAutoConnUpdate,
    autoConnUpdate,
    onToggleAutoAcceptPairing,
    onShowSecurityParamsDialog,
    onOpenCustomUuidFile,
    security,
    isDeviceDetails,
    bindHotkey,
    onShowSetupDialog,
    onDeleteBondInfo,
}) => {
    const sdApiVersion = useSelector(
        ({ app }) =>
            // eslint-disable-next-line no-underscore-dangle
            ((app.adapter.bleDriver.adapter || {})._bleDriver || {})
                .NRF_SD_BLE_API_VERSION
    );

    useEffect(
        () => onToggleAdvertising && bindHotkey('alt+a', onToggleAdvertising),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const style = {
        position: 'relative',
        height: '102px',
    };

    const progressStyle = {
        visibility: advertising ? 'visible' : 'hidden',
    };

    const iconOpacity = advertising ? '' : 'icon-background';
    const advMenuText = advertising ? 'Stop advertising' : 'Start advertising';
    const advIconTitle = advertising ? 'Advertising' : 'Not advertising';
    const iconCheckmarkConnUpdate = autoConnUpdate ? 'mdi mdi-check' : '';
    const iconCheckmarkPairing =
        security && security.autoAcceptPairing ? 'mdi mdi-check' : '';

    const autoConnHeader =
        sdApiVersion >= 5
            ? 'Connection, phy, data length and mtu update'
            : 'Connection update';
    const autoConnTitle =
        sdApiVersion >= 5
            ? 'Automatically accept connection, phy, data length and mtu update requests'
            : 'Automatically accept connection update requests';

    const dropDownMenu = (
        <Dropdown.Menu>
            {onToggleAdvertising && isDeviceDetails && (
                <>
                    <Dropdown.Header key="advHeader">
                        Advertising
                    </Dropdown.Header>
                    <Dropdown.Item key="setup" onSelect={onShowSetupDialog}>
                        Advertising setup...
                    </Dropdown.Item>
                    <Dropdown.Item
                        key="advertising"
                        onSelect={onToggleAdvertising}
                    >
                        {advMenuText}{' '}
                        <span className="subtler-text">(Alt+A)</span>
                    </Dropdown.Item>
                </>
            )}
            {onLoadSetup && (
                <Dropdown.Item key="load" onSelect={onLoadSetup}>
                    Load setup...
                </Dropdown.Item>
            )}
            {onSaveSetup && (
                <Dropdown.Item key="save" onSelect={onSaveSetup}>
                    Save setup...
                </Dropdown.Item>
            )}
            {onToggleAutoConnUpdate && (
                <>
                    <Dropdown.Divider key="dividerConnUpdate" />
                    <Dropdown.Header key="connUpdateHeader">
                        {autoConnHeader}
                    </Dropdown.Header>
                    <Dropdown.Item
                        key="autoConnUpdate"
                        title={autoConnTitle}
                        onSelect={onToggleAutoConnUpdate}
                    >
                        <i className={iconCheckmarkConnUpdate} />
                        Auto accept update requests
                    </Dropdown.Item>
                </>
            )}
            {onToggleAutoAcceptPairing && onShowSecurityParamsDialog && (
                <>
                    <Dropdown.Divider key="dividerSecurity" />
                    <Dropdown.Header key="securityHeader">
                        Security
                    </Dropdown.Header>
                    <Dropdown.Item
                        key="setSecurityParams"
                        title="Configure security parameters related to pairing"
                        onSelect={onShowSecurityParamsDialog}
                    >
                        Security parameters...
                    </Dropdown.Item>
                    <Dropdown.Item
                        key="autoAcceptPairing"
                        title="Automatically accept security requests"
                        onSelect={onToggleAutoAcceptPairing}
                    >
                        <i className={iconCheckmarkPairing} />
                        Auto reply security requests
                    </Dropdown.Item>
                    <Dropdown.Item
                        key="deleteBondInfo"
                        title="Delete bond information"
                        onSelect={onDeleteBondInfo}
                    >
                        Delete bond information
                    </Dropdown.Item>
                </>
            )}
            {onOpenCustomUuidFile && (
                <>
                    <Dropdown.Divider key="dividerOpenUuidFile" />
                    <Dropdown.Header key="headerOpenUuidFile">
                        Custom UUID definitions
                    </Dropdown.Header>
                    <Dropdown.Item
                        key="openUuidFile"
                        title="Open custom UUID definitions file in default text editor"
                        onSelect={onOpenCustomUuidFile}
                    >
                        Open UUID definitions file
                    </Dropdown.Item>
                </>
            )}
        </Dropdown.Menu>
    );

    return (
        <div id={id} className="device main-device standalone" style={style}>
            <img
                className="center-block"
                src={icon}
                height={41}
                width={16}
                title="Development kit or dongle"
                alt=""
            />
            <div className="device-body text-small">
                <div className="pull-right">
                    <Dropdown id="connectionDropDown">
                        <Dropdown.Toggle>
                            <span className="mdi mdi-settings" />
                        </Dropdown.Toggle>
                        {dropDownMenu}
                    </Dropdown>
                </div>
                <div>
                    <div className="role-flag pull-right">Adapter</div>
                    {name ? (
                        <strong className="selectable">{name}</strong>
                    ) : (
                        <Spinner visible />
                    )}
                </div>
                <div className="address-text selectable">{address}</div>
                <div
                    className={`mdi mdi-signal-variant ${iconOpacity}`}
                    aria-hidden="true"
                    title={advIconTitle}
                    style={progressStyle}
                />
                <AdvertisingSetup />
                <SecurityParamsDialog />
            </div>
        </div>
    );
};

CentralDevice.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    address: PropTypes.string,
    advertising: PropTypes.bool,
    onToggleAdvertising: PropTypes.func,
    onShowSecurityParamsDialog: PropTypes.func,
    security: PropTypes.object,
    onShowSetupDialog: PropTypes.func,
    onSaveSetup: PropTypes.func,
    onLoadSetup: PropTypes.func,
    autoConnUpdate: PropTypes.bool,
    onToggleAutoConnUpdate: PropTypes.func,
    onToggleAutoAcceptPairing: PropTypes.func,
    onDeleteBondInfo: PropTypes.func,
    onOpenCustomUuidFile: PropTypes.func,
    isDeviceDetails: PropTypes.bool,
    bindHotkey: PropTypes.func.isRequired,
};

CentralDevice.defaultProps = {
    name: '',
    address: null,
    advertising: false,
    onToggleAdvertising: null,
    onShowSecurityParamsDialog: null,
    security: null,
    onShowSetupDialog: null,
    onSaveSetup: undefined,
    onLoadSetup: undefined,
    autoConnUpdate: false,
    onToggleAutoConnUpdate: null,
    onToggleAutoAcceptPairing: null,
    onDeleteBondInfo: null,
    onOpenCustomUuidFile: null,
    isDeviceDetails: false,
};

export default withHotkey(CentralDevice);
