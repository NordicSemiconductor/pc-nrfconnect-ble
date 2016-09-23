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
import Immutable from 'immutable';
import AppmoduleListItem from './AppmoduleListItem';

export default class AppmoduleList extends React.PureComponent {

    constructor(props) {
        super(props);
        this._onAppmoduleClicked = this._onAppmoduleClicked.bind(this);
    }

    static propTypes = {
        appmodules: PropTypes.instanceOf(Immutable.List).isRequired,
        onAppmoduleSelected: PropTypes.func.isRequired
    };

    _onAppmoduleClicked(appmodule) {
        this.props.onAppmoduleSelected(appmodule);
    }

    render() {
        const { appmodules } = this.props;

        return (
            <div>
                <div className="list-group">
                    {
                        appmodules.map(appmodule => {
                            return <AppmoduleListItem
                                key={appmodule.name}
                                title={appmodule.title}
                                description={appmodule.description}
                                icon={appmodule.icon}
                                onClick={() => this._onAppmoduleClicked(appmodule)}
                            />
                        })
                    }
                </div>
            </div>
        );
    }
}
