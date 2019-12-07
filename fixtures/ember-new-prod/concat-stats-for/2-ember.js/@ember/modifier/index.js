define("@ember/modifier/index", ["exports", "@ember/-internals/glimmer"], function (_exports, _glimmer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "setModifierManager", {
    enumerable: true,
    get: function get() {
      return _glimmer.setModifierManager;
    }
  });
  Object.defineProperty(_exports, "capabilties", {
    enumerable: true,
    get: function get() {
      return _glimmer.modifierCapabilities;
    }
  });
});