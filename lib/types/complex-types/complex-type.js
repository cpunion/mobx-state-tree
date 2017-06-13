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
var type_1 = require("../type");
var utils_1 = require("../../utils");
var type_checker_1 = require("../type-checker");
function toJSON() {
    return mst_node_1.getMSTAdministration(this).snapshot;
}
/**
 * A complex type produces a MST node (Node in the state tree)
 */
var ComplexType = (function (_super) {
    __extends(ComplexType, _super);
    function ComplexType(name) {
        var _this = _super.call(this, name) || this;
        _this.create = mobx_1.action(_this.name, _this.create);
        return _this;
    }
    ComplexType.prototype.create = function (snapshot, environment, parent, subpath) {
        var _this = this;
        if (snapshot === void 0) { snapshot = this.getDefaultSnapshot(); }
        if (environment === void 0) { environment = undefined; }
        if (parent === void 0) { parent = null; }
        if (subpath === void 0) { subpath = ""; }
        type_checker_1.typecheck(this, snapshot);
        var instance = this.createNewInstance();
        // tslint:disable-next-line:no_unused-variable
        var node = new mst_node_administration_1.MSTAdministration(parent, subpath, instance, this, environment);
        var sawException = true;
        try {
            node.pseudoAction(function () {
                _this.finalizeNewInstance(instance, snapshot);
            });
            utils_1.addReadOnlyProp(instance, "toJSON", toJSON);
            node.fireHook("afterCreate");
            if (parent)
                node.fireHook("afterAttach");
            sawException = false;
            return instance;
        }
        finally {
            if (sawException) {
                // short-cut to die the instance, to avoid the snapshot computed starting to throw...
                node._isAlive = false;
            }
        }
    };
    ComplexType.prototype.validate = function (value, context) {
        if (!value || typeof value !== "object")
            return type_checker_1.typeCheckFailure(context, value);
        if (mst_node_1.isMST(value)) {
            return mst_node_1.getType(value) === this ? type_checker_1.typeCheckSuccess() : type_checker_1.typeCheckFailure(context, value);
            // it is tempting to compare snapshots, but in that case we should always clone on assignments...
        }
        return this.isValidSnapshot(value, context);
    };
    return ComplexType;
}(type_1.Type));
exports.ComplexType = ComplexType;
var mst_node_1 = require("../../core/mst-node");
var mst_node_administration_1 = require("../../core/mst-node-administration");
//# sourceMappingURL=complex-type.js.map