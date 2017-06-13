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
var utils_1 = require("../../utils");
var type_checker_1 = require("../type-checker");
var core_1 = require("../../core");
var Literal = (function (_super) {
    __extends(Literal, _super);
    function Literal(value) {
        var _this = _super.call(this, "" + value) || this;
        _this.flags = type_1.TypeFlags.Literal;
        _this.value = value;
        return _this;
    }
    Literal.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        return core_1.createNode(this, parent, subpath, environment, snapshot);
    };
    Literal.prototype.describe = function () {
        return JSON.stringify(this.value);
    };
    Literal.prototype.isValidSnapshot = function (value, context) {
        if (utils_1.isPrimitive(value) && value === this.value) {
            return type_checker_1.typeCheckSuccess();
        }
        return type_checker_1.typeCheckFailure(context, value);
    };
    return Literal;
}(type_1.Type));
exports.Literal = Literal;
function literal(value) {
    if (!utils_1.isPrimitive(value))
        utils_1.fail("Literal types can be built only on top of primitives");
    return new Literal(value);
}
exports.literal = literal;
//# sourceMappingURL=literal.js.map