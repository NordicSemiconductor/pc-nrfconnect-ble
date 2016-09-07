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
import { Dropdown, MenuItem } from 'react-bootstrap';

import AdvertisingSetup from '../containers/AdvertisingSetup';
import SecurityParamsDialog from '../containers/SecurityParamsDialog';

export default class CentralDevice extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    _onSelect(event, eventKey) {
        const {
            onToggleAdvertising,
            onShowSetupDialog,
            onSaveSetup,
            onLoadSetup,
            onToggleAutoConnUpdate,
            onToggleAutoAcceptPairing,
            onDeleteBondInfo,
            onShowSecurityParamsDialog,
            onOpenCustomUuidFile,
        } = this.props;

        switch (eventKey) {
            case 'ToggleAdvertising':
                onToggleAdvertising();
                break;
            case 'AdvertisingSetup':
                onShowSetupDialog();
                break;
            case 'SaveSetup':
                onSaveSetup();
                break;
            case 'LoadSetup':
                onLoadSetup();
                break;
            case 'ToggleAutoConnUpdate':
                onToggleAutoConnUpdate();
                break;
            case 'ToggleAutoAcceptPairing':
                onToggleAutoAcceptPairing();
                break;
            case 'DeleteBondInfo':
                onDeleteBondInfo();
                break;
            case 'SetSecurityParams':
                onShowSecurityParamsDialog();
                break;
            case 'OpenCustomUuidFile':
                onOpenCustomUuidFile();
                break;
            default:
                console.log('Unknown eventKey received: ' + eventKey);
        }
    }

    render() {
        const {
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
            onDeleteBondInfo,
            onShowSecurityParamsDialog,
            onOpenCustomUuidFile,
            security,
        } = this.props;

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
        const iconCheckmarkConnUpdate = autoConnUpdate ? 'icon-ok' : '';
        const iconCheckmarkPairing = (security && security.autoAcceptPairing) ? 'icon-ok' : '';

        return (
            <div id={id} className='device main-device standalone' style={style}>
                <img className='center-block' src='resources/nordic_usb_icon.png' height='41' width='16' title="Development kit or dongle"/>
                <div className='device-body text-small'>
                    <div className='pull-right'>
                        <Dropdown id='connectionDropDown' onSelect={(event, eventKey) => { this._onSelect(event, eventKey); }}>
                            <Dropdown.Toggle noCaret>
                                <span className='icon-cog' aria-hidden='true' />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {(() => {
                                    const items = [];

                                    if (onToggleAdvertising !== undefined) {
                                        items.push(<MenuItem key='advHeader' header>Advertising</MenuItem>);
                                        if (advertising !== undefined) {
                                            items.push(<MenuItem key='setup' eventKey='AdvertisingSetup'>Advertising setup...</MenuItem>);
                                        }

                                        items.push(<MenuItem key='advertising' eventKey='ToggleAdvertising'>{advMenuText} <span className='subtler-text'>(Alt+A)</span></MenuItem>);
                                    }

                                    if (onLoadSetup !== undefined) {
                                        items.push(<MenuItem key='load' eventKey='LoadSetup'>Load setup...</MenuItem>);
                                    }

                                    if (onSaveSetup !== undefined) {
                                        items.push(<MenuItem key='save' eventKey='SaveSetup'>Save setup...</MenuItem>);
                                    }

                                    if (onToggleAutoConnUpdate !== undefined) {
                                        items.push(<MenuItem key='dividerConnUpdate' divider />);
                                        items.push(<MenuItem key='connUpdateHeader' header>Connection update</MenuItem>);
                                        items.push(<MenuItem key='autoConnUpdate'
                                            title='Automatically accept connection update requests'
                                            eventKey='ToggleAutoConnUpdate'><i className={iconCheckmarkConnUpdate} />Auto accept update requests</MenuItem>);
                                    }

                                    if (onToggleAutoAcceptPairing !== undefined && onShowSecurityParamsDialog !== undefined) {
                                        items.push(<MenuItem key='dividerSecurity' divider />);
                                        items.push(<MenuItem key='securityHeader' header>Security</MenuItem>);
                                        items.push(<MenuItem key='setSecurityParams'
                                            title='Configure security parameters related to pairing'
                                            eventKey='SetSecurityParams'>Security parameters...</MenuItem>);
                                        items.push(<MenuItem key='autoAcceptPairing'
                                            title='Automatically accept security requests'
                                            eventKey='ToggleAutoAcceptPairing'><i className={iconCheckmarkPairing} />Auto reply security requests</MenuItem>);
                                        items.push(<MenuItem key='deleteBondInfo'
                                            title='Delete bond information'
                                            eventKey='DeleteBondInfo'>Delete bond information</MenuItem>);
                                    }

                                    if (onOpenCustomUuidFile !== undefined) {
                                        items.push(<MenuItem key='dividerOpenUuidFile' divider />);
                                        items.push(<MenuItem key='headerOpenUuidFile' header>Custom UUID definitions</MenuItem>);
                                        items.push(<MenuItem key='openUuidFile'
                                            title='Open custom UUID definitions file in default text editor'
                                            eventKey='OpenCustomUuidFile'>Open UUID definitions file</MenuItem>);
                                    }

                                    return items;
                                })()}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div>
                        <div className='role-flag pull-right'>Adapter</div>
                        <strong>{name}</strong>
                    </div>
                    <div className='address-text'>{address}</div>
                    <div className={'icon-wifi ' + iconOpacity} aria-hidden='true' title={advIconTitle} style={progressStyle} />
                    <AdvertisingSetup />
                    <SecurityParamsDialog />
                </div>
            </div>
        );
    }
}

CentralDevice.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    address: PropTypes.string,
    advertising: PropTypes.bool,
    onToggleAdvertising: PropTypes.func,
    onShowSetupDialog: PropTypes.func,
    onSaveSetup: PropTypes.func,
    onLoadSetup: PropTypes.func,
    autoConnUpdate: PropTypes.bool,
    autoAcceptPairing: PropTypes.bool,
    onToggleAutoConnUpdate: PropTypes.func,
    onToggleAutoAcceptPairing: PropTypes.func,
    onDeleteBondInfo: PropTypes.func,
    onOpenCustomUuidFile: PropTypes.func,
};
