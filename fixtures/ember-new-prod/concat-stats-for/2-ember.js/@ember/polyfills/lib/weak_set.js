define("@ember/polyfills/lib/weak_set", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* globals WeakSet */
  var _default = typeof WeakSet === 'function' ? WeakSet :
  /*#__PURE__*/
  function () {
    function WeakSetPolyFill() {
      this._map = new WeakMap();
    }

    var _proto = WeakSetPolyFill.prototype;

    _proto.add = function add(val) {
      this._map.set(val, true);

      return this;
    };

    _proto.delete = function _delete(val) {
      return this._map.delete(val);
    };

    _proto.has = function has(val) {
      return this._map.has(val);
    };

    return WeakSetPolyFill;
  }();

  _exports.default = _default;
});