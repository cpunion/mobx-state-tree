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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var utils_1 = require("../../utils");
var type_1 = require("../type");
var core_1 = require("../../core");
var type_checker_1 = require("../type-checker");
var primitives_1 = require("../primitives");
var identifier_1 = require("../utility-types/identifier");
var optional_1 = require("../utility-types/optional");
var identifier_property_1 = require("../property-types/identifier-property");
var computed_property_1 = require("../property-types/computed-property");
var value_property_1 = require("../property-types/value-property");
var action_property_1 = require("../property-types/action-property");
var view_property_1 = require("../property-types/view-property");
function objectTypeToString() {
    return core_1.getStateTreeNode(this).toString();
}
var ObjectType = (function (_super) {
    __extends(ObjectType, _super);
    function ObjectType(name, baseModel, baseActions) {
        var _this = _super.call(this, name) || this;
        _this.shouldAttachNode = true;
        _this.flags = type_1.TypeFlags.Object;
        /**
         * Parsed description of all properties
         */
        _this.props = {};
        _this.createNewInstance = function () {
            var instance = new _this.modelConstructor();
            mobx_1.extendShallowObservable(instance, {});
            return instance;
        };
        _this.finalizeNewInstance = function (node, snapshot) {
            var instance = node.storedValue;
            _this.forAllProps(function (prop) { return prop.initialize(instance, snapshot); });
            mobx_1.intercept(instance, function (change) { return _this.willChange(change); } /* wait for typing fix in mobx */);
            mobx_1.observe(instance, _this.didChange);
        };
        _this.didChange = function (change) {
            _this.props[change.name].didChange(change);
        };
        Object.freeze(baseModel); // make sure nobody messes with it
        Object.freeze(baseActions);
        _this.baseModel = baseModel;
        _this.baseActions = baseActions;
        if (!(/^\w[\w\d_]*$/.test(name)))
            utils_1.fail("Typename should be a valid identifier: " + name);
        _this.modelConstructor = new Function("return function " + name + " (){}")(); // fancy trick to get a named function...., http://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript
        _this.modelConstructor.prototype.toString = objectTypeToString;
        _this.parseModelProps();
        _this.forAllProps(function (prop) { return prop.initializePrototype(_this.modelConstructor.prototype); });
        return _this;
    }
    ObjectType.prototype.instantiate = function (parent, subpath, environment, snapshot) {
        return core_1.createNode(this, parent, subpath, environment, snapshot, this.createNewInstance, this.finalizeNewInstance);
    };
    ObjectType.prototype.willChange = function (change) {
        var node = core_1.getStateTreeNode(change.object);
        node.assertWritable();
        // TODO: assigning a new snapshot / MST to a property should result in a nice patch in itself
        return this.props[change.name].willChange(change);
    };
    ObjectType.prototype.parseModelProps = function () {
        var _a = this, baseModel = _a.baseModel, baseActions = _a.baseActions;
        var alreadySeenIdentifierAttribute = null;
        for (var key in baseModel)
            if (utils_1.hasOwnProperty(baseModel, key)) {
                // TODO: check that hooks are not defined as part of baseModel
                var descriptor = Object.getOwnPropertyDescriptor(baseModel, key);
                if ("get" in descriptor) {
                    this.props[key] = new computed_property_1.ComputedProperty(key, descriptor.get, descriptor.set);
                    continue;
                }
                var value = descriptor.value;
                if (value === null || undefined) {
                    utils_1.fail("The default value of an attribute cannot be null or undefined as the type cannot be inferred. Did you mean `types.maybe(someType)`?");
                }
                else if (utils_1.isPrimitive(value)) {
                    var baseType = primitives_1.getPrimitiveFactoryFromValue(value);
                    this.props[key] = new value_property_1.ValueProperty(key, optional_1.optional(baseType, value));
                }
                else if (identifier_1.isIdentifierType(value)) {
                    if (alreadySeenIdentifierAttribute !== null)
                        utils_1.fail("Cannot define property '" + key + "' as object identifier, property '" + alreadySeenIdentifierAttribute + "' is already defined as identifier property");
                    alreadySeenIdentifierAttribute = key;
                    this.props[key] = new identifier_property_1.IdentifierProperty(key, value);
                }
                else if (type_1.isType(value)) {
                    this.props[key] = new value_property_1.ValueProperty(key, value);
                }
                else if (typeof value === "function") {
                    this.props[key] = new view_property_1.ViewProperty(key, value);
                }
                else if (typeof value === "object") {
                    // if (!Array.isArray(value) && isPlainObject(value)) {
                    //     TODO: also check if the entire type is simple! (no identifiers and other complex types)
                    //     this.props[key] = new ValueProperty(key, createDefaultValueFactory(
                    //         createModelFactory(this.name + "__" + key, value),
                    //         () => value)
                    //     )
                    // } else {
                    // TODO: in future also expand on `[Type]` and  `[{ x: 3 }]`
                    utils_1.fail("In property '" + key + "': base model's should not contain complex values: '" + value + "'");
                    // }
                }
                else {
                    utils_1.fail("Unexpected value for property '" + key + "'");
                }
            }
        for (var key in baseActions)
            if (utils_1.hasOwnProperty(baseActions, key)) {
                var value = baseActions[key];
                if (key in this.baseModel)
                    utils_1.fail("Property '" + key + "' was also defined as action. Actions and properties should not collide");
                if (typeof value === "function") {
                    this.props[key] = new action_property_1.ActionProperty(key, value);
                }
                else {
                    utils_1.fail("Unexpected value for action '" + key + "'. Expected function, got " + typeof value);
                }
            }
    };
    ObjectType.prototype.getChildren = function (node) {
        var res = [];
        this.forAllProps(function (prop) {
            if (prop instanceof value_property_1.ValueProperty)
                res.push(prop.getValueNode(node.storedValue));
        });
        return res;
    };
    ObjectType.prototype.getChildNode = function (node, key) {
        if (!(this.props[key] instanceof value_property_1.ValueProperty))
            return utils_1.fail("Not a value property: " + key);
        return this.props[key].getValueNode(node.storedValue);
    };
    ObjectType.prototype.getValue = function (node) {
        return node.storedValue;
    };
    ObjectType.prototype.getSnapshot = function (node) {
        var res = {};
        this.forAllProps(function (prop) { return prop.serialize(node.storedValue, res); });
        return res;
    };
    ObjectType.prototype.applyPatchLocally = function (node, subpath, patch) {
        if (!(patch.op === "replace" || patch.op === "add"))
            utils_1.fail("object does not support operation " + patch.op);
        node.storedValue[subpath] = patch.value;
    };
    ObjectType.prototype.applySnapshot = function (node, snapshot) {
        var _this = this;
        // TODO:fix: all props should be processed when applying snapshot, and reset to default if needed?
        node.pseudoAction(function () {
            for (var key in _this.props)
                _this.props[key].deserialize(node.storedValue, snapshot);
        });
    };
    ObjectType.prototype.getChildType = function (key) {
        return this.props[key].type;
    };
    ObjectType.prototype.isValidSnapshot = function (value, context) {
        var _this = this;
        if (!utils_1.isPlainObject(value)) {
            return type_checker_1.typeCheckFailure(context, value);
        }
        return type_checker_1.flattenTypeErrors(Object.keys(this.props).map(function (path) { return _this.props[path].validate(value, context); }));
    };
    ObjectType.prototype.forAllProps = function (fn) {
        var _this = this;
        // optimization: persists keys or loop more efficiently
        Object.keys(this.props).forEach(function (key) { return fn(_this.props[key]); });
    };
    ObjectType.prototype.describe = function () {
        var _this = this;
        // TODO: make proptypes responsible
        // optimization: cache
        return "{ " + Object.keys(this.props).map(function (key) {
            var prop = _this.props[key];
            return prop instanceof value_property_1.ValueProperty
                ? key + ": " + prop.type.describe()
                : prop instanceof identifier_property_1.IdentifierProperty
                    ? key + ": identifier"
                    : "";
        }).filter(Boolean).join("; ") + " }";
    };
    ObjectType.prototype.getDefaultSnapshot = function () {
        return {};
    };
    ObjectType.prototype.removeChild = function (node, subpath) {
        node.storedValue[subpath] = null;
    };
    return ObjectType;
}(type_1.ComplexType));
__decorate([
    mobx_1.action
], ObjectType.prototype, "applySnapshot", null);
exports.ObjectType = ObjectType;
function model(arg1, arg2, arg3) {
    var name = typeof arg1 === "string" ? arg1 : "AnonymousModel";
    var baseModel = typeof arg1 === "string" ? arg2 : arg1;
    var actions = typeof arg1 === "string" ? arg3 : arg2;
    return new ObjectType(name, baseModel, actions || {});
}
exports.model = model;
function getObjectFactoryBaseModel(item) {
    var type = type_1.isType(item) ? item : core_1.getType(item);
    return isObjectFactory(type) ? type.baseModel : {};
}
function getObjectFactoryBaseActions(item) {
    var type = type_1.isType(item) ? item : core_1.getType(item);
    return isObjectFactory(type) ? type.baseActions : {};
}
function extend() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.warn("[mobx-state-tree] `extend` is an experimental feature and it's behavior will probably change in the future");
    var baseFactories = typeof args[0] === "string" ? args.slice(1) : args;
    var factoryName = typeof args[0] === "string" ? args[0] : baseFactories.map(function (f) { return f.name; }).join("_");
    var properties = utils_1.extendKeepGetter.apply(null, [{}].concat(baseFactories.map(getObjectFactoryBaseModel)));
    var actions = utils_1.extend.apply(null, [{}].concat(baseFactories.map(getObjectFactoryBaseActions)));
    return model(factoryName, properties, actions);
}
exports.extend = extend;
function isObjectFactory(type) {
    return type_1.isType(type) && (type.flags & type_1.TypeFlags.Object) > 0;
}
exports.isObjectFactory = isObjectFactory;
//# sourceMappingURL=object.js.map