define("@ember/-internals/views/lib/views/states/default", ["exports", "@ember/error"], function (_exports, _error) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    // appendChild is only legal while rendering the buffer.
    appendChild: function appendChild() {
      throw new _error.default("You can't use appendChild outside of the rendering process");
    },
    // Handle events from `Ember.EventDispatcher`
    handleEvent: function handleEvent() {
      return true; // continue event propagation
    },
    rerender: function rerender() {},
    destroy: function destroy() {}
  };

  var _default2 = Object.freeze(_default);

  _exports.default = _default2;
});