define("@ember/-internals/views/lib/views/core_view", ["exports", "@ember/-internals/runtime", "@ember/-internals/views/lib/views/states"], function (_exports, _runtime, _states) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
    `Ember.CoreView` is an abstract class that exists to give view-like behavior
    to both Ember's main view class `Component` and other classes that don't need
    the full functionality of `Component`.
  
    Unless you have specific needs for `CoreView`, you will use `Component`
    in your applications.
  
    @class CoreView
    @namespace Ember
    @extends EmberObject
    @deprecated Use `Component` instead.
    @uses Evented
    @uses Ember.ActionHandler
    @private
  */
  var CoreView = _runtime.FrameworkObject.extend(_runtime.Evented, _runtime.ActionHandler, {
    isView: true,
    _states: _states.default,
    init: function init() {
      this._super.apply(this, arguments);

      this._state = 'preRender';
      this._currentState = this._states.preRender;

      if (!this.renderer) {
        throw new Error("Cannot instantiate a component without a renderer. Please ensure that you are creating " + this + " with a proper container/registry.");
      }
    },

    /**
      If the view is currently inserted into the DOM of a parent view, this
      property will point to the parent of the view.
       @property parentView
      @type Ember.View
      @default null
      @private
    */
    parentView: null,
    instrumentDetails: function instrumentDetails(hash) {
      hash.object = this.toString();
      hash.containerKey = this._debugContainerKey;
      hash.view = this;
      return hash;
    },

    /**
      Override the default event firing from `Evented` to
      also call methods with the given name.
       @method trigger
      @param name {String}
      @private
    */
    trigger: function trigger(name) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this._super.apply(this, arguments);

      var method = this[name];

      if (typeof method === 'function') {
        return method.apply(this, args);
      }
    },
    has: function has(name) {
      return typeof this[name] === 'function' || this._super(name);
    }
  });

  CoreView.reopenClass({
    isViewFactory: true
  });
  var _default = CoreView;
  _exports.default = _default;
});