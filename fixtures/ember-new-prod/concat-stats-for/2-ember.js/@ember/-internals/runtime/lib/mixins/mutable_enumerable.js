define("@ember/-internals/runtime/lib/mixins/mutable_enumerable", ["exports", "@ember/-internals/runtime/lib/mixins/enumerable", "@ember/-internals/metal"], function (_exports, _enumerable, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */

  /**
    The methods in this mixin have been moved to MutableArray. This mixin has
    been intentionally preserved to avoid breaking MutableEnumerable.detect
    checks until the community migrates away from them.
  
    @class MutableEnumerable
    @namespace Ember
    @uses Enumerable
    @private
  */
  var _default = _metal.Mixin.create(_enumerable.default);

  _exports.default = _default;
});