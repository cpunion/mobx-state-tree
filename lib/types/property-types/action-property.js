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
var core_1 = require("../../core");
var property_1 = require("./property");
var type_checker_1 = require("../type-checker");
var ActionProperty = (function (_super) {
    __extends(ActionProperty, _super);
    function ActionProperty(name, fn) {
        var _this = _super.call(this, name) || this;
        _this.invokeAction = core_1.createActionInvoker(name, fn);
        return _this;
    }
    ActionProperty.prototype.initialize = function (target) {
        utils_1.addHiddenFinalProp(target, this.name, this.invokeAction.bind(target));
    };
    ActionProperty.prototype.validate = function (snapshot, context) {
        if (this.name in snapshot) {
            return type_checker_1.typeCheckFailure(type_checker_1.getContextForPath(context, this.name), snapshot[this.name], "Action properties should not be provided in the snapshot");
        }
        return type_checker_1.typeCheckSuccess();
    };
    return ActionProperty;
}(property_1.Property));
exports.ActionProperty = ActionProperty;
//# sourceMappingURL=action-property.js.map