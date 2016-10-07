import React, { PropTypes } from 'react';

export default class Spinner extends React.PureComponent {
    static propTypes = {
        image: PropTypes.string.isRequired,
        size: PropTypes.number,
        visible: PropTypes.bool,
        className: PropTypes.string
    };

    static defaultProps = {
        size: 16,
        visible: false,
        className: 'spinner'
    };

    render() {
        const { image, size, visible, className } = this.props;
        const style = {
            visibility: visible ? 'visible' : 'hidden'
        };

        return (
            <img className={className} src={image} height={size} width={size} style={style} />
        );
    }
}
