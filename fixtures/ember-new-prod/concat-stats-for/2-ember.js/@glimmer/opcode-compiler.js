define("@glimmer/opcode-compiler", ["exports", "@ember/polyfills", "ember-babel", "@glimmer/util", "@glimmer/vm", "@glimmer/wire-format", "@glimmer/encoder", "@glimmer/program"], function (_exports, _polyfills, _emberBabel, _util, _vm, _wireFormat, _encoder, _program) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.compile = compile;
  _exports.templateFactory = templateFactory;
  _exports.debug = debug;
  _exports.debugSlice = debugSlice;
  _exports.logOpcode = logOpcode;
  _exports.PLACEHOLDER_HANDLE = _exports.WrappedBuilder = _exports.PartialDefinition = _exports.StdOpcodeBuilder = _exports.OpcodeBuilder = _exports.EagerOpcodeBuilder = _exports.LazyOpcodeBuilder = _exports.CompilableProgram = _exports.CompilableBlock = _exports.debugCompiler = _exports.AbstractCompiler = _exports.LazyCompiler = _exports.Macros = _exports.ATTRS_BLOCK = void 0;
  var PLACEHOLDER_HANDLE = -1;
  _exports.PLACEHOLDER_HANDLE = PLACEHOLDER_HANDLE;
  var Ops$1;

  (function (Ops$$1) {
    Ops$$1[Ops$$1["OpenComponentElement"] = 0] = "OpenComponentElement";
    Ops$$1[Ops$$1["DidCreateElement"] = 1] = "DidCreateElement";
    Ops$$1[Ops$$1["DidRenderLayout"] = 2] = "DidRenderLayout";
    Ops$$1[Ops$$1["Debugger"] = 3] = "Debugger";
  })(Ops$1 || (Ops$1 = {}));

  var Ops$2 = _wireFormat.Ops;
  var ATTRS_BLOCK = '&attrs';
  _exports.ATTRS_BLOCK = ATTRS_BLOCK;

  var Compilers =
  /*#__PURE__*/
  function () {
    function Compilers(offset) {
      if (offset === void 0) {
        offset = 0;
      }

      this.offset = offset;
      this.names = (0, _util.dict)();
      this.funcs = [];
    }

    var _proto = Compilers.prototype;

    _proto.add = function add(name, func) {
      this.funcs.push(func);
      this.names[name] = this.funcs.length - 1;
    };

    _proto.compile = function compile(sexp, builder) {
      var name = sexp[this.offset];
      var index = this.names[name];
      var func = this.funcs[index];
      func(sexp, builder);
    };

    return Compilers;
  }();

  var _statementCompiler;

  function statementCompiler() {
    if (_statementCompiler) {
      return _statementCompiler;
    }

    var STATEMENTS = _statementCompiler = new Compilers();
    STATEMENTS.add(Ops$2.Text, function (sexp, builder) {
      builder.text(sexp[1]);
    });
    STATEMENTS.add(Ops$2.Comment, function (sexp, builder) {
      builder.comment(sexp[1]);
    });
    STATEMENTS.add(Ops$2.CloseElement, function (_sexp, builder) {
      builder.closeElement();
    });
    STATEMENTS.add(Ops$2.FlushElement, function (_sexp, builder) {
      builder.flushElement();
    });
    STATEMENTS.add(Ops$2.Modifier, function (sexp, builder) {
      var referrer = builder.referrer;
      var name = sexp[1],
          params = sexp[2],
          hash = sexp[3];
      var handle = builder.compiler.resolveModifier(name, referrer);

      if (handle !== null) {
        builder.modifier(handle, params, hash);
      } else {
        throw new Error("Compile Error " + name + " is not a modifier: Helpers may not be used in the element form.");
      }
    });
    STATEMENTS.add(Ops$2.StaticAttr, function (sexp, builder) {
      var name = sexp[1],
          value = sexp[2],
          namespace = sexp[3];
      builder.staticAttr(name, namespace, value);
    });
    STATEMENTS.add(Ops$2.DynamicAttr, function (sexp, builder) {
      dynamicAttr(sexp, false, builder);
    });
    STATEMENTS.add(Ops$2.ComponentAttr, function (sexp, builder) {
      componentAttr(sexp, false, builder);
    });
    STATEMENTS.add(Ops$2.TrustingAttr, function (sexp, builder) {
      dynamicAttr(sexp, true, builder);
    });
    STATEMENTS.add(Ops$2.TrustingComponentAttr, function (sexp, builder) {
      componentAttr(sexp, true, builder);
    });
    STATEMENTS.add(Ops$2.OpenElement, function (sexp, builder) {
      var tag = sexp[1],
          simple = sexp[2];

      if (!simple) {
        builder.putComponentOperations();
      }

      builder.openPrimitiveElement(tag);
    });
    STATEMENTS.add(Ops$2.DynamicComponent, function (sexp, builder) {
      var definition = sexp[1],
          attrs = sexp[2],
          args = sexp[3],
          template = sexp[4];
      var block = builder.template(template);
      var attrsBlock = null;

      if (attrs.length > 0) {
        attrsBlock = builder.inlineBlock({
          statements: attrs,
          parameters: _util.EMPTY_ARRAY
        });
      }

      builder.dynamicComponent(definition, attrsBlock, null, args, false, block, null);
    });
    STATEMENTS.add(Ops$2.Component, function (sexp, builder) {
      var tag = sexp[1],
          attrs = sexp[2],
          args = sexp[3],
          block = sexp[4];
      var referrer = builder.referrer;

      var _builder$compiler$res = builder.compiler.resolveLayoutForTag(tag, referrer),
          handle = _builder$compiler$res.handle,
          capabilities = _builder$compiler$res.capabilities,
          compilable = _builder$compiler$res.compilable;

      if (handle !== null && capabilities !== null) {
        var attrsBlock = null;

        if (attrs.length > 0) {
          attrsBlock = builder.inlineBlock({
            statements: attrs,
            parameters: _util.EMPTY_ARRAY
          });
        }

        var child = builder.template(block);

        if (compilable) {
          builder.pushComponentDefinition(handle);
          builder.invokeStaticComponent(capabilities, compilable, attrsBlock, null, args, false, child && child);
        } else {
          builder.pushComponentDefinition(handle);
          builder.invokeComponent(capabilities, attrsBlock, null, args, false, child && child);
        }
      } else {
        throw new Error("Compile Error: Cannot find component " + tag);
      }
    });
    STATEMENTS.add(Ops$2.Partial, function (sexp, builder) {
      var name = sexp[1],
          evalInfo = sexp[2];
      var referrer = builder.referrer;
      builder.replayableIf({
        args: function args() {
          builder.expr(name);
          builder.dup();
          return 2;
        },
        ifTrue: function ifTrue() {
          builder.invokePartial(referrer, builder.evalSymbols(), evalInfo);
          builder.popScope();
          builder.popFrame(); // FIXME: WAT
        }
      });
    });
    STATEMENTS.add(Ops$2.Yield, function (sexp, builder) {
      var to = sexp[1],
          params = sexp[2];
      builder.yield(to, params);
    });
    STATEMENTS.add(Ops$2.AttrSplat, function (sexp, builder) {
      var to = sexp[1];
      builder.yield(to, []);
    });
    STATEMENTS.add(Ops$2.Debugger, function (sexp, builder) {
      var evalInfo = sexp[1];
      builder.debugger(builder.evalSymbols(), evalInfo);
    });
    STATEMENTS.add(Ops$2.ClientSideStatement, function (sexp, builder) {
      CLIENT_SIDE.compile(sexp, builder);
    });
    STATEMENTS.add(Ops$2.Append, function (sexp, builder) {
      var value = sexp[1],
          trusting = sexp[2];
      var returned = builder.compileInline(sexp) || value;
      if (returned === true) return;
      builder.guardedAppend(value, trusting);
    });
    STATEMENTS.add(Ops$2.Block, function (sexp, builder) {
      var name = sexp[1],
          params = sexp[2],
          hash = sexp[3],
          _template = sexp[4],
          _inverse = sexp[5];
      var template = builder.template(_template);
      var inverse = builder.template(_inverse);
      var templateBlock = template && template;
      var inverseBlock = inverse && inverse;
      builder.compileBlock(name, params, hash, templateBlock, inverseBlock);
    });
    var CLIENT_SIDE = new Compilers(1);
    CLIENT_SIDE.add(Ops$1.OpenComponentElement, function (sexp, builder) {
      builder.putComponentOperations();
      builder.openPrimitiveElement(sexp[2]);
    });
    CLIENT_SIDE.add(Ops$1.DidCreateElement, function (_sexp, builder) {
      builder.didCreateElement(_vm.Register.s0);
    });
    CLIENT_SIDE.add(Ops$1.Debugger, function () {
      // tslint:disable-next-line:no-debugger
      debugger;
    });
    CLIENT_SIDE.add(Ops$1.DidRenderLayout, function (_sexp, builder) {
      builder.didRenderLayout(_vm.Register.s0);
    });
    return STATEMENTS;
  }

  function componentAttr(sexp, trusting, builder) {
    var name = sexp[1],
        value = sexp[2],
        namespace = sexp[3];
    builder.expr(value);

    if (namespace) {
      builder.componentAttr(name, namespace, trusting);
    } else {
      builder.componentAttr(name, null, trusting);
    }
  }

  function dynamicAttr(sexp, trusting, builder) {
    var name = sexp[1],
        value = sexp[2],
        namespace = sexp[3];
    builder.expr(value);

    if (namespace) {
      builder.dynamicAttr(name, namespace, trusting);
    } else {
      builder.dynamicAttr(name, null, trusting);
    }
  }

  var _expressionCompiler;

  function expressionCompiler() {
    if (_expressionCompiler) {
      return _expressionCompiler;
    }

    var EXPRESSIONS = _expressionCompiler = new Compilers();
    EXPRESSIONS.add(Ops$2.Unknown, function (sexp, builder) {
      var compiler = builder.compiler,
          referrer = builder.referrer,
          asPartial = builder.containingLayout.asPartial;
      var name = sexp[1];
      var handle = compiler.resolveHelper(name, referrer);

      if (handle !== null) {
        builder.helper(handle, null, null);
      } else if (asPartial) {
        builder.resolveMaybeLocal(name);
      } else {
        builder.getVariable(0);
        builder.getProperty(name);
      }
    });
    EXPRESSIONS.add(Ops$2.Concat, function (sexp, builder) {
      var parts = sexp[1];

      for (var i = 0; i < parts.length; i++) {
        builder.expr(parts[i]);
      }

      builder.concat(parts.length);
    });
    EXPRESSIONS.add(Ops$2.Helper, function (sexp, builder) {
      var compiler = builder.compiler,
          referrer = builder.referrer;
      var name = sexp[1],
          params = sexp[2],
          hash = sexp[3]; // TODO: triage this in the WF compiler

      if (name === 'component') {
        var definition = params[0],
            restArgs = params.slice(1);
        builder.curryComponent(definition, restArgs, hash, true);
        return;
      }

      var handle = compiler.resolveHelper(name, referrer);

      if (handle !== null) {
        builder.helper(handle, params, hash);
      } else {
        throw new Error("Compile Error: " + name + " is not a helper");
      }
    });
    EXPRESSIONS.add(Ops$2.Get, function (sexp, builder) {
      var head = sexp[1],
          path = sexp[2];
      builder.getVariable(head);

      for (var i = 0; i < path.length; i++) {
        builder.getProperty(path[i]);
      }
    });
    EXPRESSIONS.add(Ops$2.MaybeLocal, function (sexp, builder) {
      var path = sexp[1];

      if (builder.containingLayout.asPartial) {
        var head = path[0];
        path = path.slice(1);
        builder.resolveMaybeLocal(head);
      } else {
        builder.getVariable(0);
      }

      for (var i = 0; i < path.length; i++) {
        builder.getProperty(path[i]);
      }
    });
    EXPRESSIONS.add(Ops$2.Undefined, function (_sexp, builder) {
      return builder.pushPrimitiveReference(undefined);
    });
    EXPRESSIONS.add(Ops$2.HasBlock, function (sexp, builder) {
      builder.hasBlock(sexp[1]);
    });
    EXPRESSIONS.add(Ops$2.HasBlockParams, function (sexp, builder) {
      builder.hasBlockParams(sexp[1]);
    });
    return EXPRESSIONS;
  }

  var Macros = function Macros() {
    var _populateBuiltins = populateBuiltins(),
        blocks = _populateBuiltins.blocks,
        inlines = _populateBuiltins.inlines;

    this.blocks = blocks;
    this.inlines = inlines;
  };

  _exports.Macros = Macros;

  var Blocks =
  /*#__PURE__*/
  function () {
    function Blocks() {
      this.names = (0, _util.dict)();
      this.funcs = [];
    }

    var _proto2 = Blocks.prototype;

    _proto2.add = function add(name, func) {
      this.funcs.push(func);
      this.names[name] = this.funcs.length - 1;
    };

    _proto2.addMissing = function addMissing(func) {
      this.missing = func;
    };

    _proto2.compile = function compile(name, params, hash, template, inverse, builder) {
      var index = this.names[name];

      if (index === undefined) {
        var func = this.missing;
        var handled = func(name, params, hash, template, inverse, builder);
      } else {
        var _func = this.funcs[index];

        _func(params, hash, template, inverse, builder);
      }
    };

    return Blocks;
  }();

  var Inlines =
  /*#__PURE__*/
  function () {
    function Inlines() {
      this.names = (0, _util.dict)();
      this.funcs = [];
    }

    var _proto3 = Inlines.prototype;

    _proto3.add = function add(name, func) {
      this.funcs.push(func);
      this.names[name] = this.funcs.length - 1;
    };

    _proto3.addMissing = function addMissing(func) {
      this.missing = func;
    };

    _proto3.compile = function compile(sexp, builder) {
      var value = sexp[1]; // TODO: Fix this so that expression macros can return
      // things like components, so that {{component foo}}
      // is the same as {{(component foo)}}

      if (!Array.isArray(value)) return ['expr', value];
      var name;
      var params;
      var hash;

      if (value[0] === Ops$2.Helper) {
        name = value[1];
        params = value[2];
        hash = value[3];
      } else if (value[0] === Ops$2.Unknown) {
        name = value[1];
        params = hash = null;
      } else {
        return ['expr', value];
      }

      var index = this.names[name];

      if (index === undefined && this.missing) {
        var func = this.missing;
        var returned = func(name, params, hash, builder);
        return returned === false ? ['expr', value] : returned;
      } else if (index !== undefined) {
        var _func2 = this.funcs[index];

        var _returned = _func2(name, params, hash, builder);

        return _returned === false ? ['expr', value] : _returned;
      } else {
        return ['expr', value];
      }
    };

    return Inlines;
  }();

  function populateBuiltins(blocks, inlines) {
    if (blocks === void 0) {
      blocks = new Blocks();
    }

    if (inlines === void 0) {
      inlines = new Inlines();
    }

    blocks.add('if', function (params, _hash, template, inverse, builder) {
      //        PutArgs
      //        Test(Environment)
      //        Enter(BEGIN, END)
      // BEGIN: Noop
      //        JumpUnless(ELSE)
      //        Evaluate(default)
      //        Jump(END)
      // ELSE:  Noop
      //        Evalulate(inverse)
      // END:   Noop
      //        Exit
      if (!params || params.length !== 1) {
        throw new Error("SYNTAX ERROR: #if requires a single argument");
      }

      builder.replayableIf({
        args: function args() {
          builder.expr(params[0]);
          builder.toBoolean();
          return 1;
        },
        ifTrue: function ifTrue() {
          builder.invokeStaticBlock(template);
        },
        ifFalse: function ifFalse() {
          if (inverse) {
            builder.invokeStaticBlock(inverse);
          }
        }
      });
    });
    blocks.add('unless', function (params, _hash, template, inverse, builder) {
      //        PutArgs
      //        Test(Environment)
      //        Enter(BEGIN, END)
      // BEGIN: Noop
      //        JumpUnless(ELSE)
      //        Evaluate(default)
      //        Jump(END)
      // ELSE:  Noop
      //        Evalulate(inverse)
      // END:   Noop
      //        Exit
      if (!params || params.length !== 1) {
        throw new Error("SYNTAX ERROR: #unless requires a single argument");
      }

      builder.replayableIf({
        args: function args() {
          builder.expr(params[0]);
          builder.toBoolean();
          return 1;
        },
        ifTrue: function ifTrue() {
          if (inverse) {
            builder.invokeStaticBlock(inverse);
          }
        },
        ifFalse: function ifFalse() {
          builder.invokeStaticBlock(template);
        }
      });
    });
    blocks.add('with', function (params, _hash, template, inverse, builder) {
      //        PutArgs
      //        Test(Environment)
      //        Enter(BEGIN, END)
      // BEGIN: Noop
      //        JumpUnless(ELSE)
      //        Evaluate(default)
      //        Jump(END)
      // ELSE:  Noop
      //        Evalulate(inverse)
      // END:   Noop
      //        Exit
      if (!params || params.length !== 1) {
        throw new Error("SYNTAX ERROR: #with requires a single argument");
      }

      builder.replayableIf({
        args: function args() {
          builder.expr(params[0]);
          builder.dup();
          builder.toBoolean();
          return 2;
        },
        ifTrue: function ifTrue() {
          builder.invokeStaticBlock(template, 1);
        },
        ifFalse: function ifFalse() {
          if (inverse) {
            builder.invokeStaticBlock(inverse);
          }
        }
      });
    });
    blocks.add('each', function (params, hash, template, inverse, builder) {
      //         Enter(BEGIN, END)
      // BEGIN:  Noop
      //         PutArgs
      //         PutIterable
      //         JumpUnless(ELSE)
      //         EnterList(BEGIN2, END2)
      // ITER:   Noop
      //         NextIter(BREAK)
      // BEGIN2: Noop
      //         PushChildScope
      //         Evaluate(default)
      //         PopScope
      // END2:   Noop
      //         Exit
      //         Jump(ITER)
      // BREAK:  Noop
      //         ExitList
      //         Jump(END)
      // ELSE:   Noop
      //         Evalulate(inverse)
      // END:    Noop
      //         Exit
      builder.replayable({
        args: function args() {
          if (hash && hash[0][0] === 'key') {
            builder.expr(hash[1][0]);
          } else {
            builder.pushPrimitiveReference(null);
          }

          builder.expr(params[0]);
          return 2;
        },
        body: function body() {
          builder.putIterator();
          builder.jumpUnless('ELSE');
          builder.pushFrame();
          builder.dup(_vm.Register.fp, 1);
          builder.returnTo('ITER');
          builder.enterList('BODY');
          builder.label('ITER');
          builder.iterate('BREAK');
          builder.label('BODY');
          builder.invokeStaticBlock(template, 2);
          builder.pop(2);
          builder.jump('FINALLY');
          builder.label('BREAK');
          builder.exitList();
          builder.popFrame();
          builder.jump('FINALLY');
          builder.label('ELSE');

          if (inverse) {
            builder.invokeStaticBlock(inverse);
          }
        }
      });
    });
    blocks.add('in-element', function (params, hash, template, _inverse, builder) {
      if (!params || params.length !== 1) {
        throw new Error("SYNTAX ERROR: #in-element requires a single argument");
      }

      builder.replayableIf({
        args: function args() {
          var keys = hash[0],
              values = hash[1];

          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (key === 'nextSibling' || key === 'guid') {
              builder.expr(values[i]);
            } else {
              throw new Error("SYNTAX ERROR: #in-element does not take a `" + keys[0] + "` option");
            }
          }

          builder.expr(params[0]);
          builder.dup();
          return 4;
        },
        ifTrue: function ifTrue() {
          builder.pushRemoteElement();
          builder.invokeStaticBlock(template);
          builder.popRemoteElement();
        }
      });
    });
    blocks.add('-with-dynamic-vars', function (_params, hash, template, _inverse, builder) {
      if (hash) {
        var names = hash[0],
            expressions = hash[1];
        builder.compileParams(expressions);
        builder.pushDynamicScope();
        builder.bindDynamicScope(names);
        builder.invokeStaticBlock(template);
        builder.popDynamicScope();
      } else {
        builder.invokeStaticBlock(template);
      }
    });
    blocks.add('component', function (_params, hash, template, inverse, builder) {
      var tag = _params[0];

      if (typeof tag === 'string') {
        var returned = builder.staticComponentHelper(_params[0], hash, template);
        if (returned) return;
      }

      var definition = _params[0],
          params = _params.slice(1);

      builder.dynamicComponent(definition, null, params, hash, true, template, inverse);
    });
    inlines.add('component', function (_name, _params, hash, builder) {
      var tag = _params && _params[0];

      if (typeof tag === 'string') {
        var returned = builder.staticComponentHelper(tag, hash, null);
        if (returned) return true;
      }

      var definition = _params[0],
          params = _params.slice(1);

      builder.dynamicComponent(definition, null, params, hash, true, null, null);
      return true;
    });
    return {
      blocks: blocks,
      inlines: inlines
    };
  }

  var PLACEHOLDER_HANDLE$1 = -1;

  var CompilableProgram =
  /*#__PURE__*/
  function () {
    function CompilableProgram(compiler, layout) {
      this.compiler = compiler;
      this.layout = layout;
      this.compiled = null;
    }

    var _proto4 = CompilableProgram.prototype;

    _proto4.compile = function compile() {
      if (this.compiled !== null) return this.compiled;
      this.compiled = PLACEHOLDER_HANDLE$1;
      var statements = this.layout.block.statements;
      return this.compiled = this.compiler.add(statements, this.layout);
    };

    (0, _emberBabel.createClass)(CompilableProgram, [{
      key: "symbolTable",
      get: function get() {
        return this.layout.block;
      }
    }]);
    return CompilableProgram;
  }();

  _exports.CompilableProgram = CompilableProgram;

  var CompilableBlock =
  /*#__PURE__*/
  function () {
    function CompilableBlock(compiler, parsed) {
      this.compiler = compiler;
      this.parsed = parsed;
      this.compiled = null;
    }

    var _proto5 = CompilableBlock.prototype;

    _proto5.compile = function compile() {
      if (this.compiled !== null) return this.compiled; // Track that compilation has started but not yet finished by temporarily
      // using a placeholder handle. In eager compilation mode, where compile()
      // may be called recursively, we use this as a signal that the handle cannot
      // be known synchronously and must be linked lazily.

      this.compiled = PLACEHOLDER_HANDLE$1;
      var _this$parsed = this.parsed,
          statements = _this$parsed.block.statements,
          containingLayout = _this$parsed.containingLayout;
      return this.compiled = this.compiler.add(statements, containingLayout);
    };

    (0, _emberBabel.createClass)(CompilableBlock, [{
      key: "symbolTable",
      get: function get() {
        return this.parsed.block;
      }
    }]);
    return CompilableBlock;
  }();

  _exports.CompilableBlock = CompilableBlock;

  function compile(statements, builder, compiler) {
    var sCompiler = statementCompiler();

    for (var i = 0; i < statements.length; i++) {
      sCompiler.compile(statements[i], builder);
    }

    var handle = builder.commit();
    return handle;
  }

  function debugSlice(program, start, end) {}

  function logOpcode(type, params) {
    var out = type;

    if (params) {
      var args = Object.keys(params).map(function (p) {
        return " " + p + "=" + json(params[p]);
      }).join('');
      out += args;
    }

    return "(" + out + ")";
  }

  function json(param) {}

  function debug(pos, c, op) {
    for (var _len = arguments.length, operands = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      operands[_key - 3] = arguments[_key];
    }

    var metadata = null;

    if (!metadata) {
      throw (0, _util.unreachable)("Missing Opcode Metadata for " + op);
    }

    var out = (0, _util.dict)();
    metadata.ops.forEach(function (operand, index) {
      var op = operands[index];

      switch (operand.type) {
        case 'to':
          out[operand.name] = pos + op;
          break;

        case 'i32':
        case 'symbol':
        case 'block':
          out[operand.name] = op;
          break;

        case 'handle':
          out[operand.name] = c.resolveHandle(op);
          break;

        case 'str':
          out[operand.name] = c.getString(op);
          break;

        case 'option-str':
          out[operand.name] = op ? c.getString(op) : null;
          break;

        case 'str-array':
          out[operand.name] = c.getStringArray(op);
          break;

        case 'array':
          out[operand.name] = c.getArray(op);
          break;

        case 'bool':
          out[operand.name] = !!op;
          break;

        case 'primitive':
          out[operand.name] = decodePrimitive(op, c);
          break;

        case 'register':
          out[operand.name] = _vm.Register[op];
          break;

        case 'serializable':
          out[operand.name] = c.getSerializable(op);
          break;

        case 'lazy-constant':
          out[operand.name] = c.getOther(op);
          break;
      }
    });
    return [metadata.name, out];
  }

  function decodePrimitive(primitive, constants) {
    var flag = primitive & 7; // 111

    var value = primitive >> 3;

    switch (flag) {
      case 0
      /* NUMBER */
      :
        return value;

      case 1
      /* FLOAT */
      :
        return constants.getNumber(value);

      case 2
      /* STRING */
      :
        return constants.getString(value);

      case 3
      /* BOOLEAN_OR_VOID */
      :
        switch (value) {
          case 0:
            return false;

          case 1:
            return true;

          case 2:
            return null;

          case 3:
            return undefined;
        }

      case 4
      /* NEGATIVE */
      :
      case 5
      /* BIG_NUM */
      :
        return constants.getNumber(value);

      default:
        throw (0, _util.unreachable)();
    }
  }

  var StdLib =
  /*#__PURE__*/
  function () {
    function StdLib(main, trustingGuardedAppend, cautiousGuardedAppend) {
      this.main = main;
      this.trustingGuardedAppend = trustingGuardedAppend;
      this.cautiousGuardedAppend = cautiousGuardedAppend;
    }

    StdLib.compile = function compile(compiler) {
      var main = this.std(compiler, function (b) {
        return b.main();
      });
      var trustingGuardedAppend = this.std(compiler, function (b) {
        return b.stdAppend(true);
      });
      var cautiousGuardedAppend = this.std(compiler, function (b) {
        return b.stdAppend(false);
      });
      return new StdLib(main, trustingGuardedAppend, cautiousGuardedAppend);
    };

    StdLib.std = function std(compiler, callback) {
      return StdOpcodeBuilder.build(compiler, callback);
    };

    var _proto6 = StdLib.prototype;

    _proto6.getAppend = function getAppend(trusting) {
      return trusting ? this.trustingGuardedAppend : this.cautiousGuardedAppend;
    };

    return StdLib;
  }();

  var AbstractCompiler =
  /*#__PURE__*/
  function () {
    function AbstractCompiler(macros, program, resolver) {
      this.macros = macros;
      this.program = program;
      this.resolver = resolver;
      this.initialize();
    }

    var _proto7 = AbstractCompiler.prototype;

    _proto7.initialize = function initialize() {
      this.stdLib = StdLib.compile(this);
    };

    _proto7.compileInline = function compileInline(sexp, builder) {
      var inlines = this.macros.inlines;
      return inlines.compile(sexp, builder);
    };

    _proto7.compileBlock = function compileBlock(name, params, hash, template, inverse, builder) {
      var blocks = this.macros.blocks;
      blocks.compile(name, params, hash, template, inverse, builder);
    };

    _proto7.add = function add(statements, containingLayout) {
      return compile(statements, this.builderFor(containingLayout), this);
    };

    _proto7.commit = function commit(scopeSize, buffer) {
      var heap = this.program.heap; // TODO: change the whole malloc API and do something more efficient

      var handle = heap.malloc();

      for (var i = 0; i < buffer.length; i++) {
        var value = buffer[i];

        if (typeof value === 'function') {
          heap.pushPlaceholder(value);
        } else {
          heap.push(value);
        }
      }

      heap.finishMalloc(handle, scopeSize);
      return handle;
    };

    _proto7.resolveLayoutForTag = function resolveLayoutForTag(tag, referrer) {
      var resolver = this.resolver;
      var handle = resolver.lookupComponentDefinition(tag, referrer);
      if (handle === null) return {
        handle: null,
        capabilities: null,
        compilable: null
      };
      return this.resolveLayoutForHandle(handle);
    };

    _proto7.resolveLayoutForHandle = function resolveLayoutForHandle(handle) {
      var resolver = this.resolver;
      var capabilities = resolver.getCapabilities(handle);
      var compilable = null;

      if (!capabilities.dynamicLayout) {
        compilable = resolver.getLayout(handle);
      }

      return {
        handle: handle,
        capabilities: capabilities,
        compilable: compilable
      };
    };

    _proto7.resolveModifier = function resolveModifier(name, referrer) {
      return this.resolver.lookupModifier(name, referrer);
    };

    _proto7.resolveHelper = function resolveHelper(name, referrer) {
      return this.resolver.lookupHelper(name, referrer);
    };

    (0, _emberBabel.createClass)(AbstractCompiler, [{
      key: "constants",
      get: function get() {
        return this.program.constants;
      }
    }]);
    return AbstractCompiler;
  }();

  _exports.AbstractCompiler = AbstractCompiler;
  var debugCompiler;
  _exports.debugCompiler = debugCompiler;

  var WrappedBuilder =
  /*#__PURE__*/
  function () {
    function WrappedBuilder(compiler, layout) {
      this.compiler = compiler;
      this.layout = layout;
      this.compiled = null;
      var block = layout.block;
      var symbols = block.symbols.slice(); // ensure ATTRS_BLOCK is always included (only once) in the list of symbols

      var attrsBlockIndex = symbols.indexOf(ATTRS_BLOCK);

      if (attrsBlockIndex === -1) {
        this.attrsBlockNumber = symbols.push(ATTRS_BLOCK);
      } else {
        this.attrsBlockNumber = attrsBlockIndex + 1;
      }

      this.symbolTable = {
        hasEval: block.hasEval,
        symbols: symbols
      };
    }

    var _proto8 = WrappedBuilder.prototype;

    _proto8.compile = function compile() {
      if (this.compiled !== null) return this.compiled; //========DYNAMIC
      //        PutValue(TagExpr)
      //        Test
      //        JumpUnless(BODY)
      //        PutComponentOperations
      //        OpenDynamicPrimitiveElement
      //        DidCreateElement
      //        ...attr statements...
      //        FlushElement
      // BODY:  Noop
      //        ...body statements...
      //        PutValue(TagExpr)
      //        Test
      //        JumpUnless(END)
      //        CloseElement
      // END:   Noop
      //        DidRenderLayout
      //        Exit
      //
      //========STATIC
      //        OpenPrimitiveElementOpcode
      //        DidCreateElement
      //        ...attr statements...
      //        FlushElement
      //        ...body statements...
      //        CloseElement
      //        DidRenderLayout
      //        Exit

      var compiler = this.compiler,
          layout = this.layout;
      var b = compiler.builderFor(layout);
      b.startLabels();
      b.fetch(_vm.Register.s1);
      b.getComponentTagName(_vm.Register.s0);
      b.primitiveReference();
      b.dup();
      b.load(_vm.Register.s1);
      b.jumpUnless('BODY');
      b.fetch(_vm.Register.s1);
      b.putComponentOperations();
      b.openDynamicElement();
      b.didCreateElement(_vm.Register.s0);
      b.yield(this.attrsBlockNumber, []);
      b.flushElement();
      b.label('BODY');
      b.invokeStaticBlock(blockFor(layout, compiler));
      b.fetch(_vm.Register.s1);
      b.jumpUnless('END');
      b.closeElement();
      b.label('END');
      b.load(_vm.Register.s1);
      b.stopLabels();
      var handle = b.commit();
      return this.compiled = handle;
    };

    return WrappedBuilder;
  }();

  _exports.WrappedBuilder = WrappedBuilder;

  function blockFor(layout, compiler) {
    return new CompilableBlock(compiler, {
      block: {
        statements: layout.block.statements,
        parameters: _util.EMPTY_ARRAY
      },
      containingLayout: layout
    });
  }

  var ComponentBuilder =
  /*#__PURE__*/
  function () {
    function ComponentBuilder(builder) {
      this.builder = builder;
    }

    var _proto9 = ComponentBuilder.prototype;

    _proto9.static = function _static(handle, args) {
      var params = args[0],
          hash = args[1],
          _default = args[2],
          inverse = args[3];
      var builder = this.builder;

      if (handle !== null) {
        var _builder$compiler$res2 = builder.compiler.resolveLayoutForHandle(handle),
            capabilities = _builder$compiler$res2.capabilities,
            compilable = _builder$compiler$res2.compilable;

        if (compilable) {
          builder.pushComponentDefinition(handle);
          builder.invokeStaticComponent(capabilities, compilable, null, params, hash, false, _default, inverse);
        } else {
          builder.pushComponentDefinition(handle);
          builder.invokeComponent(capabilities, null, params, hash, false, _default, inverse);
        }
      }
    };

    return ComponentBuilder;
  }();

  var Labels =
  /*#__PURE__*/
  function () {
    function Labels() {
      this.labels = (0, _util.dict)();
      this.targets = [];
    }

    var _proto10 = Labels.prototype;

    _proto10.label = function label(name, index) {
      this.labels[name] = index;
    };

    _proto10.target = function target(at, _target) {
      this.targets.push({
        at: at,
        target: _target
      });
    };

    _proto10.patch = function patch(encoder) {
      var targets = this.targets,
          labels = this.labels;

      for (var i = 0; i < targets.length; i++) {
        var _targets$i = targets[i],
            at = _targets$i.at,
            target = _targets$i.target;
        var address = labels[target] - at;
        encoder.patch(at, address);
      }
    };

    return Labels;
  }();

  var StdOpcodeBuilder =
  /*#__PURE__*/
  function () {
    function StdOpcodeBuilder(compiler, size) {
      if (size === void 0) {
        size = 0;
      }

      this.size = size;
      this.encoder = new _encoder.InstructionEncoder([]);
      this.labelsStack = new _util.Stack();
      this.compiler = compiler;
    }

    StdOpcodeBuilder.build = function build(compiler, callback) {
      var builder = new StdOpcodeBuilder(compiler);
      callback(builder);
      return builder.commit();
    };

    var _proto11 = StdOpcodeBuilder.prototype;

    _proto11.push = function push(name) {
      switch (arguments.length) {
        case 1:
          return this.encoder.encode(name, 0);

        case 2:
          return this.encoder.encode(name, 0, arguments[1]);

        case 3:
          return this.encoder.encode(name, 0, arguments[1], arguments[2]);

        default:
          return this.encoder.encode(name, 0, arguments[1], arguments[2], arguments[3]);
      }
    };

    _proto11.pushMachine = function pushMachine(name) {
      switch (arguments.length) {
        case 1:
          return this.encoder.encode(name, 1024
          /* MACHINE_MASK */
          );

        case 2:
          return this.encoder.encode(name, 1024
          /* MACHINE_MASK */
          , arguments[1]);

        case 3:
          return this.encoder.encode(name, 1024
          /* MACHINE_MASK */
          , arguments[1], arguments[2]);

        default:
          return this.encoder.encode(name, 1024
          /* MACHINE_MASK */
          , arguments[1], arguments[2], arguments[3]);
      }
    };

    _proto11.commit = function commit() {
      this.pushMachine(24
      /* Return */
      );
      return this.compiler.commit(this.size, this.encoder.buffer);
    };

    _proto11.reserve = function reserve(name) {
      this.encoder.encode(name, 0, -1);
    };

    _proto11.reserveWithOperand = function reserveWithOperand(name, operand) {
      this.encoder.encode(name, 0, -1, operand);
    };

    _proto11.reserveMachine = function reserveMachine(name) {
      this.encoder.encode(name, 1024
      /* MACHINE_MASK */
      , -1);
    } ///
    ;

    _proto11.main = function main() {
      this.push(68
      /* Main */
      , _vm.Register.s0);
      this.invokePreparedComponent(false, false, true);
    };

    _proto11.appendHTML = function appendHTML() {
      this.push(28
      /* AppendHTML */
      );
    };

    _proto11.appendSafeHTML = function appendSafeHTML() {
      this.push(29
      /* AppendSafeHTML */
      );
    };

    _proto11.appendDocumentFragment = function appendDocumentFragment() {
      this.push(30
      /* AppendDocumentFragment */
      );
    };

    _proto11.appendNode = function appendNode() {
      this.push(31
      /* AppendNode */
      );
    };

    _proto11.appendText = function appendText() {
      this.push(32
      /* AppendText */
      );
    };

    _proto11.beginComponentTransaction = function beginComponentTransaction() {
      this.push(91
      /* BeginComponentTransaction */
      );
    };

    _proto11.commitComponentTransaction = function commitComponentTransaction() {
      this.push(92
      /* CommitComponentTransaction */
      );
    };

    _proto11.pushDynamicScope = function pushDynamicScope() {
      this.push(44
      /* PushDynamicScope */
      );
    };

    _proto11.popDynamicScope = function popDynamicScope() {
      this.push(45
      /* PopDynamicScope */
      );
    };

    _proto11.pushRemoteElement = function pushRemoteElement() {
      this.push(41
      /* PushRemoteElement */
      );
    };

    _proto11.popRemoteElement = function popRemoteElement() {
      this.push(42
      /* PopRemoteElement */
      );
    };

    _proto11.pushRootScope = function pushRootScope(symbols, bindCallerScope) {
      this.push(20
      /* RootScope */
      , symbols, bindCallerScope ? 1 : 0);
    };

    _proto11.pushVirtualRootScope = function pushVirtualRootScope(register) {
      this.push(21
      /* VirtualRootScope */
      , register);
    };

    _proto11.pushChildScope = function pushChildScope() {
      this.push(22
      /* ChildScope */
      );
    };

    _proto11.popScope = function popScope() {
      this.push(23
      /* PopScope */
      );
    };

    _proto11.prepareArgs = function prepareArgs(state) {
      this.push(79
      /* PrepareArgs */
      , state);
    };

    _proto11.createComponent = function createComponent(state, hasDefault) {
      var flag = hasDefault | 0;
      this.push(81
      /* CreateComponent */
      , flag, state);
    };

    _proto11.registerComponentDestructor = function registerComponentDestructor(state) {
      this.push(82
      /* RegisterComponentDestructor */
      , state);
    };

    _proto11.putComponentOperations = function putComponentOperations() {
      this.push(83
      /* PutComponentOperations */
      );
    };

    _proto11.getComponentSelf = function getComponentSelf(state) {
      this.push(84
      /* GetComponentSelf */
      , state);
    };

    _proto11.getComponentTagName = function getComponentTagName(state) {
      this.push(85
      /* GetComponentTagName */
      , state);
    };

    _proto11.getComponentLayout = function getComponentLayout(state) {
      this.push(86
      /* GetComponentLayout */
      , state);
    };

    _proto11.setupForEval = function setupForEval(state) {
      this.push(87
      /* SetupForEval */
      , state);
    };

    _proto11.invokeComponentLayout = function invokeComponentLayout(state) {
      this.push(90
      /* InvokeComponentLayout */
      , state);
    };

    _proto11.didCreateElement = function didCreateElement(state) {
      this.push(93
      /* DidCreateElement */
      , state);
    };

    _proto11.didRenderLayout = function didRenderLayout(state) {
      this.push(94
      /* DidRenderLayout */
      , state);
    };

    _proto11.pushFrame = function pushFrame() {
      this.pushMachine(57
      /* PushFrame */
      );
    };

    _proto11.popFrame = function popFrame() {
      this.pushMachine(58
      /* PopFrame */
      );
    };

    _proto11.pushSmallFrame = function pushSmallFrame() {
      this.pushMachine(59
      /* PushSmallFrame */
      );
    };

    _proto11.popSmallFrame = function popSmallFrame() {
      this.pushMachine(60
      /* PopSmallFrame */
      );
    };

    _proto11.invokeVirtual = function invokeVirtual() {
      this.pushMachine(49
      /* InvokeVirtual */
      );
    };

    _proto11.invokeYield = function invokeYield() {
      this.push(51
      /* InvokeYield */
      );
    };

    _proto11.toBoolean = function toBoolean() {
      this.push(63
      /* ToBoolean */
      );
    };

    _proto11.invokePreparedComponent = function invokePreparedComponent(hasBlock, bindableBlocks, bindableAtNames, populateLayout) {
      if (populateLayout === void 0) {
        populateLayout = null;
      }

      this.beginComponentTransaction();
      this.pushDynamicScope();
      this.createComponent(_vm.Register.s0, hasBlock); // this has to run after createComponent to allow
      // for late-bound layouts, but a caller is free
      // to populate the layout earlier if it wants to
      // and do nothing here.

      if (populateLayout) populateLayout();
      this.registerComponentDestructor(_vm.Register.s0);
      this.getComponentSelf(_vm.Register.s0);
      this.pushVirtualRootScope(_vm.Register.s0);
      this.setVariable(0);
      this.setupForEval(_vm.Register.s0);
      if (bindableAtNames) this.setNamedVariables(_vm.Register.s0);
      if (bindableBlocks) this.setBlocks(_vm.Register.s0);
      this.pop();
      this.invokeComponentLayout(_vm.Register.s0);
      this.didRenderLayout(_vm.Register.s0);
      this.popFrame();
      this.popScope();
      this.popDynamicScope();
      this.commitComponentTransaction();
    };

    ///
    _proto11.compileInline = function compileInline(sexp) {
      return this.compiler.compileInline(sexp, this);
    };

    _proto11.compileBlock = function compileBlock(name, params, hash, template, inverse) {
      this.compiler.compileBlock(name, params, hash, template, inverse, this);
    };

    _proto11.label = function label(name) {
      this.labels.label(name, this.nextPos);
    } // helpers
    ;

    _proto11.startLabels = function startLabels() {
      this.labelsStack.push(new Labels());
    };

    _proto11.stopLabels = function stopLabels() {
      var label = this.labelsStack.pop();
      label.patch(this.encoder);
    } // components
    ;

    _proto11.pushCurriedComponent = function pushCurriedComponent() {
      this.push(74
      /* PushCurriedComponent */
      );
    };

    _proto11.pushDynamicComponentInstance = function pushDynamicComponentInstance() {
      this.push(73
      /* PushDynamicComponentInstance */
      );
    } // dom
    ;

    _proto11.openDynamicElement = function openDynamicElement() {
      this.push(34
      /* OpenDynamicElement */
      );
    };

    _proto11.flushElement = function flushElement() {
      this.push(38
      /* FlushElement */
      );
    };

    _proto11.closeElement = function closeElement() {
      this.push(39
      /* CloseElement */
      );
    } // lists
    ;

    _proto11.putIterator = function putIterator() {
      this.push(66
      /* PutIterator */
      );
    };

    _proto11.enterList = function enterList(start) {
      this.reserve(64
      /* EnterList */
      );
      this.labels.target(this.pos, start);
    };

    _proto11.exitList = function exitList() {
      this.push(65
      /* ExitList */
      );
    };

    _proto11.iterate = function iterate(breaks) {
      this.reserve(67
      /* Iterate */
      );
      this.labels.target(this.pos, breaks);
    } // expressions
    ;

    _proto11.setNamedVariables = function setNamedVariables(state) {
      this.push(2
      /* SetNamedVariables */
      , state);
    };

    _proto11.setBlocks = function setBlocks(state) {
      this.push(3
      /* SetBlocks */
      , state);
    };

    _proto11.setVariable = function setVariable(symbol) {
      this.push(4
      /* SetVariable */
      , symbol);
    };

    _proto11.setBlock = function setBlock(symbol) {
      this.push(5
      /* SetBlock */
      , symbol);
    };

    _proto11.getVariable = function getVariable(symbol) {
      this.push(6
      /* GetVariable */
      , symbol);
    };

    _proto11.getBlock = function getBlock(symbol) {
      this.push(8
      /* GetBlock */
      , symbol);
    };

    _proto11.hasBlock = function hasBlock(symbol) {
      this.push(9
      /* HasBlock */
      , symbol);
    };

    _proto11.concat = function concat(size) {
      this.push(11
      /* Concat */
      , size);
    };

    _proto11.load = function load(register) {
      this.push(18
      /* Load */
      , register);
    };

    _proto11.fetch = function fetch(register) {
      this.push(19
      /* Fetch */
      , register);
    };

    _proto11.dup = function dup(register, offset) {
      if (register === void 0) {
        register = _vm.Register.sp;
      }

      if (offset === void 0) {
        offset = 0;
      }

      return this.push(16
      /* Dup */
      , register, offset);
    };

    _proto11.pop = function pop(count) {
      if (count === void 0) {
        count = 1;
      }

      return this.push(17
      /* Pop */
      , count);
    } // vm
    ;

    _proto11.returnTo = function returnTo(label) {
      this.reserveMachine(25
      /* ReturnTo */
      );
      this.labels.target(this.pos, label);
    };

    _proto11.primitiveReference = function primitiveReference() {
      this.push(14
      /* PrimitiveReference */
      );
    };

    _proto11.reifyU32 = function reifyU32() {
      this.push(15
      /* ReifyU32 */
      );
    };

    _proto11.enter = function enter(args) {
      this.push(61
      /* Enter */
      , args);
    };

    _proto11.exit = function exit() {
      this.push(62
      /* Exit */
      );
    };

    _proto11.return = function _return() {
      this.pushMachine(24
      /* Return */
      );
    };

    _proto11.jump = function jump(target) {
      this.reserveMachine(52
      /* Jump */
      );
      this.labels.target(this.pos, target);
    };

    _proto11.jumpIf = function jumpIf(target) {
      this.reserve(53
      /* JumpIf */
      );
      this.labels.target(this.pos, target);
    };

    _proto11.jumpUnless = function jumpUnless(target) {
      this.reserve(54
      /* JumpUnless */
      );
      this.labels.target(this.pos, target);
    };

    _proto11.jumpEq = function jumpEq(value, target) {
      this.reserveWithOperand(55
      /* JumpEq */
      , value);
      this.labels.target(this.pos, target);
    };

    _proto11.assertSame = function assertSame() {
      this.push(56
      /* AssertSame */
      );
    };

    _proto11.pushEmptyArgs = function pushEmptyArgs() {
      this.push(77
      /* PushEmptyArgs */
      );
    };

    _proto11.switch = function _switch(_opcode, callback) {
      var _this = this;

      // Setup the switch DSL
      var clauses = [];
      var count = 0;

      function when(match, callback) {
        clauses.push({
          match: match,
          callback: callback,
          label: "CLAUSE" + count++
        });
      } // Call the callback


      callback(when); // Emit the opcodes for the switch

      this.enter(2);
      this.assertSame();
      this.reifyU32();
      this.startLabels(); // First, emit the jump opcodes. We don't need a jump for the last
      // opcode, since it bleeds directly into its clause.

      clauses.slice(0, -1).forEach(function (clause) {
        return _this.jumpEq(clause.match, clause.label);
      }); // Enumerate the clauses in reverse order. Earlier matches will
      // require fewer checks.

      for (var i = clauses.length - 1; i >= 0; i--) {
        var clause = clauses[i];
        this.label(clause.label);
        this.pop(2);
        clause.callback(); // The first match is special: it is placed directly before the END
        // label, so no additional jump is needed at the end of it.

        if (i !== 0) {
          this.jump('END');
        }
      }

      this.label('END');
      this.stopLabels();
      this.exit();
    };

    _proto11.stdAppend = function stdAppend(trusting) {
      var _this2 = this;

      this.switch(this.contentType(), function (when) {
        when(1
        /* String */
        , function () {
          if (trusting) {
            _this2.assertSame();

            _this2.appendHTML();
          } else {
            _this2.appendText();
          }
        });
        when(0
        /* Component */
        , function () {
          _this2.pushCurriedComponent();

          _this2.pushDynamicComponentInstance();

          _this2.invokeBareComponent();
        });
        when(3
        /* SafeString */
        , function () {
          _this2.assertSame();

          _this2.appendSafeHTML();
        });
        when(4
        /* Fragment */
        , function () {
          _this2.assertSame();

          _this2.appendDocumentFragment();
        });
        when(5
        /* Node */
        , function () {
          _this2.assertSame();

          _this2.appendNode();
        });
      });
    };

    _proto11.populateLayout = function populateLayout(state) {
      this.push(89
      /* PopulateLayout */
      , state);
    };

    _proto11.invokeBareComponent = function invokeBareComponent() {
      var _this3 = this;

      this.fetch(_vm.Register.s0);
      this.dup(_vm.Register.sp, 1);
      this.load(_vm.Register.s0);
      this.pushFrame();
      this.pushEmptyArgs();
      this.prepareArgs(_vm.Register.s0);
      this.invokePreparedComponent(false, false, true, function () {
        _this3.getComponentLayout(_vm.Register.s0);

        _this3.populateLayout(_vm.Register.s0);
      });
      this.load(_vm.Register.s0);
    };

    _proto11.isComponent = function isComponent() {
      this.push(69
      /* IsComponent */
      );
    };

    _proto11.contentType = function contentType() {
      this.push(70
      /* ContentType */
      );
    };

    _proto11.pushBlockScope = function pushBlockScope() {
      this.push(47
      /* PushBlockScope */
      );
    };

    (0, _emberBabel.createClass)(StdOpcodeBuilder, [{
      key: "pos",
      get: function get() {
        return this.encoder.typePos;
      }
    }, {
      key: "nextPos",
      get: function get() {
        return this.encoder.size;
      }
    }, {
      key: "labels",
      get: function get() {
        return this.labelsStack.current;
      }
    }]);
    return StdOpcodeBuilder;
  }();

  _exports.StdOpcodeBuilder = StdOpcodeBuilder;

  var OpcodeBuilder =
  /*#__PURE__*/
  function (_StdOpcodeBuilder) {
    (0, _emberBabel.inheritsLoose)(OpcodeBuilder, _StdOpcodeBuilder);

    function OpcodeBuilder(compiler, containingLayout) {
      var _this4;

      _this4 = _StdOpcodeBuilder.call(this, compiler, containingLayout ? containingLayout.block.symbols.length : 0) || this;
      _this4.containingLayout = containingLayout;
      _this4.component = new ComponentBuilder((0, _emberBabel.assertThisInitialized)(_this4));
      _this4.expressionCompiler = expressionCompiler();
      _this4.constants = compiler.constants;
      _this4.stdLib = compiler.stdLib;
      return _this4;
    } /// MECHANICS


    var _proto12 = OpcodeBuilder.prototype;

    _proto12.expr = function expr(expression) {
      if (Array.isArray(expression)) {
        this.expressionCompiler.compile(expression, this);
      } else {
        this.pushPrimitiveReference(expression);
      }
    } ///
    // args
    ;

    _proto12.pushArgs = function pushArgs(names, flags) {
      var serialized = this.constants.stringArray(names);
      this.push(76
      /* PushArgs */
      , serialized, flags);
    };

    _proto12.pushYieldableBlock = function pushYieldableBlock(block) {
      this.pushSymbolTable(block && block.symbolTable);
      this.pushBlockScope();
      this.pushBlock(block);
    };

    _proto12.curryComponent = function curryComponent(definition,
    /* TODO: attrs: Option<RawInlineBlock>, */
    params, hash, synthetic) {
      var referrer = this.containingLayout.referrer;
      this.pushFrame();
      this.compileArgs(params, hash, null, synthetic);
      this.push(80
      /* CaptureArgs */
      );
      this.expr(definition);
      this.push(71
      /* CurryComponent */
      , this.constants.serializable(referrer));
      this.popFrame();
      this.fetch(_vm.Register.v0);
    };

    _proto12.pushSymbolTable = function pushSymbolTable(table) {
      if (table) {
        var constant = this.constants.serializable(table);
        this.push(48
        /* PushSymbolTable */
        , constant);
      } else {
        this.primitive(null);
      }
    };

    _proto12.invokeComponent = function invokeComponent(capabilities, attrs, params, hash, synthetic, block, inverse, layout) {
      var _this5 = this;

      if (inverse === void 0) {
        inverse = null;
      }

      this.fetch(_vm.Register.s0);
      this.dup(_vm.Register.sp, 1);
      this.load(_vm.Register.s0);
      this.pushFrame();
      var bindableBlocks = !!(block || inverse || attrs);
      var bindableAtNames = capabilities === true || capabilities.prepareArgs || !!(hash && hash[0].length !== 0);
      var blocks = {
        main: block,
        else: inverse,
        attrs: attrs
      };
      this.compileArgs(params, hash, blocks, synthetic);
      this.prepareArgs(_vm.Register.s0);
      this.invokePreparedComponent(block !== null, bindableBlocks, bindableAtNames, function () {
        if (layout) {
          _this5.pushSymbolTable(layout.symbolTable);

          _this5.pushLayout(layout);

          _this5.resolveLayout();
        } else {
          _this5.getComponentLayout(_vm.Register.s0);
        }

        _this5.populateLayout(_vm.Register.s0);
      });
      this.load(_vm.Register.s0);
    };

    _proto12.invokeStaticComponent = function invokeStaticComponent(capabilities, layout, attrs, params, hash, synthetic, block, inverse) {
      if (inverse === void 0) {
        inverse = null;
      }

      var symbolTable = layout.symbolTable;
      var bailOut = symbolTable.hasEval || capabilities.prepareArgs;

      if (bailOut) {
        this.invokeComponent(capabilities, attrs, params, hash, synthetic, block, inverse, layout);
        return;
      }

      this.fetch(_vm.Register.s0);
      this.dup(_vm.Register.sp, 1);
      this.load(_vm.Register.s0);
      var symbols = symbolTable.symbols;

      if (capabilities.createArgs) {
        this.pushFrame();
        this.compileArgs(params, hash, null, synthetic);
      }

      this.beginComponentTransaction();

      if (capabilities.dynamicScope) {
        this.pushDynamicScope();
      }

      if (capabilities.createInstance) {
        this.createComponent(_vm.Register.s0, block !== null);
      }

      if (capabilities.createArgs) {
        this.popFrame();
      }

      this.pushFrame();
      this.registerComponentDestructor(_vm.Register.s0);
      var bindings = [];
      this.getComponentSelf(_vm.Register.s0);
      bindings.push({
        symbol: 0,
        isBlock: false
      });

      for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];

        switch (symbol.charAt(0)) {
          case '&':
            var callerBlock = null;

            if (symbol === '&default') {
              callerBlock = block;
            } else if (symbol === '&inverse') {
              callerBlock = inverse;
            } else if (symbol === ATTRS_BLOCK) {
              callerBlock = attrs;
            } else {
              throw (0, _util.unreachable)();
            }

            if (callerBlock) {
              this.pushYieldableBlock(callerBlock);
              bindings.push({
                symbol: i + 1,
                isBlock: true
              });
            } else {
              this.pushYieldableBlock(null);
              bindings.push({
                symbol: i + 1,
                isBlock: true
              });
            }

            break;

          case '@':
            if (!hash) {
              break;
            }

            var keys = hash[0],
                values = hash[1];
            var lookupName = symbol;

            if (synthetic) {
              lookupName = symbol.slice(1);
            }

            var index = keys.indexOf(lookupName);

            if (index !== -1) {
              this.expr(values[index]);
              bindings.push({
                symbol: i + 1,
                isBlock: false
              });
            }

            break;
        }
      }

      this.pushRootScope(symbols.length + 1, !!(block || inverse || attrs));

      for (var _i = bindings.length - 1; _i >= 0; _i--) {
        var _bindings$_i = bindings[_i],
            _symbol = _bindings$_i.symbol,
            isBlock = _bindings$_i.isBlock;

        if (isBlock) {
          this.setBlock(_symbol);
        } else {
          this.setVariable(_symbol);
        }
      }

      this.invokeStatic(layout);

      if (capabilities.createInstance) {
        this.didRenderLayout(_vm.Register.s0);
      }

      this.popFrame();
      this.popScope();

      if (capabilities.dynamicScope) {
        this.popDynamicScope();
      }

      this.commitComponentTransaction();
      this.load(_vm.Register.s0);
    };

    _proto12.dynamicComponent = function dynamicComponent(definition, attrs, params, hash, synthetic, block, inverse) {
      var _this6 = this;

      if (inverse === void 0) {
        inverse = null;
      }

      this.replayable({
        args: function args() {
          _this6.expr(definition);

          _this6.dup();

          return 2;
        },
        body: function body() {
          _this6.jumpUnless('ELSE');

          _this6.resolveDynamicComponent(_this6.containingLayout.referrer);

          _this6.pushDynamicComponentInstance();

          _this6.invokeComponent(true, attrs, params, hash, synthetic, block, inverse);

          _this6.label('ELSE');
        }
      });
    };

    _proto12.yield = function _yield(to, params) {
      this.compileArgs(params, null, null, false);
      this.getBlock(to);
      this.resolveBlock();
      this.invokeYield();
      this.popScope();
      this.popFrame();
    };

    _proto12.guardedAppend = function guardedAppend(expression, trusting) {
      this.pushFrame();
      this.expr(expression);
      this.pushMachine(50
      /* InvokeStatic */
      , this.stdLib.getAppend(trusting));
      this.popFrame();
    };

    _proto12.invokeStaticBlock = function invokeStaticBlock(block, callerCount) {
      if (callerCount === void 0) {
        callerCount = 0;
      }

      var parameters = block.symbolTable.parameters;
      var calleeCount = parameters.length;
      var count = Math.min(callerCount, calleeCount);
      this.pushFrame();

      if (count) {
        this.pushChildScope();

        for (var i = 0; i < count; i++) {
          this.dup(_vm.Register.fp, callerCount - i);
          this.setVariable(parameters[i]);
        }
      }

      this.pushBlock(block);
      this.resolveBlock();
      this.invokeVirtual();

      if (count) {
        this.popScope();
      }

      this.popFrame();
    } /// CONVENIENCE
    // internal helpers
    ;

    _proto12.string = function string(_string) {
      return this.constants.string(_string);
    };

    _proto12.names = function names(_names) {
      var names = [];

      for (var i = 0; i < _names.length; i++) {
        var n = _names[i];
        names[i] = this.constants.string(n);
      }

      return this.constants.array(names);
    };

    _proto12.symbols = function symbols(_symbols2) {
      return this.constants.array(_symbols2);
    } // vm
    ;

    _proto12.primitive = function primitive(_primitive) {
      var type = 0
      /* NUMBER */
      ;
      var primitive;

      switch (typeof _primitive) {
        case 'number':
          if (_primitive % 1 === 0) {
            if (_primitive > -1) {
              primitive = _primitive;
            } else {
              primitive = this.constants.number(_primitive);
              type = 4
              /* NEGATIVE */
              ;
            }
          } else {
            primitive = this.constants.number(_primitive);
            type = 1
            /* FLOAT */
            ;
          }

          break;

        case 'string':
          primitive = this.string(_primitive);
          type = 2
          /* STRING */
          ;
          break;

        case 'boolean':
          primitive = _primitive | 0;
          type = 3
          /* BOOLEAN_OR_VOID */
          ;
          break;

        case 'object':
          // assume null
          primitive = 2;
          type = 3
          /* BOOLEAN_OR_VOID */
          ;
          break;

        case 'undefined':
          primitive = 3;
          type = 3
          /* BOOLEAN_OR_VOID */
          ;
          break;

        default:
          throw new Error('Invalid primitive passed to pushPrimitive');
      }

      var immediate = this.sizeImmediate(primitive << 3 | type, primitive);
      this.push(13
      /* Primitive */
      , immediate);
    };

    _proto12.sizeImmediate = function sizeImmediate(shifted, primitive) {
      if (shifted >= 4294967295
      /* MAX_SIZE */
      || shifted < 0) {
        return this.constants.number(primitive) << 3 | 5
        /* BIG_NUM */
        ;
      }

      return shifted;
    };

    _proto12.pushPrimitiveReference = function pushPrimitiveReference(primitive) {
      this.primitive(primitive);
      this.primitiveReference();
    } // components
    ;

    _proto12.pushComponentDefinition = function pushComponentDefinition(handle) {
      this.push(72
      /* PushComponentDefinition */
      , this.constants.handle(handle));
    };

    _proto12.resolveDynamicComponent = function resolveDynamicComponent(referrer) {
      this.push(75
      /* ResolveDynamicComponent */
      , this.constants.serializable(referrer));
    };

    _proto12.staticComponentHelper = function staticComponentHelper(tag, hash, template) {
      var _this$compiler$resolv = this.compiler.resolveLayoutForTag(tag, this.referrer),
          handle = _this$compiler$resolv.handle,
          capabilities = _this$compiler$resolv.capabilities,
          compilable = _this$compiler$resolv.compilable;

      if (handle !== null && capabilities !== null) {
        if (compilable) {
          if (hash) {
            for (var i = 0; i < hash.length; i = i + 2) {
              hash[i][0] = "@" + hash[i][0];
            }
          }

          this.pushComponentDefinition(handle);
          this.invokeStaticComponent(capabilities, compilable, null, null, hash, false, template && template);
          return true;
        }
      }

      return false;
    } // partial
    ;

    _proto12.invokePartial = function invokePartial(referrer, symbols, evalInfo) {
      var _meta = this.constants.serializable(referrer);

      var _symbols = this.constants.stringArray(symbols);

      var _evalInfo = this.constants.array(evalInfo);

      this.push(95
      /* InvokePartial */
      , _meta, _symbols, _evalInfo);
    };

    _proto12.resolveMaybeLocal = function resolveMaybeLocal(name) {
      this.push(96
      /* ResolveMaybeLocal */
      , this.string(name));
    } // debugger
    ;

    _proto12.debugger = function _debugger(symbols, evalInfo) {
      this.push(97
      /* Debugger */
      , this.constants.stringArray(symbols), this.constants.array(evalInfo));
    } // dom
    ;

    _proto12.text = function text(_text) {
      this.push(26
      /* Text */
      , this.constants.string(_text));
    };

    _proto12.openPrimitiveElement = function openPrimitiveElement(tag) {
      this.push(33
      /* OpenElement */
      , this.constants.string(tag));
    };

    _proto12.modifier = function modifier(locator, params, hash) {
      this.pushFrame();
      this.compileArgs(params, hash, null, true);
      this.push(40
      /* Modifier */
      , this.constants.handle(locator));
      this.popFrame();
    };

    _proto12.comment = function comment(_comment) {
      var comment = this.constants.string(_comment);
      this.push(27
      /* Comment */
      , comment);
    };

    _proto12.dynamicAttr = function dynamicAttr(_name, _namespace, trusting) {
      var name = this.constants.string(_name);
      var namespace = _namespace ? this.constants.string(_namespace) : 0;
      this.push(36
      /* DynamicAttr */
      , name, trusting === true ? 1 : 0, namespace);
    };

    _proto12.componentAttr = function componentAttr(_name, _namespace, trusting) {
      var name = this.constants.string(_name);
      var namespace = _namespace ? this.constants.string(_namespace) : 0;
      this.push(37
      /* ComponentAttr */
      , name, trusting === true ? 1 : 0, namespace);
    };

    _proto12.staticAttr = function staticAttr(_name, _namespace, _value) {
      var name = this.constants.string(_name);
      var namespace = _namespace ? this.constants.string(_namespace) : 0;
      var value = this.constants.string(_value);
      this.push(35
      /* StaticAttr */
      , name, value, namespace);
    } // expressions
    ;

    _proto12.hasBlockParams = function hasBlockParams(to) {
      this.getBlock(to);
      this.resolveBlock();
      this.push(10
      /* HasBlockParams */
      );
    };

    _proto12.getProperty = function getProperty(key) {
      this.push(7
      /* GetProperty */
      , this.string(key));
    };

    _proto12.helper = function helper(_helper, params, hash) {
      this.pushFrame();
      this.compileArgs(params, hash, null, true);
      this.push(1
      /* Helper */
      , this.constants.handle(_helper));
      this.popFrame();
      this.fetch(_vm.Register.v0);
    };

    _proto12.bindDynamicScope = function bindDynamicScope(_names) {
      this.push(43
      /* BindDynamicScope */
      , this.names(_names));
    } // convenience methods

    /**
     * A convenience for pushing some arguments on the stack and
     * running some code if the code needs to be re-executed during
     * updating execution if some of the arguments have changed.
     *
     * # Initial Execution
     *
     * The `args` function should push zero or more arguments onto
     * the stack and return the number of arguments pushed.
     *
     * The `body` function provides the instructions to execute both
     * during initial execution and during updating execution.
     *
     * Internally, this function starts by pushing a new frame, so
     * that the body can return and sets the return point ($ra) to
     * the ENDINITIAL label.
     *
     * It then executes the `args` function, which adds instructions
     * responsible for pushing the arguments for the block to the
     * stack. These arguments will be restored to the stack before
     * updating execution.
     *
     * Next, it adds the Enter opcode, which marks the current position
     * in the DOM, and remembers the current $pc (the next instruction)
     * as the first instruction to execute during updating execution.
     *
     * Next, it runs `body`, which adds the opcodes that should
     * execute both during initial execution and during updating execution.
     * If the `body` wishes to finish early, it should Jump to the
     * `FINALLY` label.
     *
     * Next, it adds the FINALLY label, followed by:
     *
     * - the Exit opcode, which finalizes the marked DOM started by the
     *   Enter opcode.
     * - the Return opcode, which returns to the current return point
     *   ($ra).
     *
     * Finally, it adds the ENDINITIAL label followed by the PopFrame
     * instruction, which restores $fp, $sp and $ra.
     *
     * # Updating Execution
     *
     * Updating execution for this `replayable` occurs if the `body` added an
     * assertion, via one of the `JumpIf`, `JumpUnless` or `AssertSame` opcodes.
     *
     * If, during updating executon, the assertion fails, the initial VM is
     * restored, and the stored arguments are pushed onto the stack. The DOM
     * between the starting and ending markers is cleared, and the VM's cursor
     * is set to the area just cleared.
     *
     * The return point ($ra) is set to -1, the exit instruction.
     *
     * Finally, the $pc is set to to the instruction saved off by the
     * Enter opcode during initial execution, and execution proceeds as
     * usual.
     *
     * The only difference is that when a `Return` instruction is
     * encountered, the program jumps to -1 rather than the END label,
     * and the PopFrame opcode is not needed.
     */
    ;

    _proto12.replayable = function replayable(_ref) {
      var args = _ref.args,
          body = _ref.body;
      // Start a new label frame, to give END and RETURN
      // a unique meaning.
      this.startLabels();
      this.pushFrame(); // If the body invokes a block, its return will return to
      // END. Otherwise, the return in RETURN will return to END.

      this.returnTo('ENDINITIAL'); // Push the arguments onto the stack. The args() function
      // tells us how many stack elements to retain for re-execution
      // when updating.

      var count = args(); // Start a new updating closure, remembering `count` elements
      // from the stack. Everything after this point, and before END,
      // will execute both initially and to update the block.
      //
      // The enter and exit opcodes also track the area of the DOM
      // associated with this block. If an assertion inside the block
      // fails (for example, the test value changes from true to false
      // in an #if), the DOM is cleared and the program is re-executed,
      // restoring `count` elements to the stack and executing the
      // instructions between the enter and exit.

      this.enter(count); // Evaluate the body of the block. The body of the block may
      // return, which will jump execution to END during initial
      // execution, and exit the updating routine.

      body(); // All execution paths in the body should run the FINALLY once
      // they are done. It is executed both during initial execution
      // and during updating execution.

      this.label('FINALLY'); // Finalize the DOM.

      this.exit(); // In initial execution, this is a noop: it returns to the
      // immediately following opcode. In updating execution, this
      // exits the updating routine.

      this.return(); // Cleanup code for the block. Runs on initial execution
      // but not on updating.

      this.label('ENDINITIAL');
      this.popFrame();
      this.stopLabels();
    }
    /**
     * A specialized version of the `replayable` convenience that allows the
     * caller to provide different code based upon whether the item at
     * the top of the stack is true or false.
     *
     * As in `replayable`, the `ifTrue` and `ifFalse` code can invoke `return`.
     *
     * During the initial execution, a `return` will continue execution
     * in the cleanup code, which finalizes the current DOM block and pops
     * the current frame.
     *
     * During the updating execution, a `return` will exit the updating
     * routine, as it can reuse the DOM block and is always only a single
     * frame deep.
     */
    ;

    _proto12.replayableIf = function replayableIf(_ref2) {
      var _this7 = this;

      var args = _ref2.args,
          ifTrue = _ref2.ifTrue,
          ifFalse = _ref2.ifFalse;
      this.replayable({
        args: args,
        body: function body() {
          // If the conditional is false, jump to the ELSE label.
          _this7.jumpUnless('ELSE'); // Otherwise, execute the code associated with the true branch.


          ifTrue(); // We're done, so return. In the initial execution, this runs
          // the cleanup code. In the updating VM, it exits the updating
          // routine.

          _this7.jump('FINALLY');

          _this7.label('ELSE'); // If the conditional is false, and code associatied ith the
          // false branch was provided, execute it. If there was no code
          // associated with the false branch, jumping to the else statement
          // has no other behavior.


          if (ifFalse) {
            ifFalse();
          }
        }
      });
    };

    _proto12.inlineBlock = function inlineBlock(block) {
      return new CompilableBlock(this.compiler, {
        block: block,
        containingLayout: this.containingLayout
      });
    };

    _proto12.evalSymbols = function evalSymbols() {
      var block = this.containingLayout.block;
      return block.hasEval ? block.symbols : null;
    };

    _proto12.compileParams = function compileParams(params) {
      if (!params) return 0;

      for (var i = 0; i < params.length; i++) {
        this.expr(params[i]);
      }

      return params.length;
    };

    _proto12.compileArgs = function compileArgs(params, hash, blocks, synthetic) {
      if (blocks) {
        this.pushYieldableBlock(blocks.main);
        this.pushYieldableBlock(blocks.else);
        this.pushYieldableBlock(blocks.attrs);
      }

      var count = this.compileParams(params);
      var flags = count << 4;
      if (synthetic) flags |= 8;

      if (blocks) {
        flags |= 7;
      }

      var names = _util.EMPTY_ARRAY;

      if (hash) {
        names = hash[0];
        var val = hash[1];

        for (var i = 0; i < val.length; i++) {
          this.expr(val[i]);
        }
      }

      this.pushArgs(names, flags);
    };

    _proto12.template = function template(block) {
      if (!block) return null;
      return this.inlineBlock(block);
    };

    (0, _emberBabel.createClass)(OpcodeBuilder, [{
      key: "referrer",
      get: function get() {
        return this.containingLayout && this.containingLayout.referrer;
      }
    }]);
    return OpcodeBuilder;
  }(StdOpcodeBuilder);

  _exports.OpcodeBuilder = OpcodeBuilder;

  var LazyOpcodeBuilder =
  /*#__PURE__*/
  function (_OpcodeBuilder) {
    (0, _emberBabel.inheritsLoose)(LazyOpcodeBuilder, _OpcodeBuilder);

    function LazyOpcodeBuilder() {
      return _OpcodeBuilder.apply(this, arguments) || this;
    }

    var _proto13 = LazyOpcodeBuilder.prototype;

    _proto13.pushBlock = function pushBlock(block) {
      if (block) {
        this.pushOther(block);
      } else {
        this.primitive(null);
      }
    };

    _proto13.resolveBlock = function resolveBlock() {
      this.push(46
      /* CompileBlock */
      );
    };

    _proto13.pushLayout = function pushLayout(layout) {
      if (layout) {
        this.pushOther(layout);
      } else {
        this.primitive(null);
      }
    };

    _proto13.resolveLayout = function resolveLayout() {
      this.push(46
      /* CompileBlock */
      );
    };

    _proto13.invokeStatic = function invokeStatic(compilable) {
      this.pushOther(compilable);
      this.push(46
      /* CompileBlock */
      );
      this.pushMachine(49
      /* InvokeVirtual */
      );
    };

    _proto13.pushOther = function pushOther(value) {
      this.push(12
      /* Constant */
      , this.other(value));
    };

    _proto13.other = function other(value) {
      return this.constants.other(value);
    };

    return LazyOpcodeBuilder;
  }(OpcodeBuilder);

  _exports.LazyOpcodeBuilder = LazyOpcodeBuilder;

  var EagerOpcodeBuilder =
  /*#__PURE__*/
  function (_OpcodeBuilder2) {
    (0, _emberBabel.inheritsLoose)(EagerOpcodeBuilder, _OpcodeBuilder2);

    function EagerOpcodeBuilder() {
      return _OpcodeBuilder2.apply(this, arguments) || this;
    }

    var _proto14 = EagerOpcodeBuilder.prototype;

    _proto14.pushBlock = function pushBlock(block) {
      var handle = block ? block.compile() : null;
      this.primitive(handle);
    };

    _proto14.resolveBlock = function resolveBlock() {
      return;
    };

    _proto14.pushLayout = function pushLayout(layout) {
      if (layout) {
        this.primitive(layout.compile());
      } else {
        this.primitive(null);
      }
    };

    _proto14.resolveLayout = function resolveLayout() {};

    _proto14.invokeStatic = function invokeStatic(compilable) {
      var handle = compilable.compile(); // If the handle for the invoked component is not yet known (for example,
      // because this is a recursive invocation and we're still compiling), push a
      // function that will produce the correct handle when the heap is
      // serialized.

      if (handle === PLACEHOLDER_HANDLE$1) {
        this.pushMachine(50
        /* InvokeStatic */
        , function () {
          return compilable.compile();
        });
      } else {
        this.pushMachine(50
        /* InvokeStatic */
        , handle);
      }
    };

    return EagerOpcodeBuilder;
  }(OpcodeBuilder);

  _exports.EagerOpcodeBuilder = EagerOpcodeBuilder;

  var LazyCompiler =
  /*#__PURE__*/
  function (_AbstractCompiler) {
    (0, _emberBabel.inheritsLoose)(LazyCompiler, _AbstractCompiler);

    // FIXME: turn to static method
    function LazyCompiler(lookup, resolver, macros) {
      var constants = new _program.LazyConstants(resolver);
      var program = new _program.Program(constants);
      return _AbstractCompiler.call(this, macros, program, lookup) || this;
    }

    var _proto15 = LazyCompiler.prototype;

    _proto15.builderFor = function builderFor(containingLayout) {
      return new LazyOpcodeBuilder(this, containingLayout);
    };

    return LazyCompiler;
  }(AbstractCompiler);

  _exports.LazyCompiler = LazyCompiler;

  var PartialDefinition =
  /*#__PURE__*/
  function () {
    function PartialDefinition(name, // for debugging
    template) {
      this.name = name;
      this.template = template;
    }

    var _proto16 = PartialDefinition.prototype;

    _proto16.getPartial = function getPartial() {
      var partial = this.template.asPartial();
      var handle = partial.compile();
      return {
        symbolTable: partial.symbolTable,
        handle: handle
      };
    };

    return PartialDefinition;
  }();

  _exports.PartialDefinition = PartialDefinition;
  var clientId = 0;

  function templateFactory(_ref3) {
    var templateId = _ref3.id,
        meta = _ref3.meta,
        block = _ref3.block;
    var parsedBlock;
    var id = templateId || "client-" + clientId++;

    var create = function create(compiler, envMeta) {
      var newMeta = envMeta ? (0, _util.assign)({}, envMeta, meta) : meta;

      if (!parsedBlock) {
        parsedBlock = JSON.parse(block);
      }

      return new TemplateImpl(compiler, {
        id: id,
        block: parsedBlock,
        referrer: newMeta
      });
    };

    return {
      id: id,
      meta: meta,
      create: create
    };
  }

  var TemplateImpl =
  /*#__PURE__*/
  function () {
    function TemplateImpl(compiler, parsedLayout) {
      this.compiler = compiler;
      this.parsedLayout = parsedLayout;
      this.layout = null;
      this.partial = null;
      this.wrappedLayout = null;
      var block = parsedLayout.block;
      this.symbols = block.symbols;
      this.hasEval = block.hasEval;
      this.referrer = parsedLayout.referrer;
      this.id = parsedLayout.id || "client-" + clientId++;
    }

    var _proto17 = TemplateImpl.prototype;

    _proto17.asLayout = function asLayout() {
      if (this.layout) return this.layout;
      return this.layout = new CompilableProgram(this.compiler, (0, _polyfills.assign)({}, this.parsedLayout, {
        asPartial: false
      }));
    };

    _proto17.asPartial = function asPartial() {
      if (this.partial) return this.partial;
      return this.layout = new CompilableProgram(this.compiler, (0, _polyfills.assign)({}, this.parsedLayout, {
        asPartial: true
      }));
    };

    _proto17.asWrappedLayout = function asWrappedLayout() {
      if (this.wrappedLayout) return this.wrappedLayout;
      return this.wrappedLayout = new WrappedBuilder(this.compiler, (0, _polyfills.assign)({}, this.parsedLayout, {
        asPartial: false
      }));
    };

    return TemplateImpl;
  }();
});