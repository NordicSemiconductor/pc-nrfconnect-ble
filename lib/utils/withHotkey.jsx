/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Mousetrap from 'mousetrap';

export default ComposedComponent =>
    class WithHotkey extends React.Component {
        constructor(props) {
            super(props);
            this.bindings = [];
            this.bindHotkey = this.bindHotkey.bind(this);
        }

        componentWillUnmount() {
            this.bindings.forEach(key => Mousetrap.unbind(key));
        }

        bindHotkey(key, callback, action) {
            const cb = (event, ...rest) => {
                event.stopPropagation();
                callback(event, ...rest);
            };
            Mousetrap.bind(key, cb, action);
            if (!this.bindings.includes(key)) {
                this.bindings.push(key);
            }
        }

        render() {
            return (
                <ComposedComponent
                    bindHotkey={this.bindHotkey}
                    {...this.props}
                />
            );
        }
    };
