"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var core_1 = require("../../core");
var utils_1 = require("../../utils");
var type_1 = require("../type");
var type_checker_1 = require("../type-checker");
function arrayToString() {
    return core_1.getStateTreeNode(this) + "(" + this.length + " items)";
}
exports.arrayToString = arrayToString;
var ArrayType = (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(name, subType) {
        var _this = _super.call(this, name) || this;
        _this.shouldAttachNode = true;
        _this.flags = type_1.TypeFlags.Array;
        _this.createNewInstance = function () {
            var array = mobx_1.observable.shallowArray();
            utils_1.addHiddenFinalProp(array, "toString", arrayToString);
            return array;
        };
        _this.finalizeNewInstance = function (node, snapshot) {
            var instance = node.storedValue;
            mobx_1.extras.getAdministration(instance).dehancer = node.unbox;
            mobx_1.intercept(instance, function (change) { return _this.willChange(change); });
            mobx_1.observe(instance, _this.didChange);
            node.applySnapshot(snapshot);
        };
        _this.subType = subType;
        return _this;
    }
    ArrayType.prototype.describe = function () {
        return this.subType.describe() + "[]";
    };
    ArrayType.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        return core_1.createNode(this, parent, subpath, environment, snapshot, this.createNewInstance, this.finalizeNewInstance);
    };
    ArrayType.prototype.getChildren = function (node) {
        return node.storedValue.peek();
    };
    ArrayType.prototype.getChildNode = function (node, key) {
        var index = parseInt(key, 10);
        if (index < node.storedValue.length)
            return node.storedValue[index];
        return utils_1.fail("Not a child: " + key);
    };
    ArrayType.prototype.willChange = function (change) {
        var node = core_1.getStateTreeNode(change.object);
        node.assertWritable();
        var childNodes = node.getChildren();
        switch (change.type) {
            case "update":
                if (change.newValue === change.object[change.index])
                    return null;
                change.newValue = node.reconcileChildren(node, this.subType, [childNodes[change.index]], [change.newValue], [change.index])[0];
                break;
            case "splice":
                var index_1 = change.index, removedCount = change.removedCount, added = change.added;
                change.added = node.reconcileChildren(node, this.subType, childNodes.slice(index_1, index_1 + removedCount), added, added.map(function (_, i) { return index_1 + i; }));
                // update paths of remaining items
                for (var i = index_1 + removedCount; i < childNodes.length; i++) {
                    childNodes[i].setParent(node, "" + (i + added.length - removedCount));
                }
                break;
        }
        return change;
    };
    ArrayType.prototype.getValue = function (node) {
        return node.storedValue;
    };
    ArrayType.prototype.getSnapshot = function (node) {
        return node.getChildren().map(function (childNode) { return childNode.snapshot; });
    };
    ArrayType.prototype.didChange = function (change) {
        var node = core_1.getStateTreeNode(change.object);
        switch (change.type) {
            case "update":
                return void node.emitPatch({
                    op: "replace",
                    path: "" + change.index,
                    value: node.getChildNode("" + change.index).snapshot
                }, node);
            case "splice":
                for (var i = change.index + change.removedCount - 1; i >= change.index; i--)
                    node.emitPatch({
                        op: "remove",
                        path: "" + i
                    }, node);
                for (var i = 0; i < change.addedCount; i++)
                    node.emitPatch({
                        op: "add",
                        path: "" + (change.index + i),
                        value: node.getChildNode("" + (change.index + i)).snapshot
                    }, node);
                return;
        }
    };
    ArrayType.prototype.applyPatchLocally = function (node, subpath, patch) {
        var target = node.storedValue;
        var index = subpath === "-" ? target.length : parseInt(subpath);
        switch (patch.op) {
            case "replace":
                target[index] = patch.value;
                break;
            case "add":
                target.splice(index, 0, patch.value);
                break;
            case "remove":
                target.splice(index, 1);
                break;
        }
    };
    ArrayType.prototype.applySnapshot = function (node, snapshot) {
        node.pseudoAction(function () {
            var target = node.storedValue;
            target.replace(snapshot);
        });
    };
    ArrayType.prototype.getChildType = function (key) {
        return this.subType;
    };
    ArrayType.prototype.isValidSnapshot = function (value, context) {
        var _this = this;
        if (!Array.isArray(value)) {
            return type_checker_1.typeCheckFailure(context, value);
        }
        return type_checker_1.flattenTypeErrors(value.map(function (item, index) { return _this.subType.validate(item, type_checker_1.getContextForPath(context, "" + index, _this.subType)); }));
    };
    ArrayType.prototype.getDefaultSnapshot = function () {
        return [];
    };
    ArrayType.prototype.removeChild = function (node, subpath) {
        node.storedValue.splice(parseInt(subpath, 10), 1);
    };
    return ArrayType;
}(type_1.ComplexType));
__decorate([
    mobx_1.action
], ArrayType.prototype, "applySnapshot", null);
exports.ArrayType = ArrayType;
function array(subtype) {
    return new ArrayType(subtype.name + "[]", subtype);
}
exports.array = array;
function isArrayFactory(type) {
    return type_1.isType(type) && (type.flags & type_1.TypeFlags.Array) > 0;
}
exports.isArrayFactory = isArrayFactory;
//# sourceMappingURL=array.js.map