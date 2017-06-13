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
var type_1 = require("./type");
var type_checker_1 = require("./type-checker");
var utils_1 = require("../utils");
var core_1 = require("../core");
var CoreType = (function (_super) {
    __extends(CoreType, _super);
    function CoreType(name, flags, checker) {
        var _this = _super.call(this, name) || this;
        _this.flags = flags;
        _this.checker = checker;
        return _this;
    }
    CoreType.prototype.describe = function () {
        return this.name;
    };
    CoreType.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        return core_1.createNode(this, parent, subpath, environment, snapshot);
    };
    CoreType.prototype.isValidSnapshot = function (value, context) {
        if (utils_1.isPrimitive(value) && this.checker(value)) {
            return type_checker_1.typeCheckSuccess();
        }
        return type_checker_1.typeCheckFailure(context, value);
    };
    return CoreType;
}(type_1.Type));
exports.CoreType = CoreType;
// tslint:disable-next-line:variable-name
exports.string = new CoreType("string", type_1.TypeFlags.String, function (v) { return typeof v === "string"; });
// tslint:disable-next-line:variable-name
exports.number = new CoreType("number", type_1.TypeFlags.Number, function (v) { return typeof v === "number"; });
// tslint:disable-next-line:variable-name
exports.boolean = new CoreType("boolean", type_1.TypeFlags.Boolean, function (v) { return typeof v === "boolean"; });
// tslint:disable-next-line:variable-name
exports.DatePrimitive = new CoreType("Date", type_1.TypeFlags.Date, function (v) { return v instanceof Date; });
exports.DatePrimitive.getSnapshot = function (node) {
    return node.storedValue.getTime();
};
// TODO: move null and undefined primitive to here (from maybe)
function getPrimitiveFactoryFromValue(value) {
    switch (typeof value) {
        case "string":
            return exports.string;
        case "number":
            return exports.number;
        case "boolean":
            return exports.boolean;
        case "object":
            if (value instanceof Date)
                return exports.DatePrimitive;
    }
    return utils_1.fail("Cannot determine primtive type from value " + value);
}
exports.getPrimitiveFactoryFromValue = getPrimitiveFactoryFromValue;
function isPrimitiveType(type) {
    return (type.flags & (type_1.TypeFlags.String | type_1.TypeFlags.Number | type_1.TypeFlags.Boolean | type_1.TypeFlags.Date)) > 0;
}
exports.isPrimitiveType = isPrimitiveType;
//# sourceMappingURL=primitives.js.map