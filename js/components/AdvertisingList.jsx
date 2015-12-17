'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import AdvertisingListEntry from './AdvertisingListEntry';

export default class AdvertisingList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            title,
            advEntries,
            onDelete,
        } = this.props;

        return (
            <div className='adv-table-container'>
                <div className='adv-header'>{title}</div>
                <table className='table-striped'>
                    <thead>
                        <tr>
                            <th>AD type</th>
                            <th>Value</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {advEntries.map(entry =>
                            <AdvertisingListEntry {...{entry}} key={entry.id}
                                onDelete={onDelete} />)}
                    </tbody>
                </table>
            </div>
        );
    }
}

AdvertisingList.propTypes = {
    title: PropTypes.string.isRequired,
    advEntries: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};
