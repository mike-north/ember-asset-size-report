define("@glimmer/util", ["exports", "ember-babel"], function (_exports, _emberBabel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.assert = debugAssert;
  _exports.assign = assign;
  _exports.fillNulls = fillNulls;
  _exports.ensureGuid = ensureGuid;
  _exports.initializeGuid = initializeGuid;
  _exports.dict = dict;
  _exports.unwrap = unwrap;
  _exports.expect = expect;
  _exports.unreachable = unreachable;
  _exports.EMPTY_ARRAY = _exports.ListSlice = _exports.ListNode = _exports.LinkedList = _exports.EMPTY_SLICE = _exports.DictSet = _exports.Stack = void 0;

  function unwrap(val) {
    if (val === null || val === undefined) throw new Error("Expected value to be present");
    return val;
  }

  function expect(val, message) {
    if (val === null || val === undefined) throw new Error(message);
    return val;
  }

  function unreachable(message) {
    if (message === void 0) {
      message = 'unreachable';
    }

    return new Error(message);
  } // import Logger from './logger';
  // let alreadyWarned = false;


  function debugAssert(test, msg) {
    // if (!alreadyWarned) {
    //   alreadyWarned = true;
    //   Logger.warn("Don't leave debug assertions on in public builds");
    // }
    if (!test) {
      throw new Error(msg || 'assertion failure');
    }
  }

  var objKeys = Object.keys;

  function assign(obj) {
    for (var i = 1; i < arguments.length; i++) {
      var assignment = arguments[i];
      if (assignment === null || typeof assignment !== 'object') continue;
      var keys = objKeys(assignment);

      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        obj[key] = assignment[key];
      }
    }

    return obj;
  }

  function fillNulls(count) {
    var arr = new Array(count);

    for (var i = 0; i < count; i++) {
      arr[i] = null;
    }

    return arr;
  }

  var GUID = 0;

  function initializeGuid(object) {
    return object._guid = ++GUID;
  }

  function ensureGuid(object) {
    return object._guid || initializeGuid(object);
  }

  function dict() {
    return Object.create(null);
  }

  var DictSet =
  /*#__PURE__*/
  function () {
    function DictSet() {
      this.dict = dict();
    }

    var _proto = DictSet.prototype;

    _proto.add = function add(obj) {
      if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[ensureGuid(obj)] = obj;
      return this;
    };

    _proto.delete = function _delete(obj) {
      if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
    };

    return DictSet;
  }();

  _exports.DictSet = DictSet;

  var Stack =
  /*#__PURE__*/
  function () {
    function Stack() {
      this.stack = [];
      this.current = null;
    }

    var _proto2 = Stack.prototype;

    _proto2.push = function push(item) {
      this.current = item;
      this.stack.push(item);
    };

    _proto2.pop = function pop() {
      var item = this.stack.pop();
      var len = this.stack.length;
      this.current = len === 0 ? null : this.stack[len - 1];
      return item === undefined ? null : item;
    };

    _proto2.isEmpty = function isEmpty() {
      return this.stack.length === 0;
    };

    (0, _emberBabel.createClass)(Stack, [{
      key: "size",
      get: function get() {
        return this.stack.length;
      }
    }]);
    return Stack;
  }();

  _exports.Stack = Stack;

  var ListNode = function ListNode(value) {
    this.next = null;
    this.prev = null;
    this.value = value;
  };

  _exports.ListNode = ListNode;

  var LinkedList =
  /*#__PURE__*/
  function () {
    function LinkedList() {
      this.clear();
    }

    var _proto3 = LinkedList.prototype;

    _proto3.head = function head() {
      return this._head;
    };

    _proto3.tail = function tail() {
      return this._tail;
    };

    _proto3.clear = function clear() {
      this._head = this._tail = null;
    };

    _proto3.toArray = function toArray() {
      var out = [];
      this.forEachNode(function (n) {
        return out.push(n);
      });
      return out;
    };

    _proto3.nextNode = function nextNode(node) {
      return node.next;
    };

    _proto3.forEachNode = function forEachNode(callback) {
      var node = this._head;

      while (node !== null) {
        callback(node);
        node = node.next;
      }
    };

    _proto3.insertBefore = function insertBefore(node, reference) {
      if (reference === void 0) {
        reference = null;
      }

      if (reference === null) return this.append(node);
      if (reference.prev) reference.prev.next = node;else this._head = node;
      node.prev = reference.prev;
      node.next = reference;
      reference.prev = node;
      return node;
    };

    _proto3.append = function append(node) {
      var tail = this._tail;

      if (tail) {
        tail.next = node;
        node.prev = tail;
        node.next = null;
      } else {
        this._head = node;
      }

      return this._tail = node;
    };

    _proto3.remove = function remove(node) {
      if (node.prev) node.prev.next = node.next;else this._head = node.next;
      if (node.next) node.next.prev = node.prev;else this._tail = node.prev;
      return node;
    };

    return LinkedList;
  }();

  _exports.LinkedList = LinkedList;

  var ListSlice =
  /*#__PURE__*/
  function () {
    function ListSlice(head, tail) {
      this._head = head;
      this._tail = tail;
    }

    var _proto4 = ListSlice.prototype;

    _proto4.forEachNode = function forEachNode(callback) {
      var node = this._head;

      while (node !== null) {
        callback(node);
        node = this.nextNode(node);
      }
    };

    _proto4.head = function head() {
      return this._head;
    };

    _proto4.tail = function tail() {
      return this._tail;
    };

    _proto4.toArray = function toArray() {
      var out = [];
      this.forEachNode(function (n) {
        return out.push(n);
      });
      return out;
    };

    _proto4.nextNode = function nextNode(node) {
      if (node === this._tail) return null;
      return node.next;
    };

    return ListSlice;
  }();

  _exports.ListSlice = ListSlice;
  var EMPTY_SLICE = new ListSlice(null, null);
  _exports.EMPTY_SLICE = EMPTY_SLICE;
  var EMPTY_ARRAY = Object.freeze([]);
  _exports.EMPTY_ARRAY = EMPTY_ARRAY;
});