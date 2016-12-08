/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import {List, Record, Map} from 'immutable';

import * as meshPageSelectorActions from '../../actions/mesh/meshPageSelectorActions';

const ImmutableRoot = Record({
	selectedPage: 'Intro',
})
const getImmutableRoot = () => new ImmutableRoot();

function setPageView(state, page) {
	return state.set('selectedPage', page); 
}

export default function meshPageSelector(state = getImmutableRoot(), action) {
	switch (action.type) {
		case meshPageSelectorActions.SET_PAGE_VIEW:
			return setPageView(state, action.page);
	}
	return state;
}
