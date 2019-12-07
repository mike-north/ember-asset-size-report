define("@ember/-internals/console/index", ["exports", "@ember/debug", "@ember/deprecated-features"], function (_exports, _debug, _deprecatedFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  // Deliver message that the function is deprecated
  var DEPRECATION_MESSAGE = 'Use of Ember.Logger is deprecated. Please use `console` for logging.';
  var DEPRECATION_ID = 'ember-console.deprecate-logger';
  var DEPRECATION_URL = 'https://emberjs.com/deprecations/v3.x#toc_use-console-rather-than-ember-logger';
  /**
     @module ember
  */

  /**
    Inside Ember-Metal, simply uses the methods from `imports.console`.
    Override this to provide more robust logging functionality.
  
    @class Logger
    @deprecated Use 'console' instead
  
    @namespace Ember
    @public
  */

  var DEPRECATED_LOGGER;

  if (_deprecatedFeatures.LOGGER) {
    DEPRECATED_LOGGER = {
      /**
      Logs the arguments to the console.
      You can pass as many arguments as you want and they will be joined together with a space.
       ```javascript
      var foo = 1;
      Ember.Logger.log('log value of foo:', foo);
      // "log value of foo: 1" will be printed to the console
      ```
      @method log
      @for Ember.Logger
      @param {*} arguments
      @public
      */
      log: function log() {
        var _console;

        (false && !(false) && (0, _debug.deprecate)(DEPRECATION_MESSAGE, false, {
          id: DEPRECATION_ID,
          until: '4.0.0',
          url: DEPRECATION_URL
        }));
        return (_console = console).log.apply(_console, arguments); // eslint-disable-line no-console
      },

      /**
      Prints the arguments to the console with a warning icon.
      You can pass as many arguments as you want and they will be joined together with a space.
       ```javascript
      Ember.Logger.warn('Something happened!');
      // "Something happened!" will be printed to the console with a warning icon.
      ```
      @method warn
      @for Ember.Logger
      @param {*} arguments
      @public
      */
      warn: function warn() {
        var _console2;

        (false && !(false) && (0, _debug.deprecate)(DEPRECATION_MESSAGE, false, {
          id: DEPRECATION_ID,
          until: '4.0.0',
          url: DEPRECATION_URL
        }));
        return (_console2 = console).warn.apply(_console2, arguments); // eslint-disable-line no-console
      },

      /**
      Prints the arguments to the console with an error icon, red text and a stack trace.
      You can pass as many arguments as you want and they will be joined together with a space.
       ```javascript
      Ember.Logger.error('Danger! Danger!');
      // "Danger! Danger!" will be printed to the console in red text.
      ```
      @method error
      @for Ember.Logger
      @param {*} arguments
      @public
      */
      error: function error() {
        var _console3;

        (false && !(false) && (0, _debug.deprecate)(DEPRECATION_MESSAGE, false, {
          id: DEPRECATION_ID,
          until: '4.0.0',
          url: DEPRECATION_URL
        }));
        return (_console3 = console).error.apply(_console3, arguments); // eslint-disable-line no-console
      },

      /**
      Logs the arguments to the console.
      You can pass as many arguments as you want and they will be joined together with a space.
       ```javascript
      var foo = 1;
      Ember.Logger.info('log value of foo:', foo);
      // "log value of foo: 1" will be printed to the console
      ```
      @method info
      @for Ember.Logger
      @param {*} arguments
      @public
      */
      info: function info() {
        var _console4;

        (false && !(false) && (0, _debug.deprecate)(DEPRECATION_MESSAGE, false, {
          id: DEPRECATION_ID,
          until: '4.0.0',
          url: DEPRECATION_URL
        }));
        return (_console4 = console).info.apply(_console4, arguments); // eslint-disable-line no-console
      },

      /**
      Logs the arguments to the console in blue text.
      You can pass as many arguments as you want and they will be joined together with a space.
       ```javascript
      var foo = 1;
      Ember.Logger.debug('log value of foo:', foo);
      // "log value of foo: 1" will be printed to the console
      ```
      @method debug
      @for Ember.Logger
      @param {*} arguments
      @public
      */
      debug: function debug() {
        var _console6;

        (false && !(false) && (0, _debug.deprecate)(DEPRECATION_MESSAGE, false, {
          id: DEPRECATION_ID,
          until: '4.0.0',
          url: DEPRECATION_URL
        }));
        /* eslint-disable no-console */

        if (console.debug) {
          var _console5;

          return (_console5 = console).debug.apply(_console5, arguments);
        }

        return (_console6 = console).info.apply(_console6, arguments);
        /* eslint-enable no-console */
      },

      /**
      If the value passed into `Ember.Logger.assert` is not truthy it will throw an error with a stack trace.
       ```javascript
      Ember.Logger.assert(true); // undefined
      Ember.Logger.assert(true === false); // Throws an Assertion failed error.
      Ember.Logger.assert(true === false, 'Something invalid'); // Throws an Assertion failed error with message.
      ```
      @method assert
      @for Ember.Logger
      @param {Boolean} bool Value to test
      @param {String} message Assertion message on failed
      @public
      */
      assert: function assert() {
        var _console7;

        (false && !(false) && (0, _debug.deprecate)(DEPRECATION_MESSAGE, false, {
          id: DEPRECATION_ID,
          until: '4.0.0',
          url: DEPRECATION_URL
        }));
        return (_console7 = console).assert.apply(_console7, arguments); // eslint-disable-line no-console
      }
    };
  }

  var _default = DEPRECATED_LOGGER;
  _exports.default = _default;
});