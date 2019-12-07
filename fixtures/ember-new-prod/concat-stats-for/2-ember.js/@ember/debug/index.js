define("@ember/debug/index", ["exports", "@ember/-internals/browser-environment", "@ember/error", "@ember/debug/lib/deprecate", "@ember/debug/lib/testing", "@ember/debug/lib/warn", "@ember/debug/lib/capture-render-tree"], function (_exports, _browserEnvironment, _error, _deprecate2, _testing, _warn2, _captureRenderTree) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "registerDeprecationHandler", {
    enumerable: true,
    get: function get() {
      return _deprecate2.registerHandler;
    }
  });
  Object.defineProperty(_exports, "isTesting", {
    enumerable: true,
    get: function get() {
      return _testing.isTesting;
    }
  });
  Object.defineProperty(_exports, "setTesting", {
    enumerable: true,
    get: function get() {
      return _testing.setTesting;
    }
  });
  Object.defineProperty(_exports, "registerWarnHandler", {
    enumerable: true,
    get: function get() {
      return _warn2.registerHandler;
    }
  });
  Object.defineProperty(_exports, "captureRenderTree", {
    enumerable: true,
    get: function get() {
      return _captureRenderTree.default;
    }
  });
  _exports._warnIfUsingStrippedFeatureFlags = _exports.getDebugFunction = _exports.setDebugFunction = _exports.deprecateFunc = _exports.runInDebug = _exports.debugFreeze = _exports.debugSeal = _exports.deprecate = _exports.debug = _exports.warn = _exports.info = _exports.assert = void 0;

  // These are the default production build versions:
  var noop = function noop() {};

  var assert = noop;
  _exports.assert = assert;
  var info = noop;
  _exports.info = info;
  var warn = noop;
  _exports.warn = warn;
  var debug = noop;
  _exports.debug = debug;
  var deprecate = noop;
  _exports.deprecate = deprecate;
  var debugSeal = noop;
  _exports.debugSeal = debugSeal;
  var debugFreeze = noop;
  _exports.debugFreeze = debugFreeze;
  var runInDebug = noop;
  _exports.runInDebug = runInDebug;
  var setDebugFunction = noop;
  _exports.setDebugFunction = setDebugFunction;
  var getDebugFunction = noop;
  _exports.getDebugFunction = getDebugFunction;

  var deprecateFunc = function deprecateFunc() {
    return arguments[arguments.length - 1];
  };

  _exports.deprecateFunc = deprecateFunc;

  if (false
  /* DEBUG */
  ) {
    _exports.setDebugFunction = setDebugFunction = function setDebugFunction(type, callback) {
      switch (type) {
        case 'assert':
          return _exports.assert = assert = callback;

        case 'info':
          return _exports.info = info = callback;

        case 'warn':
          return _exports.warn = warn = callback;

        case 'debug':
          return _exports.debug = debug = callback;

        case 'deprecate':
          return _exports.deprecate = deprecate = callback;

        case 'debugSeal':
          return _exports.debugSeal = debugSeal = callback;

        case 'debugFreeze':
          return _exports.debugFreeze = debugFreeze = callback;

        case 'runInDebug':
          return _exports.runInDebug = runInDebug = callback;

        case 'deprecateFunc':
          return _exports.deprecateFunc = deprecateFunc = callback;
      }
    };

    _exports.getDebugFunction = getDebugFunction = function getDebugFunction(type) {
      switch (type) {
        case 'assert':
          return assert;

        case 'info':
          return info;

        case 'warn':
          return warn;

        case 'debug':
          return debug;

        case 'deprecate':
          return deprecate;

        case 'debugSeal':
          return debugSeal;

        case 'debugFreeze':
          return debugFreeze;

        case 'runInDebug':
          return runInDebug;

        case 'deprecateFunc':
          return deprecateFunc;
      }
    };
  }
  /**
  @module @ember/debug
  */


  if (false
  /* DEBUG */
  ) {
    /**
      Verify that a certain expectation is met, or throw a exception otherwise.
         This is useful for communicating assumptions in the code to other human
      readers as well as catching bugs that accidentally violates these
      expectations.
         Assertions are removed from production builds, so they can be freely added
      for documentation and debugging purposes without worries of incuring any
      performance penalty. However, because of that, they should not be used for
      checks that could reasonably fail during normal usage. Furthermore, care
      should be taken to avoid accidentally relying on side-effects produced from
      evaluating the condition itself, since the code will not run in production.
         ```javascript
      import { assert } from '@ember/debug';
         // Test for truthiness
      assert('Must pass a string', typeof str === 'string');
         // Fail unconditionally
      assert('This code path should never be run');
      ```
         @method assert
      @static
      @for @ember/debug
      @param {String} description Describes the expectation. This will become the
        text of the Error thrown if the assertion fails.
      @param {Boolean} condition Must be truthy for the assertion to pass. If
        falsy, an exception will be thrown.
      @public
      @since 1.0.0
    */
    setDebugFunction('assert', function assert(desc, test) {
      if (!test) {
        throw new _error.default("Assertion Failed: " + desc);
      }
    });
    /**
      Display a debug notice.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         ```javascript
      import { debug } from '@ember/debug';
         debug('I\'m a debug notice!');
      ```
         @method debug
      @for @ember/debug
      @static
      @param {String} message A debug message to display.
      @public
    */

    setDebugFunction('debug', function debug(message) {
      /* eslint-disable no-console */
      if (console.debug) {
        console.debug("DEBUG: " + message);
      } else {
        console.log("DEBUG: " + message);
      }
      /* eslint-ensable no-console */

    });
    /**
      Display an info notice.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         @method info
      @private
    */

    setDebugFunction('info', function info() {
      var _console;

      (_console = console).info.apply(_console, arguments);
      /* eslint-disable-line no-console */

    });
    /**
     @module @ember/debug
     @public
    */

    /**
      Alias an old, deprecated method with its new counterpart.
         Display a deprecation warning with the provided message and a stack trace
      (Chrome and Firefox only) when the assigned method is called.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         ```javascript
      import { deprecateFunc } from '@ember/debug';
         Ember.oldMethod = deprecateFunc('Please use the new, updated method', options, Ember.newMethod);
      ```
         @method deprecateFunc
      @static
      @for @ember/debug
      @param {String} message A description of the deprecation.
      @param {Object} [options] The options object for `deprecate`.
      @param {Function} func The new function called to replace its deprecated counterpart.
      @return {Function} A new function that wraps the original function with a deprecation warning
      @private
    */

    setDebugFunction('deprecateFunc', function deprecateFunc() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length === 3) {
        var message = args[0],
            options = args[1],
            func = args[2];
        return function () {
          deprecate(message, false, options);

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return func.apply(this, args);
        };
      } else {
        var _message = args[0],
            _func = args[1];
        return function () {
          deprecate(_message);
          return _func.apply(this, arguments);
        };
      }
    });
    /**
     @module @ember/debug
     @public
    */

    /**
      Run a function meant for debugging.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         ```javascript
      import Component from '@ember/component';
      import { runInDebug } from '@ember/debug';
         runInDebug(() => {
        Component.reopen({
          didInsertElement() {
            console.log("I'm happy");
          }
        });
      });
      ```
         @method runInDebug
      @for @ember/debug
      @static
      @param {Function} func The function to be executed.
      @since 1.5.0
      @public
    */

    setDebugFunction('runInDebug', function runInDebug(func) {
      func();
    });
    setDebugFunction('debugSeal', function debugSeal(obj) {
      Object.seal(obj);
    });
    setDebugFunction('debugFreeze', function debugFreeze(obj) {
      // re-freezing an already frozen object introduces a significant
      // performance penalty on Chrome (tested through 59).
      //
      // See: https://bugs.chromium.org/p/v8/issues/detail?id=6450
      if (!Object.isFrozen(obj)) {
        Object.freeze(obj);
      }
    });
    setDebugFunction('deprecate', _deprecate2.default);
    setDebugFunction('warn', _warn2.default);
  }

  var _warnIfUsingStrippedFeatureFlags;

  _exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;

  if (false
  /* DEBUG */
  && !(0, _testing.isTesting)()) {
    if (typeof window !== 'undefined' && (_browserEnvironment.isFirefox || _browserEnvironment.isChrome) && window.addEventListener) {
      window.addEventListener('load', function () {
        if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
          var downloadURL;

          if (_browserEnvironment.isChrome) {
            downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
          } else if (_browserEnvironment.isFirefox) {
            downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
          }

          debug("For more advanced debugging, install the Ember Inspector from " + downloadURL);
        }
      }, false);
    }
  }
});