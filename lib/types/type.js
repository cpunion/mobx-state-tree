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
var TypeFlags;
(function (TypeFlags) {
    TypeFlags[TypeFlags["String"] = 1] = "String";
    TypeFlags[TypeFlags["Number"] = 2] = "Number";
    TypeFlags[TypeFlags["Boolean"] = 4] = "Boolean";
    TypeFlags[TypeFlags["Date"] = 8] = "Date";
    TypeFlags[TypeFlags["Literal"] = 16] = "Literal";
    TypeFlags[TypeFlags["Array"] = 32] = "Array";
    TypeFlags[TypeFlags["Map"] = 64] = "Map";
    TypeFlags[TypeFlags["Object"] = 128] = "Object";
    TypeFlags[TypeFlags["Frozen"] = 256] = "Frozen";
    TypeFlags[TypeFlags["Optional"] = 512] = "Optional";
    TypeFlags[TypeFlags["Reference"] = 1024] = "Reference";
    TypeFlags[TypeFlags["Identifier"] = 2048] = "Identifier";
})(TypeFlags = exports.TypeFlags || (exports.TypeFlags = {}));
function isType(value) {
    return typeof value === "object" && value && value.isType === true;
}
exports.isType = isType;
/**
 * A complex type produces a MST node (Node in the state tree)
 */
var ComplexType = (function () {
    function ComplexType(name) {
        this.isType = true;
        this.name = name;
    }
    ComplexType.prototype.create = function (snapshot, environment) {
        if (snapshot === void 0) { snapshot = this.getDefaultSnapshot(); }
        type_checker_1.typecheck(this, snapshot);
        return this.instantiate(null, "", environment, snapshot).getValue();
    };
    ComplexType.prototype.isAssignableFrom = function (type) {
        return type === this;
    };
    ComplexType.prototype.validate = function (value, context) {
        if (node_1.isStateTreeNode(value)) {
            return mst_operations_1.getType(value) === this || this.isAssignableFrom(mst_operations_1.getType(value)) ? type_checker_1.typeCheckSuccess() : type_checker_1.typeCheckFailure(context, value);
            // it is tempting to compare snapshots, but in that case we should always clone on assignments...
        }
        return this.isValidSnapshot(value, context);
    };
    ComplexType.prototype.is = function (value) {
        return this.validate(value, [{ path: "", type: this }]).length === 0;
    };
    ComplexType.prototype.reconcile = function (current, newValue) {
        // TODO: this.is... for all prepareNewVaues?
        if (node_1.isStateTreeNode(newValue) && node_1.getStateTreeNode(newValue) === current)
            // the current node is the same as the new one
            return current;
        if (current.type === this &&
            utils_1.isMutable(newValue) &&
            !node_1.isStateTreeNode(newValue) &&
            (!current.identifierAttribute ||
                current.identifier === newValue[current.identifierAttribute])) {
            // the newValue has no node, so can be treated like a snapshot
            // we can reconcile
            current.applySnapshot(newValue);
            return current;
        }
        // current node cannot be recycled in any way
        current.die();
        // attempt to reuse the new one
        if (node_1.isStateTreeNode(newValue) && this.isAssignableFrom(mst_operations_1.getType(newValue))) {
            // newValue is a Node as well, move it here..
            var newNode = node_1.getStateTreeNode(newValue);
            newNode.setParent(current.parent, current.path);
            return newNode;
        }
        // nothing to do, we have to create a new node
        return this.instantiate(current.parent, current.path, current._environment, newValue);
    };
    Object.defineProperty(ComplexType.prototype, "Type", {
        get: function () {
            return utils_1.fail("Factory.Type should not be actually called. It is just a Type signature that can be used at compile time with Typescript, by using `typeof type.Type`");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComplexType.prototype, "SnapshotType", {
        get: function () {
            return utils_1.fail("Factory.SnapshotType should not be actually called. It is just a Type signature that can be used at compile time with Typescript, by using `typeof type.SnapshotType`");
        },
        enumerable: true,
        configurable: true
    });
    return ComplexType;
}());
__decorate([
    mobx_1.action
], ComplexType.prototype, "create", null);
exports.ComplexType = ComplexType;
var Type = (function (_super) {
    __extends(Type, _super);
    function Type(name) {
        return _super.call(this, name) || this;
    }
    Type.prototype.getValue = function (node) {
        return node.storedValue;
    };
    Type.prototype.getSnapshot = function (node) {
        return node.storedValue;
    };
    Type.prototype.getDefaultSnapshot = function () {
        return undefined;
    };
    Type.prototype.applySnapshot = function (node, snapshot) {
        utils_1.fail("Immutable types do not support applying snapshots");
    };
    Type.prototype.applyPatchLocally = function (node, subpath, patch) {
        utils_1.fail("Immutable types do not support applying patches");
    };
    Type.prototype.getChildren = function (node) {
        return utils_1.EMPTY_ARRAY;
    };
    Type.prototype.getChildNode = function (node, key) {
        return utils_1.fail("No child '" + key + "' available in type: " + this.name);
    };
    Type.prototype.getChildType = function (key) {
        return utils_1.fail("No child '" + key + "' available in type: " + this.name);
    };
    Type.prototype.reconcile = function (current, newValue) {
        // reconcile only if type and value are still the same
        if (current.type === this && current.storedValue === newValue)
            return current;
        var res = this.instantiate(current.parent, current.subpath, current._environment, newValue);
        current.die();
        return res;
    };
    Type.prototype.removeChild = function (node, subpath) {
        return utils_1.fail("No child '" + subpath + "' available in type: " + this.name);
    };
    return Type;
}(ComplexType));
exports.Type = Type;
var utils_1 = require("../utils");
var node_1 = require("../core/node");
var type_checker_1 = require("./type-checker");
var mst_operations_1 = require("../core/mst-operations");
//# sourceMappingURL=type.js.map