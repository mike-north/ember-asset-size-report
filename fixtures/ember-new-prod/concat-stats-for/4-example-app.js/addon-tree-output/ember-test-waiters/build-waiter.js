define("ember-test-waiters/build-waiter", ["exports", "ember-test-waiters", "ember-test-waiters/noop-test-waiter"], function (_exports, _emberTestWaiters, _noopTestWaiter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = buildWaiter;

  /**
   * Builds and returns a test waiter. The type of the
   * returned waiter is dependent on whether the app or
   * addon is in `DEBUG` mode or not.
   *
   * @param name {string} The name of the test waiter
   * @returns {ITestWaiter}
   *
   * @example
   *
   * import Component from '@ember/component';
   * import { buildWaiter } from 'ember-test-waiters';
   *
   * if (DEBUG) {
   *   let waiter = buildWaiter('friend-waiter');
   * }
   *
   * export default class Friendz extends Component {
   *   didInsertElement() {
   *     let token = waiter.beginAsync(this);
   *
   *     someAsyncWork().then(() => {
   *       waiter.endAsync(token);
   *     });
   *   }
   * }
   */
  function buildWaiter(name) {
    if (false
    /* DEBUG */
    ) {
      return new _emberTestWaiters.TestWaiter(name);
    }

    return new _noopTestWaiter.default(name);
  }
});