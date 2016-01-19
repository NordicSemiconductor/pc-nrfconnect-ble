/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

 /*jslint browser:true */

'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { Dropdown, MenuItem } from 'react-bootstrap';

import AdvertisingSetup from '../containers/AdvertisingSetup';

export default class CentralDevice extends Component {
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
        const iconCheckmark = autoConnUpdate ? 'icon-ok' : '';

        return (
            <div id={id} className='device main-device standalone' style={style}>
                <img className='center-block' src='resources/nordic_usb_icon.png' height='41' width='16'/>
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
                                        if (advertising !== undefined) {
                                            items.push(<MenuItem key="setup" eventKey='AdvertisingSetup'>Advertising setup...</MenuItem>);
                                        }

                                        items.push(<MenuItem key="advertising" eventKey='ToggleAdvertising'>{advMenuText} <span className='subtler-text'>(Alt+A)</span></MenuItem>);
                                    }

                                    if (onLoadSetup !== undefined) {
                                        items.push(<MenuItem key="load" eventKey='LoadSetup'>Load setup...</MenuItem>);
                                    }

                                    if (onSaveSetup !== undefined) {
                                        items.push(<MenuItem key="save" eventKey='SaveSetup'>Save setup...</MenuItem>);
                                    }

                                    if (onToggleAutoConnUpdate !== undefined) {
                                        items.push(<MenuItem key='divider' divider />);
                                        items.push(<MenuItem key='autoConnUpdate'
                                            title='Automatically respond to connection update requests'
                                            eventKey='ToggleAutoConnUpdate'><i className={iconCheckmark} />Auto connection update response</MenuItem>);
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
                </div>
            </div>
        );
    }
}

CentralDevice.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    advertising: PropTypes.bool,
    onToggleAdvertising: PropTypes.func,
    onShowSetupDialog: PropTypes.func,
    onSaveSetup: PropTypes.func,
    onLoadSetup: PropTypes.func,
    autoConnUpdate: PropTypes.bool,
    onToggleAutoConnUpdate: PropTypes.func,
};
