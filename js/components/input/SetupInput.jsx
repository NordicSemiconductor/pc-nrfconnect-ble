'use strict';

import { Input } from 'react-bootstrap';

export default class SetupInput extends Input {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.type === 'checkbox') {
            this.props.wrapperClassName = 'col-xs-offset-3 col-xs-9';
            this.props.labelClassName = '';
        }

        return super.render();
    }
}

SetupInput.defaultProps = {
    labelClassName: 'col-md-3',
    wrapperClassName: 'col-md-9',
    type: 'text',
};
