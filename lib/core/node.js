"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var nextNodeId = 1;
var Node = (function () {
    // TODO: should have environment as well?
    function Node(type, parent, subpath, environment, storedValue) {
        var _this = this;
        // optimization: these fields make MST memory expensive for primitives. Most can be initialized lazily, or with EMPTY_ARRAY on prototype
        this.nodeId = ++nextNodeId;
        this._parent = null;
        this.subpath = "";
        this.isProtectionEnabled = true;
        this.identifierAttribute = undefined; // not to be modified directly, only through model initialization
        this._environment = undefined;
        this._isRunningAction = false; // only relevant for root
        this._autoUnbox = true; // unboxing is disabled when reading child nodes
        this._isAlive = true; // optimization: use binary flags for all these switches
        this._isDetaching = false;
        this.middlewares = [];
        this.snapshotSubscribers = [];
        this.patchSubscribers = [];
        this.disposers = [];
        this.type = type;
        this._parent = parent;
        this.subpath = subpath;
        this.storedValue = storedValue;
        this._environment = environment;
        this.unbox = this.unbox.bind(this);
        // optimization: don't keep the snapshot by default alive with a reaction by default
        // in prod mode. This saves lot of GC overhead (important for e.g. React Native)
        // if the feature is not actively used
        // downside; no structural sharing if getSnapshot is called incidently
        var snapshotDisposer = mobx_1.reaction(function () { return _this.snapshot; }, function (snapshot) {
            _this.emitSnapshot(snapshot);
        });
        snapshotDisposer.onError(function (e) {
            throw e;
        });
        this.addDisposer(snapshotDisposer);
    }
    Object.defineProperty(Node.prototype, "identifier", {
        get: function () {
            return this.identifierAttribute ? this.storedValue[this.identifierAttribute] : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "path", {
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
    Object.defineProperty(Node.prototype, "isRoot", {
        get: function () {
            return this.parent === null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "root", {
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
    Node.prototype.getRelativePathTo = function (target) {
        // PRE condition target is (a child of) base!
        if (this.root !== target.root)
            utils_1.fail("Cannot calculate relative path: objects '" + this + "' and '" + target + "' are not part of the same object tree");
        var baseParts = json_patch_1.splitJsonPath(this.path);
        var targetParts = json_patch_1.splitJsonPath(target.path);
        var common = 0;
        for (; common < baseParts.length; common++) {
            if (baseParts[common] !== targetParts[common])
                break;
        }
        // TODO: assert that no targetParts paths are "..", "." or ""!
        return baseParts.slice(common).map(function (_) { return ".."; }).join("/")
            + json_patch_1.joinJsonPath(targetParts.slice(common));
    };
    Node.prototype.resolve = function (path, failIfResolveFails) {
        if (failIfResolveFails === void 0) { failIfResolveFails = true; }
        return this.resolvePath(json_patch_1.splitJsonPath(path), failIfResolveFails);
    };
    Node.prototype.resolvePath = function (pathParts, failIfResolveFails) {
        if (failIfResolveFails === void 0) { failIfResolveFails = true; }
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
            else if (current) {
                current = current.getChildNode(pathParts[i]);
                continue;
            }
            if (!current) {
                if (failIfResolveFails)
                    return utils_1.fail("Could not resolve '" + pathParts[i] + "' in '" + json_patch_1.joinJsonPath(pathParts.slice(0, i - 1)) + "', path of the patch does not resolve");
                else
                    return undefined;
            }
        }
        return current;
    };
    Node.prototype.getValue = function () {
        return this.type.getValue(this);
    };
    Object.defineProperty(Node.prototype, "isAlive", {
        get: function () {
            return this._isAlive;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.die = function () {
        if (this._isDetaching)
            return;
        if (isStateTreeNode(this.storedValue)) {
            mst_operations_1.walk(this.storedValue, function (child) { return getStateTreeNode(child).aboutToDie(); });
            mst_operations_1.walk(this.storedValue, function (child) { return getStateTreeNode(child).finalizeDeath(); });
        }
    };
    Node.prototype.aboutToDie = function () {
        this.disposers.splice(0).forEach(function (f) { return f(); });
        this.fireHook("beforeDestroy");
    };
    Node.prototype.finalizeDeath = function () {
        // invariant: not called directly but from "die"
        this.root.identifierCache.notifyDied(this);
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
        Object.defineProperty(this.storedValue, "$mobx", {
            get: function () {
                utils_1.fail("This object has died and is no longer part of a state tree. It cannot be used anymore. The object (of type '" + self.type.name + "') used to live at '" + oldPath + "'. It is possible to access the last snapshot of this object using 'getSnapshot', or to create a fresh copy using 'clone'. If you want to remove an object from the tree without killing it, use 'detach' instead.");
            }
        });
    };
    Node.prototype.assertAlive = function () {
        if (!this._isAlive)
            utils_1.fail(this + " cannot be used anymore as it has died; it has been removed from a state tree. If you want to remove an element from a tree and let it live on, use 'detach' or 'clone' the value");
    };
    Object.defineProperty(Node.prototype, "snapshot", {
        get: function () {
            if (!this._isAlive)
                return undefined;
            // advantage of using computed for a snapshot is that nicely respects transactions etc.
            // Optimization: only freeze on dev builds
            return Object.freeze(this.type.getSnapshot(this));
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.onSnapshot = function (onChange) {
        return utils_1.registerEventHandler(this.snapshotSubscribers, onChange);
    };
    Node.prototype.applySnapshot = function (snapshot) {
        type_checker_1.typecheck(this.type, snapshot);
        return this.type.applySnapshot(this, snapshot);
    };
    Node.prototype.emitSnapshot = function (snapshot) {
        this.snapshotSubscribers.forEach(function (f) { return f(snapshot); });
    };
    Node.prototype.applyPatch = function (patch) {
        var parts = json_patch_1.splitJsonPath(patch.path);
        var node = this.resolvePath(parts.slice(0, -1));
        node.pseudoAction(function () {
            node.applyPatchLocally(parts[parts.length - 1], patch);
        });
    };
    Node.prototype.applyPatchLocally = function (subpath, patch) {
        this.assertWritable();
        this.type.applyPatchLocally(this, subpath, patch);
    };
    Node.prototype.onPatch = function (onPatch) {
        return utils_1.registerEventHandler(this.patchSubscribers, onPatch);
    };
    Node.prototype.emitPatch = function (patch, source) {
        if (this.patchSubscribers.length) {
            var localizedPatch_1 = utils_1.extend({}, patch, {
                path: source.path.substr(this.path.length) + "/" + patch.path // calculate the relative path of the patch
            });
            this.patchSubscribers.forEach(function (f) { return f(localizedPatch_1); });
        }
        if (this.parent)
            this.parent.emitPatch(patch, source);
    };
    Node.prototype.setParent = function (newParent, subpath) {
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
            this.subpath = subpath || "";
            if (newParent && newParent !== this._parent) {
                newParent.root.identifierCache.mergeCache(this);
                this._parent = newParent;
                this.fireHook("afterAttach");
            }
        }
    };
    Node.prototype.addDisposer = function (disposer) {
        this.disposers.unshift(disposer);
    };
    Node.prototype.reconcileChildren = function (parent, childType, oldNodes, newValues, newPaths) {
        var _this = this;
        // TODO: move to array, rewrite to use type.reconcile
        // TODO: pick identifiers based on actual type instead of declared type
        // optimization: overload for a single old / new value to avoid all the array allocations
        // optimization: skip reconciler for non-complex types
        var res = new Array(newValues.length);
        var nodesToBeKilled = {};
        var oldNodesByIdentifier = {};
        function findReconcilationCandidates(snapshot) {
            for (var attr in oldNodesByIdentifier) {
                var id = snapshot[attr];
                if ((typeof id === "string" || typeof id === "number") && oldNodesByIdentifier[attr][id])
                    return oldNodesByIdentifier[attr][id];
            }
            return null;
        }
        // Investigate which values we could reconcile, and mark them all as potentially dead
        oldNodes.forEach(function (oldNode) {
            if (oldNode.identifierAttribute)
                (oldNodesByIdentifier[oldNode.identifierAttribute] || (oldNodesByIdentifier[oldNode.identifierAttribute] = {}))[oldNode.identifier] = oldNode;
            nodesToBeKilled[oldNode.nodeId] = oldNode;
        });
        // Prepare new values, try to reconcile
        newValues.forEach(function (newValue, index) {
            var subPath = "" + newPaths[index];
            if (isStateTreeNode(newValue)) {
                // A tree node...
                var childNode = getStateTreeNode(newValue);
                childNode.assertAlive();
                if (childNode.parent === parent) {
                    // Came from this array already
                    if (!nodesToBeKilled[childNode.nodeId]) {
                        // this node is owned by this parent, but not in the reconcilable set, so it must be double
                        utils_1.fail("Cannot add an object to a state tree if it is already part of the same or another state tree. Tried to assign an object to '" + parent.path + "/" + subPath + "', but it lives already at '" + childNode.path + "'");
                    }
                    nodesToBeKilled[childNode.nodeId] = undefined;
                    childNode.setParent(parent, subPath);
                    res[index] = childNode; // reuse node
                }
                else {
                    // Lives somewhere else (note that instantiate might still reconcile for complex types!)
                    res[index] = childType.instantiate(_this, subPath, undefined, newValue);
                }
            }
            else if (utils_1.isMutable(newValue)) {
                // The snapshot of a tree node, try to reconcile based on id
                var reconcilationCandidate = findReconcilationCandidates(newValue);
                if (reconcilationCandidate) {
                    var childNode = childType.reconcile(reconcilationCandidate, newValue);
                    nodesToBeKilled[reconcilationCandidate.nodeId] = undefined;
                    childNode.setParent(_this, subPath);
                    res[index] = childNode;
                }
                else {
                    res[index] = childType.instantiate(_this, subPath, undefined, newValue);
                }
            }
            else {
                // create a fresh MST node
                res[index] = childType.instantiate(_this, subPath, undefined, newValue);
            }
        });
        // Kill non reconciled values
        for (var key in nodesToBeKilled)
            if (nodesToBeKilled[key] !== undefined)
                nodesToBeKilled[key].die();
        return res;
    };
    Node.prototype.isRunningAction = function () {
        if (this._isRunningAction)
            return true;
        if (this.isRoot)
            return false;
        return this.parent.isRunningAction();
    };
    Node.prototype.addMiddleWare = function (handler) {
        // TODO: check / warn if not protected!
        return utils_1.registerEventHandler(this.middlewares, handler);
    };
    Node.prototype.getChildNode = function (subpath) {
        this.assertAlive();
        this._autoUnbox = false;
        var res = this.type.getChildNode(this, subpath);
        this._autoUnbox = true;
        return res;
    };
    Node.prototype.getChildren = function () {
        this.assertAlive();
        this._autoUnbox = false;
        var res = this.type.getChildren(this);
        this._autoUnbox = true;
        return res;
    };
    Node.prototype.getChildType = function (key) {
        return this.type.getChildType(key);
    };
    Object.defineProperty(Node.prototype, "isProtected", {
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
    Node.prototype.pseudoAction = function (fn) {
        var inAction = this._isRunningAction;
        this._isRunningAction = true;
        fn();
        this._isRunningAction = inAction;
    };
    Node.prototype.assertWritable = function () {
        this.assertAlive();
        if (!this.isRunningAction() && this.isProtected) {
            utils_1.fail("Cannot modify '" + this + "', the object is protected and can only be modified by using an action.");
        }
    };
    Node.prototype.removeChild = function (subpath) {
        this.type.removeChild(this, subpath);
    };
    Node.prototype.detach = function () {
        if (!this._isAlive)
            utils_1.fail("Error while detaching, node is not alive.");
        if (this.isRoot)
            return;
        else {
            this.fireHook("beforeDetach");
            this._environment = this.root._environment; // make backup of environment
            this._isDetaching = true;
            this.identifierCache = this.root.identifierCache.splitCache(this);
            this.parent.removeChild(this.subpath);
            this._parent = null;
            this.subpath = "";
            this._isDetaching = false;
        }
    };
    Node.prototype.unbox = function (childNode) {
        if (this._autoUnbox === true)
            return childNode.getValue();
        return childNode;
    };
    Node.prototype.fireHook = function (name) {
        var fn = this.storedValue && typeof this.storedValue === "object" && this.storedValue[name];
        if (typeof fn === "function")
            fn.apply(this.storedValue);
    };
    Node.prototype.toString = function () {
        var identifier = this.identifier ? "(id: " + this.identifier + ")" : "";
        return this.type.name + "@" + (this.path || "<root>") + identifier + (this.isAlive ? "" : "[dead]");
    };
    return Node;
}());
__decorate([
    mobx_1.observable
], Node.prototype, "_parent", void 0);
__decorate([
    mobx_1.observable
], Node.prototype, "subpath", void 0);
__decorate([
    mobx_1.computed
], Node.prototype, "path", null);
__decorate([
    mobx_1.computed
], Node.prototype, "snapshot", null);
__decorate([
    mobx_1.action
], Node.prototype, "applyPatch", null);
exports.Node = Node;
function isStateTreeNode(value) {
    return !!(value && value.$treenode);
}
exports.isStateTreeNode = isStateTreeNode;
function getStateTreeNode(value) {
    if (isStateTreeNode(value))
        return value.$treenode;
    else
        return utils_1.fail("element has no Node");
}
exports.getStateTreeNode = getStateTreeNode;
function canAttachNode(value) {
    return value && typeof value === "object" && !isStateTreeNode(value) && !Object.isFrozen(value);
}
function toJSON() {
    return getStateTreeNode(this).snapshot;
}
function createNode(type, parent, subpath, environment, initialValue, createNewInstance, finalizeNewInstance) {
    if (createNewInstance === void 0) { createNewInstance = utils_1.identity; }
    if (finalizeNewInstance === void 0) { finalizeNewInstance = utils_1.noop; }
    if (isStateTreeNode(initialValue)) {
        var targetNode = getStateTreeNode(initialValue);
        if (!targetNode.isRoot)
            utils_1.fail("Cannot add an object to a state tree if it is already part of the same or another state tree. Tried to assign an object to '" + (parent ? parent.path : "") + "/" + subpath + "', but it lives already at '" + targetNode.path + "'");
        targetNode.setParent(parent, subpath);
        return targetNode;
    }
    var instance = createNewInstance(initialValue);
    var canAttachTreeNode = canAttachNode(instance);
    // tslint:disable-next-line:no_unused-variable
    var node = new Node(type, parent, subpath, environment, instance);
    if (!parent)
        node.identifierCache = new identifier_cache_1.IdentifierCache();
    if (canAttachTreeNode)
        utils_1.addHiddenFinalProp(instance, "$treenode", node);
    var sawException = true;
    try {
        if (canAttachTreeNode)
            utils_1.addReadOnlyProp(instance, "toJSON", toJSON);
        node.pseudoAction(function () {
            finalizeNewInstance(node, initialValue);
        });
        if (parent)
            parent.root.identifierCache.addNodeToCache(node);
        else
            node.identifierCache.addNodeToCache(node);
        node.fireHook("afterCreate");
        if (parent)
            node.fireHook("afterAttach");
        sawException = false;
        return node;
    }
    finally {
        if (sawException) {
            // short-cut to die the instance, to avoid the snapshot computed starting to throw...
            node._isAlive = false;
        }
    }
}
exports.createNode = createNode;
var json_patch_1 = require("./json-patch");
var type_checker_1 = require("../types/type-checker");
var mst_operations_1 = require("./mst-operations");
var utils_1 = require("../utils");
var identifier_cache_1 = require("./identifier-cache");
//# sourceMappingURL=node.js.map