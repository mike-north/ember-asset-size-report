define("ember-test-waiters/noop-test-waiter", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  /**
   * A class providing a production, noop replacement for the {TestWaiter<T>} class.
   *
   * @public
   * @class TestWaiter<T>
   */
  var NoopTestWaiter =
  /*#__PURE__*/
  function () {
    function NoopTestWaiter(name) {
      _classCallCheck(this, NoopTestWaiter);

      this.name = name;
    }

    _createClass(NoopTestWaiter, [{
      key: "beginAsync",
      value: function beginAsync() {
        return this;
      }
    }, {
      key: "endAsync",
      value: function endAsync() {}
    }, {
      key: "waitUntil",
      value: function waitUntil() {
        return true;
      }
    }, {
      key: "debugInfo",
      value: function debugInfo() {
        return [];
      }
    }]);

    return NoopTestWaiter;
  }();

  _exports.default = NoopTestWaiter;
});