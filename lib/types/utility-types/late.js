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
var utils_1 = require("../../utils");
var type_1 = require("../type");
var Late = (function (_super) {
    __extends(Late, _super);
    function Late(name, definition) {
        var _this = _super.call(this, name) || this;
        _this._subType = null;
        if (!(typeof definition === "function" && definition.length === 0))
            utils_1.fail("Invalid late type, expected a function with zero arguments that returns a type, got: " + definition);
        _this.definition = definition;
        return _this;
    }
    Object.defineProperty(Late.prototype, "flags", {
        get: function () {
            return this.subType.flags;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Late.prototype, "subType", {
        get: function () {
            if (this._subType === null) {
                this._subType = this.definition();
            }
            return this._subType;
        },
        enumerable: true,
        configurable: true
    });
    Late.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        return this.subType.instantiate(parent, subpath, environment, snapshot);
    };
    Late.prototype.reconcile = function (current, newValue) {
        return this.subType.reconcile(current, newValue);
    };
    Late.prototype.describe = function () {
        return this.subType.name;
    };
    Late.prototype.isValidSnapshot = function (value, context) {
        return this.subType.validate(value, context);
    };
    Late.prototype.isAssignableFrom = function (type) {
        return this.subType.isAssignableFrom(type);
    };
    return Late;
}(type_1.Type));
exports.Late = Late;
function late(nameOrType, maybeType) {
    var name = typeof nameOrType === "string" ? nameOrType : "<late>";
    var type = typeof nameOrType === "string" ? maybeType : nameOrType;
    return new Late(name, type);
}
exports.late = late;
//# sourceMappingURL=late.js.map