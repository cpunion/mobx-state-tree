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
var core_1 = require("../../core");
var type_checker_1 = require("../type-checker");
var utils_1 = require("../../utils");
var literal_1 = require("../utility-types/literal");
var undefinedType = literal_1.literal(undefined);
var ValueProperty = (function (_super) {
    __extends(ValueProperty, _super);
    function ValueProperty(propertyName, type) {
        var _this = _super.call(this, propertyName) || this;
        _this.type = type;
        return _this;
    }
    ValueProperty.prototype.initializePrototype = function (proto) {
        mobx_1.observable.ref(proto, this.name, { value: undefinedType.instantiate(null, "", null, undefined) }); // TODO: undefined type should not be needed
    };
    ValueProperty.prototype.initialize = function (instance, snapshot) {
        var node = core_1.getStateTreeNode(instance);
        instance[this.name] = this.type.instantiate(node, this.name, node._environment, snapshot[this.name]);
        mobx_1.extras.interceptReads(instance, this.name, node.unbox);
    };
    ValueProperty.prototype.getValueNode = function (targetInstance) {
        var node = targetInstance.$mobx.values[this.name].value; // TODO: blegh!
        if (!node)
            return utils_1.fail("Node not available for property " + this.name);
        return node;
    };
    ValueProperty.prototype.willChange = function (change) {
        var node = core_1.getStateTreeNode(change.object); // TODO: pass node in from object property
        type_checker_1.typecheck(this.type, change.newValue);
        change.newValue = this.type.reconcile(node.getChildNode(change.name), change.newValue);
        return change;
    };
    ValueProperty.prototype.didChange = function (change) {
        var node = core_1.getStateTreeNode(change.object);
        node.emitPatch({
            op: "replace",
            path: core_1.escapeJsonPath(this.name),
            value: this.getValueNode(change.object).snapshot
        }, node);
    };
    ValueProperty.prototype.serialize = function (instance, snapshot) {
        // TODO: FIXME, make sure the observable ref is used!
        mobx_1.extras.getAtom(instance, this.name).reportObserved();
        snapshot[this.name] = this.getValueNode(instance).snapshot;
    };
    ValueProperty.prototype.deserialize = function (instance, snapshot) {
        // TODO: was a maybeMST here first...
        instance[this.name] = snapshot[this.name];
    };
    ValueProperty.prototype.validate = function (snapshot, context) {
        return this.type.validate(snapshot[this.name], type_checker_1.getContextForPath(context, this.name, this.type));
    };
    return ValueProperty;
}(property_1.Property));
exports.ValueProperty = ValueProperty;
//# sourceMappingURL=value-property.js.map