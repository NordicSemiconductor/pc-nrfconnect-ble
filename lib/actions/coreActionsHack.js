export const coreApi = {};

export const initializeApp = api => {
    coreApi.logger = api.logger;
    coreApi.electron = api.electron;
};
