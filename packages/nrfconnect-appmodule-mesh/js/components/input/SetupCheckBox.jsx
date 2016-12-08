'use strict';

import { Input } from 'react-bootstrap';

export class SetupCheckBox extends Input {
    constructor(props) {
        super(props);
    }
}

SetupCheckBox.defaultProps = {
    wrapperClassName: 'col-sm-offset-3 col-sm-9',
    type: 'checkbox',
};

export class SetupInlineCheckBox extends SetupCheckBox {
    constructor(props) {
        super(props);
    }
}

SetupInlineCheckBox.defaultProps = {
    wrapperClassName: 'col-sm-12',
    className: 'nomargin',
    labelClassName: 'nomargin',
    formClassName: 'nomargin',
    type: 'checkbox',
    groupClassName: 'nomargin',
};
