'use strict';

import thunkMiddleware from 'redux-thunk';
import { compose, createStore, applyMiddleware } from 'redux';
import { persistState } from 'redux-devtools';
import DevTools from '../containers/DevTools';

import rootReducer from '../reducers';

const finalCreateStore = compose(
    applyMiddleware(thunkMiddleware),
    DevTools.instrument(),
/*    persistState(
        window.location.href.match(
            /[?&]debug_session=([^&]+)\b/
        )
    ) */
)(createStore);

export default function configureStore(initialState) {
    const store = finalCreateStore(rootReducer, initialState);

    // Check if we can hot reload, if so we hot replace reducers
    if (module.hot) {
        module.hot.accept('../reducers', () =>
          store.replaceReducer(require('../reducers'))
        );
    }

    return store;
}
