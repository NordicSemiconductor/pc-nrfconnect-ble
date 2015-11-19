'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import {Button} from 'react-bootstrap';

import AdvListEntry from './AdvListEntry';

export default class AdvertisingList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            title,
            advEntries,
            onDelete,
            onClear,
        } = this.props;

        return (
            <div className="adv-table-container">
                <div className="adv-header">{title}</div>
                <table className="table-striped">
                    <thead>
                        <tr>
                            <th>AD type</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {advEntries.map(entry => 
                            <AdvListEntry {...{entry}} key={entry.id} 
                                onDelete={onDelete} 
                                onClear={onClear} />)}
                    </tbody>
                </table>
            </div>
        );
    }
}

AdvertisingList.propTypes = {
    title: PropTypes.string.isRequired,
    advEntries: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
}
