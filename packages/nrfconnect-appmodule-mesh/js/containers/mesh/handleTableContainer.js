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

import _ from 'underscore';
import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {changeBase} from '../../components/mesh/HexDecInput';

import * as AdapterActions from '../../actions/mesh/meshAdapterActions';

import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { PageHeader, Button, Tab, Tabs, Checkbox, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import {toHexString} from '../../utils/stringUtil';


class HandleTableContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            isHandleTableVisible,
            listOfHandlesAndData,
            mySortFunc,
            onAfterSaveCell,
            resetDataOnHandles,
            toggleVisibilityHandleTable,
            setFlagOn,
            setTx,
        } = this.props;

        let cellEditProp = {
            mode: "click",
            blurToSave: true,
            afterSaveCell: onAfterSaveCell
        };

        let rowsSelected = [];

        function onRowSelect(row, isSelected) {
            if (isSelected) {
                rowsSelected.push(row);
            } else {
                for (let i = rowsSelected.length - 1; i >= 0; i--) {
                    if (rowsSelected[i] === row) {
                        rowsSelected.splice(i, 1);
                        break;
                    }
                }
            }
        }

        function onSelectAll(isSelected) {
            if (isSelected) {
                for (let row of listOfHandlesAndData) {
                    rowsSelected.push(row)
                }
            } else {
                rowsSelected = [];
            }
        }
        let selectRowProp = {
            mode: "checkbox",
            clickToSelect: true,
            bgColor: "rgb(238, 193, 213)",
            onSelect: onRowSelect,
            onSelectAll: onSelectAll
        };


        if (!isHandleTableVisible) {
            return <div />;
        }

        //TODO Get the screen dim and make this dynamicc
        return (
            <div className="handleTable" >

                <div style={{ backgroundColor: 'white', padding: '20px' }} >
                    <Button bsSize="xsmall" style={{ position: 'absolute', right: '3', top: '3' }} onClick={toggleVisibilityHandleTable} > <span className="icon-cancel" /> </Button>
                    <BootstrapTable height="360" data={listOfHandlesAndData} selectRow={selectRowProp} striped={true} hover={true} cellEdit={cellEditProp}>
                        <TableHeaderColumn dataField="handleId" isKey={true} dataAlign="center" dataSort={true} sortFunc={mySortFunc}>Handle ID</TableHeaderColumn>
                        <TableHeaderColumn dataField="data" >Data</TableHeaderColumn>
 
                    </BootstrapTable>
                    <Button bsStyle="danger" style={{ margin: '4px' }} label="refresh" onClick={() => {
                        resetDataOnHandles(rowsSelected);
                    } }
                        > Delete selected data</Button>


                </div >
            </div >
        );
    }
}

function mapStateToProps(state, ownProps) {
    const {
        meshMain,
    } = state;

    const handles = (meshMain.get('handleAndData') !== undefined) ? meshMain.get('handleAndData') : false;



    let listOfHandlesAndData = [];
    const handlesJS = handles.toJS();
    for (let handle in handlesJS) {
        if (handlesJS.hasOwnProperty(handle)) {
            const handleId = changeBase('Dec', handle);
            const dataValue = '0x' + toHexString(handlesJS[handle].data);
            const isFlagSet = (handlesJS[handle].isFlagSet) ? "True" : "False"
            const d = new Date(handlesJS[handle].timestamp);
            const stringTime = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
            const timestamp = (stringTime !== 'NaN:NaN:NaN') ? stringTime : 'Waiting for TX';
            const isTxSet = (handlesJS[handle].isTxSet) ? timestamp : "Not tracking"
            listOfHandlesAndData.push({ handleId: handleId, data: dataValue, isFlagSet: isFlagSet, isTxSet: isTxSet });
        }
    }
    let isHandleTableVisible = (meshMain.get('isHandleTableVisible') !== undefined) ? meshMain.get('isHandleTableVisible') : false;

    //Not yet implementet with order. DESC.
    function mySortFunc(inA, inB, order) {
        let portA = inA.handleId;
        let portB = inB.handleId;

        if (portA.length > portB.length) { return 1; }
        if (portA.length < portB.length) { return -1; }

        // Use regulart text comparison on names of equal length
        if (portA > portB) {
            return 1;
        } else if (portA < portB) {
            return -1;
        } else {
            return 0;
        }
    }

    return {
        listOfHandlesAndData: listOfHandlesAndData,
        isHandleTableVisible: isHandleTableVisible,
        mySortFunc: mySortFunc,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HandleTableContainer);

HandleTableContainer.propTypes = {

};



// too advanced for intro app

                    //    <TableHeaderColumn editable={false} dataField="isFlagSet" >Flag</TableHeaderColumn>
                    //     <TableHeaderColumn editable={false} dataField="isTxSet" >TX</TableHeaderColumn>



// <Button bsStyle="info" style={{ margin: '4px' }} label="set flag on selected handles" onClick={() => {
//     setFlagOn(rowsSelected, true);
// } }
//     > Set flag</Button>
//     <Button bsStyle="info" style={{ margin: '4px' }} label="remove flag on selected handles" onClick={() => {
//         setFlagOn(rowsSelected, false);
//     } }
//         > Remove flag
//     </Button>

//     <Button bsStyle="info" style={{ margin: '4px' }} label="set Tx on selected handles" onClick={() => {
//         setTx(rowsSelected, true);
//     } }
//         > Set Tx
//     </Button>