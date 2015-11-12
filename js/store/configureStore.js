'use strict';

import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import createLogger from 'redux-logger';
import DevTools from '../containers/DevTools';

import rootReducer from '../reducers';

/*
function stateToJS(state) {
  return Object.keys(state).reduce((acc, key) => {
    return {...acc, [key]: state[key].toJS()};
  }, {});
} */

export default function configureStore(initialState) {
    const middleware = [
        thunkMiddleware
    ];

    const isProduction = process.env.NODE_ENV === 'production';

    let finalCreateStore;

    if(isProduction) {
        finalCreateStore = applyMiddleware(...middleware)(createStore);
    } else {
        const logger = createLogger({
            collapsed: true
        });

        // Logger must be the last middleware in chain.
        middleware.push(logger);

        finalCreateStore = compose(
            applyMiddleware(...middleware),
            DevTools.instrument()
        )(createStore);
    }

    const store = finalCreateStore(rootReducer, initialState);

    // Check if we can hot reload, if so we hot replace reducers
    if (module.hot) {
        module.hot.accept('../reducers', () =>
          store.replaceReducer(require('../reducers'))
        );
    }

    return store;
}
