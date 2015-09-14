'use strict';

import reflux from 'reflux';
import _ from 'underscore';

import logger from '../logging';
import bleGraphActions from '../actions/bleGraphActions';

var bleNodeStore = reflux.createStore({
    listenables: [bleGraphActions],
    init: function(){
        this.idCounter = 0;
        this.state = {graph: [
          {id: 'central', ancestorOf: []}]};
    },


    getInitialState: function() {
        return this.state;
    },
    onAddNode: function(connectedDevice, newConnection) {

      logger.silly("Adding node ", JSON.stringify(connectedDevice));
      var newNodeId = 'node' + this.idCounter++;

      if(connectedDevice.peer_addr === undefined) return;
      if(connectedDevice.peer_addr.address === undefined) return;
      connectedDevice.connection = newConnection;
      this.state.graph.push({id: newNodeId, deviceId: connectedDevice.peer_addr.address, device: connectedDevice});
      var centralNode = this._findCentralNode();

      if(centralNode === undefined) {
          logger.silly('Central node not found.');
          return;
      }

      centralNode.ancestorOf.push(newNodeId);
      this.trigger(this.state.graph, {remove: false, nodeId: newNodeId, device: connectedDevice, connection: newConnection});
    },
    onRemoveNode: function(deviceAddress) {
        logger.silly('removing node');
        var node = _.find(this.state.graph, function(node){
            return node.deviceId === deviceAddress;
        });

        if(node === undefined) return;

        node.connectionLost = true;
        var that = this;
        var timeout = setTimeout(function() {
            var centralNode = that._findCentralNode();
            centralNode.ancestorOf = _.reject(centralNode.ancestorOf, function(nodeId){
                return nodeId === node.id;
            });

            that.state.graph = _.reject(that.state.graph, function(theNode){
                return node.id === theNode.id;
            });
            that.trigger(that.state.graph, {remove: true, nodeId: node.id});
        }, 5000);
        //TODO: clear timeout if node is found again
        this.trigger(this.state.graph, {remove: undefined, nodeId: node.id});
    },

    _findCentralNode: function() {
      return _.find(this.state.graph, function(node) {
        return node.id === 'central';
      });
    }
});

module.exports = bleNodeStore;
