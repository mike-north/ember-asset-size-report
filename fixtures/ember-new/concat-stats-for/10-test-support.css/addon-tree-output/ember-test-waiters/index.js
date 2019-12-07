define("ember-test-waiters/index", ["exports", "ember-test-waiters/waiter-manager", "ember-test-waiters/test-waiter", "ember-test-waiters/build-waiter", "ember-test-waiters/wait-for-promise"], function (_exports, _waiterManager, _testWaiter, _buildWaiter, _waitForPromise) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "register", {
    enumerable: true,
    get: function () {
      return _waiterManager.register;
    }
  });
  Object.defineProperty(_exports, "unregister", {
    enumerable: true,
    get: function () {
      return _waiterManager.unregister;
    }
  });
  Object.defineProperty(_exports, "getWaiters", {
    enumerable: true,
    get: function () {
      return _waiterManager.getWaiters;
    }
  });
  Object.defineProperty(_exports, "_reset", {
    enumerable: true,
    get: function () {
      return _waiterManager._reset;
    }
  });
  Object.defineProperty(_exports, "getPendingWaiterState", {
    enumerable: true,
    get: function () {
      return _waiterManager.getPendingWaiterState;
    }
  });
  Object.defineProperty(_exports, "hasPendingWaiters", {
    enumerable: true,
    get: function () {
      return _waiterManager.hasPendingWaiters;
    }
  });
  Object.defineProperty(_exports, "TestWaiter", {
    enumerable: true,
    get: function () {
      return _testWaiter.default;
    }
  });
  Object.defineProperty(_exports, "buildWaiter", {
    enumerable: true,
    get: function () {
      return _buildWaiter.default;
    }
  });
  Object.defineProperty(_exports, "waitForPromise", {
    enumerable: true,
    get: function () {
      return _waitForPromise.default;
    }
  });
});