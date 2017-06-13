"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function prettyPrintValue(value) {
    return typeof value === "function"
        ? "<function" + (value.name ? " " + value.name : "") + ">"
        : core_1.isStateTreeNode(value)
            ? "<" + value + ">"
            : "`" + JSON.stringify(value) + "`";
}
exports.prettyPrintValue = prettyPrintValue;
function toErrorString(error) {
    var value = error.value;
    var type = error.context[error.context.length - 1].type;
    var fullPath = error.context.map(function (_a) {
        var path = _a.path;
        return path;
    }).filter(function (path) { return path.length > 0; }).join("/");
    var pathPrefix = fullPath.length > 0 ? "at path \"/" + fullPath + "\" " : "";
    var currentTypename = core_1.isStateTreeNode(value)
        ? "value of type " + core_1.getStateTreeNode(value).type.name + ":"
        : utils_1.isPrimitive(value) ? "value" : "snapshot";
    var isSnapshotCompatible = type && core_1.isStateTreeNode(value) && type.is(core_1.getStateTreeNode(value).snapshot);
    return "" + pathPrefix + currentTypename + " " + prettyPrintValue(value) + " is not assignable " + (type ? "to type: `" + type.name + "`" : "") +
        (error.message ? " (" + error.message + ")" : "") +
        (type ?
            (primitives_1.isPrimitiveType(type) || (type instanceof optional_1.OptionalValue && primitives_1.isPrimitiveType(type.type))
                ? "."
                : (", expected an instance of `" + type.name + "` or a snapshot like `" + type.describe() + "` instead." +
                    (isSnapshotCompatible ? " (Note that a snapshot of the provided value is compatible with the targeted type)" : ""))) : ".");
}
function getDefaultContext(type) {
    return [{ type: type, path: "" }];
}
exports.getDefaultContext = getDefaultContext;
function getContextForPath(context, path, type) {
    return context.concat([{ path: path, type: type }]);
}
exports.getContextForPath = getContextForPath;
function typeCheckSuccess() {
    return utils_1.EMPTY_ARRAY;
}
exports.typeCheckSuccess = typeCheckSuccess;
function typeCheckFailure(context, value, message) {
    return [{ context: context, value: value, message: message }];
}
exports.typeCheckFailure = typeCheckFailure;
function flattenTypeErrors(errors) {
    return errors.reduce(function (a, i) { return a.concat(i); }, []);
}
exports.flattenTypeErrors = flattenTypeErrors;
// TODO; typecheck should be invoked from: type.create and array / map / value.property will change
function typecheck(type, value) {
    var errors = type.validate(value, [{ path: "", type: type }]);
    if (errors.length > 0) {
        utils_1.fail("Error while converting " + prettyPrintValue(value) + " to `" + type.name + "`:\n" +
            errors.map(toErrorString).join("\n"));
    }
}
exports.typecheck = typecheck;
var utils_1 = require("../utils");
var core_1 = require("../core");
var primitives_1 = require("./primitives");
var optional_1 = require("./utility-types/optional");
//# sourceMappingURL=type-checker.js.map