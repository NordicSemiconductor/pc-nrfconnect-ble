/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

jest.mock('pc-ble-driver-js', () => {});

import React from 'react';
import { mount } from 'enzyme';
import { getImmutableDevice } from '../../utils/api';
import ConnectedDevice from '../ConnectedDevice';

describe('ConnectedDevice', () => {
    describe('when DFU button is clicked', () => {
        const onClickDfu = jest.fn();
        const device = getImmutableDevice({});
        const wrapper = mountComponent({
            isDfuSupported: true,
            device,
            onClickDfu,
        });
        wrapper.find('[id="dfuButton"]').simulate('click');

        it('should call onClickDfu', () => {
            expect(onClickDfu).toHaveBeenCalled();
        });
    });

    describe('when update connection is clicked', () => {
        const onConnectionParamsUpdate = jest.fn();
        const device = getImmutableDevice({});
        const wrapper = mountComponent({
            device,
            onConnectionParamsUpdate,
        });
        wrapper.find('[id="updateConnectionMenuItem"]').simulate('click');

        it('should call onConnectionParamsUpdate', () => {
            expect(onConnectionParamsUpdate).toHaveBeenCalledWith(device);
        });
    });

    describe('when disconnect is clicked', () => {
        const onDisconnect = jest.fn();
        const wrapper = mountComponent({
            onDisconnect,
        });
        wrapper.find('[id="disconnectMenuItem"]').simulate('click');

        it('should call onDisconnect', () => {
            expect(onDisconnect).toHaveBeenCalled();
        });
    });

    describe('when pair is clicked', () => {
        const onPair = jest.fn();
        const wrapper = mountComponent({
            onPair,
        });
        wrapper.find('[id="pairMenuItem"]').simulate('click');

        it('should call onPair', () => {
            expect(onPair).toHaveBeenCalled();
        });
    });
});

function mountComponent(props) {
    return mount(<ConnectedDevice
        id="connected-device-id"
        device={getImmutableDevice({})}
        sourceId="source-id"
        layout="vertical"
        onDisconnect={() => {}}
        onPair={() => {}}
        onConnectionParamsUpdate={() => {}}
        {...props}
    />)
}
