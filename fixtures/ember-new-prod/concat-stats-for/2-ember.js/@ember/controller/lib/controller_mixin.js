define("@ember/controller/lib/controller_mixin", ["exports", "@ember/-internals/metal", "@ember/-internals/runtime", "@ember/-internals/utils"], function (_exports, _metal, _runtime, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var MODEL = (0, _utils.symbol)('MODEL');
  /**
  @module ember
  */

  /**
    @class ControllerMixin
    @namespace Ember
    @uses Ember.ActionHandler
    @private
  */

  var _default = _metal.Mixin.create(_runtime.ActionHandler, {
    /* ducktype as a controller */
    isController: true,

    /**
      The object to which actions from the view should be sent.
       For example, when a Handlebars template uses the `{{action}}` helper,
      it will attempt to send the action to the view's controller's `target`.
       By default, the value of the target property is set to the router, and
      is injected when a controller is instantiated. This injection is applied
      as part of the application's initialization process. In most cases the
      `target` property will automatically be set to the logical consumer of
      actions for the controller.
       @property target
      @default null
      @public
    */
    target: null,
    store: null,

    /**
      The controller's current model. When retrieving or modifying a controller's
      model, this property should be used instead of the `content` property.
       @property model
      @public
    */
    model: (0, _metal.computed)({
      get: function get() {
        return this[MODEL];
      },
      set: function set(key, value) {
        return this[MODEL] = value;
      }
    })
  });

  _exports.default = _default;
});