define("@ember/-internals/runtime/lib/mixins/enumerable", ["exports", "@ember/-internals/metal"], function (_exports, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/enumerable
  @private
  */

  /**
    The methods in this mixin have been moved to [MutableArray](/ember/release/classes/MutableArray). This mixin has
    been intentionally preserved to avoid breaking Enumerable.detect checks
    until the community migrates away from them.
  
    @class Enumerable
    @private
  */
  var _default = _metal.Mixin.create();

  _exports.default = _default;
});