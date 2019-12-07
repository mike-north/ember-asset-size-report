define("ember-test-waiters/waiter-manager", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.register = register;
  _exports.unregister = unregister;
  _exports.getWaiters = getWaiters;
  _exports._reset = _reset;
  _exports.getPendingWaiterState = getPendingWaiterState;
  _exports.hasPendingWaiters = hasPendingWaiters;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  var WAITERS = new Map();
  /**
   * Backwards compatibility with legacy waiters system.
   *
   * We want to always register a waiter using the legacy waiter system, as right
   * now if consumers are not on the right version of @ember/test-helpers, using
   * this addon will result in none of these waiters waiting.
   */
  // eslint-disable-next-line ember/new-module-imports

  if (Ember.Test) {
    Ember.Test.registerWaiter(function () {
      return !hasPendingWaiters();
    });
  }
  /**
   * Registers a waiter.
   *
   * @public
   * @param waiter {IWaiter} A test waiter instance
   */


  function register(waiter) {
    WAITERS.set(waiter.name, waiter);
  }
  /**
   * Unregisters a waiter.
   *
   * @public
   * @param waiter {IWaiter} A test waiter instance
   */


  function unregister(waiter) {
    WAITERS.delete(waiter.name);
  }
  /**
   * Gets an array of all waiters current registered.
   *
   * @public
   * @returns {IWaiter[]}
   */


  function getWaiters() {
    return _toConsumableArray(WAITERS.values());
  }
  /**
   * Clears all waiters.
   *
   * @public
   */


  function _reset() {
    WAITERS.clear();
  }
  /**
   * Gets the current state of all waiters. Any waiters whose
   * `waitUntil` method returns false will be considered `pending`.
   *
   * @returns {IPendingWaiterState} An object containing a count of all waiters
   * pending and a `waiters` object containing the name of all pending waiters
   * and their debug info.
   */


  function getPendingWaiterState() {
    var result = {
      pending: 0,
      waiters: {}
    };
    WAITERS.forEach(function (waiter) {
      if (!waiter.waitUntil()) {
        result.pending++;
        var debugInfo = waiter.debugInfo();
        result.waiters[waiter.name] = debugInfo || true;
      }
    });
    return result;
  }
  /**
   * Determines if there are any pending waiters.
   *
   * @returns {boolean} `true` if there are pending waiters, otherwise `false`.
   */


  function hasPendingWaiters() {
    var state = getPendingWaiterState();
    return state.pending > 0;
  }
});