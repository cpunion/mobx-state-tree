"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var mst_node_1 = require("./mst-node");
var utils_1 = require("../utils");
var object_1 = require("../types/complex-types/object");
var type_checker_1 = require("../types/type-checker");
var mst_operations_1 = require("./mst-operations");
var Reference = (function () {
    function Reference(owner, // TODO: mst MSTAdminisration instead of node
        type, basePath, identifier) {
        this.owner = owner;
        this.type = type;
        this.basePath = basePath;
        this.identifier = null;
        if (basePath) {
            this.targetIdAttribute = object_1.getIdentifierAttribute(type) || "";
            if (!this.targetIdAttribute)
                return utils_1.fail("Cannot create reference to path '" + basePath + "'; the targeted type, " + type.describe() + ", does not specify an identifier property");
        }
        this.setNewValue(identifier);
    }
    Object.defineProperty(Reference.prototype, "get", {
        get: function () {
            var _a = this, targetIdAttribute = _a.targetIdAttribute, identifier = _a.identifier;
            if (identifier === null)
                return null;
            if (!this.basePath)
                return mst_operations_1.resolve(this.owner, identifier); // generic form
            else {
                var targetCollection = mst_operations_1.resolve(this.owner, this.basePath);
                if (mobx_1.isObservableArray(targetCollection)) {
                    return targetCollection.find(function (item) { return item && item[targetIdAttribute] === identifier; });
                }
                else if (mobx_1.isObservableMap(targetCollection)) {
                    var child = targetCollection.get(identifier);
                    if (!(!child || child[targetIdAttribute] === identifier))
                        utils_1.fail("Inconsistent collection, the map entry under key '" + identifier + "' should have property '" + targetIdAttribute + "' set to value '" + identifier);
                    return child;
                }
                else
                    return utils_1.fail("References with base paths should point to either an `array` or `map` collection");
            }
        },
        enumerable: true,
        configurable: true
    });
    Reference.prototype.setNewValue = function (value) {
        if (!value) {
            this.identifier = null;
        }
        else if (mst_node_1.isMST(value)) {
            type_checker_1.typecheck(this.type, value);
            var base = mst_node_1.getMSTAdministration(this.owner);
            var target = mst_node_1.getMSTAdministration(value);
            if (this.targetIdAttribute)
                this.identifier = value[this.targetIdAttribute];
            else {
                if (base.root !== target.root)
                    utils_1.fail("Failed to assign a value to a reference; the value should already be part of the same model tree");
                this.identifier = mst_node_1.getRelativePathForNodes(base, target);
            }
        }
        else if (this.targetIdAttribute) {
            if (typeof value !== "string")
                utils_1.fail("Expected an identifier, got: " + value);
            this.identifier = value;
        }
        else {
            if (!(typeof value === "object" && typeof value.$ref === "string"))
                utils_1.fail("Expected a reference in the format `{ $ref: ... }`, got: " + value);
            this.identifier = value.$ref;
        }
    };
    Reference.prototype.serialize = function () {
        if (this.basePath)
            return this.identifier;
        return this.identifier ? { $ref: this.identifier } : null;
    };
    return Reference;
}());
__decorate([
    mobx_1.observable
], Reference.prototype, "identifier", void 0);
__decorate([
    mobx_1.computed
], Reference.prototype, "get", null);
exports.Reference = Reference;
//# sourceMappingURL=reference.js.map