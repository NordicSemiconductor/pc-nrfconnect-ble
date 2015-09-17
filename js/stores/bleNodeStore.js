/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

import reflux from 'reflux';
import _ from 'underscore';

import logger from '../logging';
import bleGraphActions from '../actions/bleGraphActions';

var bleNodeStore = reflux.createStore({
    listenables: [bleGraphActions],
    init: function(){
        this.idCounter = 0;
        this.graph = [{id: 'central', ancestorOf: []}];
    },
    getInitialState: function() {
        return {graph: this.graph};
    },
    onAddNode: function(connectedDevice, newConnection) {
      var newNodeId = 'node' + this.idCounter++;
      logger.debug("Adding node " + newNodeId);
      if(connectedDevice.peer_addr === undefined) return;
      if(connectedDevice.peer_addr.address === undefined) return;

      // If the device already exists in the node.connectionLost state we keep the existing node
      let oldNode = _.find(this.graph, function(node) {
          return node.deviceId === connectedDevice.peer_addr.address;
      });

      if(oldNode !== undefined) {
          console.log('Old node found, reusing it');
          oldNode.connectionLost = false;
      } else {
          connectedDevice.connection = newConnection;

          this.graph.push({id: newNodeId, deviceId: connectedDevice.peer_addr.address, device: connectedDevice});
          var centralNode = this._findCentralNode();

          if(centralNode === undefined) {
              logger.silly('Central node not found.');
              return;
          }

          centralNode.ancestorOf.push(newNodeId);
      }

      this.trigger({graph: this.graph});
    },
    onRemoveNode: function(deviceAddress) {
        var node = _.find(this.graph, function(node){
            return node.deviceId === deviceAddress;
        });

        if (node === undefined) {
            return;
        }

        logger.debug('removing node ' + node.id);

        node.connectionLost = true;
        var that = this;
        var thatDeviceAddress = deviceAddress;

        setTimeout(function() {
            // Before we tro to delete this node we check if it has reconnected. If it
            // has reconnected we keep it.
            let oldNode = _.find(that.graph, function(node) {
                return node.deviceId === thatDeviceAddress;
            });

            if(oldNode !== undefined && oldNode.connectionLost == false) {
              return;
            }

            var centralNode = that._findCentralNode();
            centralNode.ancestorOf = _.reject(centralNode.ancestorOf, function(nodeId){
                return nodeId === node.id;
            });

            that.graph = _.reject(that.graph, function(theNode){
                return node.id === theNode.id;
            });

            that.trigger({graph: that.graph});
        }, 5000);
        this.trigger({graph: this.graph});
    },
    _findCentralNode: function() {
      return _.find(this.graph, function(node) {
        return node.id === 'central';
      });
    }
});

module.exports = bleNodeStore;
