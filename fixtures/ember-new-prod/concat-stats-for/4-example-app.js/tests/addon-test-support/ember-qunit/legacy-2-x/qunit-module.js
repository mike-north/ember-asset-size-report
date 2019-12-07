define("ember-qunit/legacy-2-x/qunit-module", ["exports", "qunit"], function (_exports, _qunit) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.createModule = createModule;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function noop() {}

  function callbackFor(name, callbacks) {
    if (_typeof(callbacks) !== 'object') {
      return noop;
    }

    if (!callbacks) {
      return noop;
    }

    var callback = noop;

    if (callbacks[name]) {
      callback = callbacks[name];
      delete callbacks[name];
    }

    return callback;
  }

  function createModule(Constructor, name, description, callbacks) {
    if (!callbacks && _typeof(description) === 'object') {
      callbacks = description;
      description = name;
    }

    var _before = callbackFor('before', callbacks);

    var _beforeEach = callbackFor('beforeEach', callbacks);

    var _afterEach = callbackFor('afterEach', callbacks);

    var _after = callbackFor('after', callbacks);

    var module;
    var moduleName = typeof description === 'string' ? description : name;
    (0, _qunit.module)(moduleName, {
      before: function before() {
        // storing this in closure scope to avoid exposing these
        // private internals to the test context
        module = new Constructor(name, description, callbacks);
        return _before.apply(this, arguments);
      },
      beforeEach: function beforeEach() {
        var _module,
            _arguments = arguments,
            _this = this;

        // provide the test context to the underlying module
        module.setContext(this);
        return (_module = module).setup.apply(_module, arguments).then(function () {
          return _beforeEach.apply(_this, _arguments);
        });
      },
      afterEach: function afterEach() {
        var _arguments2 = arguments;

        var result = _afterEach.apply(this, arguments);

        return Ember.RSVP.resolve(result).then(function () {
          var _module2;

          return (_module2 = module).teardown.apply(_module2, _toConsumableArray(_arguments2));
        });
      },
      after: function after() {
        try {
          return _after.apply(this, arguments);
        } finally {
          _after = _afterEach = _before = _beforeEach = callbacks = module = null;
        }
      }
    });
  }
});