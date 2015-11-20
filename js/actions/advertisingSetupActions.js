'use strict';

export const ADD_ADVDATA_ENTRY = 'ADVSETUP_ADD_ADVDATA_ENTRY';
export const DELETE_ADVDATA_ENTRY = 'ADVSETUP_DELETE_ADVDATA_ENTRY';
export const ADD_SCANRSP_ENTRY = 'ADVSETUP_ADD_SCANRSP_ENTRY';
export const DELETE_SCANRSP_ENTRY = 'ADVSETUP_DELETE_SCANRSP_ENTRY';
export const SHOW_DIALOG = 'ADVSETUP_SHOW_DIALOG';
export const HIDE_DIALOG = 'ADVSETUP_HIDE_DIALOG';

function addAdvEntryAction(entry) {
    return {
        type: ADD_ADVDATA_ENTRY,
        entry,
    };
}

function deleteAdvDataAction(id) {
    return {
        type: DELETE_ADVDATA_ENTRY,
        id,
    };
}

function addScanRspAction(entry) {
    return {
        type: ADD_SCANRSP_ENTRY,
        entry,
    };
}

function deleteScanRspAction(id) {
    return {
        type: DELETE_SCANRSP_ENTRY,
        id,
    };
}

function showDialogAction() {
    return {
        type: SHOW_DIALOG,
    };
}

function hideDialogAction() {
    return {
        type: HIDE_DIALOG,
    };
}

export function addAdvEntry(entry) {
    return addAdvEntryAction(entry);
}

export function deleteAdvData(id) {
    return deleteAdvDataAction(id);
}

export function addScanRsp(entry) {
    return addScanRspAction(entry);
}

export function deleteScanRsp(id) {
    return deleteScanRspAction(id);
}

export function showDialog() {
    return showDialogAction();
}

export function hideDialog() {
    return hideDialogAction();
}
