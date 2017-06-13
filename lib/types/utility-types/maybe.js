"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var union_1 = require("./union");
var literal_1 = require("./literal");
var optional_1 = require("./optional");
var nullType = optional_1.optional(literal_1.literal(null), null);
function maybe(type) {
    // TODO: is identifierAttr correct for maybe?
    return union_1.union(nullType, type);
}
exports.maybe = maybe;
//# sourceMappingURL=maybe.js.map