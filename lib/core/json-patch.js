"use strict";
// https://tools.ietf.org/html/rfc6902
// http://jsonpatch.com/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * escape slashes and backslashes
 * http://tools.ietf.org/html/rfc6901
 */
function escapeJsonPath(str) {
    return str.replace(/~/g, "~1").replace(/\//g, "~0");
}
exports.escapeJsonPath = escapeJsonPath;
/**
 * unescape slashes and backslashes
 */
function unescapeJsonPath(str) {
    return str.replace(/~0/g, "\\").replace(/~1/g, "~");
}
exports.unescapeJsonPath = unescapeJsonPath;
function joinJsonPath(path) {
    // `/` refers to property with an empty name, while `` refers to root itself!
    if (path.length === 0)
        return "";
    return "/" + path.map(escapeJsonPath).join("/");
}
exports.joinJsonPath = joinJsonPath;
function splitJsonPath(path) {
    // `/` refers to property with an empty name, while `` refers to root itself!
    var parts = path.split("/").map(unescapeJsonPath);
    // path '/a/b/c' -> a b c
    // path '../../b/c -> .. .. b c
    return parts[0] === "" ? parts.slice(1) : parts;
}
exports.splitJsonPath = splitJsonPath;
//# sourceMappingURL=json-patch.js.map