define("ember-test-helpers/wait", ["exports", "@ember/test-helpers/settled", "@ember/test-helpers"], function (_exports, _settled, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = wait;
  Object.defineProperty(_exports, "_setupAJAXHooks", {
    enumerable: true,
    get: function get() {
      return _settled._setupAJAXHooks;
    }
  });
  Object.defineProperty(_exports, "_teardownAJAXHooks", {
    enumerable: true,
    get: function get() {
      return _settled._teardownAJAXHooks;
    }
  });

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @private
    @deprecated
    @param {Object} [options={}] the options to be used for waiting
    @param {boolean} [options.waitForTimers=true] should timers be waited upon
    @param {boolean} [options.waitForAjax=true] should $.ajax requests be waited upon
    @param {boolean} [options.waitForWaiters=true] should test waiters be waited upon
    @returns {Promise<void>} resolves when settled
  */
  function wait() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (_typeof(options) !== 'object' || options === null) {
      options = {};
    }

    return (0, _testHelpers.waitUntil)(function () {
      var waitForTimers = 'waitForTimers' in options ? options.waitForTimers : true;
      var waitForAJAX = 'waitForAJAX' in options ? options.waitForAJAX : true;
      var waitForWaiters = 'waitForWaiters' in options ? options.waitForWaiters : true;

      var _getSettledState = (0, _testHelpers.getSettledState)(),
          hasPendingTimers = _getSettledState.hasPendingTimers,
          hasRunLoop = _getSettledState.hasRunLoop,
          hasPendingRequests = _getSettledState.hasPendingRequests,
          hasPendingWaiters = _getSettledState.hasPendingWaiters;

      if (waitForTimers && (hasPendingTimers || hasRunLoop)) {
        return false;
      }

      if (waitForAJAX && hasPendingRequests) {
        return false;
      }

      if (waitForWaiters && hasPendingWaiters) {
        return false;
      }

      return true;
    }, {
      timeout: Infinity
    });
  }
});