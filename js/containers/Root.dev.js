'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { Provider } from 'react-redux';
// import DevTools from './DevTools';
import App from './App';

// NOTE: Add <DevTools /> as sibling to <App /> to timetravel.

export default class Root extends Component {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <div>
                    <App />
                </div>
            </Provider>
        );
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
};
