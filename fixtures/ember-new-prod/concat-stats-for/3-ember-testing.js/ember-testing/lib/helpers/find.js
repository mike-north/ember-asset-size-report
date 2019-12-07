define("ember-testing/lib/helpers/find", ["exports", "@ember/-internals/metal", "@ember/debug", "@ember/-internals/views"], function (_exports, _metal, _debug, _views) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = find;

  /**
  @module ember
  */

  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = find('.my-selector', '.parent-element-class');
    ```
  
    @method find
    @param {String} selector jQuery selector for element lookup
    @param {String} [context] (optional) jQuery selector that will limit the selector
                              argument to find only within the context's children
    @return {Object} DOM element representing the results of the query
    @public
  */
  function find(app, selector, context) {
    if (_views.jQueryDisabled) {
      (false && !(false) && (0, _debug.assert)('If jQuery is disabled, please import and use helpers from @ember/test-helpers [https://github.com/emberjs/ember-test-helpers]. Note: `find` is not an available helper.'));
    }

    var $el;
    context = context || (0, _metal.get)(app, 'rootElement');
    $el = app.$(selector, context);
    return $el;
  }
});