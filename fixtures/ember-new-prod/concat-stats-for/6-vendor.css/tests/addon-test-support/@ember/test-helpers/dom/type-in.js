define("@ember/test-helpers/dom/type-in", ["exports", "@ember/test-helpers/-utils", "@ember/test-helpers/settled", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/dom/focus", "@ember/test-helpers/dom/-is-focusable", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/dom/trigger-key-event"], function (_exports, _utils, _settled, _getElement, _isFormControl, _focus, _isFocusable, _fireEvent, _triggerKeyEvent) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = typeIn;

  /**
   * Mimics character by character entry into the target `input` or `textarea` element.
   *
   * Allows for simulation of slow entry by passing an optional millisecond delay
   * between key events.
  
   * The major difference between `typeIn` and `fillIn` is that `typeIn` triggers
   * keyboard events as well as `input` and `change`.
   * Typically this looks like `focus` -> `focusin` -> `keydown` -> `keypress` -> `keyup` -> `input` -> `change`
   * per character of the passed text (this may vary on some browsers).
   *
   * @public
   * @param {string|Element} target the element or selector to enter text into
   * @param {string} text the test to fill the element with
   * @param {Object} options {delay: x} (default 50) number of milliseconds to wait per keypress
   * @return {Promise<void>} resolves when the application is settled
   *
   * @example
   * <caption>
   *   Emulating typing in an input using `typeIn`
   * </caption>
   *
   * typeIn('hello world');
   */
  function typeIn(target, text) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `typeIn`.');
      }

      var element = (0, _getElement.default)(target);

      if (!element) {
        throw new Error("Element not found when calling `typeIn('".concat(target, "')`"));
      }

      if (!(0, _isFormControl.default)(element)) {
        throw new Error('`typeIn` is only usable on form controls.');
      }

      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `typeIn`.');
      }

      var _options$delay = options.delay,
          delay = _options$delay === void 0 ? 50 : _options$delay;

      if ((0, _isFocusable.default)(element)) {
        (0, _focus.__focus__)(element);
      }

      return fillOut(element, text, delay).then(function () {
        return (0, _fireEvent.default)(element, 'change');
      }).then(_settled.default);
    });
  } // eslint-disable-next-line require-jsdoc


  function fillOut(element, text, delay) {
    var inputFunctions = text.split('').map(function (character) {
      return keyEntry(element, character);
    });
    return inputFunctions.reduce(function (currentPromise, func) {
      return currentPromise.then(function () {
        return delayedExecute(delay);
      }).then(func);
    }, Ember.RSVP.Promise.resolve(undefined));
  } // eslint-disable-next-line require-jsdoc


  function keyEntry(element, character) {
    var shiftKey = character === character.toUpperCase() && character !== character.toLowerCase();
    var options = {
      shiftKey: shiftKey
    };
    var characterKey = character.toUpperCase();
    return function () {
      return (0, _utils.nextTickPromise)().then(function () {
        return (0, _triggerKeyEvent.__triggerKeyEvent__)(element, 'keydown', characterKey, options);
      }).then(function () {
        return (0, _triggerKeyEvent.__triggerKeyEvent__)(element, 'keypress', characterKey, options);
      }).then(function () {
        element.value = element.value + character;
        (0, _fireEvent.default)(element, 'input');
      }).then(function () {
        return (0, _triggerKeyEvent.__triggerKeyEvent__)(element, 'keyup', characterKey, options);
      });
    };
  } // eslint-disable-next-line require-jsdoc


  function delayedExecute(delay) {
    return new Ember.RSVP.Promise(function (resolve) {
      setTimeout(resolve, delay);
    });
  }
});