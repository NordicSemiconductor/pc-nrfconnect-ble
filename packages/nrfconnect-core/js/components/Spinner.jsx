import React, { PropTypes } from 'react';
import spinnerImage from '../../resources/ajax-loader.gif';

export default class Spinner extends React.PureComponent {
    static propTypes = {
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
        const { size, visible, className } = this.props;
        const style = {
            visibility: visible ? 'visible' : 'hidden'
        };

        return (
            <img className={className} src={spinnerImage} height={size} width={size} style={style} />
        );
    }
}
