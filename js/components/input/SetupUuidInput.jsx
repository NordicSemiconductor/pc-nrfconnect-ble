'use strict';

import React, { PropTypes } from 'react';

import SetupInput from './SetupInput';
import UuidLookup from '../UuidLookup';

import { getUuidName } from '../../utils/uuid_definitions';
import { validateUuid } from '../../utils/validateUuid';

export default class SetupUuidInput extends SetupInput {
    constructor(props) {
        super(props);
        this.uuid = this.props.value;
    }

    validateUuidInput() {
        return validateUuid(this.uuid);
    }

    _onUuidChange(uuid) {
        const _hexRegEx = /^[0-9A-F]*$/i;
        const valid = _hexRegEx.test(uuid);

        if (!valid) {
            return;
        }

        this.uuid = uuid;
        let uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.value = uuid;

        this.props.handleSelection(uuid);
        this.forceUpdate();
    }

    _handleUuidSelect(event, eventKey) {
        this._onUuidChange(eventKey);
    }

    render () {
        const {
            label,
            uuidDefinitions,
            value,
        } = this.props;

        const uuidSelectButton = (
            <UuidLookup onSelect={(event, eventKey) => this._handleUuidSelect(event, eventKey)}
                title={'Predefined ' + label + 's'} uuidDefs={uuidDefinitions}
                pullRight={true}/>
        );

        return <SetupInput label={label} { ...this.pros }
            hasFeedback bsStyle={this.validateUuidInput()}
            value={value}
            onChange={e => this._onUuidChange(e.target.value)}
            buttonAfter={uuidSelectButton} />;
    }
}

SetupUuidInput.propTypes = {
    uuidDefinitions: PropTypes.object.isRequired,
    handleSelection: PropTypes.func.isRequired,
};
