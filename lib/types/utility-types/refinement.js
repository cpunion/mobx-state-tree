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
var core_1 = require("../../core");
var type_checker_1 = require("../type-checker");
var Refinement = (function (_super) {
    __extends(Refinement, _super);
    function Refinement(name, type, predicate) {
        var _this = _super.call(this, name) || this;
        _this.type = type;
        _this.predicate = predicate;
        return _this;
    }
    Object.defineProperty(Refinement.prototype, "flags", {
        get: function () {
            return this.type.flags;
        },
        enumerable: true,
        configurable: true
    });
    Refinement.prototype.describe = function () {
        return this.name;
    };
    Refinement.prototype.instantiate = function (parent, subpath, environment, value) {
        // create the child type
        var inst = this.type.instantiate(parent, subpath, environment, value);
        return inst;
    };
    Refinement.prototype.isAssignableFrom = function (type) {
        return this.type.isAssignableFrom(type);
    };
    Refinement.prototype.isValidSnapshot = function (value, context) {
        if (this.type.is(value)) {
            var snapshot = core_1.isStateTreeNode(value) ? core_1.getStateTreeNode(value).snapshot : value;
            if (this.predicate(snapshot)) {
                return type_checker_1.typeCheckSuccess();
            }
        }
        return type_checker_1.typeCheckFailure(context, value);
    };
    return Refinement;
}(type_1.Type));
exports.Refinement = Refinement;
function refinement(name, type, predicate) {
    // check if the subtype default value passes the predicate
    var inst = type.create();
    if (!predicate(core_1.isStateTreeNode(inst) ? core_1.getStateTreeNode(inst).snapshot : inst))
        utils_1.fail("Default value for refinement type " + name + " does not pass the predicate.");
    return new Refinement(name, type, predicate);
}
exports.refinement = refinement;
//# sourceMappingURL=refinement.js.map