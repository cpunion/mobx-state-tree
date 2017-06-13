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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../../core");
var type_1 = require("../type");
var type_checker_1 = require("../type-checker");
var utils_1 = require("../../utils");
var StoredReference = (function () {
    function StoredReference(mode, value) {
        this.mode = mode;
        this.value = value;
        if (mode === "object") {
            if (!core_1.isStateTreeNode(value))
                return utils_1.fail("Can only store references to tree nodes, got: '" + value + "'");
            var targetNode = core_1.getStateTreeNode(value);
            if (!targetNode.identifierAttribute)
                return utils_1.fail("Can only store references with a defined identifier attribute.");
        }
    }
    return StoredReference;
}());
var ReferenceType = (function (_super) {
    __extends(ReferenceType, _super);
    function ReferenceType(targetType) {
        var _this = 
        // TODO: check if targetType is object type? Or does that break late types? Do it in instantiate
        _super.call(this, "reference(" + targetType.name + ")") || this;
        _this.targetType = targetType;
        _this.flags = type_1.TypeFlags.Reference;
        return _this;
    }
    ReferenceType.prototype.describe = function () {
        return this.name;
    };
    ReferenceType.prototype.getValue = function (node) {
        var ref = node.storedValue;
        if (ref.mode === "object")
            return ref.value;
        if (!node.isAlive)
            return undefined;
        // reference was initialized with the identifier of the target
        var target = node.root.identifierCache.resolve(this.targetType, ref.value);
        if (!target)
            return utils_1.fail("Failed to resolve reference of type " + this.targetType.name + ": '" + ref.value + "' (in: " + node.path + ")");
        return target.getValue();
    };
    ReferenceType.prototype.getSnapshot = function (node) {
        var ref = node.storedValue;
        switch (ref.mode) {
            case "identifier":
                return ref.value;
            case "object":
                return core_1.getStateTreeNode(ref.value).identifier;
        }
    };
    ReferenceType.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        var isComplex = core_1.isStateTreeNode(snapshot);
        return core_1.createNode(this, parent, subpath, environment, new StoredReference(isComplex ? "object" : "identifier", snapshot));
    };
    ReferenceType.prototype.reconcile = function (current, newValue) {
        var targetMode = core_1.isStateTreeNode(newValue) ? "object" : "identifier";
        if (isReferenceType(current.type)) {
            var ref = current.storedValue;
            if (targetMode === ref.mode && ref.value === newValue)
                return current;
        }
        var newNode = this.instantiate(current.parent, current.subpath, current._environment, newValue);
        current.die();
        return newNode;
    };
    ReferenceType.prototype.isAssignableFrom = function (type) {
        return this.targetType.isAssignableFrom(type);
    };
    ReferenceType.prototype.isValidSnapshot = function (value, context) {
        return (typeof value === "string" || typeof value === "number")
            ? type_checker_1.typeCheckSuccess()
            : type_checker_1.typeCheckFailure(context, value, "Value '" + type_checker_1.prettyPrintValue(value) + "' is not a valid reference. Expected a string or number.");
    };
    return ReferenceType;
}(type_1.Type));
exports.ReferenceType = ReferenceType;
function reference(factory) {
    if (arguments.length === 2 && typeof arguments[1] === "string")
        utils_1.fail("References with base path are no longer supported. Please remove the base path.");
    return new ReferenceType(factory);
}
exports.reference = reference;
function isReferenceType(type) {
    return (type.flags & (type_1.TypeFlags.Reference)) > 0;
}
exports.isReferenceType = isReferenceType;
//# sourceMappingURL=reference.js.map