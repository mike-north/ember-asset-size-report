define("@ember/-internals/views/lib/views/states/destroying", ["exports", "@ember/polyfills", "@ember/error", "@ember/-internals/views/lib/views/states/default"], function (_exports, _polyfills, _error, _default3) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var destroying = (0, _polyfills.assign)({}, _default3.default, {
    appendChild: function appendChild() {
      throw new _error.default("You can't call appendChild on a view being destroyed");
    },
    rerender: function rerender() {
      throw new _error.default("You can't call rerender on a view being destroyed");
    }
  });

  var _default2 = Object.freeze(destroying);

  _exports.default = _default2;
});