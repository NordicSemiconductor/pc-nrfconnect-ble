import React, { PropTypes } from 'react';
import withHotkey from '../utils/withHotkey';

const DiscoveryButton = props => {
    const {
        isAdapterAvailable,
        adapterIsConnecting,
        scanInProgress,
        onScanClicked,
        bindHotkey,
    } = props;

    let labelString;
    let iconName;
    let hoverText;

    if (scanInProgress) {
        labelString = 'Stop scan';
        iconName = 'icon-stop';
        hoverText = 'Stop scan (Alt+S)';
    } else {
        labelString = 'Start scan';
        iconName = 'icon-play';
        hoverText = 'Start scan (Alt+S)';
    }

    bindHotkey('alt+s', onScanClicked);

    return (
        <button
            title={hoverText}
            className="btn btn-primary btn-sm btn-nordic padded-row"
            disabled={!isAdapterAvailable || adapterIsConnecting}
            onClick={() => onScanClicked()}
        >
            <span className={iconName} />
            {labelString}
        </button>
    );
};

DiscoveryButton.propTypes = {
    isAdapterAvailable: PropTypes.bool.isRequired,
    adapterIsConnecting: PropTypes.bool.isRequired,
    scanInProgress: PropTypes.bool.isRequired,
    onScanClicked: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
};

export default withHotkey(DiscoveryButton);
