define("@ember/test-helpers/-internal/debug-info", ["exports", "@ember/test-helpers/-internal/debug-info-helpers", "ember-test-waiters"], function (_exports, _debugInfoHelpers, _emberTestWaiters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.backburnerDebugInfoAvailable = backburnerDebugInfoAvailable;
  _exports.getDebugInfo = getDebugInfo;
  _exports.TestDebugInfo = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var PENDING_AJAX_REQUESTS = 'Pending AJAX requests';
  var PENDING_TEST_WAITERS = 'Pending test waiters';
  var SCHEDULED_ASYNC = 'Scheduled async';
  var SCHEDULED_AUTORUN = 'Scheduled autorun';
  /**
   * Determins if the `getDebugInfo` method is available in the
   * running verison of backburner.
   *
   * @returns {boolean} True if `getDebugInfo` is present in backburner, otherwise false.
   */

  function backburnerDebugInfoAvailable() {
    return typeof Ember.run.backburner.getDebugInfo === 'function';
  }
  /**
   * Retrieves debug information from backburner's current deferred actions queue (runloop instance).
   * If the `getDebugInfo` method isn't available, it returns `null`.
   *
   * @public
   * @returns {MaybeDebugInfo | null} Backburner debugInfo or, if the getDebugInfo method is not present, null
   */


  function getDebugInfo() {
    return Ember.run.backburner.DEBUG === true && backburnerDebugInfoAvailable() ? Ember.run.backburner.getDebugInfo() : null;
  }
  /**
   * Encapsulates debug information for an individual test. Aggregates information
   * from:
   * - info provided by getSettledState
   *    - hasPendingTimers
   *    - hasRunLoop
   *    - hasPendingWaiters
   *    - hasPendingRequests
   * - info provided by backburner's getDebugInfo method (timers, schedules, and stack trace info)
   *
   */


  var TestDebugInfo =
  /*#__PURE__*/
  function () {
    function TestDebugInfo(settledState) {
      var debugInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getDebugInfo();

      _classCallCheck(this, TestDebugInfo);

      this._summaryInfo = undefined;
      this._settledState = settledState;
      this._debugInfo = debugInfo;
    }

    _createClass(TestDebugInfo, [{
      key: "toConsole",
      value: function toConsole() {
        var _console = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : console;

        var summary = this.summary;

        if (summary.hasPendingRequests) {
          _console.log(PENDING_AJAX_REQUESTS);
        }

        if (summary.hasPendingLegacyWaiters) {
          _console.log(PENDING_TEST_WAITERS);
        }

        if (summary.hasPendingTestWaiters) {
          if (!summary.hasPendingLegacyWaiters) {
            _console.log(PENDING_TEST_WAITERS);
          }

          Object.keys(summary.pendingTestWaiterInfo.waiters).forEach(function (waiterName) {
            var waiterDebugInfo = summary.pendingTestWaiterInfo.waiters[waiterName];

            if (Array.isArray(waiterDebugInfo)) {
              _console.group(waiterName);

              waiterDebugInfo.forEach(function (debugInfo) {
                _console.log("".concat(debugInfo.label ? debugInfo.label : 'stack', ": ").concat(debugInfo.stack));
              });

              _console.groupEnd();
            } else {
              _console.log(waiterName);
            }
          });
        }

        if (summary.hasPendingTimers || summary.pendingScheduledQueueItemCount > 0) {
          _console.group(SCHEDULED_ASYNC);

          summary.pendingTimersStackTraces.forEach(function (timerStack) {
            _console.log(timerStack);
          });
          summary.pendingScheduledQueueItemStackTraces.forEach(function (scheduleQueueItemStack) {
            _console.log(scheduleQueueItemStack);
          });

          _console.groupEnd();
        }

        if (summary.hasRunLoop && summary.pendingTimersCount === 0 && summary.pendingScheduledQueueItemCount === 0) {
          _console.log(SCHEDULED_AUTORUN);

          if (summary.autorunStackTrace) {
            _console.log(summary.autorunStackTrace);
          }
        }

        _debugInfoHelpers.debugInfoHelpers.forEach(function (helper) {
          helper.log();
        });
      }
    }, {
      key: "_formatCount",
      value: function _formatCount(title, count) {
        return "".concat(title, ": ").concat(count);
      }
    }, {
      key: "summary",
      get: function get() {
        if (!this._summaryInfo) {
          this._summaryInfo = Ember.assign({}, this._settledState);

          if (this._debugInfo) {
            this._summaryInfo.autorunStackTrace = this._debugInfo.autorun && this._debugInfo.autorun.stack;
            this._summaryInfo.pendingTimersCount = this._debugInfo.timers.length;
            this._summaryInfo.hasPendingTimers = this._settledState.hasPendingTimers && this._summaryInfo.pendingTimersCount > 0;
            this._summaryInfo.pendingTimersStackTraces = this._debugInfo.timers.map(function (timer) {
              return timer.stack;
            });
            this._summaryInfo.pendingScheduledQueueItemCount = this._debugInfo.instanceStack.filter(function (q) {
              return q;
            }).reduce(function (total, item) {
              Object.keys(item).forEach(function (queueName) {
                total += item[queueName].length;
              });
              return total;
            }, 0);
            this._summaryInfo.pendingScheduledQueueItemStackTraces = this._debugInfo.instanceStack.filter(function (q) {
              return q;
            }).reduce(function (stacks, deferredActionQueues) {
              Object.keys(deferredActionQueues).forEach(function (queue) {
                deferredActionQueues[queue].forEach(function (queueItem) {
                  return queueItem.stack && stacks.push(queueItem.stack);
                });
              });
              return stacks;
            }, []);
          }

          if (this._summaryInfo.hasPendingTestWaiters) {
            this._summaryInfo.pendingTestWaiterInfo = (0, _emberTestWaiters.getPendingWaiterState)();
          }
        }

        return this._summaryInfo;
      }
    }]);

    return TestDebugInfo;
  }();

  _exports.TestDebugInfo = TestDebugInfo;
});