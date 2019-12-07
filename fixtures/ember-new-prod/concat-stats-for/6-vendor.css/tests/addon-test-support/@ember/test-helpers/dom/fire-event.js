define("@ember/test-helpers/dom/fire-event", ["exports", "@ember/test-helpers/dom/-target", "@ember/test-helpers/-tuple"], function (_exports, _target, _tuple) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isKeyboardEventType = isKeyboardEventType;
  _exports.isMouseEventType = isMouseEventType;
  _exports.isFileSelectionEventType = isFileSelectionEventType;
  _exports.isFileSelectionInput = isFileSelectionInput;
  _exports.default = _exports.KEYBOARD_EVENT_TYPES = void 0;

  // eslint-disable-next-line require-jsdoc
  var MOUSE_EVENT_CONSTRUCTOR = function () {
    try {
      new MouseEvent('test');
      return true;
    } catch (e) {
      return false;
    }
  }();

  var DEFAULT_EVENT_OPTIONS = {
    bubbles: true,
    cancelable: true
  };
  var KEYBOARD_EVENT_TYPES = (0, _tuple.default)('keydown', 'keypress', 'keyup'); // eslint-disable-next-line require-jsdoc

  _exports.KEYBOARD_EVENT_TYPES = KEYBOARD_EVENT_TYPES;

  function isKeyboardEventType(eventType) {
    return KEYBOARD_EVENT_TYPES.indexOf(eventType) > -1;
  }

  var MOUSE_EVENT_TYPES = (0, _tuple.default)('click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'); // eslint-disable-next-line require-jsdoc

  function isMouseEventType(eventType) {
    return MOUSE_EVENT_TYPES.indexOf(eventType) > -1;
  }

  var FILE_SELECTION_EVENT_TYPES = (0, _tuple.default)('change'); // eslint-disable-next-line require-jsdoc

  function isFileSelectionEventType(eventType) {
    return FILE_SELECTION_EVENT_TYPES.indexOf(eventType) > -1;
  } // eslint-disable-next-line require-jsdoc


  function isFileSelectionInput(element) {
    return element.files;
  }
  /**
    Internal helper used to build and dispatch events throughout the other DOM helpers.
  
    @private
    @param {Element} element the element to dispatch the event to
    @param {string} eventType the type of event
    @param {Object} [options] additional properties to be set on the event
    @returns {Event} the event that was dispatched
  */


  function fireEvent(element, eventType) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!element) {
      throw new Error('Must pass an element to `fireEvent`');
    }

    var event;

    if (isKeyboardEventType(eventType)) {
      event = buildKeyboardEvent(eventType, options);
    } else if (isMouseEventType(eventType)) {
      var rect;

      if (element instanceof Window && element.document.documentElement) {
        rect = element.document.documentElement.getBoundingClientRect();
      } else if ((0, _target.isDocument)(element)) {
        rect = element.documentElement.getBoundingClientRect();
      } else if ((0, _target.isElement)(element)) {
        rect = element.getBoundingClientRect();
      } else {
        return;
      }

      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(eventType, Ember.assign(simulatedCoordinates, options));
    } else if (isFileSelectionEventType(eventType) && isFileSelectionInput(element)) {
      event = buildFileEvent(eventType, element, options);
    } else {
      event = buildBasicEvent(eventType, options);
    }

    element.dispatchEvent(event);
    return event;
  }

  var _default = fireEvent; // eslint-disable-next-line require-jsdoc

  _exports.default = _default;

  function buildBasicEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var event = document.createEvent('Events');
    var bubbles = options.bubbles !== undefined ? options.bubbles : true;
    var cancelable = options.cancelable !== undefined ? options.cancelable : true;
    delete options.bubbles;
    delete options.cancelable; // bubbles and cancelable are readonly, so they can be
    // set when initializing event

    event.initEvent(type, bubbles, cancelable);
    Ember.assign(event, options);
    return event;
  } // eslint-disable-next-line require-jsdoc


  function buildMouseEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var event;
    var eventOpts = Ember.assign({
      view: window
    }, DEFAULT_EVENT_OPTIONS, options);

    if (MOUSE_EVENT_CONSTRUCTOR) {
      event = new MouseEvent(type, eventOpts);
    } else {
      try {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
      } catch (e) {
        event = buildBasicEvent(type, options);
      }
    }

    return event;
  } // eslint-disable-next-line require-jsdoc


  function buildKeyboardEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var eventOpts = Ember.assign({}, DEFAULT_EVENT_OPTIONS, options);
    var event;
    var eventMethodName;

    try {
      event = new KeyboardEvent(type, eventOpts); // Property definitions are required for B/C for keyboard event usage
      // If this properties are not defined, when listening for key events
      // keyCode/which will be 0. Also, keyCode and which now are string
      // and if app compare it with === with integer key definitions,
      // there will be a fail.
      //
      // https://w3c.github.io/uievents/#interface-keyboardevent
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

      Object.defineProperty(event, 'keyCode', {
        get: function get() {
          return parseInt(eventOpts.keyCode);
        }
      });
      Object.defineProperty(event, 'which', {
        get: function get() {
          return parseInt(eventOpts.which);
        }
      });
      return event;
    } catch (e) {// left intentionally blank
    }

    try {
      event = document.createEvent('KeyboardEvents');
      eventMethodName = 'initKeyboardEvent';
    } catch (e) {// left intentionally blank
    }

    if (!event) {
      try {
        event = document.createEvent('KeyEvents');
        eventMethodName = 'initKeyEvent';
      } catch (e) {// left intentionally blank
      }
    }

    if (event && eventMethodName) {
      event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } else {
      event = buildBasicEvent(type, options);
    }

    return event;
  } // eslint-disable-next-line require-jsdoc


  function buildFileEvent(type, element) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var event = buildBasicEvent(type);
    var files;

    if (Array.isArray(options)) {
      (false && !(false) && Ember.deprecate('Passing the `options` param as an array to `triggerEvent` for file inputs is deprecated. Please pass an object with a key `files` containing the array instead.', false, {
        id: 'ember-test-helpers.trigger-event.options-blob-array',
        until: '2.0.0'
      }));
      files = options;
    } else {
      files = options.files;
    }

    if (Array.isArray(files)) {
      Object.defineProperty(files, 'item', {
        value: function value(index) {
          return typeof index === 'number' ? this[index] : null;
        }
      });
      Object.defineProperty(element, 'files', {
        value: files,
        configurable: true
      });
    }

    Object.defineProperty(event, 'target', {
      value: element
    });
    return event;
  }
});