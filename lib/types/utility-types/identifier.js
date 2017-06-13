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
var type_1 = require("../type");
var type_checker_1 = require("../type-checker");
var utils_1 = require("../../utils");
var core_1 = require("../../core");
var primitives_1 = require("../primitives");
var late_1 = require("./late");
var Identifier = (function () {
    function Identifier(identifier) {
        this.identifier = identifier;
    }
    Identifier.prototype.toString = function () {
        return "identifier(" + this.identifier + ")";
    };
    return Identifier;
}());
var IdentifierType = (function (_super) {
    __extends(IdentifierType, _super);
    function IdentifierType(identifierType) {
        var _this = _super.call(this, "identifier(" + identifierType.name + ")") || this;
        _this.identifierType = identifierType;
        _this.flags = type_1.TypeFlags.Identifier;
        return _this;
    }
    IdentifierType.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        type_checker_1.typecheck(this.identifierType, snapshot);
        if (parent && !core_1.isStateTreeNode(parent.storedValue))
            utils_1.fail("Identifier types can only be instantiated as direct child of a model type");
        return core_1.createNode(this, parent, subpath, environment, snapshot);
    };
    IdentifierType.prototype.reconcile = function (current, newValue) {
        if (current.storedValue !== newValue)
            return utils_1.fail("Tried to change identifier from '" + current.storedValue + "' to '" + newValue + "'. Changing identifiers is not allowed.");
        return current;
    };
    IdentifierType.prototype.describe = function () {
        return "identifier(" + this.identifierType.describe() + ")";
    };
    IdentifierType.prototype.isValidSnapshot = function (value, context) {
        if (this.identifierType.is(value)) {
            return type_checker_1.typeCheckSuccess();
        }
        return type_checker_1.typeCheckFailure(context, value);
    };
    return IdentifierType;
}(type_1.Type));
exports.IdentifierType = IdentifierType;
function identifier(baseType) {
    if (baseType === void 0) { baseType = primitives_1.string; }
    // TODO: MWE: this seems contrived, let's not assert anything and support unions, refinements etc.
    if (baseType !== primitives_1.string && baseType !== primitives_1.number)
        utils_1.fail("Only 'types.number' and 'types.string' are acceptable as type specification for identifiers");
    return new IdentifierType(baseType);
}
exports.identifier = identifier;
function isIdentifierType(type) {
    return (!(type instanceof late_1.Late)) &&
        (type.flags & (type_1.TypeFlags.Identifier)) > 0;
}
exports.isIdentifierType = isIdentifierType;
//# sourceMappingURL=identifier.js.map