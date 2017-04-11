import React, { PropTypes } from 'react';

const Spinner = props => {
    const { image, size, visible, className } = props;
    const style = {
        visibility: visible ? 'visible' : 'hidden',
    };

    return (
        <img alt="" className={className} src={image} height={size} width={size} style={style} />
    );
};

Spinner.propTypes = {
    image: PropTypes.string.isRequired,
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
