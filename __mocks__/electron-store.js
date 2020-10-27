export const mockSetFn = jest.fn();

const defaultStoreValues = {
    Security: {
        io_caps: 1,
        lesc: false,
        mitm: false,
        oob: false,
        keypress: false,
        bond: false,
        io_caps_title: 'Display and yes no entry',
    },
};

const Store = jest.fn().mockImplementation(() => ({
    get: key => defaultStoreValues[key],
    set: mockSetFn,
}));

export default Store;
