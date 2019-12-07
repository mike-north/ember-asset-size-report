define("@ember/-internals/views/lib/views/states/in_dom", ["exports", "@ember/-internals/utils", "@ember/polyfills", "@ember/error", "@ember/-internals/views/lib/views/states/has_element"], function (_exports, _utils, _polyfills, _error, _has_element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var inDOM = (0, _polyfills.assign)({}, _has_element.default, {
    enter: function enter(view) {
      // Register the view for event handling. This hash is used by
      // Ember.EventDispatcher to dispatch incoming events.
      view.renderer.register(view);

      if (false
      /* DEBUG */
      ) {
        var elementId = view.elementId;

        if (true
        /* EMBER_METAL_TRACKED_PROPERTIES */
        ) {
            (0, _utils.teardownMandatorySetter)(view, 'elementId');
          }

        Object.defineProperty(view, 'elementId', {
          configurable: true,
          enumerable: true,
          get: function get() {
            return elementId;
          },
          set: function set() {
            throw new _error.default("Changing a view's elementId after creation is not allowed");
          }
        });
      }
    },
    exit: function exit(view) {
      view.renderer.unregister(view);
    }
  });

  var _default = Object.freeze(inDOM);

  _exports.default = _default;
});