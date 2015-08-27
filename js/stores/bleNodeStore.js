'use strict';

import reflux from 'reflux';
import _ from 'underscore';

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
    onAddNode: function(data) {

      console.log("Adding node ", JSON.stringify(data));
      var newNodeId = 'node' + this.idCounter++;

      this.state.graph.push({id: newNodeId, deviceId: data.peer_addr.address, device: data});
      var centralNode = this._findCentralNode();
      centralNode.ancestorOf.push(newNodeId);
      this.trigger(this.state.graph, {remove: false, nodeId: newNodeId});
    },
    onRemoveNode: function(deviceAddress) {
      console.log('removing node');
      var node = _.find(this.state.graph, function(node){
        return node.deviceId === deviceAddress;
      });

      var centralNode = this._findCentralNode();
      centralNode.ancestorOf = _.reject(centralNode.ancestorOf, function(nodeId){
        return nodeId === node.id;
      });

      this.state.graph = _.reject(this.state.graph, function(node){
        return node.deviceId === deviceAddress;
      });
      this.trigger(this.state.graph, {remove: true, nodeId: node.id});
    },

    _findCentralNode: function() {
      return _.find(this.state.graph, function(node) {
        return node.id === 'central';
      });
    }
});

module.exports = bleNodeStore;
