"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no_unused-variable
var map_1 = require("./complex-types/map");
var array_1 = require("./complex-types/array");
var identifier_1 = require("./utility-types/identifier");
// tslint:disable-next-line:no_unused-variable
var object_1 = require("./complex-types/object");
var reference_1 = require("./utility-types/reference");
var union_1 = require("./utility-types/union");
var optional_1 = require("./utility-types/optional");
var literal_1 = require("./utility-types/literal");
var maybe_1 = require("./utility-types/maybe");
var refinement_1 = require("./utility-types/refinement");
var frozen_1 = require("./utility-types/frozen");
var primitives_1 = require("./primitives");
var late_1 = require("./utility-types/late");
exports.types = {
    model: object_1.model,
    extend: object_1.extend,
    reference: reference_1.reference,
    union: union_1.union,
    optional: optional_1.optional,
    literal: literal_1.literal,
    maybe: maybe_1.maybe,
    refinement: refinement_1.refinement,
    string: primitives_1.string,
    boolean: primitives_1.boolean,
    number: primitives_1.number,
    Date: primitives_1.DatePrimitive,
    map: map_1.map,
    array: array_1.array,
    frozen: frozen_1.frozen,
    identifier: identifier_1.identifier,
    late: late_1.late
};
//# sourceMappingURL=index.js.map