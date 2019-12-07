define("@glimmer/low-level", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Stack = _exports.Storage = void 0;

  var Storage =
  /*#__PURE__*/
  function () {
    function Storage() {
      this.array = [];
      this.next = 0;
    }

    var _proto = Storage.prototype;

    _proto.add = function add(element) {
      var slot = this.next,
          array = this.array;

      if (slot === array.length) {
        this.next++;
      } else {
        var prev = array[slot];
        this.next = prev;
      }

      this.array[slot] = element;
      return slot;
    };

    _proto.deref = function deref(pointer) {
      return this.array[pointer];
    };

    _proto.drop = function drop(pointer) {
      this.array[pointer] = this.next;
      this.next = pointer;
    };

    return Storage;
  }();

  _exports.Storage = Storage;

  var Stack =
  /*#__PURE__*/
  function () {
    function Stack(vec) {
      if (vec === void 0) {
        vec = [];
      }

      this.vec = vec;
    }

    var _proto2 = Stack.prototype;

    _proto2.clone = function clone() {
      return new Stack(this.vec.slice());
    };

    _proto2.sliceFrom = function sliceFrom(start) {
      return new Stack(this.vec.slice(start));
    };

    _proto2.slice = function slice(start, end) {
      return new Stack(this.vec.slice(start, end));
    };

    _proto2.copy = function copy(from, to) {
      this.vec[to] = this.vec[from];
    } // TODO: how to model u64 argument?
    ;

    _proto2.writeRaw = function writeRaw(pos, value) {
      // TODO: Grow?
      this.vec[pos] = value;
    } // TODO: partially decoded enum?
    ;

    _proto2.getRaw = function getRaw(pos) {
      return this.vec[pos];
    };

    _proto2.reset = function reset() {
      this.vec.length = 0;
    };

    _proto2.len = function len() {
      return this.vec.length;
    };

    return Stack;
  }();

  _exports.Stack = Stack;
});