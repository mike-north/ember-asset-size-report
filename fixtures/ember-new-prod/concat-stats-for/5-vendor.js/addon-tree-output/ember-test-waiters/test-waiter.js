define("ember-test-waiters/test-waiter", ["exports", "ember-test-waiters/waiter-manager"], function (_exports, _waiterManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var token = 0;

  function getNextToken() {
    return token++;
  }
  /**
   * A class providing creation, registration and async waiting functionality.
   *
   * @public
   * @class TestWaiter<T>
   */


  var TestWaiter =
  /*#__PURE__*/
  function () {
    /**
     * @public
     * @constructor
     * @param name {WaiterName} the name of the test waiter
     */
    function TestWaiter(name, nextToken) {
      _classCallCheck(this, TestWaiter);

      this.isRegistered = false;
      this.items = new Map();
      this.name = name; // @ts-ignore

      this.nextToken = nextToken || getNextToken;
    }
    /**
     * Will register the waiter, allowing it to be opted in to pausing async
     * operations until they're completed within your tests. You should invoke
     * it after instantiating your `TestWaiter` instance.
     *
     * **Note**, if you forget to register your waiter, it will be registered
     * for you on the first invocation of `beginAsync`.
     *
     * @private
     * @method register
     */


    _createClass(TestWaiter, [{
      key: "register",
      value: function register() {
        if (!this.isRegistered) {
          (0, _waiterManager.register)(this);
          this.isRegistered = true;
        }
      }
      /**
       * Should be used to signal the beginning of an async operation that
       * is to be waited for. Invocation of this method should be paired with a subsequent
       * `endAsync` call to indicate to the waiter system that the async operation is completed.
       *
       * @public
       * @method beginAsync
       * @param item {T} The item to register for waiting
       * @param label {string} An optional label to identify the item
       */

    }, {
      key: "beginAsync",
      value: function beginAsync() {
        var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.nextToken();
        var label = arguments.length > 1 ? arguments[1] : undefined;
        this.register();

        if (this.items.has(token)) {
          throw new Error("beginAsync called for ".concat(token, " but it is already pending."));
        }

        var error = new Error();
        this.items.set(token, {
          get stack() {
            return error.stack;
          },

          label: label
        });
        return token;
      }
      /**
       * Should be used to signal the end of an async operation. Invocation of this
       * method should be paired with a preceeding `beginAsync` call, which would indicate the
       * beginning of an async operation.
       *
       * @public
       * @method endAsync
       * @param item {T} The item to that was registered for waiting
       */

    }, {
      key: "endAsync",
      value: function endAsync(token) {
        if (!this.items.has(token)) {
          throw new Error("endAsync called for ".concat(token, " but it is not currently pending."));
        }

        this.items.delete(token);
      }
      /**
       * Used to determine if the waiter system should still wait for async
       * operations to complete.
       *
       * @public
       * @method waitUntil
       * @returns {boolean}
       */

    }, {
      key: "waitUntil",
      value: function waitUntil() {
        return this.items.size === 0;
      }
      /**
       * Returns the `debugInfo` for each item tracking async operations in this waiter.
       *
       * @public
       * @method debugInfo
       * @returns {ITestWaiterDebugInfo}
       */

    }, {
      key: "debugInfo",
      value: function debugInfo() {
        return _toConsumableArray(this.items.values());
      }
    }]);

    return TestWaiter;
  }();

  _exports.default = TestWaiter;
});