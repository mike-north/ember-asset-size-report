define("@ember/application/index", ["exports", "@ember/-internals/owner", "@ember/application/lib/lazy_load", "@ember/application/lib/application"], function (_exports, _owner, _lazy_load, _application) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "getOwner", {
    enumerable: true,
    get: function get() {
      return _owner.getOwner;
    }
  });
  Object.defineProperty(_exports, "setOwner", {
    enumerable: true,
    get: function get() {
      return _owner.setOwner;
    }
  });
  Object.defineProperty(_exports, "onLoad", {
    enumerable: true,
    get: function get() {
      return _lazy_load.onLoad;
    }
  });
  Object.defineProperty(_exports, "runLoadHooks", {
    enumerable: true,
    get: function get() {
      return _lazy_load.runLoadHooks;
    }
  });
  Object.defineProperty(_exports, "_loaded", {
    enumerable: true,
    get: function get() {
      return _lazy_load._loaded;
    }
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _application.default;
    }
  });
});