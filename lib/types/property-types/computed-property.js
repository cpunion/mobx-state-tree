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
var mobx_1 = require("mobx");
var property_1 = require("./property");
var type_checker_1 = require("../type-checker");
var ComputedProperty = (function (_super) {
    __extends(ComputedProperty, _super);
    function ComputedProperty(propertyName, getter, setter) {
        var _this = _super.call(this, propertyName) || this;
        _this.getter = getter;
        _this.setter = setter;
        return _this;
    }
    ComputedProperty.prototype.initializePrototype = function (proto) {
        Object.defineProperty(proto, this.name, mobx_1.computed(proto, this.name, { get: this.getter, set: this.setter, configurable: true, enumerable: false }));
    };
    ComputedProperty.prototype.validate = function (snapshot, context) {
        if (this.name in snapshot) {
            return type_checker_1.typeCheckFailure(type_checker_1.getContextForPath(context, this.name), snapshot[this.name], "Computed properties should not be provided in the snapshot");
        }
        return type_checker_1.typeCheckSuccess();
    };
    return ComputedProperty;
}(property_1.Property));
exports.ComputedProperty = ComputedProperty;
//# sourceMappingURL=computed-property.js.map