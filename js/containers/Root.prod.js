'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { Provider } from 'react-redux';
import App from './App';

export default class Root extends Component {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
};
