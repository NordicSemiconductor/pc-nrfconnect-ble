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

import '../../css/components/appmodule-list-item.less';

import React, { PropTypes } from 'react';

export default class AppmoduleListItem extends React.PureComponent {

    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired
    };

    render() {
        const { title, description, icon, onClick } = this.props;

        return (
            <a href="#" className="list-group-item" onClick={onClick}>
                <div className="appmodule-list-item">
                    <div>
                        <img className="appmodule-icon" src={icon} />
                    </div>
                    <div>
                        <h4 className="list-group-item-heading">{title}</h4>
                        <p className="list-group-item-text">{description}</p>
                    </div>
                </div>
            </a>
        );
    }
}
