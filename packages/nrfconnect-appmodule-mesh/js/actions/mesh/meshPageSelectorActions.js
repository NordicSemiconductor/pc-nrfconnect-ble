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

import { logger } from '../../logging';

export const SET_PAGE_VIEW = 'SET_PAGE_VIEW'

//----------------Reduser calls----------------
export const setPageViewRed = (page) =>
  dispatch => dispatch({
    type: SET_PAGE_VIEW,
    page
  })

//----------------Export functions----------------

export function setPageView(page) {
  return (dispatch, getState) => {
      dispatch(setPageViewRed(page));
  }
}

export function test() {
        console.log("object");
    }
