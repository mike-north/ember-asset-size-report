define("@ember/-internals/views/lib/views/states/has_element", ["exports", "@ember/polyfills", "@ember/-internals/views/lib/views/states/default", "@ember/runloop", "@ember/instrumentation"], function (_exports, _polyfills, _default3, _runloop, _instrumentation) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var hasElement = (0, _polyfills.assign)({}, _default3.default, {
    rerender: function rerender(view) {
      view.renderer.rerender(view);
    },
    destroy: function destroy(view) {
      view.renderer.remove(view);
    },
    // Handle events from `Ember.EventDispatcher`
    handleEvent: function handleEvent(view, eventName, event) {
      if (view.has(eventName)) {
        // Handler should be able to re-dispatch events, so we don't
        // preventDefault or stopPropagation.
        return (0, _instrumentation.flaggedInstrument)("interaction." + eventName, {
          event: event,
          view: view
        }, function () {
          return (0, _runloop.join)(view, view.trigger, eventName, event);
        });
      } else {
        return true; // continue event propagation
      }
    }
  });

  var _default2 = Object.freeze(hasElement);

  _exports.default = _default2;
});