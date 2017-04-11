export const hackApi = {
    
};

export const initHackAction = () => (
    (dispatch, getState, coreApi) => {
        hackApi.ble = coreApi.ble;
        hackApi.bleDriver = coreApi.bleDriver;
        hackApi.logger = coreApi.logger;
        hackApi.SerialPort = coreApi.SerialPort;
        hackApi.programming = coreApi.programming;
        hackApi.remote = coreApi.remote;
        hackApi.ipcRenderer = coreApi.ipcRenderer;
        hackApi.shell = coreApi.shell;
        console.log(hackApi);
    }
);
