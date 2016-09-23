const actions = {
    errorDialogActions: require('./actions/errorDialogActions')
};

const components = {
    LabeledInputGroup: require('./components/input/LabeledInputGroup'),
    SelectList: require('./components/input/SelectList'),
    TextArea: require('./components/input/TextArea'),
    TextInput: require('./components/input/TextInput')
};

const containers = {
    DevTools: require('./containers/DevTools').default,
    ErrorDialog: require('./containers/ErrorDialog').default
};

const reducers = {
    errorDialogReducer: require('./reducers/errorDialogReducer')
};

const store = {
    configureStore: require('./store/configureStore')
};

module.exports = Object.assign({},
    actions,
    components,
    containers,
    reducers,
    store
);
