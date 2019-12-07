define("ember-test-waiters/noop-test-waiter", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * A class providing a production, noop replacement for the {TestWaiter<T>} class.
   *
   * @public
   * @class TestWaiter<T>
   */
  class NoopTestWaiter {
    constructor(name) {
      this.name = name;
    }

    beginAsync() {
      return this;
    }

    endAsync() {}

    waitUntil() {
      return true;
    }

    debugInfo() {
      return [];
    }

  }

  _exports.default = NoopTestWaiter;
});