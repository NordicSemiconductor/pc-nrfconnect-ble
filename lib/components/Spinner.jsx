import React, { PropTypes } from 'react';

const Spinner = props => {
    const { size, visible, className } = props;
    const style = {
        visibility: visible ? 'visible' : 'hidden',
    };

    const spinnerImg = require('../../resources/ajax-loader.gif'); // eslint-disable-line

    return (
        <img
            alt="" className={className} src={spinnerImg}
            height={size} width={size} style={style}
        />
    );
};

Spinner.propTypes = {
    size: PropTypes.number,
    visible: PropTypes.bool,
    className: PropTypes.string,
};

Spinner.defaultProps = {
    size: 16,
    visible: false,
    className: 'spinner',
};

export default Spinner;
