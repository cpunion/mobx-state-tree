"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var type_checker_1 = require("../types/type-checker");
var mst_node_1 = require("./mst-node");
var utils_1 = require("../utils");
var json_patch_1 = require("./json-patch");
var object_1 = require("../types/complex-types/object");
var complex_type_1 = require("../types/complex-types/complex-type");
var nextNodeId = 1;
var MSTAdministration = (function () {
    function MSTAdministration(parent, subpath, initialState, type, environment) {
        var _this = this;
        this.nodeId = ++nextNodeId;
        this._parent = null;
        this.subpath = "";
        this.isProtectionEnabled = true;
        this._environment = undefined;
        this._isRunningAction = false; // only relevant for root
        this._isAlive = true; // optimization: use binary flags for all these switches
        this._isDetaching = false;
        this.middlewares = [];
        this.snapshotSubscribers = [];
        this.patchSubscribers = [];
        this.disposers = [];
        if (!(type instanceof complex_type_1.ComplexType))
            utils_1.fail("Uh oh");
        utils_1.addHiddenFinalProp(initialState, "$treenode", this);
        this._parent = parent;
        this.subpath = subpath;
        this.type = type;
        this.target = initialState;
        this._environment = environment;
        // optimization: don't keep the snapshot by default alive with a reaction by default
        // in prod mode. This saves lot of GC overhead (important for e.g. React Native)
        // if the feature is not actively used
        // downside; no structural sharing if getSnapshot is called incidently
        var snapshotDisposer = mobx_1.reaction(function () { return _this.snapshot; }, function (snapshot) {
            _this.snapshotSubscribers.forEach(function (f) { return f(snapshot); });
        });
        snapshotDisposer.onError(function (e) {
            throw e;
        });
        this.addDisposer(snapshotDisposer);
    }
    Object.defineProperty(MSTAdministration.prototype, "path", {
        /**
         * Returnes (escaped) path representation as string
         */
        get: function () {
            if (!this.parent)
                return "";
            return this.parent.path + "/" + json_patch_1.escapeJsonPath(this.subpath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSTAdministration.prototype, "isRoot", {
        get: function () {
            return this._parent === null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSTAdministration.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSTAdministration.prototype, "root", {
        get: function () {
            // future optimization: store root ref in the node and maintain it
            var p, r = this;
            while (p = r.parent)
                r = p;
            return r;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSTAdministration.prototype, "isAlive", {
        get: function () {
            return this._isAlive;
        },
        enumerable: true,
        configurable: true
    });
    MSTAdministration.prototype.die = function () {
        if (this._isDetaching)
            return;
        mst_operations_1.walk(this.target, function (child) { return mst_node_1.getMSTAdministration(child).aboutToDie(); });
        mst_operations_1.walk(this.target, function (child) { return mst_node_1.getMSTAdministration(child).finalizeDeath(); });
    };
    MSTAdministration.prototype.aboutToDie = function () {
        this.disposers.splice(0).forEach(function (f) { return f(); });
        this.fireHook("beforeDestroy");
    };
    MSTAdministration.prototype.finalizeDeath = function () {
        // invariant: not called directly but from "die"
        var self = this;
        var oldPath = this.path;
        utils_1.addReadOnlyProp(this, "snapshot", this.snapshot); // kill the computed prop and just store the last snapshot
        this.patchSubscribers.splice(0);
        this.snapshotSubscribers.splice(0);
        this.patchSubscribers.splice(0);
        this._isAlive = false;
        this._parent = null;
        this.subpath = "";
        // This is quite a hack, once interceptable objects / arrays / maps are extracted from mobx,
        // we could express this in a much nicer way
        Object.defineProperty(this.target, "$mobx", {
            get: function () {
                utils_1.fail("This object has died and is no longer part of a state tree. It cannot be used anymore. The object (of type '" + self.type.name + "') used to live at '" + oldPath + "'. It is possible to access the last snapshot of this object using 'getSnapshot', or to create a fresh copy using 'clone'. If you want to remove an object from the tree without killing it, use 'detach' instead.");
            }
        });
    };
    MSTAdministration.prototype.assertAlive = function () {
        if (!this._isAlive)
            utils_1.fail(this + " cannot be used anymore as it has died; it has been removed from a state tree. If you want to remove an element from a tree and let it live on, use 'detach' or 'clone' the value");
    };
    Object.defineProperty(MSTAdministration.prototype, "snapshot", {
        get: function () {
            if (!this._isAlive)
                return undefined;
            // advantage of using computed for a snapshot is that nicely respects transactions etc.
            // Optimization: only freeze on dev builds
            return Object.freeze(this.type.serialize(this));
        },
        enumerable: true,
        configurable: true
    });
    MSTAdministration.prototype.onSnapshot = function (onChange) {
        return utils_1.registerEventHandler(this.snapshotSubscribers, onChange);
    };
    MSTAdministration.prototype.applySnapshot = function (snapshot) {
        type_checker_1.typecheck(this.type, snapshot);
        return this.type.applySnapshot(this, snapshot);
    };
    MSTAdministration.prototype.applyPatch = function (patch) {
        var parts = json_patch_1.splitJsonPath(patch.path);
        var node = this.resolvePath(parts.slice(0, -1));
        node.pseudoAction(function () {
            node.applyPatchLocally(parts[parts.length - 1], patch);
        });
    };
    MSTAdministration.prototype.applyPatchLocally = function (subpath, patch) {
        this.assertWritable();
        this.type.applyPatchLocally(this, subpath, patch);
    };
    MSTAdministration.prototype.onPatch = function (onPatch) {
        return utils_1.registerEventHandler(this.patchSubscribers, onPatch);
    };
    MSTAdministration.prototype.emitPatch = function (patch, source) {
        if (this.patchSubscribers.length) {
            var localizedPatch_1 = utils_1.extend({}, patch, {
                path: source.path.substr(this.path.length) + "/" + patch.path // calculate the relative path of the patch
            });
            this.patchSubscribers.forEach(function (f) { return f(localizedPatch_1); });
        }
        if (this.parent)
            this.parent.emitPatch(patch, source);
    };
    MSTAdministration.prototype.setParent = function (newParent, subpath) {
        if (subpath === void 0) { subpath = null; }
        if (this.parent === newParent && this.subpath === subpath)
            return;
        if (this._parent && newParent && newParent !== this._parent) {
            utils_1.fail("A node cannot exists twice in the state tree. Failed to add " + this + " to path '" + newParent.path + "/" + subpath + "'.");
        }
        if (!this._parent && newParent && newParent.root === this) {
            utils_1.fail("A state tree is not allowed to contain itself. Cannot assign " + this + " to path '" + newParent.path + "/" + subpath + "'");
        }
        if (!this._parent && !!this._environment) {
            utils_1.fail("A state tree that has been initialized with an environment cannot be made part of another state tree.");
        }
        if (this.parent && !newParent) {
            this.die();
        }
        else {
            this._parent = newParent;
            this.subpath = subpath || "";
            this.fireHook("afterAttach");
        }
    };
    MSTAdministration.prototype.addDisposer = function (disposer) {
        this.disposers.unshift(disposer);
    };
    MSTAdministration.prototype.reconcileChildren = function (childType, oldValues, newValues, newPaths) {
        var _this = this;
        // optimization: overload for a single old / new value to avoid all the array allocations
        // optimization: skip reconciler for non-complex types
        var res = new Array(newValues.length);
        var oldValuesByNode = {};
        var oldValuesById = {};
        var identifierAttribute = object_1.getIdentifierAttribute(childType);
        // Investigate which values we could reconcile
        oldValues.forEach(function (oldValue) {
            if (!oldValue)
                return;
            if (identifierAttribute) {
                var id = oldValue[identifierAttribute];
                if (id)
                    oldValuesById[id] = oldValue;
            }
            if (mst_node_1.isMST(oldValue)) {
                oldValuesByNode[mst_node_1.getMSTAdministration(oldValue).nodeId] = oldValue;
            }
        });
        // Prepare new values, try to reconcile
        newValues.forEach(function (newValue, index) {
            var subPath = "" + newPaths[index];
            if (mst_node_1.isMST(newValue)) {
                var childNode = mst_node_1.getMSTAdministration(newValue);
                childNode.assertAlive();
                if (childNode.parent && (childNode.parent !== _this || !oldValuesByNode[childNode.nodeId]))
                    return utils_1.fail("Cannot add an object to a state tree if it is already part of the same or another state tree. Tried to assign an object to '" + _this.path + "/" + subPath + "', but it lives already at '" + childNode.path + "'");
                // Try to reconcile based on already existing nodes
                oldValuesByNode[childNode.nodeId] = undefined;
                childNode.setParent(_this, subPath);
                res[index] = newValue;
            }
            else if (identifierAttribute && utils_1.isMutable(newValue)) {
                type_checker_1.typecheck(childType, newValue);
                // Try to reconcile based on id
                var id = newValue[identifierAttribute];
                var existing = oldValuesById[id];
                var childNode = existing && mst_node_1.getMSTAdministration(existing);
                if (existing && childNode.type.is(newValue)) {
                    oldValuesByNode[childNode.nodeId] = undefined;
                    childNode.setParent(_this, subPath);
                    childNode.applySnapshot(newValue);
                    res[index] = existing;
                }
                else {
                    res[index] = childType.create(newValue, undefined, _this, subPath); // any -> we don't want this typing public
                }
            }
            else {
                type_checker_1.typecheck(childType, newValue);
                // create a fresh MST node
                res[index] = childType.create(newValue, undefined, _this, subPath); // any -> we don't want this typing public
            }
        });
        // Kill non reconciled values
        for (var key in oldValuesByNode)
            if (oldValuesByNode[key])
                mst_node_1.getMSTAdministration(oldValuesByNode[key]).die();
        return res;
    };
    MSTAdministration.prototype.resolve = function (path, failIfResolveFails) {
        if (failIfResolveFails === void 0) { failIfResolveFails = true; }
        return this.resolvePath(json_patch_1.splitJsonPath(path), failIfResolveFails);
    };
    MSTAdministration.prototype.resolvePath = function (pathParts, failIfResolveFails) {
        if (failIfResolveFails === void 0) { failIfResolveFails = true; }
        this.assertAlive();
        // counter part of getRelativePath
        // note that `../` is not part of the JSON pointer spec, which is actually a prefix format
        // in json pointer: "" = current, "/a", attribute a, "/" is attribute "" etc...
        // so we treat leading ../ apart...
        var current = this;
        for (var i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === "")
                current = current.root;
            else if (pathParts[i] === "..")
                current = current.parent;
            else if (pathParts[i] === "." || pathParts[i] === "")
                continue;
            else
                current = current.getChildMST(pathParts[i]);
            if (current === null) {
                if (failIfResolveFails)
                    return utils_1.fail("Could not resolve '" + pathParts[i] + "' in '" + json_patch_1.joinJsonPath(pathParts.slice(0, i - 1)) + "', path of the patch does not resolve");
                else
                    return undefined;
            }
        }
        return current;
    };
    MSTAdministration.prototype.isRunningAction = function () {
        if (this._isRunningAction)
            return true;
        if (this.isRoot)
            return false;
        return this.parent.isRunningAction();
    };
    MSTAdministration.prototype.addMiddleWare = function (handler) {
        // TODO: check / warn if not protected!
        return utils_1.registerEventHandler(this.middlewares, handler);
    };
    MSTAdministration.prototype.getChildMST = function (subpath) {
        this.assertAlive();
        return this.type.getChildMST(this, subpath);
    };
    MSTAdministration.prototype.getChildMSTs = function () {
        return this.type.getChildMSTs(this);
    };
    MSTAdministration.prototype.getChildType = function (key) {
        return this.type.getChildType(key);
    };
    Object.defineProperty(MSTAdministration.prototype, "isProtected", {
        get: function () {
            var cur = this;
            while (cur) {
                if (cur.isProtectionEnabled === false)
                    return false;
                cur = cur.parent;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Pseudo action is an action that is not named, does not trigger middleware but does unlock the tree.
     * Used for applying (initial) snapshots and patches
     */
    MSTAdministration.prototype.pseudoAction = function (fn) {
        var inAction = this._isRunningAction;
        this._isRunningAction = true;
        fn();
        this._isRunningAction = inAction;
    };
    MSTAdministration.prototype.assertWritable = function () {
        this.assertAlive();
        if (!this.isRunningAction() && this.isProtected) {
            utils_1.fail("Cannot modify '" + this + "', the object is protected and can only be modified by using an action.");
        }
    };
    MSTAdministration.prototype.removeChild = function (subpath) {
        this.type.removeChild(this, subpath);
    };
    MSTAdministration.prototype.detach = function () {
        if (!this._isAlive)
            utils_1.fail("Error while detaching, node is not alive.");
        if (this.isRoot)
            return;
        else {
            this.fireHook("beforeDetach");
            this._environment = this.root._environment; // make backup of environment
            this._isDetaching = true;
            this.parent.removeChild(this.subpath);
            this._parent = null;
            this.subpath = "";
            this._isDetaching = false;
        }
    };
    MSTAdministration.prototype.fireHook = function (name) {
        var fn = this.target[name];
        if (typeof fn === "function")
            fn.apply(this.target);
    };
    MSTAdministration.prototype.toString = function () {
        var identifierAttr = object_1.getIdentifierAttribute(this.type);
        var identifier = identifierAttr ? "(" + identifierAttr + ": " + this.target[identifierAttr] + ")" : "";
        return this.type.name + "@" + (this.path || "<root>") + identifier + (this.isAlive ? "" : "[dead]");
    };
    return MSTAdministration;
}());
__decorate([
    mobx_1.observable
], MSTAdministration.prototype, "_parent", void 0);
__decorate([
    mobx_1.observable
], MSTAdministration.prototype, "subpath", void 0);
__decorate([
    mobx_1.computed
], MSTAdministration.prototype, "path", null);
__decorate([
    mobx_1.computed
], MSTAdministration.prototype, "snapshot", null);
__decorate([
    mobx_1.action
], MSTAdministration.prototype, "applyPatch", null);
exports.MSTAdministration = MSTAdministration;
var mst_operations_1 = require("./mst-operations");
//# sourceMappingURL=mst-node-administration.js.map