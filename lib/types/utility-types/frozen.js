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
function freeze(value) {
    Object.freeze(value);
    if (utils_1.isPlainObject(value)) {
        Object.keys(value).forEach(function (propKey) {
            if (!Object.isFrozen(value[propKey])) {
                freeze(value[propKey]);
            }
        });
    }
    return value;
}
var Frozen = (function (_super) {
    __extends(Frozen, _super);
    function Frozen() {
        var _this = _super.call(this, "frozen") || this;
        _this.flags = type_1.TypeFlags.Frozen;
        return _this;
    }
    Frozen.prototype.describe = function () {
        return "<any immutable value>";
    };
    Frozen.prototype.instantiate = function (parent, subpath, environment, value) {
        // deep freeze the object/array
        return core_1.createNode(this, parent, subpath, environment, utils_1.isMutable(value) ? freeze(value) : value);
    };
    Frozen.prototype.isValidSnapshot = function (value, context) {
        if (!utils_1.isSerializable(value)) {
            return type_checker_1.typeCheckFailure(context, value);
        }
        return type_checker_1.typeCheckSuccess();
    };
    return Frozen;
}(type_1.Type));
exports.Frozen = Frozen;
exports.frozen = new Frozen();
//# sourceMappingURL=frozen.js.map