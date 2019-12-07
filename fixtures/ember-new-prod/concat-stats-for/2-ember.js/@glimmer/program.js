define("@glimmer/program", ["exports", "ember-babel", "@glimmer/util"], function (_exports, _emberBabel, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Opcode = _exports.Program = _exports.RuntimeProgram = _exports.WriteOnlyProgram = _exports.Heap = _exports.LazyConstants = _exports.Constants = _exports.RuntimeConstants = _exports.WriteOnlyConstants = _exports.WELL_KNOWN_EMPTY_ARRAY_POSITION = void 0;
  var UNRESOLVED = {};
  var WELL_KNOWN_EMPTY_ARRAY_POSITION = 0;
  _exports.WELL_KNOWN_EMPTY_ARRAY_POSITION = WELL_KNOWN_EMPTY_ARRAY_POSITION;
  var WELL_KNOW_EMPTY_ARRAY = Object.freeze([]);

  var WriteOnlyConstants =
  /*#__PURE__*/
  function () {
    function WriteOnlyConstants() {
      // `0` means NULL
      this.strings = [];
      this.arrays = [WELL_KNOW_EMPTY_ARRAY];
      this.tables = [];
      this.handles = [];
      this.resolved = [];
      this.numbers = [];
    }

    var _proto = WriteOnlyConstants.prototype;

    _proto.string = function string(value) {
      var index = this.strings.indexOf(value);

      if (index > -1) {
        return index;
      }

      return this.strings.push(value) - 1;
    };

    _proto.stringArray = function stringArray(strings) {
      var _strings = new Array(strings.length);

      for (var i = 0; i < strings.length; i++) {
        _strings[i] = this.string(strings[i]);
      }

      return this.array(_strings);
    };

    _proto.array = function array(values) {
      if (values.length === 0) {
        return WELL_KNOWN_EMPTY_ARRAY_POSITION;
      }

      var index = this.arrays.indexOf(values);

      if (index > -1) {
        return index;
      }

      return this.arrays.push(values) - 1;
    };

    _proto.handle = function handle(_handle) {
      var index = this.handles.indexOf(_handle);

      if (index > -1) {
        return index;
      }

      this.resolved.push(UNRESOLVED);
      return this.handles.push(_handle) - 1;
    };

    _proto.serializable = function serializable(value) {
      var str = JSON.stringify(value);
      var index = this.strings.indexOf(str);

      if (index > -1) {
        return index;
      }

      return this.strings.push(str) - 1;
    };

    _proto.number = function number(_number) {
      var index = this.numbers.indexOf(_number);

      if (index > -1) {
        return index;
      }

      return this.numbers.push(_number) - 1;
    };

    _proto.toPool = function toPool() {
      return {
        strings: this.strings,
        arrays: this.arrays,
        handles: this.handles,
        numbers: this.numbers
      };
    };

    return WriteOnlyConstants;
  }();

  _exports.WriteOnlyConstants = WriteOnlyConstants;

  var RuntimeConstants =
  /*#__PURE__*/
  function () {
    function RuntimeConstants(resolver, pool) {
      this.resolver = resolver;
      this.strings = pool.strings;
      this.arrays = pool.arrays;
      this.handles = pool.handles;
      this.resolved = this.handles.map(function () {
        return UNRESOLVED;
      });
      this.numbers = pool.numbers;
    }

    var _proto2 = RuntimeConstants.prototype;

    _proto2.getString = function getString(value) {
      return this.strings[value];
    };

    _proto2.getNumber = function getNumber(value) {
      return this.numbers[value];
    };

    _proto2.getStringArray = function getStringArray(value) {
      var names = this.getArray(value);

      var _names = new Array(names.length);

      for (var i = 0; i < names.length; i++) {
        var n = names[i];
        _names[i] = this.getString(n);
      }

      return _names;
    };

    _proto2.getArray = function getArray(value) {
      return this.arrays[value];
    };

    _proto2.resolveHandle = function resolveHandle(index) {
      var resolved = this.resolved[index];

      if (resolved === UNRESOLVED) {
        var handle = this.handles[index];
        resolved = this.resolved[index] = this.resolver.resolve(handle);
      }

      return resolved;
    };

    _proto2.getSerializable = function getSerializable(s) {
      return JSON.parse(this.strings[s]);
    };

    return RuntimeConstants;
  }();

  _exports.RuntimeConstants = RuntimeConstants;

  var Constants =
  /*#__PURE__*/
  function (_WriteOnlyConstants) {
    (0, _emberBabel.inheritsLoose)(Constants, _WriteOnlyConstants);

    function Constants(resolver, pool) {
      var _this;

      _this = _WriteOnlyConstants.call(this) || this;
      _this.resolver = resolver;

      if (pool) {
        _this.strings = pool.strings;
        _this.arrays = pool.arrays;
        _this.handles = pool.handles;
        _this.resolved = _this.handles.map(function () {
          return UNRESOLVED;
        });
        _this.numbers = pool.numbers;
      }

      return _this;
    }

    var _proto3 = Constants.prototype;

    _proto3.getNumber = function getNumber(value) {
      return this.numbers[value];
    };

    _proto3.getString = function getString(value) {
      return this.strings[value];
    };

    _proto3.getStringArray = function getStringArray(value) {
      var names = this.getArray(value);

      var _names = new Array(names.length);

      for (var i = 0; i < names.length; i++) {
        var n = names[i];
        _names[i] = this.getString(n);
      }

      return _names;
    };

    _proto3.getArray = function getArray(value) {
      return this.arrays[value];
    };

    _proto3.resolveHandle = function resolveHandle(index) {
      var resolved = this.resolved[index];

      if (resolved === UNRESOLVED) {
        var handle = this.handles[index];
        resolved = this.resolved[index] = this.resolver.resolve(handle);
      }

      return resolved;
    };

    _proto3.getSerializable = function getSerializable(s) {
      return JSON.parse(this.strings[s]);
    };

    return Constants;
  }(WriteOnlyConstants);

  _exports.Constants = Constants;

  var LazyConstants =
  /*#__PURE__*/
  function (_Constants) {
    (0, _emberBabel.inheritsLoose)(LazyConstants, _Constants);

    function LazyConstants() {
      var _this2;

      _this2 = _Constants.apply(this, arguments) || this;
      _this2.others = [];
      _this2.serializables = [];
      return _this2;
    }

    var _proto4 = LazyConstants.prototype;

    _proto4.serializable = function serializable(value) {
      var index = this.serializables.indexOf(value);

      if (index > -1) {
        return index;
      }

      return this.serializables.push(value) - 1;
    };

    _proto4.getSerializable = function getSerializable(s) {
      return this.serializables[s];
    };

    _proto4.getOther = function getOther(value) {
      return this.others[value - 1];
    };

    _proto4.other = function other(_other) {
      return this.others.push(_other);
    };

    return LazyConstants;
  }(Constants);

  _exports.LazyConstants = LazyConstants;

  var Opcode =
  /*#__PURE__*/
  function () {
    function Opcode(heap) {
      this.heap = heap;
      this.offset = 0;
    }

    (0, _emberBabel.createClass)(Opcode, [{
      key: "size",
      get: function get() {
        var rawType = this.heap.getbyaddr(this.offset);
        return ((rawType & 768
        /* OPERAND_LEN_MASK */
        ) >> 8
        /* ARG_SHIFT */
        ) + 1;
      }
    }, {
      key: "isMachine",
      get: function get() {
        var rawType = this.heap.getbyaddr(this.offset);
        return rawType & 1024
        /* MACHINE_MASK */
        ;
      }
    }, {
      key: "type",
      get: function get() {
        return this.heap.getbyaddr(this.offset) & 255
        /* TYPE_MASK */
        ;
      }
    }, {
      key: "op1",
      get: function get() {
        return this.heap.getbyaddr(this.offset + 1);
      }
    }, {
      key: "op2",
      get: function get() {
        return this.heap.getbyaddr(this.offset + 2);
      }
    }, {
      key: "op3",
      get: function get() {
        return this.heap.getbyaddr(this.offset + 3);
      }
    }]);
    return Opcode;
  }();

  _exports.Opcode = Opcode;

  function encodeTableInfo(scopeSize, state) {
    return state | scopeSize << 2;
  }

  function changeState(info, newState) {
    return info | newState << 30;
  }

  var PAGE_SIZE = 0x100000;
  /**
   * The Heap is responsible for dynamically allocating
   * memory in which we read/write the VM's instructions
   * from/to. When we malloc we pass out a VMHandle, which
   * is used as an indirect way of accessing the memory during
   * execution of the VM. Internally we track the different
   * regions of the memory in an int array known as the table.
   *
   * The table 32-bit aligned and has the following layout:
   *
   * | ... | hp (u32) |       info (u32)   | size (u32) |
   * | ... |  Handle  | Scope Size | State | Size       |
   * | ... | 32bits   | 30bits     | 2bits | 32bit      |
   *
   * With this information we effectively have the ability to
   * control when we want to free memory. That being said you
   * can not free during execution as raw address are only
   * valid during the execution. This means you cannot close
   * over them as you will have a bad memory access exception.
   */

  var Heap =
  /*#__PURE__*/
  function () {
    function Heap(serializedHeap) {
      this.placeholders = [];
      this.offset = 0;
      this.handle = 0;
      this.capacity = PAGE_SIZE;

      if (serializedHeap) {
        var buffer = serializedHeap.buffer,
            table = serializedHeap.table,
            handle = serializedHeap.handle;
        this.heap = new Uint32Array(buffer);
        this.table = table;
        this.offset = this.heap.length;
        this.handle = handle;
        this.capacity = 0;
      } else {
        this.heap = new Uint32Array(PAGE_SIZE);
        this.table = [];
      }
    }

    var _proto5 = Heap.prototype;

    _proto5.push = function push(item) {
      this.sizeCheck();
      this.heap[this.offset++] = item;
    };

    _proto5.sizeCheck = function sizeCheck() {
      if (this.capacity === 0) {
        var heap = slice(this.heap, 0, this.offset);
        this.heap = new Uint32Array(heap.length + PAGE_SIZE);
        this.heap.set(heap, 0);
        this.capacity = PAGE_SIZE;
      }

      this.capacity--;
    };

    _proto5.getbyaddr = function getbyaddr(address) {
      return this.heap[address];
    };

    _proto5.setbyaddr = function setbyaddr(address, value) {
      this.heap[address] = value;
    };

    _proto5.malloc = function malloc() {
      // push offset, info, size
      this.table.push(this.offset, 0, 0);
      var handle = this.handle;
      this.handle += 3
      /* ENTRY_SIZE */
      ;
      return handle;
    };

    _proto5.finishMalloc = function finishMalloc(handle, scopeSize) {
      this.table[handle + 1
      /* INFO_OFFSET */
      ] = encodeTableInfo(scopeSize, 0
      /* Allocated */
      );
    };

    _proto5.size = function size() {
      return this.offset;
    } // It is illegal to close over this address, as compaction
    // may move it. However, it is legal to use this address
    // multiple times between compactions.
    ;

    _proto5.getaddr = function getaddr(handle) {
      return this.table[handle];
    };

    _proto5.gethandle = function gethandle(address) {
      this.table.push(address, encodeTableInfo(0, 3
      /* Pointer */
      ), 0);
      var handle = this.handle;
      this.handle += 3
      /* ENTRY_SIZE */
      ;
      return handle;
    };

    _proto5.sizeof = function sizeof(handle) {
      return -1;
    };

    _proto5.scopesizeof = function scopesizeof(handle) {
      var info = this.table[handle + 1
      /* INFO_OFFSET */
      ];
      return info >> 2;
    };

    _proto5.free = function free(handle) {
      var info = this.table[handle + 1
      /* INFO_OFFSET */
      ];
      this.table[handle + 1
      /* INFO_OFFSET */
      ] = changeState(info, 1
      /* Freed */
      );
    };

    _proto5.pushPlaceholder = function pushPlaceholder(valueFunc) {
      this.sizeCheck();
      var address = this.offset++;
      this.heap[address] = 2147483647
      /* MAX_SIZE */
      ;
      this.placeholders.push([address, valueFunc]);
    };

    _proto5.patchPlaceholders = function patchPlaceholders() {
      var placeholders = this.placeholders;

      for (var i = 0; i < placeholders.length; i++) {
        var _placeholders$i = placeholders[i],
            address = _placeholders$i[0],
            getValue = _placeholders$i[1];
        this.setbyaddr(address, getValue());
      }
    };

    _proto5.capture = function capture(offset) {
      if (offset === void 0) {
        offset = this.offset;
      }

      this.patchPlaceholders(); // Only called in eager mode

      var buffer = slice(this.heap, 0, offset).buffer;
      return {
        handle: this.handle,
        table: this.table,
        buffer: buffer
      };
    };

    return Heap;
  }();

  _exports.Heap = Heap;

  var WriteOnlyProgram =
  /*#__PURE__*/
  function () {
    function WriteOnlyProgram(constants, heap) {
      if (constants === void 0) {
        constants = new WriteOnlyConstants();
      }

      if (heap === void 0) {
        heap = new Heap();
      }

      this.constants = constants;
      this.heap = heap;
      this._opcode = new Opcode(this.heap);
    }

    var _proto6 = WriteOnlyProgram.prototype;

    _proto6.opcode = function opcode(offset) {
      this._opcode.offset = offset;
      return this._opcode;
    };

    return WriteOnlyProgram;
  }();

  _exports.WriteOnlyProgram = WriteOnlyProgram;

  var RuntimeProgram =
  /*#__PURE__*/
  function () {
    function RuntimeProgram(constants, heap) {
      this.constants = constants;
      this.heap = heap;
      this._opcode = new Opcode(this.heap);
    }

    RuntimeProgram.hydrate = function hydrate(rawHeap, pool, resolver) {
      var heap = new Heap(rawHeap);
      var constants = new RuntimeConstants(resolver, pool);
      return new RuntimeProgram(constants, heap);
    };

    var _proto7 = RuntimeProgram.prototype;

    _proto7.opcode = function opcode(offset) {
      this._opcode.offset = offset;
      return this._opcode;
    };

    return RuntimeProgram;
  }();

  _exports.RuntimeProgram = RuntimeProgram;

  var Program =
  /*#__PURE__*/
  function (_WriteOnlyProgram) {
    (0, _emberBabel.inheritsLoose)(Program, _WriteOnlyProgram);

    function Program() {
      return _WriteOnlyProgram.apply(this, arguments) || this;
    }

    return Program;
  }(WriteOnlyProgram);

  _exports.Program = Program;

  function slice(arr, start, end) {
    if (arr.slice !== undefined) {
      return arr.slice(start, end);
    }

    var ret = new Uint32Array(end);

    for (; start < end; start++) {
      ret[start] = arr[start];
    }

    return ret;
  }
});