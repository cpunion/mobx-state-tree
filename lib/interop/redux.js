"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
var mst_operations_1 = require("../core/mst-operations");
var action_1 = require("../core/action");
var utils_1 = require("../utils");
function asReduxStore(model) {
    var middlewares = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middlewares[_i - 1] = arguments[_i];
    }
    if (!core_1.isStateTreeNode(model))
        utils_1.fail("Expected model object");
    var store = {
        getState: function () { return mst_operations_1.getSnapshot(model); },
        dispatch: function (action) {
            runMiddleWare(action, runners.slice(), function (newAction) { return action_1.applyAction(model, reduxActionToAction(newAction)); });
        },
        subscribe: function (listener) { return mst_operations_1.onSnapshot(model, listener); }
    };
    var runners = middlewares.map(function (mw) { return mw(store); });
    return store;
}
exports.asReduxStore = asReduxStore;
function reduxActionToAction(action) {
    var actionArgs = utils_1.extend({}, action);
    delete actionArgs.type;
    return {
        name: action.type,
        args: [actionArgs]
    }; // TODO: restore functionality!
}
function runMiddleWare(action, runners, next) {
    function n(retVal) {
        var f = runners.shift();
        if (f)
            f(n)(retVal);
        else
            next(retVal);
    }
    n(action);
}
function connectReduxDevtools(remoteDevDep, model) {
    // Connect to the monitor
    var remotedev = remoteDevDep.connectViaExtension();
    var applyingSnapshot = false;
    // Subscribe to change state (if need more than just logging)
    remotedev.subscribe(function (message) {
        // Helper when only time travelling needed
        var state = remoteDevDep.extractState(message);
        if (state) {
            applyingSnapshot = true;
            mst_operations_1.applySnapshot(model, state);
            applyingSnapshot = false;
        }
    });
    // Send changes to the remote monitor
    action_1.onAction(model, function (action) {
        if (applyingSnapshot)
            return;
        var copy = {};
        copy.type = action.name;
        if (action.args)
            action.args.forEach(function (value, index) { return copy[index] = value; });
        remotedev.send(copy, mst_operations_1.getSnapshot(model));
    });
}
exports.connectReduxDevtools = connectReduxDevtools;
//# sourceMappingURL=redux.js.map