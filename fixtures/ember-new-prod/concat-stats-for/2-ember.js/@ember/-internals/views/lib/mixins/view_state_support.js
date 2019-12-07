define("@ember/-internals/views/lib/mixins/view_state_support", ["exports", "@ember/-internals/metal"], function (_exports, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */
  var _default = _metal.Mixin.create({
    _transitionTo: function _transitionTo(state) {
      var priorState = this._currentState;
      var currentState = this._currentState = this._states[state];
      this._state = state;

      if (priorState && priorState.exit) {
        priorState.exit(this);
      }

      if (currentState.enter) {
        currentState.enter(this);
      }
    }
  });

  _exports.default = _default;
});