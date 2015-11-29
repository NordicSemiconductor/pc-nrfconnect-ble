'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import {Button} from 'react-bootstrap';

export default class AdvertisingListEntry extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            entry,
            onDelete,
        } = this.props;

        return (
            <tr>
                <td>{entry.type}</td>
                <td>{entry.value}</td>
                <td><Button bsSize='small' onClick={() => onDelete(entry.id)}>Delete</Button></td>
            </tr>
        );
    }
}

AdvertisingListEntry.propTypes = {
    entry: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};
