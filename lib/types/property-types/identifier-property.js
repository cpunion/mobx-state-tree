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
var value_property_1 = require("./value-property");
var type_checker_1 = require("../type-checker");
var IdentifierProperty = (function (_super) {
    __extends(IdentifierProperty, _super);
    function IdentifierProperty(propertyName, subtype) {
        var _this = _super.call(this, propertyName, subtype) || this;
        _this.subtype = subtype;
        return _this;
    }
    IdentifierProperty.prototype.initialize = function (targetInstance, snapshot) {
        _super.prototype.initialize.call(this, targetInstance, snapshot);
        var node = core_1.getStateTreeNode(targetInstance);
        var identifier = snapshot[this.name];
        type_checker_1.typecheck(this.subtype, identifier);
        node.identifierAttribute = this.name;
    };
    IdentifierProperty.prototype.isValidIdentifier = function (identifier) {
        return this.subtype.is(identifier);
    };
    return IdentifierProperty;
}(value_property_1.ValueProperty));
exports.IdentifierProperty = IdentifierProperty;
//# sourceMappingURL=identifier-property.js.map