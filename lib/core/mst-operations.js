"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("./action");
var mobx_1 = require("mobx");
var node_1 = require("./node");
var json_patch_1 = require("./json-patch");
var utils_1 = require("../utils");
var type_1 = require("../types/type");
function getType(object) {
    return node_1.getStateTreeNode(object).type;
}
exports.getType = getType;
function getChildType(object, child) {
    return node_1.getStateTreeNode(object).getChildType(child);
}
exports.getChildType = getChildType;
/**
 * TODO: update docs
 * Registers middleware on a model instance that is invoked whenever one of it's actions is called, or an action on one of it's children.
 * Will only be invoked on 'root' actions, not on actions called from existing actions.
 *
 * The callback receives two parameter: the `action` parameter describes the action being invoked. The `next()` function can be used
 * to kick off the next middleware in the chain. Not invoking `next()` prevents the action from actually being executed!
 *
 * Action calls have the following signature:
 *
 * ```
 * export type IActionCall = {
 *    name: string;
 *    path?: string;
 *    args?: any[];
 * }
 * ```
 *
 * Example of a logging middleware:
 * ```
 * function logger(action, next) {
 *   console.dir(action)
 *   return next(action)
 * }
 *
 * onAction(myStore, logger)
 *
 * myStore.user.setAge(17)
 *
 * // emits:
 * {
 *    name: "setAge"
 *    path: "/user",
 *    args: [17]
 * }
 * ```
 *
 * @export
 * @param {Object} target model to intercept actions on
 * @param {(action: IActionCall, next: () => void) => void} callback the middleware that should be invoked whenever an action is triggered.
 * @returns {IDisposer} function to remove the middleware
 */
function addMiddleware(target, middleware) {
    var node = node_1.getStateTreeNode(target);
    if (!node.isProtectionEnabled)
        console.warn("It is recommended to protect the state tree before attaching action middleware, as otherwise it cannot be guaranteed that all changes are passed through middleware. See `protect`");
    return node.addMiddleWare(middleware);
}
exports.addMiddleware = addMiddleware;
/**
 * Registers a function that will be invoked for each that as made to the provided model instance, or any of it's children.
 * See 'patches' for more details. onPatch events are emitted immediately and will not await the end of a transaction.
 * Patches can be used to deep observe a model tree.
 *
 * @export
 * @param {Object} target the model instance from which to receive patches
 * @param {(patch: IJsonPatch) => void} callback the callback that is invoked for each patch
 * @returns {IDisposer} function to remove the listener
 */
function onPatch(target, callback) {
    return node_1.getStateTreeNode(target).onPatch(callback);
}
exports.onPatch = onPatch;
function onSnapshot(target, callback) {
    return node_1.getStateTreeNode(target).onSnapshot(callback);
}
exports.onSnapshot = onSnapshot;
/**
 * Applies a JSON-patch to the given model instance or bails out if the patch couldn't be applied
 *
 * @export
 * @param {Object} target
 * @param {IJsonPatch} patch
 * @returns
 */
function applyPatch(target, patch) {
    return node_1.getStateTreeNode(target).applyPatch(patch);
}
exports.applyPatch = applyPatch;
/**
 * Applies a number of JSON patches in a single MobX transaction
 * TODO: merge with applyPatch
 * @export
 * @param {Object} target
 * @param {IJsonPatch[]} patches
 */
function applyPatches(target, patches) {
    var node = node_1.getStateTreeNode(target);
    mobx_1.runInAction(function () {
        patches.forEach(function (p) { return node.applyPatch(p); });
    });
}
exports.applyPatches = applyPatches;
function recordPatches(subject) {
    var recorder = {
        patches: [],
        stop: function () { return disposer(); },
        replay: function (target) {
            applyPatches(target, recorder.patches);
        }
    };
    var disposer = onPatch(subject, function (patch) {
        recorder.patches.push(patch);
    });
    return recorder;
}
exports.recordPatches = recordPatches;
/**
 * Applies a series of actions in a single MobX transaction.
 * TODO: just merge with applyAction
 *
 * Does not return any value
 *
 * @export
 * @param {Object} target
 * @param {IActionCall[]} actions
 * @param {IActionCallOptions} [options]
 */
function applyActions(target, actions) {
    mobx_1.runInAction(function () {
        actions.forEach(function (action) { return action_1.applyAction(target, action); });
    });
}
exports.applyActions = applyActions;
function recordActions(subject) {
    var recorder = {
        actions: [],
        stop: function () { return disposer(); },
        replay: function (target) {
            applyActions(target, recorder.actions);
        }
    };
    var disposer = action_1.onAction(subject, recorder.actions.push.bind(recorder.actions));
    return recorder;
}
exports.recordActions = recordActions;
/**
 * By default it is allowed to both directly modify a model or through an action.
 * However, in some cases you want to guarantee that the state tree is only modified through actions.
 * So that replaying action will reflect everything that can possible have happened to your objects, or that every mutation passes through your action middleware etc.
 * To disable modifying data in the tree without action, simple call `protect(model)`. Protect protects the passed model an all it's children
 *
 * @example
 * const Todo = types.model({
 *     done: false,
 *     toggle() {
 *         this.done = !this.done
 *     }
 * })
 *
 * const todo = new Todo()
 * todo.done = true // OK
 * protect(todo)
 * todo.done = false // throws!
 * todo.toggle() // OK
 */
function protect(target) {
    // TODO: verify that no parent is unprotectd, as that would be a noop
    node_1.getStateTreeNode(target).isProtectionEnabled = true;
}
exports.protect = protect;
function unprotect(target) {
    // TODO: verify that any node in the given tree is unprotected
    node_1.getStateTreeNode(target).isProtectionEnabled = false;
}
exports.unprotect = unprotect;
/**
 * Returns true if the object is in protected mode, @see protect
 */
function isProtected(target) {
    return node_1.getStateTreeNode(target).isProtectionEnabled;
}
exports.isProtected = isProtected;
/**
 * Applies a snapshot to a given model instances. Patch and snapshot listeners will be invoked as usual.
 *
 * @export
 * @param {Object} target
 * @param {Object} snapshot
 * @returns
 */
function applySnapshot(target, snapshot) {
    return node_1.getStateTreeNode(target).applySnapshot(snapshot);
}
exports.applySnapshot = applySnapshot;
function getSnapshot(target) {
    return node_1.getStateTreeNode(target).snapshot;
}
exports.getSnapshot = getSnapshot;
/**
 * Given a model instance, returns `true` if the object has a parent, that is, is part of another object, map or array
 *
 * @export
 * @param {Object} target
 * @param {number} depth = 1, how far should we look upward?
 * @returns {boolean}
 */
function hasParent(target, depth) {
    if (depth === void 0) { depth = 1; }
    if (depth < 0)
        utils_1.fail("Invalid depth: " + depth + ", should be >= 1");
    var parent = node_1.getStateTreeNode(target).parent;
    while (parent) {
        if (--depth === 0)
            return true;
        parent = parent.parent;
    }
    return false;
}
exports.hasParent = hasParent;
function getParent(target, depth) {
    if (depth === void 0) { depth = 1; }
    if (depth < 0)
        utils_1.fail("Invalid depth: " + depth + ", should be >= 1");
    var d = depth;
    var parent = node_1.getStateTreeNode(target).parent;
    while (parent) {
        if (--d === 0)
            return parent.storedValue;
        parent = parent.parent;
    }
    return utils_1.fail("Failed to find the parent of " + node_1.getStateTreeNode(target) + " at depth " + depth);
}
exports.getParent = getParent;
function getRoot(target) {
    return node_1.getStateTreeNode(target).root.storedValue;
}
exports.getRoot = getRoot;
/**
 * Returns the path of the given object in the model tree
 *
 * @export
 * @param {Object} target
 * @returns {string}
 */
function getPath(target) {
    return node_1.getStateTreeNode(target).path;
}
exports.getPath = getPath;
/**
 * Returns the path of the given object as unescaped string array
 *
 * @export
 * @param {Object} target
 * @returns {string[]}
 */
function getPathParts(target) {
    return json_patch_1.splitJsonPath(node_1.getStateTreeNode(target).path);
}
exports.getPathParts = getPathParts;
/**
 * Returns true if the given object is the root of a model tree
 *
 * @export
 * @param {Object} target
 * @returns {boolean}
 */
function isRoot(target) {
    return node_1.getStateTreeNode(target).isRoot;
}
exports.isRoot = isRoot;
/**
 * Resolves a path relatively to a given object.
 *
 * @export
 * @param {Object} target
 * @param {string} path - escaped json path
 * @returns {*}
 */
function resolvePath(target, path) {
    // TODO: give better error messages!
    // TODO: also accept path parts
    var node = node_1.getStateTreeNode(target).resolve(path);
    return node ? node.getValue() : undefined;
}
exports.resolvePath = resolvePath;
function resolveIdentifier(type, target, identifier) {
    if (!type_1.isType(type))
        utils_1.fail("Expected a type as first argument");
    var node = node_1.getStateTreeNode(target).root.identifierCache.resolve(type, "" + identifier);
    return node ? node.getValue() : undefined;
}
exports.resolveIdentifier = resolveIdentifier;
/**
 *
 *
 * @export
 * @param {Object} target
 * @param {string} path
 * @returns {*}
 */
function tryResolve(target, path) {
    var node = node_1.getStateTreeNode(target).resolve(path, false);
    if (node === undefined)
        return undefined;
    return node ? node.getValue() : undefined;
}
exports.tryResolve = tryResolve;
function getRelativePath(base, target) {
    return node_1.getStateTreeNode(base).getRelativePathTo(node_1.getStateTreeNode(target));
}
exports.getRelativePath = getRelativePath;
/**
 *
 *
 * @export
 * @template T
 * @param {T} source
 * @returns {T}
 */
function clone(source, keepEnvironment) {
    if (keepEnvironment === void 0) { keepEnvironment = true; }
    var node = node_1.getStateTreeNode(source);
    return node.type.create(node.snapshot, keepEnvironment === true
        ? node.root._environment
        : keepEnvironment === false
            ? undefined
            : keepEnvironment // it's an object or something else
    );
}
exports.clone = clone;
/**
 * Removes a model element from the state tree, and let it live on as a new state tree
 */
function detach(thing) {
    // TODO: should throw if it cannot be removed from the parent? e.g. parent type wouldn't allow that
    node_1.getStateTreeNode(thing).detach();
    return thing;
}
exports.detach = detach;
/**
 * Removes a model element from the state tree, and mark it as end-of-life; the element should not be used anymore
 */
function destroy(thing) {
    var node = node_1.getStateTreeNode(thing);
    // TODO: should throw if it cannot be removed from the parent? e.g. parent type wouldn't allow that
    if (node.isRoot)
        node.die();
    else
        node.parent.removeChild(node.subpath);
}
exports.destroy = destroy;
function isAlive(thing) {
    return node_1.getStateTreeNode(thing).isAlive;
}
exports.isAlive = isAlive;
function addDisposer(thing, disposer) {
    node_1.getStateTreeNode(thing).addDisposer(disposer);
}
exports.addDisposer = addDisposer;
function getEnv(thing) {
    var node = node_1.getStateTreeNode(thing);
    var env = node.root._environment;
    if (!(!!env))
        utils_1.fail("Node '" + node + "' is not part of state tree that was initialized with an environment. Environment can be passed as second argumentt to .create()");
    return env;
}
exports.getEnv = getEnv;
/**
 * Performs a depth first walk through a tree
 */
function walk(thing, processor) {
    var node = node_1.getStateTreeNode(thing);
    // tslint:disable-next-line:no_unused-variable
    node.getChildren().forEach(function (child) {
        if (node_1.isStateTreeNode(child.storedValue))
            walk(child.storedValue, processor);
    });
    processor(node.storedValue);
}
exports.walk = walk;
//# sourceMappingURL=mst-operations.js.map