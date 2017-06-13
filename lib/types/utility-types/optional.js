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
var core_1 = require("../../core");
var OptionalValue = (function (_super) {
    __extends(OptionalValue, _super);
    function OptionalValue(type, defaultValue) {
        var _this = _super.call(this, type.name) || this;
        _this.type = type;
        _this.defaultValue = defaultValue;
        return _this;
    }
    Object.defineProperty(OptionalValue.prototype, "flags", {
        get: function () {
            return this.type.flags | type_1.TypeFlags.Optional;
        },
        enumerable: true,
        configurable: true
    });
    OptionalValue.prototype.describe = function () {
        return this.type.describe() + "?";
    };
    OptionalValue.prototype.instantiate = function (parent, subpath, environment, value) {
        if (typeof value === "undefined") {
            var defaultValue = this.getDefaultValue();
            var defaultSnapshot = core_1.isStateTreeNode(defaultValue) ? core_1.getStateTreeNode(defaultValue).snapshot : defaultValue;
            return this.type.instantiate(parent, subpath, environment, defaultSnapshot);
        }
        return this.type.instantiate(parent, subpath, environment, value);
    };
    OptionalValue.prototype.reconcile = function (current, newValue) {
        return this.type.reconcile(current, this.type.is(newValue) ? newValue : this.getDefaultValue());
    };
    OptionalValue.prototype.getDefaultValue = function () {
        var defaultValue = typeof this.defaultValue === "function" ? this.defaultValue() : this.defaultValue;
        if (typeof this.defaultValue === "function")
            type_checker_1.typecheck(this, defaultValue);
        return defaultValue;
    };
    OptionalValue.prototype.isValidSnapshot = function (value, context) {
        // defaulted values can be skipped
        if (value === undefined || this.type.is(value)) {
            return type_checker_1.typeCheckSuccess();
        }
        return type_checker_1.typeCheckFailure(context, value);
    };
    return OptionalValue;
}(type_1.Type));
exports.OptionalValue = OptionalValue;
function optional(type, defaultValueOrFunction) {
    var defaultValue = typeof defaultValueOrFunction === "function" ? defaultValueOrFunction() : defaultValueOrFunction;
    var defaultSnapshot = core_1.isStateTreeNode(defaultValue) ? core_1.getStateTreeNode(defaultValue).snapshot : defaultValue;
    type_checker_1.typecheck(type, defaultSnapshot);
    return new OptionalValue(type, defaultValueOrFunction);
}
exports.optional = optional;
//# sourceMappingURL=optional.js.map