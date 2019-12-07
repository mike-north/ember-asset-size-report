define("@ember/-internals/routing/lib/system/controller_for", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = controllerFor;

  /**
  @module ember
  */

  /**
    Finds a controller instance.
  
    @for Ember
    @method controllerFor
    @private
  */
  function controllerFor(container, controllerName, lookupOptions) {
    return container.lookup("controller:" + controllerName, lookupOptions);
  }
});