
//import hotkey from 'react-hotkey';
import _ from 'underscore';
import {Service} from '../gattDatabases';
//hotkey.activate('keydown');

/*
TreeViewKeyNavigation.mixin(propName) produces a mixin that provides keyboard navigation
up and down the tree located in this[propName].
The currently selected item is stored in this.state.selected

Assumes:
    this.state.selected is the currently selected item
    this[propName] is an array of services

*/

// TODO: evaluate if it is hard to change this code ...

/*
var TreeViewKeyNavigation = {
    mixin: function(gattDatabasesProperty, addButtons) {
        return _.extend({}, hotkey.Mixin('handleHotkey'), {
            handleHotkey: function(e) {
                if (!this[gattDatabasesProperty]) {
                    return;
                }
                if (e.getModifierState('Alt')) {
                    switch(e.key) {
                        case "ArrowUp":
                            this.setState({ selected: this._getPreviousVisible() });
                            e.preventDefault();
                            break;
                        case "ArrowDown":
                            this.setState({ selected: this._getNextVisible() });
                            e.preventDefault();
                            break;
                        case "ArrowRight":
                            if (this.state.selected.expanded) {
                                this.setState({ selected: this._getNextChild() || this.state.selected });
                            }
                            else {
                                this.state.selected.expanded = true;
                                this.setState({ selected: this.state.selected });
                            }
                            e.preventDefault();
                            break;
                        case "ArrowLeft":
                            if (this.state.selected.expanded) {
                                this.state.selected.expanded = false;
                                this.setState({ selected: this.state.selected });
                            }
                            else {
                                if (!(this.state.selected instanceof Service)) {
                                    this.setState({ selected: this.state.selected.parent});
                                }
                            }
                            e.preventDefault();
                            break;
                        default:
                            break;
                    }
                }
            },
            *_traverseItems() {
                const gattDatabases = this[gattDatabasesProperty].gattDatabases;

                for (let i = 0; i < gattDatabases.length; i++) {
                    //TODO: Yield gattDatabases[i] for selection of each seperate server.
                    const services = gattDatabases[i].services;

                    for (let j = 0; j < services.length; j++) {
                        yield services[j];
                        const characteristics = services[j].characteristics;

                        for (let k = 0; k < characteristics.length; k++) {
                            yield characteristics[k];
                            const descriptors = characteristics[k].descriptors;

                            for (let l = 0; l < descriptors.length; l++) {
                                yield descriptors[l];
                            }

                            if (addButtons) {
                                yield { parent: characteristics[k], _addBtnId: "add-btn-" + characteristics[k].handle }
                            }
                        }

                        if (addButtons) {
                            yield { parent: services[j], _addBtnId: "add-btn-" + services[j].handle }
                        }
                    }

                    if (addButtons) {
                        yield { _addBtnId: "add-btn-root" }
                    }
                }
            },
            *_traverseItemsBackwards() {
                const gattDatabases = this[gattDatabasesProperty].gattDatabases;

                for (let i = gattDatabases.length - 1; i >= 0; i--) {
                    //TODO: Yield gattDatabases[i] for selection of each seperate server.
                    const services = gattDatabases[i].services;

                    if (addButtons) {
                        yield { _addBtnId: "add-btn-root" }
                    }

                    for (let j = services.length - 1; j >= 0; j--) {
                        const characteristics = services[j].characteristics;

                        if (addButtons) {
                            yield { parent: services[j], _addBtnId: "add-btn-" + services[j].handle }
                        }

                        for (let k = characteristics.length - 1; k >= 0; k--) {
                            const descriptors = characteristics[k].descriptors;

                            if (addButtons) {
                                yield { parent: characteristics[k], _addBtnId: "add-btn-" + characteristics[k].handle }
                            }

                            for (let l = descriptors.length - 1; l >= 0; l--) {
                                yield descriptors[l];
                            }

                            yield characteristics[k];
                        }

                        yield services[j];
                    }
                }
            },
            _getNextChild() {
                var foundCurrent = this.state.selected === null;
                var next;
                for (let item of this._traverseItems()) {
                    if (foundCurrent) {
                        next = item;
                        break;
                    }
                    var isCurrent = this.state.selected && this.state.selected._addBtnId ? item._addBtnId === this.state.selected._addBtnId : item === this.state.selected;
                    if (isCurrent) foundCurrent = true;
                }
                var isChild = next && ((next.parent && next.parent === this.state.selected) || (next.parent && next.parent.parent && next.parent.parent === this.state.selected));
                return isChild ? next : null;
            },
            _getNextVisible() {
                var foundCurrent = this.state.selected === null;
                for (let item of this._traverseItems()) {
                    if (foundCurrent && this._isVisible(item)) return item;
                    var isCurrent = this.state.selected && this.state.selected._addBtnId ? item._addBtnId === this.state.selected._addBtnId : item === this.state.selected;
                    if (isCurrent) foundCurrent = true;
                }

                //walked through the list, return first visible
                for (let item of this._traverseItems()) {
                    if (this._isVisible(item)) return item;
                }
            },
            _getPreviousVisible() {
                var foundCurrent = this.state.selected === null;
                for (let item of this._traverseItemsBackwards()) {
                    if (foundCurrent && this._isVisible(item)) return item;
                    var isCurrent = this.state.selected && this.state.selected._addBtnId ? item._addBtnId === this.state.selected._addBtnId : item === this.state.selected;
                    if (isCurrent) foundCurrent = true;
                }
                //walked through the list, return first visible
                for (let item of this._traverseItemsBackwards()) {
                    if (this._isVisible(item)) return item;
                }
            },
            _isVisible(item) {
                if (item instanceof Service) return true;
                if (item.parent && !item.parent.expanded) return false;
                if (item.parent instanceof Service) return true;
                if (item.parent && item.parent.parent && !item.parent.parent.expanded) return false;
                return true;
            }
        });
    }
};

module.exports = TreeViewKeyNavigation;
*/
