'use strict';

import { Input } from 'react-bootstrap';

export default class SetupInputGroup extends Input {
    constructor(props) {
        super(props);
    }
}

SetupInputGroup.defaultProps = {
    labelClassName: 'col-md-3',
    wrapperClassName: 'col-md-9',
};
