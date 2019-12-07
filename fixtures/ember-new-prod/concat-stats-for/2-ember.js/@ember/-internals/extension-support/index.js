define("@ember/-internals/extension-support/index", ["exports", "@ember/-internals/extension-support/lib/data_adapter", "@ember/-internals/extension-support/lib/container_debug_adapter"], function (_exports, _data_adapter, _container_debug_adapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "DataAdapter", {
    enumerable: true,
    get: function get() {
      return _data_adapter.default;
    }
  });
  Object.defineProperty(_exports, "ContainerDebugAdapter", {
    enumerable: true,
    get: function get() {
      return _container_debug_adapter.default;
    }
  });
});