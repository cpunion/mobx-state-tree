"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
function runRawAction(actioncall) {
    return actioncall.object[actioncall.name].apply(actioncall.object, actioncall.args);
}
function collectMiddlewareHandlers(node) {
    var handlers = node.middlewares.slice();
    var n = node;
    // Find all middlewares. Optimization: cache this?
    while (n.parent) {
        n = n.parent;
        handlers = handlers.concat(n.middlewares);
    }
    return handlers;
}
function runMiddleWares(node, baseCall) {
    var handlers = collectMiddlewareHandlers(node);
    // Short circuit
    if (!handlers.length)
        return runRawAction(baseCall);
    function runNextMiddleware(call) {
        var handler = handlers.shift(); // Optimization: counter instead of shift is probably faster
        if (handler)
            return handler(call, runNextMiddleware);
        else
            return runRawAction(call);
    }
    return runNextMiddleware(baseCall);
}
function createActionInvoker(name, fn) {
    var action = mobx_1.action(name, fn);
    var actionInvoker = function () {
        var adm = node_1.getStateTreeNode(this);
        adm.assertAlive();
        if (adm.isRunningAction()) {
            // an action is already running in this tree, invoking this action does not emit a new action
            return action.apply(this, arguments);
        }
        else {
            // outer action, run middlewares and start the action!
            var call = {
                name: name,
                object: adm.storedValue,
                args: utils_1.argsToArray(arguments)
            };
            var root = adm.root;
            root._isRunningAction = true;
            try {
                return runMiddleWares(adm, call);
            }
            finally {
                root._isRunningAction = false;
            }
        }
    };
    // This construction helps producing a better function name in the stack trace, but could be optimized
    // away in prod builds, and `actionInvoker` be returned directly
    return utils_1.createNamedFunction(name, actionInvoker);
}
exports.createActionInvoker = createActionInvoker;
function serializeArgument(node, actionName, index, arg) {
    if (utils_1.isPrimitive(arg))
        return arg;
    if (node_1.isStateTreeNode(arg)) {
        var targetNode = node_1.getStateTreeNode(arg);
        if (node.root !== targetNode.root)
            throw new Error("Argument " + index + " that was passed to action '" + actionName + "' is a model that is not part of the same state tree. Consider passing a snapshot or some representative ID instead");
        return ({
            $ref: node.getRelativePathTo(node_1.getStateTreeNode(arg))
        });
    }
    if (typeof arg === "function")
        throw new Error("Argument " + index + " that was passed to action '" + actionName + "' should be a primitive, model object or plain object, received a function");
    if (typeof arg === "object" && !utils_1.isPlainObject(arg) && !Array.isArray(arg))
        throw new Error("Argument " + index + " that was passed to action '" + actionName + "' should be a primitive, model object or plain object, received a " + ((arg && arg.constructor) ? arg.constructor.name : "Complex Object"));
    if (mobx_1.isObservable(arg))
        throw new Error("Argument " + index + " that was passed to action '" + actionName + "' should be a primitive, model object or plain object, received an mobx observable.");
    try {
        // Check if serializable, cycle free etc...
        // MWE: there must be a better way....
        JSON.stringify(arg); // or throws
        return arg;
    }
    catch (e) {
        throw new Error("Argument " + index + " that was passed to action '" + actionName + "' is not serializable.");
    }
}
function deserializeArgument(adm, value) {
    if (typeof value === "object") {
        var keys = Object.keys(value);
        if (keys.length === 1 && keys[0] === "$ref")
            return mst_operations_1.resolvePath(adm.storedValue, value.$ref);
    }
    return value;
}
/**
 * Dispatches an Action on a model instance. All middlewares will be triggered.
 * Returns the value of the last actoin
 *
 * @export
 * @param {Object} target
 * @param {IActionCall} action
 * @param {IActionCallOptions} [options]
 * @returns
 */
function applyAction(target, action) {
    var resolvedTarget = mst_operations_1.tryResolve(target, action.path || "");
    if (!resolvedTarget)
        return utils_1.fail("Invalid action path: " + (action.path || ""));
    var node = node_1.getStateTreeNode(resolvedTarget);
    if (!(typeof resolvedTarget[action.name] === "function"))
        utils_1.fail("Action '" + action.name + "' does not exist in '" + node.path + "'");
    return resolvedTarget[action.name].apply(resolvedTarget, action.args ? action.args.map(function (v) { return deserializeArgument(node, v); }) : []);
}
exports.applyAction = applyAction;
function onAction(target, listener) {
    return mst_operations_1.addMiddleware(target, function (rawCall, next) {
        var sourceNode = node_1.getStateTreeNode(rawCall.object);
        listener({
            name: rawCall.name,
            path: node_1.getStateTreeNode(target).getRelativePathTo(sourceNode),
            args: rawCall.args.map(function (arg, index) { return serializeArgument(sourceNode, rawCall.name, index, arg); })
        });
        return next(rawCall);
    });
}
exports.onAction = onAction;
var node_1 = require("./node");
var mst_operations_1 = require("./mst-operations");
var utils_1 = require("../utils");
//# sourceMappingURL=action.js.map