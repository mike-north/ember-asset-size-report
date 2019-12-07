define("@ember/-internals/views/lib/views/states", ["exports", "@ember/-internals/views/lib/views/states/pre_render", "@ember/-internals/views/lib/views/states/has_element", "@ember/-internals/views/lib/views/states/in_dom", "@ember/-internals/views/lib/views/states/destroying"], function (_exports, _pre_render, _has_element, _in_dom, _destroying) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*
    Describe how the specified actions should behave in the various
    states that a view can exist in. Possible states:
  
    * preRender: when a view is first instantiated, and after its
      element was destroyed, it is in the preRender state
    * hasElement: the DOM representation of the view is created,
      and is ready to be inserted
    * inDOM: once a view has been inserted into the DOM it is in
      the inDOM state. A view spends the vast majority of its
      existence in this state.
    * destroyed: once a view has been destroyed (using the destroy
      method), it is in this state. No further actions can be invoked
      on a destroyed view.
  */
  var states = Object.freeze({
    preRender: _pre_render.default,
    inDOM: _in_dom.default,
    hasElement: _has_element.default,
    destroying: _destroying.default
  });
  var _default = states;
  _exports.default = _default;
});