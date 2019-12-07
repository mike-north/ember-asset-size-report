define("@ember/test-helpers/settled", ["exports", "@ember/test-helpers/-utils", "@ember/test-helpers/wait-until", "@ember/test-helpers/setup-application-context", "ember-test-waiters", "@ember/test-helpers/-internal/debug-info"], function (_exports, _utils, _waitUntil, _setupApplicationContext, _emberTestWaiters, _debugInfo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports._teardownAJAXHooks = _teardownAJAXHooks;
  _exports._setupAJAXHooks = _setupAJAXHooks;
  _exports.getSettledState = getSettledState;
  _exports.isSettled = isSettled;
  _exports.default = settled;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

  function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  // Ember internally tracks AJAX requests in the same way that we do here for
  // legacy style "acceptance" tests using the `ember-testing.js` asset provided
  // by emberjs/ember.js itself. When `@ember/test-helpers`'s `settled` utility
  // is used in a legacy acceptance test context any pending AJAX requests are
  // not properly considered during the `isSettled` check below.
  //
  // This utilizes a local utility method present in Ember since around 2.8.0 to
  // properly consider pending AJAX requests done within legacy acceptance tests.
  var _internalPendingRequests = function () {
    var loader = Ember.__loader;

    if (loader.registry['ember-testing/test/pending_requests']) {
      // Ember <= 3.1
      return loader.require('ember-testing/test/pending_requests').pendingRequests;
    } else if (loader.registry['ember-testing/lib/test/pending_requests']) {
      // Ember >= 3.2
      return loader.require('ember-testing/lib/test/pending_requests').pendingRequests;
    }

    return function () {
      return 0;
    };
  }();

  var requests;
  /**
    @private
    @returns {number} the count of pending requests
  */

  function pendingRequests() {
    var localRequestsPending = requests !== undefined ? requests.length : 0;

    var internalRequestsPending = _internalPendingRequests();

    return localRequestsPending + internalRequestsPending;
  }
  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */


  function incrementAjaxPendingRequests(event, xhr) {
    requests.push(xhr);
  }
  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */


  function decrementAjaxPendingRequests(event, xhr) {
    // In most Ember versions to date (current version is 2.16) RSVP promises are
    // configured to flush in the actions queue of the Ember run loop, however it
    // is possible that in the future this changes to use "true" micro-task
    // queues.
    //
    // The entire point here, is that _whenever_ promises are resolved will be
    // before the next run of the JS event loop. Then in the next event loop this
    // counter will decrement. In the specific case of AJAX, this means that any
    // promises chained off of `$.ajax` will properly have their `.then` called
    // _before_ this is decremented (and testing continues)
    (0, _utils.nextTick)(function () {
      for (var i = 0; i < requests.length; i++) {
        if (xhr === requests[i]) {
          requests.splice(i, 1);
        }
      }
    }, 0);
  }
  /**
    Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.
  
    @private
  */


  function _teardownAJAXHooks() {
    // jQuery will not invoke `ajaxComplete` if
    //    1. `transport.send` throws synchronously and
    //    2. it has an `error` option which also throws synchronously
    // We can no longer handle any remaining requests
    requests = [];

    if (typeof jQuery === 'undefined') {
      return;
    }

    jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }
  /**
    Sets up listeners for `ajaxSend` and `ajaxComplete`.
  
    @private
  */


  function _setupAJAXHooks() {
    requests = [];

    if (typeof jQuery === 'undefined') {
      return;
    }

    jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  var _internalCheckWaiters;

  var loader = Ember.__loader;

  if (loader.registry['ember-testing/test/waiters']) {
    // Ember <= 3.1
    _internalCheckWaiters = loader.require('ember-testing/test/waiters').checkWaiters;
  } else if (loader.registry['ember-testing/lib/test/waiters']) {
    // Ember >= 3.2
    _internalCheckWaiters = loader.require('ember-testing/lib/test/waiters').checkWaiters;
  }
  /**
    @private
    @returns {boolean} true if waiters are still pending
  */


  function checkWaiters() {
    var EmberTest = Ember.Test;

    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (EmberTest.waiters) {
      if (EmberTest.waiters.some(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            context = _ref2[0],
            callback = _ref2[1];

        return !callback.call(context);
      })) {
        return true;
      }
    }

    return false;
  }
  /**
    Check various settledness metrics, and return an object with the following properties:
  
    - `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
      be `true` otherwise it will be `false`.
    - `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
      These pending timers are primarily registered by `Ember.run.schedule`. If
      there are pending timers, this will be `true`, otherwise `false`.
    - `hasPendingWaiters` - Checks if any registered test waiters are still
      pending (e.g. the waiter returns `true`). If there are pending waiters,
      this will be `true`, otherwise `false`.
    - `hasPendingRequests` - Checks if there are pending AJAX requests (based on
      `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
      are pending requests, this will be `true`, otherwise `false`.
    - `hasPendingTransitions` - Checks if there are pending route transitions. If the
      router has not been instantiated / setup for the test yet this will return `null`,
      if there are pending transitions, this will be `true`, otherwise `false`.
    - `pendingRequestCount` - The count of pending AJAX requests.
    - `debugInfo` - Debug information that's combined with info return from backburner's
      getDebugInfo method.
  
    @public
    @returns {Object} object with properties for each of the metrics used to determine settledness
  */


  function getSettledState() {
    var hasPendingTimers = Boolean(Ember.run.hasScheduledTimers());
    var hasRunLoop = Boolean(Ember.run.currentRunLoop);
    var hasPendingLegacyWaiters = checkWaiters();
    var hasPendingTestWaiters = (0, _emberTestWaiters.hasPendingWaiters)();
    var pendingRequestCount = pendingRequests();
    var hasPendingRequests = pendingRequestCount > 0;
    return {
      hasPendingTimers: hasPendingTimers,
      hasRunLoop: hasRunLoop,
      hasPendingWaiters: hasPendingLegacyWaiters || hasPendingTestWaiters,
      hasPendingRequests: hasPendingRequests,
      hasPendingTransitions: (0, _setupApplicationContext.hasPendingTransitions)(),
      pendingRequestCount: pendingRequestCount,
      debugInfo: new _debugInfo.TestDebugInfo({
        hasPendingTimers: hasPendingTimers,
        hasRunLoop: hasRunLoop,
        hasPendingLegacyWaiters: hasPendingLegacyWaiters,
        hasPendingTestWaiters: hasPendingTestWaiters,
        hasPendingRequests: hasPendingRequests
      })
    };
  }
  /**
    Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.
  
    Settled generally means that there are no pending timers, no pending waiters,
    no pending AJAX requests, and no current run loop. However, new settledness
    metrics may be added and used as they become available.
  
    @public
    @returns {boolean} `true` if settled, `false` otherwise
  */


  function isSettled() {
    var _getSettledState = getSettledState(),
        hasPendingTimers = _getSettledState.hasPendingTimers,
        hasRunLoop = _getSettledState.hasRunLoop,
        hasPendingRequests = _getSettledState.hasPendingRequests,
        hasPendingWaiters = _getSettledState.hasPendingWaiters,
        hasPendingTransitions = _getSettledState.hasPendingTransitions;

    if (hasPendingTimers || hasRunLoop || hasPendingRequests || hasPendingWaiters || hasPendingTransitions) {
      return false;
    }

    return true;
  }
  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @public
    @returns {Promise<void>} resolves when settled
  */


  function settled() {
    return (0, _waitUntil.default)(isSettled, {
      timeout: Infinity
    }).then(function () {});
  }
});