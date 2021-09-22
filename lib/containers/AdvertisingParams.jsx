/* eslint-disable react/state-in-constructor */
/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as AdvertisingActions from '../actions/advertisingActions';
import AdvertisingParamsControl from '../components/AdvertisingParamsControl';

class AdvertisingParams extends React.PureComponent {
    state = {
        advParams: null,
    };

    handleAdvParamsChange = advParams => this.setState({ advParams });

    handleApply() {
        const { setAdvParams, hideAdvParamDialog } = this.props;
        const { advParams } = this.state;

        if (
            !advParams ||
            !advParams.interval ||
            (!advParams.timeout && advParams.timeout !== 0)
        )
            return;

        setAdvParams(advParams);
        hideAdvParamDialog();
    }

    handleCancel() {
        const { hideAdvParamDialog } = this.props;
        hideAdvParamDialog();
    }

    render() {
        const { showAdvParams, advParams } = this.props;

        return (
            <Modal
                className="adv-param-modal"
                show={showAdvParams}
                onHide={() => {
                    this.handleCancel();
                }}
            >
                <Modal.Header>
                    <Modal.Title>Advertising parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AdvertisingParamsControl
                        onChange={this.handleAdvParamsChange}
                        advParams={advParams}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <div className="form-group">
                        <Button
                            type="button"
                            onClick={() => this.handleApply()}
                            className="btn btn-primary btn-sm btn-nordic"
                        >
                            Apply
                        </Button>
                        <Button
                            type="button"
                            onClick={() => this.handleCancel()}
                            className="btn btn-default btn-sm btn-nordic"
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    const { advertising } = state.app;

    return {
        showAdvParams: advertising.showAdvParams,
        advParams: advertising.advParams,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(AdvertisingActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvertisingParams);

AdvertisingParams.propTypes = {
    advParams: PropTypes.object,
    showAdvParams: PropTypes.bool.isRequired,
    hideAdvParamDialog: PropTypes.func.isRequired,
    setAdvParams: PropTypes.func.isRequired,
};
