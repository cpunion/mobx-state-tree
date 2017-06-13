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
var utils_1 = require("../../utils");
var core_1 = require("../../core");
var property_1 = require("./property");
var type_checker_1 = require("../type-checker");
var ViewProperty = (function (_super) {
    __extends(ViewProperty, _super);
    function ViewProperty(name, fn) {
        var _this = _super.call(this, name) || this;
        _this.invokeView = createViewInvoker(name, fn);
        return _this;
    }
    ViewProperty.prototype.initialize = function (target) {
        utils_1.addHiddenFinalProp(target, this.name, this.invokeView.bind(target));
    };
    ViewProperty.prototype.validate = function (snapshot, context) {
        if (this.name in snapshot) {
            return type_checker_1.typeCheckFailure(type_checker_1.getContextForPath(context, this.name), snapshot[this.name], "View properties should not be provided in the snapshot");
        }
        return type_checker_1.typeCheckSuccess();
    };
    return ViewProperty;
}(property_1.Property));
exports.ViewProperty = ViewProperty;
function createViewInvoker(name, fn) {
    var viewInvoker = function () {
        var _this = this;
        var args = arguments;
        var adm = core_1.getStateTreeNode(this);
        adm.assertAlive();
        return mobx_1.extras.allowStateChanges(false, function () { return fn.apply(_this, args); });
    };
    // This construction helps producing a better function name in the stack trace, but could be optimized
    // away in prod builds, and `actionInvoker` be returned directly
    return utils_1.createNamedFunction(name, viewInvoker);
}
exports.createViewInvoker = createViewInvoker;
//# sourceMappingURL=view-property.js.map