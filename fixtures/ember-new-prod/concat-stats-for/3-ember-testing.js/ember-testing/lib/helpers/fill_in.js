define("ember-testing/lib/helpers/fill_in", ["exports", "ember-testing/lib/events", "ember-testing/lib/helpers/-is-form-control"], function (_exports, _events, _isFormControl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = fillIn;

  /**
  @module ember
  */

  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise<undefined>}
    @public
  */
  function fillIn(app, selector, contextOrText, text) {
    var $el, el, context;

    if (text === undefined) {
      text = contextOrText;
    } else {
      context = contextOrText;
    }

    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    (0, _events.focus)(el);

    if ((0, _isFormControl.default)(el)) {
      el.value = text;
    } else {
      el.innerHTML = text;
    }

    (0, _events.fireEvent)(el, 'input');
    (0, _events.fireEvent)(el, 'change');
    return app.testHelpers.wait();
  }
});