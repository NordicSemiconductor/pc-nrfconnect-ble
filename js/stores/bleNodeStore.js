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
      connectedDevice.connection = newConnection;
      this.graph.push({id: newNodeId, deviceId: connectedDevice.peer_addr.address, device: connectedDevice});
      var centralNode = this._findCentralNode();

      if(centralNode === undefined) {
          logger.silly('Central node not found.');
          return;
      }

      centralNode.ancestorOf.push(newNodeId);
      this.trigger({graph: this.graph});
    },
    onRemoveNode: function(deviceAddress) {
        var node = _.find(this.graph, function(node){
            return node.deviceId === deviceAddress;
        });
        logger.debug('removing node ' + node.id);
        if (node === undefined) {
            return;
        }

        node.connectionLost = true;
        var centralNode = this._findCentralNode();
        centralNode.ancestorOf = _.reject(centralNode.ancestorOf, function(nodeId){
            return nodeId === node.id;
        });

        this.graph = _.reject(this.graph, function(theNode){
            return node.id === theNode.id;
        });
        //that.trigger(that.state.graph, {remove: true, nodeId: node.id})

        //TODO: clear timeout if node is found again
        this.trigger({graph: this.graph});
    },

    _findCentralNode: function() {
      return _.find(this.graph, function(node) {
        return node.id === 'central';
      });
    }
});

module.exports = bleNodeStore;
