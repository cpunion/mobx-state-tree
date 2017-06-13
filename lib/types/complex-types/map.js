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
function mapToString() {
    return core_1.getStateTreeNode(this) + "(" + this.size + " items)";
}
exports.mapToString = mapToString;
function put(value) {
    if (!(!!value))
        utils_1.fail("Map.put cannot be used to set empty values");
    var node;
    if (core_1.isStateTreeNode(value)) {
        node = core_1.getStateTreeNode(value);
    }
    else if (utils_1.isMutable(value)) {
        var targetType = core_1.getStateTreeNode(this).type.subType;
        node = core_1.getStateTreeNode(targetType.create(value));
    }
    else {
        return utils_1.fail("Map.put can only be used to store complex values");
    }
    if (!node.identifierAttribute)
        utils_1.fail("Map.put can only be used to store complex values that have an identifier type attribute");
    this.set(node.identifier, node.getValue());
    return this;
}
var MapType = (function (_super) {
    __extends(MapType, _super);
    function MapType(name, subType) {
        var _this = _super.call(this, name) || this;
        _this.shouldAttachNode = true;
        _this.flags = type_1.TypeFlags.Map;
        _this.createNewInstance = function () {
            // const identifierAttr = getIdentifierAttribute(this.subType)
            var map = mobx_1.observable.shallowMap();
            utils_1.addHiddenFinalProp(map, "put", put);
            utils_1.addHiddenFinalProp(map, "toString", mapToString);
            return map;
        };
        _this.finalizeNewInstance = function (node, snapshot) {
            var instance = node.storedValue;
            mobx_1.extras.interceptReads(instance, node.unbox);
            mobx_1.intercept(instance, function (c) { return _this.willChange(c); });
            mobx_1.observe(instance, _this.didChange);
            node.applySnapshot(snapshot);
        };
        _this.subType = subType;
        return _this;
    }
    MapType.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        return core_1.createNode(this, parent, subpath, environment, snapshot, this.createNewInstance, this.finalizeNewInstance);
    };
    MapType.prototype.describe = function () {
        return "Map<string, " + this.subType.describe() + ">";
    };
    MapType.prototype.getChildren = function (node) {
        return node.storedValue.values();
    };
    MapType.prototype.getChildNode = function (node, key) {
        var childNode = node.storedValue.get(key);
        if (!childNode)
            utils_1.fail("Not a child" + key);
        return childNode;
    };
    MapType.prototype.willChange = function (change) {
        var node = core_1.getStateTreeNode(change.object);
        node.assertWritable();
        switch (change.type) {
            case "update":
                {
                    var newValue = change.newValue;
                    var oldValue = change.object.get(change.name);
                    if (newValue === oldValue)
                        return null;
                    change.newValue = this.subType.reconcile(node.getChildNode(change.name), change.newValue);
                    this.verifyIdentifier(change.name, change.newValue);
                }
                break;
            case "add":
                {
                    change.newValue = this.subType.instantiate(node, change.name, undefined, change.newValue);
                    this.verifyIdentifier(change.name, change.newValue);
                }
                break;
            case "delete":
                {
                    node.getChildNode(change.name).die();
                }
                break;
        }
        return change;
    };
    MapType.prototype.verifyIdentifier = function (expected, node) {
        var identifier = node.identifier;
        if (identifier !== null && identifier !== expected)
            utils_1.fail("A map of objects containing an identifier should always store the object under their own identifier. Trying to store key '" + identifier + "', but expected: '" + expected + "'");
    };
    MapType.prototype.getValue = function (node) {
        return node.storedValue;
    };
    MapType.prototype.getSnapshot = function (node) {
        var res = {};
        node.getChildren().forEach(function (childNode) {
            res[childNode.subpath] = childNode.snapshot;
        });
        return res;
    };
    MapType.prototype.didChange = function (change) {
        var node = core_1.getStateTreeNode(change.object);
        switch (change.type) {
            case "update":
            case "add":
                return void node.emitPatch({
                    op: change.type === "add" ? "add" : "replace",
                    path: core_1.escapeJsonPath(change.name),
                    value: node.getChildNode(change.name).snapshot
                }, node);
            case "delete":
                return void node.emitPatch({
                    op: "remove",
                    path: core_1.escapeJsonPath(change.name)
                }, node);
        }
    };
    MapType.prototype.applyPatchLocally = function (node, subpath, patch) {
        var target = node.storedValue;
        switch (patch.op) {
            case "add":
            case "replace":
                target.set(subpath, patch.value);
                break;
            case "remove":
                target.delete(subpath);
                break;
        }
    };
    MapType.prototype.applySnapshot = function (node, snapshot) {
        node.pseudoAction(function () {
            var target = node.storedValue;
            var currentKeys = {};
            target.keys().forEach(function (key) { currentKeys[key] = false; });
            // Don't use target.replace, as it will throw all existing items first
            Object.keys(snapshot).forEach(function (key) {
                target.set(key, snapshot[key]);
                currentKeys[key] = true;
            });
            Object.keys(currentKeys).forEach(function (key) {
                if (currentKeys[key] === false)
                    target.delete(key);
            });
        });
    };
    MapType.prototype.getChildType = function (key) {
        return this.subType;
    };
    MapType.prototype.isValidSnapshot = function (value, context) {
        var _this = this;
        if (!utils_1.isPlainObject(value)) {
            return type_checker_1.typeCheckFailure(context, value);
        }
        return type_checker_1.flattenTypeErrors(Object.keys(value).map(function (path) { return _this.subType.validate(value[path], type_checker_1.getContextForPath(context, path, _this.subType)); }));
    };
    MapType.prototype.getDefaultSnapshot = function () {
        return {};
    };
    MapType.prototype.removeChild = function (node, subpath) {
        node.storedValue.delete(subpath);
    };
    return MapType;
}(type_1.ComplexType));
__decorate([
    mobx_1.action
], MapType.prototype, "applySnapshot", null);
exports.MapType = MapType;
function map(subtype) {
    return new MapType("map<string, " + subtype.name + ">", subtype);
}
exports.map = map;
function isMapFactory(type) {
    return type_1.isType(type) && (type.flags & type_1.TypeFlags.Map) > 0;
}
exports.isMapFactory = isMapFactory;
//# sourceMappingURL=map.js.map