"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var mobx_1 = require("mobx");
var IdentifierCache = (function () {
    function IdentifierCache() {
        this.cache = mobx_1.observable.map();
    }
    IdentifierCache.prototype.addNodeToCache = function (node) {
        if (node.identifierAttribute) {
            var identifier = node.identifier;
            if (!this.cache.has(identifier)) {
                this.cache.set(identifier, mobx_1.observable.shallowArray());
            }
            var set = this.cache.get(identifier);
            if (set.indexOf(node) !== -1)
                utils_1.fail("Already registered");
            set.push(node);
        }
        return this;
    };
    IdentifierCache.prototype.mergeCache = function (node) {
        var _this = this;
        node.identifierCache.cache.values().forEach(function (nodes) { return nodes.forEach(function (child) {
            _this.addNodeToCache(child);
        }); });
    };
    IdentifierCache.prototype.notifyDied = function (node) {
        if (node.identifierAttribute) {
            var set = this.cache.get(node.identifier);
            if (set)
                set.remove(node);
        }
    };
    IdentifierCache.prototype.splitCache = function (node) {
        var res = new IdentifierCache();
        var basePath = node.path;
        this.cache.values().forEach(function (nodes) {
            for (var i = nodes.length - 1; i >= 0; i--) {
                if (nodes[i].path.indexOf(basePath) === 0) {
                    res.addNodeToCache(nodes[i]);
                    nodes.splice(i, 1);
                }
            }
        });
        return res;
    };
    IdentifierCache.prototype.resolve = function (type, identifier) {
        var set = this.cache.get(identifier);
        if (!set)
            return null;
        var matches = set.filter(function (candidate) { return type.isAssignableFrom(candidate.type); });
        switch (matches.length) {
            case 0: return null;
            case 1: return matches[0];
            default:
                return utils_1.fail("Cannot resolve a reference to type '" + type.name + "' with id: '" + identifier + "' unambigously, there are multiple candidates: " + matches.map(function (n) { return n.path; }).join(", "));
        }
    };
    return IdentifierCache;
}());
exports.IdentifierCache = IdentifierCache;
//# sourceMappingURL=identifier-cache.js.map