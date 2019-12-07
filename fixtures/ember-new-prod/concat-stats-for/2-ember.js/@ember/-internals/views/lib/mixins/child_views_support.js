define("@ember/-internals/views/lib/mixins/child_views_support", ["exports", "@ember/-internals/metal", "@ember/-internals/views/lib/system/utils"], function (_exports, _metal, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */
  var _default = _metal.Mixin.create({
    /**
      Array of child views. You should never edit this array directly.
       @property childViews
      @type Array
      @default []
      @private
    */
    childViews: (0, _metal.nativeDescDecorator)({
      configurable: false,
      enumerable: false,
      get: function get() {
        return (0, _utils.getChildViews)(this);
      }
    }),
    appendChild: function appendChild(view) {
      (0, _utils.addChildView)(this, view);
    }
  });

  _exports.default = _default;
});