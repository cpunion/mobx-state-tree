"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_patch_1 = require("./json-patch");
function getType(object) {
    return getMSTAdministration(object).type;
}
exports.getType = getType;
function getChildType(object, child) {
    return getMSTAdministration(object).getChildType(child);
}
exports.getChildType = getChildType;
function isMST(value) {
    return value && value.$treenode;
}
exports.isMST = isMST;
function getMSTAdministration(value) {
    if (isMST(value))
        return value.$treenode;
    else
        return utils_1.fail("element has no Node");
}
exports.getMSTAdministration = getMSTAdministration;
/**
 * Tries to convert a value to a TreeNode. If possible or already done,
 * the first callback is invoked, otherwise the second.
 * The result of this function is the return value of the callbacks, or the original value if the second callback is omitted
 */
function maybeMST(value, asNodeCb, asPrimitiveCb) {
    // Optimization: maybeNode might be quite inefficient runtime wise, might be factored out at expensive places
    if (utils_1.isMutable(value) && isMST(value)) {
        var n = getMSTAdministration(value);
        return asNodeCb(n, n.target);
    }
    else if (asPrimitiveCb) {
        return asPrimitiveCb(value);
    }
    else {
        return value;
    }
}
exports.maybeMST = maybeMST;
function valueToSnapshot(thing) {
    if (thing instanceof Date) {
        return {
            $treetype: "Date",
            time: thing.toJSON()
        };
    }
    if (isMST(thing))
        return getMSTAdministration(thing).snapshot;
    if (utils_1.isSerializable(thing))
        return thing;
    utils_1.fail("Unable to convert value to snapshot.");
}
exports.valueToSnapshot = valueToSnapshot;
function getRelativePathForNodes(base, target) {
    // PRE condition target is (a child of) base!
    if (base.root !== target.root)
        utils_1.fail("Cannot calculate relative path: objects '" + base + "' and '" + target + "' are not part of the same object tree");
    var baseParts = json_patch_1.splitJsonPath(base.path);
    var targetParts = json_patch_1.splitJsonPath(target.path);
    var common = 0;
    for (; common < baseParts.length; common++) {
        if (baseParts[common] !== targetParts[common])
            break;
    }
    // TODO: assert that no targetParts paths are "..", "." or ""!
    return baseParts.slice(common).map(function (_) { return ".."; }).join("/")
        + json_patch_1.joinJsonPath(targetParts.slice(common));
}
exports.getRelativePathForNodes = getRelativePathForNodes;
var utils_1 = require("../utils");
//# sourceMappingURL=mst-node.js.map