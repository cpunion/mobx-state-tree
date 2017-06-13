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
var Union = (function (_super) {
    __extends(Union, _super);
    function Union(name, types, dispatcher) {
        var _this = _super.call(this, name) || this;
        _this.dispatcher = null;
        _this.dispatcher = dispatcher;
        _this.types = types;
        return _this;
    }
    Object.defineProperty(Union.prototype, "flags", {
        get: function () {
            var result = 0;
            this.types.forEach(function (type) {
                result |= type.flags;
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Union.prototype.isAssignableFrom = function (type) {
        return this.types.some(function (subType) { return subType.isAssignableFrom(type); });
    };
    Union.prototype.describe = function () {
        return "(" + this.types.map(function (factory) { return factory.describe(); }).join(" | ") + ")";
    };
    Union.prototype.instantiate = function (parent, subpath, environment, value) {
        return this.determineType(value).instantiate(parent, subpath, environment, value);
    };
    Union.prototype.reconcile = function (current, newValue) {
        return this.determineType(newValue).reconcile(current, newValue);
    };
    Union.prototype.determineType = function (value) {
        // try the dispatcher, if defined
        if (this.dispatcher !== null) {
            return this.dispatcher(value);
        }
        // find the most accomodating type
        var applicableTypes = this.types.filter(function (type) { return type.is(value); });
        if (applicableTypes.length > 1)
            return utils_1.fail("Ambiguos snapshot " + JSON.stringify(value) + " for union " + this.name + ". Please provide a dispatch in the union declaration.");
        return applicableTypes[0];
    };
    Union.prototype.isValidSnapshot = function (value, context) {
        if (this.dispatcher !== null) {
            return this.dispatcher(value).validate(value, context);
        }
        var errors = this.types.map(function (type) { return type.validate(value, context); });
        var applicableTypes = errors.filter(function (errorArray) { return errorArray.length === 0; });
        if (applicableTypes.length > 1) {
            return type_checker_1.typeCheckFailure(context, value, "Multiple types are applicable and no dispatch method is defined for the union");
        }
        else if (applicableTypes.length < 1) {
            return type_checker_1.typeCheckFailure(context, value, "No type is applicable and no dispatch method is defined for the union")
                .concat(type_checker_1.flattenTypeErrors(errors));
        }
        return type_checker_1.typeCheckSuccess();
    };
    return Union;
}(type_1.Type));
exports.Union = Union;
function union(dispatchOrType) {
    var otherTypes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherTypes[_i - 1] = arguments[_i];
    }
    var dispatcher = type_1.isType(dispatchOrType) ? null : dispatchOrType;
    var types = type_1.isType(dispatchOrType) ? otherTypes.concat(dispatchOrType) : otherTypes;
    var name = types.map(function (type) { return type.name; }).join(" | ");
    return new Union(name, types, dispatcher);
}
exports.union = union;
//# sourceMappingURL=union.js.map