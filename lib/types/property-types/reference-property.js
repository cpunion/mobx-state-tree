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
var property_1 = require("./property");
var utils_1 = require("../../utils");
var core_1 = require("../../core");
var reference_1 = require("../../core/reference");
var type_checker_1 = require("../type-checker");
var ReferenceProperty = (function (_super) {
    __extends(ReferenceProperty, _super);
    function ReferenceProperty(propertyName, type, basePath) {
        var _this = _super.call(this, propertyName) || this;
        _this.type = type;
        _this.basePath = basePath;
        return _this;
    }
    ReferenceProperty.prototype.initialize = function (targetInstance, snapshot) {
        var ref = new reference_1.Reference(targetInstance, this.type, this.basePath, snapshot[this.name]);
        utils_1.addHiddenFinalProp(targetInstance, this.name + "$value", ref);
        var self = this;
        Object.defineProperty(targetInstance, this.name, {
            get: function () {
                // TODO: factor those functions out to statics
                core_1.getMSTAdministration(this).assertAlive(); // Expensive for each read, so optimize away in prod builds!
                return ref.get;
            },
            set: function (v) {
                var node = core_1.getMSTAdministration(this);
                node.assertWritable();
                var baseValue = ref.identifier;
                ref.setNewValue(v);
                if (ref.identifier !== baseValue) {
                    node.emitPatch({
                        op: "replace",
                        path: core_1.escapeJsonPath(self.name),
                        value: ref.serialize
                    }, node);
                }
            }
        });
        targetInstance[this.name] = snapshot[this.name];
    };
    ReferenceProperty.prototype.serialize = function (instance, snapshot) {
        snapshot[this.name] = instance[this.name + "$value"].serialize();
    };
    ReferenceProperty.prototype.deserialize = function (instance, snapshot) {
        instance[this.name + "$value"].setNewValue(snapshot[this.name]);
    };
    ReferenceProperty.prototype.validate = function (value, context) {
        // TODO: and check name is string or $ref object
        if (this.name in value) {
            return type_checker_1.typeCheckSuccess();
        }
        return type_checker_1.typeCheckFailure(type_checker_1.getContextForPath(context, this.name, this.type), undefined, "Reference is required.");
    };
    return ReferenceProperty;
}(property_1.Property));
exports.ReferenceProperty = ReferenceProperty;
//# sourceMappingURL=reference-property.js.map