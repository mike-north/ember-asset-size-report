define("@glimmer/runtime", ["exports", "ember-babel", "@glimmer/util", "@glimmer/reference", "@glimmer/vm", "@glimmer/low-level"], function (_exports, _emberBabel, _util, _reference2, _vm2, _lowLevel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.renderMain = renderMain;
  _exports.renderComponent = renderComponent;
  _exports.setDebuggerCallback = setDebuggerCallback;
  _exports.resetDebuggerCallback = resetDebuggerCallback;
  _exports.getDynamicVar = getDynamicVar;
  _exports.isCurriedComponentDefinition = isCurriedComponentDefinition;
  _exports.curry = curry;
  _exports.isWhitespace = isWhitespace;
  _exports.normalizeProperty = normalizeProperty;
  _exports.clientBuilder = clientBuilder;
  _exports.rehydrationBuilder = rehydrationBuilder;
  _exports.isSerializationFirstNode = isSerializationFirstNode;
  _exports.capabilityFlagsFrom = capabilityFlagsFrom;
  _exports.hasCapability = hasCapability;
  _exports.Cursor = _exports.ConcreteBounds = _exports.SERIALIZATION_FIRST_NODE_STRING = _exports.RehydrateBuilder = _exports.NewElementBuilder = _exports.DOMTreeConstruction = _exports.IDOMChanges = _exports.SVG_NAMESPACE = _exports.DOMChanges = _exports.CurriedComponentDefinition = _exports.MINIMAL_CAPABILITIES = _exports.DEFAULT_CAPABILITIES = _exports.DefaultEnvironment = _exports.Environment = _exports.Scope = _exports.EMPTY_ARGS = _exports.DynamicAttribute = _exports.SimpleDynamicAttribute = _exports.RenderResult = _exports.UpdatingVM = _exports.LowLevelVM = _exports.ConditionalReference = _exports.PrimitiveReference = _exports.UNDEFINED_REFERENCE = _exports.NULL_REFERENCE = void 0;

  // these import bindings will be stripped from build
  var AppendOpcodes =
  /*#__PURE__*/
  function () {
    function AppendOpcodes() {
      this.evaluateOpcode = (0, _util.fillNulls)(98
      /* Size */
      ).slice();
    }

    var _proto = AppendOpcodes.prototype;

    _proto.add = function add(name, evaluate, kind) {
      if (kind === void 0) {
        kind = 'syscall';
      }

      this.evaluateOpcode[name] = {
        syscall: kind === 'syscall',
        evaluate: evaluate
      };
    };

    _proto.debugBefore = function debugBefore(vm, opcode, type) {
      var sp;
      var state;
      return {
        sp: sp,
        state: state
      };
    };

    _proto.debugAfter = function debugAfter(vm, opcode, type, pre) {
      var expectedChange;
      var sp = pre.sp,
          state = pre.state;
      var metadata = null;

      if (metadata !== null) {
        if (typeof metadata.stackChange === 'number') {
          expectedChange = metadata.stackChange;
        } else {
          expectedChange = metadata.stackChange({
            opcode: opcode,
            constants: vm.constants,
            state: state
          });
          if (isNaN(expectedChange)) throw (0, _util.unreachable)();
        }
      }
    };

    _proto.evaluate = function evaluate(vm, opcode, type) {
      var operation = this.evaluateOpcode[type];

      if (operation.syscall) {
        operation.evaluate(vm, opcode);
      } else {
        operation.evaluate(vm.inner, opcode);
      }
    };

    return AppendOpcodes;
  }();

  var APPEND_OPCODES = new AppendOpcodes();

  var AbstractOpcode = function AbstractOpcode() {
    (0, _util.initializeGuid)(this);
  };

  var UpdatingOpcode =
  /*#__PURE__*/
  function (_AbstractOpcode) {
    (0, _emberBabel.inheritsLoose)(UpdatingOpcode, _AbstractOpcode);

    function UpdatingOpcode() {
      var _this;

      _this = _AbstractOpcode.apply(this, arguments) || this;
      _this.next = null;
      _this.prev = null;
      return _this;
    }

    return UpdatingOpcode;
  }(AbstractOpcode);

  var PrimitiveReference =
  /*#__PURE__*/
  function (_ConstReference) {
    (0, _emberBabel.inheritsLoose)(PrimitiveReference, _ConstReference);

    function PrimitiveReference(value$$1) {
      return _ConstReference.call(this, value$$1) || this;
    }

    PrimitiveReference.create = function create(value$$1) {
      if (value$$1 === undefined) {
        return UNDEFINED_REFERENCE;
      } else if (value$$1 === null) {
        return NULL_REFERENCE;
      } else if (value$$1 === true) {
        return TRUE_REFERENCE;
      } else if (value$$1 === false) {
        return FALSE_REFERENCE;
      } else if (typeof value$$1 === 'number') {
        return new ValueReference(value$$1);
      } else {
        return new StringReference(value$$1);
      }
    };

    var _proto2 = PrimitiveReference.prototype;

    _proto2.get = function get(_key) {
      return UNDEFINED_REFERENCE;
    };

    return PrimitiveReference;
  }(_reference2.ConstReference);

  _exports.PrimitiveReference = PrimitiveReference;

  var StringReference =
  /*#__PURE__*/
  function (_PrimitiveReference) {
    (0, _emberBabel.inheritsLoose)(StringReference, _PrimitiveReference);

    function StringReference() {
      var _this2;

      _this2 = _PrimitiveReference.apply(this, arguments) || this;
      _this2.lengthReference = null;
      return _this2;
    }

    var _proto3 = StringReference.prototype;

    _proto3.get = function get(key) {
      if (key === 'length') {
        var lengthReference = this.lengthReference;

        if (lengthReference === null) {
          lengthReference = this.lengthReference = new ValueReference(this.inner.length);
        }

        return lengthReference;
      } else {
        return _PrimitiveReference.prototype.get.call(this, key);
      }
    };

    return StringReference;
  }(PrimitiveReference);

  var ValueReference =
  /*#__PURE__*/
  function (_PrimitiveReference2) {
    (0, _emberBabel.inheritsLoose)(ValueReference, _PrimitiveReference2);

    function ValueReference(value$$1) {
      return _PrimitiveReference2.call(this, value$$1) || this;
    }

    return ValueReference;
  }(PrimitiveReference);

  var UNDEFINED_REFERENCE = new ValueReference(undefined);
  _exports.UNDEFINED_REFERENCE = UNDEFINED_REFERENCE;
  var NULL_REFERENCE = new ValueReference(null);
  _exports.NULL_REFERENCE = NULL_REFERENCE;
  var TRUE_REFERENCE = new ValueReference(true);
  var FALSE_REFERENCE = new ValueReference(false);

  var ConditionalReference =
  /*#__PURE__*/
  function () {
    function ConditionalReference(inner) {
      this.inner = inner;
      this.tag = inner.tag;
    }

    var _proto4 = ConditionalReference.prototype;

    _proto4.value = function value() {
      return this.toBool(this.inner.value());
    };

    _proto4.toBool = function toBool(value$$1) {
      return !!value$$1;
    };

    return ConditionalReference;
  }();

  _exports.ConditionalReference = ConditionalReference;

  var ConcatReference =
  /*#__PURE__*/
  function (_CachedReference) {
    (0, _emberBabel.inheritsLoose)(ConcatReference, _CachedReference);

    function ConcatReference(parts) {
      var _this3;

      _this3 = _CachedReference.call(this) || this;
      _this3.parts = parts;
      _this3.tag = (0, _reference2.combineTagged)(parts);
      return _this3;
    }

    var _proto5 = ConcatReference.prototype;

    _proto5.compute = function compute() {
      var parts = new Array();

      for (var i = 0; i < this.parts.length; i++) {
        var value$$1 = this.parts[i].value();

        if (value$$1 !== null && value$$1 !== undefined) {
          parts[i] = castToString(value$$1);
        }
      }

      if (parts.length > 0) {
        return parts.join('');
      }

      return null;
    };

    return ConcatReference;
  }(_reference2.CachedReference);

  function castToString(value$$1) {
    if (typeof value$$1.toString !== 'function') {
      return '';
    }

    return String(value$$1);
  }

  APPEND_OPCODES.add(1
  /* Helper */
  , function (vm, _ref) {
    var handle = _ref.op1;
    var stack = vm.stack;
    var helper = vm.constants.resolveHandle(handle);
    var args = stack.pop();
    var value$$1 = helper(vm, args);
    vm.loadValue(_vm2.Register.v0, value$$1);
  });
  APPEND_OPCODES.add(6
  /* GetVariable */
  , function (vm, _ref2) {
    var symbol = _ref2.op1;
    var expr = vm.referenceForSymbol(symbol);
    vm.stack.push(expr);
  });
  APPEND_OPCODES.add(4
  /* SetVariable */
  , function (vm, _ref3) {
    var symbol = _ref3.op1;
    var expr = vm.stack.pop();
    vm.scope().bindSymbol(symbol, expr);
  });
  APPEND_OPCODES.add(5
  /* SetBlock */
  , function (vm, _ref4) {
    var symbol = _ref4.op1;
    var handle = vm.stack.pop();
    var scope = vm.stack.pop(); // FIXME(mmun): shouldn't need to cast this

    var table = vm.stack.pop();
    var block = table ? [handle, scope, table] : null;
    vm.scope().bindBlock(symbol, block);
  });
  APPEND_OPCODES.add(96
  /* ResolveMaybeLocal */
  , function (vm, _ref5) {
    var _name = _ref5.op1;
    var name = vm.constants.getString(_name);
    var locals = vm.scope().getPartialMap();
    var ref = locals[name];

    if (ref === undefined) {
      ref = vm.getSelf().get(name);
    }

    vm.stack.push(ref);
  });
  APPEND_OPCODES.add(20
  /* RootScope */
  , function (vm, _ref6) {
    var symbols = _ref6.op1,
        bindCallerScope = _ref6.op2;
    vm.pushRootScope(symbols, !!bindCallerScope);
  });
  APPEND_OPCODES.add(7
  /* GetProperty */
  , function (vm, _ref7) {
    var _key = _ref7.op1;
    var key = vm.constants.getString(_key);
    var expr = vm.stack.pop();
    vm.stack.push(expr.get(key));
  });
  APPEND_OPCODES.add(8
  /* GetBlock */
  , function (vm, _ref8) {
    var _block = _ref8.op1;
    var stack = vm.stack;
    var block = vm.scope().getBlock(_block);

    if (block) {
      stack.push(block[2]);
      stack.push(block[1]);
      stack.push(block[0]);
    } else {
      stack.push(null);
      stack.push(null);
      stack.push(null);
    }
  });
  APPEND_OPCODES.add(9
  /* HasBlock */
  , function (vm, _ref9) {
    var _block = _ref9.op1;
    var hasBlock = !!vm.scope().getBlock(_block);
    vm.stack.push(hasBlock ? TRUE_REFERENCE : FALSE_REFERENCE);
  });
  APPEND_OPCODES.add(10
  /* HasBlockParams */
  , function (vm) {
    // FIXME(mmun): should only need to push the symbol table
    var block = vm.stack.pop();
    var scope = vm.stack.pop();
    var table = vm.stack.pop();
    var hasBlockParams = table && table.parameters.length;
    vm.stack.push(hasBlockParams ? TRUE_REFERENCE : FALSE_REFERENCE);
  });
  APPEND_OPCODES.add(11
  /* Concat */
  , function (vm, _ref10) {
    var count = _ref10.op1;
    var out = new Array(count);

    for (var i = count; i > 0; i--) {
      var offset = i - 1;
      out[offset] = vm.stack.pop();
    }

    vm.stack.push(new ConcatReference(out));
  });
  var CURRIED_COMPONENT_DEFINITION_BRAND = 'CURRIED COMPONENT DEFINITION [id=6f00feb9-a0ef-4547-99ea-ac328f80acea]';

  function isCurriedComponentDefinition(definition) {
    return !!(definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND]);
  }

  function isComponentDefinition(definition) {
    return definition && definition[CURRIED_COMPONENT_DEFINITION_BRAND];
  }

  var CurriedComponentDefinition =
  /*#__PURE__*/
  function () {
    /** @internal */
    function CurriedComponentDefinition(inner, args) {
      this.inner = inner;
      this.args = args;
      this[CURRIED_COMPONENT_DEFINITION_BRAND] = true;
    }

    var _proto6 = CurriedComponentDefinition.prototype;

    _proto6.unwrap = function unwrap(args) {
      args.realloc(this.offset);
      var definition = this;

      while (true) {
        var _definition = definition,
            curriedArgs = _definition.args,
            inner = _definition.inner;

        if (curriedArgs) {
          args.positional.prepend(curriedArgs.positional);
          args.named.merge(curriedArgs.named);
        }

        if (!isCurriedComponentDefinition(inner)) {
          return inner;
        }

        definition = inner;
      }
    }
    /** @internal */
    ;

    (0, _emberBabel.createClass)(CurriedComponentDefinition, [{
      key: "offset",
      get: function get() {
        var inner = this.inner,
            args = this.args;
        var length = args ? args.positional.length : 0;
        return isCurriedComponentDefinition(inner) ? length + inner.offset : length;
      }
    }]);
    return CurriedComponentDefinition;
  }();

  _exports.CurriedComponentDefinition = CurriedComponentDefinition;

  function curry(spec, args) {
    if (args === void 0) {
      args = null;
    }

    return new CurriedComponentDefinition(spec, args);
  }

  function normalizeStringValue(value$$1) {
    if (isEmpty(value$$1)) {
      return '';
    }

    return String(value$$1);
  }

  function shouldCoerce(value$$1) {
    return isString(value$$1) || isEmpty(value$$1) || typeof value$$1 === 'boolean' || typeof value$$1 === 'number';
  }

  function isEmpty(value$$1) {
    return value$$1 === null || value$$1 === undefined || typeof value$$1.toString !== 'function';
  }

  function isSafeString(value$$1) {
    return typeof value$$1 === 'object' && value$$1 !== null && typeof value$$1.toHTML === 'function';
  }

  function isNode(value$$1) {
    return typeof value$$1 === 'object' && value$$1 !== null && typeof value$$1.nodeType === 'number';
  }

  function isFragment(value$$1) {
    return isNode(value$$1) && value$$1.nodeType === 11;
  }

  function isString(value$$1) {
    return typeof value$$1 === 'string';
  }

  var DynamicTextContent =
  /*#__PURE__*/
  function (_UpdatingOpcode) {
    (0, _emberBabel.inheritsLoose)(DynamicTextContent, _UpdatingOpcode);

    function DynamicTextContent(node, reference, lastValue) {
      var _this4;

      _this4 = _UpdatingOpcode.call(this) || this;
      _this4.node = node;
      _this4.reference = reference;
      _this4.lastValue = lastValue;
      _this4.type = 'dynamic-text';
      _this4.tag = reference.tag;
      _this4.lastRevision = (0, _reference2.value)(_this4.tag);
      return _this4;
    }

    var _proto7 = DynamicTextContent.prototype;

    _proto7.evaluate = function evaluate() {
      var reference = this.reference,
          tag = this.tag;

      if (!(0, _reference2.validate)(tag, this.lastRevision)) {
        this.lastRevision = (0, _reference2.value)(tag);
        this.update(reference.value());
      }
    };

    _proto7.update = function update(value$$1) {
      var lastValue = this.lastValue;
      if (value$$1 === lastValue) return;
      var normalized;

      if (isEmpty(value$$1)) {
        normalized = '';
      } else if (isString(value$$1)) {
        normalized = value$$1;
      } else {
        normalized = String(value$$1);
      }

      if (normalized !== lastValue) {
        var textNode = this.node;
        textNode.nodeValue = this.lastValue = normalized;
      }
    };

    return DynamicTextContent;
  }(UpdatingOpcode);

  var IsCurriedComponentDefinitionReference =
  /*#__PURE__*/
  function (_ConditionalReference) {
    (0, _emberBabel.inheritsLoose)(IsCurriedComponentDefinitionReference, _ConditionalReference);

    function IsCurriedComponentDefinitionReference() {
      return _ConditionalReference.apply(this, arguments) || this;
    }

    IsCurriedComponentDefinitionReference.create = function create(inner) {
      return new IsCurriedComponentDefinitionReference(inner);
    };

    var _proto8 = IsCurriedComponentDefinitionReference.prototype;

    _proto8.toBool = function toBool(value$$1) {
      return isCurriedComponentDefinition(value$$1);
    };

    return IsCurriedComponentDefinitionReference;
  }(ConditionalReference);

  var ContentTypeReference =
  /*#__PURE__*/
  function () {
    function ContentTypeReference(inner) {
      this.inner = inner;
      this.tag = inner.tag;
    }

    var _proto9 = ContentTypeReference.prototype;

    _proto9.value = function value() {
      var value$$1 = this.inner.value();

      if (shouldCoerce(value$$1)) {
        return 1
        /* String */
        ;
      } else if (isComponentDefinition(value$$1)) {
        return 0
        /* Component */
        ;
      } else if (isSafeString(value$$1)) {
        return 3
        /* SafeString */
        ;
      } else if (isFragment(value$$1)) {
        return 4
        /* Fragment */
        ;
      } else if (isNode(value$$1)) {
        return 5
        /* Node */
        ;
      } else {
          return 1
          /* String */
          ;
        }
    };

    return ContentTypeReference;
  }();

  APPEND_OPCODES.add(28
  /* AppendHTML */
  , function (vm) {
    var reference = vm.stack.pop();
    var rawValue = reference.value();
    var value$$1 = isEmpty(rawValue) ? '' : String(rawValue);
    vm.elements().appendDynamicHTML(value$$1);
  });
  APPEND_OPCODES.add(29
  /* AppendSafeHTML */
  , function (vm) {
    var reference = vm.stack.pop();
    var rawValue = reference.value().toHTML();
    var value$$1 = isEmpty(rawValue) ? '' : rawValue;
    vm.elements().appendDynamicHTML(value$$1);
  });
  APPEND_OPCODES.add(32
  /* AppendText */
  , function (vm) {
    var reference = vm.stack.pop();
    var rawValue = reference.value();
    var value$$1 = isEmpty(rawValue) ? '' : String(rawValue);
    var node = vm.elements().appendDynamicText(value$$1);

    if (!(0, _reference2.isConst)(reference)) {
      vm.updateWith(new DynamicTextContent(node, reference, value$$1));
    }
  });
  APPEND_OPCODES.add(30
  /* AppendDocumentFragment */
  , function (vm) {
    var reference = vm.stack.pop();
    var value$$1 = reference.value();
    vm.elements().appendDynamicFragment(value$$1);
  });
  APPEND_OPCODES.add(31
  /* AppendNode */
  , function (vm) {
    var reference = vm.stack.pop();
    var value$$1 = reference.value();
    vm.elements().appendDynamicNode(value$$1);
  });
  APPEND_OPCODES.add(22
  /* ChildScope */
  , function (vm) {
    return vm.pushChildScope();
  });
  APPEND_OPCODES.add(23
  /* PopScope */
  , function (vm) {
    return vm.popScope();
  });
  APPEND_OPCODES.add(44
  /* PushDynamicScope */
  , function (vm) {
    return vm.pushDynamicScope();
  });
  APPEND_OPCODES.add(45
  /* PopDynamicScope */
  , function (vm) {
    return vm.popDynamicScope();
  });
  APPEND_OPCODES.add(12
  /* Constant */
  , function (vm, _ref11) {
    var other = _ref11.op1;
    vm.stack.push(vm.constants.getOther(other));
  });
  APPEND_OPCODES.add(13
  /* Primitive */
  , function (vm, _ref12) {
    var primitive = _ref12.op1;
    var stack = vm.stack;
    var flag = primitive & 7; // 111

    var value$$1 = primitive >> 3;

    switch (flag) {
      case 0
      /* NUMBER */
      :
        stack.push(value$$1);
        break;

      case 1
      /* FLOAT */
      :
        stack.push(vm.constants.getNumber(value$$1));
        break;

      case 2
      /* STRING */
      :
        stack.push(vm.constants.getString(value$$1));
        break;

      case 3
      /* BOOLEAN_OR_VOID */
      :
        stack.pushEncodedImmediate(primitive);
        break;

      case 4
      /* NEGATIVE */
      :
        stack.push(vm.constants.getNumber(value$$1));
        break;

      case 5
      /* BIG_NUM */
      :
        stack.push(vm.constants.getNumber(value$$1));
        break;
    }
  });
  APPEND_OPCODES.add(14
  /* PrimitiveReference */
  , function (vm) {
    var stack = vm.stack;
    stack.push(PrimitiveReference.create(stack.pop()));
  });
  APPEND_OPCODES.add(15
  /* ReifyU32 */
  , function (vm) {
    var stack = vm.stack;
    stack.push(stack.peek().value());
  });
  APPEND_OPCODES.add(16
  /* Dup */
  , function (vm, _ref13) {
    var register = _ref13.op1,
        offset = _ref13.op2;
    var position = vm.fetchValue(register) - offset;
    vm.stack.dup(position);
  });
  APPEND_OPCODES.add(17
  /* Pop */
  , function (vm, _ref14) {
    var count = _ref14.op1;
    vm.stack.pop(count);
  });
  APPEND_OPCODES.add(18
  /* Load */
  , function (vm, _ref15) {
    var register = _ref15.op1;
    vm.load(register);
  });
  APPEND_OPCODES.add(19
  /* Fetch */
  , function (vm, _ref16) {
    var register = _ref16.op1;
    vm.fetch(register);
  });
  APPEND_OPCODES.add(43
  /* BindDynamicScope */
  , function (vm, _ref17) {
    var _names = _ref17.op1;
    var names = vm.constants.getArray(_names);
    vm.bindDynamicScope(names);
  });
  APPEND_OPCODES.add(61
  /* Enter */
  , function (vm, _ref18) {
    var args = _ref18.op1;
    vm.enter(args);
  });
  APPEND_OPCODES.add(62
  /* Exit */
  , function (vm) {
    vm.exit();
  });
  APPEND_OPCODES.add(48
  /* PushSymbolTable */
  , function (vm, _ref19) {
    var _table = _ref19.op1;
    var stack = vm.stack;
    stack.push(vm.constants.getSerializable(_table));
  });
  APPEND_OPCODES.add(47
  /* PushBlockScope */
  , function (vm) {
    var stack = vm.stack;
    stack.push(vm.scope());
  });
  APPEND_OPCODES.add(46
  /* CompileBlock */
  , function (vm) {
    var stack = vm.stack;
    var block = stack.pop();

    if (block) {
      stack.push(block.compile());
    } else {
      stack.pushNull();
    }
  });
  APPEND_OPCODES.add(51
  /* InvokeYield */
  , function (vm) {
    var stack = vm.stack;
    var handle = stack.pop();
    var scope = stack.pop(); // FIXME(mmun): shouldn't need to cast this

    var table = stack.pop();
    var args = stack.pop();

    if (table === null) {
      // To balance the pop{Frame,Scope}
      vm.pushFrame();
      vm.pushScope(scope); // Could be null but it doesnt matter as it is immediatelly popped.

      return;
    }

    var invokingScope = scope; // If necessary, create a child scope

    {
      var locals = table.parameters;
      var localsCount = locals.length;

      if (localsCount > 0) {
        invokingScope = invokingScope.child();

        for (var i = 0; i < localsCount; i++) {
          invokingScope.bindSymbol(locals[i], args.at(i));
        }
      }
    }
    vm.pushFrame();
    vm.pushScope(invokingScope);
    vm.call(handle);
  });
  APPEND_OPCODES.add(53
  /* JumpIf */
  , function (vm, _ref20) {
    var target = _ref20.op1;
    var reference = vm.stack.pop();

    if ((0, _reference2.isConst)(reference)) {
      if (reference.value()) {
        vm.goto(target);
      }
    } else {
      var cache = new _reference2.ReferenceCache(reference);

      if (cache.peek()) {
        vm.goto(target);
      }

      vm.updateWith(new Assert(cache));
    }
  });
  APPEND_OPCODES.add(54
  /* JumpUnless */
  , function (vm, _ref21) {
    var target = _ref21.op1;
    var reference = vm.stack.pop();

    if ((0, _reference2.isConst)(reference)) {
      if (!reference.value()) {
        vm.goto(target);
      }
    } else {
      var cache = new _reference2.ReferenceCache(reference);

      if (!cache.peek()) {
        vm.goto(target);
      }

      vm.updateWith(new Assert(cache));
    }
  });
  APPEND_OPCODES.add(55
  /* JumpEq */
  , function (vm, _ref22) {
    var target = _ref22.op1,
        comparison = _ref22.op2;
    var other = vm.stack.peek();

    if (other === comparison) {
      vm.goto(target);
    }
  });
  APPEND_OPCODES.add(56
  /* AssertSame */
  , function (vm) {
    var reference = vm.stack.peek();

    if (!(0, _reference2.isConst)(reference)) {
      vm.updateWith(Assert.initialize(new _reference2.ReferenceCache(reference)));
    }
  });
  APPEND_OPCODES.add(63
  /* ToBoolean */
  , function (vm) {
    var env = vm.env,
        stack = vm.stack;
    stack.push(env.toConditionalReference(stack.pop()));
  });

  var Assert =
  /*#__PURE__*/
  function (_UpdatingOpcode2) {
    (0, _emberBabel.inheritsLoose)(Assert, _UpdatingOpcode2);

    function Assert(cache) {
      var _this5;

      _this5 = _UpdatingOpcode2.call(this) || this;
      _this5.type = 'assert';
      _this5.tag = cache.tag;
      _this5.cache = cache;
      return _this5;
    }

    Assert.initialize = function initialize(cache) {
      var assert = new Assert(cache);
      cache.peek();
      return assert;
    };

    var _proto10 = Assert.prototype;

    _proto10.evaluate = function evaluate(vm) {
      var cache = this.cache;

      if ((0, _reference2.isModified)(cache.revalidate())) {
        vm.throw();
      }
    };

    return Assert;
  }(UpdatingOpcode);

  var JumpIfNotModifiedOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode3) {
    (0, _emberBabel.inheritsLoose)(JumpIfNotModifiedOpcode, _UpdatingOpcode3);

    function JumpIfNotModifiedOpcode(tag, target) {
      var _this6;

      _this6 = _UpdatingOpcode3.call(this) || this;
      _this6.target = target;
      _this6.type = 'jump-if-not-modified';
      _this6.tag = tag;
      _this6.lastRevision = (0, _reference2.value)(tag);
      return _this6;
    }

    var _proto11 = JumpIfNotModifiedOpcode.prototype;

    _proto11.evaluate = function evaluate(vm) {
      var tag = this.tag,
          target = this.target,
          lastRevision = this.lastRevision;

      if (!vm.alwaysRevalidate && (0, _reference2.validate)(tag, lastRevision)) {
        vm.goto(target);
      }
    };

    _proto11.didModify = function didModify() {
      this.lastRevision = (0, _reference2.value)(this.tag);
    };

    return JumpIfNotModifiedOpcode;
  }(UpdatingOpcode);

  var DidModifyOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode4) {
    (0, _emberBabel.inheritsLoose)(DidModifyOpcode, _UpdatingOpcode4);

    function DidModifyOpcode(target) {
      var _this7;

      _this7 = _UpdatingOpcode4.call(this) || this;
      _this7.target = target;
      _this7.type = 'did-modify';
      _this7.tag = _reference2.CONSTANT_TAG;
      return _this7;
    }

    var _proto12 = DidModifyOpcode.prototype;

    _proto12.evaluate = function evaluate() {
      this.target.didModify();
    };

    return DidModifyOpcode;
  }(UpdatingOpcode);

  var LabelOpcode =
  /*#__PURE__*/
  function () {
    function LabelOpcode(label) {
      this.tag = _reference2.CONSTANT_TAG;
      this.type = 'label';
      this.label = null;
      this.prev = null;
      this.next = null;
      (0, _util.initializeGuid)(this);
      this.label = label;
    }

    var _proto13 = LabelOpcode.prototype;

    _proto13.evaluate = function evaluate() {};

    _proto13.inspect = function inspect() {
      return this.label + " [" + this._guid + "]";
    };

    return LabelOpcode;
  }();

  APPEND_OPCODES.add(26
  /* Text */
  , function (vm, _ref23) {
    var text = _ref23.op1;
    vm.elements().appendText(vm.constants.getString(text));
  });
  APPEND_OPCODES.add(27
  /* Comment */
  , function (vm, _ref24) {
    var text = _ref24.op1;
    vm.elements().appendComment(vm.constants.getString(text));
  });
  APPEND_OPCODES.add(33
  /* OpenElement */
  , function (vm, _ref25) {
    var tag = _ref25.op1;
    vm.elements().openElement(vm.constants.getString(tag));
  });
  APPEND_OPCODES.add(34
  /* OpenDynamicElement */
  , function (vm) {
    var tagName = vm.stack.pop().value();
    vm.elements().openElement(tagName);
  });
  APPEND_OPCODES.add(41
  /* PushRemoteElement */
  , function (vm) {
    var elementRef = vm.stack.pop();
    var nextSiblingRef = vm.stack.pop();
    var guidRef = vm.stack.pop();
    var element;
    var nextSibling;
    var guid = guidRef.value();

    if ((0, _reference2.isConst)(elementRef)) {
      element = elementRef.value();
    } else {
      var cache = new _reference2.ReferenceCache(elementRef);
      element = cache.peek();
      vm.updateWith(new Assert(cache));
    }

    if ((0, _reference2.isConst)(nextSiblingRef)) {
      nextSibling = nextSiblingRef.value();
    } else {
      var _cache = new _reference2.ReferenceCache(nextSiblingRef);

      nextSibling = _cache.peek();
      vm.updateWith(new Assert(_cache));
    }

    vm.elements().pushRemoteElement(element, guid, nextSibling);
  });
  APPEND_OPCODES.add(42
  /* PopRemoteElement */
  , function (vm) {
    vm.elements().popRemoteElement();
  });
  APPEND_OPCODES.add(38
  /* FlushElement */
  , function (vm) {
    var operations = vm.fetchValue(_vm2.Register.t0);
    var modifiers = null;

    if (operations) {
      modifiers = operations.flush(vm);
      vm.loadValue(_vm2.Register.t0, null);
    }

    vm.elements().flushElement(modifiers);
  });
  APPEND_OPCODES.add(39
  /* CloseElement */
  , function (vm) {
    var modifiers = vm.elements().closeElement();

    if (modifiers) {
      modifiers.forEach(function (_ref26) {
        var manager = _ref26[0],
            modifier = _ref26[1];
        vm.env.scheduleInstallModifier(modifier, manager);
        var destructor = manager.getDestructor(modifier);

        if (destructor) {
          vm.newDestroyable(destructor);
        }
      });
    }
  });
  APPEND_OPCODES.add(40
  /* Modifier */
  , function (vm, _ref27) {
    var handle = _ref27.op1;

    var _vm$constants$resolve = vm.constants.resolveHandle(handle),
        manager = _vm$constants$resolve.manager,
        state = _vm$constants$resolve.state;

    var stack = vm.stack;
    var args = stack.pop();

    var _vm$elements = vm.elements(),
        constructing = _vm$elements.constructing,
        updateOperations = _vm$elements.updateOperations;

    var dynamicScope = vm.dynamicScope();
    var modifier = manager.create(constructing, state, args, dynamicScope, updateOperations);
    var operations = vm.fetchValue(_vm2.Register.t0);
    operations.addModifier(manager, modifier);
    var tag = manager.getTag(modifier);

    if (!(0, _reference2.isConstTag)(tag)) {
      vm.updateWith(new UpdateModifierOpcode(tag, manager, modifier));
    }
  });

  var UpdateModifierOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode5) {
    (0, _emberBabel.inheritsLoose)(UpdateModifierOpcode, _UpdatingOpcode5);

    function UpdateModifierOpcode(tag, manager, modifier) {
      var _this8;

      _this8 = _UpdatingOpcode5.call(this) || this;
      _this8.tag = tag;
      _this8.manager = manager;
      _this8.modifier = modifier;
      _this8.type = 'update-modifier';
      _this8.lastUpdated = (0, _reference2.value)(tag);
      return _this8;
    }

    var _proto14 = UpdateModifierOpcode.prototype;

    _proto14.evaluate = function evaluate(vm) {
      var manager = this.manager,
          modifier = this.modifier,
          tag = this.tag,
          lastUpdated = this.lastUpdated;

      if (!(0, _reference2.validate)(tag, lastUpdated)) {
        vm.env.scheduleUpdateModifier(modifier, manager);
        this.lastUpdated = (0, _reference2.value)(tag);
      }
    };

    return UpdateModifierOpcode;
  }(UpdatingOpcode);

  APPEND_OPCODES.add(35
  /* StaticAttr */
  , function (vm, _ref28) {
    var _name = _ref28.op1,
        _value = _ref28.op2,
        _namespace = _ref28.op3;
    var name = vm.constants.getString(_name);
    var value$$1 = vm.constants.getString(_value);
    var namespace = _namespace ? vm.constants.getString(_namespace) : null;
    vm.elements().setStaticAttribute(name, value$$1, namespace);
  });
  APPEND_OPCODES.add(36
  /* DynamicAttr */
  , function (vm, _ref29) {
    var _name = _ref29.op1,
        trusting = _ref29.op2,
        _namespace = _ref29.op3;
    var name = vm.constants.getString(_name);
    var reference = vm.stack.pop();
    var value$$1 = reference.value();
    var namespace = _namespace ? vm.constants.getString(_namespace) : null;
    var attribute = vm.elements().setDynamicAttribute(name, value$$1, !!trusting, namespace);

    if (!(0, _reference2.isConst)(reference)) {
      vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
    }
  });

  var UpdateDynamicAttributeOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode6) {
    (0, _emberBabel.inheritsLoose)(UpdateDynamicAttributeOpcode, _UpdatingOpcode6);

    function UpdateDynamicAttributeOpcode(reference, attribute) {
      var _this9;

      _this9 = _UpdatingOpcode6.call(this) || this;
      _this9.reference = reference;
      _this9.attribute = attribute;
      _this9.type = 'patch-element';
      var tag = reference.tag;
      _this9.tag = tag;
      _this9.lastRevision = (0, _reference2.value)(tag);
      return _this9;
    }

    var _proto15 = UpdateDynamicAttributeOpcode.prototype;

    _proto15.evaluate = function evaluate(vm) {
      var attribute = this.attribute,
          reference = this.reference,
          tag = this.tag;

      if (!(0, _reference2.validate)(tag, this.lastRevision)) {
        this.lastRevision = (0, _reference2.value)(tag);
        attribute.update(reference.value(), vm.env);
      }
    };

    return UpdateDynamicAttributeOpcode;
  }(UpdatingOpcode);

  function resolveComponent(resolver, name, meta) {
    var definition = resolver.lookupComponentDefinition(name, meta);
    return definition;
  }

  var CurryComponentReference =
  /*#__PURE__*/
  function () {
    function CurryComponentReference(inner, resolver, meta, args) {
      this.inner = inner;
      this.resolver = resolver;
      this.meta = meta;
      this.args = args;
      this.tag = inner.tag;
      this.lastValue = null;
      this.lastDefinition = null;
    }

    var _proto16 = CurryComponentReference.prototype;

    _proto16.value = function value() {
      var inner = this.inner,
          lastValue = this.lastValue;
      var value$$1 = inner.value();

      if (value$$1 === lastValue) {
        return this.lastDefinition;
      }

      var definition = null;

      if (isCurriedComponentDefinition(value$$1)) {
        definition = value$$1;
      } else if (typeof value$$1 === 'string' && value$$1) {
        var resolver = this.resolver,
            meta = this.meta;
        definition = resolveComponent(resolver, value$$1, meta);
      }

      definition = this.curry(definition);
      this.lastValue = value$$1;
      this.lastDefinition = definition;
      return definition;
    };

    _proto16.get = function get() {
      return UNDEFINED_REFERENCE;
    };

    _proto16.curry = function curry(definition) {
      var args = this.args;

      if (!args && isCurriedComponentDefinition(definition)) {
        return definition;
      } else if (!definition) {
        return null;
      } else {
        return new CurriedComponentDefinition(definition, args);
      }
    };

    return CurryComponentReference;
  }();

  var ClassListReference =
  /*#__PURE__*/
  function () {
    function ClassListReference(list) {
      this.list = list;
      this.tag = (0, _reference2.combineTagged)(list);
      this.list = list;
    }

    var _proto17 = ClassListReference.prototype;

    _proto17.value = function value() {
      var ret = [];
      var list = this.list;

      for (var i = 0; i < list.length; i++) {
        var value$$1 = normalizeStringValue(list[i].value());
        if (value$$1) ret.push(value$$1);
      }

      return ret.length === 0 ? null : ret.join(' ');
    };

    return ClassListReference;
  }();
  /**
   * Converts a ComponentCapabilities object into a 32-bit integer representation.
   */


  function capabilityFlagsFrom(capabilities) {
    return 0 | (capabilities.dynamicLayout ? 1
    /* DynamicLayout */
    : 0) | (capabilities.dynamicTag ? 2
    /* DynamicTag */
    : 0) | (capabilities.prepareArgs ? 4
    /* PrepareArgs */
    : 0) | (capabilities.createArgs ? 8
    /* CreateArgs */
    : 0) | (capabilities.attributeHook ? 16
    /* AttributeHook */
    : 0) | (capabilities.elementHook ? 32
    /* ElementHook */
    : 0) | (capabilities.dynamicScope ? 64
    /* DynamicScope */
    : 0) | (capabilities.createCaller ? 128
    /* CreateCaller */
    : 0) | (capabilities.updateHook ? 256
    /* UpdateHook */
    : 0) | (capabilities.createInstance ? 512
    /* CreateInstance */
    : 0);
  }

  function hasCapability(capabilities, capability) {
    return !!(capabilities & capability);
  }

  APPEND_OPCODES.add(69
  /* IsComponent */
  , function (vm) {
    var stack = vm.stack;
    var ref = stack.pop();
    stack.push(IsCurriedComponentDefinitionReference.create(ref));
  });
  APPEND_OPCODES.add(70
  /* ContentType */
  , function (vm) {
    var stack = vm.stack;
    var ref = stack.peek();
    stack.push(new ContentTypeReference(ref));
  });
  APPEND_OPCODES.add(71
  /* CurryComponent */
  , function (vm, _ref30) {
    var _meta = _ref30.op1;
    var stack = vm.stack;
    var definition = stack.pop();
    var capturedArgs = stack.pop();
    var meta = vm.constants.getSerializable(_meta);
    var resolver = vm.constants.resolver;
    vm.loadValue(_vm2.Register.v0, new CurryComponentReference(definition, resolver, meta, capturedArgs)); // expectStackChange(vm.stack, -args.length - 1, 'CurryComponent');
  });
  APPEND_OPCODES.add(72
  /* PushComponentDefinition */
  , function (vm, _ref31) {
    var handle = _ref31.op1;
    var definition = vm.constants.resolveHandle(handle);
    var manager = definition.manager;
    var capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    var instance = {
      definition: definition,
      manager: manager,
      capabilities: capabilities,
      state: null,
      handle: null,
      table: null,
      lookup: null
    };
    vm.stack.push(instance);
  });
  APPEND_OPCODES.add(75
  /* ResolveDynamicComponent */
  , function (vm, _ref32) {
    var _meta = _ref32.op1;
    var stack = vm.stack;
    var component = stack.pop().value();
    var meta = vm.constants.getSerializable(_meta);
    vm.loadValue(_vm2.Register.t1, null); // Clear the temp register

    var definition;

    if (typeof component === 'string') {
      var resolver = vm.constants.resolver;
      var resolvedDefinition = resolveComponent(resolver, component, meta);
      definition = resolvedDefinition;
    } else if (isCurriedComponentDefinition(component)) {
      definition = component;
    } else {
      throw (0, _util.unreachable)();
    }

    stack.push(definition);
  });
  APPEND_OPCODES.add(73
  /* PushDynamicComponentInstance */
  , function (vm) {
    var stack = vm.stack;
    var definition = stack.pop();
    var capabilities, manager;

    if (isCurriedComponentDefinition(definition)) {
      manager = capabilities = null;
    } else {
      manager = definition.manager;
      capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    }

    stack.push({
      definition: definition,
      capabilities: capabilities,
      manager: manager,
      state: null,
      handle: null,
      table: null
    });
  });
  APPEND_OPCODES.add(74
  /* PushCurriedComponent */
  , function (vm, _ref33) {
    (0, _emberBabel.objectDestructuringEmpty)(_ref33);
    var stack = vm.stack;
    var component = stack.pop().value();
    var definition;

    if (isCurriedComponentDefinition(component)) {
      definition = component;
    } else {
      throw (0, _util.unreachable)();
    }

    stack.push(definition);
  });
  APPEND_OPCODES.add(76
  /* PushArgs */
  , function (vm, _ref34) {
    var _names = _ref34.op1,
        flags = _ref34.op2;
    var stack = vm.stack;
    var names = vm.constants.getStringArray(_names);
    var positionalCount = flags >> 4;
    var synthetic = flags & 8;
    var blockNames = [];
    if (flags & 4) blockNames.push('main');
    if (flags & 2) blockNames.push('else');
    if (flags & 1) blockNames.push('attrs');
    vm.args.setup(stack, names, blockNames, positionalCount, !!synthetic);
    stack.push(vm.args);
  });
  APPEND_OPCODES.add(77
  /* PushEmptyArgs */
  , function (vm) {
    var stack = vm.stack;
    stack.push(vm.args.empty(stack));
  });
  APPEND_OPCODES.add(80
  /* CaptureArgs */
  , function (vm) {
    var stack = vm.stack;
    var args = stack.pop();
    var capturedArgs = args.capture();
    stack.push(capturedArgs);
  });
  APPEND_OPCODES.add(79
  /* PrepareArgs */
  , function (vm, _ref35) {
    var _state = _ref35.op1;
    var stack = vm.stack;
    var instance = vm.fetchValue(_state);
    var args = stack.pop();
    var definition = instance.definition;

    if (isCurriedComponentDefinition(definition)) {
      definition = resolveCurriedComponentDefinition(instance, definition, args);
    }

    var _definition2 = definition,
        manager = _definition2.manager,
        state = _definition2.state;
    var capabilities = instance.capabilities;

    if (hasCapability(capabilities, 4
    /* PrepareArgs */
    ) !== true) {
      stack.push(args);
      return;
    }

    var blocks = args.blocks.values;
    var blockNames = args.blocks.names;
    var preparedArgs = manager.prepareArgs(state, args);

    if (preparedArgs) {
      args.clear();

      for (var i = 0; i < blocks.length; i++) {
        stack.push(blocks[i]);
      }

      var positional = preparedArgs.positional,
          named = preparedArgs.named;
      var positionalCount = positional.length;

      for (var _i = 0; _i < positionalCount; _i++) {
        stack.push(positional[_i]);
      }

      var names = Object.keys(named);

      for (var _i2 = 0; _i2 < names.length; _i2++) {
        stack.push(named[names[_i2]]);
      }

      args.setup(stack, names, blockNames, positionalCount, true);
    }

    stack.push(args);
  });

  function resolveCurriedComponentDefinition(instance, definition, args) {
    var unwrappedDefinition = instance.definition = definition.unwrap(args);
    var manager = unwrappedDefinition.manager,
        state = unwrappedDefinition.state;
    instance.manager = manager;
    instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
    return unwrappedDefinition;
  }

  APPEND_OPCODES.add(81
  /* CreateComponent */
  , function (vm, _ref36) {
    var flags = _ref36.op1,
        _state = _ref36.op2;
    var instance = vm.fetchValue(_state);
    var definition = instance.definition,
        manager = instance.manager;
    var capabilities = instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    var dynamicScope = null;

    if (hasCapability(capabilities, 64
    /* DynamicScope */
    )) {
      dynamicScope = vm.dynamicScope();
    }

    var hasDefaultBlock = flags & 1;
    var args = null;

    if (hasCapability(capabilities, 8
    /* CreateArgs */
    )) {
      args = vm.stack.peek();
    }

    var self = null;

    if (hasCapability(capabilities, 128
    /* CreateCaller */
    )) {
      self = vm.getSelf();
    }

    var state = manager.create(vm.env, definition.state, args, dynamicScope, self, !!hasDefaultBlock); // We want to reuse the `state` POJO here, because we know that the opcodes
    // only transition at exactly one place.

    instance.state = state;
    var tag = manager.getTag(state);

    if (hasCapability(capabilities, 256
    /* UpdateHook */
    ) && !(0, _reference2.isConstTag)(tag)) {
      vm.updateWith(new UpdateComponentOpcode(tag, state, manager, dynamicScope));
    }
  });
  APPEND_OPCODES.add(82
  /* RegisterComponentDestructor */
  , function (vm, _ref37) {
    var _state = _ref37.op1;

    var _vm$fetchValue = vm.fetchValue(_state),
        manager = _vm$fetchValue.manager,
        state = _vm$fetchValue.state;

    var destructor = manager.getDestructor(state);
    if (destructor) vm.newDestroyable(destructor);
  });
  APPEND_OPCODES.add(91
  /* BeginComponentTransaction */
  , function (vm) {
    vm.beginCacheGroup();
    vm.elements().pushSimpleBlock();
  });
  APPEND_OPCODES.add(83
  /* PutComponentOperations */
  , function (vm) {
    vm.loadValue(_vm2.Register.t0, new ComponentElementOperations());
  });
  APPEND_OPCODES.add(37
  /* ComponentAttr */
  , function (vm, _ref38) {
    var _name = _ref38.op1,
        trusting = _ref38.op2,
        _namespace = _ref38.op3;
    var name = vm.constants.getString(_name);
    var reference = vm.stack.pop();
    var namespace = _namespace ? vm.constants.getString(_namespace) : null;
    vm.fetchValue(_vm2.Register.t0).setAttribute(name, reference, !!trusting, namespace);
  });

  var ComponentElementOperations =
  /*#__PURE__*/
  function () {
    function ComponentElementOperations() {
      this.attributes = (0, _util.dict)();
      this.classes = [];
      this.modifiers = [];
    }

    var _proto18 = ComponentElementOperations.prototype;

    _proto18.setAttribute = function setAttribute(name, value$$1, trusting, namespace) {
      var deferred = {
        value: value$$1,
        namespace: namespace,
        trusting: trusting
      };

      if (name === 'class') {
        this.classes.push(value$$1);
      }

      this.attributes[name] = deferred;
    };

    _proto18.addModifier = function addModifier(manager, modifier) {
      this.modifiers.push([manager, modifier]);
    };

    _proto18.flush = function flush(vm) {
      for (var name in this.attributes) {
        var attr = this.attributes[name];
        var reference = attr.value,
            namespace = attr.namespace,
            trusting = attr.trusting;

        if (name === 'class') {
          reference = new ClassListReference(this.classes);
        }

        if (name === 'type') {
          continue;
        }

        var attribute = vm.elements().setDynamicAttribute(name, reference.value(), trusting, namespace);

        if (!(0, _reference2.isConst)(reference)) {
          vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
        }
      }

      if ('type' in this.attributes) {
        var type = this.attributes.type;
        var _reference = type.value,
            _namespace2 = type.namespace,
            _trusting = type.trusting;

        var _attribute = vm.elements().setDynamicAttribute('type', _reference.value(), _trusting, _namespace2);

        if (!(0, _reference2.isConst)(_reference)) {
          vm.updateWith(new UpdateDynamicAttributeOpcode(_reference, _attribute));
        }
      }

      return this.modifiers;
    };

    return ComponentElementOperations;
  }();

  APPEND_OPCODES.add(93
  /* DidCreateElement */
  , function (vm, _ref39) {
    var _state = _ref39.op1;

    var _vm$fetchValue2 = vm.fetchValue(_state),
        definition = _vm$fetchValue2.definition,
        state = _vm$fetchValue2.state;

    var manager = definition.manager;
    var operations = vm.fetchValue(_vm2.Register.t0);
    var action = 'DidCreateElementOpcode#evaluate';
    manager.didCreateElement(state, vm.elements().expectConstructing(action), operations);
  });
  APPEND_OPCODES.add(84
  /* GetComponentSelf */
  , function (vm, _ref40) {
    var _state = _ref40.op1;

    var _vm$fetchValue3 = vm.fetchValue(_state),
        definition = _vm$fetchValue3.definition,
        state = _vm$fetchValue3.state;

    var manager = definition.manager;
    vm.stack.push(manager.getSelf(state));
  });
  APPEND_OPCODES.add(85
  /* GetComponentTagName */
  , function (vm, _ref41) {
    var _state = _ref41.op1;

    var _vm$fetchValue4 = vm.fetchValue(_state),
        definition = _vm$fetchValue4.definition,
        state = _vm$fetchValue4.state;

    var manager = definition.manager;
    vm.stack.push(manager.getTagName(state));
  }); // Dynamic Invocation Only

  APPEND_OPCODES.add(86
  /* GetComponentLayout */
  , function (vm, _ref42) {
    var _state = _ref42.op1;
    var instance = vm.fetchValue(_state);
    var manager = instance.manager,
        definition = instance.definition;
    var resolver = vm.constants.resolver,
        stack = vm.stack;
    var instanceState = instance.state,
        capabilities = instance.capabilities;
    var definitionState = definition.state;
    var invoke;

    if (hasStaticLayoutCapability(capabilities, manager)) {
      invoke = manager.getLayout(definitionState, resolver);
    } else if (hasDynamicLayoutCapability(capabilities, manager)) {
      invoke = manager.getDynamicLayout(instanceState, resolver);
    } else {
      throw (0, _util.unreachable)();
    }

    stack.push(invoke.symbolTable);
    stack.push(invoke.handle);
  });

  function hasStaticLayoutCapability(capabilities, _manager) {
    return hasCapability(capabilities, 1
    /* DynamicLayout */
    ) === false;
  }

  function hasDynamicLayoutCapability(capabilities, _manager) {
    return hasCapability(capabilities, 1
    /* DynamicLayout */
    ) === true;
  }

  APPEND_OPCODES.add(68
  /* Main */
  , function (vm, _ref43) {
    var register = _ref43.op1;
    var definition = vm.stack.pop();
    var invocation = vm.stack.pop();
    var manager = definition.manager;
    var capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    var state = {
      definition: definition,
      manager: manager,
      capabilities: capabilities,
      state: null,
      handle: invocation.handle,
      table: invocation.symbolTable,
      lookup: null
    };
    vm.loadValue(register, state);
  });
  APPEND_OPCODES.add(89
  /* PopulateLayout */
  , function (vm, _ref44) {
    var _state = _ref44.op1;
    var stack = vm.stack;
    var handle = stack.pop();
    var table = stack.pop();
    var state = vm.fetchValue(_state);
    state.handle = handle;
    state.table = table;
  });
  APPEND_OPCODES.add(21
  /* VirtualRootScope */
  , function (vm, _ref45) {
    var _state = _ref45.op1;
    var symbols = vm.fetchValue(_state).table.symbols;
    vm.pushRootScope(symbols.length + 1, true);
  });
  APPEND_OPCODES.add(87
  /* SetupForEval */
  , function (vm, _ref46) {
    var _state = _ref46.op1;
    var state = vm.fetchValue(_state);

    if (state.table.hasEval) {
      var lookup = state.lookup = (0, _util.dict)();
      vm.scope().bindEvalScope(lookup);
    }
  });
  APPEND_OPCODES.add(2
  /* SetNamedVariables */
  , function (vm, _ref47) {
    var _state = _ref47.op1;
    var state = vm.fetchValue(_state);
    var scope = vm.scope();
    var args = vm.stack.peek();
    var callerNames = args.named.atNames;

    for (var i = callerNames.length - 1; i >= 0; i--) {
      var atName = callerNames[i];
      var symbol = state.table.symbols.indexOf(callerNames[i]);
      var value$$1 = args.named.get(atName, false);
      if (symbol !== -1) scope.bindSymbol(symbol + 1, value$$1);
      if (state.lookup) state.lookup[atName] = value$$1;
    }
  });

  function bindBlock(symbolName, blockName, state, blocks, vm) {
    var symbol = state.table.symbols.indexOf(symbolName);
    var block = blocks.get(blockName);

    if (symbol !== -1) {
      vm.scope().bindBlock(symbol + 1, block);
    }

    if (state.lookup) state.lookup[symbolName] = block;
  }

  APPEND_OPCODES.add(3
  /* SetBlocks */
  , function (vm, _ref48) {
    var _state = _ref48.op1;
    var state = vm.fetchValue(_state);

    var _vm$stack$peek = vm.stack.peek(),
        blocks = _vm$stack$peek.blocks;

    bindBlock('&attrs', 'attrs', state, blocks, vm);
    bindBlock('&inverse', 'else', state, blocks, vm);
    bindBlock('&default', 'main', state, blocks, vm);
  }); // Dynamic Invocation Only

  APPEND_OPCODES.add(90
  /* InvokeComponentLayout */
  , function (vm, _ref49) {
    var _state = _ref49.op1;
    var state = vm.fetchValue(_state);
    vm.call(state.handle);
  });
  APPEND_OPCODES.add(94
  /* DidRenderLayout */
  , function (vm, _ref50) {
    var _state = _ref50.op1;

    var _vm$fetchValue5 = vm.fetchValue(_state),
        manager = _vm$fetchValue5.manager,
        state = _vm$fetchValue5.state;

    var bounds = vm.elements().popBlock();
    var mgr = manager;
    mgr.didRenderLayout(state, bounds);
    vm.env.didCreate(state, manager);
    vm.updateWith(new DidUpdateLayoutOpcode(manager, state, bounds));
  });
  APPEND_OPCODES.add(92
  /* CommitComponentTransaction */
  , function (vm) {
    vm.commitCacheGroup();
  });

  var UpdateComponentOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode7) {
    (0, _emberBabel.inheritsLoose)(UpdateComponentOpcode, _UpdatingOpcode7);

    function UpdateComponentOpcode(tag, component, manager, dynamicScope) {
      var _this10;

      _this10 = _UpdatingOpcode7.call(this) || this;
      _this10.tag = tag;
      _this10.component = component;
      _this10.manager = manager;
      _this10.dynamicScope = dynamicScope;
      _this10.type = 'update-component';
      return _this10;
    }

    var _proto19 = UpdateComponentOpcode.prototype;

    _proto19.evaluate = function evaluate(_vm) {
      var component = this.component,
          manager = this.manager,
          dynamicScope = this.dynamicScope;
      manager.update(component, dynamicScope);
    };

    return UpdateComponentOpcode;
  }(UpdatingOpcode);

  var DidUpdateLayoutOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode8) {
    (0, _emberBabel.inheritsLoose)(DidUpdateLayoutOpcode, _UpdatingOpcode8);

    function DidUpdateLayoutOpcode(manager, component, bounds) {
      var _this11;

      _this11 = _UpdatingOpcode8.call(this) || this;
      _this11.manager = manager;
      _this11.component = component;
      _this11.bounds = bounds;
      _this11.type = 'did-update-layout';
      _this11.tag = _reference2.CONSTANT_TAG;
      return _this11;
    }

    var _proto20 = DidUpdateLayoutOpcode.prototype;

    _proto20.evaluate = function evaluate(vm) {
      var manager = this.manager,
          component = this.component,
          bounds = this.bounds;
      manager.didUpdateLayout(component, bounds);
      vm.env.didUpdate(component, manager);
    };

    return DidUpdateLayoutOpcode;
  }(UpdatingOpcode);
  /* tslint:disable */


  function debugCallback(context, get) {
    console.info('Use `context`, and `get(<path>)` to debug this template.'); // for example...

    context === get('this');
    debugger;
  }
  /* tslint:enable */


  var callback = debugCallback; // For testing purposes

  function setDebuggerCallback(cb) {
    callback = cb;
  }

  function resetDebuggerCallback() {
    callback = debugCallback;
  }

  var ScopeInspector =
  /*#__PURE__*/
  function () {
    function ScopeInspector(scope, symbols, evalInfo) {
      this.scope = scope;
      this.locals = (0, _util.dict)();

      for (var i = 0; i < evalInfo.length; i++) {
        var slot = evalInfo[i];
        var name = symbols[slot - 1];
        var ref = scope.getSymbol(slot);
        this.locals[name] = ref;
      }
    }

    var _proto21 = ScopeInspector.prototype;

    _proto21.get = function get(path) {
      var scope = this.scope,
          locals = this.locals;
      var parts = path.split('.');

      var _path$split = path.split('.'),
          head = _path$split[0],
          tail = _path$split.slice(1);

      var evalScope = scope.getEvalScope();
      var ref;

      if (head === 'this') {
        ref = scope.getSelf();
      } else if (locals[head]) {
        ref = locals[head];
      } else if (head.indexOf('@') === 0 && evalScope[head]) {
        ref = evalScope[head];
      } else {
        ref = this.scope.getSelf();
        tail = parts;
      }

      return tail.reduce(function (r, part) {
        return r.get(part);
      }, ref);
    };

    return ScopeInspector;
  }();

  APPEND_OPCODES.add(97
  /* Debugger */
  , function (vm, _ref51) {
    var _symbols = _ref51.op1,
        _evalInfo = _ref51.op2;
    var symbols = vm.constants.getStringArray(_symbols);
    var evalInfo = vm.constants.getArray(_evalInfo);
    var inspector = new ScopeInspector(vm.scope(), symbols, evalInfo);
    callback(vm.getSelf().value(), function (path) {
      return inspector.get(path).value();
    });
  });
  APPEND_OPCODES.add(95
  /* InvokePartial */
  , function (vm, _ref52) {
    var _meta = _ref52.op1,
        _symbols = _ref52.op2,
        _evalInfo = _ref52.op3;
    var constants = vm.constants,
        resolver = vm.constants.resolver,
        stack = vm.stack;
    var name = stack.pop().value();
    var meta = constants.getSerializable(_meta);
    var outerSymbols = constants.getStringArray(_symbols);
    var evalInfo = constants.getArray(_evalInfo);
    var handle = resolver.lookupPartial(name, meta);
    var definition = resolver.resolve(handle);

    var _definition$getPartia = definition.getPartial(),
        symbolTable = _definition$getPartia.symbolTable,
        vmHandle = _definition$getPartia.handle;

    {
      var partialSymbols = symbolTable.symbols;
      var outerScope = vm.scope();
      var partialScope = vm.pushRootScope(partialSymbols.length, false);
      var evalScope = outerScope.getEvalScope();
      partialScope.bindCallerScope(outerScope.getCallerScope());
      partialScope.bindEvalScope(evalScope);
      partialScope.bindSelf(outerScope.getSelf());
      var locals = Object.create(outerScope.getPartialMap());

      for (var i = 0; i < evalInfo.length; i++) {
        var slot = evalInfo[i];
        var _name2 = outerSymbols[slot - 1];
        var ref = outerScope.getSymbol(slot);
        locals[_name2] = ref;
      }

      if (evalScope) {
        for (var _i3 = 0; _i3 < partialSymbols.length; _i3++) {
          var _name3 = partialSymbols[_i3];
          var symbol = _i3 + 1;
          var value$$1 = evalScope[_name3];
          if (value$$1 !== undefined) partialScope.bind(symbol, value$$1);
        }
      }

      partialScope.bindPartialMap(locals);
      vm.pushFrame(); // sp += 2

      vm.call(vmHandle);
    }
  });

  var IterablePresenceReference =
  /*#__PURE__*/
  function () {
    function IterablePresenceReference(artifacts) {
      this.tag = artifacts.tag;
      this.artifacts = artifacts;
    }

    var _proto22 = IterablePresenceReference.prototype;

    _proto22.value = function value() {
      return !this.artifacts.isEmpty();
    };

    return IterablePresenceReference;
  }();

  APPEND_OPCODES.add(66
  /* PutIterator */
  , function (vm) {
    var stack = vm.stack;
    var listRef = stack.pop();
    var key = stack.pop();
    var iterable = vm.env.iterableFor(listRef, key.value());
    var iterator = new _reference2.ReferenceIterator(iterable);
    stack.push(iterator);
    stack.push(new IterablePresenceReference(iterator.artifacts));
  });
  APPEND_OPCODES.add(64
  /* EnterList */
  , function (vm, _ref53) {
    var relativeStart = _ref53.op1;
    vm.enterList(relativeStart);
  });
  APPEND_OPCODES.add(65
  /* ExitList */
  , function (vm) {
    vm.exitList();
  });
  APPEND_OPCODES.add(67
  /* Iterate */
  , function (vm, _ref54) {
    var breaks = _ref54.op1;
    var stack = vm.stack;
    var item = stack.peek().next();

    if (item) {
      var tryOpcode = vm.iterate(item.memo, item.value);
      vm.enterItem(item.key, tryOpcode);
    } else {
      vm.goto(breaks);
    }
  });

  var Cursor = function Cursor(element, nextSibling) {
    this.element = element;
    this.nextSibling = nextSibling;
  };

  _exports.Cursor = Cursor;

  var ConcreteBounds =
  /*#__PURE__*/
  function () {
    function ConcreteBounds(parentNode, first, last) {
      this.parentNode = parentNode;
      this.first = first;
      this.last = last;
    }

    var _proto23 = ConcreteBounds.prototype;

    _proto23.parentElement = function parentElement() {
      return this.parentNode;
    };

    _proto23.firstNode = function firstNode() {
      return this.first;
    };

    _proto23.lastNode = function lastNode() {
      return this.last;
    };

    return ConcreteBounds;
  }();

  _exports.ConcreteBounds = ConcreteBounds;

  var SingleNodeBounds =
  /*#__PURE__*/
  function () {
    function SingleNodeBounds(parentNode, node) {
      this.parentNode = parentNode;
      this.node = node;
    }

    var _proto24 = SingleNodeBounds.prototype;

    _proto24.parentElement = function parentElement() {
      return this.parentNode;
    };

    _proto24.firstNode = function firstNode() {
      return this.node;
    };

    _proto24.lastNode = function lastNode() {
      return this.node;
    };

    return SingleNodeBounds;
  }();

  function _move(bounds, reference) {
    var parent = bounds.parentElement();
    var first = bounds.firstNode();
    var last = bounds.lastNode();
    var current = first;

    while (true) {
      var next = current.nextSibling;
      parent.insertBefore(current, reference);

      if (current === last) {
        return next;
      }

      current = next;
    }
  }

  function clear(bounds) {
    var parent = bounds.parentElement();
    var first = bounds.firstNode();
    var last = bounds.lastNode();
    var current = first;

    while (true) {
      var next = current.nextSibling;
      parent.removeChild(current);

      if (current === last) {
        return next;
      }

      current = next;
    }
  } // Patch:    insertAdjacentHTML on SVG Fix
  // Browsers: Safari, IE, Edge, Firefox ~33-34
  // Reason:   insertAdjacentHTML does not exist on SVG elements in Safari. It is
  //           present but throws an exception on IE and Edge. Old versions of
  //           Firefox create nodes in the incorrect namespace.
  // Fix:      Since IE and Edge silently fail to create SVG nodes using
  //           innerHTML, and because Firefox may create nodes in the incorrect
  //           namespace using innerHTML on SVG elements, an HTML-string wrapping
  //           approach is used. A pre/post SVG tag is added to the string, then
  //           that whole string is added to a div. The created nodes are plucked
  //           out and applied to the target location on DOM.


  function applySVGInnerHTMLFix(document, DOMClass, svgNamespace) {
    if (!document) return DOMClass;

    if (!shouldApplyFix(document, svgNamespace)) {
      return DOMClass;
    }

    var div = document.createElement('div');
    return (
      /*#__PURE__*/
      function (_DOMClass) {
        (0, _emberBabel.inheritsLoose)(DOMChangesWithSVGInnerHTMLFix, _DOMClass);

        function DOMChangesWithSVGInnerHTMLFix() {
          return _DOMClass.apply(this, arguments) || this;
        }

        var _proto25 = DOMChangesWithSVGInnerHTMLFix.prototype;

        _proto25.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
          if (html === '') {
            return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
          }

          if (parent.namespaceURI !== svgNamespace) {
            return _DOMClass.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
          }

          return fixSVG(parent, div, html, nextSibling);
        };

        return DOMChangesWithSVGInnerHTMLFix;
      }(DOMClass)
    );
  }

  function fixSVG(parent, div, html, reference) {
    var source; // This is important, because decendants of the <foreignObject> integration
    // point are parsed in the HTML namespace

    if (parent.tagName.toUpperCase() === 'FOREIGNOBJECT') {
      // IE, Edge: also do not correctly support using `innerHTML` on SVG
      // namespaced elements. So here a wrapper is used.
      var wrappedHtml = '<svg><foreignObject>' + html + '</foreignObject></svg>';
      div.innerHTML = wrappedHtml;
      source = div.firstChild.firstChild;
    } else {
      // IE, Edge: also do not correctly support using `innerHTML` on SVG
      // namespaced elements. So here a wrapper is used.
      var _wrappedHtml = '<svg>' + html + '</svg>';

      div.innerHTML = _wrappedHtml;
      source = div.firstChild;
    }

    return moveNodesBefore(source, parent, reference);
  }

  function shouldApplyFix(document, svgNamespace) {
    var svg = document.createElementNS(svgNamespace, 'svg');

    try {
      svg['insertAdjacentHTML']('beforeend', '<circle></circle>');
    } catch (e) {// IE, Edge: Will throw, insertAdjacentHTML is unsupported on SVG
      // Safari: Will throw, insertAdjacentHTML is not present on SVG
    } finally {
      // FF: Old versions will create a node in the wrong namespace
      if (svg.childNodes.length === 1 && svg.firstChild.namespaceURI === SVG_NAMESPACE) {
        // The test worked as expected, no fix required
        return false;
      }

      return true;
    }
  } // Patch:    Adjacent text node merging fix
  // Browsers: IE, Edge, Firefox w/o inspector open
  // Reason:   These browsers will merge adjacent text nodes. For exmaple given
  //           <div>Hello</div> with div.insertAdjacentHTML(' world') browsers
  //           with proper behavior will populate div.childNodes with two items.
  //           These browsers will populate it with one merged node instead.
  // Fix:      Add these nodes to a wrapper element, then iterate the childNodes
  //           of that wrapper and move the nodes to their target location. Note
  //           that potential SVG bugs will have been handled before this fix.
  //           Note that this fix must only apply to the previous text node, as
  //           the base implementation of `insertHTMLBefore` already handles
  //           following text nodes correctly.


  function applyTextNodeMergingFix(document, DOMClass) {
    if (!document) return DOMClass;

    if (!shouldApplyFix$1(document)) {
      return DOMClass;
    }

    return (
      /*#__PURE__*/
      function (_DOMClass2) {
        (0, _emberBabel.inheritsLoose)(DOMChangesWithTextNodeMergingFix, _DOMClass2);

        function DOMChangesWithTextNodeMergingFix(document) {
          var _this12;

          _this12 = _DOMClass2.call(this, document) || this;
          _this12.uselessComment = document.createComment('');
          return _this12;
        }

        var _proto26 = DOMChangesWithTextNodeMergingFix.prototype;

        _proto26.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
          if (html === '') {
            return _DOMClass2.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);
          }

          var didSetUselessComment = false;
          var nextPrevious = nextSibling ? nextSibling.previousSibling : parent.lastChild;

          if (nextPrevious && nextPrevious instanceof Text) {
            didSetUselessComment = true;
            parent.insertBefore(this.uselessComment, nextSibling);
          }

          var bounds = _DOMClass2.prototype.insertHTMLBefore.call(this, parent, nextSibling, html);

          if (didSetUselessComment) {
            parent.removeChild(this.uselessComment);
          }

          return bounds;
        };

        return DOMChangesWithTextNodeMergingFix;
      }(DOMClass)
    );
  }

  function shouldApplyFix$1(document) {
    var mergingTextDiv = document.createElement('div');
    mergingTextDiv.innerHTML = 'first';
    mergingTextDiv.insertAdjacentHTML('beforeend', 'second');

    if (mergingTextDiv.childNodes.length === 2) {
      // It worked as expected, no fix required
      return false;
    }

    return true;
  }

  var SVG_NAMESPACE = "http://www.w3.org/2000/svg"
  /* SVG */
  ; // http://www.w3.org/TR/html/syntax.html#html-integration-point

  _exports.SVG_NAMESPACE = SVG_NAMESPACE;
  var SVG_INTEGRATION_POINTS = {
    foreignObject: 1,
    desc: 1,
    title: 1
  }; // http://www.w3.org/TR/html/syntax.html#adjust-svg-attributes
  // TODO: Adjust SVG attributes
  // http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
  // TODO: Adjust SVG elements
  // http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign

  var BLACKLIST_TABLE = Object.create(null);
  ['b', 'big', 'blockquote', 'body', 'br', 'center', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'embed', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'i', 'img', 'li', 'listing', 'main', 'meta', 'nobr', 'ol', 'p', 'pre', 'ruby', 's', 'small', 'span', 'strong', 'strike', 'sub', 'sup', 'table', 'tt', 'u', 'ul', 'var'].forEach(function (tag) {
    return BLACKLIST_TABLE[tag] = 1;
  });
  var WHITESPACE = /[\t-\r \xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/;
  var doc = typeof document === 'undefined' ? null : document;

  function isWhitespace(string) {
    return WHITESPACE.test(string);
  }

  function moveNodesBefore(source, target, nextSibling) {
    var first = source.firstChild;
    var last = first;
    var current = first;

    while (current) {
      var next = current.nextSibling;
      target.insertBefore(current, nextSibling);
      last = current;
      current = next;
    }

    return new ConcreteBounds(target, first, last);
  }

  var DOMOperations =
  /*#__PURE__*/
  function () {
    function DOMOperations(document) {
      this.document = document;
      this.setupUselessElement();
    } // split into seperate method so that NodeDOMTreeConstruction
    // can override it.


    var _proto27 = DOMOperations.prototype;

    _proto27.setupUselessElement = function setupUselessElement() {
      this.uselessElement = this.document.createElement('div');
    };

    _proto27.createElement = function createElement(tag, context) {
      var isElementInSVGNamespace, isHTMLIntegrationPoint;

      if (context) {
        isElementInSVGNamespace = context.namespaceURI === SVG_NAMESPACE || tag === 'svg';
        isHTMLIntegrationPoint = SVG_INTEGRATION_POINTS[context.tagName];
      } else {
        isElementInSVGNamespace = tag === 'svg';
        isHTMLIntegrationPoint = false;
      }

      if (isElementInSVGNamespace && !isHTMLIntegrationPoint) {
        // FIXME: This does not properly handle <font> with color, face, or
        // size attributes, which is also disallowed by the spec. We should fix
        // this.
        if (BLACKLIST_TABLE[tag]) {
          throw new Error("Cannot create a " + tag + " inside an SVG context");
        }

        return this.document.createElementNS(SVG_NAMESPACE, tag);
      } else {
        return this.document.createElement(tag);
      }
    };

    _proto27.insertBefore = function insertBefore(parent, node, reference) {
      parent.insertBefore(node, reference);
    };

    _proto27.insertHTMLBefore = function insertHTMLBefore(parent, nextSibling, html) {
      if (html === '') {
        var comment = this.createComment('');
        parent.insertBefore(comment, nextSibling);
        return new ConcreteBounds(parent, comment, comment);
      }

      var prev = nextSibling ? nextSibling.previousSibling : parent.lastChild;
      var last;

      if (nextSibling === null) {
        parent.insertAdjacentHTML("beforeend"
        /* beforeend */
        , html);
        last = parent.lastChild;
      } else if (nextSibling instanceof HTMLElement) {
        nextSibling.insertAdjacentHTML("beforebegin"
        /* beforebegin */
        , html);
        last = nextSibling.previousSibling;
      } else {
        // Non-element nodes do not support insertAdjacentHTML, so add an
        // element and call it on that element. Then remove the element.
        //
        // This also protects Edge, IE and Firefox w/o the inspector open
        // from merging adjacent text nodes. See ./compat/text-node-merging-fix.ts
        var uselessElement = this.uselessElement;
        parent.insertBefore(uselessElement, nextSibling);
        uselessElement.insertAdjacentHTML("beforebegin"
        /* beforebegin */
        , html);
        last = uselessElement.previousSibling;
        parent.removeChild(uselessElement);
      }

      var first = prev ? prev.nextSibling : parent.firstChild;
      return new ConcreteBounds(parent, first, last);
    };

    _proto27.createTextNode = function createTextNode(text) {
      return this.document.createTextNode(text);
    };

    _proto27.createComment = function createComment(data) {
      return this.document.createComment(data);
    };

    return DOMOperations;
  }();

  var DOM;

  (function (DOM) {
    var TreeConstruction =
    /*#__PURE__*/
    function (_DOMOperations) {
      (0, _emberBabel.inheritsLoose)(TreeConstruction, _DOMOperations);

      function TreeConstruction() {
        return _DOMOperations.apply(this, arguments) || this;
      }

      var _proto28 = TreeConstruction.prototype;

      _proto28.createElementNS = function createElementNS(namespace, tag) {
        return this.document.createElementNS(namespace, tag);
      };

      _proto28.setAttribute = function setAttribute(element, name, value$$1, namespace) {
        if (namespace === void 0) {
          namespace = null;
        }

        if (namespace) {
          element.setAttributeNS(namespace, name, value$$1);
        } else {
          element.setAttribute(name, value$$1);
        }
      };

      return TreeConstruction;
    }(DOMOperations);

    DOM.TreeConstruction = TreeConstruction;
    var appliedTreeContruction = TreeConstruction;
    appliedTreeContruction = applyTextNodeMergingFix(doc, appliedTreeContruction);
    appliedTreeContruction = applySVGInnerHTMLFix(doc, appliedTreeContruction, SVG_NAMESPACE);
    DOM.DOMTreeConstruction = appliedTreeContruction;
  })(DOM || (DOM = {}));

  var DOMChanges =
  /*#__PURE__*/
  function (_DOMOperations2) {
    (0, _emberBabel.inheritsLoose)(DOMChanges, _DOMOperations2);

    function DOMChanges(document) {
      var _this13;

      _this13 = _DOMOperations2.call(this, document) || this;
      _this13.document = document;
      _this13.namespace = null;
      return _this13;
    }

    var _proto29 = DOMChanges.prototype;

    _proto29.setAttribute = function setAttribute(element, name, value$$1) {
      element.setAttribute(name, value$$1);
    };

    _proto29.removeAttribute = function removeAttribute(element, name) {
      element.removeAttribute(name);
    };

    _proto29.insertAfter = function insertAfter(element, node, reference) {
      this.insertBefore(element, node, reference.nextSibling);
    };

    return DOMChanges;
  }(DOMOperations);

  _exports.IDOMChanges = DOMChanges;
  var helper = DOMChanges;
  helper = applyTextNodeMergingFix(doc, helper);
  helper = applySVGInnerHTMLFix(doc, helper, SVG_NAMESPACE);
  var helper$1 = helper;
  _exports.DOMChanges = helper$1;
  var DOMTreeConstruction = DOM.DOMTreeConstruction;
  _exports.DOMTreeConstruction = DOMTreeConstruction;
  var badProtocols = ['javascript:', 'vbscript:'];
  var badTags = ['A', 'BODY', 'LINK', 'IMG', 'IFRAME', 'BASE', 'FORM'];
  var badTagsForDataURI = ['EMBED'];
  var badAttributes = ['href', 'src', 'background', 'action'];
  var badAttributesForDataURI = ['src'];

  function has(array, item) {
    return array.indexOf(item) !== -1;
  }

  function checkURI(tagName, attribute) {
    return (tagName === null || has(badTags, tagName)) && has(badAttributes, attribute);
  }

  function checkDataURI(tagName, attribute) {
    if (tagName === null) return false;
    return has(badTagsForDataURI, tagName) && has(badAttributesForDataURI, attribute);
  }

  function requiresSanitization(tagName, attribute) {
    return checkURI(tagName, attribute) || checkDataURI(tagName, attribute);
  }

  function sanitizeAttributeValue(env, element, attribute, value$$1) {
    var tagName = null;

    if (value$$1 === null || value$$1 === undefined) {
      return value$$1;
    }

    if (isSafeString(value$$1)) {
      return value$$1.toHTML();
    }

    if (!element) {
      tagName = null;
    } else {
      tagName = element.tagName.toUpperCase();
    }

    var str = normalizeStringValue(value$$1);

    if (checkURI(tagName, attribute)) {
      var protocol = env.protocolForURL(str);

      if (has(badProtocols, protocol)) {
        return "unsafe:" + str;
      }
    }

    if (checkDataURI(tagName, attribute)) {
      return "unsafe:" + str;
    }

    return str;
  }
  /*
   * @method normalizeProperty
   * @param element {HTMLElement}
   * @param slotName {String}
   * @returns {Object} { name, type }
   */


  function normalizeProperty(element, slotName) {
    var type, normalized;

    if (slotName in element) {
      normalized = slotName;
      type = 'prop';
    } else {
      var lower = slotName.toLowerCase();

      if (lower in element) {
        type = 'prop';
        normalized = lower;
      } else {
        type = 'attr';
        normalized = slotName;
      }
    }

    if (type === 'prop' && (normalized.toLowerCase() === 'style' || preferAttr(element.tagName, normalized))) {
      type = 'attr';
    }

    return {
      normalized: normalized,
      type: type
    };
  } // properties that MUST be set as attributes, due to:
  // * browser bug
  // * strange spec outlier


  var ATTR_OVERRIDES = {
    INPUT: {
      form: true,
      // Chrome 46.0.2464.0: 'autocorrect' in document.createElement('input') === false
      // Safari 8.0.7: 'autocorrect' in document.createElement('input') === false
      // Mobile Safari (iOS 8.4 simulator): 'autocorrect' in document.createElement('input') === true
      autocorrect: true,
      // Chrome 54.0.2840.98: 'list' in document.createElement('input') === true
      // Safari 9.1.3: 'list' in document.createElement('input') === false
      list: true
    },
    // element.form is actually a legitimate readOnly property, that is to be
    // mutated, but must be mutated by setAttribute...
    SELECT: {
      form: true
    },
    OPTION: {
      form: true
    },
    TEXTAREA: {
      form: true
    },
    LABEL: {
      form: true
    },
    FIELDSET: {
      form: true
    },
    LEGEND: {
      form: true
    },
    OBJECT: {
      form: true
    },
    BUTTON: {
      form: true
    }
  };

  function preferAttr(tagName, propName) {
    var tag = ATTR_OVERRIDES[tagName.toUpperCase()];
    return tag && tag[propName.toLowerCase()] || false;
  }

  function dynamicAttribute(element, attr, namespace) {
    var tagName = element.tagName,
        namespaceURI = element.namespaceURI;
    var attribute = {
      element: element,
      name: attr,
      namespace: namespace
    };

    if (namespaceURI === SVG_NAMESPACE) {
      return buildDynamicAttribute(tagName, attr, attribute);
    }

    var _normalizeProperty = normalizeProperty(element, attr),
        type = _normalizeProperty.type,
        normalized = _normalizeProperty.normalized;

    if (type === 'attr') {
      return buildDynamicAttribute(tagName, normalized, attribute);
    } else {
      return buildDynamicProperty(tagName, normalized, attribute);
    }
  }

  function buildDynamicAttribute(tagName, name, attribute) {
    if (requiresSanitization(tagName, name)) {
      return new SafeDynamicAttribute(attribute);
    } else {
      return new SimpleDynamicAttribute(attribute);
    }
  }

  function buildDynamicProperty(tagName, name, attribute) {
    if (requiresSanitization(tagName, name)) {
      return new SafeDynamicProperty(name, attribute);
    }

    if (isUserInputValue(tagName, name)) {
      return new InputValueDynamicAttribute(name, attribute);
    }

    if (isOptionSelected(tagName, name)) {
      return new OptionSelectedDynamicAttribute(name, attribute);
    }

    return new DefaultDynamicProperty(name, attribute);
  }

  var DynamicAttribute = function DynamicAttribute(attribute) {
    this.attribute = attribute;
  };

  _exports.DynamicAttribute = DynamicAttribute;

  var SimpleDynamicAttribute =
  /*#__PURE__*/
  function (_DynamicAttribute) {
    (0, _emberBabel.inheritsLoose)(SimpleDynamicAttribute, _DynamicAttribute);

    function SimpleDynamicAttribute() {
      return _DynamicAttribute.apply(this, arguments) || this;
    }

    var _proto30 = SimpleDynamicAttribute.prototype;

    _proto30.set = function set(dom, value$$1, _env) {
      var normalizedValue = normalizeValue(value$$1);

      if (normalizedValue !== null) {
        var _this$attribute = this.attribute,
            name = _this$attribute.name,
            namespace = _this$attribute.namespace;

        dom.__setAttribute(name, normalizedValue, namespace);
      }
    };

    _proto30.update = function update(value$$1, _env) {
      var normalizedValue = normalizeValue(value$$1);
      var _this$attribute2 = this.attribute,
          element = _this$attribute2.element,
          name = _this$attribute2.name;

      if (normalizedValue === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, normalizedValue);
      }
    };

    return SimpleDynamicAttribute;
  }(DynamicAttribute);

  _exports.SimpleDynamicAttribute = SimpleDynamicAttribute;

  var DefaultDynamicProperty =
  /*#__PURE__*/
  function (_DynamicAttribute2) {
    (0, _emberBabel.inheritsLoose)(DefaultDynamicProperty, _DynamicAttribute2);

    function DefaultDynamicProperty(normalizedName, attribute) {
      var _this14;

      _this14 = _DynamicAttribute2.call(this, attribute) || this;
      _this14.normalizedName = normalizedName;
      return _this14;
    }

    var _proto31 = DefaultDynamicProperty.prototype;

    _proto31.set = function set(dom, value$$1, _env) {
      if (value$$1 !== null && value$$1 !== undefined) {
        this.value = value$$1;

        dom.__setProperty(this.normalizedName, value$$1);
      }
    };

    _proto31.update = function update(value$$1, _env) {
      var element = this.attribute.element;

      if (this.value !== value$$1) {
        element[this.normalizedName] = this.value = value$$1;

        if (value$$1 === null || value$$1 === undefined) {
          this.removeAttribute();
        }
      }
    };

    _proto31.removeAttribute = function removeAttribute() {
      // TODO this sucks but to preserve properties first and to meet current
      // semantics we must do this.
      var _this$attribute3 = this.attribute,
          element = _this$attribute3.element,
          namespace = _this$attribute3.namespace;

      if (namespace) {
        element.removeAttributeNS(namespace, this.normalizedName);
      } else {
        element.removeAttribute(this.normalizedName);
      }
    };

    return DefaultDynamicProperty;
  }(DynamicAttribute);

  var SafeDynamicProperty =
  /*#__PURE__*/
  function (_DefaultDynamicProper) {
    (0, _emberBabel.inheritsLoose)(SafeDynamicProperty, _DefaultDynamicProper);

    function SafeDynamicProperty() {
      return _DefaultDynamicProper.apply(this, arguments) || this;
    }

    var _proto32 = SafeDynamicProperty.prototype;

    _proto32.set = function set(dom, value$$1, env) {
      var _this$attribute4 = this.attribute,
          element = _this$attribute4.element,
          name = _this$attribute4.name;
      var sanitized = sanitizeAttributeValue(env, element, name, value$$1);

      _DefaultDynamicProper.prototype.set.call(this, dom, sanitized, env);
    };

    _proto32.update = function update(value$$1, env) {
      var _this$attribute5 = this.attribute,
          element = _this$attribute5.element,
          name = _this$attribute5.name;
      var sanitized = sanitizeAttributeValue(env, element, name, value$$1);

      _DefaultDynamicProper.prototype.update.call(this, sanitized, env);
    };

    return SafeDynamicProperty;
  }(DefaultDynamicProperty);

  var SafeDynamicAttribute =
  /*#__PURE__*/
  function (_SimpleDynamicAttribu) {
    (0, _emberBabel.inheritsLoose)(SafeDynamicAttribute, _SimpleDynamicAttribu);

    function SafeDynamicAttribute() {
      return _SimpleDynamicAttribu.apply(this, arguments) || this;
    }

    var _proto33 = SafeDynamicAttribute.prototype;

    _proto33.set = function set(dom, value$$1, env) {
      var _this$attribute6 = this.attribute,
          element = _this$attribute6.element,
          name = _this$attribute6.name;
      var sanitized = sanitizeAttributeValue(env, element, name, value$$1);

      _SimpleDynamicAttribu.prototype.set.call(this, dom, sanitized, env);
    };

    _proto33.update = function update(value$$1, env) {
      var _this$attribute7 = this.attribute,
          element = _this$attribute7.element,
          name = _this$attribute7.name;
      var sanitized = sanitizeAttributeValue(env, element, name, value$$1);

      _SimpleDynamicAttribu.prototype.update.call(this, sanitized, env);
    };

    return SafeDynamicAttribute;
  }(SimpleDynamicAttribute);

  var InputValueDynamicAttribute =
  /*#__PURE__*/
  function (_DefaultDynamicProper2) {
    (0, _emberBabel.inheritsLoose)(InputValueDynamicAttribute, _DefaultDynamicProper2);

    function InputValueDynamicAttribute() {
      return _DefaultDynamicProper2.apply(this, arguments) || this;
    }

    var _proto34 = InputValueDynamicAttribute.prototype;

    _proto34.set = function set(dom, value$$1) {
      dom.__setProperty('value', normalizeStringValue(value$$1));
    };

    _proto34.update = function update(value$$1) {
      var input = this.attribute.element;
      var currentValue = input.value;
      var normalizedValue = normalizeStringValue(value$$1);

      if (currentValue !== normalizedValue) {
        input.value = normalizedValue;
      }
    };

    return InputValueDynamicAttribute;
  }(DefaultDynamicProperty);

  var OptionSelectedDynamicAttribute =
  /*#__PURE__*/
  function (_DefaultDynamicProper3) {
    (0, _emberBabel.inheritsLoose)(OptionSelectedDynamicAttribute, _DefaultDynamicProper3);

    function OptionSelectedDynamicAttribute() {
      return _DefaultDynamicProper3.apply(this, arguments) || this;
    }

    var _proto35 = OptionSelectedDynamicAttribute.prototype;

    _proto35.set = function set(dom, value$$1) {
      if (value$$1 !== null && value$$1 !== undefined && value$$1 !== false) {
        dom.__setProperty('selected', true);
      }
    };

    _proto35.update = function update(value$$1) {
      var option = this.attribute.element;

      if (value$$1) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    };

    return OptionSelectedDynamicAttribute;
  }(DefaultDynamicProperty);

  function isOptionSelected(tagName, attribute) {
    return tagName === 'OPTION' && attribute === 'selected';
  }

  function isUserInputValue(tagName, attribute) {
    return (tagName === 'INPUT' || tagName === 'TEXTAREA') && attribute === 'value';
  }

  function normalizeValue(value$$1) {
    if (value$$1 === false || value$$1 === undefined || value$$1 === null || typeof value$$1.toString === 'undefined') {
      return null;
    }

    if (value$$1 === true) {
      return '';
    } // onclick function etc in SSR


    if (typeof value$$1 === 'function') {
      return null;
    }

    return String(value$$1);
  }

  var Scope =
  /*#__PURE__*/
  function () {
    function Scope( // the 0th slot is `self`
    slots, callerScope, // named arguments and blocks passed to a layout that uses eval
    evalScope, // locals in scope when the partial was invoked
    partialMap) {
      this.slots = slots;
      this.callerScope = callerScope;
      this.evalScope = evalScope;
      this.partialMap = partialMap;
    }

    Scope.root = function root(self, size) {
      if (size === void 0) {
        size = 0;
      }

      var refs = new Array(size + 1);

      for (var i = 0; i <= size; i++) {
        refs[i] = UNDEFINED_REFERENCE;
      }

      return new Scope(refs, null, null, null).init({
        self: self
      });
    };

    Scope.sized = function sized(size) {
      if (size === void 0) {
        size = 0;
      }

      var refs = new Array(size + 1);

      for (var i = 0; i <= size; i++) {
        refs[i] = UNDEFINED_REFERENCE;
      }

      return new Scope(refs, null, null, null);
    };

    var _proto36 = Scope.prototype;

    _proto36.init = function init(_ref55) {
      var self = _ref55.self;
      this.slots[0] = self;
      return this;
    };

    _proto36.getSelf = function getSelf() {
      return this.get(0);
    };

    _proto36.getSymbol = function getSymbol(symbol) {
      return this.get(symbol);
    };

    _proto36.getBlock = function getBlock(symbol) {
      var block = this.get(symbol);
      return block === UNDEFINED_REFERENCE ? null : block;
    };

    _proto36.getEvalScope = function getEvalScope() {
      return this.evalScope;
    };

    _proto36.getPartialMap = function getPartialMap() {
      return this.partialMap;
    };

    _proto36.bind = function bind(symbol, value$$1) {
      this.set(symbol, value$$1);
    };

    _proto36.bindSelf = function bindSelf(self) {
      this.set(0, self);
    };

    _proto36.bindSymbol = function bindSymbol(symbol, value$$1) {
      this.set(symbol, value$$1);
    };

    _proto36.bindBlock = function bindBlock(symbol, value$$1) {
      this.set(symbol, value$$1);
    };

    _proto36.bindEvalScope = function bindEvalScope(map) {
      this.evalScope = map;
    };

    _proto36.bindPartialMap = function bindPartialMap(map) {
      this.partialMap = map;
    };

    _proto36.bindCallerScope = function bindCallerScope(scope) {
      this.callerScope = scope;
    };

    _proto36.getCallerScope = function getCallerScope() {
      return this.callerScope;
    };

    _proto36.child = function child() {
      return new Scope(this.slots.slice(), this.callerScope, this.evalScope, this.partialMap);
    };

    _proto36.get = function get(index) {
      if (index >= this.slots.length) {
        throw new RangeError("BUG: cannot get $" + index + " from scope; length=" + this.slots.length);
      }

      return this.slots[index];
    };

    _proto36.set = function set(index, value$$1) {
      if (index >= this.slots.length) {
        throw new RangeError("BUG: cannot get $" + index + " from scope; length=" + this.slots.length);
      }

      this.slots[index] = value$$1;
    };

    return Scope;
  }();

  _exports.Scope = Scope;

  var Transaction =
  /*#__PURE__*/
  function () {
    function Transaction() {
      this.scheduledInstallManagers = [];
      this.scheduledInstallModifiers = [];
      this.scheduledUpdateModifierManagers = [];
      this.scheduledUpdateModifiers = [];
      this.createdComponents = [];
      this.createdManagers = [];
      this.updatedComponents = [];
      this.updatedManagers = [];
      this.destructors = [];
    }

    var _proto37 = Transaction.prototype;

    _proto37.didCreate = function didCreate(component, manager) {
      this.createdComponents.push(component);
      this.createdManagers.push(manager);
    };

    _proto37.didUpdate = function didUpdate(component, manager) {
      this.updatedComponents.push(component);
      this.updatedManagers.push(manager);
    };

    _proto37.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
      this.scheduledInstallModifiers.push(modifier);
      this.scheduledInstallManagers.push(manager);
    };

    _proto37.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
      this.scheduledUpdateModifiers.push(modifier);
      this.scheduledUpdateModifierManagers.push(manager);
    };

    _proto37.didDestroy = function didDestroy(d) {
      this.destructors.push(d);
    };

    _proto37.commit = function commit() {
      var createdComponents = this.createdComponents,
          createdManagers = this.createdManagers;

      for (var i = 0; i < createdComponents.length; i++) {
        var component = createdComponents[i];
        var manager = createdManagers[i];
        manager.didCreate(component);
      }

      var updatedComponents = this.updatedComponents,
          updatedManagers = this.updatedManagers;

      for (var _i4 = 0; _i4 < updatedComponents.length; _i4++) {
        var _component = updatedComponents[_i4];
        var _manager2 = updatedManagers[_i4];

        _manager2.didUpdate(_component);
      }

      var destructors = this.destructors;

      for (var _i5 = 0; _i5 < destructors.length; _i5++) {
        destructors[_i5].destroy();
      }

      var scheduledInstallManagers = this.scheduledInstallManagers,
          scheduledInstallModifiers = this.scheduledInstallModifiers;

      for (var _i6 = 0; _i6 < scheduledInstallManagers.length; _i6++) {
        var modifier = scheduledInstallModifiers[_i6];
        var _manager3 = scheduledInstallManagers[_i6];

        _manager3.install(modifier);
      }

      var scheduledUpdateModifierManagers = this.scheduledUpdateModifierManagers,
          scheduledUpdateModifiers = this.scheduledUpdateModifiers;

      for (var _i7 = 0; _i7 < scheduledUpdateModifierManagers.length; _i7++) {
        var _modifier = scheduledUpdateModifiers[_i7];
        var _manager4 = scheduledUpdateModifierManagers[_i7];

        _manager4.update(_modifier);
      }
    };

    return Transaction;
  }();

  var Environment =
  /*#__PURE__*/
  function () {
    function Environment(_ref56) {
      var appendOperations = _ref56.appendOperations,
          updateOperations = _ref56.updateOperations;
      this._transaction = null;
      this.appendOperations = appendOperations;
      this.updateOperations = updateOperations;
    }

    var _proto38 = Environment.prototype;

    _proto38.toConditionalReference = function toConditionalReference(reference) {
      return new ConditionalReference(reference);
    };

    _proto38.getAppendOperations = function getAppendOperations() {
      return this.appendOperations;
    };

    _proto38.getDOM = function getDOM() {
      return this.updateOperations;
    };

    _proto38.begin = function begin() {
      this._transaction = new Transaction();
    };

    _proto38.didCreate = function didCreate(component, manager) {
      this.transaction.didCreate(component, manager);
    };

    _proto38.didUpdate = function didUpdate(component, manager) {
      this.transaction.didUpdate(component, manager);
    };

    _proto38.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
      this.transaction.scheduleInstallModifier(modifier, manager);
    };

    _proto38.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
      this.transaction.scheduleUpdateModifier(modifier, manager);
    };

    _proto38.didDestroy = function didDestroy(d) {
      this.transaction.didDestroy(d);
    };

    _proto38.commit = function commit() {
      var transaction = this.transaction;
      this._transaction = null;
      transaction.commit();
    };

    _proto38.attributeFor = function attributeFor(element, attr, _isTrusting, namespace) {
      if (namespace === void 0) {
        namespace = null;
      }

      return dynamicAttribute(element, attr, namespace);
    };

    (0, _emberBabel.createClass)(Environment, [{
      key: "transaction",
      get: function get() {
        return this._transaction;
      }
    }]);
    return Environment;
  }();

  _exports.Environment = Environment;

  var DefaultEnvironment =
  /*#__PURE__*/
  function (_Environment) {
    (0, _emberBabel.inheritsLoose)(DefaultEnvironment, _Environment);

    function DefaultEnvironment(options) {
      if (!options) {
        var _document = window.document;
        var appendOperations = new DOMTreeConstruction(_document);
        var updateOperations = new DOMChanges(_document);
        options = {
          appendOperations: appendOperations,
          updateOperations: updateOperations
        };
      }

      return _Environment.call(this, options) || this;
    }

    return DefaultEnvironment;
  }(Environment);

  _exports.DefaultEnvironment = DefaultEnvironment;

  var LowLevelVM =
  /*#__PURE__*/
  function () {
    function LowLevelVM(stack, heap, program, externs, pc, ra) {
      if (pc === void 0) {
        pc = -1;
      }

      if (ra === void 0) {
        ra = -1;
      }

      this.stack = stack;
      this.heap = heap;
      this.program = program;
      this.externs = externs;
      this.pc = pc;
      this.ra = ra;
      this.currentOpSize = 0;
    } // Start a new frame and save $ra and $fp on the stack


    var _proto39 = LowLevelVM.prototype;

    _proto39.pushFrame = function pushFrame() {
      this.stack.push(this.ra);
      this.stack.push(this.stack.fp);
      this.stack.fp = this.stack.sp - 1;
    } // Restore $ra, $sp and $fp
    ;

    _proto39.popFrame = function popFrame() {
      this.stack.sp = this.stack.fp - 1;
      this.ra = this.stack.get(0);
      this.stack.fp = this.stack.get(1);
    };

    _proto39.pushSmallFrame = function pushSmallFrame() {
      this.stack.push(this.ra);
    };

    _proto39.popSmallFrame = function popSmallFrame() {
      this.ra = this.stack.popSmi();
    } // Jump to an address in `program`
    ;

    _proto39.goto = function goto(offset) {
      var addr = this.pc + offset - this.currentOpSize;
      this.pc = addr;
    } // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
    ;

    _proto39.call = function call(handle) {
      this.ra = this.pc;
      this.pc = this.heap.getaddr(handle);
    } // Put a specific `program` address in $ra
    ;

    _proto39.returnTo = function returnTo(offset) {
      var addr = this.pc + offset - this.currentOpSize;
      this.ra = addr;
    } // Return to the `program` address stored in $ra
    ;

    _proto39.return = function _return() {
      this.pc = this.ra;
    };

    _proto39.nextStatement = function nextStatement() {
      var pc = this.pc,
          program = this.program;

      if (pc === -1) {
        return null;
      } // We have to save off the current operations size so that
      // when we do a jump we can calculate the correct offset
      // to where we are going. We can't simply ask for the size
      // in a jump because we have have already incremented the
      // program counter to the next instruction prior to executing.


      var _this$program$opcode = this.program.opcode(pc),
          size = _this$program$opcode.size;

      var operationSize = this.currentOpSize = size;
      this.pc += operationSize;
      return program.opcode(pc);
    };

    _proto39.evaluateOuter = function evaluateOuter(opcode, vm) {
      {
        this.evaluateInner(opcode, vm);
      }
    };

    _proto39.evaluateInner = function evaluateInner(opcode, vm) {
      if (opcode.isMachine) {
        this.evaluateMachine(opcode);
      } else {
        this.evaluateSyscall(opcode, vm);
      }
    };

    _proto39.evaluateMachine = function evaluateMachine(opcode) {
      switch (opcode.type) {
        case 57
        /* PushFrame */
        :
          return this.pushFrame();

        case 58
        /* PopFrame */
        :
          return this.popFrame();

        case 59
        /* PushSmallFrame */
        :
          return this.pushSmallFrame();

        case 60
        /* PopSmallFrame */
        :
          return this.popSmallFrame();

        case 50
        /* InvokeStatic */
        :
          return this.call(opcode.op1);

        case 49
        /* InvokeVirtual */
        :
          return this.call(this.stack.popSmi());

        case 52
        /* Jump */
        :
          return this.goto(opcode.op1);

        case 24
        /* Return */
        :
          return this.return();

        case 25
        /* ReturnTo */
        :
          return this.returnTo(opcode.op1);
      }
    };

    _proto39.evaluateSyscall = function evaluateSyscall(opcode, vm) {
      APPEND_OPCODES.evaluate(vm, opcode, opcode.type);
    };

    return LowLevelVM;
  }();

  var First =
  /*#__PURE__*/
  function () {
    function First(node) {
      this.node = node;
    }

    var _proto40 = First.prototype;

    _proto40.firstNode = function firstNode() {
      return this.node;
    };

    return First;
  }();

  var Last =
  /*#__PURE__*/
  function () {
    function Last(node) {
      this.node = node;
    }

    var _proto41 = Last.prototype;

    _proto41.lastNode = function lastNode() {
      return this.node;
    };

    return Last;
  }();

  var NewElementBuilder =
  /*#__PURE__*/
  function () {
    function NewElementBuilder(env, parentNode, nextSibling) {
      this.constructing = null;
      this.operations = null;
      this.cursorStack = new _util.Stack();
      this.modifierStack = new _util.Stack();
      this.blockStack = new _util.Stack();
      this.pushElement(parentNode, nextSibling);
      this.env = env;
      this.dom = env.getAppendOperations();
      this.updateOperations = env.getDOM();
    }

    NewElementBuilder.forInitialRender = function forInitialRender(env, cursor) {
      var builder = new this(env, cursor.element, cursor.nextSibling);
      builder.pushSimpleBlock();
      return builder;
    };

    NewElementBuilder.resume = function resume(env, tracker, nextSibling) {
      var parentNode = tracker.parentElement();
      var stack = new this(env, parentNode, nextSibling);
      stack.pushSimpleBlock();
      stack.pushBlockTracker(tracker);
      return stack;
    };

    var _proto42 = NewElementBuilder.prototype;

    _proto42.expectConstructing = function expectConstructing(method) {
      return this.constructing;
    };

    _proto42.block = function block() {
      return this.blockStack.current;
    };

    _proto42.popElement = function popElement() {
      this.cursorStack.pop();
      this.cursorStack.current;
    };

    _proto42.pushSimpleBlock = function pushSimpleBlock() {
      return this.pushBlockTracker(new SimpleBlockTracker(this.element));
    };

    _proto42.pushUpdatableBlock = function pushUpdatableBlock() {
      return this.pushBlockTracker(new UpdatableBlockTracker(this.element));
    };

    _proto42.pushBlockList = function pushBlockList(list) {
      return this.pushBlockTracker(new BlockListTracker(this.element, list));
    };

    _proto42.pushBlockTracker = function pushBlockTracker(tracker, isRemote) {
      if (isRemote === void 0) {
        isRemote = false;
      }

      var current = this.blockStack.current;

      if (current !== null) {
        current.newDestroyable(tracker);

        if (!isRemote) {
          current.didAppendBounds(tracker);
        }
      }

      this.__openBlock();

      this.blockStack.push(tracker);
      return tracker;
    };

    _proto42.popBlock = function popBlock() {
      this.block().finalize(this);

      this.__closeBlock();

      return this.blockStack.pop();
    };

    _proto42.__openBlock = function __openBlock() {};

    _proto42.__closeBlock = function __closeBlock() {} // todo return seems unused
    ;

    _proto42.openElement = function openElement(tag) {
      var element = this.__openElement(tag);

      this.constructing = element;
      return element;
    };

    _proto42.__openElement = function __openElement(tag) {
      return this.dom.createElement(tag, this.element);
    };

    _proto42.flushElement = function flushElement(modifiers) {
      var parent = this.element;
      var element = this.constructing;

      this.__flushElement(parent, element);

      this.constructing = null;
      this.operations = null;
      this.pushModifiers(modifiers);
      this.pushElement(element, null);
      this.didOpenElement(element);
    };

    _proto42.__flushElement = function __flushElement(parent, constructing) {
      this.dom.insertBefore(parent, constructing, this.nextSibling);
    };

    _proto42.closeElement = function closeElement() {
      this.willCloseElement();
      this.popElement();
      return this.popModifiers();
    };

    _proto42.pushRemoteElement = function pushRemoteElement(element, guid, nextSibling) {
      if (nextSibling === void 0) {
        nextSibling = null;
      }

      this.__pushRemoteElement(element, guid, nextSibling);
    };

    _proto42.__pushRemoteElement = function __pushRemoteElement(element, _guid, nextSibling) {
      this.pushElement(element, nextSibling);
      var tracker = new RemoteBlockTracker(element);
      this.pushBlockTracker(tracker, true);
    };

    _proto42.popRemoteElement = function popRemoteElement() {
      this.popBlock();
      this.popElement();
    };

    _proto42.pushElement = function pushElement(element, nextSibling) {
      this.cursorStack.push(new Cursor(element, nextSibling));
    };

    _proto42.pushModifiers = function pushModifiers(modifiers) {
      this.modifierStack.push(modifiers);
    };

    _proto42.popModifiers = function popModifiers() {
      return this.modifierStack.pop();
    };

    _proto42.didAddDestroyable = function didAddDestroyable(d) {
      this.block().newDestroyable(d);
    };

    _proto42.didAppendBounds = function didAppendBounds(bounds) {
      this.block().didAppendBounds(bounds);
      return bounds;
    };

    _proto42.didAppendNode = function didAppendNode(node) {
      this.block().didAppendNode(node);
      return node;
    };

    _proto42.didOpenElement = function didOpenElement(element) {
      this.block().openElement(element);
      return element;
    };

    _proto42.willCloseElement = function willCloseElement() {
      this.block().closeElement();
    };

    _proto42.appendText = function appendText(string) {
      return this.didAppendNode(this.__appendText(string));
    };

    _proto42.__appendText = function __appendText(text) {
      var dom = this.dom,
          element = this.element,
          nextSibling = this.nextSibling;
      var node = dom.createTextNode(text);
      dom.insertBefore(element, node, nextSibling);
      return node;
    };

    _proto42.__appendNode = function __appendNode(node) {
      this.dom.insertBefore(this.element, node, this.nextSibling);
      return node;
    };

    _proto42.__appendFragment = function __appendFragment(fragment) {
      var first = fragment.firstChild;

      if (first) {
        var ret = new ConcreteBounds(this.element, first, fragment.lastChild);
        this.dom.insertBefore(this.element, fragment, this.nextSibling);
        return ret;
      } else {
        return new SingleNodeBounds(this.element, this.__appendComment(''));
      }
    };

    _proto42.__appendHTML = function __appendHTML(html) {
      return this.dom.insertHTMLBefore(this.element, this.nextSibling, html);
    };

    _proto42.appendDynamicHTML = function appendDynamicHTML(value$$1) {
      var bounds = this.trustedContent(value$$1);
      this.didAppendBounds(bounds);
    };

    _proto42.appendDynamicText = function appendDynamicText(value$$1) {
      var node = this.untrustedContent(value$$1);
      this.didAppendNode(node);
      return node;
    };

    _proto42.appendDynamicFragment = function appendDynamicFragment(value$$1) {
      var bounds = this.__appendFragment(value$$1);

      this.didAppendBounds(bounds);
    };

    _proto42.appendDynamicNode = function appendDynamicNode(value$$1) {
      var node = this.__appendNode(value$$1);

      var bounds = new SingleNodeBounds(this.element, node);
      this.didAppendBounds(bounds);
    };

    _proto42.trustedContent = function trustedContent(value$$1) {
      return this.__appendHTML(value$$1);
    };

    _proto42.untrustedContent = function untrustedContent(value$$1) {
      return this.__appendText(value$$1);
    };

    _proto42.appendComment = function appendComment(string) {
      return this.didAppendNode(this.__appendComment(string));
    };

    _proto42.__appendComment = function __appendComment(string) {
      var dom = this.dom,
          element = this.element,
          nextSibling = this.nextSibling;
      var node = dom.createComment(string);
      dom.insertBefore(element, node, nextSibling);
      return node;
    };

    _proto42.__setAttribute = function __setAttribute(name, value$$1, namespace) {
      this.dom.setAttribute(this.constructing, name, value$$1, namespace);
    };

    _proto42.__setProperty = function __setProperty(name, value$$1) {
      this.constructing[name] = value$$1;
    };

    _proto42.setStaticAttribute = function setStaticAttribute(name, value$$1, namespace) {
      this.__setAttribute(name, value$$1, namespace);
    };

    _proto42.setDynamicAttribute = function setDynamicAttribute(name, value$$1, trusting, namespace) {
      var element = this.constructing;
      var attribute = this.env.attributeFor(element, name, trusting, namespace);
      attribute.set(this, value$$1, this.env);
      return attribute;
    };

    (0, _emberBabel.createClass)(NewElementBuilder, [{
      key: "element",
      get: function get() {
        return this.cursorStack.current.element;
      }
    }, {
      key: "nextSibling",
      get: function get() {
        return this.cursorStack.current.nextSibling;
      }
    }]);
    return NewElementBuilder;
  }();

  _exports.NewElementBuilder = NewElementBuilder;

  var SimpleBlockTracker =
  /*#__PURE__*/
  function () {
    function SimpleBlockTracker(parent) {
      this.parent = parent;
      this.first = null;
      this.last = null;
      this.destroyables = null;
      this.nesting = 0;
    }

    var _proto43 = SimpleBlockTracker.prototype;

    _proto43.destroy = function destroy() {
      var destroyables = this.destroyables;

      if (destroyables && destroyables.length) {
        for (var i = 0; i < destroyables.length; i++) {
          destroyables[i].destroy();
        }
      }
    };

    _proto43.parentElement = function parentElement() {
      return this.parent;
    };

    _proto43.firstNode = function firstNode() {
      var first = this.first;
      return first.firstNode();
    };

    _proto43.lastNode = function lastNode() {
      var last = this.last;
      return last.lastNode();
    };

    _proto43.openElement = function openElement(element) {
      this.didAppendNode(element);
      this.nesting++;
    };

    _proto43.closeElement = function closeElement() {
      this.nesting--;
    };

    _proto43.didAppendNode = function didAppendNode(node) {
      if (this.nesting !== 0) return;

      if (!this.first) {
        this.first = new First(node);
      }

      this.last = new Last(node);
    };

    _proto43.didAppendBounds = function didAppendBounds(bounds) {
      if (this.nesting !== 0) return;

      if (!this.first) {
        this.first = bounds;
      }

      this.last = bounds;
    };

    _proto43.newDestroyable = function newDestroyable(d) {
      this.destroyables = this.destroyables || [];
      this.destroyables.push(d);
    };

    _proto43.finalize = function finalize(stack) {
      if (this.first === null) {
        stack.appendComment('');
      }
    };

    return SimpleBlockTracker;
  }();

  var RemoteBlockTracker =
  /*#__PURE__*/
  function (_SimpleBlockTracker) {
    (0, _emberBabel.inheritsLoose)(RemoteBlockTracker, _SimpleBlockTracker);

    function RemoteBlockTracker() {
      return _SimpleBlockTracker.apply(this, arguments) || this;
    }

    var _proto44 = RemoteBlockTracker.prototype;

    _proto44.destroy = function destroy() {
      _SimpleBlockTracker.prototype.destroy.call(this);

      clear(this);
    };

    return RemoteBlockTracker;
  }(SimpleBlockTracker);

  var UpdatableBlockTracker =
  /*#__PURE__*/
  function (_SimpleBlockTracker2) {
    (0, _emberBabel.inheritsLoose)(UpdatableBlockTracker, _SimpleBlockTracker2);

    function UpdatableBlockTracker() {
      return _SimpleBlockTracker2.apply(this, arguments) || this;
    }

    var _proto45 = UpdatableBlockTracker.prototype;

    _proto45.reset = function reset(env) {
      var destroyables = this.destroyables;

      if (destroyables && destroyables.length) {
        for (var i = 0; i < destroyables.length; i++) {
          env.didDestroy(destroyables[i]);
        }
      }

      var nextSibling = clear(this);
      this.first = null;
      this.last = null;
      this.destroyables = null;
      this.nesting = 0;
      return nextSibling;
    };

    return UpdatableBlockTracker;
  }(SimpleBlockTracker);

  var BlockListTracker =
  /*#__PURE__*/
  function () {
    function BlockListTracker(parent, boundList) {
      this.parent = parent;
      this.boundList = boundList;
      this.parent = parent;
      this.boundList = boundList;
    }

    var _proto46 = BlockListTracker.prototype;

    _proto46.destroy = function destroy() {
      this.boundList.forEachNode(function (node) {
        return node.destroy();
      });
    };

    _proto46.parentElement = function parentElement() {
      return this.parent;
    };

    _proto46.firstNode = function firstNode() {
      var head = this.boundList.head();
      return head.firstNode();
    };

    _proto46.lastNode = function lastNode() {
      var tail = this.boundList.tail();
      return tail.lastNode();
    };

    _proto46.openElement = function openElement(_element) {};

    _proto46.closeElement = function closeElement() {};

    _proto46.didAppendNode = function didAppendNode(_node) {};

    _proto46.didAppendBounds = function didAppendBounds(_bounds) {};

    _proto46.newDestroyable = function newDestroyable(_d) {};

    _proto46.finalize = function finalize(_stack) {};

    return BlockListTracker;
  }();

  function clientBuilder(env, cursor) {
    return NewElementBuilder.forInitialRender(env, cursor);
  }

  var MAX_SMI = 0xfffffff;

  var InnerStack =
  /*#__PURE__*/
  function () {
    function InnerStack(inner, js) {
      if (inner === void 0) {
        inner = new _lowLevel.Stack();
      }

      if (js === void 0) {
        js = [];
      }

      this.inner = inner;
      this.js = js;
    }

    var _proto47 = InnerStack.prototype;

    _proto47.slice = function slice(start, end) {
      var inner;

      if (typeof start === 'number' && typeof end === 'number') {
        inner = this.inner.slice(start, end);
      } else if (typeof start === 'number' && end === undefined) {
        inner = this.inner.sliceFrom(start);
      } else {
        inner = this.inner.clone();
      }

      return new InnerStack(inner, this.js.slice(start, end));
    };

    _proto47.sliceInner = function sliceInner(start, end) {
      var out = [];

      for (var i = start; i < end; i++) {
        out.push(this.get(i));
      }

      return out;
    };

    _proto47.copy = function copy(from, to) {
      this.inner.copy(from, to);
    };

    _proto47.write = function write(pos, value$$1) {
      if (isImmediate(value$$1)) {
        this.inner.writeRaw(pos, encodeImmediate(value$$1));
      } else {
        var idx = this.js.length;
        this.js.push(value$$1);
        this.inner.writeRaw(pos, ~idx);
      }
    };

    _proto47.writeRaw = function writeRaw(pos, value$$1) {
      this.inner.writeRaw(pos, value$$1);
    };

    _proto47.get = function get(pos) {
      var value$$1 = this.inner.getRaw(pos);

      if (value$$1 < 0) {
        return this.js[~value$$1];
      } else {
        return decodeImmediate(value$$1);
      }
    };

    _proto47.reset = function reset() {
      this.inner.reset();
      this.js.length = 0;
    };

    (0, _emberBabel.createClass)(InnerStack, [{
      key: "length",
      get: function get() {
        return this.inner.len();
      }
    }]);
    return InnerStack;
  }();

  var EvaluationStack =
  /*#__PURE__*/
  function () {
    function EvaluationStack(stack, fp, sp) {
      this.stack = stack;
      this.fp = fp;
      this.sp = sp;
    }

    EvaluationStack.empty = function empty() {
      return new this(new InnerStack(), 0, -1);
    };

    EvaluationStack.restore = function restore(snapshot) {
      var stack = new InnerStack();

      for (var i = 0; i < snapshot.length; i++) {
        stack.write(i, snapshot[i]);
      }

      return new this(stack, 0, snapshot.length - 1);
    };

    var _proto48 = EvaluationStack.prototype;

    _proto48.push = function push(value$$1) {
      this.stack.write(++this.sp, value$$1);
    };

    _proto48.pushEncodedImmediate = function pushEncodedImmediate(value$$1) {
      this.stack.writeRaw(++this.sp, value$$1);
    };

    _proto48.pushNull = function pushNull() {
      this.stack.write(++this.sp, null);
    };

    _proto48.dup = function dup(position) {
      if (position === void 0) {
        position = this.sp;
      }

      this.stack.copy(position, ++this.sp);
    };

    _proto48.copy = function copy(from, to) {
      this.stack.copy(from, to);
    };

    _proto48.pop = function pop(n) {
      if (n === void 0) {
        n = 1;
      }

      var top = this.stack.get(this.sp);
      this.sp -= n;
      return top;
    };

    _proto48.popSmi = function popSmi() {
      return this.stack.get(this.sp--);
    };

    _proto48.peek = function peek(offset) {
      if (offset === void 0) {
        offset = 0;
      }

      return this.stack.get(this.sp - offset);
    };

    _proto48.get = function get(offset, base) {
      if (base === void 0) {
        base = this.fp;
      }

      return this.stack.get(base + offset);
    };

    _proto48.set = function set(value$$1, offset, base) {
      if (base === void 0) {
        base = this.fp;
      }

      this.stack.write(base + offset, value$$1);
    };

    _proto48.slice = function slice(start, end) {
      return this.stack.slice(start, end);
    };

    _proto48.sliceArray = function sliceArray(start, end) {
      return this.stack.sliceInner(start, end);
    };

    _proto48.capture = function capture(items) {
      var end = this.sp + 1;
      var start = end - items;
      return this.stack.sliceInner(start, end);
    };

    _proto48.reset = function reset() {
      this.stack.reset();
    };

    _proto48.toArray = function toArray() {
      return this.stack.sliceInner(this.fp, this.sp + 1);
    };

    return EvaluationStack;
  }();

  function isImmediate(value$$1) {
    var type = typeof value$$1;
    if (value$$1 === null || value$$1 === undefined) return true;

    switch (type) {
      case 'boolean':
      case 'undefined':
        return true;

      case 'number':
        // not an integer
        if (value$$1 % 1 !== 0) return false;
        var abs = Math.abs(value$$1);
        if (abs > MAX_SMI) return false;
        return true;

      default:
        return false;
    }
  }

  function encodeSmi(primitive) {
    if (primitive < 0) {
      var abs = Math.abs(primitive);
      if (abs > MAX_SMI) throw new Error('not smi');
      return Math.abs(primitive) << 3 | 4
      /* NEGATIVE */
      ;
    } else {
      if (primitive > MAX_SMI) throw new Error('not smi');
      return primitive << 3 | 0
      /* NUMBER */
      ;
    }
  }

  function encodeImmediate(primitive) {
    switch (typeof primitive) {
      case 'number':
        return encodeSmi(primitive);

      case 'boolean':
        return primitive ? 11
        /* True */
        : 3
        /* False */
        ;

      case 'object':
        // assume null
        return 19
        /* Null */
        ;

      case 'undefined':
        return 27
        /* Undef */
        ;

      default:
        throw (0, _util.unreachable)();
    }
  }

  function decodeSmi(smi) {
    switch (smi & 7) {
      case 0
      /* NUMBER */
      :
        return smi >> 3;

      case 4
      /* NEGATIVE */
      :
        return -(smi >> 3);

      default:
        throw (0, _util.unreachable)();
    }
  }

  function decodeImmediate(immediate) {
    switch (immediate) {
      case 3
      /* False */
      :
        return false;

      case 11
      /* True */
      :
        return true;

      case 19
      /* Null */
      :
        return null;

      case 27
      /* Undef */
      :
        return undefined;

      default:
        return decodeSmi(immediate);
    }
  }

  var UpdatingVM =
  /*#__PURE__*/
  function () {
    function UpdatingVM(env, program, _ref57) {
      var _ref57$alwaysRevalida = _ref57.alwaysRevalidate,
          alwaysRevalidate = _ref57$alwaysRevalida === void 0 ? false : _ref57$alwaysRevalida;
      this.frameStack = new _util.Stack();
      this.env = env;
      this.constants = program.constants;
      this.dom = env.getDOM();
      this.alwaysRevalidate = alwaysRevalidate;
    }

    var _proto49 = UpdatingVM.prototype;

    _proto49.execute = function execute(opcodes, handler) {
      var frameStack = this.frameStack;
      this.try(opcodes, handler);

      while (true) {
        if (frameStack.isEmpty()) break;
        var opcode = this.frame.nextStatement();

        if (opcode === null) {
          this.frameStack.pop();
          continue;
        }

        opcode.evaluate(this);
      }
    };

    _proto49.goto = function goto(op) {
      this.frame.goto(op);
    };

    _proto49.try = function _try(ops, handler) {
      this.frameStack.push(new UpdatingVMFrame(ops, handler));
    };

    _proto49.throw = function _throw() {
      this.frame.handleException();
      this.frameStack.pop();
    };

    (0, _emberBabel.createClass)(UpdatingVM, [{
      key: "frame",
      get: function get() {
        return this.frameStack.current;
      }
    }]);
    return UpdatingVM;
  }();

  _exports.UpdatingVM = UpdatingVM;

  var BlockOpcode =
  /*#__PURE__*/
  function (_UpdatingOpcode9) {
    (0, _emberBabel.inheritsLoose)(BlockOpcode, _UpdatingOpcode9);

    function BlockOpcode(start, state, runtime, bounds, children) {
      var _this15;

      _this15 = _UpdatingOpcode9.call(this) || this;
      _this15.start = start;
      _this15.state = state;
      _this15.runtime = runtime;
      _this15.type = 'block';
      _this15.next = null;
      _this15.prev = null;
      _this15.children = children;
      _this15.bounds = bounds;
      return _this15;
    }

    var _proto50 = BlockOpcode.prototype;

    _proto50.parentElement = function parentElement() {
      return this.bounds.parentElement();
    };

    _proto50.firstNode = function firstNode() {
      return this.bounds.firstNode();
    };

    _proto50.lastNode = function lastNode() {
      return this.bounds.lastNode();
    };

    _proto50.evaluate = function evaluate(vm) {
      vm.try(this.children, null);
    };

    _proto50.destroy = function destroy() {
      this.bounds.destroy();
    };

    _proto50.didDestroy = function didDestroy() {
      this.runtime.env.didDestroy(this.bounds);
    };

    return BlockOpcode;
  }(UpdatingOpcode);

  var TryOpcode =
  /*#__PURE__*/
  function (_BlockOpcode) {
    (0, _emberBabel.inheritsLoose)(TryOpcode, _BlockOpcode);

    function TryOpcode(start, state, runtime, bounds, children) {
      var _this16;

      _this16 = _BlockOpcode.call(this, start, state, runtime, bounds, children) || this;
      _this16.type = 'try';
      _this16.tag = _this16._tag = (0, _reference2.createUpdatableTag)();
      return _this16;
    }

    var _proto51 = TryOpcode.prototype;

    _proto51.didInitializeChildren = function didInitializeChildren() {
      (0, _reference2.update)(this._tag, (0, _reference2.combineSlice)(this.children));
    };

    _proto51.evaluate = function evaluate(vm) {
      vm.try(this.children, this);
    };

    _proto51.handleException = function handleException() {
      var _this17 = this;

      var state = this.state,
          bounds = this.bounds,
          children = this.children,
          start = this.start,
          prev = this.prev,
          next = this.next,
          runtime = this.runtime;
      children.clear();
      var elementStack = NewElementBuilder.resume(runtime.env, bounds, bounds.reset(runtime.env));
      var vm = VM.resume(state, runtime, elementStack);
      var updating = new _util.LinkedList();
      vm.execute(start, function (vm) {
        vm.stack = EvaluationStack.restore(state.stack);
        vm.updatingOpcodeStack.push(updating);
        vm.updateWith(_this17);
        vm.updatingOpcodeStack.push(children);
      });
      this.prev = prev;
      this.next = next;
    };

    return TryOpcode;
  }(BlockOpcode);

  var ListRevalidationDelegate =
  /*#__PURE__*/
  function () {
    function ListRevalidationDelegate(opcode, marker) {
      this.opcode = opcode;
      this.marker = marker;
      this.didInsert = false;
      this.didDelete = false;
      this.map = opcode.map;
      this.updating = opcode['children'];
    }

    var _proto52 = ListRevalidationDelegate.prototype;

    _proto52.insert = function insert(key, item, memo, before) {
      var map = this.map,
          opcode = this.opcode,
          updating = this.updating;
      var nextSibling = null;
      var reference = null;

      if (typeof before === 'string') {
        reference = map[before];
        nextSibling = reference['bounds'].firstNode();
      } else {
        nextSibling = this.marker;
      }

      var vm = opcode.vmForInsertion(nextSibling);
      var tryOpcode = null;
      var start = opcode.start;
      vm.execute(start, function (vm) {
        map[key] = tryOpcode = vm.iterate(memo, item);
        vm.updatingOpcodeStack.push(new _util.LinkedList());
        vm.updateWith(tryOpcode);
        vm.updatingOpcodeStack.push(tryOpcode.children);
      });
      updating.insertBefore(tryOpcode, reference);
      this.didInsert = true;
    };

    _proto52.retain = function retain(_key, _item, _memo) {};

    _proto52.move = function move(key, _item, _memo, before) {
      var map = this.map,
          updating = this.updating;
      var entry = map[key];
      var reference = map[before] || null;

      if (typeof before === 'string') {
        _move(entry, reference.firstNode());
      } else {
        _move(entry, this.marker);
      }

      updating.remove(entry);
      updating.insertBefore(entry, reference);
    };

    _proto52.delete = function _delete(key) {
      var map = this.map;
      var opcode = map[key];
      opcode.didDestroy();
      clear(opcode);
      this.updating.remove(opcode);
      delete map[key];
      this.didDelete = true;
    };

    _proto52.done = function done() {
      this.opcode.didInitializeChildren(this.didInsert || this.didDelete);
    };

    return ListRevalidationDelegate;
  }();

  var ListBlockOpcode =
  /*#__PURE__*/
  function (_BlockOpcode2) {
    (0, _emberBabel.inheritsLoose)(ListBlockOpcode, _BlockOpcode2);

    function ListBlockOpcode(start, state, runtime, bounds, children, artifacts) {
      var _this18;

      _this18 = _BlockOpcode2.call(this, start, state, runtime, bounds, children) || this;
      _this18.type = 'list-block';
      _this18.map = (0, _util.dict)();
      _this18.lastIterated = _reference2.INITIAL;
      _this18.artifacts = artifacts;

      var _tag = _this18._tag = (0, _reference2.createUpdatableTag)();

      _this18.tag = (0, _reference2.combine)([artifacts.tag, _tag]);
      return _this18;
    }

    var _proto53 = ListBlockOpcode.prototype;

    _proto53.didInitializeChildren = function didInitializeChildren(listDidChange) {
      if (listDidChange === void 0) {
        listDidChange = true;
      }

      this.lastIterated = (0, _reference2.value)(this.artifacts.tag);

      if (listDidChange) {
        (0, _reference2.update)(this._tag, (0, _reference2.combineSlice)(this.children));
      }
    };

    _proto53.evaluate = function evaluate(vm) {
      var artifacts = this.artifacts,
          lastIterated = this.lastIterated;

      if (!(0, _reference2.validate)(artifacts.tag, lastIterated)) {
        var bounds = this.bounds;
        var dom = vm.dom;
        var marker = dom.createComment('');
        dom.insertAfter(bounds.parentElement(), marker, bounds.lastNode());
        var target = new ListRevalidationDelegate(this, marker);
        var synchronizer = new _reference2.IteratorSynchronizer({
          target: target,
          artifacts: artifacts
        });
        synchronizer.sync();
        this.parentElement().removeChild(marker);
      } // Run now-updated updating opcodes


      _BlockOpcode2.prototype.evaluate.call(this, vm);
    };

    _proto53.vmForInsertion = function vmForInsertion(nextSibling) {
      var bounds = this.bounds,
          state = this.state,
          runtime = this.runtime;
      var elementStack = NewElementBuilder.forInitialRender(runtime.env, {
        element: bounds.parentElement(),
        nextSibling: nextSibling
      });
      return VM.resume(state, runtime, elementStack);
    };

    return ListBlockOpcode;
  }(BlockOpcode);

  var UpdatingVMFrame =
  /*#__PURE__*/
  function () {
    function UpdatingVMFrame(ops, exceptionHandler) {
      this.ops = ops;
      this.exceptionHandler = exceptionHandler;
      this.current = ops.head();
    }

    var _proto54 = UpdatingVMFrame.prototype;

    _proto54.goto = function goto(op) {
      this.current = op;
    };

    _proto54.nextStatement = function nextStatement() {
      var current = this.current,
          ops = this.ops;
      if (current) this.current = ops.nextNode(current);
      return current;
    };

    _proto54.handleException = function handleException() {
      if (this.exceptionHandler) {
        this.exceptionHandler.handleException();
      }
    };

    return UpdatingVMFrame;
  }();

  var RenderResult =
  /*#__PURE__*/
  function () {
    function RenderResult(env, program, updating, bounds) {
      this.env = env;
      this.program = program;
      this.updating = updating;
      this.bounds = bounds;
    }

    var _proto55 = RenderResult.prototype;

    _proto55.rerender = function rerender(_temp) {
      var _ref58 = _temp === void 0 ? {
        alwaysRevalidate: false
      } : _temp,
          _ref58$alwaysRevalida = _ref58.alwaysRevalidate,
          alwaysRevalidate = _ref58$alwaysRevalida === void 0 ? false : _ref58$alwaysRevalida;

      var env = this.env,
          program = this.program,
          updating = this.updating;
      var vm = new UpdatingVM(env, program, {
        alwaysRevalidate: alwaysRevalidate
      });
      vm.execute(updating, this);
    };

    _proto55.parentElement = function parentElement() {
      return this.bounds.parentElement();
    };

    _proto55.firstNode = function firstNode() {
      return this.bounds.firstNode();
    };

    _proto55.lastNode = function lastNode() {
      return this.bounds.lastNode();
    };

    _proto55.handleException = function handleException() {
      throw 'this should never happen';
    };

    _proto55.destroy = function destroy() {
      this.bounds.destroy();
      clear(this.bounds);
    };

    return RenderResult;
  }();

  _exports.RenderResult = RenderResult;

  var Arguments =
  /*#__PURE__*/
  function () {
    function Arguments() {
      this.stack = null;
      this.positional = new PositionalArguments();
      this.named = new NamedArguments();
      this.blocks = new BlockArguments();
    }

    var _proto56 = Arguments.prototype;

    _proto56.empty = function empty(stack) {
      var base = stack.sp + 1;
      this.named.empty(stack, base);
      this.positional.empty(stack, base);
      this.blocks.empty(stack, base);
      return this;
    };

    _proto56.setup = function setup(stack, names, blockNames, positionalCount, synthetic) {
      this.stack = stack;
      /*
             | ... | blocks      | positional  | named |
             | ... | b0    b1    | p0 p1 p2 p3 | n0 n1 |
       index | ... | 4/5/6 7/8/9 | 10 11 12 13 | 14 15 |
                     ^             ^             ^  ^
                   bbase         pbase       nbase  sp
      */

      var named = this.named;
      var namedCount = names.length;
      var namedBase = stack.sp - namedCount + 1;
      named.setup(stack, namedBase, namedCount, names, synthetic);
      var positional = this.positional;
      var positionalBase = namedBase - positionalCount;
      positional.setup(stack, positionalBase, positionalCount);
      var blocks = this.blocks;
      var blocksCount = blockNames.length;
      var blocksBase = positionalBase - blocksCount * 3;
      blocks.setup(stack, blocksBase, blocksCount, blockNames);
    };

    _proto56.at = function at(pos) {
      return this.positional.at(pos);
    };

    _proto56.realloc = function realloc(offset) {
      var stack = this.stack;

      if (offset > 0 && stack !== null) {
        var positional = this.positional,
            named = this.named;
        var newBase = positional.base + offset;
        var length = positional.length + named.length;

        for (var i = length - 1; i >= 0; i--) {
          stack.copy(i + positional.base, i + newBase);
        }

        positional.base += offset;
        named.base += offset;
        stack.sp += offset;
      }
    };

    _proto56.capture = function capture() {
      var positional = this.positional.length === 0 ? EMPTY_POSITIONAL : this.positional.capture();
      var named = this.named.length === 0 ? EMPTY_NAMED : this.named.capture();
      return new CapturedArguments(this.tag, positional, named, this.length);
    };

    _proto56.clear = function clear() {
      var stack = this.stack,
          length = this.length;
      if (length > 0 && stack !== null) stack.pop(length);
    };

    (0, _emberBabel.createClass)(Arguments, [{
      key: "tag",
      get: function get() {
        return (0, _reference2.combineTagged)([this.positional, this.named]);
      }
    }, {
      key: "base",
      get: function get() {
        return this.blocks.base;
      }
    }, {
      key: "length",
      get: function get() {
        return this.positional.length + this.named.length + this.blocks.length * 3;
      }
    }]);
    return Arguments;
  }();

  var CapturedArguments =
  /*#__PURE__*/
  function () {
    function CapturedArguments(tag, positional, named, length) {
      this.tag = tag;
      this.positional = positional;
      this.named = named;
      this.length = length;
    }

    var _proto57 = CapturedArguments.prototype;

    _proto57.value = function value() {
      return {
        named: this.named.value(),
        positional: this.positional.value()
      };
    };

    return CapturedArguments;
  }();

  var PositionalArguments =
  /*#__PURE__*/
  function () {
    function PositionalArguments() {
      this.base = 0;
      this.length = 0;
      this.stack = null;
      this._tag = null;
      this._references = null;
    }

    var _proto58 = PositionalArguments.prototype;

    _proto58.empty = function empty(stack, base) {
      this.stack = stack;
      this.base = base;
      this.length = 0;
      this._tag = _reference2.CONSTANT_TAG;
      this._references = _util.EMPTY_ARRAY;
    };

    _proto58.setup = function setup(stack, base, length) {
      this.stack = stack;
      this.base = base;
      this.length = length;

      if (length === 0) {
        this._tag = _reference2.CONSTANT_TAG;
        this._references = _util.EMPTY_ARRAY;
      } else {
        this._tag = null;
        this._references = null;
      }
    };

    _proto58.at = function at(position) {
      var base = this.base,
          length = this.length,
          stack = this.stack;

      if (position < 0 || position >= length) {
        return UNDEFINED_REFERENCE;
      }

      return stack.get(position, base);
    };

    _proto58.capture = function capture() {
      return new CapturedPositionalArguments(this.tag, this.references);
    };

    _proto58.prepend = function prepend(other) {
      var additions = other.length;

      if (additions > 0) {
        var base = this.base,
            length = this.length,
            stack = this.stack;
        this.base = base = base - additions;
        this.length = length + additions;

        for (var i = 0; i < additions; i++) {
          stack.set(other.at(i), i, base);
        }

        this._tag = null;
        this._references = null;
      }
    };

    (0, _emberBabel.createClass)(PositionalArguments, [{
      key: "tag",
      get: function get() {
        var tag = this._tag;

        if (!tag) {
          tag = this._tag = (0, _reference2.combineTagged)(this.references);
        }

        return tag;
      }
    }, {
      key: "references",
      get: function get() {
        var references = this._references;

        if (!references) {
          var stack = this.stack,
              base = this.base,
              length = this.length;
          references = this._references = stack.sliceArray(base, base + length);
        }

        return references;
      }
    }]);
    return PositionalArguments;
  }();

  var CapturedPositionalArguments =
  /*#__PURE__*/
  function () {
    function CapturedPositionalArguments(tag, references, length) {
      if (length === void 0) {
        length = references.length;
      }

      this.tag = tag;
      this.references = references;
      this.length = length;
    }

    CapturedPositionalArguments.empty = function empty() {
      return new CapturedPositionalArguments(_reference2.CONSTANT_TAG, _util.EMPTY_ARRAY, 0);
    };

    var _proto59 = CapturedPositionalArguments.prototype;

    _proto59.at = function at(position) {
      return this.references[position];
    };

    _proto59.value = function value() {
      return this.references.map(this.valueOf);
    };

    _proto59.get = function get(name) {
      var references = this.references,
          length = this.length;

      if (name === 'length') {
        return PrimitiveReference.create(length);
      } else {
        var idx = parseInt(name, 10);

        if (idx < 0 || idx >= length) {
          return UNDEFINED_REFERENCE;
        } else {
          return references[idx];
        }
      }
    };

    _proto59.valueOf = function valueOf(reference) {
      return reference.value();
    };

    return CapturedPositionalArguments;
  }();

  var NamedArguments =
  /*#__PURE__*/
  function () {
    function NamedArguments() {
      this.base = 0;
      this.length = 0;
      this._references = null;
      this._names = _util.EMPTY_ARRAY;
      this._atNames = _util.EMPTY_ARRAY;
    }

    var _proto60 = NamedArguments.prototype;

    _proto60.empty = function empty(stack, base) {
      this.stack = stack;
      this.base = base;
      this.length = 0;
      this._references = _util.EMPTY_ARRAY;
      this._names = _util.EMPTY_ARRAY;
      this._atNames = _util.EMPTY_ARRAY;
    };

    _proto60.setup = function setup(stack, base, length, names, synthetic) {
      this.stack = stack;
      this.base = base;
      this.length = length;

      if (length === 0) {
        this._references = _util.EMPTY_ARRAY;
        this._names = _util.EMPTY_ARRAY;
        this._atNames = _util.EMPTY_ARRAY;
      } else {
        this._references = null;

        if (synthetic) {
          this._names = names;
          this._atNames = null;
        } else {
          this._names = null;
          this._atNames = names;
        }
      }
    };

    _proto60.has = function has(name) {
      return this.names.indexOf(name) !== -1;
    };

    _proto60.get = function get(name, synthetic) {
      if (synthetic === void 0) {
        synthetic = true;
      }

      var base = this.base,
          stack = this.stack;
      var names = synthetic ? this.names : this.atNames;
      var idx = names.indexOf(name);

      if (idx === -1) {
        return UNDEFINED_REFERENCE;
      }

      return stack.get(idx, base);
    };

    _proto60.capture = function capture() {
      return new CapturedNamedArguments(this.tag, this.names, this.references);
    };

    _proto60.merge = function merge(other) {
      var extras = other.length;

      if (extras > 0) {
        var names = this.names,
            length = this.length,
            stack = this.stack;
        var extraNames = other.names;

        if (Object.isFrozen(names) && names.length === 0) {
          names = [];
        }

        for (var i = 0; i < extras; i++) {
          var name = extraNames[i];
          var idx = names.indexOf(name);

          if (idx === -1) {
            length = names.push(name);
            stack.push(other.references[i]);
          }
        }

        this.length = length;
        this._references = null;
        this._names = names;
        this._atNames = null;
      }
    };

    _proto60.toSyntheticName = function toSyntheticName(name) {
      return name.slice(1);
    };

    _proto60.toAtName = function toAtName(name) {
      return "@" + name;
    };

    (0, _emberBabel.createClass)(NamedArguments, [{
      key: "tag",
      get: function get() {
        return (0, _reference2.combineTagged)(this.references);
      }
    }, {
      key: "names",
      get: function get() {
        var names = this._names;

        if (!names) {
          names = this._names = this._atNames.map(this.toSyntheticName);
        }

        return names;
      }
    }, {
      key: "atNames",
      get: function get() {
        var atNames = this._atNames;

        if (!atNames) {
          atNames = this._atNames = this._names.map(this.toAtName);
        }

        return atNames;
      }
    }, {
      key: "references",
      get: function get() {
        var references = this._references;

        if (!references) {
          var base = this.base,
              length = this.length,
              stack = this.stack;
          references = this._references = stack.sliceArray(base, base + length);
        }

        return references;
      }
    }]);
    return NamedArguments;
  }();

  var CapturedNamedArguments =
  /*#__PURE__*/
  function () {
    function CapturedNamedArguments(tag, names, references) {
      this.tag = tag;
      this.names = names;
      this.references = references;
      this.length = names.length;
      this._map = null;
    }

    var _proto61 = CapturedNamedArguments.prototype;

    _proto61.has = function has(name) {
      return this.names.indexOf(name) !== -1;
    };

    _proto61.get = function get(name) {
      var names = this.names,
          references = this.references;
      var idx = names.indexOf(name);

      if (idx === -1) {
        return UNDEFINED_REFERENCE;
      } else {
        return references[idx];
      }
    };

    _proto61.value = function value() {
      var names = this.names,
          references = this.references;
      var out = (0, _util.dict)();

      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        out[name] = references[i].value();
      }

      return out;
    };

    (0, _emberBabel.createClass)(CapturedNamedArguments, [{
      key: "map",
      get: function get() {
        var map = this._map;

        if (!map) {
          var names = this.names,
              references = this.references;
          map = this._map = (0, _util.dict)();

          for (var i = 0; i < names.length; i++) {
            var name = names[i];
            map[name] = references[i];
          }
        }

        return map;
      }
    }]);
    return CapturedNamedArguments;
  }();

  var BlockArguments =
  /*#__PURE__*/
  function () {
    function BlockArguments() {
      this.internalValues = null;
      this.internalTag = null;
      this.names = _util.EMPTY_ARRAY;
      this.length = 0;
      this.base = 0;
    }

    var _proto62 = BlockArguments.prototype;

    _proto62.empty = function empty(stack, base) {
      this.stack = stack;
      this.names = _util.EMPTY_ARRAY;
      this.base = base;
      this.length = 0;
      this.internalTag = _reference2.CONSTANT_TAG;
      this.internalValues = _util.EMPTY_ARRAY;
    };

    _proto62.setup = function setup(stack, base, length, names) {
      this.stack = stack;
      this.names = names;
      this.base = base;
      this.length = length;

      if (length === 0) {
        this.internalTag = _reference2.CONSTANT_TAG;
        this.internalValues = _util.EMPTY_ARRAY;
      } else {
        this.internalTag = null;
        this.internalValues = null;
      }
    };

    _proto62.has = function has(name) {
      return this.names.indexOf(name) !== -1;
    };

    _proto62.get = function get(name) {
      var base = this.base,
          stack = this.stack,
          names = this.names;
      var idx = names.indexOf(name);

      if (names.indexOf(name) === -1) {
        return null;
      }

      var table = stack.get(idx * 3, base);
      var scope = stack.get(idx * 3 + 1, base); // FIXME(mmun): shouldn't need to cast this

      var handle = stack.get(idx * 3 + 2, base);
      return handle === null ? null : [handle, scope, table];
    };

    _proto62.capture = function capture() {
      return new CapturedBlockArguments(this.names, this.values);
    };

    (0, _emberBabel.createClass)(BlockArguments, [{
      key: "values",
      get: function get() {
        var values = this.internalValues;

        if (!values) {
          var base = this.base,
              length = this.length,
              stack = this.stack;
          values = this.internalValues = stack.sliceArray(base, base + length * 3);
        }

        return values;
      }
    }]);
    return BlockArguments;
  }();

  var CapturedBlockArguments =
  /*#__PURE__*/
  function () {
    function CapturedBlockArguments(names, values) {
      this.names = names;
      this.values = values;
      this.length = names.length;
    }

    var _proto63 = CapturedBlockArguments.prototype;

    _proto63.has = function has(name) {
      return this.names.indexOf(name) !== -1;
    };

    _proto63.get = function get(name) {
      var idx = this.names.indexOf(name);
      if (idx === -1) return null;
      return [this.values[idx * 3 + 2], this.values[idx * 3 + 1], this.values[idx * 3]];
    };

    return CapturedBlockArguments;
  }();

  var EMPTY_NAMED = new CapturedNamedArguments(_reference2.CONSTANT_TAG, _util.EMPTY_ARRAY, _util.EMPTY_ARRAY);
  var EMPTY_POSITIONAL = new CapturedPositionalArguments(_reference2.CONSTANT_TAG, _util.EMPTY_ARRAY);
  var EMPTY_ARGS = new CapturedArguments(_reference2.CONSTANT_TAG, EMPTY_POSITIONAL, EMPTY_NAMED, 0);
  _exports.EMPTY_ARGS = EMPTY_ARGS;

  var VM =
  /*#__PURE__*/
  function () {
    function VM(runtime, scope, dynamicScope, elementStack) {
      var _this19 = this;

      this.runtime = runtime;
      this.elementStack = elementStack;
      this.dynamicScopeStack = new _util.Stack();
      this.scopeStack = new _util.Stack();
      this.updatingOpcodeStack = new _util.Stack();
      this.cacheGroups = new _util.Stack();
      this.listBlockStack = new _util.Stack();
      this.s0 = null;
      this.s1 = null;
      this.t0 = null;
      this.t1 = null;
      this.v0 = null;
      this.heap = this.program.heap;
      this.constants = this.program.constants;
      this.elementStack = elementStack;
      this.scopeStack.push(scope);
      this.dynamicScopeStack.push(dynamicScope);
      this.args = new Arguments();
      this.inner = new LowLevelVM(EvaluationStack.empty(), this.heap, runtime.program, {
        debugBefore: function debugBefore(opcode) {
          return APPEND_OPCODES.debugBefore(_this19, opcode, opcode.type);
        },
        debugAfter: function debugAfter(opcode, state) {
          APPEND_OPCODES.debugAfter(_this19, opcode, opcode.type, state);
        }
      });
    }

    var _proto64 = VM.prototype;

    // Fetch a value from a register onto the stack
    _proto64.fetch = function fetch(register) {
      this.stack.push(this[_vm2.Register[register]]);
    } // Load a value from the stack into a register
    ;

    _proto64.load = function load(register) {
      this[_vm2.Register[register]] = this.stack.pop();
    } // Fetch a value from a register
    ;

    _proto64.fetchValue = function fetchValue(register) {
      return this[_vm2.Register[register]];
    } // Load a value into a register
    ;

    _proto64.loadValue = function loadValue(register, value$$1) {
      this[_vm2.Register[register]] = value$$1;
    }
    /**
     * Migrated to Inner
     */
    // Start a new frame and save $ra and $fp on the stack
    ;

    _proto64.pushFrame = function pushFrame() {
      this.inner.pushFrame();
    } // Restore $ra, $sp and $fp
    ;

    _proto64.popFrame = function popFrame() {
      this.inner.popFrame();
    } // Jump to an address in `program`
    ;

    _proto64.goto = function goto(offset) {
      this.inner.goto(offset);
    } // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
    ;

    _proto64.call = function call(handle) {
      this.inner.call(handle);
    } // Put a specific `program` address in $ra
    ;

    _proto64.returnTo = function returnTo(offset) {
      this.inner.returnTo(offset);
    } // Return to the `program` address stored in $ra
    ;

    _proto64.return = function _return() {
      this.inner.return();
    }
    /**
     * End of migrated.
     */
    ;

    VM.initial = function initial(program, env, self, dynamicScope, elementStack, handle) {
      var scopeSize = program.heap.scopesizeof(handle);
      var scope = Scope.root(self, scopeSize);
      var vm = new VM({
        program: program,
        env: env
      }, scope, dynamicScope, elementStack);
      vm.pc = vm.heap.getaddr(handle);
      vm.updatingOpcodeStack.push(new _util.LinkedList());
      return vm;
    };

    VM.empty = function empty(program, env, elementStack, handle) {
      var dynamicScope = {
        get: function get() {
          return UNDEFINED_REFERENCE;
        },
        set: function set() {
          return UNDEFINED_REFERENCE;
        },
        child: function child() {
          return dynamicScope;
        }
      };
      var vm = new VM({
        program: program,
        env: env
      }, Scope.root(UNDEFINED_REFERENCE, 0), dynamicScope, elementStack);
      vm.updatingOpcodeStack.push(new _util.LinkedList());
      vm.pc = vm.heap.getaddr(handle);
      return vm;
    };

    VM.resume = function resume(_ref59, runtime, stack) {
      var scope = _ref59.scope,
          dynamicScope = _ref59.dynamicScope;
      return new VM(runtime, scope, dynamicScope, stack);
    };

    _proto64.capture = function capture(args) {
      return {
        dynamicScope: this.dynamicScope(),
        scope: this.scope(),
        stack: this.stack.capture(args)
      };
    };

    _proto64.beginCacheGroup = function beginCacheGroup() {
      this.cacheGroups.push(this.updating().tail());
    };

    _proto64.commitCacheGroup = function commitCacheGroup() {
      //        JumpIfNotModified(END)
      //        (head)
      //        (....)
      //        (tail)
      //        DidModify
      // END:   Noop
      var END = new LabelOpcode('END');
      var opcodes = this.updating();
      var marker = this.cacheGroups.pop();
      var head = marker ? opcodes.nextNode(marker) : opcodes.head();
      var tail = opcodes.tail();
      var tag = (0, _reference2.combineSlice)(new _util.ListSlice(head, tail));
      var guard = new JumpIfNotModifiedOpcode(tag, END);
      opcodes.insertBefore(guard, head);
      opcodes.append(new DidModifyOpcode(guard));
      opcodes.append(END);
    };

    _proto64.enter = function enter(args) {
      var updating = new _util.LinkedList();
      var state = this.capture(args);
      var tracker = this.elements().pushUpdatableBlock();
      var tryOpcode = new TryOpcode(this.heap.gethandle(this.pc), state, this.runtime, tracker, updating);
      this.didEnter(tryOpcode);
    };

    _proto64.iterate = function iterate(memo, value$$1) {
      var stack = this.stack;
      stack.push(value$$1);
      stack.push(memo);
      var state = this.capture(2);
      var tracker = this.elements().pushUpdatableBlock(); // let ip = this.ip;
      // this.ip = end + 4;
      // this.frames.push(ip);

      return new TryOpcode(this.heap.gethandle(this.pc), state, this.runtime, tracker, new _util.LinkedList());
    };

    _proto64.enterItem = function enterItem(key, opcode) {
      this.listBlock().map[key] = opcode;
      this.didEnter(opcode);
    };

    _proto64.enterList = function enterList(relativeStart) {
      var updating = new _util.LinkedList();
      var state = this.capture(0);
      var tracker = this.elements().pushBlockList(updating);
      var artifacts = this.stack.peek().artifacts;
      var addr = this.pc + relativeStart - this.currentOpSize;
      var start = this.heap.gethandle(addr);
      var opcode = new ListBlockOpcode(start, state, this.runtime, tracker, updating, artifacts);
      this.listBlockStack.push(opcode);
      this.didEnter(opcode);
    };

    _proto64.didEnter = function didEnter(opcode) {
      this.updateWith(opcode);
      this.updatingOpcodeStack.push(opcode.children);
    };

    _proto64.exit = function exit() {
      this.elements().popBlock();
      this.updatingOpcodeStack.pop();
      var parent = this.updating().tail();
      parent.didInitializeChildren();
    };

    _proto64.exitList = function exitList() {
      this.exit();
      this.listBlockStack.pop();
    };

    _proto64.updateWith = function updateWith(opcode) {
      this.updating().append(opcode);
    };

    _proto64.listBlock = function listBlock() {
      return this.listBlockStack.current;
    };

    _proto64.updating = function updating() {
      return this.updatingOpcodeStack.current;
    };

    _proto64.elements = function elements() {
      return this.elementStack;
    };

    _proto64.scope = function scope() {
      return this.scopeStack.current;
    };

    _proto64.dynamicScope = function dynamicScope() {
      return this.dynamicScopeStack.current;
    };

    _proto64.pushChildScope = function pushChildScope() {
      this.scopeStack.push(this.scope().child());
    };

    _proto64.pushDynamicScope = function pushDynamicScope() {
      var child = this.dynamicScope().child();
      this.dynamicScopeStack.push(child);
      return child;
    };

    _proto64.pushRootScope = function pushRootScope(size, bindCaller) {
      var scope = Scope.sized(size);
      if (bindCaller) scope.bindCallerScope(this.scope());
      this.scopeStack.push(scope);
      return scope;
    };

    _proto64.pushScope = function pushScope(scope) {
      this.scopeStack.push(scope);
    };

    _proto64.popScope = function popScope() {
      this.scopeStack.pop();
    };

    _proto64.popDynamicScope = function popDynamicScope() {
      this.dynamicScopeStack.pop();
    };

    _proto64.newDestroyable = function newDestroyable(d) {
      this.elements().didAddDestroyable(d);
    } /// SCOPE HELPERS
    ;

    _proto64.getSelf = function getSelf() {
      return this.scope().getSelf();
    };

    _proto64.referenceForSymbol = function referenceForSymbol(symbol) {
      return this.scope().getSymbol(symbol);
    } /// EXECUTION
    ;

    _proto64.execute = function execute(start, initialize) {
      this.pc = this.heap.getaddr(start);
      if (initialize) initialize(this);
      var result;

      while (true) {
        result = this.next();
        if (result.done) break;
      }

      return result.value;
    };

    _proto64.next = function next() {
      var env = this.env,
          program = this.program,
          updatingOpcodeStack = this.updatingOpcodeStack,
          elementStack = this.elementStack;
      var opcode = this.inner.nextStatement();
      var result;

      if (opcode !== null) {
        this.inner.evaluateOuter(opcode, this);
        result = {
          done: false,
          value: null
        };
      } else {
        // Unload the stack
        this.stack.reset();
        result = {
          done: true,
          value: new RenderResult(env, program, updatingOpcodeStack.pop(), elementStack.popBlock())
        };
      }

      return result;
    };

    _proto64.bindDynamicScope = function bindDynamicScope(names) {
      var scope = this.dynamicScope();

      for (var i = names.length - 1; i >= 0; i--) {
        var name = this.constants.getString(names[i]);
        scope.set(name, this.stack.pop());
      }
    };

    (0, _emberBabel.createClass)(VM, [{
      key: "stack",
      get: function get() {
        return this.inner.stack;
      },
      set: function set(value$$1) {
        this.inner.stack = value$$1;
      }
      /* Registers */

    }, {
      key: "currentOpSize",
      set: function set(value$$1) {
        this.inner.currentOpSize = value$$1;
      },
      get: function get() {
        return this.inner.currentOpSize;
      }
    }, {
      key: "pc",
      get: function get() {
        return this.inner.pc;
      },
      set: function set(value$$1) {
        this.inner.pc = value$$1;
      }
    }, {
      key: "ra",
      get: function get() {
        return this.inner.ra;
      },
      set: function set(value$$1) {
        this.inner.ra = value$$1;
      }
    }, {
      key: "fp",
      get: function get() {
        return this.stack.fp;
      },
      set: function set(fp) {
        this.stack.fp = fp;
      }
    }, {
      key: "sp",
      get: function get() {
        return this.stack.sp;
      },
      set: function set(sp) {
        this.stack.sp = sp;
      }
    }, {
      key: "program",
      get: function get() {
        return this.runtime.program;
      }
    }, {
      key: "env",
      get: function get() {
        return this.runtime.env;
      }
    }]);
    return VM;
  }();

  _exports.LowLevelVM = VM;

  var TemplateIteratorImpl =
  /*#__PURE__*/
  function () {
    function TemplateIteratorImpl(vm) {
      this.vm = vm;
    }

    var _proto65 = TemplateIteratorImpl.prototype;

    _proto65.next = function next() {
      return this.vm.next();
    };

    return TemplateIteratorImpl;
  }();

  function renderMain(program, env, self, dynamicScope, builder, handle) {
    var vm = VM.initial(program, env, self, dynamicScope, builder, handle);
    return new TemplateIteratorImpl(vm);
  }
  /**
   * Returns a TemplateIterator configured to render a root component.
   */


  function renderComponent(program, env, builder, main, name, args) {
    if (args === void 0) {
      args = {};
    }

    var vm = VM.empty(program, env, builder, main);
    var resolver = vm.constants.resolver;
    var definition = resolveComponent(resolver, name, null);
    var manager = definition.manager,
        state = definition.state;
    var capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
    var invocation;

    if (hasStaticLayoutCapability(capabilities, manager)) {
      invocation = manager.getLayout(state, resolver);
    } else {
      throw new Error('Cannot invoke components with dynamic layouts as a root component.');
    } // Get a list of tuples of argument names and references, like
    // [['title', reference], ['name', reference]]


    var argList = Object.keys(args).map(function (key) {
      return [key, args[key]];
    });
    var blockNames = ['main', 'else', 'attrs']; // Prefix argument names with `@` symbol

    var argNames = argList.map(function (_ref60) {
      var name = _ref60[0];
      return "@" + name;
    });
    vm.pushFrame(); // Push blocks on to the stack, three stack values per block

    for (var i = 0; i < 3 * blockNames.length; i++) {
      vm.stack.push(null);
    }

    vm.stack.push(null); // For each argument, push its backing reference on to the stack

    argList.forEach(function (_ref61) {
      var reference = _ref61[1];
      vm.stack.push(reference);
    }); // Configure VM based on blocks and args just pushed on to the stack.

    vm.args.setup(vm.stack, argNames, blockNames, 0, false); // Needed for the Op.Main opcode: arguments, component invocation object, and
    // component definition.

    vm.stack.push(vm.args);
    vm.stack.push(invocation);
    vm.stack.push(definition);
    return new TemplateIteratorImpl(vm);
  }

  var DynamicVarReference =
  /*#__PURE__*/
  function () {
    function DynamicVarReference(scope, nameRef) {
      this.scope = scope;
      this.nameRef = nameRef;
      var varTag = this.varTag = (0, _reference2.createUpdatableTag)();
      this.tag = (0, _reference2.combine)([nameRef.tag, varTag]);
    }

    var _proto66 = DynamicVarReference.prototype;

    _proto66.value = function value() {
      return this.getVar().value();
    };

    _proto66.get = function get(key) {
      return this.getVar().get(key);
    };

    _proto66.getVar = function getVar() {
      var name = String(this.nameRef.value());
      var ref = this.scope.get(name);
      (0, _reference2.update)(this.varTag, ref.tag);
      return ref;
    };

    return DynamicVarReference;
  }();

  function getDynamicVar(vm, args) {
    var scope = vm.dynamicScope();
    var nameRef = args.positional.at(0);
    return new DynamicVarReference(scope, nameRef);
  }
  /** @internal */


  var DEFAULT_CAPABILITIES = {
    dynamicLayout: true,
    dynamicTag: true,
    prepareArgs: true,
    createArgs: true,
    attributeHook: false,
    elementHook: false,
    dynamicScope: true,
    createCaller: false,
    updateHook: true,
    createInstance: true
  };
  _exports.DEFAULT_CAPABILITIES = DEFAULT_CAPABILITIES;
  var MINIMAL_CAPABILITIES = {
    dynamicLayout: false,
    dynamicTag: false,
    prepareArgs: false,
    createArgs: false,
    attributeHook: false,
    elementHook: false,
    dynamicScope: false,
    createCaller: false,
    updateHook: false,
    createInstance: false
  };
  _exports.MINIMAL_CAPABILITIES = MINIMAL_CAPABILITIES;
  var SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
  _exports.SERIALIZATION_FIRST_NODE_STRING = SERIALIZATION_FIRST_NODE_STRING;

  function isSerializationFirstNode(node) {
    return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
  }

  var RehydratingCursor =
  /*#__PURE__*/
  function (_Cursor) {
    (0, _emberBabel.inheritsLoose)(RehydratingCursor, _Cursor);

    function RehydratingCursor(element, nextSibling, startingBlockDepth) {
      var _this20;

      _this20 = _Cursor.call(this, element, nextSibling) || this;
      _this20.startingBlockDepth = startingBlockDepth;
      _this20.candidate = null;
      _this20.injectedOmittedNode = false;
      _this20.openBlockDepth = startingBlockDepth - 1;
      return _this20;
    }

    return RehydratingCursor;
  }(Cursor);

  var RehydrateBuilder =
  /*#__PURE__*/
  function (_NewElementBuilder) {
    (0, _emberBabel.inheritsLoose)(RehydrateBuilder, _NewElementBuilder);

    // private candidate: Option<Simple.Node> = null;
    function RehydrateBuilder(env, parentNode, nextSibling) {
      var _this21;

      _this21 = _NewElementBuilder.call(this, env, parentNode, nextSibling) || this;
      _this21.unmatchedAttributes = null;
      _this21.blockDepth = 0;
      if (nextSibling) throw new Error('Rehydration with nextSibling not supported');
      var node = _this21.currentCursor.element.firstChild;

      while (node !== null) {
        if (isComment(node) && isSerializationFirstNode(node)) {
          break;
        }

        node = node.nextSibling;
      }

      _this21.candidate = node;
      return _this21;
    }

    var _proto67 = RehydrateBuilder.prototype;

    _proto67.pushElement = function pushElement(element, nextSibling) {
      var _this$blockDepth = this.blockDepth,
          blockDepth = _this$blockDepth === void 0 ? 0 : _this$blockDepth;
      var cursor = new RehydratingCursor(element, nextSibling, blockDepth);
      var currentCursor = this.currentCursor;

      if (currentCursor) {
        if (currentCursor.candidate) {
          /**
           * <div>   <---------------  currentCursor.element
           *   <!--%+b:1%-->
           *   <div> <---------------  currentCursor.candidate -> cursor.element
           *     <!--%+b:2%--> <-  currentCursor.candidate.firstChild -> cursor.candidate
           *     Foo
           *     <!--%-b:2%-->
           *   </div>
           *   <!--%-b:1%-->  <--  becomes currentCursor.candidate
           */
          // where to rehydrate from if we are in rehydration mode
          cursor.candidate = element.firstChild; // where to continue when we pop

          currentCursor.candidate = element.nextSibling;
        }
      }

      this.cursorStack.push(cursor);
    };

    _proto67.clearMismatch = function clearMismatch(candidate) {
      var current = candidate;
      var currentCursor = this.currentCursor;

      if (currentCursor !== null) {
        var openBlockDepth = currentCursor.openBlockDepth;

        if (openBlockDepth >= currentCursor.startingBlockDepth) {
          while (current && !(isComment(current) && getCloseBlockDepth(current) === openBlockDepth)) {
            current = this.remove(current);
          }
        } else {
          while (current !== null) {
            current = this.remove(current);
          }
        } // current cursor parentNode should be openCandidate if element
        // or openCandidate.parentNode if comment


        currentCursor.nextSibling = current; // disable rehydration until we popElement or closeBlock for openBlockDepth

        currentCursor.candidate = null;
      }
    };

    _proto67.__openBlock = function __openBlock() {
      var currentCursor = this.currentCursor;
      if (currentCursor === null) return;
      var blockDepth = this.blockDepth;
      this.blockDepth++;
      var candidate = currentCursor.candidate;
      if (candidate === null) return;
      var tagName = currentCursor.element.tagName;

      if (isComment(candidate) && getOpenBlockDepth(candidate) === blockDepth) {
        currentCursor.candidate = this.remove(candidate);
        currentCursor.openBlockDepth = blockDepth;
      } else if (tagName !== 'TITLE' && tagName !== 'SCRIPT' && tagName !== 'STYLE') {
        this.clearMismatch(candidate);
      }
    };

    _proto67.__closeBlock = function __closeBlock() {
      var currentCursor = this.currentCursor;
      if (currentCursor === null) return; // openBlock is the last rehydrated open block

      var openBlockDepth = currentCursor.openBlockDepth; // this currently is the expected next open block depth

      this.blockDepth--;
      var candidate = currentCursor.candidate; // rehydrating

      if (candidate !== null) {
        if (isComment(candidate) && getCloseBlockDepth(candidate) === openBlockDepth) {
          currentCursor.candidate = this.remove(candidate);
          currentCursor.openBlockDepth--;
        } else {
          this.clearMismatch(candidate);
        } // if the openBlockDepth matches the blockDepth we just closed to
        // then restore rehydration

      }

      if (currentCursor.openBlockDepth === this.blockDepth) {
        currentCursor.candidate = this.remove(currentCursor.nextSibling);
        currentCursor.openBlockDepth--;
      }
    };

    _proto67.__appendNode = function __appendNode(node) {
      var candidate = this.candidate; // This code path is only used when inserting precisely one node. It needs more
      // comparison logic, but we can probably lean on the cases where this code path
      // is actually used.

      if (candidate) {
        return candidate;
      } else {
        return _NewElementBuilder.prototype.__appendNode.call(this, node);
      }
    };

    _proto67.__appendHTML = function __appendHTML(html) {
      var candidateBounds = this.markerBounds();

      if (candidateBounds) {
        var first = candidateBounds.firstNode();
        var last = candidateBounds.lastNode();
        var newBounds = new ConcreteBounds(this.element, first.nextSibling, last.previousSibling);
        var possibleEmptyMarker = this.remove(first);
        this.remove(last);

        if (possibleEmptyMarker !== null && isEmpty$1(possibleEmptyMarker)) {
          this.candidate = this.remove(possibleEmptyMarker);

          if (this.candidate !== null) {
            this.clearMismatch(this.candidate);
          }
        }

        return newBounds;
      } else {
        return _NewElementBuilder.prototype.__appendHTML.call(this, html);
      }
    };

    _proto67.remove = function remove(node) {
      var element = node.parentNode;
      var next = node.nextSibling;
      element.removeChild(node);
      return next;
    };

    _proto67.markerBounds = function markerBounds() {
      var _candidate = this.candidate;

      if (_candidate && isMarker(_candidate)) {
        var first = _candidate;
        var last = first.nextSibling;

        while (last && !isMarker(last)) {
          last = last.nextSibling;
        }

        return new ConcreteBounds(this.element, first, last);
      } else {
        return null;
      }
    };

    _proto67.__appendText = function __appendText(string) {
      var candidate = this.candidate;

      if (candidate) {
        if (isTextNode(candidate)) {
          if (candidate.nodeValue !== string) {
            candidate.nodeValue = string;
          }

          this.candidate = candidate.nextSibling;
          return candidate;
        } else if (candidate && (isSeparator(candidate) || isEmpty$1(candidate))) {
          this.candidate = candidate.nextSibling;
          this.remove(candidate);
          return this.__appendText(string);
        } else if (isEmpty$1(candidate)) {
          var next = this.remove(candidate);
          this.candidate = next;
          var text = this.dom.createTextNode(string);
          this.dom.insertBefore(this.element, text, next);
          return text;
        } else {
          this.clearMismatch(candidate);
          return _NewElementBuilder.prototype.__appendText.call(this, string);
        }
      } else {
        return _NewElementBuilder.prototype.__appendText.call(this, string);
      }
    };

    _proto67.__appendComment = function __appendComment(string) {
      var _candidate = this.candidate;

      if (_candidate && isComment(_candidate)) {
        if (_candidate.nodeValue !== string) {
          _candidate.nodeValue = string;
        }

        this.candidate = _candidate.nextSibling;
        return _candidate;
      } else if (_candidate) {
        this.clearMismatch(_candidate);
      }

      return _NewElementBuilder.prototype.__appendComment.call(this, string);
    };

    _proto67.__openElement = function __openElement(tag) {
      var _candidate = this.candidate;

      if (_candidate && isElement(_candidate) && isSameNodeType(_candidate, tag)) {
        this.unmatchedAttributes = [].slice.call(_candidate.attributes);
        return _candidate;
      } else if (_candidate) {
        if (isElement(_candidate) && _candidate.tagName === 'TBODY') {
          this.pushElement(_candidate, null);
          this.currentCursor.injectedOmittedNode = true;
          return this.__openElement(tag);
        }

        this.clearMismatch(_candidate);
      }

      return _NewElementBuilder.prototype.__openElement.call(this, tag);
    };

    _proto67.__setAttribute = function __setAttribute(name, value$$1, namespace) {
      var unmatched = this.unmatchedAttributes;

      if (unmatched) {
        var attr = findByName(unmatched, name);

        if (attr) {
          if (attr.value !== value$$1) {
            attr.value = value$$1;
          }

          unmatched.splice(unmatched.indexOf(attr), 1);
          return;
        }
      }

      return _NewElementBuilder.prototype.__setAttribute.call(this, name, value$$1, namespace);
    };

    _proto67.__setProperty = function __setProperty(name, value$$1) {
      var unmatched = this.unmatchedAttributes;

      if (unmatched) {
        var attr = findByName(unmatched, name);

        if (attr) {
          if (attr.value !== value$$1) {
            attr.value = value$$1;
          }

          unmatched.splice(unmatched.indexOf(attr), 1);
          return;
        }
      }

      return _NewElementBuilder.prototype.__setProperty.call(this, name, value$$1);
    };

    _proto67.__flushElement = function __flushElement(parent, constructing) {
      var unmatched = this.unmatchedAttributes;

      if (unmatched) {
        for (var i = 0; i < unmatched.length; i++) {
          this.constructing.removeAttribute(unmatched[i].name);
        }

        this.unmatchedAttributes = null;
      } else {
        _NewElementBuilder.prototype.__flushElement.call(this, parent, constructing);
      }
    };

    _proto67.willCloseElement = function willCloseElement() {
      var candidate = this.candidate,
          currentCursor = this.currentCursor;

      if (candidate !== null) {
        this.clearMismatch(candidate);
      }

      if (currentCursor && currentCursor.injectedOmittedNode) {
        this.popElement();
      }

      _NewElementBuilder.prototype.willCloseElement.call(this);
    };

    _proto67.getMarker = function getMarker(element, guid) {
      var marker = element.querySelector("script[glmr=\"" + guid + "\"]");

      if (marker) {
        return marker;
      }

      throw new Error('Cannot find serialized cursor for `in-element`');
    };

    _proto67.__pushRemoteElement = function __pushRemoteElement(element, cursorId, nextSibling) {
      if (nextSibling === void 0) {
        nextSibling = null;
      }

      var marker = this.getMarker(element, cursorId);

      if (marker.parentNode === element) {
        var currentCursor = this.currentCursor;
        var candidate = currentCursor.candidate;
        this.pushElement(element, nextSibling);
        currentCursor.candidate = candidate;
        this.candidate = this.remove(marker);
        var tracker = new RemoteBlockTracker(element);
        this.pushBlockTracker(tracker, true);
      }
    };

    _proto67.didAppendBounds = function didAppendBounds(bounds) {
      _NewElementBuilder.prototype.didAppendBounds.call(this, bounds);

      if (this.candidate) {
        var last = bounds.lastNode();
        this.candidate = last && last.nextSibling;
      }

      return bounds;
    };

    (0, _emberBabel.createClass)(RehydrateBuilder, [{
      key: "currentCursor",
      get: function get() {
        return this.cursorStack.current;
      }
    }, {
      key: "candidate",
      get: function get() {
        if (this.currentCursor) {
          return this.currentCursor.candidate;
        }

        return null;
      },
      set: function set(node) {
        this.currentCursor.candidate = node;
      }
    }]);
    return RehydrateBuilder;
  }(NewElementBuilder);

  _exports.RehydrateBuilder = RehydrateBuilder;

  function isTextNode(node) {
    return node.nodeType === 3;
  }

  function isComment(node) {
    return node.nodeType === 8;
  }

  function getOpenBlockDepth(node) {
    var boundsDepth = node.nodeValue.match(/^%\+b:(\d+)%$/);

    if (boundsDepth && boundsDepth[1]) {
      return Number(boundsDepth[1]);
    } else {
      return null;
    }
  }

  function getCloseBlockDepth(node) {
    var boundsDepth = node.nodeValue.match(/^%\-b:(\d+)%$/);

    if (boundsDepth && boundsDepth[1]) {
      return Number(boundsDepth[1]);
    } else {
      return null;
    }
  }

  function isElement(node) {
    return node.nodeType === 1;
  }

  function isMarker(node) {
    return node.nodeType === 8 && node.nodeValue === '%glmr%';
  }

  function isSeparator(node) {
    return node.nodeType === 8 && node.nodeValue === '%|%';
  }

  function isEmpty$1(node) {
    return node.nodeType === 8 && node.nodeValue === '% %';
  }

  function isSameNodeType(candidate, tag) {
    if (candidate.namespaceURI === SVG_NAMESPACE) {
      return candidate.tagName === tag;
    }

    return candidate.tagName === tag.toUpperCase();
  }

  function findByName(array, name) {
    for (var i = 0; i < array.length; i++) {
      var attr = array[i];
      if (attr.name === name) return attr;
    }

    return undefined;
  }

  function rehydrationBuilder(env, cursor) {
    return RehydrateBuilder.forInitialRender(env, cursor);
  }
});