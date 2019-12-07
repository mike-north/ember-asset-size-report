define("@ember/polyfills/index", ["exports", "@ember/deprecated-features", "@ember/polyfills/lib/merge", "@ember/polyfills/lib/assign", "@ember/polyfills/lib/weak_set"], function (_exports, _deprecatedFeatures, _merge, _assign, _weak_set) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "assign", {
    enumerable: true,
    get: function get() {
      return _assign.default;
    }
  });
  Object.defineProperty(_exports, "assignPolyfill", {
    enumerable: true,
    get: function get() {
      return _assign.assign;
    }
  });
  Object.defineProperty(_exports, "_WeakSet", {
    enumerable: true,
    get: function get() {
      return _weak_set.default;
    }
  });
  _exports.merge = void 0;
  var merge = _deprecatedFeatures.MERGE ? _merge.default : undefined; // Export `assignPolyfill` for testing

  _exports.merge = merge;
});