define("@ember/-internals/glimmer/index", ["exports", "ember-babel", "@ember/polyfills", "@ember/-internals/container", "@glimmer/opcode-compiler", "@ember/-internals/runtime", "@ember/-internals/utils", "@ember/runloop", "@glimmer/reference", "@ember/-internals/metal", "@ember/debug", "@glimmer/runtime", "@glimmer/util", "@ember/-internals/owner", "@ember/-internals/views", "@ember/-internals/browser-environment", "@ember/instrumentation", "@ember/service", "@ember/-internals/environment", "@ember/string", "@glimmer/wire-format", "rsvp", "@glimmer/node", "@ember/-internals/routing", "@ember/component/template-only", "@ember/deprecated-features"], function (_exports, _emberBabel, _polyfills, _container, _opcodeCompiler, _runtime, _utils, _runloop, _reference, _metal, _debug, _runtime2, _util, _owner, _views, _browserEnvironment, _instrumentation, _service, _environment2, _string, _wireFormat, _rsvp, _node, _routing, _templateOnly, _deprecatedFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.template = template;
  _exports.helper = helper;
  _exports.escapeExpression = escapeExpression;
  _exports.htmlSafe = htmlSafe;
  _exports.isHTMLSafe = isHTMLSafe;
  _exports._resetRenderers = _resetRenderers;
  _exports.renderSettled = renderSettled;
  _exports.getTemplate = getTemplate;
  _exports.setTemplate = setTemplate;
  _exports.hasTemplate = hasTemplate;
  _exports.getTemplates = getTemplates;
  _exports.setTemplates = setTemplates;
  _exports.setupEngineRegistry = setupEngineRegistry;
  _exports.setupApplicationRegistry = setupApplicationRegistry;
  _exports._registerMacros = registerMacros;
  _exports.iterableFor = _iterableFor;
  _exports.capabilities = capabilities;
  _exports.setComponentManager = setComponentManager;
  _exports.getComponentManager = getComponentManager;
  _exports.setModifierManager = setModifierManager;
  _exports.getModifierManager = getModifierManager;
  _exports.modifierCapabilities = capabilities$1;
  _exports.setComponentTemplate = setComponentTemplate;
  _exports.getComponentTemplate = getComponentTemplate;
  Object.defineProperty(_exports, "DOMChanges", {
    enumerable: true,
    get: function get() {
      return _runtime2.DOMChanges;
    }
  });
  Object.defineProperty(_exports, "DOMTreeConstruction", {
    enumerable: true,
    get: function get() {
      return _runtime2.DOMTreeConstruction;
    }
  });
  Object.defineProperty(_exports, "isSerializationFirstNode", {
    enumerable: true,
    get: function get() {
      return _runtime2.isSerializationFirstNode;
    }
  });
  Object.defineProperty(_exports, "NodeDOMTreeConstruction", {
    enumerable: true,
    get: function get() {
      return _node.NodeDOMTreeConstruction;
    }
  });
  _exports.OutletView = _exports.getDebugStack = _exports.INVOKE = _exports.UpdatableReference = _exports.AbstractComponentManager = _exports._experimentalMacros = _exports.InteractiveRenderer = _exports.InertRenderer = _exports.Renderer = _exports.SafeString = _exports.Environment = _exports.Helper = _exports.ROOT_REF = _exports.Component = _exports.LinkComponent = _exports.TextArea = _exports.TextField = _exports.Checkbox = _exports.templateCacheCounters = _exports.RootTemplate = void 0;

  var _CoreView$extend;

  function _templateObject10() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["component:-default"]);

    _templateObject10 = function _templateObject10() {
      return data;
    };

    return data;
  }

  function _templateObject9() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template-compiler:main"]);

    _templateObject9 = function _templateObject9() {
      return data;
    };

    return data;
  }

  function _templateObject8() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template-compiler:main"]);

    _templateObject8 = function _templateObject8() {
      return data;
    };

    return data;
  }

  function _templateObject7() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template:components/-default"]);

    _templateObject7 = function _templateObject7() {
      return data;
    };

    return data;
  }

  function _templateObject6() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template:-root"]);

    _templateObject6 = function _templateObject6() {
      return data;
    };

    return data;
  }

  function _templateObject5() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template:-root"]);

    _templateObject5 = function _templateObject5() {
      return data;
    };

    return data;
  }

  function _templateObject4() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["component:-default"]);

    _templateObject4 = function _templateObject4() {
      return data;
    };

    return data;
  }

  function _templateObject3() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template:components/-default"]);

    _templateObject3 = function _templateObject3() {
      return data;
    };

    return data;
  }

  function _templateObject2() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template:components/-default"]);

    _templateObject2 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _templateObject() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template-compiler:main"]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  function isTemplateFactory(template) {
    return typeof template === 'function';
  }

  var counters = {
    cacheHit: 0,
    cacheMiss: 0
  };
  _exports.templateCacheCounters = counters;
  var TEMPLATE_COMPILER_MAIN = (0, _container.privatize)(_templateObject());

  function template(json) {
    var glimmerFactory = (0, _opcodeCompiler.templateFactory)(json);
    var cache = new WeakMap();

    var factory = function factory(owner) {
      var result = cache.get(owner);

      if (result === undefined) {
        counters.cacheMiss++;
        var compiler = owner.lookup(TEMPLATE_COMPILER_MAIN);
        result = glimmerFactory.create(compiler, {
          owner: owner
        });
        cache.set(owner, result);
      } else {
        counters.cacheHit++;
      }

      return result;
    };

    factory.__id = glimmerFactory.id;
    factory.__meta = glimmerFactory.meta;
    return factory;
  }

  var RootTemplate = template({
    "id": "hjhxUoru",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"component\",[[23,0,[]]],null],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "packages/@ember/-internals/glimmer/lib/templates/root.hbs"
    }
  });
  /**
  @module @ember/component
  */

  _exports.RootTemplate = RootTemplate;
  var RECOMPUTE_TAG = (0, _utils.symbol)('RECOMPUTE_TAG');

  function isHelperFactory(helper) {
    return typeof helper === 'object' && helper !== null && helper.class && helper.class.isHelperFactory;
  }

  function isSimpleHelper(helper) {
    return helper.destroy === undefined;
  }
  /**
    Ember Helpers are functions that can compute values, and are used in templates.
    For example, this code calls a helper named `format-currency`:
  
    ```app/templates/application.hbs
    <Cost @cents={{230}} />
    ```
  
    ```app/components/cost.hbs
    <div>{{format-currency @cents currency="$"}}</div>
    ```
  
    Additionally a helper can be called as a nested helper.
    In this example, we show the formatted currency value if the `showMoney`
    named argument is truthy.
  
    ```handlebars
    {{if @showMoney (format-currency @cents currency="$")}}
    ```
  
    Helpers defined using a class must provide a `compute` function. For example:
  
    ```app/helpers/format-currency.js
    import Helper from '@ember/component/helper';
  
    export default class extends Helper {
      compute([cents], { currency }) {
        return `${currency}${cents * 0.01}`;
      }
    }
    ```
  
    Each time the input to a helper changes, the `compute` function will be
    called again.
  
    As instances, these helpers also have access to the container and will accept
    injected dependencies.
  
    Additionally, class helpers can call `recompute` to force a new computation.
  
    @class Helper
    @public
    @since 1.13.0
  */


  var Helper = _runtime.FrameworkObject.extend({
    init: function init() {
      this._super.apply(this, arguments);

      this[RECOMPUTE_TAG] = (0, _reference.createTag)();
    },

    /**
      On a class-based helper, it may be useful to force a recomputation of that
      helpers value. This is akin to `rerender` on a component.
         For example, this component will rerender when the `currentUser` on a
      session service changes:
         ```app/helpers/current-user-email.js
      import Helper from '@ember/component/helper'
      import { inject as service } from '@ember/service'
      import { observer } from '@ember/object'
         export default Helper.extend({
        session: service(),
           onNewUser: observer('session.currentUser', function() {
          this.recompute();
        }),
           compute() {
          return this.get('session.currentUser.email');
        }
      });
      ```
         @method recompute
      @public
      @since 1.13.0
    */
    recompute: function recompute() {
      var _this = this;

      (0, _runloop.join)(function () {
        return (0, _reference.dirty)(_this[RECOMPUTE_TAG]);
      });
    }
  });

  _exports.Helper = Helper;
  Helper.isHelperFactory = true;
  (0, _runtime.setFrameworkClass)(Helper);

  var Wrapper =
  /*#__PURE__*/
  function () {
    function Wrapper(compute) {
      this.compute = compute;
      this.isHelperFactory = true;
    }

    var _proto = Wrapper.prototype;

    _proto.create = function create() {
      // needs new instance or will leak containers
      return {
        compute: this.compute
      };
    };

    return Wrapper;
  }();
  /**
    In many cases it is not necessary to use the full `Helper` class.
    The `helper` method create pure-function helpers without instances.
    For example:
  
    ```app/helpers/format-currency.js
    import { helper } from '@ember/component/helper';
  
    export default helper(function([cents], {currency}) {
      return `${currency}${cents * 0.01}`;
    });
    ```
  
    @static
    @param {Function} helper The helper function
    @method helper
    @for @ember/component/helper
    @public
    @since 1.13.0
  */


  function helper(helperFn) {
    return new Wrapper(helperFn);
  }

  function _toBool(predicate) {
    if ((0, _runtime.isArray)(predicate)) {
      return predicate.length !== 0;
    } else {
      return Boolean(predicate);
    }
  }

  var UPDATE = (0, _utils.symbol)('UPDATE');
  var INVOKE = (0, _utils.symbol)('INVOKE');
  _exports.INVOKE = INVOKE;
  var ACTION = (0, _utils.symbol)('ACTION');

  var EmberPathReference =
  /*#__PURE__*/
  function () {
    function EmberPathReference() {}

    var _proto2 = EmberPathReference.prototype;

    _proto2.get = function get(key) {
      return PropertyReference.create(this, key);
    };

    return EmberPathReference;
  }();

  var CachedReference$1 =
  /*#__PURE__*/
  function (_EmberPathReference) {
    (0, _emberBabel.inheritsLoose)(CachedReference$1, _EmberPathReference);

    function CachedReference$1() {
      var _this2;

      _this2 = _EmberPathReference.call(this) || this;
      _this2.lastRevision = null;
      _this2.lastValue = null;
      return _this2;
    }

    var _proto3 = CachedReference$1.prototype;

    _proto3.value = function value() {
      var tag = this.tag,
          lastRevision = this.lastRevision,
          lastValue = this.lastValue;

      if (lastRevision === null || !(0, _reference.validate)(tag, lastRevision)) {
        lastValue = this.lastValue = this.compute();
        this.lastRevision = (0, _reference.value)(tag);
      }

      return lastValue;
    };

    return CachedReference$1;
  }(EmberPathReference);

  var RootReference =
  /*#__PURE__*/
  function (_ConstReference) {
    (0, _emberBabel.inheritsLoose)(RootReference, _ConstReference);

    function RootReference(value$$1) {
      var _this3;

      _this3 = _ConstReference.call(this, value$$1) || this;
      _this3.children = Object.create(null);
      return _this3;
    }

    RootReference.create = function create(value$$1) {
      return valueToRef(value$$1);
    };

    var _proto4 = RootReference.prototype;

    _proto4.get = function get(propertyKey) {
      var ref = this.children[propertyKey];

      if (ref === undefined) {
        ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
      }

      return ref;
    };

    return RootReference;
  }(_reference.ConstReference);

  var TwoWayFlushDetectionTag;

  if (false
  /* DEBUG */
  ) {
    TwoWayFlushDetectionTag =
    /*#__PURE__*/
    function () {
      function TwoWayFlushDetectionTag(tag, key, ref) {
        this.tag = tag;
        this.key = key;
        this.ref = ref;
      }

      TwoWayFlushDetectionTag.create = function create(tag, key, ref) {
        return new TwoWayFlushDetectionTag(tag, key, ref);
      };

      var _proto5 = TwoWayFlushDetectionTag.prototype;

      _proto5[_reference.COMPUTE] = function () {
        return this.tag[_reference.COMPUTE]();
      };

      _proto5.didCompute = function didCompute(parent) {
        (0, _metal.didRender)(parent, this.key, this.ref);
      };

      return TwoWayFlushDetectionTag;
    }();
  }

  var PropertyReference =
  /*#__PURE__*/
  function (_CachedReference$) {
    (0, _emberBabel.inheritsLoose)(PropertyReference, _CachedReference$);

    function PropertyReference() {
      return _CachedReference$.apply(this, arguments) || this;
    }

    PropertyReference.create = function create(parentReference, propertyKey) {
      if ((0, _reference.isConst)(parentReference)) {
        return valueKeyToRef(parentReference.value(), propertyKey);
      } else {
        return new NestedPropertyReference(parentReference, propertyKey);
      }
    };

    var _proto6 = PropertyReference.prototype;

    _proto6.get = function get(key) {
      return new NestedPropertyReference(this, key);
    };

    return PropertyReference;
  }(CachedReference$1);

  var RootPropertyReference =
  /*#__PURE__*/
  function (_PropertyReference) {
    (0, _emberBabel.inheritsLoose)(RootPropertyReference, _PropertyReference);

    function RootPropertyReference(parentValue, propertyKey) {
      var _this4;

      _this4 = _PropertyReference.call(this) || this;
      _this4.parentValue = parentValue;
      _this4.propertyKey = propertyKey;
      {
        _this4.propertyTag = (0, _reference.createUpdatableTag)();
      }

      if (false
      /* DEBUG */
      ) {
        _this4.tag = TwoWayFlushDetectionTag.create(_this4.propertyTag, propertyKey, (0, _emberBabel.assertThisInitialized)(_this4));
      } else {
        _this4.tag = _this4.propertyTag;
      }

      if (false
      /* DEBUG */
      && !true
      /* EMBER_METAL_TRACKED_PROPERTIES */
      ) {
          (0, _metal.watchKey)(parentValue, propertyKey);
        }

      return _this4;
    }

    var _proto7 = RootPropertyReference.prototype;

    _proto7.compute = function compute() {
      var parentValue = this.parentValue,
          propertyKey = this.propertyKey;

      if (false
      /* DEBUG */
      ) {
        this.tag.didCompute(parentValue);
      }

      var ret;
      {
        var tag = (0, _metal.track)(function () {
          ret = (0, _metal.get)(parentValue, propertyKey);
        });
        (0, _metal.consume)(tag);
        (0, _reference.update)(this.propertyTag, tag);
      }
      return ret;
    };

    _proto7[UPDATE] = function (value$$1) {
      (0, _metal.set)(this.parentValue, this.propertyKey, value$$1);
    };

    return RootPropertyReference;
  }(PropertyReference);

  if (false
  /* DEBUG */
  ) {
    RootPropertyReference.prototype['debug'] = function debug() {
      return "this." + this['propertyKey'];
    };
  }

  var NestedPropertyReference =
  /*#__PURE__*/
  function (_PropertyReference2) {
    (0, _emberBabel.inheritsLoose)(NestedPropertyReference, _PropertyReference2);

    function NestedPropertyReference(parentReference, propertyKey) {
      var _this5;

      _this5 = _PropertyReference2.call(this) || this;
      _this5.parentReference = parentReference;
      _this5.propertyKey = propertyKey;
      var parentReferenceTag = parentReference.tag;
      var propertyTag = _this5.propertyTag = (0, _reference.createUpdatableTag)();

      if (false
      /* DEBUG */
      ) {
        var tag = (0, _reference.combine)([parentReferenceTag, propertyTag]);
        _this5.tag = TwoWayFlushDetectionTag.create(tag, propertyKey, (0, _emberBabel.assertThisInitialized)(_this5));
      } else {
        _this5.tag = (0, _reference.combine)([parentReferenceTag, propertyTag]);
      }

      return _this5;
    }

    var _proto8 = NestedPropertyReference.prototype;

    _proto8.compute = function compute() {
      var parentReference = this.parentReference,
          propertyTag = this.propertyTag,
          propertyKey = this.propertyKey;

      var _parentValue = parentReference.value();

      var parentValueType = typeof _parentValue;

      if (parentValueType === 'string' && propertyKey === 'length') {
        return _parentValue.length;
      }

      if (parentValueType === 'object' && _parentValue !== null || parentValueType === 'function') {
        var parentValue = _parentValue;

        if (false
        /* DEBUG */
        && !true
        /* EMBER_METAL_TRACKED_PROPERTIES */
        ) {
            (0, _metal.watchKey)(parentValue, propertyKey);
          }

        if (false
        /* DEBUG */
        ) {
          this.tag.didCompute(parentValue);
        }

        var ret;
        {
          var tag = (0, _metal.track)(function () {
            ret = (0, _metal.get)(parentValue, propertyKey);
          });
          (0, _metal.consume)(tag);
          (0, _reference.update)(propertyTag, tag);
        }
        return ret;
      } else {
        return undefined;
      }
    };

    _proto8[UPDATE] = function (value$$1) {
      (0, _metal.set)(this.parentReference.value()
      /* let the other side handle the error */
      , this.propertyKey, value$$1);
    };

    return NestedPropertyReference;
  }(PropertyReference);

  if (false
  /* DEBUG */
  ) {
    NestedPropertyReference.prototype['debug'] = function debug() {
      var parent = this['parentReference'];
      var parentKey = 'unknownObject';
      var selfKey = this['propertyKey'];

      if (typeof parent['debug'] === 'function') {
        parentKey = parent['debug']();
      }

      return parentKey + "." + selfKey;
    };
  }

  var UpdatableReference =
  /*#__PURE__*/
  function (_EmberPathReference2) {
    (0, _emberBabel.inheritsLoose)(UpdatableReference, _EmberPathReference2);

    function UpdatableReference(value$$1) {
      var _this6;

      _this6 = _EmberPathReference2.call(this) || this;
      _this6.tag = (0, _reference.createTag)();
      _this6._value = value$$1;
      return _this6;
    }

    var _proto9 = UpdatableReference.prototype;

    _proto9.value = function value() {
      return this._value;
    };

    _proto9.update = function update(value$$1) {
      var _value = this._value;

      if (value$$1 !== _value) {
        (0, _reference.dirty)(this.tag);
        this._value = value$$1;
      }
    };

    return UpdatableReference;
  }(EmberPathReference);

  _exports.UpdatableReference = UpdatableReference;

  var ConditionalReference$1 =
  /*#__PURE__*/
  function (_ConditionalReference) {
    (0, _emberBabel.inheritsLoose)(ConditionalReference$1, _ConditionalReference);

    ConditionalReference$1.create = function create(reference) {
      if ((0, _reference.isConst)(reference)) {
        var value$$1 = reference.value();

        if (!(0, _utils.isProxy)(value$$1)) {
          return _runtime2.PrimitiveReference.create(_toBool(value$$1));
        }
      }

      return new ConditionalReference$1(reference);
    };

    function ConditionalReference$1(reference) {
      var _this7;

      _this7 = _ConditionalReference.call(this, reference) || this;
      _this7.objectTag = (0, _reference.createUpdatableTag)();
      _this7.tag = (0, _reference.combine)([reference.tag, _this7.objectTag]);
      return _this7;
    }

    var _proto10 = ConditionalReference$1.prototype;

    _proto10.toBool = function toBool(predicate) {
      if ((0, _utils.isProxy)(predicate)) {
        (0, _reference.update)(this.objectTag, (0, _metal.tagForProperty)(predicate, 'isTruthy'));
        return Boolean((0, _metal.get)(predicate, 'isTruthy'));
      } else {
        (0, _reference.update)(this.objectTag, (0, _metal.tagFor)(predicate));
        return _toBool(predicate);
      }
    };

    return ConditionalReference$1;
  }(_runtime2.ConditionalReference);

  var SimpleHelperReference =
  /*#__PURE__*/
  function (_CachedReference$2) {
    (0, _emberBabel.inheritsLoose)(SimpleHelperReference, _CachedReference$2);

    function SimpleHelperReference(helper$$1, args) {
      var _this8;

      _this8 = _CachedReference$2.call(this) || this;
      _this8.helper = helper$$1;
      _this8.args = args;
      var computeTag = _this8.computeTag = (0, _reference.createUpdatableTag)();
      _this8.tag = (0, _reference.combine)([args.tag, computeTag]);
      return _this8;
    }

    SimpleHelperReference.create = function create(helper$$1, args) {
      if ((0, _reference.isConst)(args)) {
        var positional = args.positional,
            named = args.named;
        var positionalValue = positional.value();
        var namedValue = named.value();

        if (false
        /* DEBUG */
        ) {
          (0, _debug.debugFreeze)(positionalValue);
          (0, _debug.debugFreeze)(namedValue);
        }

        var result = helper$$1(positionalValue, namedValue);
        return valueToRef(result);
      } else {
        return new SimpleHelperReference(helper$$1, args);
      }
    };

    var _proto11 = SimpleHelperReference.prototype;

    _proto11.compute = function compute() {
      var helper$$1 = this.helper,
          computeTag = this.computeTag,
          _this$args = this.args,
          positional = _this$args.positional,
          named = _this$args.named;
      var positionalValue = positional.value();
      var namedValue = named.value();

      if (false
      /* DEBUG */
      ) {
        (0, _debug.debugFreeze)(positionalValue);
        (0, _debug.debugFreeze)(namedValue);
      }

      var computedValue;
      var combinedTrackingTag = (0, _metal.track)(function () {
        return computedValue = helper$$1(positionalValue, namedValue);
      });
      (0, _reference.update)(computeTag, combinedTrackingTag);
      return computedValue;
    };

    return SimpleHelperReference;
  }(CachedReference$1);

  var ClassBasedHelperReference =
  /*#__PURE__*/
  function (_CachedReference$3) {
    (0, _emberBabel.inheritsLoose)(ClassBasedHelperReference, _CachedReference$3);

    function ClassBasedHelperReference(instance, args) {
      var _this9;

      _this9 = _CachedReference$3.call(this) || this;
      _this9.instance = instance;
      _this9.args = args;
      var computeTag = _this9.computeTag = (0, _reference.createUpdatableTag)();
      _this9.tag = (0, _reference.combine)([instance[RECOMPUTE_TAG], args.tag, computeTag]);
      return _this9;
    }

    ClassBasedHelperReference.create = function create(instance, args) {
      return new ClassBasedHelperReference(instance, args);
    };

    var _proto12 = ClassBasedHelperReference.prototype;

    _proto12.compute = function compute() {
      var instance = this.instance,
          computeTag = this.computeTag,
          _this$args2 = this.args,
          positional = _this$args2.positional,
          named = _this$args2.named;
      var positionalValue = positional.value();
      var namedValue = named.value();

      if (false
      /* DEBUG */
      ) {
        (0, _debug.debugFreeze)(positionalValue);
        (0, _debug.debugFreeze)(namedValue);
      }

      var computedValue;
      var combinedTrackingTag = (0, _metal.track)(function () {
        return computedValue = instance.compute(positionalValue, namedValue);
      });
      (0, _reference.update)(computeTag, combinedTrackingTag);
      return computedValue;
    };

    return ClassBasedHelperReference;
  }(CachedReference$1);

  var InternalHelperReference =
  /*#__PURE__*/
  function (_CachedReference$4) {
    (0, _emberBabel.inheritsLoose)(InternalHelperReference, _CachedReference$4);

    function InternalHelperReference(helper$$1, args) {
      var _this10;

      _this10 = _CachedReference$4.call(this) || this;
      _this10.helper = helper$$1;
      _this10.args = args;
      _this10.tag = args.tag;
      return _this10;
    }

    var _proto13 = InternalHelperReference.prototype;

    _proto13.compute = function compute() {
      var helper$$1 = this.helper,
          args = this.args;
      return helper$$1(args);
    };

    return InternalHelperReference;
  }(CachedReference$1);

  var UnboundReference =
  /*#__PURE__*/
  function (_ConstReference2) {
    (0, _emberBabel.inheritsLoose)(UnboundReference, _ConstReference2);

    function UnboundReference() {
      return _ConstReference2.apply(this, arguments) || this;
    }

    UnboundReference.create = function create(value$$1) {
      return valueToRef(value$$1, false);
    };

    var _proto14 = UnboundReference.prototype;

    _proto14.get = function get(key) {
      return valueToRef(this.inner[key], false);
    };

    return UnboundReference;
  }(_reference.ConstReference);

  var ReadonlyReference =
  /*#__PURE__*/
  function (_CachedReference$5) {
    (0, _emberBabel.inheritsLoose)(ReadonlyReference, _CachedReference$5);

    function ReadonlyReference(inner) {
      var _this11;

      _this11 = _CachedReference$5.call(this) || this;
      _this11.inner = inner;
      _this11.tag = inner.tag;
      return _this11;
    }

    var _proto15 = ReadonlyReference.prototype;

    _proto15.compute = function compute() {
      return this.inner.value();
    };

    _proto15.get = function get(key) {
      return this.inner.get(key);
    };

    (0, _emberBabel.createClass)(ReadonlyReference, [{
      key: INVOKE,
      get: function get() {
        return this.inner[INVOKE];
      }
    }]);
    return ReadonlyReference;
  }(CachedReference$1);

  function referenceFromParts(root, parts) {
    var reference = root;

    for (var i = 0; i < parts.length; i++) {
      reference = reference.get(parts[i]);
    }

    return reference;
  }

  function isObject(value$$1) {
    return value$$1 !== null && typeof value$$1 === 'object';
  }

  function isFunction(value$$1) {
    return typeof value$$1 === 'function';
  }

  function isPrimitive(value$$1) {
    if (false
    /* DEBUG */
    ) {
      var label;

      try {
        label = " (was `" + String(value$$1) + "`)";
      } catch (e) {
        label = null;
      }

      (false && !(value$$1 === undefined || value$$1 === null || typeof value$$1 === 'boolean' || typeof value$$1 === 'number' || typeof value$$1 === 'string') && (0, _debug.assert)("This is a fall-through check for typing purposes only! `value` must already be a primitive at this point." + label + ")", value$$1 === undefined || value$$1 === null || typeof value$$1 === 'boolean' || typeof value$$1 === 'number' || typeof value$$1 === 'string'));
    }

    return true;
  }

  function valueToRef(value$$1, bound) {
    if (bound === void 0) {
      bound = true;
    }

    if (isObject(value$$1)) {
      // root of interop with ember objects
      return bound ? new RootReference(value$$1) : new UnboundReference(value$$1);
    } else if (isFunction(value$$1)) {
      // ember doesn't do observing with functions
      return new UnboundReference(value$$1);
    } else if (isPrimitive(value$$1)) {
      return _runtime2.PrimitiveReference.create(value$$1);
    } else if (false
    /* DEBUG */
    ) {
      var type = typeof value$$1;
      var output;

      try {
        output = String(value$$1);
      } catch (e) {
        output = null;
      }

      if (output) {
        throw (0, _util.unreachable)("[BUG] Unexpected " + type + " (" + output + ")");
      } else {
        throw (0, _util.unreachable)("[BUG] Unexpected " + type);
      }
    } else {
      throw (0, _util.unreachable)();
    }
  }

  function valueKeyToRef(value$$1, key) {
    if (isObject(value$$1)) {
      // root of interop with ember objects
      return new RootPropertyReference(value$$1, key);
    } else if (isFunction(value$$1)) {
      // ember doesn't do observing with functions
      return new UnboundReference(value$$1[key]);
    } else if (isPrimitive(value$$1)) {
      return _runtime2.UNDEFINED_REFERENCE;
    } else if (false
    /* DEBUG */
    ) {
      var type = typeof value$$1;
      var output;

      try {
        output = String(value$$1);
      } catch (e) {
        output = null;
      }

      if (output) {
        throw (0, _util.unreachable)("[BUG] Unexpected " + type + " (" + output + ")");
      } else {
        throw (0, _util.unreachable)("[BUG] Unexpected " + type);
      }
    } else {
      throw (0, _util.unreachable)();
    }
  }

  var DIRTY_TAG = (0, _utils.symbol)('DIRTY_TAG');
  var ARGS = (0, _utils.symbol)('ARGS');
  var ROOT_REF = (0, _utils.symbol)('ROOT_REF');
  _exports.ROOT_REF = ROOT_REF;
  var IS_DISPATCHING_ATTRS = (0, _utils.symbol)('IS_DISPATCHING_ATTRS');
  var HAS_BLOCK = (0, _utils.symbol)('HAS_BLOCK');
  var BOUNDS = (0, _utils.symbol)('BOUNDS');
  /**
  @module @ember/component
  */

  /**
    A component is an isolated piece of UI, represented by a template and an
    optional class. When a component has a class, its template's `this` value
    is an instance of the component class.
  
    ## Template-only Components
  
    The simplest way to create a component is to create a template file in
    `app/templates/components`. For example, if you name a template
    `app/templates/components/person-profile.hbs`:
  
    ```app/templates/components/person-profile.hbs
    <h1>{{@person.name}}</h1>
    <img src={{@person.avatar}}>
    <p class='signature'>{{@person.signature}}</p>
    ```
  
    You will be able to use `<PersonProfile />` to invoke this component elsewhere
    in your application:
  
    ```app/templates/application.hbs
    <PersonProfile @person={{this.currentUser}} />
    ```
  
    Note that component names are capitalized here in order to distinguish them
    from regular HTML elements, but they are dasherized in the file system.
  
    While the angle bracket invocation form is generally preferred, it is also
    possible to invoke the same component with the `{{person-profile}}` syntax:
  
    ```app/templates/application.hbs
    {{person-profile person=this.currentUser}}
    ```
  
    Note that with this syntax, you use dashes in the component name and
    arguments are passed without the `@` sign.
  
    In both cases, Ember will render the content of the component template we
    created above. The end result will be something like this:
  
    ```html
    <h1>Tomster</h1>
    <img src="https://emberjs.com/tomster.jpg">
    <p class='signature'>Out of office this week</p>
    ```
  
    ## File System Nesting
  
    Components can be nested inside sub-folders for logical groupping. For
    example, if we placed our template in
    `app/templates/components/person/short-profile.hbs`, we can invoke it as
    `<Person::ShortProfile />`:
  
    ```app/templates/application.hbs
    <Person::ShortProfile @person={{this.currentUser}} />
    ```
  
    Or equivalently, `{{person/short-profile}}`:
  
    ```app/templates/application.hbs
    {{person/short-profile person=this.currentUser}}
    ```
  
    ## Yielding Contents
  
    You can use `yield` inside a template to include the **contents** of any block
    attached to the component. The block will be executed in its original context:
  
    ```handlebars
    <PersonProfile @person={{this.currentUser}}>
      <p>Admin mode</p>
      {{! Executed in the current context. }}
    </PersonProfile>
    ```
  
    or
  
    ```handlebars
    {{#person-profile person=this.currentUser}}
      <p>Admin mode</p>
      {{! Executed in the current context. }}
    {{/person-profile}}
    ```
  
    ```app/templates/components/person-profile.hbs
    <h1>{{@person.name}}</h1>
    {{yield}}
    ```
  
    ## Customizing Components With JavaScript
  
    If you want to customize the component in order to handle events, transform
    arguments or maintain internal state, you implement a subclass of `Component`.
  
    One example is to add computed properties to your component:
  
    ```app/components/person-profile.js
    import Component from '@ember/component';
  
    export default Component.extend({
      displayName: computed('person.title', 'person.firstName', 'person.lastName', function() {
        let { title, firstName, lastName } = this;
  
        if (title) {
          return `${title} ${lastName}`;
        } else {
          return `${firstName} ${lastName}`;
        }
      })
    });
    ```
  
    And then use it in the component's template:
  
    ```app/templates/components/person-profile.hbs
    <h1>{{this.displayName}}</h1>
    {{yield}}
    ```
  
    ## Customizing a Component's HTML Element in JavaScript
  
    ### HTML Tag
  
    The default HTML tag name used for a component's HTML representation is `div`.
    This can be customized by setting the `tagName` property.
  
    Consider the following component class:
  
    ```app/components/emphasized-paragraph.js
    import Component from '@ember/component';
  
    export default Component.extend({
      tagName: 'em'
    });
    ```
  
    When invoked, this component would produce output that looks something like
    this:
  
    ```html
    <em id="ember1" class="ember-view"></em>
    ```
  
    ### HTML `class` Attribute
  
    The HTML `class` attribute of a component's tag can be set by providing a
    `classNames` property that is set to an array of strings:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    export default Component.extend({
      classNames: ['my-class', 'my-other-class']
    });
    ```
  
    Invoking this component will produce output that looks like this:
  
    ```html
    <div id="ember1" class="ember-view my-class my-other-class"></div>
    ```
  
    `class` attribute values can also be set by providing a `classNameBindings`
    property set to an array of properties names for the component. The return
    value of these properties will be added as part of the value for the
    components's `class` attribute. These properties can be computed properties:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
    import { computed } from '@ember/object';
  
    export default Component.extend({
      classNames: ['my-class', 'my-other-class'],
      classNameBindings: ['propertyA', 'propertyB'],
  
      propertyA: 'from-a',
      propertyB: computed(function() {
        if (someLogic) { return 'from-b'; }
      })
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view my-class my-other-class from-a from-b"></div>
    ```
  
    Note that `classNames` and `classNameBindings` is in addition to the `class`
    attribute passed with the angle bracket invocation syntax. Therefore, if this
    component was invoked like so:
  
    ```handlebars
    <MyWidget class="from-invocation" />
    ```
  
    The resulting HTML will look similar to this:
  
    ```html
    <div id="ember1" class="from-invocation ember-view my-class my-other-class from-a from-b"></div>
    ```
  
    If the value of a class name binding returns a boolean the property name
    itself will be used as the class name if the property is true. The class name
    will not be added if the value is `false` or `undefined`.
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    export default Component.extend({
      classNameBindings: ['hovered'],
  
      hovered: true
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view hovered"></div>
    ```
  
    ### Custom Class Names for Boolean Values
  
    When using boolean class name bindings you can supply a string value other
    than the property name for use as the `class` HTML attribute by appending the
    preferred value after a ":" character when defining the binding:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    export default Component.extend({
      classNameBindings: ['awesome:so-very-cool'],
  
      awesome: true
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view so-very-cool"></div>
    ```
  
    Boolean value class name bindings whose property names are in a
    camelCase-style format will be converted to a dasherized format:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    export default Component.extend({
      classNameBindings: ['isUrgent'],
  
      isUrgent: true
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view is-urgent"></div>
    ```
  
    Class name bindings can also refer to object values that are found by
    traversing a path relative to the component itself:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
    import EmberObject from '@ember/object';
  
    export default Component.extend({
      classNameBindings: ['messages.empty'],
  
      messages: EmberObject.create({
        empty: true
      })
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view empty"></div>
    ```
  
    If you want to add a class name for a property which evaluates to true and
    and a different class name if it evaluates to false, you can pass a binding
    like this:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    export default Component.extend({
      classNameBindings: ['isEnabled:enabled:disabled'],
      isEnabled: true
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view enabled"></div>
    ```
  
    When isEnabled is `false`, the resulting HTML representation looks like this:
  
    ```html
    <div id="ember1" class="ember-view disabled"></div>
    ```
  
    This syntax offers the convenience to add a class if a property is `false`:
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    // Applies no class when isEnabled is true and class 'disabled' when isEnabled is false
    export default Component.extend({
      classNameBindings: ['isEnabled::disabled'],
      isEnabled: true
    });
    ```
  
    Invoking this component when the `isEnabled` property is true will produce
    HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view"></div>
    ```
  
    Invoking it when the `isEnabled` property on the component is `false` will
    produce HTML that looks like:
  
    ```html
    <div id="ember1" class="ember-view disabled"></div>
    ```
  
    Updates to the value of a class name binding will result in automatic update
    of the  HTML `class` attribute in the component's rendered HTML
    representation. If the value becomes `false` or `undefined` the class name
    will be removed.
  
    Both `classNames` and `classNameBindings` are concatenated properties. See
    [EmberObject](/ember/release/classes/EmberObject) documentation for more
    information about concatenated properties.
  
    ### Other HTML Attributes
  
    The HTML attribute section of a component's tag can be set by providing an
    `attributeBindings` property set to an array of property names on the component.
    The return value of these properties will be used as the value of the component's
    HTML associated attribute:
  
    ```app/components/my-anchor.js
    import Component from '@ember/component';
  
    export default Component.extend({
      tagName: 'a',
      attributeBindings: ['href'],
  
      href: 'http://google.com'
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <a id="ember1" class="ember-view" href="http://google.com"></a>
    ```
  
    One property can be mapped on to another by placing a ":" between
    the source property and the destination property:
  
    ```app/components/my-anchor.js
    import Component from '@ember/component';
  
    export default Component.extend({
      tagName: 'a',
      attributeBindings: ['url:href'],
  
      url: 'http://google.com'
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <a id="ember1" class="ember-view" href="http://google.com"></a>
    ```
  
    HTML attributes passed with angle bracket invocations will take precedence
    over those specified in `attributeBindings`. Therefore, if this component was
    invoked like so:
  
    ```handlebars
    <MyAnchor href="http://bing.com" @url="http://google.com" />
    ```
  
    The resulting HTML will looks like this:
  
    ```html
    <a id="ember1" class="ember-view" href="http://bing.com"></a>
    ```
  
    Note that the `href` attribute is ultimately set to `http://bing.com`,
    despite it having attribute binidng to the `url` property, which was
    set to `http://google.com`.
  
    Namespaced attributes (e.g. `xlink:href`) are supported, but have to be
    mapped, since `:` is not a valid character for properties in Javascript:
  
    ```app/components/my-use.js
    import Component from '@ember/component';
  
    export default Component.extend({
      tagName: 'use',
      attributeBindings: ['xlinkHref:xlink:href'],
  
      xlinkHref: '#triangle'
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <use xlink:href="#triangle"></use>
    ```
  
    If the value of a property monitored by `attributeBindings` is a boolean, the
    attribute will be present or absent depending on the value:
  
    ```app/components/my-text-input.js
    import Component from '@ember/component';
  
    export default Component.extend({
      tagName: 'input',
      attributeBindings: ['disabled'],
  
      disabled: false
    });
    ```
  
    Invoking this component will produce HTML that looks like:
  
    ```html
    <input id="ember1" class="ember-view" />
    ```
  
    `attributeBindings` can refer to computed properties:
  
    ```app/components/my-text-input.js
    import Component from '@ember/component';
    import { computed } from '@ember/object';
  
    export default Component.extend({
      tagName: 'input',
      attributeBindings: ['disabled'],
  
      disabled: computed(function() {
        if (someLogic) {
          return true;
        } else {
          return false;
        }
      })
    });
    ```
  
    To prevent setting an attribute altogether, use `null` or `undefined` as the
    value of the property used in `attributeBindings`:
  
    ```app/components/my-text-input.js
    import Component from '@ember/component';
  
    export default Component.extend({
      tagName: 'form',
      attributeBindings: ['novalidate'],
      novalidate: null
    });
    ```
  
    Updates to the property of an attribute binding will result in automatic
    update of the  HTML attribute in the component's HTML output.
  
    `attributeBindings` is a concatenated property. See
    [EmberObject](/ember/release/classes/EmberObject) documentation for more
    information about concatenated properties.
  
    ## Layouts
  
    The `layout` property can be used to dynamically specify a template associated
    with a component class, instead of relying on Ember to link together a
    component class and a template based on file names.
  
    In general, applications should not use this feature, but it's commonly used
    in addons for historical reasons.
  
    The `layout` property should be set to the default export of a template
    module, which is the name of a template file without the `.hbs` extension.
  
    ```app/templates/components/person-profile.hbs
    <h1>Person's Title</h1>
    <div class='details'>{{yield}}</div>
    ```
  
    ```app/components/person-profile.js
      import Component from '@ember/component';
      import layout from '../templates/components/person-profile';
  
      export default Component.extend({
        layout
      });
    ```
  
    If you invoke the component:
  
    ```handlebars
    <PersonProfile>
      <h2>Chief Basket Weaver</h2>
      <h3>Fisherman Industries</h3>
    </PersonProfile>
    ```
  
    or
  
    ```handlebars
    {{#person-profile}}
      <h2>Chief Basket Weaver</h2>
      <h3>Fisherman Industries</h3>
    {{/person-profile}}
    ```
  
    It will result in the following HTML output:
  
    ```html
    <h1>Person's Title</h1>
      <div class="details">
      <h2>Chief Basket Weaver</h2>
      <h3>Fisherman Industries</h3>
    </div>
    ```
  
    ## Handling Browser Events
  
    Components can respond to user-initiated events in one of three ways: passing
    actions with angle bracket invocation, adding event handler methods to the
    component's class, or adding actions to the component's template.
  
    ### Passing Actions With Angle Bracket Invoation
  
    For one-off events specific to particular instance of a component, it is possible
    to pass actions to the component's element using angle bracket invoation syntax.
  
    ```handlebars
    <MyWidget {{action 'firstWidgetClicked'}} />
  
    <MyWidget {{action 'secondWidgetClicked'}} />
    ```
  
    In this case, when the first component is clicked on, Ember will invoke the
    `firstWidgetClicked` action. When the second component is clicked on, Ember
    will invoke the `secondWidgetClicked` action instead.
  
    Besides `{{action}}`, it is also possible to pass any arbitrary element modifiers
    using the angle bracket invocation syntax.
  
    ### Event Handler Methods
  
    Components can also respond to user-initiated events by implementing a method
    that matches the event name. This approach is appropiate when the same event
    should be handled by all instances of the same component.
  
    An event object will be passed as the argument to the event handler method.
  
    ```app/components/my-widget.js
    import Component from '@ember/component';
  
    export default Component.extend({
      click(event) {
        // `event.target` is either the component's element or one of its children
        let tag = event.target.tagName.toLowerCase();
        console.log('clicked on a `<${tag}>` HTML element!');
      }
    });
    ```
  
    In this example, whenever the user clicked anywhere inside the component, it
    will log a message to the console.
  
    It is possible to handle event types other than `click` by implementing the
    following event handler methods. In addition, custom events can be registered
    by using `Application.customEvents`.
  
    Touch events:
  
    * `touchStart`
    * `touchMove`
    * `touchEnd`
    * `touchCancel`
  
    Keyboard events:
  
    * `keyDown`
    * `keyUp`
    * `keyPress`
  
    Mouse events:
  
    * `mouseDown`
    * `mouseUp`
    * `contextMenu`
    * `click`
    * `doubleClick`
    * `focusIn`
    * `focusOut`
  
    Form events:
  
    * `submit`
    * `change`
    * `focusIn`
    * `focusOut`
    * `input`
  
    Drag and drop events:
  
    * `dragStart`
    * `drag`
    * `dragEnter`
    * `dragLeave`
    * `dragOver`
    * `dragEnd`
    * `drop`
  
    ### `{{action}}` Helper
  
    Instead of handling all events of a particular type anywhere inside the
    component's element, you may instead want to limit it to a particular
    element in the component's template. In this case, it would be more
    convenient to implement an action instead.
  
    For example, you could implement the action `hello` for the `person-profile`
    component:
  
    ```app/components/person-profile.js
    import Component from '@ember/component';
  
    export default Component.extend({
      actions: {
        hello(name) {
          console.log("Hello", name);
        }
      }
    });
    ```
  
    And then use it in the component's template:
  
    ```app/templates/components/person-profile.hbs
    <h1>{{@person.name}}</h1>
  
    <button {{action 'hello' @person.name}}>
      Say Hello to {{@person.name}}
    </button>
    ```
  
    When the user clicks the button, Ember will invoke the `hello` action,
    passing in the current value of `@person.name` as an argument.
  
    See [Ember.Templates.helpers.action](/ember/release/classes/Ember.Templates.helpers/methods/action?anchor=action).
  
    @class Component
    @extends Ember.CoreView
    @uses Ember.TargetActionSupport
    @uses Ember.ClassNamesSupport
    @uses Ember.ActionSupport
    @uses Ember.ViewMixin
    @uses Ember.ViewStateSupport
    @public
  */

  var Component = _views.CoreView.extend(_views.ChildViewsSupport, _views.ViewStateSupport, _views.ClassNamesSupport, _runtime.TargetActionSupport, _views.ActionSupport, _views.ViewMixin, (_CoreView$extend = {
    isComponent: true,
    init: function init() {
      this._super.apply(this, arguments);

      this[IS_DISPATCHING_ATTRS] = false;
      this[DIRTY_TAG] = (0, _reference.createTag)();
      this[ROOT_REF] = new RootReference(this);
      this[BOUNDS] = null;

      if (false
      /* DEBUG */
      && this.renderer._destinedForDOM && this.tagName === '') {
        var eventNames = [];
        var eventDispatcher = (0, _owner.getOwner)(this).lookup('event_dispatcher:main');
        var events = eventDispatcher && eventDispatcher._finalEvents || {}; // tslint:disable-next-line:forin

        for (var key in events) {
          var methodName = events[key];

          if (typeof this[methodName] === 'function') {
            eventNames.push(methodName);
          }
        } // If in a tagless component, assert that no event handlers are defined


        (false && !(!eventNames.length) && (0, _debug.assert)( // tslint:disable-next-line:max-line-length
        "You can not define `" + eventNames + "` function(s) to handle DOM event in the `" + this + "` tagless component since it doesn't have any DOM element.", !eventNames.length));
      }

      (false && !(this.mouseEnter === undefined) && (0, _debug.deprecate)(this + ": Using `mouseEnter` event handler methods in components has been deprecated.", this.mouseEnter === undefined, {
        id: 'ember-views.event-dispatcher.mouseenter-leave-move',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_component-mouseenter-leave-move'
      }));
      (false && !(this.mouseLeave === undefined) && (0, _debug.deprecate)(this + ": Using `mouseLeave` event handler methods in components has been deprecated.", this.mouseLeave === undefined, {
        id: 'ember-views.event-dispatcher.mouseenter-leave-move',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_component-mouseenter-leave-move'
      }));
      (false && !(this.mouseMove === undefined) && (0, _debug.deprecate)(this + ": Using `mouseMove` event handler methods in components has been deprecated.", this.mouseMove === undefined, {
        id: 'ember-views.event-dispatcher.mouseenter-leave-move',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_component-mouseenter-leave-move'
      }));
    },
    rerender: function rerender() {
      (0, _reference.dirty)(this[DIRTY_TAG]);

      this._super();
    }
  }, _CoreView$extend[_metal.PROPERTY_DID_CHANGE] = function (key) {
    if (this[IS_DISPATCHING_ATTRS]) {
      return;
    }

    var args = this[ARGS];
    var reference = args !== undefined ? args[key] : undefined;

    if (reference !== undefined && reference[UPDATE] !== undefined) {
      reference[UPDATE]((0, _metal.get)(this, key));
    }
  }, _CoreView$extend.getAttr = function getAttr(key) {
    // TODO Intimate API should be deprecated
    return this.get(key);
  }, _CoreView$extend.readDOMAttr = function readDOMAttr(name) {
    // TODO revisit this
    var _element = (0, _views.getViewElement)(this);

    (false && !(_element !== null) && (0, _debug.assert)("Cannot call `readDOMAttr` on " + this + " which does not have an element", _element !== null));
    var element = _element;
    var isSVG = element.namespaceURI === _runtime2.SVG_NAMESPACE;

    var _normalizeProperty = (0, _runtime2.normalizeProperty)(element, name),
        type = _normalizeProperty.type,
        normalized = _normalizeProperty.normalized;

    if (isSVG || type === 'attr') {
      return element.getAttribute(normalized);
    }

    return element[normalized];
  }, _CoreView$extend.didReceiveAttrs = function didReceiveAttrs() {}, _CoreView$extend.didRender = function didRender() {}, _CoreView$extend.willRender = function willRender() {}, _CoreView$extend.didUpdateAttrs = function didUpdateAttrs() {}, _CoreView$extend.willUpdate = function willUpdate() {}, _CoreView$extend.didUpdate = function didUpdate() {}, _CoreView$extend));

  _exports.Component = Component;

  Component.toString = function () {
    return '@ember/component';
  };

  Component.reopenClass({
    isComponentFactory: true,
    positionalParams: []
  });
  (0, _runtime.setFrameworkClass)(Component);
  var layout = template({
    "id": "hvtsz7RF",
    "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}",
    "meta": {
      "moduleName": "packages/@ember/-internals/glimmer/lib/templates/empty.hbs"
    }
  });
  /**
  @module @ember/component
  */

  /**
    The internal class used to create text inputs when the `{{input}}`
    helper is used with `type` of `checkbox`.
  
    See [Ember.Templates.helpers.input](/ember/release/classes/Ember.Templates.helpers/methods/input?anchor=input)  for usage details.
  
    ## Direct manipulation of `checked`
  
    The `checked` attribute of an `Checkbox` object should always be set
    through the Ember object or by interacting with its rendered element
    representation via the mouse, keyboard, or touch. Updating the value of the
    checkbox via jQuery will result in the checked value of the object and its
    element losing synchronization.
  
    ## Layout and LayoutName properties
  
    Because HTML `input` elements are self closing `layout` and `layoutName`
    properties will not be applied.
  
    @class Checkbox
    @extends Component
    @public
  */

  var Checkbox = Component.extend({
    layout: layout,

    /**
      By default, this component will add the `ember-checkbox` class to the component's element.
         @property classNames
      @type Array | String
      @default ['ember-checkbox']
      @public
     */
    classNames: ['ember-checkbox'],
    tagName: 'input',

    /**
      By default this component will forward a number of arguments to attributes on the the
      component's element:
         * indeterminate
      * disabled
      * tabindex
      * name
      * autofocus
      * required
      * form
         When invoked with curly braces, this is the exhaustive list of HTML attributes you can
      customize (i.e. `{{input type="checkbox" disabled=true}}`).
         When invoked with angle bracket invocation, this list is irrelevant, because you can use HTML
      attribute syntax to customize the element (i.e.
      `<Input @type="checkbox" disabled data-custom="custom value" />`). However, `@type` and
      `@checked` must be passed as named arguments, not attributes.
         @property attributeBindings
      @type Array | String
      @default ['type', 'checked', 'indeterminate', 'disabled', 'tabindex', 'name', 'autofocus', 'required', 'form']
      @public
    */
    attributeBindings: ['type', 'checked', 'indeterminate', 'disabled', 'tabindex', 'name', 'autofocus', 'required', 'form'],

    /**
      Sets the `type` attribute of the `Checkbox`'s element
         @property disabled
      @default false
      @private
     */
    type: 'checkbox',

    /**
      Sets the `disabled` attribute of the `Checkbox`'s element
         @property disabled
      @default false
      @public
     */
    disabled: false,

    /**
      Corresponds to the `indeterminate` property of the `Checkbox`'s element
         @property disabled
      @default false
      @public
     */
    indeterminate: false,

    /**
      Whenever the checkbox is inserted into the DOM, perform initialization steps, which include
      setting the indeterminate property if needed.
         If this method is overridden, `super` must be called.
         @method
      @public
     */
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      this.element.indeterminate = Boolean(this.indeterminate);
    },

    /**
      Whenever the `change` event is fired on the checkbox, update its `checked` property to reflect
      whether the checkbox is checked.
         If this method is overridden, `super` must be called.
         @method
      @public
     */
    change: function change() {
      (0, _metal.set)(this, 'checked', this.element.checked);
    }
  });
  _exports.Checkbox = Checkbox;

  if (false
  /* DEBUG */
  ) {
    var UNSET = {};
    Checkbox.reopen({
      value: UNSET,
      didReceiveAttrs: function didReceiveAttrs() {
        this._super();

        (false && !(!(this.type === 'checkbox' && this.value !== UNSET)) && (0, _debug.assert)("`<Input @type='checkbox' @value={{...}} />` is not supported; " + "please use `<Input @type='checkbox' @checked={{...}} />` instead.", !(this.type === 'checkbox' && this.value !== UNSET)));
      }
    });
  }

  Checkbox.toString = function () {
    return '@ember/component/checkbox';
  };
  /**
  @module @ember/component
  */


  var inputTypes = _browserEnvironment.hasDOM ? Object.create(null) : null;

  function canSetTypeOfInput(type) {
    // if running in outside of a browser always return
    // the original type
    if (!_browserEnvironment.hasDOM) {
      return Boolean(type);
    }

    if (type in inputTypes) {
      return inputTypes[type];
    }

    var inputTypeTestElement = document.createElement('input');

    try {
      inputTypeTestElement.type = type;
    } catch (e) {// ignored
    }

    return inputTypes[type] = inputTypeTestElement.type === type;
  }
  /**
    The internal class used to create text inputs when the `Input` component is used with `type` of `text`.
  
    See [Ember.Templates.components.Input](/ember/release/classes/Ember.Templates.components/methods/Input?anchor=Input) for usage details.
  
    ## Layout and LayoutName properties
  
    Because HTML `input` elements are self closing `layout` and `layoutName`
    properties will not be applied.
  
    @class TextField
    @extends Component
    @uses Ember.TextSupport
    @public
  */


  var TextField = Component.extend(_views.TextSupport, {
    layout: layout,

    /**
      By default, this component will add the `ember-text-field` class to the component's element.
         @property classNames
      @type Array | String
      @default ['ember-text-field']
      @public
     */
    classNames: ['ember-text-field'],
    tagName: 'input',

    /**
      By default this component will forward a number of arguments to attributes on the the
      component's element:
         * accept
      * autocomplete
      * autosave
      * dir
      * formaction
      * formenctype
      * formmethod
      * formnovalidate
      * formtarget
      * height
      * inputmode
      * lang
      * list
      * type
      * max
      * min
      * multiple
      * name
      * pattern
      * size
      * step
      * value
      * width
         When invoked with `{{input type="text"}}`, you can only customize these attributes. When invoked
      with `<Input @type="text" />`, you can just use HTML attributes directly.
         @property attributeBindings
      @type Array | String
      @default ['accept', 'autocomplete', 'autosave', 'dir', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'height', 'inputmode', 'lang', 'list', 'type', 'max', 'min', 'multiple', 'name', 'pattern', 'size', 'step', 'value', 'width']
      @public
    */
    attributeBindings: ['accept', 'autocomplete', 'autosave', 'dir', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'height', 'inputmode', 'lang', 'list', 'type', 'max', 'min', 'multiple', 'name', 'pattern', 'size', 'step', 'value', 'width'],

    /**
      As the user inputs text, this property is updated to reflect the `value` property of the HTML
      element.
         @property value
      @type String
      @default ""
      @public
    */
    value: '',

    /**
      The `type` attribute of the input element.
         @property type
      @type String
      @default "text"
      @public
    */
    type: (0, _metal.computed)({
      get: function get() {
        return 'text';
      },
      set: function set(_key, value$$1) {
        var type = 'text';

        if (canSetTypeOfInput(value$$1)) {
          type = value$$1;
        }

        return type;
      }
    }),

    /**
      The `size` of the text field in characters.
         @property size
      @type String
      @default null
      @public
    */
    size: null,

    /**
      The `pattern` attribute of input element.
         @property pattern
      @type String
      @default null
      @public
    */
    pattern: null,

    /**
      The `min` attribute of input element used with `type="number"` or `type="range"`.
         @property min
      @type String
      @default null
      @since 1.4.0
      @public
    */
    min: null,

    /**
      The `max` attribute of input element used with `type="number"` or `type="range"`.
         @property max
      @type String
      @default null
      @since 1.4.0
      @public
    */
    max: null
  });
  _exports.TextField = TextField;

  TextField.toString = function () {
    return '@ember/component/text-field';
  };
  /**
  @module @ember/component
  */

  /**
    The `Textarea` component inserts a new instance of `<textarea>` tag into the template.
  
    The `@value` argument provides the content of the `<textarea>`.
  
    This template:
  
    ```handlebars
    <Textarea @value="A bunch of text" />
    ```
  
    Would result in the following HTML:
  
    ```html
    <textarea class="ember-text-area">
      A bunch of text
    </textarea>
    ```
  
    The `@value` argument is two-way bound. If the user types text into the textarea, the `@value`
    argument is updated. If the `@value` argument is updated, the text in the textarea is updated.
  
    In the following example, the `writtenWords` property on the component will be updated as the user
    types 'Lots of text' into the text area of their browser's window.
  
    ```app/components/word-editor.js
    import Component from '@glimmer/component';
    import { tracked } from '@glimmer/tracking';
  
    export default class WordEditorComponent extends Component {
      @tracked writtenWords = "Lots of text that IS bound";
    }
    ```
  
    ```handlebars
    <Textarea @value={{writtenWords}} />
    ```
  
    Would result in the following HTML:
  
    ```html
    <textarea class="ember-text-area">
      Lots of text that IS bound
    </textarea>
    ```
  
    If you wanted a one way binding, you could use the `<textarea>` element directly, and use the
    `value` DOM property and the `input` event.
  
    ### Actions
  
    The `Textarea` component takes a number of arguments with callbacks that are invoked in
    response to user events.
  
    * `enter`
    * `insert-newline`
    * `escape-press`
    * `focus-in`
    * `focus-out`
    * `key-press`
  
    These callbacks are passed to `Textarea` like this:
  
    ```handlebars
    <Textarea @value={{this.searchWord}} @enter={{this.query}} />
    ```
  
    ## Classic Invocation Syntax
  
    The `Textarea` component can also be invoked using curly braces, just like any other Ember
    component.
  
    For example, this is an invocation using angle-bracket notation:
  
    ```handlebars
    <Textarea @value={{this.searchWord}} @enter={{this.query}} />
    ```
  
    You could accomplish the same thing using classic invocation:
  
    ```handlebars
    {{textarea value=this.searchWord enter=this.query}}
    ```
  
    The main difference is that angle-bracket invocation supports any HTML attribute using HTML
    attribute syntax, because attributes and arguments have different syntax when using angle-bracket
    invocation. Curly brace invocation, on the other hand, only has a single syntax for arguments,
    and components must manually map attributes onto component arguments.
  
    When using classic invocation with `{{textarea}}`, only the following attributes are mapped onto
    arguments:
  
    * rows
    * cols
    * name
    * selectionEnd
    * selectionStart
    * autocomplete
    * wrap
    * lang
    * dir
    * value
  
    ## Classic `layout` and `layoutName` properties
  
    Because HTML `textarea` elements do not contain inner HTML the `layout` and
    `layoutName` properties will not be applied.
  
    @method Textarea
    @for Ember.Templates.components
    @see {TextArea}
    @public
  */

  /**
    See Ember.Templates.components.Textarea.
  
    @method textarea
    @for Ember.Templates.helpers
    @see {Ember.Templates.components.textarea}
    @public
  */

  /**
    The internal representation used for `Textarea` invocations.
  
    @class TextArea
    @extends Component
    @see {Ember.Templates.components.Textarea}
    @uses Ember.TextSupport
    @public
  */


  var TextArea = Component.extend(_views.TextSupport, {
    classNames: ['ember-text-area'],
    layout: layout,
    tagName: 'textarea',
    attributeBindings: ['rows', 'cols', 'name', 'selectionEnd', 'selectionStart', 'autocomplete', 'wrap', 'lang', 'dir', 'value'],
    rows: null,
    cols: null
  });
  _exports.TextArea = TextArea;

  TextArea.toString = function () {
    return '@ember/component/text-area';
  };

  var layout$1 = template({
    "id": "giTNx+op",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[4,\"if\",[[25,1]],null,{\"statements\":[[14,1]],\"parameters\":[]},{\"statements\":[[1,[23,0,[\"linkTitle\"]],false]],\"parameters\":[]}]],\"hasEval\":false}",
    "meta": {
      "moduleName": "packages/@ember/-internals/glimmer/lib/templates/link-to.hbs"
    }
  });
  /**
  @module ember
  */

  /**
    The `LinkTo` component renders a link to the supplied `routeName` passing an optionally
    supplied model to the route as its `model` context of the route. The block for `LinkTo`
    becomes the contents of the rendered element:
  
    ```handlebars
    <LinkTo @route='photoGallery'>
      Great Hamster Photos
    </LinkTo>
    ```
  
    This will result in:
  
    ```html
    <a href="/hamster-photos">
      Great Hamster Photos
    </a>
    ```
  
    ### Disabling the `LinkTo` component
  
    The `LinkTo` component can be disabled by using the `disabled` argument. A disabled link
    doesn't result in a transition when activated, and adds the `disabled` class to the `<a>`
    element.
  
    (The class name to apply to the element can be overridden by using the `disabledClass`
    argument)
  
    ```handlebars
    <LinkTo @route='photoGallery' @disabled={{true}}>
      Great Hamster Photos
    </LinkTo>
    ```
  
    ### Handling `href`
  
    `<LinkTo>` will use your application's Router to fill the element's `href` property with a URL
    that matches the path to the supplied `routeName`.
  
    ### Handling current route
  
    The `LinkTo` component will apply a CSS class name of 'active' when the application's current
    route matches the supplied routeName. For example, if the application's current route is
    'photoGallery.recent', then the following invocation of `LinkTo`:
  
    ```handlebars
    <LinkTo @route='photoGallery.recent'>
      Great Hamster Photos
    </LinkTo>
    ```
  
    will result in
  
    ```html
    <a href="/hamster-photos/this-week" class="active">
      Great Hamster Photos
    </a>
    ```
  
    The CSS class used for active classes can be customized by passing an `activeClass` argument:
  
    ```handlebars
    <LinkTo @route='photoGallery.recent' @activeClass="current-url">
      Great Hamster Photos
    </LinkTo>
    ```
  
    ```html
    <a href="/hamster-photos/this-week" class="current-url">
      Great Hamster Photos
    </a>
    ```
  
    ### Keeping a link active for other routes
  
    If you need a link to be 'active' even when it doesn't match the current route, you can use the
    `current-when` argument.
  
    ```handlebars
    <LinkTo @route='photoGallery' @current-when='photos'>
      Photo Gallery
    </LinkTo>
    ```
  
    This may be helpful for keeping links active for:
  
    * non-nested routes that are logically related
    * some secondary menu approaches
    * 'top navigation' with 'sub navigation' scenarios
  
    A link will be active if `current-when` is `true` or the current
    route is the route this link would transition to.
  
    To match multiple routes 'space-separate' the routes:
  
    ```handlebars
    <LinkTo @route='gallery' @current-when='photos drawings paintings'>
      Art Gallery
    </LinkTo>
    ```
  
    ### Supplying a model
  
    An optional `model` argument can be used for routes whose
    paths contain dynamic segments. This argument will become
    the model context of the linked route:
  
    ```javascript
    Router.map(function() {
      this.route("photoGallery", {path: "hamster-photos/:photo_id"});
    });
    ```
  
    ```handlebars
    <LinkTo @route='photoGallery' @model={{this.aPhoto}}>
      {{aPhoto.title}}
    </LinkTo>
    ```
  
    ```html
    <a href="/hamster-photos/42">
      Tomster
    </a>
    ```
  
    ### Supplying multiple models
  
    For deep-linking to route paths that contain multiple
    dynamic segments, the `models` argument can be used.
  
    As the router transitions through the route path, each
    supplied model argument will become the context for the
    route with the dynamic segments:
  
    ```javascript
    Router.map(function() {
      this.route("photoGallery", { path: "hamster-photos/:photo_id" }, function() {
        this.route("comment", {path: "comments/:comment_id"});
      });
    });
    ```
  
    This argument will become the model context of the linked route:
  
    ```handlebars
    <LinkTo @route='photoGallery.comment' @models={{array this.aPhoto this.comment}}>
      {{comment.body}}
    </LinkTo>
    ```
  
    ```html
    <a href="/hamster-photos/42/comments/718">
      A+++ would snuggle again.
    </a>
    ```
  
    ### Supplying an explicit dynamic segment value
  
    If you don't have a model object available to pass to `LinkTo`,
    an optional string or integer argument can be passed for routes whose
    paths contain dynamic segments. This argument will become the value
    of the dynamic segment:
  
    ```javascript
    Router.map(function() {
      this.route("photoGallery", { path: "hamster-photos/:photo_id" });
    });
    ```
  
    ```handlebars
    <LinkTo @route='photoGallery' @model={{aPhotoId}}>
      {{this.aPhoto.title}}
    </LinkTo>
    ```
  
    ```html
    <a href="/hamster-photos/42">
      Tomster
    </a>
    ```
  
    When transitioning into the linked route, the `model` hook will
    be triggered with parameters including this passed identifier.
  
    ### Allowing Default Action
  
    By default the `<LinkTo>` component prevents the default browser action by calling
    `preventDefault()` to avoid reloading the browser page.
  
    If you need to trigger a full browser reload pass `@preventDefault={{false}}`:
  
    ```handlebars
    <LinkTo @route='photoGallery' @model={{this.aPhotoId}} @preventDefault={{false}}>
      {{this.aPhotoId.title}}
    </LinkTo>
    ```
  
    ### Supplying a `tagName`
  
    By default `<LinkTo>` renders an `<a>` element. This can be overridden for a single use of
    `<LinkTo>` by supplying a `tagName` argument:
  
    ```handlebars
    <LinkTo @route='photoGallery' @tagName='li'>
      Great Hamster Photos
    </LinkTo>
    ```
  
    This produces:
  
    ```html
    <li>
      Great Hamster Photos
    </li>
    ```
  
    In general, this is not recommended. Instead, you can use the `transition-to` helper together
    with a click event handler on the HTML tag of your choosing.
  
    @for Ember.Templates.components
    @method LinkTo
    @see {LinkComponent}
    @public
  */

  /**
    @module @ember/routing
  */

  /**
    See [Ember.Templates.components.LinkTo](/ember/release/classes/Ember.Templates.components/methods/input?anchor=LinkTo).
  
    @for Ember.Templates.helpers
    @method link-to
    @see {Ember.Templates.components.LinkTo}
    @public
  **/

  /**
    `LinkComponent` is the internal component invoked with `<LinkTo>` or `{{link-to}}`.
  
    @class LinkComponent
    @extends Component
    @see {Ember.Templates.components.LinkTo}
    @public
  **/

  var UNDEFINED = Object.freeze({
    toString: function toString() {
      return 'UNDEFINED';
    }
  });
  var EMPTY_QUERY_PARAMS = Object.freeze({});
  var LinkComponent = Component.extend({
    layout: layout$1,
    tagName: 'a',

    /**
      @property route
      @public
    */
    route: UNDEFINED,

    /**
      @property model
      @public
    */
    model: UNDEFINED,

    /**
      @property models
      @public
    */
    models: UNDEFINED,

    /**
      @property query
      @public
    */
    query: UNDEFINED,

    /**
      Used to determine when this `LinkComponent` is active.
         @property current-when
      @public
    */
    'current-when': null,

    /**
      Sets the `title` attribute of the `LinkComponent`'s HTML element.
         @property title
      @default null
      @public
    **/
    title: null,

    /**
      Sets the `rel` attribute of the `LinkComponent`'s HTML element.
         @property rel
      @default null
      @public
    **/
    rel: null,

    /**
      Sets the `tabindex` attribute of the `LinkComponent`'s HTML element.
         @property tabindex
      @default null
      @public
    **/
    tabindex: null,

    /**
      Sets the `target` attribute of the `LinkComponent`'s HTML element.
         @since 1.8.0
      @property target
      @default null
      @public
    **/
    target: null,

    /**
      The CSS class to apply to `LinkComponent`'s element when its `active`
      property is `true`.
         @property activeClass
      @type String
      @default active
      @public
    **/
    activeClass: 'active',

    /**
      The CSS class to apply to `LinkComponent`'s element when its `loading`
      property is `true`.
         @property loadingClass
      @type String
      @default loading
      @private
    **/
    loadingClass: 'loading',

    /**
      The CSS class to apply to a `LinkComponent`'s element when its `disabled`
      property is `true`.
         @property disabledClass
      @type String
      @default disabled
      @private
    **/
    disabledClass: 'disabled',

    /**
      Determines whether the `LinkComponent` will trigger routing via
      the `replaceWith` routing strategy.
         @property replace
      @type Boolean
      @default false
      @public
    **/
    replace: false,

    /**
      By default this component will forward `href`, `title`, `rel`, `tabindex`, and `target`
      arguments to attributes on the component's element. When invoked with `{{link-to}}`, you can
      only customize these attributes. When invoked with `<LinkTo>`, you can just use HTML
      attributes directly.
         @property attributeBindings
      @type Array | String
      @default ['title', 'rel', 'tabindex', 'target']
      @public
    */
    attributeBindings: ['href', 'title', 'rel', 'tabindex', 'target'],

    /**
      By default this component will set classes on its element when any of the following arguments
      are truthy:
         * active
      * loading
      * disabled
         When these arguments are truthy, a class with the same name will be set on the element. When
      falsy, the associated class will not be on the element.
         @property classNameBindings
      @type Array
      @default ['active', 'loading', 'disabled', 'ember-transitioning-in', 'ember-transitioning-out']
      @public
    */
    classNameBindings: ['active', 'loading', 'disabled', 'transitioningIn', 'transitioningOut'],

    /**
      By default this component responds to the `click` event. When the component element is an
      `<a>` element, activating the link in another way, such as using the keyboard, triggers the
      click event.
         @property eventName
      @type String
      @default click
      @private
    */
    eventName: 'click',
    // this is doc'ed here so it shows up in the events
    // section of the API documentation, which is where
    // people will likely go looking for it.

    /**
      Triggers the `LinkComponent`'s routing behavior. If
      `eventName` is changed to a value other than `click`
      the routing behavior will trigger on that custom event
      instead.
         @event click
      @private
    */

    /**
      An overridable method called when `LinkComponent` objects are instantiated.
         Example:
         ```app/components/my-link.js
      import LinkComponent from '@ember/routing/link-component';
         export default LinkComponent.extend({
        init() {
          this._super(...arguments);
          console.log('Event is ' + this.get('eventName'));
        }
      });
      ```
         NOTE: If you do override `init` for a framework class like `Component`,
      be sure to call `this._super(...arguments)` in your
      `init` declaration! If you don't, Ember may not have an opportunity to
      do important setup work, and you'll see strange behavior in your
      application.
         @method init
      @private
    */
    init: function init() {
      this._super.apply(this, arguments); // Map desired event name to invoke function


      var eventName = this.eventName;
      this.on(eventName, this, this._invoke);
    },
    _routing: (0, _service.inject)('-routing'),
    _currentRoute: (0, _metal.alias)('_routing.currentRouteName'),
    _currentRouterState: (0, _metal.alias)('_routing.currentState'),
    _targetRouterState: (0, _metal.alias)('_routing.targetState'),
    _route: (0, _metal.computed)('route', '_currentRouterState', function computeLinkToComponentRoute() {
      var route = this.route;
      return route === UNDEFINED ? this._currentRoute : route;
    }),
    _models: (0, _metal.computed)('model', 'models', function computeLinkToComponentModels() {
      var model = this.model,
          models = this.models;
      (false && !(model === UNDEFINED || models === UNDEFINED) && (0, _debug.assert)('You cannot provide both the `@model` and `@models` arguments to the <LinkTo> component.', model === UNDEFINED || models === UNDEFINED));

      if (model !== UNDEFINED) {
        return [model];
      } else if (models !== UNDEFINED) {
        (false && !(Array.isArray(models)) && (0, _debug.assert)('The `@models` argument must be an array.', Array.isArray(models)));
        return models;
      } else {
        return [];
      }
    }),
    _query: (0, _metal.computed)('query', function computeLinkToComponentQuery() {
      var query = this.query;

      if (query === UNDEFINED) {
        return EMPTY_QUERY_PARAMS;
      } else {
        return (0, _polyfills.assign)({}, query);
      }
    }),

    /**
      Accessed as a classname binding to apply the component's `disabledClass`
      CSS `class` to the element when the link is disabled.
         When `true`, interactions with the element will not trigger route changes.
      @property disabled
      @private
    */
    disabled: (0, _metal.computed)({
      get: function get(_key) {
        // always returns false for `get` because (due to the `set` just below)
        // the cached return value from the set will prevent this getter from _ever_
        // being called after a set has occured
        return false;
      },
      set: function set(_key, value$$1) {
        this._isDisabled = value$$1;
        return value$$1 ? this.disabledClass : false;
      }
    }),

    /**
      Accessed as a classname binding to apply the component's `activeClass`
      CSS `class` to the element when the link is active.
         This component is considered active when its `currentWhen` property is `true`
      or the application's current route is the route this component would trigger
      transitions into.
         The `currentWhen` property can match against multiple routes by separating
      route names using the ` ` (space) character.
         @property active
      @private
    */
    active: (0, _metal.computed)('activeClass', '_active', function computeLinkToComponentActiveClass() {
      return this._active ? this.activeClass : false;
    }),
    _active: (0, _metal.computed)('_currentRouterState', '_route', '_models', '_query', 'loading', 'current-when', function computeLinkToComponentActive() {
      var state = this._currentRouterState;

      if (state) {
        return this._isActive(state);
      } else {
        return false;
      }
    }),
    willBeActive: (0, _metal.computed)('_currentRouterState', '_targetRouterState', '_route', '_models', '_query', 'loading', 'current-when', function computeLinkToComponentWillBeActive() {
      var current = this._currentRouterState,
          target = this._targetRouterState;

      if (current === target) {
        return;
      }

      return this._isActive(target);
    }),
    _isActive: function _isActive(routerState) {
      if (this.loading) {
        return false;
      }

      var currentWhen = this['current-when'];

      if (typeof currentWhen === 'boolean') {
        return currentWhen;
      }

      var isCurrentWhenSpecified = Boolean(currentWhen);

      if (isCurrentWhenSpecified) {
        currentWhen = currentWhen.split(' ');
      } else {
        currentWhen = [this._route];
      }

      var models = this._models,
          query = this._query,
          routing = this._routing;

      for (var i = 0; i < currentWhen.length; i++) {
        if (routing.isActiveForRoute(models, query, currentWhen[i], routerState, isCurrentWhenSpecified)) {
          return true;
        }
      }

      return false;
    },
    transitioningIn: (0, _metal.computed)('_active', 'willBeActive', function computeLinkToComponentTransitioningIn() {
      if (this.willBeActive === true && !this._active) {
        return 'ember-transitioning-in';
      } else {
        return false;
      }
    }),
    transitioningOut: (0, _metal.computed)('_active', 'willBeActive', function computeLinkToComponentTransitioningOut() {
      if (this.willBeActive === false && this._active) {
        return 'ember-transitioning-out';
      } else {
        return false;
      }
    }),

    /**
      Event handler that invokes the link, activating the associated route.
         @method _invoke
      @param {Event} event
      @private
    */
    _invoke: function _invoke(event) {
      if (!(0, _views.isSimpleClick)(event)) {
        return true;
      }

      var bubbles = this.bubbles,
          preventDefault = this.preventDefault;
      var target = this.element.target;
      var isSelf = !target || target === '_self';

      if (preventDefault !== false && isSelf) {
        event.preventDefault();
      }

      if (bubbles === false) {
        event.stopPropagation();
      }

      if (this._isDisabled) {
        return false;
      }

      if (this.loading) {
        // tslint:disable-next-line:max-line-length
        (false && (0, _debug.warn)('This link is in an inactive loading state because at least one of its models ' + 'currently has a null/undefined value, or the provided route name is invalid.', false, {
          id: 'ember-glimmer.link-to.inactive-loading-state'
        }));
        return false;
      }

      if (!isSelf) {
        return false;
      }

      var routeName = this._route,
          models = this._models,
          queryParams = this._query,
          shouldReplace = this.replace;
      var payload = {
        queryParams: queryParams,
        routeName: routeName
      };
      (0, _instrumentation.flaggedInstrument)('interaction.link-to', payload, this._generateTransition(payload, routeName, models, queryParams, shouldReplace));
      return false;
    },
    _generateTransition: function _generateTransition(payload, qualifiedRouteName, models, queryParams, shouldReplace) {
      var routing = this._routing;
      return function () {
        payload.transition = routing.transitionTo(qualifiedRouteName, models, queryParams, shouldReplace);
      };
    },

    /**
      Sets the element's `href` attribute to the url for
      the `LinkComponent`'s targeted route.
         If the `LinkComponent`'s `tagName` is changed to a value other
      than `a`, this property will be ignored.
         @property href
      @private
    */
    href: (0, _metal.computed)('_currentRouterState', '_route', '_models', '_query', 'tagName', 'loading', 'loadingHref', function computeLinkToComponentHref() {
      if (this.tagName !== 'a') {
        return;
      }

      if (this.loading) {
        return this.loadingHref;
      }

      var route = this._route,
          models = this._models,
          query = this._query,
          routing = this._routing;

      if (false
      /* DEBUG */
      ) {
        /*
         * Unfortunately, to get decent error messages, we need to do this.
         * In some future state we should be able to use a "feature flag"
         * which allows us to strip this without needing to call it twice.
         *
         * if (isDebugBuild()) {
         *   // Do the useful debug thing, probably including try/catch.
         * } else {
         *   // Do the performant thing.
         * }
         */
        try {
          return routing.generateURL(route, models, query);
        } catch (e) {
          // tslint:disable-next-line:max-line-length
          (false && !(false) && (0, _debug.assert)("You attempted to generate a link for the \"" + this.route + "\" route, but did not " + "pass the models required for generating its dynamic segments. " + e.message));
        }
      } else {
        return routing.generateURL(route, models, query);
      }
    }),
    loading: (0, _metal.computed)('_route', '_modelsAreLoaded', 'loadingClass', function computeLinkToComponentLoading() {
      var route = this._route,
          loaded = this._modelsAreLoaded;

      if (!loaded || route === null || route === undefined) {
        return this.loadingClass;
      }
    }),
    _modelsAreLoaded: (0, _metal.computed)('_models', function computeLinkToComponentModelsAreLoaded() {
      var models = this._models;

      for (var i = 0; i < models.length; i++) {
        var model = models[i];

        if (model === null || model === undefined) {
          return false;
        }
      }

      return true;
    }),

    /**
      The default href value to use while a link-to is loading.
      Only applies when tagName is 'a'
         @property loadingHref
      @type String
      @default #
      @private
    */
    loadingHref: '#',
    didReceiveAttrs: function didReceiveAttrs() {
      var disabledWhen = this.disabledWhen;

      if (disabledWhen !== undefined) {
        this.set('disabled', disabledWhen);
      }

      var params = this.params;

      if (!params || params.length === 0) {
        (false && !(!(this.route === UNDEFINED && this.model === UNDEFINED && this.models === UNDEFINED && this.query === UNDEFINED)) && (0, _debug.assert)('You must provide at least one of the `@route`, `@model`, `@models` or `@query` argument to `<LinkTo>`.', !(this.route === UNDEFINED && this.model === UNDEFINED && this.models === UNDEFINED && this.query === UNDEFINED)));
        var models = this._models;

        if (models.length > 0) {
          var lastModel = models[models.length - 1];

          if (typeof lastModel === 'object' && lastModel !== null && lastModel.isQueryParams) {
            this.query = lastModel.values;
            models.pop();
          }
        }

        return;
      }

      params = params.slice(); // Process the positional arguments, in order.
      // 1. Inline link title comes first, if present.

      if (!this[HAS_BLOCK]) {
        this.set('linkTitle', params.shift());
      } // 2. The last argument is possibly the `query` object.


      var queryParams = params[params.length - 1];

      if (queryParams && queryParams.isQueryParams) {
        this.set('query', params.pop().values);
      } else {
        this.set('query', UNDEFINED);
      } // 3. If there is a `route`, it is now at index 0.


      if (params.length === 0) {
        this.set('route', UNDEFINED);
      } else {
        this.set('route', params.shift());
      } // 4. Any remaining indices (if any) are `models`.


      this.set('model', UNDEFINED);
      this.set('models', params);
    }
  });
  _exports.LinkComponent = LinkComponent;

  LinkComponent.toString = function () {
    return '@ember/routing/link-component';
  };

  LinkComponent.reopenClass({
    positionalParams: 'params'
  }); // @ts-check

  var getDebugStack = function getDebugStack() {
    throw new Error("Can't access the DebugStack class outside of debug mode");
  };

  if (false
  /* DEBUG */
  ) {
    var Element = function Element(name) {
      this.name = name;
    };

    var TemplateElement =
    /*#__PURE__*/
    function (_Element) {
      (0, _emberBabel.inheritsLoose)(TemplateElement, _Element);

      function TemplateElement() {
        return _Element.apply(this, arguments) || this;
      }

      return TemplateElement;
    }(Element);

    var EngineElement =
    /*#__PURE__*/
    function (_Element2) {
      (0, _emberBabel.inheritsLoose)(EngineElement, _Element2);

      function EngineElement() {
        return _Element2.apply(this, arguments) || this;
      }

      return EngineElement;
    }(Element);

    var DebugStackImpl =
    /*#__PURE__*/
    function () {
      function DebugStackImpl() {
        this._stack = [];
      }

      var _proto16 = DebugStackImpl.prototype;

      _proto16.push = function push(name) {
        this._stack.push(new TemplateElement(name));
      };

      _proto16.pushEngine = function pushEngine(name) {
        this._stack.push(new EngineElement(name));
      };

      _proto16.pop = function pop() {
        var element = this._stack.pop();

        if (element) {
          return element.name;
        }
      };

      _proto16.peek = function peek() {
        var template = this._currentTemplate();

        var engine = this._currentEngine();

        if (engine) {
          return "\"" + template + "\" (in \"" + engine + "\")";
        } else if (template) {
          return "\"" + template + "\"";
        }
      };

      _proto16._currentTemplate = function _currentTemplate() {
        return this._getCurrentByType(TemplateElement);
      };

      _proto16._currentEngine = function _currentEngine() {
        return this._getCurrentByType(EngineElement);
      };

      _proto16._getCurrentByType = function _getCurrentByType(type) {
        for (var i = this._stack.length; i >= 0; i--) {
          var element = this._stack[i];

          if (element instanceof type) {
            return element.name;
          }
        }
      };

      return DebugStackImpl;
    }();

    getDebugStack = function getDebugStack() {
      return new DebugStackImpl();
    };
  }

  var getDebugStack$1 = getDebugStack;
  /**
  @module ember
  */

  /**
    The `{{#each}}` helper loops over elements in a collection. It is an extension
    of the base Handlebars `{{#each}}` helper.
  
    The default behavior of `{{#each}}` is to yield its inner block once for every
    item in an array passing the item as the first block parameter.
  
    Assuming the `@developers` argument contains this array:
  
    ```javascript
    [{ name: 'Yehuda' },{ name: 'Tom' }, { name: 'Paul' }];
    ```
  
    ```handlebars
    <ul>
      {{#each @developers as |person|}}
        <li>Hello, {{person.name}}!</li>
      {{/each}}
    </ul>
    ```
  
    The same rules apply to arrays of primitives.
  
    ```javascript
    ['Yehuda', 'Tom', 'Paul']
    ```
  
    ```handlebars
    <ul>
      {{#each @developerNames as |name|}}
        <li>Hello, {{name}}!</li>
      {{/each}}
    </ul>
    ```
  
    During iteration, the index of each item in the array is provided as a second block
    parameter.
  
    ```handlebars
    <ul>
      {{#each @developers as |person index|}}
        <li>Hello, {{person.name}}! You're number {{index}} in line</li>
      {{/each}}
    </ul>
    ```
  
    ### Specifying Keys
  
    In order to improve rendering speed, Ember will try to reuse the DOM elements
    where possible. Specifically, if the same item is present in the array both
    before and after the change, its DOM output will be reused.
  
    The `key` option is used to tell Ember how to determine if the items in the
    array being iterated over with `{{#each}}` has changed between renders. By
    default the item's object identity is used.
  
    This is usually sufficient, so in most cases, the `key` option is simply not
    needed. However, in some rare cases, the objects' identities may change even
    though they represent the same underlying data.
  
    For example:
  
    ```javascript
    people.map(person => {
      return { ...person, type: 'developer' };
    });
    ```
  
    In this case, each time the `people` array is `map`-ed over, it will produce
    an new array with completely different objects between renders. In these cases,
    you can help Ember determine how these objects related to each other with the
    `key` option:
  
    ```handlebars
    <ul>
      {{#each @developers key="name" as |person|}}
        <li>Hello, {{person.name}}!</li>
      {{/each}}
    </ul>
    ```
  
    By doing so, Ember will use the value of the property specified (`person.name`
    in the example) to find a "match" from the previous render. That is, if Ember
    has previously seen an object from the `@developers` array with a matching
    name, its DOM elements will be re-used.
  
    ### {{else}} condition
  
    `{{#each}}` can have a matching `{{else}}`. The contents of this block will render
    if the collection is empty.
  
    ```handlebars
    <ul>
      {{#each @developers as |person|}}
        <li>{{person.name}} is available!</li>
      {{else}}
        <li>Sorry, nobody is available for this task.</li>
      {{/each}}
    </ul>
    ```
  
    @method each
    @for Ember.Templates.helpers
    @public
   */

  /**
    The `{{each-in}}` helper loops over properties on an object.
  
    For example, if the `@user` argument contains this object:
  
    ```javascript
    {
      "name": "Shelly Sails",
      "age": 42
    }
    ```
  
    This template would display all properties on the `@user`
    object in a list:
  
    ```handlebars
    <ul>
    {{#each-in @user as |key value|}}
      <li>{{key}}: {{value}}</li>
    {{/each-in}}
    </ul>
    ```
  
    Outputting their name and age.
  
    @method each-in
    @for Ember.Templates.helpers
    @public
    @since 2.1.0
  */

  _exports.getDebugStack = getDebugStack$1;
  var EACH_IN_REFERENCE = (0, _utils.symbol)('EACH_IN');

  var EachInReference =
  /*#__PURE__*/
  function () {
    function EachInReference(inner) {
      this.inner = inner;
      this.tag = inner.tag;
      this[EACH_IN_REFERENCE] = true;
    }

    var _proto17 = EachInReference.prototype;

    _proto17.value = function value() {
      return this.inner.value();
    };

    _proto17.get = function get(key) {
      return this.inner.get(key);
    };

    return EachInReference;
  }();

  function isEachIn(ref) {
    return ref !== null && typeof ref === 'object' && ref[EACH_IN_REFERENCE];
  }

  function eachIn(_vm, args) {
    return new EachInReference(args.positional.at(0));
  }

  var ITERATOR_KEY_GUID = 'be277757-bbbe-4620-9fcb-213ef433cca2';

  function _iterableFor(ref, keyPath) {
    if (isEachIn(ref)) {
      return new EachInIterable(ref, keyPath || '@key');
    } else {
      return new EachIterable(ref, keyPath || '@identity');
    }
  }

  var BoundedIterator =
  /*#__PURE__*/
  function () {
    function BoundedIterator(length, keyFor) {
      this.length = length;
      this.keyFor = keyFor;
      this.position = 0;
    }

    var _proto18 = BoundedIterator.prototype;

    _proto18.isEmpty = function isEmpty() {
      return false;
    };

    _proto18.memoFor = function memoFor(position) {
      return position;
    };

    _proto18.next = function next() {
      var length = this.length,
          keyFor = this.keyFor,
          position = this.position;

      if (position >= length) {
        return null;
      }

      var value$$1 = this.valueFor(position);
      var memo = this.memoFor(position);
      var key = keyFor(value$$1, memo, position);
      this.position++;
      return {
        key: key,
        value: value$$1,
        memo: memo
      };
    };

    return BoundedIterator;
  }();

  var ArrayIterator =
  /*#__PURE__*/
  function (_BoundedIterator) {
    (0, _emberBabel.inheritsLoose)(ArrayIterator, _BoundedIterator);

    function ArrayIterator(array, length, keyFor) {
      var _this12;

      _this12 = _BoundedIterator.call(this, length, keyFor) || this;
      _this12.array = array;
      return _this12;
    }

    ArrayIterator.from = function from(array, keyFor) {
      var length = array.length;

      if (length === 0) {
        return EMPTY_ITERATOR;
      } else {
        return new this(array, length, keyFor);
      }
    };

    ArrayIterator.fromForEachable = function fromForEachable(object, keyFor) {
      var array = [];
      object.forEach(function (item) {
        return array.push(item);
      });
      return this.from(array, keyFor);
    };

    var _proto19 = ArrayIterator.prototype;

    _proto19.valueFor = function valueFor(position) {
      return this.array[position];
    };

    return ArrayIterator;
  }(BoundedIterator);

  var EmberArrayIterator =
  /*#__PURE__*/
  function (_BoundedIterator2) {
    (0, _emberBabel.inheritsLoose)(EmberArrayIterator, _BoundedIterator2);

    function EmberArrayIterator(array, length, keyFor) {
      var _this13;

      _this13 = _BoundedIterator2.call(this, length, keyFor) || this;
      _this13.array = array;
      return _this13;
    }

    EmberArrayIterator.from = function from(array, keyFor) {
      var length = array.length;

      if (length === 0) {
        return EMPTY_ITERATOR;
      } else {
        return new this(array, length, keyFor);
      }
    };

    var _proto20 = EmberArrayIterator.prototype;

    _proto20.valueFor = function valueFor(position) {
      return (0, _metal.objectAt)(this.array, position);
    };

    return EmberArrayIterator;
  }(BoundedIterator);

  var ObjectIterator =
  /*#__PURE__*/
  function (_BoundedIterator3) {
    (0, _emberBabel.inheritsLoose)(ObjectIterator, _BoundedIterator3);

    function ObjectIterator(keys, values, length, keyFor) {
      var _this14;

      _this14 = _BoundedIterator3.call(this, length, keyFor) || this;
      _this14.keys = keys;
      _this14.values = values;
      return _this14;
    }

    ObjectIterator.fromIndexable = function fromIndexable(obj, keyFor) {
      var keys = Object.keys(obj);
      var length = keys.length;

      if (length === 0) {
        return EMPTY_ITERATOR;
      } else {
        var values = [];

        for (var i = 0; i < length; i++) {
          var value$$1 = void 0;
          var key = keys[i];
          value$$1 = obj[key]; // Add the tag of the returned value if it is an array, since arrays
          // should always cause updates if they are consumed and then changed

          if (true
          /* EMBER_METAL_TRACKED_PROPERTIES */
          && (0, _metal.isTracking)()) {
            (0, _metal.consume)((0, _metal.tagForProperty)(obj, key));

            if (Array.isArray(value$$1) || (0, _utils.isEmberArray)(value$$1)) {
              (0, _metal.consume)((0, _metal.tagForProperty)(value$$1, '[]'));
            }
          }

          values.push(value$$1);
        }

        return new this(keys, values, length, keyFor);
      }
    };

    ObjectIterator.fromForEachable = function fromForEachable(obj, keyFor) {
      var _arguments = arguments;
      var keys = [];
      var values = [];
      var length = 0;
      var isMapLike = false;
      obj.forEach(function (value$$1, key) {
        isMapLike = isMapLike || _arguments.length >= 2;

        if (isMapLike) {
          keys.push(key);
        }

        values.push(value$$1);
        length++;
      });

      if (length === 0) {
        return EMPTY_ITERATOR;
      } else if (isMapLike) {
        return new this(keys, values, length, keyFor);
      } else {
        return new ArrayIterator(values, length, keyFor);
      }
    };

    var _proto21 = ObjectIterator.prototype;

    _proto21.valueFor = function valueFor(position) {
      return this.values[position];
    };

    _proto21.memoFor = function memoFor(position) {
      return this.keys[position];
    };

    return ObjectIterator;
  }(BoundedIterator);

  var NativeIterator =
  /*#__PURE__*/
  function () {
    function NativeIterator(iterable, result, keyFor) {
      this.iterable = iterable;
      this.result = result;
      this.keyFor = keyFor;
      this.position = 0;
    }

    NativeIterator.from = function from(iterable, keyFor) {
      var iterator = iterable[Symbol.iterator]();
      var result = iterator.next();
      var value$$1 = result.value,
          done = result.done;

      if (done) {
        return EMPTY_ITERATOR;
      } else if (Array.isArray(value$$1) && value$$1.length === 2) {
        return new this(iterator, result, keyFor);
      } else {
        return new ArrayLikeNativeIterator(iterator, result, keyFor);
      }
    };

    var _proto22 = NativeIterator.prototype;

    _proto22.isEmpty = function isEmpty() {
      return false;
    };

    _proto22.next = function next() {
      var iterable = this.iterable,
          result = this.result,
          position = this.position,
          keyFor = this.keyFor;

      if (result.done) {
        return null;
      }

      var value$$1 = this.valueFor(result, position);
      var memo = this.memoFor(result, position);
      var key = keyFor(value$$1, memo, position);
      this.position++;
      this.result = iterable.next();
      return {
        key: key,
        value: value$$1,
        memo: memo
      };
    };

    return NativeIterator;
  }();

  var ArrayLikeNativeIterator =
  /*#__PURE__*/
  function (_NativeIterator) {
    (0, _emberBabel.inheritsLoose)(ArrayLikeNativeIterator, _NativeIterator);

    function ArrayLikeNativeIterator() {
      return _NativeIterator.apply(this, arguments) || this;
    }

    var _proto23 = ArrayLikeNativeIterator.prototype;

    _proto23.valueFor = function valueFor(result) {
      return result.value;
    };

    _proto23.memoFor = function memoFor(_result, position) {
      return position;
    };

    return ArrayLikeNativeIterator;
  }(NativeIterator);

  var MapLikeNativeIterator =
  /*#__PURE__*/
  function (_NativeIterator2) {
    (0, _emberBabel.inheritsLoose)(MapLikeNativeIterator, _NativeIterator2);

    function MapLikeNativeIterator() {
      return _NativeIterator2.apply(this, arguments) || this;
    }

    var _proto24 = MapLikeNativeIterator.prototype;

    _proto24.valueFor = function valueFor(result) {
      return result.value[1];
    };

    _proto24.memoFor = function memoFor(result) {
      return result.value[0];
    };

    return MapLikeNativeIterator;
  }(NativeIterator);

  var EMPTY_ITERATOR = {
    isEmpty: function isEmpty() {
      return true;
    },
    next: function next() {
      (false && !(false) && (0, _debug.assert)('Cannot call next() on an empty iterator'));
      return null;
    }
  };

  var EachInIterable =
  /*#__PURE__*/
  function () {
    function EachInIterable(ref, keyPath) {
      this.ref = ref;
      this.keyPath = keyPath;
      this.valueTag = (0, _reference.createUpdatableTag)();
      this.tag = (0, _reference.combine)([ref.tag, this.valueTag]);
    }

    var _proto25 = EachInIterable.prototype;

    _proto25.iterate = function iterate() {
      var ref = this.ref,
          valueTag = this.valueTag;
      var iterable = ref.value();
      var tag = (0, _metal.tagFor)(iterable);

      if ((0, _utils.isProxy)(iterable)) {
        // this is because the each-in doesn't actually get(proxy, 'key') but bypasses it
        // and the proxy's tag is lazy updated on access
        iterable = (0, _runtime._contentFor)(iterable);
      }

      (0, _reference.update)(valueTag, tag);

      if (!isIndexable(iterable)) {
        return EMPTY_ITERATOR;
      }

      if (Array.isArray(iterable) || (0, _utils.isEmberArray)(iterable)) {
        return ObjectIterator.fromIndexable(iterable, this.keyFor(true));
      } else if (_utils.HAS_NATIVE_SYMBOL && isNativeIterable(iterable)) {
        return MapLikeNativeIterator.from(iterable, this.keyFor());
      } else if (hasForEach(iterable)) {
        return ObjectIterator.fromForEachable(iterable, this.keyFor());
      } else {
        return ObjectIterator.fromIndexable(iterable, this.keyFor(true));
      }
    };

    _proto25.valueReferenceFor = function valueReferenceFor(item) {
      return new UpdatableReference(item.value);
    };

    _proto25.updateValueReference = function updateValueReference(ref, item) {
      ref.update(item.value);
    };

    _proto25.memoReferenceFor = function memoReferenceFor(item) {
      return new UpdatableReference(item.memo);
    };

    _proto25.updateMemoReference = function updateMemoReference(ref, item) {
      ref.update(item.memo);
    };

    _proto25.keyFor = function keyFor(hasUniqueKeys) {
      if (hasUniqueKeys === void 0) {
        hasUniqueKeys = false;
      }

      var keyPath = this.keyPath;

      switch (keyPath) {
        case '@key':
          return hasUniqueKeys ? ObjectKey : Unique(MapKey);

        case '@index':
          return Index;

        case '@identity':
          return Unique(Identity);

        default:
          (false && !(keyPath[0] !== '@') && (0, _debug.assert)("Invalid key: " + keyPath, keyPath[0] !== '@'));
          return Unique(KeyPath(keyPath));
      }
    };

    return EachInIterable;
  }();

  var EachIterable =
  /*#__PURE__*/
  function () {
    function EachIterable(ref, keyPath) {
      this.ref = ref;
      this.keyPath = keyPath;
      this.valueTag = (0, _reference.createUpdatableTag)();
      this.tag = (0, _reference.combine)([ref.tag, this.valueTag]);
    }

    var _proto26 = EachIterable.prototype;

    _proto26.iterate = function iterate() {
      var ref = this.ref,
          valueTag = this.valueTag;
      var iterable = ref.value();
      (0, _reference.update)(valueTag, (0, _metal.tagForProperty)(iterable, '[]'));

      if (iterable === null || typeof iterable !== 'object') {
        return EMPTY_ITERATOR;
      }

      var keyFor = this.keyFor();

      if (Array.isArray(iterable)) {
        return ArrayIterator.from(iterable, keyFor);
      } else if ((0, _utils.isEmberArray)(iterable)) {
        return EmberArrayIterator.from(iterable, keyFor);
      } else if (_utils.HAS_NATIVE_SYMBOL && isNativeIterable(iterable)) {
        return ArrayLikeNativeIterator.from(iterable, keyFor);
      } else if (hasForEach(iterable)) {
        return ArrayIterator.fromForEachable(iterable, keyFor);
      } else {
        return EMPTY_ITERATOR;
      }
    };

    _proto26.valueReferenceFor = function valueReferenceFor(item) {
      return new UpdatableReference(item.value);
    };

    _proto26.updateValueReference = function updateValueReference(ref, item) {
      ref.update(item.value);
    };

    _proto26.memoReferenceFor = function memoReferenceFor(item) {
      return new UpdatableReference(item.memo);
    };

    _proto26.updateMemoReference = function updateMemoReference(ref, item) {
      ref.update(item.memo);
    };

    _proto26.keyFor = function keyFor() {
      var keyPath = this.keyPath;

      switch (keyPath) {
        case '@index':
          return Index;

        case '@identity':
          return Unique(Identity);

        default:
          (false && !(keyPath[0] !== '@') && (0, _debug.assert)("Invalid key: " + keyPath, keyPath[0] !== '@'));
          return Unique(KeyPath(keyPath));
      }
    };

    return EachIterable;
  }();

  function hasForEach(value$$1) {
    return typeof value$$1['forEach'] === 'function';
  }

  function isNativeIterable(value$$1) {
    return typeof value$$1[Symbol.iterator] === 'function';
  }

  function isIndexable(value$$1) {
    return value$$1 !== null && (typeof value$$1 === 'object' || typeof value$$1 === 'function');
  } // Position in an array is guarenteed to be unique


  function Index(_value, _memo, position) {
    return String(position);
  } // Object.keys(...) is guarenteed to be strings and unique


  function ObjectKey(_value, memo) {
    return memo;
  } // Map keys can be any objects


  function MapKey(_value, memo) {
    return Identity(memo);
  }

  function Identity(value$$1) {
    switch (typeof value$$1) {
      case 'string':
        return value$$1;

      case 'number':
        return String(value$$1);

      default:
        return (0, _utils.guidFor)(value$$1);
    }
  }

  function KeyPath(keyPath) {
    return function (value$$1) {
      return String((0, _metal.get)(value$$1, keyPath));
    };
  }

  function Unique(func) {
    var seen = {};
    return function (value$$1, memo, position) {
      var key = func(value$$1, memo, position);
      var count = seen[key];

      if (count === undefined) {
        seen[key] = 0;
        return key;
      } else {
        seen[key] = ++count;
        return "" + key + ITERATOR_KEY_GUID + count;
      }
    };
  }
  /**
  @module @ember/template
  */


  var SafeString =
  /*#__PURE__*/
  function () {
    function SafeString(string) {
      this.string = string;
    }

    var _proto27 = SafeString.prototype;

    _proto27.toString = function toString() {
      return "" + this.string;
    };

    _proto27.toHTML = function toHTML() {
      return this.toString();
    };

    return SafeString;
  }();

  _exports.SafeString = SafeString;
  var escape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  var possible = /[&<>"'`=]/;
  var badChars = /[&<>"'`=]/g;

  function escapeChar(chr) {
    return escape[chr];
  }

  function escapeExpression(string) {
    if (typeof string !== 'string') {
      // don't escape SafeStrings, since they're already safe
      if (string && string.toHTML) {
        return string.toHTML();
      } else if (string === null || string === undefined) {
        return '';
      } else if (!string) {
        return String(string);
      } // Force a string conversion as this will be done by the append regardless and
      // the regex test will do this transparently behind the scenes, causing issues if
      // an object's to string has escaped characters in it.


      string = String(string);
    }

    if (!possible.test(string)) {
      return string;
    }

    return string.replace(badChars, escapeChar);
  }
  /**
    Mark a string as safe for unescaped output with Ember templates. If you
    return HTML from a helper, use this function to
    ensure Ember's rendering layer does not escape the HTML.
  
    ```javascript
    import { htmlSafe } from '@ember/template';
  
    htmlSafe('<div>someString</div>')
    ```
  
    @method htmlSafe
    @for @ember/template
    @static
    @return {SafeString} A string that will not be HTML escaped by Handlebars.
    @public
  */


  function htmlSafe(str) {
    if (str === null || str === undefined) {
      str = '';
    } else if (typeof str !== 'string') {
      str = String(str);
    }

    return new SafeString(str);
  }
  /**
    Detects if a string was decorated using `htmlSafe`.
  
    ```javascript
    import { htmlSafe, isHTMLSafe } from '@ember/template';
  
    var plainString = 'plain string',
        safeString = htmlSafe('<div>someValue</div>');
  
    isHTMLSafe(plainString); // false
    isHTMLSafe(safeString);  // true
    ```
  
    @method isHTMLSafe
    @for @ember/template
    @static
    @return {Boolean} `true` if the string was decorated with `htmlSafe`, `false` otherwise.
    @public
  */


  function isHTMLSafe(str) {
    return str !== null && typeof str === 'object' && typeof str.toHTML === 'function';
  }
  /* globals module, URL */


  var nodeURL;
  var parsingNode;

  function installProtocolForURL(environment) {
    var protocol;

    if (_browserEnvironment.hasDOM) {
      protocol = browserProtocolForURL.call(environment, 'foobar:baz');
    } // Test to see if our DOM implementation parses
    // and normalizes URLs.


    if (protocol === 'foobar:') {
      // Swap in the method that doesn't do this test now that
      // we know it works.
      environment.protocolForURL = browserProtocolForURL;
    } else if (typeof URL === 'object') {
      // URL globally provided, likely from FastBoot's sandbox
      nodeURL = URL;
      environment.protocolForURL = nodeProtocolForURL;
    } else if (typeof module !== undefined && typeof module.require === 'function') {
      // Otherwise, we need to fall back to our own URL parsing.
      // Global `require` is shadowed by Ember's loader so we have to use the fully
      // qualified `module.require`.
      // tslint:disable-next-line:no-require-imports
      nodeURL = module.require('url');
      environment.protocolForURL = nodeProtocolForURL;
    } else {
      throw new Error('Could not find valid URL parsing mechanism for URL Sanitization');
    }
  }

  function browserProtocolForURL(url) {
    if (!parsingNode) {
      parsingNode = document.createElement('a');
    }

    parsingNode.href = url;
    return parsingNode.protocol;
  }

  function nodeProtocolForURL(url) {
    var protocol = null;

    if (typeof url === 'string') {
      protocol = nodeURL.parse(url).protocol;
    }

    return protocol === null ? ':' : protocol;
  }

  var GUID = 0;

  var Ref =
  /*#__PURE__*/
  function () {
    function Ref(value$$1) {
      this.id = GUID++;
      this.value = value$$1;
    }

    var _proto28 = Ref.prototype;

    _proto28.get = function get() {
      return this.value;
    };

    _proto28.release = function release() {
      (false && !(this.value !== null) && (0, _debug.assert)('BUG: double release?', this.value !== null));
      this.value = null;
    };

    _proto28.toString = function toString() {
      var label = "Ref " + this.id;

      if (this.value === null) {
        return label + " (released)";
      } else {
        try {
          return label + ": " + this.value;
        } catch (_a) {
          return label;
        }
      }
    };

    return Ref;
  }();

  var DebugRenderTree =
  /*#__PURE__*/
  function () {
    function DebugRenderTree() {
      this.stack = new _util.Stack();
      this.refs = new WeakMap();
      this.roots = new Set();
      this.nodes = new WeakMap();
    }

    var _proto29 = DebugRenderTree.prototype;

    _proto29.begin = function begin() {
      this.reset();
    };

    _proto29.create = function create(state, node) {
      this.nodes.set(state, (0, _polyfills.assign)({}, node, {
        bounds: null,
        refs: new Set()
      }));
      this.appendChild(state);
      this.enter(state);
    };

    _proto29.update = function update(state) {
      this.enter(state);
    } // for dynamic layouts
    ;

    _proto29.setTemplate = function setTemplate(state, template) {
      this.nodeFor(state).template = template;
    };

    _proto29.didRender = function didRender(state, bounds) {
      (false && !(this.stack.current === state) && (0, _debug.assert)("BUG: expecting " + this.stack.current + ", got " + state, this.stack.current === state));
      this.nodeFor(state).bounds = bounds;
      this.exit();
    };

    _proto29.willDestroy = function willDestroy(state) {
      (0, _util.expect)(this.refs.get(state), 'BUG: missing ref').release();
    };

    _proto29.commit = function commit() {
      this.reset();
    };

    _proto29.capture = function capture() {
      return this.captureRefs(this.roots);
    };

    _proto29.reset = function reset() {
      if (this.stack.size !== 0) {
        // We probably encountered an error during the rendering loop. This will
        // likely trigger undefined behavior and memory leaks as the error left
        // things in an inconsistent state. It is recommended that the user
        // refresh the page.
        // TODO: We could warn here? But this happens all the time in our tests?
        while (!this.stack.isEmpty()) {
          this.stack.pop();
        }
      }
    };

    _proto29.enter = function enter(state) {
      this.stack.push(state);
    };

    _proto29.exit = function exit() {
      (false && !(this.stack.size !== 0) && (0, _debug.assert)('BUG: unbalanced pop', this.stack.size !== 0));
      this.stack.pop();
    };

    _proto29.nodeFor = function nodeFor(state) {
      return (0, _util.expect)(this.nodes.get(state), 'BUG: missing node');
    };

    _proto29.appendChild = function appendChild(state) {
      (false && !(!this.refs.has(state)) && (0, _debug.assert)('BUG: child already appended', !this.refs.has(state)));
      var parent = this.stack.current;
      var ref = new Ref(state);
      this.refs.set(state, ref);

      if (parent) {
        this.nodeFor(parent).refs.add(ref);
      } else {
        this.roots.add(ref);
      }
    };

    _proto29.captureRefs = function captureRefs(refs) {
      var _this15 = this;

      var captured = [];
      refs.forEach(function (ref) {
        var state = ref.get();

        if (state) {
          captured.push(_this15.captureNode("render-node:" + ref.id, state));
        } else {
          refs.delete(ref);
        }
      });
      return captured;
    };

    _proto29.captureNode = function captureNode(id, state) {
      var node = this.nodeFor(state);
      var type = node.type,
          name = node.name,
          args = node.args,
          instance = node.instance,
          refs = node.refs;
      var template = this.captureTemplate(node);
      var bounds = this.captureBounds(node);
      var children = this.captureRefs(refs);
      return {
        id: id,
        type: type,
        name: name,
        args: args.value(),
        instance: instance,
        template: template,
        bounds: bounds,
        children: children
      };
    };

    _proto29.captureTemplate = function captureTemplate(_ref) {
      var template = _ref.template;
      return template && template.referrer.moduleName || null;
    };

    _proto29.captureBounds = function captureBounds(node) {
      var bounds = (0, _util.expect)(node.bounds, 'BUG: missing bounds');
      var parentElement = bounds.parentElement();
      var firstNode = bounds.firstNode();
      var lastNode = bounds.lastNode();
      return {
        parentElement: parentElement,
        firstNode: firstNode,
        lastNode: lastNode
      };
    };

    return DebugRenderTree;
  }();

  var Environment$1 =
  /*#__PURE__*/
  function (_Environment) {
    (0, _emberBabel.inheritsLoose)(Environment$1, _Environment);

    function Environment$1(injections) {
      var _this16;

      _this16 = _Environment.call(this, injections) || this;
      _this16.inTransaction = false;
      var owner = injections[_owner.OWNER];
      _this16.owner = owner;
      _this16.isInteractive = owner.lookup('-environment:main').isInteractive; // can be removed once https://github.com/tildeio/glimmer/pull/305 lands

      _this16.destroyedComponents = [];
      installProtocolForURL((0, _emberBabel.assertThisInitialized)(_this16));

      if (false
      /* DEBUG */
      ) {
        _this16._debugStack = getDebugStack$1();
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        _this16._debugRenderTree = new DebugRenderTree();
      }

      return _this16;
    }

    Environment$1.create = function create(options) {
      return new this(options);
    };

    var _proto30 = Environment$1.prototype;

    // this gets clobbered by installPlatformSpecificProtocolForURL
    // it really should just delegate to a platform specific injection
    _proto30.protocolForURL = function protocolForURL(s) {
      return s;
    };

    _proto30.toConditionalReference = function toConditionalReference(reference) {
      return ConditionalReference$1.create(reference);
    };

    _proto30.iterableFor = function iterableFor(ref, key) {
      return _iterableFor(ref, key);
    };

    _proto30.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
      if (this.isInteractive) {
        _Environment.prototype.scheduleInstallModifier.call(this, modifier, manager);
      }
    };

    _proto30.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
      if (this.isInteractive) {
        _Environment.prototype.scheduleUpdateModifier.call(this, modifier, manager);
      }
    };

    _proto30.didDestroy = function didDestroy(destroyable) {
      destroyable.destroy();
    };

    _proto30.begin = function begin() {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        this.debugRenderTree.begin();
      }

      this.inTransaction = true;

      _Environment.prototype.begin.call(this);
    };

    _proto30.commit = function commit() {
      var destroyedComponents = this.destroyedComponents;
      this.destroyedComponents = []; // components queued for destruction must be destroyed before firing
      // `didCreate` to prevent errors when removing and adding a component
      // with the same name (would throw an error when added to view registry)

      for (var i = 0; i < destroyedComponents.length; i++) {
        destroyedComponents[i].destroy();
      }

      try {
        _Environment.prototype.commit.call(this);
      } finally {
        this.inTransaction = false;
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        this.debugRenderTree.commit();
      }
    };

    (0, _emberBabel.createClass)(Environment$1, [{
      key: "debugStack",
      get: function get() {
        if (false
        /* DEBUG */
        ) {
          return this._debugStack;
        } else {
          throw new Error("Can't access debug stack outside of debug mode");
        }
      }
    }, {
      key: "debugRenderTree",
      get: function get() {
        if (_environment2.ENV._DEBUG_RENDER_TREE) {
          return this._debugRenderTree;
        } else {
          throw new Error("Can't access debug render tree outside of the inspector (_DEBUG_RENDER_TREE flag is disabled)");
        }
      }
    }]);
    return Environment$1;
  }(_runtime2.Environment);

  _exports.Environment = Environment$1;

  if (false
  /* DEBUG */
  ) {
    var StyleAttributeManager =
    /*#__PURE__*/
    function (_SimpleDynamicAttribu) {
      (0, _emberBabel.inheritsLoose)(StyleAttributeManager, _SimpleDynamicAttribu);

      function StyleAttributeManager() {
        return _SimpleDynamicAttribu.apply(this, arguments) || this;
      }

      var _proto31 = StyleAttributeManager.prototype;

      _proto31.set = function set(dom, value$$1, env) {
        (false && (0, _debug.warn)((0, _views.constructStyleDeprecationMessage)(value$$1), function () {
          if (value$$1 === null || value$$1 === undefined || isHTMLSafe(value$$1)) {
            return true;
          }

          return false;
        }(), {
          id: 'ember-htmlbars.style-xss-warning'
        }));

        _SimpleDynamicAttribu.prototype.set.call(this, dom, value$$1, env);
      };

      _proto31.update = function update(value$$1, env) {
        (false && (0, _debug.warn)((0, _views.constructStyleDeprecationMessage)(value$$1), function () {
          if (value$$1 === null || value$$1 === undefined || isHTMLSafe(value$$1)) {
            return true;
          }

          return false;
        }(), {
          id: 'ember-htmlbars.style-xss-warning'
        }));

        _SimpleDynamicAttribu.prototype.update.call(this, value$$1, env);
      };

      return StyleAttributeManager;
    }(_runtime2.SimpleDynamicAttribute);

    Environment$1.prototype.attributeFor = function (element, attribute, isTrusting, namespace) {
      if (attribute === 'style' && !isTrusting) {
        return new StyleAttributeManager({
          element: element,
          name: attribute,
          namespace: namespace
        });
      }

      return _runtime2.Environment.prototype.attributeFor.call(this, element, attribute, isTrusting, namespace);
    };
  } // implements the ComponentManager interface as defined in glimmer:
  // tslint:disable-next-line:max-line-length
  // https://github.com/glimmerjs/glimmer-vm/blob/v0.24.0-beta.4/packages/%40glimmer/runtime/lib/component/interfaces.ts#L21


  var AbstractManager =
  /*#__PURE__*/
  function () {
    function AbstractManager() {
      this.debugStack = undefined;
    }

    var _proto32 = AbstractManager.prototype;

    _proto32.prepareArgs = function prepareArgs(_state, _args) {
      return null;
    };

    _proto32.didCreateElement = function didCreateElement(_component, _element, _operations) {} // noop
    // inheritors should also call `this.debugStack.pop()` to
    // ensure the rerendering assertion messages are properly
    // maintained
    ;

    _proto32.didRenderLayout = function didRenderLayout(_component, _bounds) {// noop
    };

    _proto32.didCreate = function didCreate(_bucket) {} // noop
    // inheritors should also call `this._pushToDebugStack`
    // to ensure the rerendering assertion messages are
    // properly maintained
    ;

    _proto32.update = function update(_bucket, _dynamicScope) {} // noop
    // inheritors should also call `this.debugStack.pop()` to
    // ensure the rerendering assertion messages are properly
    // maintained
    ;

    _proto32.didUpdateLayout = function didUpdateLayout(_bucket, _bounds) {// noop
    };

    _proto32.didUpdate = function didUpdate(_bucket) {// noop
    };

    return AbstractManager;
  }();

  _exports.AbstractComponentManager = AbstractManager;

  function instrumentationPayload(def) {
    return {
      object: def.name + ":" + def.outlet
    };
  }

  var CAPABILITIES = {
    dynamicLayout: false,
    dynamicTag: false,
    prepareArgs: false,
    createArgs: _environment2.ENV._DEBUG_RENDER_TREE,
    attributeHook: false,
    elementHook: false,
    createCaller: false,
    dynamicScope: true,
    updateHook: _environment2.ENV._DEBUG_RENDER_TREE,
    createInstance: true
  };

  var OutletComponentManager =
  /*#__PURE__*/
  function (_AbstractManager) {
    (0, _emberBabel.inheritsLoose)(OutletComponentManager, _AbstractManager);

    function OutletComponentManager() {
      return _AbstractManager.apply(this, arguments) || this;
    }

    var _proto33 = OutletComponentManager.prototype;

    _proto33.create = function create(environment, definition, args, dynamicScope) {
      if (false
      /* DEBUG */
      ) {
        environment.debugStack.push("template:" + definition.template.referrer.moduleName);
      }

      var parentStateRef = dynamicScope.outletState;
      var currentStateRef = definition.ref;
      dynamicScope.outletState = currentStateRef;
      var state = {
        self: RootReference.create(definition.controller),
        environment: environment,
        finalize: (0, _instrumentation._instrumentStart)('render.outlet', instrumentationPayload, definition)
      };

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.outlet = {
          name: definition.outlet
        };
        environment.debugRenderTree.create(state.outlet, {
          type: 'outlet',
          name: state.outlet.name,
          args: _runtime2.EMPTY_ARGS,
          instance: undefined,
          template: undefined
        });
        var parentState = parentStateRef.value();
        var parentOwner = parentState && parentState.render && parentState.render.owner;
        var currentOwner = currentStateRef.value().render.owner;

        if (parentOwner && parentOwner !== currentOwner) {
          var engine = currentOwner;
          (false && !(typeof currentOwner.mountPoint === 'string') && (0, _debug.assert)('invalid engine: missing mountPoint', typeof currentOwner.mountPoint === 'string'));
          (false && !(currentOwner.routable === true) && (0, _debug.assert)('invalid engine: missing routable', currentOwner.routable === true));
          var mountPoint = engine.mountPoint;
          state.engine = {
            mountPoint: mountPoint
          };
          environment.debugRenderTree.create(state.engine, {
            type: 'engine',
            name: mountPoint,
            args: _runtime2.EMPTY_ARGS,
            instance: engine,
            template: undefined
          });
        }

        environment.debugRenderTree.create(state, {
          type: 'route-template',
          name: definition.name,
          args: args.capture(),
          instance: definition.controller,
          template: definition.template
        });
      }

      return state;
    };

    _proto33.getLayout = function getLayout(_ref2, _resolver) {
      var template = _ref2.template;
      // The router has already resolved the template
      var layout = template.asLayout();
      return {
        handle: layout.compile(),
        symbolTable: layout.symbolTable
      };
    };

    _proto33.getCapabilities = function getCapabilities() {
      return CAPABILITIES;
    };

    _proto33.getSelf = function getSelf(_ref3) {
      var self = _ref3.self;
      return self;
    };

    _proto33.getTag = function getTag() {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        // returning a const tag skips the update hook (VM BUG?)
        return (0, _reference.createTag)();
      } else {
        // an outlet has no hooks
        return _reference.CONSTANT_TAG;
      }
    };

    _proto33.didRenderLayout = function didRenderLayout(state, bounds) {
      state.finalize();

      if (false
      /* DEBUG */
      ) {
        state.environment.debugStack.pop();
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.environment.debugRenderTree.didRender(state, bounds);

        if (state.engine) {
          state.environment.debugRenderTree.didRender(state.engine, bounds);
        }

        state.environment.debugRenderTree.didRender(state.outlet, bounds);
      }
    };

    _proto33.update = function update(state) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.environment.debugRenderTree.update(state.outlet);

        if (state.engine) {
          state.environment.debugRenderTree.update(state.engine);
        }

        state.environment.debugRenderTree.update(state);
      }
    };

    _proto33.didUpdateLayout = function didUpdateLayout(state, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.environment.debugRenderTree.didRender(state, bounds);

        if (state.engine) {
          state.environment.debugRenderTree.didRender(state.engine, bounds);
        }

        state.environment.debugRenderTree.didRender(state.outlet, bounds);
      }
    };

    _proto33.getDestructor = function getDestructor(state) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        return {
          destroy: function destroy() {
            state.environment.debugRenderTree.willDestroy(state);

            if (state.engine) {
              state.environment.debugRenderTree.willDestroy(state.engine);
            }

            state.environment.debugRenderTree.willDestroy(state.outlet);
          }
        };
      } else {
        return null;
      }
    };

    return OutletComponentManager;
  }(AbstractManager);

  var OUTLET_MANAGER = new OutletComponentManager();

  var OutletComponentDefinition = function OutletComponentDefinition(state, manager) {
    if (manager === void 0) {
      manager = OUTLET_MANAGER;
    }

    this.state = state;
    this.manager = manager;
  };

  function createRootOutlet(outletView) {
    if (_environment2.ENV._APPLICATION_TEMPLATE_WRAPPER) {
      var WRAPPED_CAPABILITIES = (0, _polyfills.assign)({}, CAPABILITIES, {
        dynamicTag: true,
        elementHook: true
      });

      var WrappedOutletComponentManager =
      /*#__PURE__*/
      function (_OutletComponentManag) {
        (0, _emberBabel.inheritsLoose)(WrappedOutletComponentManager, _OutletComponentManag);

        function WrappedOutletComponentManager() {
          return _OutletComponentManag.apply(this, arguments) || this;
        }

        var _proto34 = WrappedOutletComponentManager.prototype;

        _proto34.getTagName = function getTagName(_component) {
          return 'div';
        };

        _proto34.getLayout = function getLayout(state) {
          // The router has already resolved the template
          var template = state.template;
          var layout = template.asWrappedLayout();
          return {
            handle: layout.compile(),
            symbolTable: layout.symbolTable
          };
        };

        _proto34.getCapabilities = function getCapabilities() {
          return WRAPPED_CAPABILITIES;
        };

        _proto34.didCreateElement = function didCreateElement(component, element, _operations) {
          // to add GUID id and class
          element.setAttribute('class', 'ember-view');
          element.setAttribute('id', (0, _utils.guidFor)(component));
        };

        return WrappedOutletComponentManager;
      }(OutletComponentManager);

      var WRAPPED_OUTLET_MANAGER = new WrappedOutletComponentManager();
      return new OutletComponentDefinition(outletView.state, WRAPPED_OUTLET_MANAGER);
    } else {
      return new OutletComponentDefinition(outletView.state);
    }
  }

  function NOOP() {}
  /**
    @module ember
  */

  /**
    Represents the internal state of the component.
  
    @class ComponentStateBucket
    @private
  */


  var ComponentStateBucket =
  /*#__PURE__*/
  function () {
    function ComponentStateBucket(environment, component, args, finalizer, hasWrappedElement) {
      this.environment = environment;
      this.component = component;
      this.args = args;
      this.finalizer = finalizer;
      this.hasWrappedElement = hasWrappedElement;
      this.classRef = null;
      this.classRef = null;
      this.argsRevision = args === null ? 0 : (0, _reference.value)(args.tag);
    }

    var _proto35 = ComponentStateBucket.prototype;

    _proto35.destroy = function destroy() {
      var component = this.component,
          environment = this.environment;

      if (environment.isInteractive) {
        component.trigger('willDestroyElement');
        component.trigger('willClearRender');
        var element = (0, _views.getViewElement)(component);

        if (element) {
          (0, _views.clearElementView)(element);
          (0, _views.clearViewElement)(component);
        }
      }

      environment.destroyedComponents.push(component);
    };

    _proto35.finalize = function finalize() {
      var finalizer = this.finalizer;
      finalizer();
      this.finalizer = NOOP;
    };

    return ComponentStateBucket;
  }();

  function referenceForKey(component, key) {
    return component[ROOT_REF].get(key);
  }

  function referenceForParts(component, parts) {
    var isAttrs = parts[0] === 'attrs'; // TODO deprecate this

    if (isAttrs) {
      parts.shift();

      if (parts.length === 1) {
        return referenceForKey(component, parts[0]);
      }
    }

    return referenceFromParts(component[ROOT_REF], parts);
  } // TODO we should probably do this transform at build time


  function wrapComponentClassAttribute(hash) {
    if (hash === null) {
      return;
    }

    var keys = hash[0],
        values = hash[1];
    var index = keys === null ? -1 : keys.indexOf('class');

    if (index !== -1) {
      var value$$1 = values[index];

      if (!Array.isArray(value$$1)) {
        return;
      }

      var type = value$$1[0];

      if (type === _wireFormat.Ops.Get || type === _wireFormat.Ops.MaybeLocal) {
        var path = value$$1[value$$1.length - 1];
        var propName = path[path.length - 1];
        values[index] = [_wireFormat.Ops.Helper, '-class', [value$$1, propName], null];
      }
    }
  }

  var AttributeBinding = {
    parse: function parse(microsyntax) {
      var colonIndex = microsyntax.indexOf(':');

      if (colonIndex === -1) {
        (false && !(microsyntax !== 'class') && (0, _debug.assert)('You cannot use class as an attributeBinding, use classNameBindings instead.', microsyntax !== 'class'));
        return [microsyntax, microsyntax, true];
      } else {
        var prop = microsyntax.substring(0, colonIndex);
        var attribute = microsyntax.substring(colonIndex + 1);
        (false && !(attribute !== 'class') && (0, _debug.assert)('You cannot use class as an attributeBinding, use classNameBindings instead.', attribute !== 'class'));
        return [prop, attribute, false];
      }
    },
    install: function install(_element, component, parsed, operations) {
      var prop = parsed[0],
          attribute = parsed[1],
          isSimple = parsed[2];

      if (attribute === 'id') {
        var elementId = (0, _metal.get)(component, prop);

        if (elementId === undefined || elementId === null) {
          elementId = component.elementId;
        }

        elementId = _runtime2.PrimitiveReference.create(elementId);
        operations.setAttribute('id', elementId, true, null); // operations.addStaticAttribute(element, 'id', elementId);

        return;
      }

      var isPath = prop.indexOf('.') > -1;
      var reference = isPath ? referenceForParts(component, prop.split('.')) : referenceForKey(component, prop);
      (false && !(!(isSimple && isPath)) && (0, _debug.assert)("Illegal attributeBinding: '" + prop + "' is not a valid attribute name.", !(isSimple && isPath)));

      if (attribute === 'style') {
        reference = new StyleBindingReference(reference, referenceForKey(component, 'isVisible'));
      }

      operations.setAttribute(attribute, reference, false, null); // operations.addDynamicAttribute(element, attribute, reference, false);
    }
  };
  var DISPLAY_NONE = 'display: none;';
  var SAFE_DISPLAY_NONE = htmlSafe(DISPLAY_NONE);

  var StyleBindingReference =
  /*#__PURE__*/
  function (_CachedReference) {
    (0, _emberBabel.inheritsLoose)(StyleBindingReference, _CachedReference);

    function StyleBindingReference(inner, isVisible) {
      var _this17;

      _this17 = _CachedReference.call(this) || this;
      _this17.inner = inner;
      _this17.isVisible = isVisible;
      _this17.tag = (0, _reference.combine)([inner.tag, isVisible.tag]);
      return _this17;
    }

    var _proto36 = StyleBindingReference.prototype;

    _proto36.compute = function compute() {
      var value$$1 = this.inner.value();
      var isVisible = this.isVisible.value();

      if (isVisible !== false) {
        return value$$1;
      } else if (!value$$1) {
        return SAFE_DISPLAY_NONE;
      } else {
        var style = value$$1 + ' ' + DISPLAY_NONE;
        return isHTMLSafe(value$$1) ? htmlSafe(style) : style;
      }
    };

    return StyleBindingReference;
  }(_reference.CachedReference);

  var IsVisibleBinding = {
    install: function install(_element, component, operations) {
      operations.setAttribute('style', (0, _reference.map)(referenceForKey(component, 'isVisible'), this.mapStyleValue), false, null); // // the upstream type for addDynamicAttribute's `value` argument
      // // appears to be incorrect. It is currently a Reference<string>, I
      // // think it should be a Reference<string|null>.
      // operations.addDynamicAttribute(element, 'style', ref as any as Reference<string>, false);
    },
    mapStyleValue: function mapStyleValue(isVisible) {
      return isVisible === false ? SAFE_DISPLAY_NONE : null;
    }
  };
  var ClassNameBinding = {
    install: function install(_element, component, microsyntax, operations) {
      var _microsyntax$split = microsyntax.split(':'),
          prop = _microsyntax$split[0],
          truthy = _microsyntax$split[1],
          falsy = _microsyntax$split[2];

      var isStatic = prop === '';

      if (isStatic) {
        operations.setAttribute('class', _runtime2.PrimitiveReference.create(truthy), true, null);
      } else {
        var isPath = prop.indexOf('.') > -1;
        var parts = isPath ? prop.split('.') : [];
        var value$$1 = isPath ? referenceForParts(component, parts) : referenceForKey(component, prop);
        var ref;

        if (truthy === undefined) {
          ref = new SimpleClassNameBindingReference(value$$1, isPath ? parts[parts.length - 1] : prop);
        } else {
          ref = new ColonClassNameBindingReference(value$$1, truthy, falsy);
        }

        operations.setAttribute('class', ref, false, null); // // the upstream type for addDynamicAttribute's `value` argument
        // // appears to be incorrect. It is currently a Reference<string>, I
        // // think it should be a Reference<string|null>.
        // operations.addDynamicAttribute(element, 'class', ref as any as Reference<string>, false);
      }
    }
  };

  var SimpleClassNameBindingReference =
  /*#__PURE__*/
  function (_CachedReference2) {
    (0, _emberBabel.inheritsLoose)(SimpleClassNameBindingReference, _CachedReference2);

    function SimpleClassNameBindingReference(inner, path) {
      var _this18;

      _this18 = _CachedReference2.call(this) || this;
      _this18.inner = inner;
      _this18.path = path;
      _this18.tag = inner.tag;
      _this18.inner = inner;
      _this18.path = path;
      _this18.dasherizedPath = null;
      return _this18;
    }

    var _proto37 = SimpleClassNameBindingReference.prototype;

    _proto37.compute = function compute() {
      var value$$1 = this.inner.value();

      if (value$$1 === true) {
        var path = this.path,
            dasherizedPath = this.dasherizedPath;
        return dasherizedPath || (this.dasherizedPath = (0, _string.dasherize)(path));
      } else if (value$$1 || value$$1 === 0) {
        return String(value$$1);
      } else {
        return null;
      }
    };

    return SimpleClassNameBindingReference;
  }(_reference.CachedReference);

  var ColonClassNameBindingReference =
  /*#__PURE__*/
  function (_CachedReference3) {
    (0, _emberBabel.inheritsLoose)(ColonClassNameBindingReference, _CachedReference3);

    function ColonClassNameBindingReference(inner, truthy, falsy) {
      var _this19;

      if (truthy === void 0) {
        truthy = null;
      }

      if (falsy === void 0) {
        falsy = null;
      }

      _this19 = _CachedReference3.call(this) || this;
      _this19.inner = inner;
      _this19.truthy = truthy;
      _this19.falsy = falsy;
      _this19.tag = inner.tag;
      return _this19;
    }

    var _proto38 = ColonClassNameBindingReference.prototype;

    _proto38.compute = function compute() {
      var inner = this.inner,
          truthy = this.truthy,
          falsy = this.falsy;
      return inner.value() ? truthy : falsy;
    };

    return ColonClassNameBindingReference;
  }(_reference.CachedReference); // inputs needed by CurlyComponents (attrs and props, with mutable
  // cells, etc).


  function processComponentArgs(namedArgs) {
    var keys = namedArgs.names;
    var attrs = namedArgs.value();
    var props = Object.create(null);
    var args = Object.create(null);
    props[ARGS] = args;

    for (var i = 0; i < keys.length; i++) {
      var name = keys[i];
      var ref = namedArgs.get(name);
      var value$$1 = attrs[name];

      if (typeof value$$1 === 'function' && value$$1[ACTION]) {
        attrs[name] = value$$1;
      } else if (ref[UPDATE]) {
        attrs[name] = new MutableCell(ref, value$$1);
      }

      args[name] = ref;
      props[name] = value$$1;
    }

    props.attrs = attrs;
    return props;
  }

  var REF = (0, _utils.symbol)('REF');

  var MutableCell =
  /*#__PURE__*/
  function () {
    function MutableCell(ref, value$$1) {
      this[_views.MUTABLE_CELL] = true;
      this[REF] = ref;
      this.value = value$$1;
    }

    var _proto39 = MutableCell.prototype;

    _proto39.update = function update(val) {
      this[REF][UPDATE](val);
    };

    return MutableCell;
  }();

  var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};

    for (var p in s) {
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }

    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }
    return t;
  };

  function aliasIdToElementId(args, props) {
    if (args.named.has('id')) {
      // tslint:disable-next-line:max-line-length
      (false && !(!args.named.has('elementId')) && (0, _debug.assert)("You cannot invoke a component with both 'id' and 'elementId' at the same time.", !args.named.has('elementId')));
      props.elementId = props.id;
    }
  } // We must traverse the attributeBindings in reverse keeping track of
  // what has already been applied. This is essentially refining the concatenated
  // properties applying right to left.


  function applyAttributeBindings(element, attributeBindings, component, operations) {
    var seen = [];
    var i = attributeBindings.length - 1;

    while (i !== -1) {
      var binding = attributeBindings[i];
      var parsed = AttributeBinding.parse(binding);
      var attribute = parsed[1];

      if (seen.indexOf(attribute) === -1) {
        seen.push(attribute);
        AttributeBinding.install(element, component, parsed, operations);
      }

      i--;
    }

    if (seen.indexOf('id') === -1) {
      var id$$1 = component.elementId ? component.elementId : (0, _utils.guidFor)(component);
      operations.setAttribute('id', _runtime2.PrimitiveReference.create(id$$1), false, null);
    }

    if (seen.indexOf('style') === -1) {
      IsVisibleBinding.install(element, component, operations);
    }
  }

  var DEFAULT_LAYOUT = (0, _container.privatize)(_templateObject2());
  var EMPTY_POSITIONAL_ARGS = [];
  (0, _debug.debugFreeze)(EMPTY_POSITIONAL_ARGS);

  var CurlyComponentManager =
  /*#__PURE__*/
  function (_AbstractManager2) {
    (0, _emberBabel.inheritsLoose)(CurlyComponentManager, _AbstractManager2);

    function CurlyComponentManager() {
      return _AbstractManager2.apply(this, arguments) || this;
    }

    var _proto40 = CurlyComponentManager.prototype;

    _proto40.getLayout = function getLayout(state, _resolver) {
      return {
        // TODO fix
        handle: state.handle,
        symbolTable: state.symbolTable
      };
    };

    _proto40.templateFor = function templateFor(component) {
      var layout = component.layout,
          layoutName = component.layoutName;
      var owner = (0, _owner.getOwner)(component);
      var factory;

      if (layout === undefined) {
        if (layoutName !== undefined) {
          var _factory = owner.lookup("template:" + layoutName);

          (false && !(_factory !== undefined) && (0, _debug.assert)("Layout `" + layoutName + "` not found!", _factory !== undefined));
          factory = _factory;
        } else {
          factory = owner.lookup(DEFAULT_LAYOUT);
        }
      } else if (isTemplateFactory(layout)) {
        factory = layout;
      } else {
        // we were provided an instance already
        return layout;
      }

      return factory(owner);
    };

    _proto40.getDynamicLayout = function getDynamicLayout(bucket) {
      var component = bucket.component;
      var template$$1 = this.templateFor(component);
      var layout = template$$1.asWrappedLayout();

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.setTemplate(bucket, template$$1);
      }

      return {
        handle: layout.compile(),
        symbolTable: layout.symbolTable
      };
    };

    _proto40.getTagName = function getTagName(state) {
      var component = state.component,
          hasWrappedElement = state.hasWrappedElement;

      if (!hasWrappedElement) {
        return null;
      }

      return component && component.tagName || 'div';
    };

    _proto40.getCapabilities = function getCapabilities(state) {
      return state.capabilities;
    };

    _proto40.prepareArgs = function prepareArgs(state, args) {
      if (args.named.has('__ARGS__')) {
        var _a = args.named.capture().map,
            __ARGS__ = _a.__ARGS__,
            rest = __rest(_a, ["__ARGS__"]);

        var prepared = {
          positional: EMPTY_POSITIONAL_ARGS,
          named: (0, _polyfills.assign)({}, rest, __ARGS__.value())
        };
        return prepared;
      }

      var positionalParams = state.ComponentClass.class.positionalParams; // early exits

      if (positionalParams === undefined || positionalParams === null || args.positional.length === 0) {
        return null;
      }

      var named;

      if (typeof positionalParams === 'string') {
        var _named;

        (false && !(!args.named.has(positionalParams)) && (0, _debug.assert)("You cannot specify positional parameters and the hash argument `" + positionalParams + "`.", !args.named.has(positionalParams)));
        named = (_named = {}, _named[positionalParams] = args.positional.capture(), _named);
        (0, _polyfills.assign)(named, args.named.capture().map);
      } else if (Array.isArray(positionalParams) && positionalParams.length > 0) {
        var count = Math.min(positionalParams.length, args.positional.length);
        named = {};
        (0, _polyfills.assign)(named, args.named.capture().map);

        for (var i = 0; i < count; i++) {
          var name = positionalParams[i];
          (false && !(!args.named.has(name)) && (0, _debug.assert)("You cannot specify both a positional param (at position " + i + ") and the hash argument `" + name + "`.", !args.named.has(name)));
          named[name] = args.positional.at(i);
        }
      } else {
        return null;
      }

      return {
        positional: _util.EMPTY_ARRAY,
        named: named
      };
    }
    /*
     * This hook is responsible for actually instantiating the component instance.
     * It also is where we perform additional bookkeeping to support legacy
     * features like exposed by view mixins like ChildViewSupport, ActionSupport,
     * etc.
     */
    ;

    _proto40.create = function create(environment, state, args, dynamicScope, callerSelfRef, hasBlock) {
      if (false
      /* DEBUG */
      ) {
        environment.debugStack.push("component:" + state.name);
      } // Get the nearest concrete component instance from the scope. "Virtual"
      // components will be skipped.


      var parentView = dynamicScope.view; // Get the Ember.Component subclass to instantiate for this component.

      var factory = state.ComponentClass; // Capture the arguments, which tells Glimmer to give us our own, stable
      // copy of the Arguments object that is safe to hold on to between renders.

      var capturedArgs = args.named.capture();
      var props = processComponentArgs(capturedArgs); // Alias `id` argument to `elementId` property on the component instance.

      aliasIdToElementId(args, props); // Set component instance's parentView property to point to nearest concrete
      // component.

      props.parentView = parentView; // Set whether this component was invoked with a block
      // (`{{#my-component}}{{/my-component}}`) or without one
      // (`{{my-component}}`).

      props[HAS_BLOCK] = hasBlock; // Save the current `this` context of the template as the component's
      // `_target`, so bubbled actions are routed to the right place.

      props._target = callerSelfRef.value(); // static layout asserts CurriedDefinition

      if (state.template) {
        props.layout = state.template;
      } // caller:
      // <FaIcon @name="bug" />
      //
      // callee:
      // <i class="fa-{{@name}}"></i>
      // Now that we've built up all of the properties to set on the component instance,
      // actually create it.


      var component = factory.create(props);
      var finalizer = (0, _instrumentation._instrumentStart)('render.component', initialRenderInstrumentDetails, component); // We become the new parentView for downstream components, so save our
      // component off on the dynamic scope.

      dynamicScope.view = component; // Unless we're the root component, we need to add ourselves to our parent
      // component's childViews array.

      if (parentView !== null && parentView !== undefined) {
        (0, _views.addChildView)(parentView, component);
      }

      component.trigger('didReceiveAttrs');
      var hasWrappedElement = component.tagName !== ''; // We usually do this in the `didCreateElement`, but that hook doesn't fire for tagless components

      if (!hasWrappedElement) {
        if (environment.isInteractive) {
          component.trigger('willRender');
        }

        component._transitionTo('hasElement');

        if (environment.isInteractive) {
          component.trigger('willInsertElement');
        }
      } // Track additional lifecycle metadata about this component in a state bucket.
      // Essentially we're saving off all the state we'll need in the future.


      var bucket = new ComponentStateBucket(environment, component, capturedArgs, finalizer, hasWrappedElement);

      if (args.named.has('class')) {
        bucket.classRef = args.named.get('class');
      }

      if (false
      /* DEBUG */
      ) {
        processComponentInitializationAssertions(component, props);
      }

      if (environment.isInteractive && hasWrappedElement) {
        component.trigger('willRender');
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        environment.debugRenderTree.create(bucket, {
          type: 'component',
          name: state.name,
          args: args.capture(),
          instance: component,
          template: state.template
        });
      }

      return bucket;
    };

    _proto40.getSelf = function getSelf(_ref4) {
      var component = _ref4.component;
      return component[ROOT_REF];
    };

    _proto40.didCreateElement = function didCreateElement(_ref5, element, operations) {
      var component = _ref5.component,
          classRef = _ref5.classRef,
          environment = _ref5.environment;
      (0, _views.setViewElement)(component, element);
      (0, _views.setElementView)(element, component);
      var attributeBindings = component.attributeBindings,
          classNames = component.classNames,
          classNameBindings = component.classNameBindings;

      if (attributeBindings && attributeBindings.length) {
        applyAttributeBindings(element, attributeBindings, component, operations);
      } else {
        var id$$1 = component.elementId ? component.elementId : (0, _utils.guidFor)(component);
        operations.setAttribute('id', _runtime2.PrimitiveReference.create(id$$1), false, null);
        IsVisibleBinding.install(element, component, operations);
      }

      if (classRef) {
        var ref = new SimpleClassNameBindingReference(classRef, classRef['propertyKey']);
        operations.setAttribute('class', ref, false, null);
      }

      if (classNames && classNames.length) {
        classNames.forEach(function (name) {
          operations.setAttribute('class', _runtime2.PrimitiveReference.create(name), false, null);
        });
      }

      if (classNameBindings && classNameBindings.length) {
        classNameBindings.forEach(function (binding) {
          ClassNameBinding.install(element, component, binding, operations);
        });
      }

      operations.setAttribute('class', _runtime2.PrimitiveReference.create('ember-view'), false, null);

      if ('ariaRole' in component) {
        operations.setAttribute('role', referenceForKey(component, 'ariaRole'), false, null);
      }

      component._transitionTo('hasElement');

      if (environment.isInteractive) {
        component.trigger('willInsertElement');
      }
    };

    _proto40.didRenderLayout = function didRenderLayout(bucket, bounds) {
      bucket.component[BOUNDS] = bounds;
      bucket.finalize();

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.didRender(bucket, bounds);
      }

      if (false
      /* DEBUG */
      ) {
        bucket.environment.debugStack.pop();
      }
    };

    _proto40.getTag = function getTag(_ref6) {
      var args = _ref6.args,
          component = _ref6.component;
      return args ? (0, _reference.combine)([args.tag, component[DIRTY_TAG]]) : component[DIRTY_TAG];
    };

    _proto40.didCreate = function didCreate(_ref7) {
      var component = _ref7.component,
          environment = _ref7.environment;

      if (environment.isInteractive) {
        component._transitionTo('inDOM');

        component.trigger('didInsertElement');
        component.trigger('didRender');
      }
    };

    _proto40.update = function update(bucket) {
      var component = bucket.component,
          args = bucket.args,
          argsRevision = bucket.argsRevision,
          environment = bucket.environment;

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        environment.debugRenderTree.update(bucket);
      }

      if (false
      /* DEBUG */
      ) {
        environment.debugStack.push(component._debugContainerKey);
      }

      bucket.finalizer = (0, _instrumentation._instrumentStart)('render.component', rerenderInstrumentDetails, component);

      if (args && !(0, _reference.validate)(args.tag, argsRevision)) {
        var props = processComponentArgs(args);
        bucket.argsRevision = (0, _reference.value)(args.tag);
        component[IS_DISPATCHING_ATTRS] = true;
        component.setProperties(props);
        component[IS_DISPATCHING_ATTRS] = false;
        component.trigger('didUpdateAttrs');
        component.trigger('didReceiveAttrs');
      }

      if (environment.isInteractive) {
        component.trigger('willUpdate');
        component.trigger('willRender');
      }
    };

    _proto40.didUpdateLayout = function didUpdateLayout(bucket, bounds) {
      bucket.finalize();

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.didRender(bucket, bounds);
      }

      if (false
      /* DEBUG */
      ) {
        bucket.environment.debugStack.pop();
      }
    };

    _proto40.didUpdate = function didUpdate(_ref8) {
      var component = _ref8.component,
          environment = _ref8.environment;

      if (environment.isInteractive) {
        component.trigger('didUpdate');
        component.trigger('didRender');
      }
    };

    _proto40.getDestructor = function getDestructor(bucket) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        return {
          destroy: function destroy() {
            bucket.environment.debugRenderTree.willDestroy(bucket);
            bucket.destroy();
          }
        };
      } else {
        return bucket;
      }
    };

    return CurlyComponentManager;
  }(AbstractManager);

  function processComponentInitializationAssertions(component, props) {
    (false && !(function () {
      var classNameBindings = component.classNameBindings;

      for (var i = 0; i < classNameBindings.length; i++) {
        var binding = classNameBindings[i];

        if (typeof binding !== 'string' || binding.length === 0) {
          return false;
        }
      }

      return true;
    }()) && (0, _debug.assert)("classNameBindings must be non-empty strings: " + component, function () {
      var classNameBindings = component.classNameBindings;

      for (var i = 0; i < classNameBindings.length; i++) {
        var binding = classNameBindings[i];

        if (typeof binding !== 'string' || binding.length === 0) {
          return false;
        }
      }

      return true;
    }()));
    (false && !(function () {
      var classNameBindings = component.classNameBindings;

      for (var i = 0; i < classNameBindings.length; i++) {
        var binding = classNameBindings[i];

        if (binding.split(' ').length > 1) {
          return false;
        }
      }

      return true;
    }()) && (0, _debug.assert)("classNameBindings must not have spaces in them: " + component, function () {
      var classNameBindings = component.classNameBindings;

      for (var i = 0; i < classNameBindings.length; i++) {
        var binding = classNameBindings[i];

        if (binding.split(' ').length > 1) {
          return false;
        }
      }

      return true;
    }()));
    (false && !(component.tagName !== '' || !component.classNameBindings || component.classNameBindings.length === 0) && (0, _debug.assert)("You cannot use `classNameBindings` on a tag-less component: " + component, component.tagName !== '' || !component.classNameBindings || component.classNameBindings.length === 0));
    (false && !(component.tagName !== '' || props.id === component.elementId || !component.elementId && component.elementId !== '') && (0, _debug.assert)("You cannot use `elementId` on a tag-less component: " + component, component.tagName !== '' || props.id === component.elementId || !component.elementId && component.elementId !== ''));
    (false && !(component.tagName !== '' || !component.attributeBindings || component.attributeBindings.length === 0) && (0, _debug.assert)("You cannot use `attributeBindings` on a tag-less component: " + component, component.tagName !== '' || !component.attributeBindings || component.attributeBindings.length === 0));
  }

  function initialRenderInstrumentDetails(component) {
    return component.instrumentDetails({
      initialRender: true
    });
  }

  function rerenderInstrumentDetails(component) {
    return component.instrumentDetails({
      initialRender: false
    });
  }

  var CURLY_CAPABILITIES = {
    dynamicLayout: true,
    dynamicTag: true,
    prepareArgs: true,
    createArgs: true,
    attributeHook: true,
    elementHook: true,
    createCaller: true,
    dynamicScope: true,
    updateHook: true,
    createInstance: true
  };
  var CURLY_COMPONENT_MANAGER = new CurlyComponentManager();

  var CurlyComponentDefinition = // tslint:disable-next-line:no-shadowed-variable
  function CurlyComponentDefinition(name, ComponentClass, handle, template$$1, args) {
    this.name = name;
    this.ComponentClass = ComponentClass;
    this.handle = handle;
    this.template = template$$1;
    this.manager = CURLY_COMPONENT_MANAGER;
    var layout = template$$1 && template$$1.asLayout();
    var symbolTable = layout ? layout.symbolTable : undefined;
    this.symbolTable = symbolTable;
    this.template = template$$1;
    this.args = args;
    this.state = {
      name: name,
      ComponentClass: ComponentClass,
      handle: handle,
      template: template$$1,
      capabilities: CURLY_CAPABILITIES,
      symbolTable: symbolTable
    };
  };

  var RootComponentManager =
  /*#__PURE__*/
  function (_CurlyComponentManage) {
    (0, _emberBabel.inheritsLoose)(RootComponentManager, _CurlyComponentManage);

    function RootComponentManager(component) {
      var _this20;

      _this20 = _CurlyComponentManage.call(this) || this;
      _this20.component = component;
      return _this20;
    }

    var _proto41 = RootComponentManager.prototype;

    _proto41.getLayout = function getLayout(_state) {
      var template = this.templateFor(this.component);
      var layout = template.asWrappedLayout();
      return {
        handle: layout.compile(),
        symbolTable: layout.symbolTable
      };
    };

    _proto41.create = function create(environment, state, _args, dynamicScope) {
      var component = this.component;

      if (false
      /* DEBUG */
      ) {
        environment.debugStack.push(component._debugContainerKey);
      }

      var finalizer = (0, _instrumentation._instrumentStart)('render.component', initialRenderInstrumentDetails, component);
      dynamicScope.view = component;
      var hasWrappedElement = component.tagName !== ''; // We usually do this in the `didCreateElement`, but that hook doesn't fire for tagless components

      if (!hasWrappedElement) {
        if (environment.isInteractive) {
          component.trigger('willRender');
        }

        component._transitionTo('hasElement');

        if (environment.isInteractive) {
          component.trigger('willInsertElement');
        }
      }

      if (false
      /* DEBUG */
      ) {
        processComponentInitializationAssertions(component, {});
      }

      var bucket = new ComponentStateBucket(environment, component, null, finalizer, hasWrappedElement);

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        environment.debugRenderTree.create(bucket, {
          type: 'component',
          name: state.name,
          args: _runtime2.EMPTY_ARGS,
          instance: component,
          template: state.template
        });
      }

      return bucket;
    };

    return RootComponentManager;
  }(CurlyComponentManager); // ROOT is the top-level template it has nothing but one yield.
  // it is supposed to have a dummy element


  var ROOT_CAPABILITIES = {
    dynamicLayout: false,
    dynamicTag: true,
    prepareArgs: false,
    createArgs: false,
    attributeHook: true,
    elementHook: true,
    createCaller: true,
    dynamicScope: true,
    updateHook: true,
    createInstance: true
  };

  var RootComponentDefinition =
  /*#__PURE__*/
  function () {
    function RootComponentDefinition(component) {
      this.component = component;
      var manager = new RootComponentManager(component);
      this.manager = manager;

      var factory = _container.FACTORY_FOR.get(component);

      this.state = {
        name: factory.fullName.slice(10),
        capabilities: ROOT_CAPABILITIES,
        ComponentClass: factory,
        handle: null
      };
    }

    var _proto42 = RootComponentDefinition.prototype;

    _proto42.getTag = function getTag(_ref9) {
      var component = _ref9.component;
      return component[DIRTY_TAG];
    };

    return RootComponentDefinition;
  }();

  var DynamicScope =
  /*#__PURE__*/
  function () {
    function DynamicScope(view, outletState) {
      this.view = view;
      this.outletState = outletState;
    }

    var _proto43 = DynamicScope.prototype;

    _proto43.child = function child() {
      return new DynamicScope(this.view, this.outletState);
    };

    _proto43.get = function get(key) {
      // tslint:disable-next-line:max-line-length
      (false && !(key === 'outletState') && (0, _debug.assert)("Using `-get-dynamic-scope` is only supported for `outletState` (you used `" + key + "`).", key === 'outletState'));
      return this.outletState;
    };

    _proto43.set = function set(key, value$$1) {
      // tslint:disable-next-line:max-line-length
      (false && !(key === 'outletState') && (0, _debug.assert)("Using `-with-dynamic-scope` is only supported for `outletState` (you used `" + key + "`).", key === 'outletState'));
      this.outletState = value$$1;
      return value$$1;
    };

    return DynamicScope;
  }();

  var RootState =
  /*#__PURE__*/
  function () {
    function RootState(root, env, template, self, parentElement, dynamicScope, builder) {
      var _this21 = this;

      (false && !(template !== undefined) && (0, _debug.assert)("You cannot render `" + self.value() + "` without a template.", template !== undefined));
      this.id = (0, _views.getViewId)(root);
      this.env = env;
      this.root = root;
      this.result = undefined;
      this.shouldReflush = false;
      this.destroyed = false;
      var options = this.options = {
        alwaysRevalidate: false
      };

      this.render = function () {
        var layout = template.asLayout();
        var handle = layout.compile();
        var iterator = (0, _runtime2.renderMain)(layout['compiler'].program, env, self, dynamicScope, builder(env, {
          element: parentElement,
          nextSibling: null
        }), handle);
        var iteratorResult;

        do {
          iteratorResult = iterator.next();
        } while (!iteratorResult.done);

        var result = _this21.result = iteratorResult.value; // override .render function after initial render

        _this21.render = function () {
          return result.rerender(options);
        };
      };
    }

    var _proto44 = RootState.prototype;

    _proto44.isFor = function isFor(possibleRoot) {
      return this.root === possibleRoot;
    };

    _proto44.destroy = function destroy() {
      var result = this.result,
          env = this.env;
      this.destroyed = true;
      this.env = undefined;
      this.root = null;
      this.result = undefined;
      this.render = undefined;

      if (result) {
        /*
         Handles these scenarios:
                * When roots are removed during standard rendering process, a transaction exists already
           `.begin()` / `.commit()` are not needed.
         * When roots are being destroyed manually (`component.append(); component.destroy() case), no
           transaction exists already.
         * When roots are being destroyed during `Renderer#destroy`, no transaction exists
                */
        var needsTransaction = !env.inTransaction;

        if (needsTransaction) {
          env.begin();
        }

        try {
          result.destroy();
        } finally {
          if (needsTransaction) {
            env.commit();
          }
        }
      }
    };

    return RootState;
  }();

  var renderers = [];

  function _resetRenderers() {
    renderers.length = 0;
  }

  function register(renderer) {
    (false && !(renderers.indexOf(renderer) === -1) && (0, _debug.assert)('Cannot register the same renderer twice', renderers.indexOf(renderer) === -1));
    renderers.push(renderer);
  }

  function deregister(renderer) {
    var index = renderers.indexOf(renderer);
    (false && !(index !== -1) && (0, _debug.assert)('Cannot deregister unknown unregistered renderer', index !== -1));
    renderers.splice(index, 1);
  }

  function loopBegin() {
    for (var i = 0; i < renderers.length; i++) {
      renderers[i]._scheduleRevalidate();
    }
  }

  function K() {
    /* noop */
  }

  var renderSettledDeferred = null;
  /*
    Returns a promise which will resolve when rendering has settled. Settled in
    this context is defined as when all of the tags in use are "current" (e.g.
    `renderers.every(r => r._isValid())`). When this is checked at the _end_ of
    the run loop, this essentially guarantees that all rendering is completed.
  
    @method renderSettled
    @returns {Promise<void>} a promise which fulfills when rendering has settled
  */

  function renderSettled() {
    if (renderSettledDeferred === null) {
      renderSettledDeferred = _rsvp.default.defer(); // if there is no current runloop, the promise created above will not have
      // a chance to resolve (because its resolved in backburner's "end" event)

      if (!(0, _runloop.getCurrentRunLoop)()) {
        // ensure a runloop has been kicked off
        _runloop.backburner.schedule('actions', null, K);
      }
    }

    return renderSettledDeferred.promise;
  }

  function resolveRenderPromise() {
    if (renderSettledDeferred !== null) {
      var resolve = renderSettledDeferred.resolve;
      renderSettledDeferred = null;

      _runloop.backburner.join(null, resolve);
    }
  }

  var loops = 0;

  function loopEnd() {
    for (var i = 0; i < renderers.length; i++) {
      if (!renderers[i]._isValid()) {
        if (loops > _environment2.ENV._RERENDER_LOOP_LIMIT) {
          loops = 0; // TODO: do something better

          renderers[i].destroy();
          throw new Error('infinite rendering invalidation detected');
        }

        loops++;
        return _runloop.backburner.join(null, K);
      }
    }

    loops = 0;
    resolveRenderPromise();
  }

  _runloop.backburner.on('begin', loopBegin);

  _runloop.backburner.on('end', loopEnd);

  var Renderer =
  /*#__PURE__*/
  function () {
    function Renderer(env, rootTemplate, viewRegistry, destinedForDOM, builder) {
      if (destinedForDOM === void 0) {
        destinedForDOM = false;
      }

      if (builder === void 0) {
        builder = _runtime2.clientBuilder;
      }

      this._env = env;
      this._rootTemplate = rootTemplate(env.owner);
      this._viewRegistry = viewRegistry;
      this._destinedForDOM = destinedForDOM;
      this._destroyed = false;
      this._roots = [];
      this._lastRevision = -1;
      this._isRenderingRoots = false;
      this._removedRoots = [];
      this._builder = builder;
    } // renderer HOOKS


    var _proto45 = Renderer.prototype;

    _proto45.appendOutletView = function appendOutletView(view, target) {
      var definition = createRootOutlet(view);

      this._appendDefinition(view, (0, _runtime2.curry)(definition), target);
    };

    _proto45.appendTo = function appendTo(view, target) {
      var definition = new RootComponentDefinition(view);

      this._appendDefinition(view, (0, _runtime2.curry)(definition), target);
    };

    _proto45._appendDefinition = function _appendDefinition(root, definition, target) {
      var self = new UnboundReference(definition);
      var dynamicScope = new DynamicScope(null, _runtime2.UNDEFINED_REFERENCE);
      var rootState = new RootState(root, this._env, this._rootTemplate, self, target, dynamicScope, this._builder);

      this._renderRoot(rootState);
    };

    _proto45.rerender = function rerender() {
      this._scheduleRevalidate();
    };

    _proto45.register = function register(view) {
      var id = (0, _views.getViewId)(view);
      (false && !(!this._viewRegistry[id]) && (0, _debug.assert)('Attempted to register a view with an id already in use: ' + id, !this._viewRegistry[id]));
      this._viewRegistry[id] = view;
    };

    _proto45.unregister = function unregister(view) {
      delete this._viewRegistry[(0, _views.getViewId)(view)];
    };

    _proto45.remove = function remove(view) {
      view._transitionTo('destroying');

      this.cleanupRootFor(view);

      if (this._destinedForDOM) {
        view.trigger('didDestroyElement');
      }
    };

    _proto45.cleanupRootFor = function cleanupRootFor(view) {
      // no need to cleanup roots if we have already been destroyed
      if (this._destroyed) {
        return;
      }

      var roots = this._roots; // traverse in reverse so we can remove items
      // without mucking up the index

      var i = this._roots.length;

      while (i--) {
        var root = roots[i];

        if (root.isFor(view)) {
          root.destroy();
          roots.splice(i, 1);
        }
      }
    };

    _proto45.destroy = function destroy() {
      if (this._destroyed) {
        return;
      }

      this._destroyed = true;

      this._clearAllRoots();
    };

    _proto45.getBounds = function getBounds(view) {
      var bounds = view[BOUNDS];
      (false && !(Boolean(bounds)) && (0, _debug.assert)('object passed to getBounds must have the BOUNDS symbol as a property', Boolean(bounds)));
      var parentElement = bounds.parentElement();
      var firstNode = bounds.firstNode();
      var lastNode = bounds.lastNode();
      return {
        parentElement: parentElement,
        firstNode: firstNode,
        lastNode: lastNode
      };
    };

    _proto45.createElement = function createElement(tagName) {
      return this._env.getAppendOperations().createElement(tagName);
    };

    _proto45._renderRoot = function _renderRoot(root) {
      var roots = this._roots;
      roots.push(root);

      if (roots.length === 1) {
        register(this);
      }

      this._renderRootsTransaction();
    };

    _proto45._renderRoots = function _renderRoots() {
      var roots = this._roots,
          env = this._env,
          removedRoots = this._removedRoots;
      var globalShouldReflush = false;
      var initialRootsLength;

      do {
        env.begin();

        try {
          // ensure that for the first iteration of the loop
          // each root is processed
          initialRootsLength = roots.length;
          globalShouldReflush = false;

          for (var i = 0; i < roots.length; i++) {
            var root = roots[i];

            if (root.destroyed) {
              // add to the list of roots to be removed
              // they will be removed from `this._roots` later
              removedRoots.push(root); // skip over roots that have been marked as destroyed

              continue;
            }

            var shouldReflush = root.shouldReflush; // when processing non-initial reflush loops,
            // do not process more roots than needed

            if (i >= initialRootsLength && !shouldReflush) {
              continue;
            }

            root.options.alwaysRevalidate = shouldReflush; // track shouldReflush based on this roots render result

            shouldReflush = root.shouldReflush = (0, _metal.runInTransaction)(root, 'render'); // globalShouldReflush should be `true` if *any* of
            // the roots need to reflush

            globalShouldReflush = globalShouldReflush || shouldReflush;
          }

          this._lastRevision = (0, _reference.value)(_reference.CURRENT_TAG);
        } finally {
          env.commit();
        }
      } while (globalShouldReflush || roots.length > initialRootsLength); // remove any roots that were destroyed during this transaction


      while (removedRoots.length) {
        var _root = removedRoots.pop();

        var rootIndex = roots.indexOf(_root);
        roots.splice(rootIndex, 1);
      }

      if (this._roots.length === 0) {
        deregister(this);
      }
    };

    _proto45._renderRootsTransaction = function _renderRootsTransaction() {
      if (this._isRenderingRoots) {
        // currently rendering roots, a new root was added and will
        // be processed by the existing _renderRoots invocation
        return;
      } // used to prevent calling _renderRoots again (see above)
      // while we are actively rendering roots


      this._isRenderingRoots = true;
      var completedWithoutError = false;

      try {
        this._renderRoots();

        completedWithoutError = true;
      } finally {
        if (!completedWithoutError) {
          this._lastRevision = (0, _reference.value)(_reference.CURRENT_TAG);

          if (this._env.inTransaction === true) {
            this._env.commit();
          }
        }

        this._isRenderingRoots = false;
      }
    };

    _proto45._clearAllRoots = function _clearAllRoots() {
      var roots = this._roots;

      for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        root.destroy();
      }

      this._removedRoots.length = 0;
      this._roots = []; // if roots were present before destroying
      // deregister this renderer instance

      if (roots.length) {
        deregister(this);
      }
    };

    _proto45._scheduleRevalidate = function _scheduleRevalidate() {
      _runloop.backburner.scheduleOnce('render', this, this._revalidate);
    };

    _proto45._isValid = function _isValid() {
      return this._destroyed || this._roots.length === 0 || (0, _reference.validate)(_reference.CURRENT_TAG, this._lastRevision);
    };

    _proto45._revalidate = function _revalidate() {
      if (this._isValid()) {
        return;
      }

      this._renderRootsTransaction();
    };

    return Renderer;
  }();

  _exports.Renderer = Renderer;

  var InertRenderer =
  /*#__PURE__*/
  function (_Renderer) {
    (0, _emberBabel.inheritsLoose)(InertRenderer, _Renderer);

    function InertRenderer() {
      return _Renderer.apply(this, arguments) || this;
    }

    InertRenderer.create = function create(_ref10) {
      var env = _ref10.env,
          rootTemplate = _ref10.rootTemplate,
          _viewRegistry = _ref10._viewRegistry,
          builder = _ref10.builder;
      return new this(env, rootTemplate, _viewRegistry, false, builder);
    };

    var _proto46 = InertRenderer.prototype;

    _proto46.getElement = function getElement(_view) {
      throw new Error('Accessing `this.element` is not allowed in non-interactive environments (such as FastBoot).');
    };

    return InertRenderer;
  }(Renderer);

  _exports.InertRenderer = InertRenderer;

  var InteractiveRenderer =
  /*#__PURE__*/
  function (_Renderer2) {
    (0, _emberBabel.inheritsLoose)(InteractiveRenderer, _Renderer2);

    function InteractiveRenderer() {
      return _Renderer2.apply(this, arguments) || this;
    }

    InteractiveRenderer.create = function create(_ref11) {
      var env = _ref11.env,
          rootTemplate = _ref11.rootTemplate,
          _viewRegistry = _ref11._viewRegistry,
          builder = _ref11.builder;
      return new this(env, rootTemplate, _viewRegistry, true, builder);
    };

    var _proto47 = InteractiveRenderer.prototype;

    _proto47.getElement = function getElement(view) {
      return (0, _views.getViewElement)(view);
    };

    return InteractiveRenderer;
  }(Renderer);

  _exports.InteractiveRenderer = InteractiveRenderer;
  var TEMPLATES = {};

  function setTemplates(templates) {
    TEMPLATES = templates;
  }

  function getTemplates() {
    return TEMPLATES;
  }

  function getTemplate(name) {
    if (TEMPLATES.hasOwnProperty(name)) {
      return TEMPLATES[name];
    }
  }

  function hasTemplate(name) {
    return TEMPLATES.hasOwnProperty(name);
  }

  function setTemplate(name, template) {
    return TEMPLATES[name] = template;
  }

  var InternalComponentDefinition = function InternalComponentDefinition(manager, ComponentClass, layout) {
    this.manager = manager;
    this.state = {
      ComponentClass: ComponentClass,
      layout: layout
    };
  };

  var InternalManager =
  /*#__PURE__*/
  function (_AbstractManager3) {
    (0, _emberBabel.inheritsLoose)(InternalManager, _AbstractManager3);

    function InternalManager(owner) {
      var _this22;

      _this22 = _AbstractManager3.call(this) || this;
      _this22.owner = owner;
      return _this22;
    }

    var _proto48 = InternalManager.prototype;

    _proto48.getLayout = function getLayout(_ref12) {
      var _layout = _ref12.layout;

      var layout = _layout.asLayout();

      return {
        handle: layout.compile(),
        symbolTable: layout.symbolTable
      };
    };

    return InternalManager;
  }(AbstractManager);

  var CAPABILITIES$1 = {
    dynamicLayout: false,
    dynamicTag: false,
    prepareArgs: true,
    createArgs: true,
    attributeHook: false,
    elementHook: false,
    createCaller: true,
    dynamicScope: false,
    updateHook: true,
    createInstance: true
  };
  var EMPTY_POSITIONAL_ARGS$1 = [];
  (0, _debug.debugFreeze)(EMPTY_POSITIONAL_ARGS$1);

  var InputComponentManager =
  /*#__PURE__*/
  function (_InternalManager) {
    (0, _emberBabel.inheritsLoose)(InputComponentManager, _InternalManager);

    function InputComponentManager() {
      return _InternalManager.apply(this, arguments) || this;
    }

    var _proto49 = InputComponentManager.prototype;

    _proto49.getCapabilities = function getCapabilities() {
      return CAPABILITIES$1;
    };

    _proto49.prepareArgs = function prepareArgs(_state, args) {
      (false && !(args.positional.length === 0) && (0, _debug.assert)('The `<Input />` component does not take any positional arguments', args.positional.length === 0));
      var __ARGS__ = args.named.capture().map;
      return {
        positional: EMPTY_POSITIONAL_ARGS$1,
        named: {
          __ARGS__: new RootReference(__ARGS__),
          type: args.named.get('type')
        }
      };
    };

    _proto49.create = function create(env, _ref13, args, _dynamicScope, caller) {
      var ComponentClass = _ref13.ComponentClass,
          layout = _ref13.layout;
      (false && !((0, _reference.isConst)(caller)) && (0, _debug.assert)('caller must be const', (0, _reference.isConst)(caller)));
      var type = args.named.get('type');
      var instance = ComponentClass.create({
        caller: caller.value(),
        type: type.value()
      });
      var state = {
        env: env,
        type: type,
        instance: instance
      };

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        env.debugRenderTree.create(state, {
          type: 'component',
          name: 'input',
          args: args.capture(),
          instance: instance,
          template: layout
        });
      }

      return state;
    };

    _proto49.getSelf = function getSelf(_ref14) {
      var instance = _ref14.instance;
      return new RootReference(instance);
    };

    _proto49.getTag = function getTag() {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        // returning a const tag skips the update hook (VM BUG?)
        return (0, _reference.createTag)();
      } else {
        // an outlet has no hooks
        return _reference.CONSTANT_TAG;
      }
    };

    _proto49.didRenderLayout = function didRenderLayout(state, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.env.debugRenderTree.didRender(state, bounds);
      }
    };

    _proto49.update = function update(state) {
      (0, _metal.set)(state.instance, 'type', state.type.value());

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.env.debugRenderTree.update(state);
      }
    };

    _proto49.didUpdateLayout = function didUpdateLayout(state, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.env.debugRenderTree.didRender(state, bounds);
      }
    };

    _proto49.getDestructor = function getDestructor(state) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        return {
          destroy: function destroy() {
            state.env.debugRenderTree.willDestroy(state);
            state.instance.destroy();
          }
        };
      } else {
        return state.instance;
      }
    };

    return InputComponentManager;
  }(InternalManager);

  var InputComponentManagerFactory = function InputComponentManagerFactory(owner) {
    return new InputComponentManager(owner);
  };

  var MANAGERS = new WeakMap();
  var getPrototypeOf = Object.getPrototypeOf;

  function setManager(wrapper, obj) {
    MANAGERS.set(obj, wrapper);
    return obj;
  }

  function getManager(obj) {
    var pointer = obj;

    while (pointer !== undefined && pointer !== null) {
      var manager = MANAGERS.get(pointer);

      if (manager !== undefined) {
        return manager;
      }

      pointer = getPrototypeOf(pointer);
    }

    return null;
  }
  /**
  @module @ember/component
  */

  /**
    See [Ember.Templates.components.Input](/ember/release/classes/Ember.Templates.components/methods/Input?anchor=Input).
  
    @method input
    @for Ember.Templates.helpers
    @param {Hash} options
    @public
    */

  /**
    The `Input` component lets you create an HTML `<input>` element.
  
    ```handlebars
    <Input @value="987" />
    ```
  
    creates an `<input>` element with `type="text"` and value set to 987.
  
    ### Text field
  
    If no `type` argument is specified, a default of type 'text' is used.
  
    ```handlebars
    Search:
    <Input @value={{this.searchWord}}>
    ```
  
    In this example, the initial value in the `<input>` will be set to the value of
    `this.searchWord`. If the user changes the text, the value of `this.searchWord` will also be
    updated.
  
    ### Actions
  
    The `Input` component takes a number of arguments with callbacks that are invoked in response to
    user events.
  
    * `enter`
    * `insert-newline`
    * `escape-press`
    * `focus-in`
    * `focus-out`
    * `key-press`
    * `key-up`
  
    These callbacks are passed to `Input` like this:
  
    ```handlebars
    <Input @value={{this.searchWord}} @enter={{this.query}} />
    ```
  
    ### `<input>` HTML Attributes to Avoid
  
    In most cases, if you want to pass an attribute to the underlying HTML `<input>` element, you
    can pass the attribute directly, just like any other Ember component.
  
    ```handlebars
    <Input @type="text" size="10" />
    ```
  
    In this example, the `size` attribute will be applied to the underlying `<input>` element in the
    outputted HTML.
  
    However, there are a few attributes where you **must** use the `@` version.
  
    * `@type`: This argument is used to control which Ember component is used under the hood
    * `@value`: The `@value` argument installs a two-way binding onto the element. If you wanted a
      one-way binding, use `<input>` with the `value` property and the `input` event instead.
    * `@checked` (for checkboxes): like `@value`, the `@checked` argument installs a two-way binding
      onto the element. If you wanted a one-way binding, use `<input type="checkbox">` with
      `checked` and the `input` event instead.
  
    ### Extending `TextField`
  
    Internally, `<Input @type="text" />` creates an instance of `TextField`, passing arguments from
    the helper to `TextField`'s `create` method. Subclassing `TextField` is supported but not
    recommended.
  
    See [TextField](/ember/release/classes/TextField)
  
    ### Checkbox
  
    To create an `<input type="checkbox">`:
  
    ```handlebars
    Emberize Everything:
    <Input @type="checkbox" @checked={{this.isEmberized}} name="isEmberized" />
    ```
  
    This will bind the checked state of this checkbox to the value of `isEmberized` -- if either one
    changes, it will be reflected in the other.
  
    ### Extending `Checkbox`
  
    Internally, `<Input @type="checkbox" />` creates an instance of `Checkbox`. Subclassing
    `TextField` is supported but not recommended.
  
    See [Checkbox](/ember/release/classes/Checkbox)
  
    @method Input
    @for Ember.Templates.components
    @see {TextField}
    @see {Checkbox}
    @param {Hash} options
    @public
  */


  var Input = _runtime.Object.extend({
    isCheckbox: (0, _metal.computed)('type', function () {
      return this.type === 'checkbox';
    })
  });

  setManager({
    factory: InputComponentManagerFactory,
    internal: true,
    type: 'component'
  }, Input);

  Input.toString = function () {
    return '@ember/component/input';
  }; ///<reference path="./simple-dom.d.ts" />

  /**
  @module ember
  */

  /**
    Calls [String.loc](/ember/release/classes/String/methods/loc?anchor=loc) with the
    provided string. This is a convenient way to localize text within a template.
    For example:
  
    ```javascript
    Ember.STRINGS = {
      '_welcome_': 'Bonjour'
    };
    ```
  
    ```handlebars
    <div class='message'>
      {{loc '_welcome_'}}
    </div>
    ```
  
    ```html
    <div class='message'>
      Bonjour
    </div>
    ```
  
    See [String.loc](/ember/release/classes/String/methods/loc?anchor=loc) for how to
    set up localized string references.
  
    @method loc
    @for Ember.Templates.helpers
    @param {String} str The string to format.
    @see {String#loc}
    @public
  */


  var loc$1 = helper(function (params) {
    return _string.loc.apply(null, params
    /* let the other side handle errors */
    );
  });

  var CompileTimeLookup =
  /*#__PURE__*/
  function () {
    function CompileTimeLookup(resolver) {
      this.resolver = resolver;
    }

    var _proto50 = CompileTimeLookup.prototype;

    _proto50.getCapabilities = function getCapabilities(handle) {
      var definition = this.resolver.resolve(handle);
      var manager = definition.manager,
          state = definition.state;
      return manager.getCapabilities(state);
    };

    _proto50.getLayout = function getLayout(handle) {
      var _this$resolver$resolv = this.resolver.resolve(handle),
          manager = _this$resolver$resolv.manager,
          state = _this$resolver$resolv.state;

      var capabilities = manager.getCapabilities(state);

      if (capabilities.dynamicLayout) {
        return null;
      }

      var invocation = manager.getLayout(state, this.resolver);
      return {
        // TODO: this seems weird, it already is compiled
        compile: function compile() {
          return invocation.handle;
        },
        symbolTable: invocation.symbolTable
      };
    };

    _proto50.lookupHelper = function lookupHelper(name, referrer) {
      return this.resolver.lookupHelper(name, referrer);
    };

    _proto50.lookupModifier = function lookupModifier(name, referrer) {
      return this.resolver.lookupModifier(name, referrer);
    };

    _proto50.lookupComponentDefinition = function lookupComponentDefinition(name, referrer) {
      return this.resolver.lookupComponentHandle(name, referrer);
    };

    _proto50.lookupPartial = function lookupPartial(name, referrer) {
      return this.resolver.lookupPartial(name, referrer);
    };

    return CompileTimeLookup;
  }();

  var CAPABILITIES$2 = {
    dynamicLayout: false,
    dynamicTag: false,
    prepareArgs: false,
    createArgs: true,
    attributeHook: false,
    elementHook: false,
    createCaller: false,
    dynamicScope: true,
    updateHook: true,
    createInstance: true
  };

  function capabilities(managerAPI, options) {
    if (options === void 0) {
      options = {};
    }

    (false && !(managerAPI === '3.4' || managerAPI === '3.13') && (0, _debug.assert)('Invalid component manager compatibility specified', managerAPI === '3.4' || managerAPI === '3.13'));
    var updateHook = true;
    {
      updateHook = managerAPI === '3.13' ? Boolean(options.updateHook) : true;
    }
    return {
      asyncLifeCycleCallbacks: Boolean(options.asyncLifecycleCallbacks),
      destructor: Boolean(options.destructor),
      updateHook: updateHook
    };
  }

  function hasAsyncLifeCycleCallbacks(delegate) {
    return delegate.capabilities.asyncLifeCycleCallbacks;
  }

  function hasUpdateHook(delegate) {
    return delegate.capabilities.updateHook;
  }

  function hasAsyncUpdateHook(delegate) {
    return hasAsyncLifeCycleCallbacks(delegate) && hasUpdateHook(delegate);
  }

  function hasDestructors(delegate) {
    return delegate.capabilities.destructor;
  }
  /**
    The CustomComponentManager allows addons to provide custom component
    implementations that integrate seamlessly into Ember. This is accomplished
    through a delegate, registered with the custom component manager, which
    implements a set of hooks that determine component behavior.
  
    To create a custom component manager, instantiate a new CustomComponentManager
    class and pass the delegate as the first argument:
  
    ```js
    let manager = new CustomComponentManager({
      // ...delegate implementation...
    });
    ```
  
    ## Delegate Hooks
  
    Throughout the lifecycle of a component, the component manager will invoke
    delegate hooks that are responsible for surfacing those lifecycle changes to
    the end developer.
  
    * `create()` - invoked when a new instance of a component should be created
    * `update()` - invoked when the arguments passed to a component change
    * `getContext()` - returns the object that should be
  */


  var CustomComponentManager =
  /*#__PURE__*/
  function (_AbstractManager4) {
    (0, _emberBabel.inheritsLoose)(CustomComponentManager, _AbstractManager4);

    function CustomComponentManager() {
      return _AbstractManager4.apply(this, arguments) || this;
    }

    var _proto51 = CustomComponentManager.prototype;

    _proto51.create = function create(env, definition, args) {
      var delegate = definition.delegate;
      var capturedArgs = args.capture();
      var value$$1;
      var namedArgsProxy = {};
      {
        if (_utils.HAS_NATIVE_PROXY) {
          var handler = {
            get: function get(_target, prop) {
              if (capturedArgs.named.has(prop)) {
                var ref = capturedArgs.named.get(prop);
                (0, _metal.consume)(ref.tag);
                return ref.value();
              }
            },
            has: function has(_target, prop) {
              return capturedArgs.named.has(prop);
            },
            ownKeys: function ownKeys(_target) {
              return capturedArgs.named.names;
            },
            getOwnPropertyDescriptor: function getOwnPropertyDescriptor(_target, prop) {
              (false && !(capturedArgs.named.has(prop)) && (0, _debug.assert)('args proxies do not have real property descriptors, so you should never need to call getOwnPropertyDescriptor yourself. This code exists for enumerability, such as in for-in loops and Object.keys()', capturedArgs.named.has(prop)));
              return {
                enumerable: true,
                configurable: true
              };
            }
          };

          if (false
          /* DEBUG */
          ) {
            handler.set = function (_target, prop) {
              (false && !(false) && (0, _debug.assert)("You attempted to set " + definition.ComponentClass.class + "#" + String(prop) + " on a components arguments. Component arguments are immutable and cannot be updated directly, they always represent the values that are passed to your component. If you want to set default values, you should use a getter instead"));
              return false;
            };
          }

          namedArgsProxy = new Proxy(namedArgsProxy, handler);
        } else {
          capturedArgs.named.names.forEach(function (name) {
            Object.defineProperty(namedArgsProxy, name, {
              enumerable: true,
              configurable: true,
              get: function get() {
                var ref = capturedArgs.named.get(name);
                (0, _metal.consume)(ref.tag);
                return ref.value();
              }
            });
          });
        }

        _metal.ARGS_PROXY_TAGS.set(namedArgsProxy, capturedArgs.named);

        value$$1 = {
          named: namedArgsProxy,
          positional: capturedArgs.positional.value()
        };
      }
      var component = delegate.createComponent(definition.ComponentClass.class, value$$1);
      var bucket = new CustomComponentState(delegate, component, capturedArgs, env, namedArgsProxy);

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        env.debugRenderTree.create(bucket, {
          type: 'component',
          name: definition.name,
          args: args.capture(),
          instance: component,
          template: definition.template
        });
      }

      return bucket;
    };

    _proto51.update = function update(bucket) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.env.debugRenderTree.update(bucket);
      }

      var delegate = bucket.delegate,
          component = bucket.component,
          args = bucket.args,
          namedArgsProxy = bucket.namedArgsProxy;
      var value$$1;
      {
        value$$1 = {
          named: namedArgsProxy,
          positional: args.positional.value()
        };
      }

      if (hasUpdateHook(delegate)) {
        delegate.updateComponent(component, value$$1);
      }
    };

    _proto51.didCreate = function didCreate(_ref15) {
      var delegate = _ref15.delegate,
          component = _ref15.component;

      if (hasAsyncLifeCycleCallbacks(delegate)) {
        delegate.didCreateComponent(component);
      }
    };

    _proto51.didUpdate = function didUpdate(_ref16) {
      var delegate = _ref16.delegate,
          component = _ref16.component;

      if (hasAsyncUpdateHook(delegate)) {
        delegate.didUpdateComponent(component);
      }
    };

    _proto51.getContext = function getContext(_ref17) {
      var delegate = _ref17.delegate,
          component = _ref17.component;
      delegate.getContext(component);
    };

    _proto51.getSelf = function getSelf(_ref18) {
      var delegate = _ref18.delegate,
          component = _ref18.component;
      return RootReference.create(delegate.getContext(component));
    };

    _proto51.getDestructor = function getDestructor(state) {
      var destructor = null;

      if (hasDestructors(state.delegate)) {
        destructor = state;
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        var inner = destructor;
        destructor = {
          destroy: function destroy() {
            state.env.debugRenderTree.willDestroy(state);

            if (inner) {
              inner.destroy();
            }
          }
        };
      }

      return destructor;
    };

    _proto51.getCapabilities = function getCapabilities(_ref19) {
      var delegate = _ref19.delegate;
      return (0, _polyfills.assign)({}, CAPABILITIES$2, {
        updateHook: _environment2.ENV._DEBUG_RENDER_TREE || delegate.capabilities.updateHook
      });
    };

    _proto51.getTag = function getTag(_ref20) {
      var args = _ref20.args;

      if ((0, _reference.isConst)(args)) {
        // returning a const tag skips the update hook (VM BUG?)
        return (0, _reference.createTag)();
      } else {
        return args.tag;
      }
    };

    _proto51.didRenderLayout = function didRenderLayout(bucket, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.env.debugRenderTree.didRender(bucket, bounds);
      }
    };

    _proto51.didUpdateLayout = function didUpdateLayout(bucket, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.env.debugRenderTree.didRender(bucket, bounds);
      }
    };

    _proto51.getLayout = function getLayout(state) {
      return {
        handle: state.template.asLayout().compile(),
        symbolTable: state.symbolTable
      };
    };

    return CustomComponentManager;
  }(AbstractManager);

  var CUSTOM_COMPONENT_MANAGER = new CustomComponentManager();
  /**
   * Stores internal state about a component instance after it's been created.
   */

  var CustomComponentState =
  /*#__PURE__*/
  function () {
    function CustomComponentState(delegate, component, args, env, namedArgsProxy) {
      this.delegate = delegate;
      this.component = component;
      this.args = args;
      this.env = env;
      this.namedArgsProxy = namedArgsProxy;
    }

    var _proto52 = CustomComponentState.prototype;

    _proto52.destroy = function destroy() {
      var delegate = this.delegate,
          component = this.component;

      if (hasDestructors(delegate)) {
        delegate.destroyComponent(component);
      }
    };

    return CustomComponentState;
  }();

  var CustomManagerDefinition = function CustomManagerDefinition(name, ComponentClass, delegate, template) {
    this.name = name;
    this.ComponentClass = ComponentClass;
    this.delegate = delegate;
    this.template = template;
    this.manager = CUSTOM_COMPONENT_MANAGER;
    var layout = template.asLayout();
    var symbolTable = layout.symbolTable;
    this.symbolTable = symbolTable;
    this.state = {
      name: name,
      ComponentClass: ComponentClass,
      template: template,
      symbolTable: symbolTable,
      delegate: delegate
    };
  };

  var CAPABILITIES$3 = {
    dynamicLayout: false,
    dynamicTag: false,
    prepareArgs: false,
    createArgs: _environment2.ENV._DEBUG_RENDER_TREE,
    attributeHook: false,
    elementHook: false,
    createCaller: false,
    dynamicScope: false,
    updateHook: _environment2.ENV._DEBUG_RENDER_TREE,
    createInstance: true
  };

  var TemplateOnlyComponentManager =
  /*#__PURE__*/
  function (_AbstractManager5) {
    (0, _emberBabel.inheritsLoose)(TemplateOnlyComponentManager, _AbstractManager5);

    function TemplateOnlyComponentManager() {
      return _AbstractManager5.apply(this, arguments) || this;
    }

    var _proto53 = TemplateOnlyComponentManager.prototype;

    _proto53.getLayout = function getLayout(_ref21) {
      var template = _ref21.template;
      var layout = template.asLayout();
      return {
        handle: layout.compile(),
        symbolTable: layout.symbolTable
      };
    };

    _proto53.getCapabilities = function getCapabilities() {
      return CAPABILITIES$3;
    };

    _proto53.create = function create(environment, _ref22, args) {
      var name = _ref22.name,
          template = _ref22.template;

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        var bucket = {
          environment: environment
        };
        environment.debugRenderTree.create(bucket, {
          type: 'component',
          name: name,
          args: args.capture(),
          instance: null,
          template: template
        });
        return bucket;
      } else {
        return null;
      }
    };

    _proto53.getSelf = function getSelf() {
      return _runtime2.NULL_REFERENCE;
    };

    _proto53.getTag = function getTag() {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        // returning a const tag skips the update hook (VM BUG?)
        return (0, _reference.createTag)();
      } else {
        // an outlet has no hooks
        return _reference.CONSTANT_TAG;
      }
    };

    _proto53.getDestructor = function getDestructor(bucket) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        return {
          destroy: function destroy() {
            bucket.environment.debugRenderTree.willDestroy(bucket);
          }
        };
      } else {
        return null;
      }
    };

    _proto53.didRenderLayout = function didRenderLayout(bucket, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.didRender(bucket, bounds);
      }
    };

    _proto53.update = function update(bucket) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.update(bucket);
      }
    };

    _proto53.didUpdateLayout = function didUpdateLayout(bucket, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.didRender(bucket, bounds);
      }
    };

    return TemplateOnlyComponentManager;
  }(AbstractManager);

  var MANAGER = new TemplateOnlyComponentManager();

  var TemplateOnlyComponentDefinition =
  /*#__PURE__*/
  function () {
    function TemplateOnlyComponentDefinition(name, template) {
      this.name = name;
      this.template = template;
      this.manager = MANAGER;
    }

    (0, _emberBabel.createClass)(TemplateOnlyComponentDefinition, [{
      key: "state",
      get: function get() {
        return this;
      }
    }]);
    return TemplateOnlyComponentDefinition;
  }();

  var helper$1;

  if (false
  /* DEBUG */
  ) {
    var ComponentAssertionReference =
    /*#__PURE__*/
    function () {
      function ComponentAssertionReference(component, message) {
        this.component = component;
        this.message = message;
        this.tag = component.tag;
      }

      var _proto54 = ComponentAssertionReference.prototype;

      _proto54.value = function value() {
        var value$$1 = this.component.value();
        (false && !(typeof value$$1 !== 'string') && (0, _debug.assert)(this.message, typeof value$$1 !== 'string'));
        return value$$1;
      };

      _proto54.get = function get(property) {
        return this.component.get(property);
      };

      return ComponentAssertionReference;
    }();

    helper$1 = function helper$1(_vm, args) {
      return new ComponentAssertionReference(args.positional.at(0), args.positional.at(1).value());
    };
  } else {
    helper$1 = function helper$1(_vm, args) {
      return args.positional.at(0);
    };
  }

  var componentAssertionHelper = helper$1;

  function classHelper(_ref23) {
    var positional = _ref23.positional;
    var path = positional.at(0);
    var args = positional.length;
    var value$$1 = path.value();

    if (value$$1 === true) {
      if (args > 1) {
        return (0, _string.dasherize)(positional.at(1).value());
      }

      return null;
    }

    if (value$$1 === false) {
      if (args > 2) {
        return (0, _string.dasherize)(positional.at(2).value());
      }

      return null;
    }

    return value$$1;
  }

  function classHelper$1(_vm, args) {
    return new InternalHelperReference(classHelper, args.capture());
  }

  function inputTypeHelper(_ref24) {
    var positional = _ref24.positional;
    var type = positional.at(0).value();

    if (type === 'checkbox') {
      return '-checkbox';
    }

    return '-text-field';
  }

  function inputTypeHelper$1(_vm, args) {
    return new InternalHelperReference(inputTypeHelper, args.capture());
  }

  function normalizeClass(_ref25) {
    var positional = _ref25.positional;
    var classNameParts = positional.at(0).value().split('.');
    var className = classNameParts[classNameParts.length - 1];
    var value$$1 = positional.at(1).value();

    if (value$$1 === true) {
      return (0, _string.dasherize)(className);
    } else if (!value$$1 && value$$1 !== 0) {
      return '';
    } else {
      return String(value$$1);
    }
  }

  function normalizeClassHelper(_vm, args) {
    return new InternalHelperReference(normalizeClass, args.capture());
  }
  /**
  @module ember
  */

  /**
    The `{{action}}` helper provides a way to pass triggers for behavior (usually
    just a function) between components, and into components from controllers.
  
    ### Passing functions with the action helper
  
    There are three contexts an action helper can be used in. The first two
    contexts to discuss are attribute context, and Handlebars value context.
  
    ```handlebars
    {{! An example of attribute context }}
    <div onclick={{action "save"}}></div>
    {{! Examples of Handlebars value context }}
    {{input on-input=(action "save")}}
    {{yield (action "refreshData") andAnotherParam}}
    ```
  
    In these contexts,
    the helper is called a "closure action" helper. Its behavior is simple:
    If passed a function name, read that function off the `actions` property
    of the current context. Once that function is read, or immediately if a function was
    passed, create a closure over that function and any arguments.
    The resulting value of an action helper used this way is simply a function.
  
    For example, in the attribute context:
  
    ```handlebars
    {{! An example of attribute context }}
    <div onclick={{action "save"}}></div>
    ```
  
    The resulting template render logic would be:
  
    ```js
    var div = document.createElement('div');
    var actionFunction = (function(context){
      return function() {
        return context.actions.save.apply(context, arguments);
      };
    })(context);
    div.onclick = actionFunction;
    ```
  
    Thus when the div is clicked, the action on that context is called.
    Because the `actionFunction` is just a function, closure actions can be
    passed between components and still execute in the correct context.
  
    Here is an example action handler on a component:
  
    ```app/components/my-component.js
    import Component from '@glimmer/component';
    import { action } from '@ember/object';
  
    export default class extends Component {
      @action
      save() {
        this.model.save();
      }
    }
    ```
  
    Actions are always looked up on the `actions` property of the current context.
    This avoids collisions in the naming of common actions, such as `destroy`.
    Two options can be passed to the `action` helper when it is used in this way.
  
    * `target=someProperty` will look to `someProperty` instead of the current
      context for the `actions` hash. This can be useful when targeting a
      service for actions.
    * `value="target.value"` will read the path `target.value` off the first
      argument to the action when it is called and rewrite the first argument
      to be that value. This is useful when attaching actions to event listeners.
  
    ### Invoking an action
  
    Closure actions curry both their scope and any arguments. When invoked, any
    additional arguments are added to the already curried list.
    Actions should be invoked using the [sendAction](/ember/release/classes/Component/methods/sendAction?anchor=sendAction)
    method. The first argument to `sendAction` is the action to be called, and
    additional arguments are passed to the action function. This has interesting
    properties combined with currying of arguments. For example:
  
    ```app/components/update-name.js
    import Component from '@glimmer/component';
    import { action } from '@ember/object';
  
    export default class extends Component {
      @action
      setName(model, name) {
        model.set('name', name);
      }
    }
    ```
  
    ```app/components/update-name.hbs
    {{input on-input=(action (action 'setName' @model) value="target.value")}}
    ```
  
    The first argument (`@model`) was curried over, and the run-time argument (`event`)
    becomes a second argument. Action calls can be nested this way because each simply
    returns a function. Any function can be passed to the `{{action}}` helper, including
    other actions.
  
    Actions invoked with `sendAction` have the same currying behavior as demonstrated
    with `on-input` above. For example:
  
    ```app/components/my-input.js
    import Component from '@glimmer/component';
    import { action } from '@ember/object';
  
    export default class extends Component {
      @action
      setName(model, name) {
        model.set('name', name);
      }
    }
    ```
  
    ```handlebars
    <MyInput @submit={{action 'setName' @model}} />
    ```
  
    or
  
    ```handlebars
    {{my-input submit=(action 'setName' @model)}}
    ```
  
    ```app/components/my-component.js
    import Component from '@ember/component';
  
    export default Component.extend({
      click() {
        // Note that model is not passed, it was curried in the template
        this.sendAction('submit', 'bob');
      }
    });
    ```
  
    ### Attaching actions to DOM elements
  
    The third context of the `{{action}}` helper can be called "element space".
    For example:
  
    ```handlebars
    {{! An example of element space }}
    <div {{action "save"}}></div>
    ```
  
    Used this way, the `{{action}}` helper provides a useful shortcut for
    registering an HTML element in a template for a single DOM event and
    forwarding that interaction to the template's context (controller or component).
    If the context of a template is a controller, actions used this way will
    bubble to routes when the controller does not implement the specified action.
    Once an action hits a route, it will bubble through the route hierarchy.
  
    ### Event Propagation
  
    `{{action}}` helpers called in element space can control event bubbling. Note
    that the closure style actions cannot.
  
    Events triggered through the action helper will automatically have
    `.preventDefault()` called on them. You do not need to do so in your event
    handlers. If you need to allow event propagation (to handle file inputs for
    example) you can supply the `preventDefault=false` option to the `{{action}}` helper:
  
    ```handlebars
    <div {{action "sayHello" preventDefault=false}}>
      <input type="file" />
      <input type="checkbox" />
    </div>
    ```
  
    To disable bubbling, pass `bubbles=false` to the helper:
  
    ```handlebars
    <button {{action 'edit' post bubbles=false}}>Edit</button>
    ```
  
    To disable bubbling with closure style actions you must create your own
    wrapper helper that makes use of `event.stopPropagation()`:
  
    ```handlebars
    <div onclick={{disable-bubbling (action "sayHello")}}>Hello</div>
    ```
  
    ```app/helpers/disable-bubbling.js
    import { helper } from '@ember/component/helper';
  
    export function disableBubbling([action]) {
      return function(event) {
        event.stopPropagation();
        return action(event);
      };
    }
    export default helper(disableBubbling);
    ```
  
    If you need the default handler to trigger you should either register your
    own event handler, or use event methods on your view class. See
    ["Responding to Browser Events"](/ember/release/classes/Component)
    in the documentation for `Component` for more information.
  
    ### Specifying DOM event type
  
    `{{action}}` helpers called in element space can specify an event type.
    By default the `{{action}}` helper registers for DOM `click` events. You can
    supply an `on` option to the helper to specify a different DOM event name:
  
    ```handlebars
    <div {{action "anActionName" on="doubleClick"}}>
      click me
    </div>
    ```
  
    See ["Event Names"](/ember/release/classes/Component) for a list of
    acceptable DOM event names.
  
    ### Specifying whitelisted modifier keys
  
    `{{action}}` helpers called in element space can specify modifier keys.
    By default the `{{action}}` helper will ignore click events with pressed modifier
    keys. You can supply an `allowedKeys` option to specify which keys should not be ignored.
  
    ```handlebars
    <div {{action "anActionName" allowedKeys="alt"}}>
      click me
    </div>
    ```
  
    This way the action will fire when clicking with the alt key pressed down.
    Alternatively, supply "any" to the `allowedKeys` option to accept any combination of modifier keys.
  
    ```handlebars
    <div {{action "anActionName" allowedKeys="any"}}>
      click me with any key pressed
    </div>
    ```
  
    ### Specifying a Target
  
    A `target` option can be provided to the helper to change
    which object will receive the method call. This option must be a path
    to an object, accessible in the current context:
  
    ```app/templates/application.hbs
    <div {{action "anActionName" target=someService}}>
      click me
    </div>
    ```
  
    ```app/controllers/application.js
    import Controller from '@ember/controller';
    import { inject as service } from '@ember/service';
  
    export default class extends Controller {
      @service someService;
    }
    ```
  
    @method action
    @for Ember.Templates.helpers
    @public
  */


  function action(_vm, args) {
    var named = args.named,
        positional = args.positional;
    var capturedArgs = positional.capture(); // The first two argument slots are reserved.
    // pos[0] is the context (or `this`)
    // pos[1] is the action name or function
    // Anything else is an action argument.

    var _capturedArgs$referen = capturedArgs.references,
        context = _capturedArgs$referen[0],
        action = _capturedArgs$referen[1],
        restArgs = _capturedArgs$referen.slice(2); // TODO: Is there a better way of doing this?


    var debugKey = action.propertyKey;
    var target = named.has('target') ? named.get('target') : context;
    var processArgs = makeArgsProcessor(named.has('value') && named.get('value'), restArgs);
    var fn;

    if (typeof action[INVOKE] === 'function') {
      fn = makeClosureAction(action, action, action[INVOKE], processArgs, debugKey);
    } else if ((0, _reference.isConst)(target) && (0, _reference.isConst)(action)) {
      fn = makeClosureAction(context.value(), target.value(), action.value(), processArgs, debugKey);
    } else {
      fn = makeDynamicClosureAction(context.value(), target, action, processArgs, debugKey);
    }

    fn[ACTION] = true;
    return new UnboundReference(fn);
  }

  function NOOP$1(args) {
    return args;
  }

  function makeArgsProcessor(valuePathRef, actionArgsRef) {
    var mergeArgs;

    if (actionArgsRef.length > 0) {
      mergeArgs = function mergeArgs(args) {
        return actionArgsRef.map(function (ref) {
          return ref.value();
        }).concat(args);
      };
    }

    var readValue;

    if (valuePathRef) {
      readValue = function readValue(args) {
        var valuePath = valuePathRef.value();

        if (valuePath && args.length > 0) {
          args[0] = (0, _metal.get)(args[0], valuePath);
        }

        return args;
      };
    }

    if (mergeArgs && readValue) {
      return function (args) {
        return readValue(mergeArgs(args));
      };
    } else {
      return mergeArgs || readValue || NOOP$1;
    }
  }

  function makeDynamicClosureAction(context, targetRef, actionRef, processArgs, debugKey) {
    // We don't allow undefined/null values, so this creates a throw-away action to trigger the assertions
    if (false
    /* DEBUG */
    ) {
      makeClosureAction(context, targetRef.value(), actionRef.value(), processArgs, debugKey);
    }

    return function () {
      return makeClosureAction(context, targetRef.value(), actionRef.value(), processArgs, debugKey).apply(void 0, arguments);
    };
  }

  function makeClosureAction(context, target, action, processArgs, debugKey) {
    var self;
    var fn;
    (false && !(action !== undefined && action !== null) && (0, _debug.assert)("Action passed is null or undefined in (action) from " + target + ".", action !== undefined && action !== null));

    if (typeof action[INVOKE] === 'function') {
      self = action;
      fn = action[INVOKE];
    } else {
      var typeofAction = typeof action;

      if (typeofAction === 'string') {
        self = target;
        fn = target.actions && target.actions[action];
        (false && !(fn) && (0, _debug.assert)("An action named '" + action + "' was not found in " + target, fn));
      } else if (typeofAction === 'function') {
        self = context;
        fn = action;
      } else {
        // tslint:disable-next-line:max-line-length
        (false && !(false) && (0, _debug.assert)("An action could not be made for `" + (debugKey || action) + "` in " + target + ". Please confirm that you are using either a quoted action name (i.e. `(action '" + (debugKey || 'myAction') + "')`) or a function available in " + target + ".", false));
      }
    }

    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var payload = {
        target: self,
        args: args,
        label: '@glimmer/closure-action'
      };
      return (0, _instrumentation.flaggedInstrument)('interaction.ember-action', payload, function () {
        return _runloop.join.apply(void 0, [self, fn].concat(processArgs(args)));
      });
    };
  }
  /**
  @module ember
  */

  /**
     Use the `{{array}}` helper to create an array to pass as an option to your
     components.
  
     ```handlebars
     <MyComponent @people={{array
       'Tom Dade'
       'Yehuda Katz'
       this.myOtherPerson}}
     />
     ```
      or
     ```handlebars
     {{my-component people=(array
       'Tom Dade'
       'Yehuda Katz'
       this.myOtherPerson)
     }}
     ```
  
     Would result in an object such as:
  
     ```js
     ['Tom Date', 'Yehuda Katz', this.get('myOtherPerson')]
     ```
  
     Where the 3rd item in the array is bound to updates of the `myOtherPerson` property.
  
     @method array
     @for Ember.Templates.helpers
     @param {Array} options
     @return {Array} Array
     @since 3.8.0
     @public
   */


  function array(_vm, args) {
    return args.positional.capture();
  }

  var isEmpty = function isEmpty(value$$1) {
    return value$$1 === null || value$$1 === undefined || typeof value$$1.toString !== 'function';
  };

  var normalizeTextValue = function normalizeTextValue(value$$1) {
    if (isEmpty(value$$1)) {
      return '';
    }

    return String(value$$1);
  };
  /**
  @module ember
  */

  /**
    Concatenates the given arguments into a string.
  
    Example:
  
    ```handlebars
    {{some-component name=(concat firstName " " lastName)}}
  
    {{! would pass name="<first name value> <last name value>" to the component}}
    ```
  
    or for angle bracket invocation, you actually don't need concat at all.
  
    ```handlebars
    <SomeComponent @name="{{firstName}} {{lastName}}" />
    ```
  
    @public
    @method concat
    @for Ember.Templates.helpers
    @since 1.13.0
  */


  function concat(_ref26) {
    var positional = _ref26.positional;
    return positional.value().map(normalizeTextValue).join('');
  }

  function concat$1(_vm, args) {
    return new InternalHelperReference(concat, args.capture());
  }

  function buildUntouchableThis(source) {
    var context = null;

    if (false
    /* DEBUG */
    && _utils.HAS_NATIVE_PROXY) {
      var assertOnProperty = function assertOnProperty(property) {
        (false && !(false) && (0, _debug.assert)("You accessed `this." + String(property) + "` from a function passed to the " + source + ", but the function itself was not bound to a valid `this` context. Consider updating to usage of `@action`."));
      };

      context = new Proxy({}, {
        get: function get(_target, property) {
          assertOnProperty(property);
        },
        set: function set(_target, property) {
          assertOnProperty(property);
          return false;
        },
        has: function has(_target, property) {
          assertOnProperty(property);
          return false;
        }
      });
    }

    return context;
  }

  var context = buildUntouchableThis('`fn` helper');
  /**
  @module ember
  */

  /**
    The `fn` helper allows you to ensure a function that you are passing off
    to another component, helper, or modifier has access to arguments that are
    available in the template.
  
    For example, if you have an `each` helper looping over a number of items, you
    may need to pass a function that expects to receive the item as an argument
    to a component invoked within the loop. Here's how you could use the `fn`
    helper to pass both the function and its arguments together:
  
      ```app/templates/components/items-listing.hbs
    {{#each @items as |item|}}
      <DisplayItem @item=item @select={{fn this.handleSelected item}} />
    {{/each}}
    ```
  
    ```app/components/items-list.js
    import Component from '@glimmer/component';
    import { action } from '@ember/object';
  
    export default class ItemsList extends Component {
      @action
      handleSelected(item) {
        // ...snip...
      }
    }
    ```
  
    In this case the `display-item` component will receive a normal function
    that it can invoke. When it invokes the function, the `handleSelected`
    function will receive the `item` and any arguments passed, thanks to the
    `fn` helper.
  
    Let's take look at what that means in a couple circumstances:
  
    - When invoked as `this.args.select()` the `handleSelected` function will
      receive the `item` from the loop as its first and only argument.
    - When invoked as `this.args.select('foo')` the `handleSelected` function
      will receive the `item` from the loop as its first argument and the
      string `'foo'` as its second argument.
  
    In the example above, we used `@action` to ensure that `handleSelected` is
    properly bound to the `items-list`, but let's explore what happens if we
    left out `@action`:
  
    ```app/components/items-list.js
    import Component from '@glimmer/component';
  
    export default class ItemsList extends Component {
      handleSelected(item) {
        // ...snip...
      }
    }
    ```
  
    In this example, when `handleSelected` is invoked inside the `display-item`
    component, it will **not** have access to the component instance. In other
    words, it will have no `this` context, so please make sure your functions
    are bound (via `@action` or other means) before passing into `fn`!
  
    See also [partial application](https://en.wikipedia.org/wiki/Partial_application).
  
    @method fn
    @for Ember.Templates.helpers
    @public
    @since 3.11.0
  */

  function fnHelper(_ref27) {
    var positional = _ref27.positional;
    var callbackRef = positional.at(0);

    if (false
    /* DEBUG */
    && typeof callbackRef[INVOKE] !== 'function') {
      var callback = callbackRef.value();
      (false && !(typeof callback === 'function') && (0, _debug.assert)("You must pass a function as the `fn` helpers first argument, you passed " + callback, typeof callback === 'function'));
    }

    return function () {
      var _positional$value = positional.value(),
          fn = _positional$value[0],
          args = _positional$value.slice(1);

      for (var _len2 = arguments.length, invocationArgs = new Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
        invocationArgs[_key3] = arguments[_key3];
      }

      if (typeof callbackRef[INVOKE] === 'function') {
        // references with the INVOKE symbol expect the function behind
        // the symbol to be bound to the reference
        return callbackRef[INVOKE].apply(callbackRef, args.concat(invocationArgs));
      } else {
        return fn['call'].apply(fn, [context].concat(args, invocationArgs));
      }
    };
  }

  function fn(_vm, args) {
    return new InternalHelperReference(fnHelper, args.capture());
  }
  /**
  @module ember
  */

  /**
    Dynamically look up a property on an object. The second argument to `{{get}}`
    should have a string value, although it can be bound.
  
    For example, these two usages are equivalent:
  
    ```handlebars
    {{person.height}}
    {{get person "height"}}
    ```
  
    If there were several facts about a person, the `{{get}}` helper can dynamically
    pick one:
  
    ```handlebars
    {{get person factName}}
    ```
  
    For a more complex example, this template would allow the user to switch
    between showing the user's height and weight with a click:
  
    ```handlebars
    {{get person factName}}
    <button {{action (fn (mut factName)) "height"}}>Show height</button>
    <button {{action (fn (mut factName)) "weight"}}>Show weight</button>
    ```
  
    The `{{get}}` helper can also respect mutable values itself. For example:
  
    ```handlebars
    {{input value=(mut (get person factName)) type="text"}}
    <button {{action (fn (mut factName)) "height"}}>Show height</button>
    <button {{action (fn (mut factName)) "weight"}}>Show weight</button>
    ```
  
    Would allow the user to swap what fact is being displayed, and also edit
    that fact via a two-way mutable binding.
  
    @public
    @method get
    @for Ember.Templates.helpers
    @since 2.1.0
   */


  function get$1(_vm, args) {
    return GetHelperReference.create(args.positional.at(0), args.positional.at(1));
  }

  function referenceFromPath(source, path) {
    var innerReference;

    if (path === undefined || path === null || path === '') {
      innerReference = _runtime2.NULL_REFERENCE;
    } else if (typeof path === 'string' && path.indexOf('.') > -1) {
      innerReference = referenceFromParts(source, path.split('.'));
    } else {
      innerReference = source.get(path);
    }

    return innerReference;
  }

  var GetHelperReference =
  /*#__PURE__*/
  function (_CachedReference$6) {
    (0, _emberBabel.inheritsLoose)(GetHelperReference, _CachedReference$6);

    GetHelperReference.create = function create(sourceReference, pathReference) {
      if ((0, _reference.isConst)(pathReference)) {
        var path = pathReference.value();
        return referenceFromPath(sourceReference, path);
      } else {
        return new GetHelperReference(sourceReference, pathReference);
      }
    };

    function GetHelperReference(sourceReference, pathReference) {
      var _this23;

      _this23 = _CachedReference$6.call(this) || this;
      _this23.sourceReference = sourceReference;
      _this23.pathReference = pathReference;
      _this23.lastPath = null;
      _this23.innerReference = _runtime2.NULL_REFERENCE;
      var innerTag = _this23.innerTag = (0, _reference.createUpdatableTag)();
      _this23.tag = (0, _reference.combine)([sourceReference.tag, pathReference.tag, innerTag]);
      return _this23;
    }

    var _proto55 = GetHelperReference.prototype;

    _proto55.compute = function compute() {
      var lastPath = this.lastPath,
          innerReference = this.innerReference,
          innerTag = this.innerTag;
      var path = this.pathReference.value();

      if (path !== lastPath) {
        innerReference = referenceFromPath(this.sourceReference, path);
        (0, _reference.update)(innerTag, innerReference.tag);
        this.innerReference = innerReference;
        this.lastPath = path;
      }

      return innerReference.value();
    };

    _proto55[UPDATE] = function (value$$1) {
      (0, _metal.set)(this.sourceReference.value(), this.pathReference.value(), value$$1);
    };

    return GetHelperReference;
  }(CachedReference$1);
  /**
  @module ember
  */

  /**
     Use the `{{hash}}` helper to create a hash to pass as an option to your
     components. This is specially useful for contextual components where you can
     just yield a hash:
  
     ```handlebars
     {{yield (hash
        name='Sarah'
        title=office
     )}}
     ```
  
     Would result in an object such as:
  
     ```js
     { name: 'Sarah', title: this.get('office') }
     ```
  
     Where the `title` is bound to updates of the `office` property.
  
     Note that the hash is an empty object with no prototype chain, therefore
     common methods like `toString` are not available in the resulting hash.
     If you need to use such a method, you can use the `call` or `apply`
     approach:
  
     ```js
     function toString(obj) {
       return Object.prototype.toString.apply(obj);
     }
     ```
  
     @method hash
     @for Ember.Templates.helpers
     @param {Object} options
     @return {Object} Hash
     @since 2.3.0
     @public
   */


  function hash(_vm, args) {
    return args.named.capture();
  }
  /**
  @module ember
  */


  var ConditionalHelperReference =
  /*#__PURE__*/
  function (_CachedReference$7) {
    (0, _emberBabel.inheritsLoose)(ConditionalHelperReference, _CachedReference$7);

    ConditionalHelperReference.create = function create(_condRef, truthyRef, falsyRef) {
      var condRef = ConditionalReference$1.create(_condRef);

      if ((0, _reference.isConst)(condRef)) {
        return condRef.value() ? truthyRef : falsyRef;
      } else {
        return new ConditionalHelperReference(condRef, truthyRef, falsyRef);
      }
    };

    function ConditionalHelperReference(cond, truthy, falsy) {
      var _this24;

      _this24 = _CachedReference$7.call(this) || this;
      _this24.branchTag = (0, _reference.createUpdatableTag)();
      _this24.tag = (0, _reference.combine)([cond.tag, _this24.branchTag]);
      _this24.cond = cond;
      _this24.truthy = truthy;
      _this24.falsy = falsy;
      return _this24;
    }

    var _proto56 = ConditionalHelperReference.prototype;

    _proto56.compute = function compute() {
      var branch = this.cond.value() ? this.truthy : this.falsy;
      (0, _reference.update)(this.branchTag, branch.tag);
      return branch.value();
    };

    return ConditionalHelperReference;
  }(CachedReference$1);
  /**
    The `if` helper allows you to conditionally render one of two branches,
    depending on the "truthiness" of a property.
    For example the following values are all falsey: `false`, `undefined`, `null`, `""`, `0`, `NaN` or an empty array.
  
    This helper has two forms, block and inline.
  
    ## Block form
  
    You can use the block form of `if` to conditionally render a section of the template.
  
    To use it, pass the conditional value to the `if` helper,
    using the block form to wrap the section of template you want to conditionally render.
    Like so:
  
    ```handlebars
    {{! will not render if foo is falsey}}
    {{#if foo}}
      Welcome to the {{foo.bar}}
    {{/if}}
    ```
  
    You can also specify a template to show if the property is falsey by using
    the `else` helper.
  
    ```handlebars
    {{! is it raining outside?}}
    {{#if isRaining}}
      Yes, grab an umbrella!
    {{else}}
      No, it's lovely outside!
    {{/if}}
    ```
  
    You are also able to combine `else` and `if` helpers to create more complex
    conditional logic.
  
    ```handlebars
    {{#if isMorning}}
      Good morning
    {{else if isAfternoon}}
      Good afternoon
    {{else}}
      Good night
    {{/if}}
    ```
  
    ## Inline form
  
    The inline `if` helper conditionally renders a single property or string.
  
    In this form, the `if` helper receives three arguments, the conditional value,
    the value to render when truthy, and the value to render when falsey.
  
    For example, if `useLongGreeting` is truthy, the following:
  
    ```handlebars
    {{if useLongGreeting "Hello" "Hi"}} Alex
    ```
  
    Will render:
  
    ```html
    Hello Alex
    ```
  
    ### Nested `if`
  
    You can use the `if` helper inside another helper as a nested helper:
  
    ```handlebars
    <SomeComponent @height={{if isBig "100" "10"}} />
    ```
  
    or
  
    ```handlebars
    {{some-component height=(if isBig "100" "10")}}
    ```
  
    One detail to keep in mind is that both branches of the `if` helper will be evaluated,
    so if you have `{{if condition "foo" (expensive-operation "bar")`,
    `expensive-operation` will always calculate.
  
    @method if
    @for Ember.Templates.helpers
    @public
  */


  function inlineIf(_vm, _ref28) {
    var positional = _ref28.positional;
    (false && !(positional.length === 3 || positional.length === 2) && (0, _debug.assert)('The inline form of the `if` helper expects two or three arguments, e.g. ' + '`{{if trialExpired "Expired" expiryDate}}`.', positional.length === 3 || positional.length === 2));
    return ConditionalHelperReference.create(positional.at(0), positional.at(1), positional.at(2));
  }
  /**
    The `unless` helper is the inverse of the `if` helper. It displays if a value
    is falsey ("not true" or "is false"). Example values that will display with
    `unless`: `false`, `undefined`, `null`, `""`, `0`, `NaN` or an empty array.
  
    ## Inline form
  
    The inline `unless` helper conditionally renders a single property or string.
    This helper acts like a ternary operator. If the first property is falsy,
    the second argument will be displayed, otherwise, the third argument will be
    displayed
  
    For example, if `useLongGreeting` is false below:
  
    ```handlebars
    {{unless useLongGreeting "Hi" "Hello"}} Ben
    ```
  
    Then it will display:
  
    ```html
    Hi
    ```
  
    You can use the `unless` helper inside another helper as a subexpression.
    If isBig is not true, it will set the height to 10:
  
    ```handlebars
    {{! If isBig is not true, it will set the height to 10.}}
    <SomeComponent @height={{unless isBig "10" "100"}} />
    ```
  
    or
  
    ```handlebars
    {{some-component height=(unless isBig "10" "100")}}
    ```
  
    ## Block form
  
    Like the `if` helper, `unless` helper also has a block form.
  
    ```handlebars
    {{! If greetings are found, the text below will not render.}}
    {{#unless greetings}}
      No greetings were found. Why not set one?
    {{/unless}}
    ```
  
    You can also use an `else` helper with the `unless` block. The
    `else` will display if the value is truthy.
  
    ```handlebars
    {{! Is the user logged in?}}
    {{#unless userData}}
      Please login.
    {{else}}
      Welcome back!
    {{/unless}}
    ```
  
    If `userData` is false, undefined, null, or empty in the above example,
    then it will render:
  
    ```html
    Please login.
    ```
  
    @method unless
    @for Ember.Templates.helpers
    @public
  */


  function inlineUnless(_vm, _ref29) {
    var positional = _ref29.positional;
    (false && !(positional.length === 3 || positional.length === 2) && (0, _debug.assert)('The inline form of the `unless` helper expects two or three arguments, e.g. ' + '`{{unless isFirstLogin "Welcome back!"}}`.', positional.length === 3 || positional.length === 2));
    return ConditionalHelperReference.create(positional.at(0), positional.at(2), positional.at(1));
  }
  /**
  @module ember
  */

  /**
    `log` allows you to output the value of variables in the current rendering
    context. `log` also accepts primitive types such as strings or numbers.
  
    ```handlebars
    {{log "myVariable:" myVariable }}
    ```
  
    @method log
    @for Ember.Templates.helpers
    @param {Array} params
    @public
  */


  function log(_ref30) {
    var _console;

    var positional = _ref30.positional;

    /* eslint-disable no-console */
    (_console = console).log.apply(_console, positional.value());
    /* eslint-enable no-console */

  }

  function log$1(_vm, args) {
    return new InternalHelperReference(log, args.capture());
  }
  /**
  @module ember
  */

  /**
    The `mut` helper lets you __clearly specify__ that a child `Component` can update the
    (mutable) value passed to it, which will __change the value of the parent component__.
  
    To specify that a parameter is mutable, when invoking the child `Component`:
  
    ```handlebars
    <MyChild @childClickCount={{fn (mut totalClicks)}} />
    ```
  
     or
  
    ```handlebars
    {{my-child childClickCount=(mut totalClicks)}}
    ```
  
    The child `Component` can then modify the parent's value just by modifying its own
    property:
  
    ```javascript
    // my-child.js
    export default Component.extend({
      click() {
        this.incrementProperty('childClickCount');
      }
    });
    ```
  
    Note that for curly components (`{{my-component}}`) the bindings are already mutable,
    making the `mut` unnecessary.
  
    Additionally, the `mut` helper can be combined with the `fn` helper to
    mutate a value. For example:
  
    ```handlebars
    <MyChild @childClickCount={{this.totalClicks}} @click-count-change={{fn (mut totalClicks))}} />
    ```
  
    or
  
    ```handlebars
    {{my-child childClickCount=totalClicks click-count-change=(fn (mut totalClicks))}}
    ```
  
    The child `Component` would invoke the function with the new click value:
  
    ```javascript
    // my-child.js
    export default Component.extend({
      click() {
        this.get('click-count-change')(this.get('childClickCount') + 1);
      }
    });
    ```
  
    The `mut` helper changes the `totalClicks` value to what was provided as the `fn` argument.
  
    The `mut` helper, when used with `fn`, will return a function that
    sets the value passed to `mut` to its first argument. As an example, we can create a
    button that increments a value passing the value directly to the `fn`:
  
    ```handlebars
    {{! inc helper is not provided by Ember }}
    <button onclick={{fn (mut count) (inc count)}}>
      Increment count
    </button>
    ```
  
    You can also use the `value` option:
  
    ```handlebars
    <input value={{name}} oninput={{fn (mut name) value="target.value"}}>
    ```
  
    @method mut
    @param {Object} [attr] the "two-way" attribute that can be modified.
    @for Ember.Templates.helpers
    @public
  */


  var MUT_REFERENCE = (0, _utils.symbol)('MUT');
  var SOURCE = (0, _utils.symbol)('SOURCE');

  function isMut(ref) {
    return ref && ref[MUT_REFERENCE];
  }

  function unMut(ref) {
    return ref[SOURCE] || ref;
  }

  function mut(_vm, args) {
    var rawRef = args.positional.at(0);

    if (isMut(rawRef)) {
      return rawRef;
    } // TODO: Improve this error message. This covers at least two distinct
    // cases:
    //
    // 1. (mut "not a path") – passing a literal, result from a helper
    //    invocation, etc
    //
    // 2. (mut receivedValue) – passing a value received from the caller
    //    that was originally derived from a literal, result from a helper
    //    invocation, etc
    //
    // This message is alright for the first case, but could be quite
    // confusing for the second case.


    (false && !(rawRef[UPDATE]) && (0, _debug.assert)('You can only pass a path to mut', rawRef[UPDATE]));
    var wrappedRef = Object.create(rawRef);
    wrappedRef[SOURCE] = rawRef;
    wrappedRef[INVOKE] = rawRef[UPDATE];
    wrappedRef[MUT_REFERENCE] = true;
    return wrappedRef;
  }
  /**
  @module ember
  */

  /**
    This is a helper to be used in conjunction with the link-to helper.
    It will supply url query parameters to the target route.
  
    @example In this example we are setting the `direction` query param to the value `"asc"`
  
    ```app/templates/application.hbs
    <LinkTo
      @route="posts"
      {{query-params direction="asc"}}
    >
      Sort
    </LinkTo>
    ```
  
    @method query-params
    @for Ember.Templates.helpers
    @param {Object} hash takes a hash of query parameters
    @return {Object} A `QueryParams` object for `{{link-to}}`
    @public
  */


  function queryParams(_ref31) {
    var positional = _ref31.positional,
        named = _ref31.named;
    // tslint:disable-next-line:max-line-length
    (false && !(positional.value().length === 0) && (0, _debug.assert)("The `query-params` helper only accepts hash parameters, e.g. (query-params queryParamPropertyName='foo') as opposed to just (query-params 'foo')", positional.value().length === 0));
    return new _routing.QueryParams((0, _polyfills.assign)({}, named.value()));
  }

  function queryParams$1(_vm, args) {
    return new InternalHelperReference(queryParams, args.capture());
  }
  /**
    The `readonly` helper let's you specify that a binding is one-way only,
    instead of two-way.
    When you pass a `readonly` binding from an outer context (e.g. parent component),
    to to an inner context (e.g. child component), you are saying that changing that
    property in the inner context does not change the value in the outer context.
  
    To specify that a binding is read-only, when invoking the child `Component`:
  
    ```app/components/my-parent.js
    export default Component.extend({
      totalClicks: 3
    });
    ```
  
    ```app/templates/components/my-parent.hbs
    {{log totalClicks}} // -> 3
    <MyChild @childClickCount={{readonly totalClicks}} />
    ```
    ```
    {{my-child childClickCount=(readonly totalClicks)}}
    ```
  
    Now, when you update `childClickCount`:
  
    ```app/components/my-child.js
    export default Component.extend({
      click() {
        this.incrementProperty('childClickCount');
      }
    });
    ```
  
    The value updates in the child component, but not the parent component:
  
    ```app/templates/components/my-child.hbs
    {{log childClickCount}} //-> 4
    ```
  
    ```app/templates/components/my-parent.hbs
    {{log totalClicks}} //-> 3
    <MyChild @childClickCount={{readonly totalClicks}} />
    ```
    or
    ```app/templates/components/my-parent.hbs
    {{log totalClicks}} //-> 3
    {{my-child childClickCount=(readonly totalClicks)}}
    ```
  
    ### Objects and Arrays
  
    When passing a property that is a complex object (e.g. object, array) instead of a primitive object (e.g. number, string),
    only the reference to the object is protected using the readonly helper.
    This means that you can change properties of the object both on the parent component, as well as the child component.
    The `readonly` binding behaves similar to the `const` keyword in JavaScript.
  
    Let's look at an example:
  
    First let's set up the parent component:
  
    ```app/components/my-parent.js
    import Component from '@ember/component';
  
    export default Component.extend({
      clicks: null,
  
      init() {
        this._super(...arguments);
        this.set('clicks', { total: 3 });
      }
    });
    ```
  
    ```app/templates/components/my-parent.hbs
    {{log clicks.total}} //-> 3
    <MyChild @childClicks={{readonly clicks}} />
    ```
    ```app/templates/components/my-parent.hbs
    {{log clicks.total}} //-> 3
    {{my-child childClicks=(readonly clicks)}}
    ```
  
    Now, if you update the `total` property of `childClicks`:
  
    ```app/components/my-child.js
    import Component from '@ember/component';
  
    export default Component.extend({
      click() {
        this.get('clicks').incrementProperty('total');
      }
    });
    ```
  
    You will see the following happen:
  
    ```app/templates/components/my-parent.hbs
    {{log clicks.total}} //-> 4
    <MyChild @childClicks={{readonly clicks}} />
    ```
    or
    ```app/templates/components/my-parent.hbs
    {{log clicks.total}} //-> 4
    {{my-child childClicks=(readonly clicks)}}
    ```
  
    ```app/templates/components/my-child.hbs
    {{log childClicks.total}} //-> 4
    ```
  
    @method readonly
    @param {Object} [attr] the read-only attribute.
    @for Ember.Templates.helpers
    @private
  */


  function readonly(_vm, args) {
    var ref = unMut(args.positional.at(0));
    return new ReadonlyReference(ref);
  }
  /**
  @module ember
  */

  /**
    The `{{unbound}}` helper disconnects the one-way binding of a property,
    essentially freezing its value at the moment of rendering. For example,
    in this example the display of the variable `name` will not change even
    if it is set with a new value:
  
    ```handlebars
    {{unbound name}}
    ```
  
    Like any helper, the `unbound` helper can accept a nested helper expression.
    This allows for custom helpers to be rendered unbound:
  
    ```handlebars
    {{unbound (some-custom-helper)}}
    {{unbound (capitalize name)}}
    {{! You can use any helper, including unbound, in a nested expression }}
    {{capitalize (unbound name)}}
    ```
  
    The `unbound` helper only accepts a single argument, and it return an
    unbound value.
  
    @method unbound
    @for Ember.Templates.helpers
    @public
  */


  function unbound(_vm, args) {
    (false && !(args.positional.length === 1 && args.named.length === 0) && (0, _debug.assert)('unbound helper cannot be called with multiple params or hash params', args.positional.length === 1 && args.named.length === 0));
    return UnboundReference.create(args.positional.at(0).value());
  }

  var MODIFIERS = ['alt', 'shift', 'meta', 'ctrl'];
  var POINTER_EVENT_TYPE_REGEX = /^click|mouse|touch/;

  function isAllowedEvent(event, allowedKeys) {
    if (allowedKeys === null || allowedKeys === undefined) {
      if (POINTER_EVENT_TYPE_REGEX.test(event.type)) {
        return (0, _views.isSimpleClick)(event);
      } else {
        allowedKeys = '';
      }
    }

    if (allowedKeys.indexOf('any') >= 0) {
      return true;
    }

    for (var i = 0; i < MODIFIERS.length; i++) {
      if (event[MODIFIERS[i] + 'Key'] && allowedKeys.indexOf(MODIFIERS[i]) === -1) {
        return false;
      }
    }

    return true;
  }

  var ActionHelper = {
    // registeredActions is re-exported for compatibility with older plugins
    // that were using this undocumented API.
    registeredActions: _views.ActionManager.registeredActions,
    registerAction: function registerAction(actionState) {
      var actionId = actionState.actionId;
      _views.ActionManager.registeredActions[actionId] = actionState;
      return actionId;
    },
    unregisterAction: function unregisterAction(actionState) {
      var actionId = actionState.actionId;
      delete _views.ActionManager.registeredActions[actionId];
    }
  };

  var ActionState =
  /*#__PURE__*/
  function () {
    function ActionState(element, actionId, actionName, actionArgs, namedArgs, positionalArgs, implicitTarget, dom, tag) {
      this.element = element;
      this.actionId = actionId;
      this.actionName = actionName;
      this.actionArgs = actionArgs;
      this.namedArgs = namedArgs;
      this.positional = positionalArgs;
      this.implicitTarget = implicitTarget;
      this.dom = dom;
      this.eventName = this.getEventName();
      this.tag = tag;
    }

    var _proto57 = ActionState.prototype;

    _proto57.getEventName = function getEventName() {
      return this.namedArgs.get('on').value() || 'click';
    };

    _proto57.getActionArgs = function getActionArgs() {
      var result = new Array(this.actionArgs.length);

      for (var i = 0; i < this.actionArgs.length; i++) {
        result[i] = this.actionArgs[i].value();
      }

      return result;
    };

    _proto57.getTarget = function getTarget() {
      var implicitTarget = this.implicitTarget,
          namedArgs = this.namedArgs;
      var target;

      if (namedArgs.has('target')) {
        target = namedArgs.get('target').value();
      } else {
        target = implicitTarget.value();
      }

      return target;
    };

    _proto57.handler = function handler(event) {
      var _this25 = this;

      var actionName = this.actionName,
          namedArgs = this.namedArgs;
      var bubbles = namedArgs.get('bubbles');
      var preventDefault = namedArgs.get('preventDefault');
      var allowedKeys = namedArgs.get('allowedKeys');
      var target = this.getTarget();
      var shouldBubble = bubbles.value() !== false;

      if (!isAllowedEvent(event, allowedKeys.value())) {
        return true;
      }

      if (preventDefault.value() !== false) {
        event.preventDefault();
      }

      if (!shouldBubble) {
        event.stopPropagation();
      }

      (0, _runloop.join)(function () {
        var args = _this25.getActionArgs();

        var payload = {
          args: args,
          target: target,
          name: null
        };

        if (typeof actionName[INVOKE] === 'function') {
          (0, _instrumentation.flaggedInstrument)('interaction.ember-action', payload, function () {
            actionName[INVOKE].apply(actionName, args);
          });
          return;
        }

        if (typeof actionName === 'function') {
          (0, _instrumentation.flaggedInstrument)('interaction.ember-action', payload, function () {
            actionName.apply(target, args);
          });
          return;
        }

        payload.name = actionName;

        if (target.send) {
          (0, _instrumentation.flaggedInstrument)('interaction.ember-action', payload, function () {
            target.send.apply(target, [actionName].concat(args));
          });
        } else {
          (false && !(typeof target[actionName] === 'function') && (0, _debug.assert)("The action '" + actionName + "' did not exist on " + target, typeof target[actionName] === 'function'));
          (0, _instrumentation.flaggedInstrument)('interaction.ember-action', payload, function () {
            target[actionName].apply(target, args);
          });
        }
      });
      return shouldBubble;
    };

    _proto57.destroy = function destroy() {
      ActionHelper.unregisterAction(this);
    };

    return ActionState;
  }(); // implements ModifierManager<Action>


  var ActionModifierManager =
  /*#__PURE__*/
  function () {
    function ActionModifierManager() {}

    var _proto58 = ActionModifierManager.prototype;

    _proto58.create = function create(element, _state, args, _dynamicScope, dom) {
      var _args$capture = args.capture(),
          named = _args$capture.named,
          positional = _args$capture.positional,
          tag = _args$capture.tag;

      var implicitTarget;
      var actionName;
      var actionNameRef;

      if (positional.length > 1) {
        implicitTarget = positional.at(0);
        actionNameRef = positional.at(1);

        if (actionNameRef[INVOKE]) {
          actionName = actionNameRef;
        } else {
          var actionLabel = actionNameRef.propertyKey;
          actionName = actionNameRef.value();
          (false && !(typeof actionName === 'string' || typeof actionName === 'function') && (0, _debug.assert)('You specified a quoteless path, `' + actionLabel + '`, to the ' + '{{action}} helper which did not resolve to an action name (a ' + 'string). Perhaps you meant to use a quoted actionName? (e.g. ' + '{{action "' + actionLabel + '"}}).', typeof actionName === 'string' || typeof actionName === 'function'));
        }
      }

      var actionArgs = []; // The first two arguments are (1) `this` and (2) the action name.
      // Everything else is a param.

      for (var i = 2; i < positional.length; i++) {
        actionArgs.push(positional.at(i));
      }

      var actionId = (0, _utils.uuid)();
      var actionState = new ActionState(element, actionId, actionName, actionArgs, named, positional, implicitTarget, dom, tag);
      (false && !(actionState.eventName !== 'mouseEnter' && actionState.eventName !== 'mouseLeave' && actionState.eventName !== 'mouseMove') && (0, _debug.deprecate)("Using the `{{action}}` modifier with `" + actionState.eventName + "` events has been deprecated.", actionState.eventName !== 'mouseEnter' && actionState.eventName !== 'mouseLeave' && actionState.eventName !== 'mouseMove', {
        id: 'ember-views.event-dispatcher.mouseenter-leave-move',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_action-mouseenter-leave-move'
      }));
      return actionState;
    };

    _proto58.install = function install(actionState) {
      var dom = actionState.dom,
          element = actionState.element,
          actionId = actionState.actionId;
      ActionHelper.registerAction(actionState);
      dom.setAttribute(element, 'data-ember-action', '');
      dom.setAttribute(element, "data-ember-action-" + actionId, actionId);
    };

    _proto58.update = function update(actionState) {
      var positional = actionState.positional;
      var actionNameRef = positional.at(1);

      if (!actionNameRef[INVOKE]) {
        actionState.actionName = actionNameRef.value();
      }

      actionState.eventName = actionState.getEventName();
    };

    _proto58.getTag = function getTag(actionState) {
      return actionState.tag;
    };

    _proto58.getDestructor = function getDestructor(modifier) {
      return modifier;
    };

    return ActionModifierManager;
  }();

  function capabilities$1(managerAPI, optionalFeatures) {
    if (optionalFeatures === void 0) {
      optionalFeatures = {};
    }

    if (managerAPI !== '3.13') {
      managerAPI = '3.13';
      (false && !(false) && (0, _debug.deprecate)('Modifier manager capabilities now require you to pass a valid version when being generated. Valid versions include: 3.13', false, {
        until: '3.17.0',
        id: 'implicit-modifier-manager-capabilities'
      }));
    }

    (false && !(managerAPI === '3.13') && (0, _debug.assert)('Invalid modifier manager compatibility specified', managerAPI === '3.13'));
    return {
      disableAutoTracking: Boolean(optionalFeatures.disableAutoTracking)
    };
  }

  var CustomModifierDefinition = function CustomModifierDefinition(name, ModifierClass, delegate, isInteractive) {
    this.name = name;
    this.ModifierClass = ModifierClass;
    this.delegate = delegate;
    this.state = {
      ModifierClass: ModifierClass,
      name: name,
      delegate: delegate
    };
    this.manager = isInteractive ? CUSTOM_INTERACTIVE_MODIFIER_MANAGER : CUSTOM_NON_INTERACTIVE_MODIFIER_MANAGER;
  };

  var CustomModifierState =
  /*#__PURE__*/
  function () {
    function CustomModifierState(element, delegate, modifier, args) {
      this.element = element;
      this.delegate = delegate;
      this.modifier = modifier;
      this.args = args;
      this.tag = (0, _reference.createUpdatableTag)();
    }

    var _proto59 = CustomModifierState.prototype;

    _proto59.destroy = function destroy() {
      var delegate = this.delegate,
          modifier = this.modifier,
          args = this.args;
      delegate.destroyModifier(modifier, args.value());
    };

    return CustomModifierState;
  }();
  /**
    The CustomModifierManager allows addons to provide custom modifier
    implementations that integrate seamlessly into Ember. This is accomplished
    through a delegate, registered with the custom modifier manager, which
    implements a set of hooks that determine modifier behavior.
    To create a custom modifier manager, instantiate a new CustomModifierManager
    class and pass the delegate as the first argument:
  
    ```js
    let manager = new CustomModifierManager({
      // ...delegate implementation...
    });
    ```
  
    ## Delegate Hooks
  
    Throughout the lifecycle of a modifier, the modifier manager will invoke
    delegate hooks that are responsible for surfacing those lifecycle changes to
    the end developer.
    * `createModifier()` - invoked when a new instance of a modifier should be created
    * `installModifier()` - invoked when the modifier is installed on the element
    * `updateModifier()` - invoked when the arguments passed to a modifier change
    * `destroyModifier()` - invoked when the modifier is about to be destroyed
  */


  var InteractiveCustomModifierManager =
  /*#__PURE__*/
  function () {
    function InteractiveCustomModifierManager() {}

    var _proto60 = InteractiveCustomModifierManager.prototype;

    _proto60.create = function create(element, definition, args) {
      var delegate = definition.delegate,
          ModifierClass = definition.ModifierClass;
      var capturedArgs = args.capture();
      var instance = definition.delegate.createModifier(ModifierClass, capturedArgs.value());

      if (delegate.capabilities === undefined) {
        delegate.capabilities = capabilities$1('3.13');
        (false && !(false) && (0, _debug.deprecate)('Custom modifier managers must define their capabilities using the capabilities() helper function', false, {
          until: '3.17.0',
          id: 'implicit-modifier-manager-capabilities'
        }));
      }

      return new CustomModifierState(element, delegate, instance, capturedArgs);
    };

    _proto60.getTag = function getTag(_ref32) {
      var args = _ref32.args,
          tag = _ref32.tag;
      return (0, _reference.combine)([tag, args.tag]);
    };

    _proto60.install = function install(state) {
      var element = state.element,
          args = state.args,
          delegate = state.delegate,
          modifier = state.modifier,
          tag = state.tag;
      var capabilities = delegate.capabilities;

      if (capabilities.disableAutoTracking === true) {
        (0, _metal.untrack)(function () {
          return delegate.installModifier(modifier, element, args.value());
        });
      } else {
        var combinedTrackingTag = (0, _metal.track)(function () {
          return delegate.installModifier(modifier, element, args.value());
        });
        (0, _reference.update)(tag, combinedTrackingTag);
      }
    };

    _proto60.update = function update(state) {
      var args = state.args,
          delegate = state.delegate,
          modifier = state.modifier,
          tag = state.tag;
      var capabilities = delegate.capabilities;

      if (capabilities.disableAutoTracking === true) {
        (0, _metal.untrack)(function () {
          return delegate.updateModifier(modifier, args.value());
        });
      } else {
        var combinedTrackingTag = (0, _metal.track)(function () {
          return delegate.updateModifier(modifier, args.value());
        });
        (0, _reference.update)(tag, combinedTrackingTag);
      }
    };

    _proto60.getDestructor = function getDestructor(state) {
      return state;
    };

    return InteractiveCustomModifierManager;
  }();

  var NonInteractiveCustomModifierManager =
  /*#__PURE__*/
  function () {
    function NonInteractiveCustomModifierManager() {}

    var _proto61 = NonInteractiveCustomModifierManager.prototype;

    _proto61.create = function create() {
      return null;
    };

    _proto61.getTag = function getTag() {
      return _reference.CONSTANT_TAG;
    };

    _proto61.install = function install() {};

    _proto61.update = function update() {};

    _proto61.getDestructor = function getDestructor() {
      return null;
    };

    return NonInteractiveCustomModifierManager;
  }();

  var CUSTOM_INTERACTIVE_MODIFIER_MANAGER = new InteractiveCustomModifierManager();
  var CUSTOM_NON_INTERACTIVE_MODIFIER_MANAGER = new NonInteractiveCustomModifierManager();
  var untouchableContext = buildUntouchableThis('`on` modifier');
  /**
  @module ember
  */

  /*
    Internet Explorer 11 does not support `once` and also does not support
    passing `eventOptions`. In some situations it then throws a weird script
    error, like:
  
    ```
    Could not complete the operation due to error 80020101
    ```
  
    This flag determines, whether `{ once: true }` and thus also event options in
    general are supported.
  */

  var SUPPORTS_EVENT_OPTIONS = function () {
    try {
      var div = document.createElement('div');
      var counter = 0;
      div.addEventListener('click', function () {
        return counter++;
      }, {
        once: true
      });
      var event;

      if (typeof Event === 'function') {
        event = new Event('click');
      } else {
        event = document.createEvent('Event');
        event.initEvent('click', true, true);
      }

      div.dispatchEvent(event);
      div.dispatchEvent(event);
      return counter === 1;
    } catch (error) {
      return false;
    }
  }();

  var OnModifierState =
  /*#__PURE__*/
  function () {
    function OnModifierState(element, args) {
      this.shouldUpdate = true;
      this.element = element;
      this.args = args;
      this.tag = args.tag;
    }

    var _proto62 = OnModifierState.prototype;

    _proto62.updateFromArgs = function updateFromArgs() {
      var args = this.args;

      var _args$named$value = args.named.value(),
          once = _args$named$value.once,
          passive = _args$named$value.passive,
          capture = _args$named$value.capture;

      if (once !== this.once) {
        this.once = once;
        this.shouldUpdate = true;
      }

      if (passive !== this.passive) {
        this.passive = passive;
        this.shouldUpdate = true;
      }

      if (capture !== this.capture) {
        this.capture = capture;
        this.shouldUpdate = true;
      }

      var options;

      if (once || passive || capture) {
        options = this.options = {
          once: once,
          passive: passive,
          capture: capture
        };
      } else {
        this.options = undefined;
      }

      (false && !(args.positional.at(0) !== undefined && typeof args.positional.at(0).value() === 'string') && (0, _debug.assert)('You must pass a valid DOM event name as the first argument to the `on` modifier', args.positional.at(0) !== undefined && typeof args.positional.at(0).value() === 'string'));
      var eventName = args.positional.at(0).value();

      if (eventName !== this.eventName) {
        this.eventName = eventName;
        this.shouldUpdate = true;
      }

      (false && !(args.positional.at(1) !== undefined && typeof args.positional.at(1).value() === 'function') && (0, _debug.assert)('You must pass a function as the second argument to the `on` modifier', args.positional.at(1) !== undefined && typeof args.positional.at(1).value() === 'function'));
      var userProvidedCallback = args.positional.at(1).value();

      if (userProvidedCallback !== this.userProvidedCallback) {
        this.userProvidedCallback = userProvidedCallback;
        this.shouldUpdate = true;
      }

      (false && !(args.positional.length === 2) && (0, _debug.assert)("You can only pass two positional arguments (event name and callback) to the `on` modifier, but you provided " + args.positional.length + ". Consider using the `fn` helper to provide additional arguments to the `on` callback.", args.positional.length === 2));
      var needsCustomCallback = SUPPORTS_EVENT_OPTIONS === false && once ||
      /* needs manual once implementation */
      false
      /* DEBUG */
      && passive
      /* needs passive enforcement */
      ;

      if (this.shouldUpdate) {
        if (needsCustomCallback) {
          var callback = this.callback = function (event) {
            if (false
            /* DEBUG */
            && passive) {
              event.preventDefault = function () {
                (false && !(false) && (0, _debug.assert)("You marked this listener as 'passive', meaning that you must not call 'event.preventDefault()': \n\n" + userProvidedCallback));
              };
            }

            if (!SUPPORTS_EVENT_OPTIONS && once) {
              removeEventListener(this, eventName, callback, options);
            }

            return userProvidedCallback.call(untouchableContext, event);
          };
        } else if (false
        /* DEBUG */
        ) {
          // prevent the callback from being bound to the element
          this.callback = userProvidedCallback.bind(untouchableContext);
        } else {
          this.callback = userProvidedCallback;
        }
      }
    };

    _proto62.destroy = function destroy() {
      var element = this.element,
          eventName = this.eventName,
          callback = this.callback,
          options = this.options;
      removeEventListener(element, eventName, callback, options);
    };

    return OnModifierState;
  }();

  var adds = 0;
  var removes = 0;

  function removeEventListener(element, eventName, callback, options) {
    removes++;

    if (SUPPORTS_EVENT_OPTIONS) {
      // when options are supported, use them across the board
      element.removeEventListener(eventName, callback, options);
    } else if (options !== undefined && options.capture) {
      // used only in the following case:
      //
      // `{ once: true | false, passive: true | false, capture: true }
      //
      // `once` is handled via a custom callback that removes after first
      // invocation so we only care about capture here as a boolean
      element.removeEventListener(eventName, callback, true);
    } else {
      // used only in the following cases:
      //
      // * where there is no options
      // * `{ once: true | false, passive: true | false, capture: false }
      element.removeEventListener(eventName, callback);
    }
  }

  function addEventListener(element, eventName, callback, options) {
    adds++;

    if (SUPPORTS_EVENT_OPTIONS) {
      // when options are supported, use them across the board
      element.addEventListener(eventName, callback, options);
    } else if (options !== undefined && options.capture) {
      // used only in the following case:
      //
      // `{ once: true | false, passive: true | false, capture: true }
      //
      // `once` is handled via a custom callback that removes after first
      // invocation so we only care about capture here as a boolean
      element.addEventListener(eventName, callback, true);
    } else {
      // used only in the following cases:
      //
      // * where there is no options
      // * `{ once: true | false, passive: true | false, capture: false }
      element.addEventListener(eventName, callback);
    }
  }
  /**
    The `{{on}}` modifier lets you easily add event listeners (it uses
    [EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
    internally).
  
    For example, if you'd like to run a function on your component when a `<button>`
    in the components template is clicked you might do something like:
  
    ```app/templates/components/like-post.hbs
    <button {{on 'click' this.saveLike}}>Like this post!</button>
    ```
  
    ```app/components/like-post.js
    import Component from '@glimmer/component';
    import { action } from '@ember/object';
  
    export default class LikePostComponent extends Component {
      @action
      saveLike() {
        // someone likes your post!
        // better send a request off to your server...
      }
    }
    ```
  
    ### Arguments
  
    `{{on}}` accepts two positional arguments, and a few named arguments.
  
    The positional arguments are:
  
    - `event` -- the name to use when calling `addEventListener`
    - `callback` -- the function to be passed to `addEventListener`
  
    The named arguments are:
  
    - capture -- a `true` value indicates that events of this type will be dispatched
      to the registered listener before being dispatched to any EventTarget beneath it
      in the DOM tree.
    - once -- indicates that the listener should be invoked at most once after being
      added. If true, the listener would be automatically removed when invoked.
    - passive -- if `true`, indicates that the function specified by listener will never
      call preventDefault(). If a passive listener does call preventDefault(), the user
      agent will do nothing other than generate a console warning. See
      [Improving scrolling performance with passive listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners)
      to learn more.
  
    The callback function passed to `{{on}}` will receive any arguments that are passed
    to the event handler. Most commonly this would be the `event` itself.
  
    If you would like to pass additional arguments to the function you should use
    the `{{fn}}` helper.
  
    For example, in our example case above if you'd like to pass in the post that
    was being liked when the button is clicked you could do something like:
  
    ```app/templates/components/like-post.js
    <button {{on 'click' (fn this.saveLike @post)}}>Like this post!</button>
    ```
  
    In this case, the `saveLike` function will receive two arguments: the click event
    and the value of `@post`.
  
    ### Function Context
  
    In the example above, we used `@action` to ensure that `likePost` is
    properly bound to the `items-list`, but let's explore what happens if we
    left out `@action`:
  
    ```app/components/like-post.js
    import Component from '@glimmer/component';
  
    export default class LikePostComponent extends Component {
      saveLike() {
        // ...snip...
      }
    }
    ```
  
    In this example, when the button is clicked `saveLike` will be invoked,
    it will **not** have access to the component instance. In other
    words, it will have no `this` context, so please make sure your functions
    are bound (via `@action` or other means) before passing into `on`!
  
    @method on
    @for Ember.Templates.helpers
    @public
    @since 3.11.0
  */


  var OnModifierManager =
  /*#__PURE__*/
  function () {
    function OnModifierManager(isInteractive) {
      this.SUPPORTS_EVENT_OPTIONS = SUPPORTS_EVENT_OPTIONS;
      this.isInteractive = isInteractive;
    }

    var _proto63 = OnModifierManager.prototype;

    _proto63.create = function create(element, _state, args) {
      if (!this.isInteractive) {
        return null;
      }

      var capturedArgs = args.capture();
      return new OnModifierState(element, capturedArgs);
    };

    _proto63.getTag = function getTag(state) {
      if (state === null) {
        return _reference.CONSTANT_TAG;
      }

      return state.tag;
    };

    _proto63.install = function install(state) {
      if (state === null) {
        return;
      }

      state.updateFromArgs();
      var element = state.element,
          eventName = state.eventName,
          callback = state.callback,
          options = state.options;
      addEventListener(element, eventName, callback, options);
      state.shouldUpdate = false;
    };

    _proto63.update = function update(state) {
      if (state === null) {
        return;
      } // stash prior state for el.removeEventListener


      var element = state.element,
          eventName = state.eventName,
          callback = state.callback,
          options = state.options;
      state.updateFromArgs();

      if (!state.shouldUpdate) {
        return;
      } // use prior state values for removal


      removeEventListener(element, eventName, callback, options); // read updated values from the state object

      addEventListener(state.element, state.eventName, state.callback, state.options);
      state.shouldUpdate = false;
    };

    _proto63.getDestructor = function getDestructor(state) {
      return state;
    };

    (0, _emberBabel.createClass)(OnModifierManager, [{
      key: "counters",
      get: function get() {
        return {
          adds: adds,
          removes: removes
        };
      }
    }]);
    return OnModifierManager;
  }();
  /**
  @module ember
  */

  /**
      The `let` helper receives one or more positional arguments and yields
      them out as block params.
  
      This allows the developer to introduce shorter names for certain computations
      in the template.
  
      This is especially useful if you are passing properties to a component
      that receives a lot of options and you want to clean up the invocation.
  
      For the following example, the template receives a `post` object with
      `content` and `title` properties.
  
      We are going to call the `my-post` component, passing a title which is
      the title of the post suffixed with the name of the blog, the content
      of the post, and a series of options defined in-place.
  
      ```handlebars
      {{#let
          (concat post.title ' | The Ember.js Blog')
          post.content
          (hash
            theme="high-contrast"
            enableComments=true
          )
          as |title content options|
      }}
        <MyPost @title={{title}} @content={{content}} @options={{options}} />
      {{/let}}
    ```
   or
    ```handlebars
      {{#let
          (concat post.title ' | The Ember.js Blog')
          post.content
          (hash
            theme="high-contrast"
            enableComments=true
          )
          as |title content options|
      }}
        {{my-post title=title content=content options=options}}
      {{/let}}
    ```
  
    @method let
    @for Ember.Templates.helpers
    @public
  */


  function blockLetMacro(params, _hash, template, _inverse, builder) {
    if (template !== null) {
      if (params !== null) {
        builder.compileParams(params);
        builder.invokeStaticBlock(template, params.length);
      } else {
        builder.invokeStatic(template);
      }
    }

    return true;
  }

  var CAPABILITIES$4 = {
    dynamicLayout: true,
    dynamicTag: false,
    prepareArgs: false,
    createArgs: true,
    attributeHook: false,
    elementHook: false,
    createCaller: true,
    dynamicScope: true,
    updateHook: true,
    createInstance: true
  }; // TODO
  // This "disables" the "@model" feature by making the arg untypable syntatically
  // Delete this when EMBER_ROUTING_MODEL_ARG has shipped

  var MODEL_ARG_NAME = 'model';

  var MountManager =
  /*#__PURE__*/
  function (_AbstractManager6) {
    (0, _emberBabel.inheritsLoose)(MountManager, _AbstractManager6);

    function MountManager() {
      return _AbstractManager6.apply(this, arguments) || this;
    }

    var _proto64 = MountManager.prototype;

    _proto64.getDynamicLayout = function getDynamicLayout(state, _) {
      var templateFactory$$1 = state.engine.lookup('template:application');
      var template = templateFactory$$1(state.engine);
      var layout = template.asLayout();

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        state.environment.debugRenderTree.setTemplate(state.controller, template);
      }

      return {
        handle: layout.compile(),
        symbolTable: layout.symbolTable
      };
    };

    _proto64.getCapabilities = function getCapabilities() {
      return CAPABILITIES$4;
    };

    _proto64.create = function create(environment, _ref33, args) {
      var name = _ref33.name;

      if (false
      /* DEBUG */
      ) {
        environment.debugStack.pushEngine("engine:" + name);
      } // TODO
      // mount is a runtime helper, this shouldn't use dynamic layout
      // we should resolve the engine app template in the helper
      // it also should use the owner that looked up the mount helper.


      var engine = environment.owner.buildChildEngineInstance(name);
      engine.boot();
      var applicationFactory = engine.factoryFor("controller:application");
      var controllerFactory = applicationFactory || (0, _routing.generateControllerFactory)(engine, 'application');
      var controller;
      var self;
      var bucket;
      var modelRef;

      if (args.named.has(MODEL_ARG_NAME)) {
        modelRef = args.named.get(MODEL_ARG_NAME);
      }

      if (modelRef === undefined) {
        controller = controllerFactory.create();
        self = new RootReference(controller);
        bucket = {
          engine: engine,
          controller: controller,
          self: self,
          environment: environment
        };
      } else {
        var model = modelRef.value();
        controller = controllerFactory.create({
          model: model
        });
        self = new RootReference(controller);
        bucket = {
          engine: engine,
          controller: controller,
          self: self,
          modelRef: modelRef,
          environment: environment
        };
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        environment.debugRenderTree.create(bucket, {
          type: 'engine',
          name: name,
          args: args.capture(),
          instance: engine,
          template: undefined
        });
        environment.debugRenderTree.create(controller, {
          type: 'route-template',
          name: 'application',
          args: args.capture(),
          instance: controller,
          // set in getDynamicLayout
          template: undefined
        });
      }

      return bucket;
    };

    _proto64.getSelf = function getSelf(_ref34) {
      var self = _ref34.self;
      return self;
    };

    _proto64.getTag = function getTag(state) {
      var tag = _reference.CONSTANT_TAG;

      if (state.modelRef) {
        tag = state.modelRef.tag;
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE && (0, _reference.isConstTag)(tag)) {
        tag = (0, _reference.createTag)();
      }

      return tag;
    };

    _proto64.getDestructor = function getDestructor(bucket) {
      var engine = bucket.engine,
          environment = bucket.environment,
          controller = bucket.controller;

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        return {
          destroy: function destroy() {
            environment.debugRenderTree.willDestroy(controller);
            environment.debugRenderTree.willDestroy(bucket);
            engine.destroy();
          }
        };
      } else {
        return engine;
      }
    };

    _proto64.didRenderLayout = function didRenderLayout(bucket, bounds) {
      if (false
      /* DEBUG */
      ) {
        bucket.environment.debugStack.pop();
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.didRender(bucket.controller, bounds);
        bucket.environment.debugRenderTree.didRender(bucket, bounds);
      }
    };

    _proto64.update = function update(bucket) {
      var controller = bucket.controller,
          environment = bucket.environment,
          modelRef = bucket.modelRef;

      if (modelRef !== undefined) {
        controller.set('model', modelRef.value());
      }

      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        environment.debugRenderTree.update(bucket);
        environment.debugRenderTree.update(bucket.controller);
      }
    };

    _proto64.didUpdateLayout = function didUpdateLayout(bucket, bounds) {
      if (_environment2.ENV._DEBUG_RENDER_TREE) {
        bucket.environment.debugRenderTree.didRender(bucket.controller, bounds);
        bucket.environment.debugRenderTree.didRender(bucket, bounds);
      }
    };

    return MountManager;
  }(AbstractManager);

  var MOUNT_MANAGER = new MountManager();

  var MountDefinition = function MountDefinition(name) {
    this.manager = MOUNT_MANAGER;
    this.state = {
      name: name
    };
  };

  function mountHelper(vm, args) {
    var env = vm.env;
    var nameRef = args.positional.at(0);
    var captured = null; // TODO: the functionailty to create a proper CapturedArgument should be
    // exported by glimmer, or that it should provide an overload for `curry`
    // that takes `PreparedArguments`

    if (args.named.has('model')) {
      (false && !(args.named.length === 1) && (0, _debug.assert)('[BUG] this should already be checked by the macro', args.named.length === 1));
      var named = args.named.capture();
      var tag = named.tag; // TODO delete me after EMBER_ROUTING_MODEL_ARG has shipped

      if (false
      /* DEBUG */
      && MODEL_ARG_NAME !== 'model') {
        (false && !(named['_map'] === null) && (0, _debug.assert)('[BUG] named._map is not null', named['_map'] === null));
        named.names = [MODEL_ARG_NAME];
      }

      captured = {
        tag: tag,
        positional: _runtime2.EMPTY_ARGS.positional,
        named: named,
        length: 1,
        value: function value() {
          return {
            named: this.named.value(),
            positional: this.positional.value()
          };
        }
      };
    }

    return new DynamicEngineReference(nameRef, env, captured);
  }
  /**
    The `{{mount}}` helper lets you embed a routeless engine in a template.
    Mounting an engine will cause an instance to be booted and its `application`
    template to be rendered.
  
    For example, the following template mounts the `ember-chat` engine:
  
    ```handlebars
    {{! application.hbs }}
    {{mount "ember-chat"}}
    ```
  
    Additionally, you can also pass in a `model` argument that will be
    set as the engines model. This can be an existing object:
  
    ```
    <div>
      {{mount 'admin' model=userSettings}}
    </div>
    ```
  
    Or an inline `hash`, and you can even pass components:
  
    ```
    <div>
      <h1>Application template!</h1>
      {{mount 'admin' model=(hash
          title='Secret Admin'
          signInButton=(component 'sign-in-button')
      )}}
    </div>
    ```
  
    @method mount
    @param {String} name Name of the engine to mount.
    @param {Object} [model] Object that will be set as
                            the model of the engine.
    @for Ember.Templates.helpers
    @public
  */


  function mountMacro(_name, params, hash, builder) {
    (false && !(params.length === 1) && (0, _debug.assert)('You can only pass a single positional argument to the {{mount}} helper, e.g. {{mount "chat-engine"}}.', params.length === 1));

    if (false
    /* DEBUG */
    && hash) {
      var keys = hash[0];
      var extra = keys.filter(function (k) {
        return k !== 'model';
      });
      (false && !(extra.length === 0) && (0, _debug.assert)('You can only pass a `model` argument to the {{mount}} helper, ' + 'e.g. {{mount "profile-engine" model=this.profile}}. ' + ("You passed " + extra.join(',') + "."), extra.length === 0));
    }

    var expr = [_wireFormat.Ops.Helper, '-mount', params || [], hash];
    builder.dynamicComponent(expr, null, [], null, false, null, null);
    return true;
  }

  var DynamicEngineReference =
  /*#__PURE__*/
  function () {
    function DynamicEngineReference(nameRef, env, args) {
      this.nameRef = nameRef;
      this.env = env;
      this.args = args;
      this._lastName = null;
      this._lastDef = null;
      this.tag = nameRef.tag;
    }

    var _proto65 = DynamicEngineReference.prototype;

    _proto65.value = function value() {
      var env = this.env,
          nameRef = this.nameRef,
          args = this.args;
      var name = nameRef.value();

      if (typeof name === 'string') {
        if (this._lastName === name) {
          return this._lastDef;
        }

        (false && !(env.owner.hasRegistration("engine:" + name)) && (0, _debug.assert)("You used `{{mount '" + name + "'}}`, but the engine '" + name + "' can not be found.", env.owner.hasRegistration("engine:" + name)));

        if (!env.owner.hasRegistration("engine:" + name)) {
          return null;
        }

        this._lastName = name;
        this._lastDef = (0, _runtime2.curry)(new MountDefinition(name), args);
        return this._lastDef;
      } else {
        (false && !(name === null || name === undefined) && (0, _debug.assert)("Invalid engine name '" + name + "' specified, engine name must be either a string, null or undefined.", name === null || name === undefined));
        this._lastDef = null;
        this._lastName = null;
        return null;
      }
    };

    _proto65.get = function get() {
      return _runtime2.UNDEFINED_REFERENCE;
    };

    return DynamicEngineReference;
  }();
  /**
   * Represents the root outlet.
   */


  var RootOutletReference =
  /*#__PURE__*/
  function () {
    function RootOutletReference(outletState) {
      this.outletState = outletState;
      this.tag = (0, _reference.createTag)();
    }

    var _proto66 = RootOutletReference.prototype;

    _proto66.get = function get(key) {
      return new PathReference(this, key);
    };

    _proto66.value = function value() {
      return this.outletState;
    };

    _proto66.update = function update(state) {
      this.outletState.outlets.main = state;
      (0, _reference.dirty)(this.tag);
    };

    return RootOutletReference;
  }();
  /**
   * Represents the connected outlet.
   */


  var OutletReference =
  /*#__PURE__*/
  function () {
    function OutletReference(parentStateRef, outletNameRef) {
      this.parentStateRef = parentStateRef;
      this.outletNameRef = outletNameRef;
      this.tag = (0, _reference.combine)([parentStateRef.tag, outletNameRef.tag]);
    }

    var _proto67 = OutletReference.prototype;

    _proto67.value = function value() {
      var outletState = this.parentStateRef.value();
      var outlets = outletState === undefined ? undefined : outletState.outlets;
      return outlets === undefined ? undefined : outlets[this.outletNameRef.value()];
    };

    _proto67.get = function get(key) {
      return new PathReference(this, key);
    };

    return OutletReference;
  }();
  /**
   * Outlet state is dirtied from root.
   * This just using the parent tag for dirtiness.
   */


  var PathReference =
  /*#__PURE__*/
  function () {
    function PathReference(parent, key) {
      this.parent = parent;
      this.key = key;
      this.tag = parent.tag;
    }

    var _proto68 = PathReference.prototype;

    _proto68.get = function get(key) {
      return new PathReference(this, key);
    };

    _proto68.value = function value() {
      var parent = this.parent.value();
      return parent && parent[this.key];
    };

    return PathReference;
  }();
  /**
    The `{{outlet}}` helper lets you specify where a child route will render in
    your template. An important use of the `{{outlet}}` helper is in your
    application's `application.hbs` file:
  
    ```handlebars
    {{! app/templates/application.hbs }}
    <!-- header content goes here, and will always display -->
    <MyHeader />
    <div class="my-dynamic-content">
      <!-- this content will change based on the current route, which depends on the current URL -->
      {{outlet}}
    </div>
    <!-- footer content goes here, and will always display -->
    <MyFooter />
    ```
  
    You may also specify a name for the `{{outlet}}`, which is useful when using more than one
    `{{outlet}}` in a template:
  
    ```handlebars
    {{outlet "menu"}}
    {{outlet "sidebar"}}
    {{outlet "main"}}
    ```
  
    Your routes can then render into a specific one of these `outlet`s by specifying the `outlet`
    attribute in your `renderTemplate` function:
  
    ```app/routes/menu.js
    import Route from '@ember/routing/route';
  
    export default Route.extend({
      renderTemplate() {
        this.render({ outlet: 'menu' });
      }
    });
    ```
  
    See the [routing guide](https://guides.emberjs.com/release/routing/rendering-a-template/) for more
    information on how your `route` interacts with the `{{outlet}}` helper.
    Note: Your content __will not render__ if there isn't an `{{outlet}}` for it.
  
    @method outlet
    @param {String} [name]
    @for Ember.Templates.helpers
    @public
  */


  function outletHelper(vm, args) {
    var scope = vm.dynamicScope();
    var nameRef;

    if (args.positional.length === 0) {
      nameRef = new _reference.ConstReference('main');
    } else {
      nameRef = args.positional.at(0);
    }

    return new OutletComponentReference(new OutletReference(scope.outletState, nameRef));
  }

  function outletMacro(_name, params, hash, builder) {
    var expr = [_wireFormat.Ops.Helper, '-outlet', params || [], hash];
    builder.dynamicComponent(expr, null, [], null, false, null, null);
    return true;
  }

  var OutletModelReference =
  /*#__PURE__*/
  function () {
    function OutletModelReference(parent) {
      this.parent = parent;
      this.tag = parent.tag;
    }

    var _proto69 = OutletModelReference.prototype;

    _proto69.value = function value() {
      var state = this.parent.value();

      if (state === undefined) {
        return undefined;
      }

      var render = state.render;

      if (render === undefined) {
        return undefined;
      }

      return render.model;
    };

    _proto69.get = function get(property) {
      if (false
      /* DEBUG */
      ) {
        // This guarentees that we preserve the `debug()` output below
        return new NestedPropertyReference(this, property);
      } else {
        return PropertyReference.create(this, property);
      }
    };

    return OutletModelReference;
  }();

  if (false
  /* DEBUG */
  ) {
    OutletModelReference.prototype['debug'] = function debug() {
      return '@model';
    };
  }

  var OutletComponentReference =
  /*#__PURE__*/
  function () {
    function OutletComponentReference(outletRef) {
      this.outletRef = outletRef;
      this.args = null;
      this.definition = null;
      this.lastState = null; // The router always dirties the root state.

      var tag = this.tag = outletRef.tag;
      {
        var modelRef = new OutletModelReference(outletRef);
        var map$$1 = (0, _util.dict)();
        map$$1.model = modelRef; // TODO: the functionailty to create a proper CapturedArgument should be
        // exported by glimmer, or that it should provide an overload for `curry`
        // that takes `PreparedArguments`

        this.args = {
          tag: tag,
          positional: _runtime2.EMPTY_ARGS.positional,
          named: {
            tag: tag,
            map: map$$1,
            names: ['model'],
            references: [modelRef],
            length: 1,
            has: function has(key) {
              return key === 'model';
            },
            get: function get(key) {
              return key === 'model' ? modelRef : _runtime2.UNDEFINED_REFERENCE;
            },
            value: function value() {
              var model = modelRef.value();
              return {
                model: model
              };
            }
          },
          length: 1,
          value: function value() {
            return {
              named: this.named.value(),
              positional: this.positional.value()
            };
          }
        };
      }
    }

    var _proto70 = OutletComponentReference.prototype;

    _proto70.value = function value() {
      var state = stateFor(this.outletRef);

      if (validate$1(state, this.lastState)) {
        return this.definition;
      }

      this.lastState = state;
      var definition = null;

      if (state !== null) {
        definition = (0, _runtime2.curry)(new OutletComponentDefinition(state), this.args);
      }

      return this.definition = definition;
    };

    _proto70.get = function get(_key) {
      return _runtime2.UNDEFINED_REFERENCE;
    };

    return OutletComponentReference;
  }();

  function stateFor(ref) {
    var outlet = ref.value();
    if (outlet === undefined) return null;
    var render = outlet.render;
    if (render === undefined) return null;
    var template$$1 = render.template;
    if (template$$1 === undefined) return null; // this guard can be removed once @ember/test-helpers@1.6.0 has "aged out"
    // and is no longer considered supported

    if (isTemplateFactory(template$$1)) {
      template$$1 = template$$1(render.owner);
    }

    return {
      ref: ref,
      name: render.name,
      outlet: render.outlet,
      template: template$$1,
      controller: render.controller,
      model: render.model
    };
  }

  function validate$1(state, lastState) {
    if (state === null) {
      return lastState === null;
    }

    if (lastState === null) {
      return false;
    }

    return state.template === lastState.template && state.controller === lastState.controller;
  }

  function hashToArgs(hash) {
    if (hash === null) return null;
    var names = hash[0].map(function (key) {
      return "@" + key;
    });
    return [names, hash[1]];
  }

  function refineInlineSyntax(name, params, hash, builder) {
    (false && !(!(builder.compiler['resolver']['resolver']['builtInHelpers'][name] && builder.referrer.owner.hasRegistration("helper:" + name))) && (0, _debug.assert)("You attempted to overwrite the built-in helper \"" + name + "\" which is not allowed. Please rename the helper.", !(builder.compiler['resolver']['resolver']['builtInHelpers'][name] && builder.referrer.owner.hasRegistration("helper:" + name))));
    var handle = builder.compiler['resolver'].lookupComponentDefinition(name, builder.referrer);

    if (handle !== null) {
      builder.component.static(handle, [params === null ? [] : params, hashToArgs(hash), null, null]);
      return true;
    }

    return false;
  }

  function refineBlockSyntax(name, params, hash, template, inverse, builder) {
    var handle = builder.compiler['resolver'].lookupComponentDefinition(name, builder.referrer);

    if (handle !== null) {
      wrapComponentClassAttribute(hash);
      builder.component.static(handle, [params, hashToArgs(hash), template, inverse]);
      return true;
    }

    (false && !(builder.referrer.owner.hasRegistration("helper:" + name)) && (0, _debug.assert)("A component or helper named \"" + name + "\" could not be found", builder.referrer.owner.hasRegistration("helper:" + name)));
    (false && !(!function () {
      var resolver = builder.compiler['resolver']['resolver'];
      var _builder$referrer = builder.referrer,
          owner = _builder$referrer.owner,
          moduleName = _builder$referrer.moduleName;

      if (name === 'component' || resolver['builtInHelpers'][name]) {
        return true;
      }

      var options = {
        source: "template:" + moduleName
      };
      return owner.hasRegistration("helper:" + name, options) || owner.hasRegistration("helper:" + name);
    }()) && (0, _debug.assert)("Helpers may not be used in the block form, for example {{#" + name + "}}{{/" + name + "}}. Please use a component, or alternatively use the helper in combination with a built-in Ember helper, for example {{#if (" + name + ")}}{{/if}}.", !function () {
      var resolver = builder.compiler['resolver']['resolver'];
      var _builder$referrer = builder.referrer,
          owner = _builder$referrer.owner,
          moduleName = _builder$referrer.moduleName;

      if (name === 'component' || resolver['builtInHelpers'][name]) {
        return true;
      }

      var options = {
        source: "template:" + moduleName
      };
      return owner.hasRegistration("helper:" + name, options) || owner.hasRegistration("helper:" + name);
    }()));
    return false;
  }

  var experimentalMacros = []; // This is a private API to allow for experimental macros
  // to be created in user space. Registering a macro should
  // should be done in an initializer.

  _exports._experimentalMacros = experimentalMacros;

  function registerMacros(macro) {
    experimentalMacros.push(macro);
  }

  function populateMacros(macros) {
    var inlines = macros.inlines,
        blocks = macros.blocks;
    inlines.add('outlet', outletMacro);
    inlines.add('mount', mountMacro);
    inlines.addMissing(refineInlineSyntax);
    blocks.add('let', blockLetMacro);
    blocks.addMissing(refineBlockSyntax);

    for (var i = 0; i < experimentalMacros.length; i++) {
      var macro = experimentalMacros[i];
      macro(blocks, inlines);
    }

    return {
      blocks: blocks,
      inlines: inlines
    };
  }

  var TEMPLATES$1 = new WeakMap();
  var getPrototypeOf$1 = Object.getPrototypeOf;

  function setComponentTemplate(factory, obj) {
    (false && !(obj !== null && (typeof obj === 'object' || typeof obj === 'function')) && (0, _debug.assert)("Cannot call `setComponentTemplate` on `" + (0, _utils.toString)(obj) + "`", obj !== null && (typeof obj === 'object' || typeof obj === 'function')));
    (false && !(!TEMPLATES$1.has(obj)) && (0, _debug.assert)("Cannot call `setComponentTemplate` multiple times on the same class (`" + obj + "`)", !TEMPLATES$1.has(obj)));
    TEMPLATES$1.set(obj, factory);
    return obj;
  }

  function getComponentTemplate(obj) {
    var pointer = obj;

    while (pointer !== undefined && pointer !== null) {
      var _template = TEMPLATES$1.get(pointer);

      if (_template !== undefined) {
        return _template;
      }

      pointer = getPrototypeOf$1(pointer);
    }

    return null;
  }

  function setModifierManager(factory, obj) {
    return setManager({
      factory: factory,
      internal: false,
      type: 'modifier'
    }, obj);
  }

  function getModifierManager(obj) {
    var wrapper = getManager(obj);

    if (wrapper && !wrapper.internal && wrapper.type === 'modifier') {
      return wrapper.factory;
    } else {
      return undefined;
    }
  }

  function instrumentationPayload$1(name) {
    return {
      object: "component:" + name
    };
  }

  function makeOptions(moduleName, namespace) {
    return {
      source: moduleName !== undefined ? "template:" + moduleName : undefined,
      namespace: namespace
    };
  }

  function componentFor(name, owner, options) {
    var fullName = "component:" + name;
    return owner.factoryFor(fullName, options) || null;
  }

  function layoutFor(name, owner, options) {
    var templateFullName = "template:components/" + name;
    return owner.lookup(templateFullName, options) || null;
  }

  function lookupComponentPair(owner, name, options) {
    var component = componentFor(name, owner, options);
    {
      if (component !== null && component.class !== undefined) {
        var _layout2 = getComponentTemplate(component.class);

        if (_layout2 !== null) {
          return {
            component: component,
            layout: _layout2
          };
        }
      }
    }
    var layout = layoutFor(name, owner, options);

    if (component === null && layout === null) {
      return null;
    } else {
      return {
        component: component,
        layout: layout
      };
    }
  }

  function lookupComponent(owner, name, options) {
    if (options.source || options.namespace) {
      var pair = lookupComponentPair(owner, name, options);

      if (pair !== null) {
        return pair;
      }
    }

    return lookupComponentPair(owner, name);
  }

  var BUILTINS_HELPERS = {
    if: inlineIf,
    action: action,
    array: array,
    concat: concat$1,
    fn: fn,
    get: get$1,
    hash: hash,
    log: log$1,
    mut: mut,
    'query-params': queryParams$1,
    readonly: readonly,
    unbound: unbound,
    unless: inlineUnless,
    '-class': classHelper$1,
    '-each-in': eachIn,
    '-input-type': inputTypeHelper$1,
    '-normalize-class': normalizeClassHelper,
    '-get-dynamic-var': _runtime2.getDynamicVar,
    '-mount': mountHelper,
    '-outlet': outletHelper,
    '-assert-implicit-component-helper-argument': componentAssertionHelper
  };

  var RuntimeResolver =
  /*#__PURE__*/
  function () {
    function RuntimeResolver(isInteractive) {
      this.handles = [undefined];
      this.objToHandle = new WeakMap();
      this.builtInHelpers = BUILTINS_HELPERS;
      this.componentDefinitionCache = new Map();
      this.componentDefinitionCount = 0;
      this.helperDefinitionCount = 0;
      var macros = new _opcodeCompiler.Macros();
      populateMacros(macros);
      this.compiler = new _opcodeCompiler.LazyCompiler(new CompileTimeLookup(this), this, macros);
      this.isInteractive = isInteractive;
      this.builtInModifiers = {
        action: {
          manager: new ActionModifierManager(),
          state: null
        },
        on: {
          manager: new OnModifierManager(isInteractive),
          state: null
        }
      };
    }
    /***  IRuntimeResolver ***/

    /**
     * public componentDefHandleCount = 0;
     * Called while executing Append Op.PushDynamicComponentManager if string
     */


    var _proto71 = RuntimeResolver.prototype;

    _proto71.lookupComponentDefinition = function lookupComponentDefinition(name, meta) {
      var handle = this.lookupComponentHandle(name, meta);

      if (handle === null) {
        (false && !(false) && (0, _debug.assert)("Could not find component named \"" + name + "\" (no component or template with that name was found)"));
        return null;
      }

      return this.resolve(handle);
    };

    _proto71.lookupComponentHandle = function lookupComponentHandle(name, meta) {
      var nextHandle = this.handles.length;
      var handle = this.handle(this._lookupComponentDefinition(name, meta));
      (false && !(!(name === 'text-area' && handle === null)) && (0, _debug.assert)('Could not find component `<TextArea />` (did you mean `<Textarea />`?)', !(name === 'text-area' && handle === null)));

      if (nextHandle === handle) {
        this.componentDefinitionCount++;
      }

      return handle;
    }
    /**
     * Called by RuntimeConstants to lookup unresolved handles.
     */
    ;

    _proto71.resolve = function resolve(handle) {
      return this.handles[handle];
    } // End IRuntimeResolver

    /**
     * Called by CompileTimeLookup compiling Unknown or Helper OpCode
     */
    ;

    _proto71.lookupHelper = function lookupHelper(name, meta) {
      var nextHandle = this.handles.length;

      var helper$$1 = this._lookupHelper(name, meta);

      if (helper$$1 !== null) {
        var handle = this.handle(helper$$1);

        if (nextHandle === handle) {
          this.helperDefinitionCount++;
        }

        return handle;
      }

      return null;
    }
    /**
     * Called by CompileTimeLookup compiling the
     */
    ;

    _proto71.lookupModifier = function lookupModifier(name, meta) {
      return this.handle(this._lookupModifier(name, meta));
    }
    /**
     * Called by CompileTimeLookup to lookup partial
     */
    ;

    _proto71.lookupPartial = function lookupPartial(name, meta) {
      var partial = this._lookupPartial(name, meta);

      return this.handle(partial);
    } // end CompileTimeLookup
    // needed for lazy compile time lookup
    ;

    _proto71.handle = function handle(obj) {
      if (obj === undefined || obj === null) {
        return null;
      }

      var handle = this.objToHandle.get(obj);

      if (handle === undefined) {
        handle = this.handles.push(obj) - 1;
        this.objToHandle.set(obj, handle);
      }

      return handle;
    };

    _proto71._lookupHelper = function _lookupHelper(_name, meta) {
      var helper$$1 = this.builtInHelpers[_name];

      if (helper$$1 !== undefined) {
        return helper$$1;
      }

      var owner = meta.owner,
          moduleName = meta.moduleName;
      var name = _name;
      var namespace = undefined;
      var options = makeOptions(moduleName, namespace);
      var factory = owner.factoryFor("helper:" + name, options) || owner.factoryFor("helper:" + name);

      if (!isHelperFactory(factory)) {
        return null;
      }

      return function (vm, args) {
        var helper$$1 = factory.create();

        if (isSimpleHelper(helper$$1)) {
          return SimpleHelperReference.create(helper$$1.compute, args.capture());
        }

        vm.newDestroyable(helper$$1);
        return ClassBasedHelperReference.create(helper$$1, args.capture());
      };
    };

    _proto71._lookupPartial = function _lookupPartial(name, meta) {
      var templateFactory$$1 = (0, _views.lookupPartial)(name, meta.owner);
      var template = templateFactory$$1(meta.owner);
      return new _opcodeCompiler.PartialDefinition(name, template);
    };

    _proto71._lookupModifier = function _lookupModifier(name, meta) {
      var builtin = this.builtInModifiers[name];

      if (builtin === undefined) {
        var owner = meta.owner;
        var modifier = owner.factoryFor("modifier:" + name);

        if (modifier !== undefined) {
          var managerFactory = getModifierManager(modifier.class);
          var manager = managerFactory(owner);
          return new CustomModifierDefinition(name, modifier, manager, this.isInteractive);
        }
      }

      return builtin;
    };

    _proto71._parseNameForNamespace = function _parseNameForNamespace(_name) {
      var name = _name;
      var namespace = undefined;

      var namespaceDelimiterOffset = _name.indexOf('::');

      if (namespaceDelimiterOffset !== -1) {
        name = _name.slice(namespaceDelimiterOffset + 2);
        namespace = _name.slice(0, namespaceDelimiterOffset);
      }

      return {
        name: name,
        namespace: namespace
      };
    };

    _proto71._lookupComponentDefinition = function _lookupComponentDefinition(_name, _ref35) {
      var moduleName = _ref35.moduleName,
          owner = _ref35.owner;
      var name = _name;
      var namespace = undefined;
      var pair = lookupComponent(owner, name, makeOptions(moduleName, namespace));

      if (pair === null) {
        return null;
      }

      var layout = null;
      var key;

      if (pair.component === null) {
        key = layout = pair.layout(owner);
      } else {
        key = pair.component;
      }

      var cachedComponentDefinition = this.componentDefinitionCache.get(key);

      if (cachedComponentDefinition !== undefined) {
        return cachedComponentDefinition;
      }

      if (layout === null && pair.layout !== null) {
        layout = pair.layout(owner);
      }

      var finalizer = (0, _instrumentation._instrumentStart)('render.getComponentDefinition', instrumentationPayload$1, name);
      var definition = null;

      if (pair.component === null) {
        if (_environment2.ENV._TEMPLATE_ONLY_GLIMMER_COMPONENTS) {
          definition = new TemplateOnlyComponentDefinition(name, layout);
        }
      } else if (true
      /* EMBER_GLIMMER_SET_COMPONENT_TEMPLATE */
      && (0, _templateOnly.isTemplateOnlyComponent)(pair.component.class)) {
        definition = new TemplateOnlyComponentDefinition(name, layout);
      }

      if (pair.component !== null) {
        (false && !(pair.component.class !== undefined) && (0, _debug.assert)("missing component class " + name, pair.component.class !== undefined));
        var ComponentClass = pair.component.class;
        var wrapper = getManager(ComponentClass);

        if (wrapper !== null && wrapper.type === 'component') {
          var factory = wrapper.factory;

          if (wrapper.internal) {
            (false && !(pair.layout !== null) && (0, _debug.assert)("missing layout for internal component " + name, pair.layout !== null));
            definition = new InternalComponentDefinition(factory(owner), ComponentClass, layout);
          } else {
            definition = new CustomManagerDefinition(name, pair.component, factory(owner), layout !== null ? layout : owner.lookup((0, _container.privatize)(_templateObject3()))(owner));
          }
        }
      }

      if (definition === null) {
        definition = new CurlyComponentDefinition(name, pair.component || owner.factoryFor((0, _container.privatize)(_templateObject4())), null, layout);
      }

      finalizer();
      this.componentDefinitionCache.set(key, definition);
      return definition;
    };

    return RuntimeResolver;
  }();

  var TemplateCompiler = {
    create: function create(_ref36) {
      var environment = _ref36.environment;
      return new RuntimeResolver(environment.isInteractive).compiler;
    }
  };
  var ComponentTemplate = template({
    "id": "chfQcH83",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1]],\"hasEval\":false}",
    "meta": {
      "moduleName": "packages/@ember/-internals/glimmer/lib/templates/component.hbs"
    }
  });
  var InputTemplate = template({
    "id": "NWZzLSII",
    "block": "{\"symbols\":[\"Checkbox\",\"TextField\",\"@__ARGS__\",\"&attrs\"],\"statements\":[[4,\"let\",[[28,\"component\",[\"-checkbox\"],null],[28,\"component\",[\"-text-field\"],null]],null,{\"statements\":[[4,\"if\",[[23,0,[\"isCheckbox\"]]],null,{\"statements\":[[6,[23,1,[]],[[13,4]],[[\"@target\",\"@__ARGS__\"],[[23,0,[\"caller\"]],[23,3,[]]]]]],\"parameters\":[]},{\"statements\":[[6,[23,2,[]],[[13,4]],[[\"@target\",\"@__ARGS__\"],[[23,0,[\"caller\"]],[23,3,[]]]]]],\"parameters\":[]}]],\"parameters\":[1,2]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "packages/@ember/-internals/glimmer/lib/templates/input.hbs"
    }
  });
  var OutletTemplate = template({
    "id": "ffAL6HDl",
    "block": "{\"symbols\":[],\"statements\":[[1,[22,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "packages/@ember/-internals/glimmer/lib/templates/outlet.hbs"
    }
  });
  var TOP_LEVEL_NAME = '-top-level';
  var TOP_LEVEL_OUTLET = 'main';

  var OutletView =
  /*#__PURE__*/
  function () {
    function OutletView(_environment, renderer, owner, template) {
      this._environment = _environment;
      this.renderer = renderer;
      this.owner = owner;
      this.template = template;
      var ref = this.ref = new RootOutletReference({
        outlets: {
          main: undefined
        },
        render: {
          owner: owner,
          into: undefined,
          outlet: TOP_LEVEL_OUTLET,
          name: TOP_LEVEL_NAME,
          controller: undefined,
          model: undefined,
          template: template
        }
      });
      this.state = {
        ref: ref,
        name: TOP_LEVEL_NAME,
        outlet: TOP_LEVEL_OUTLET,
        template: template,
        controller: undefined,
        model: undefined
      };
    }

    OutletView.extend = function extend(injections) {
      return (
        /*#__PURE__*/
        function (_OutletView) {
          (0, _emberBabel.inheritsLoose)(_class, _OutletView);

          function _class() {
            return _OutletView.apply(this, arguments) || this;
          }

          _class.create = function create(options) {
            if (options) {
              return _OutletView.create.call(this, (0, _polyfills.assign)({}, injections, options));
            } else {
              return _OutletView.create.call(this, injections);
            }
          };

          return _class;
        }(OutletView)
      );
    };

    OutletView.reopenClass = function reopenClass(injections) {
      (0, _polyfills.assign)(this, injections);
    };

    OutletView.create = function create(options) {
      var _environment = options._environment,
          renderer = options.renderer,
          templateFactory$$1 = options.template;
      var owner = options[_owner.OWNER];
      var template = templateFactory$$1(owner);
      return new OutletView(_environment, renderer, owner, template);
    };

    var _proto72 = OutletView.prototype;

    _proto72.appendTo = function appendTo(selector) {
      var target;

      if (this._environment.hasDOM) {
        target = typeof selector === 'string' ? document.querySelector(selector) : selector;
      } else {
        target = selector;
      }

      (0, _runloop.schedule)('render', this.renderer, 'appendOutletView', this, target);
    };

    _proto72.rerender = function rerender() {
      /**/
    };

    _proto72.setOutletState = function setOutletState(state) {
      this.ref.update(state);
    };

    _proto72.destroy = function destroy() {
      /**/
    };

    return OutletView;
  }();

  _exports.OutletView = OutletView;

  function setupApplicationRegistry(registry) {
    registry.injection('service:-glimmer-environment', 'appendOperations', 'service:-dom-tree-construction');
    registry.injection('renderer', 'env', 'service:-glimmer-environment'); // because we are using injections we can't use instantiate false
    // we need to use bind() to copy the function so factory for
    // association won't leak

    registry.register('service:-dom-builder', {
      create: function create(_ref37) {
        var bootOptions = _ref37.bootOptions;
        var _renderMode = bootOptions._renderMode;

        switch (_renderMode) {
          case 'serialize':
            return _node.serializeBuilder.bind(null);

          case 'rehydrate':
            return _runtime2.rehydrationBuilder.bind(null);

          default:
            return _runtime2.clientBuilder.bind(null);
        }
      }
    });
    registry.injection('service:-dom-builder', 'bootOptions', '-environment:main');
    registry.injection('renderer', 'builder', 'service:-dom-builder');
    registry.register((0, _container.privatize)(_templateObject5()), RootTemplate);
    registry.injection('renderer', 'rootTemplate', (0, _container.privatize)(_templateObject6()));
    registry.register('renderer:-dom', InteractiveRenderer);
    registry.register('renderer:-inert', InertRenderer);

    if (_browserEnvironment.hasDOM) {
      registry.injection('service:-glimmer-environment', 'updateOperations', 'service:-dom-changes');
    }

    registry.register('service:-dom-changes', {
      create: function create(_ref38) {
        var document = _ref38.document;
        return new _runtime2.DOMChanges(document);
      }
    });
    registry.register('service:-dom-tree-construction', {
      create: function create(_ref39) {
        var document = _ref39.document;
        var Implementation = _browserEnvironment.hasDOM ? _runtime2.DOMTreeConstruction : _node.NodeDOMTreeConstruction;
        return new Implementation(document);
      }
    });
  }

  function setupEngineRegistry(registry) {
    registry.optionsForType('template', {
      instantiate: false
    });
    registry.register('view:-outlet', OutletView);
    registry.register('template:-outlet', OutletTemplate);
    registry.injection('view:-outlet', 'template', 'template:-outlet');
    registry.injection('service:-dom-changes', 'document', 'service:-document');
    registry.injection('service:-dom-tree-construction', 'document', 'service:-document');
    registry.register((0, _container.privatize)(_templateObject7()), ComponentTemplate);
    registry.register('service:-glimmer-environment', Environment$1);
    registry.register((0, _container.privatize)(_templateObject8()), TemplateCompiler);
    registry.injection((0, _container.privatize)(_templateObject9()), 'environment', '-environment:main');
    registry.optionsForType('helper', {
      instantiate: false
    });
    registry.register('helper:loc', loc$1);
    registry.register('component:-text-field', TextField);
    registry.register('component:-checkbox', Checkbox);
    registry.register('component:link-to', LinkComponent);
    registry.register('component:input', Input);
    registry.register('template:components/input', InputTemplate);
    registry.register('component:textarea', TextArea);

    if (!_environment2.ENV._TEMPLATE_ONLY_GLIMMER_COMPONENTS) {
      registry.register((0, _container.privatize)(_templateObject10()), Component);
    }
  }

  function setComponentManager(stringOrFunction, obj) {
    var factory;

    if (_deprecatedFeatures.COMPONENT_MANAGER_STRING_LOOKUP && typeof stringOrFunction === 'string') {
      (false && !(false) && (0, _debug.deprecate)('Passing the name of the component manager to "setupComponentManager" is deprecated. Please pass a function that produces an instance of the manager.', false, {
        id: 'deprecate-string-based-component-manager',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x/#toc_component-manager-string-lookup'
      }));

      factory = function factory(owner) {
        return owner.lookup("component-manager:" + stringOrFunction);
      };
    } else {
      factory = stringOrFunction;
    }

    return setManager({
      factory: factory,
      internal: false,
      type: 'component'
    }, obj);
  }

  function getComponentManager(obj) {
    var wrapper = getManager(obj);

    if (wrapper && !wrapper.internal && wrapper.type === 'component') {
      return wrapper.factory;
    } else {
      return undefined;
    }
  }
  /**
    [Glimmer](https://github.com/tildeio/glimmer) is a templating engine used by Ember.js that is compatible with a subset of the [Handlebars](http://handlebarsjs.com/) syntax.
  
    ### Showing a property
  
    Templates manage the flow of an application's UI, and display state (through
    the DOM) to a user. For example, given a component with the property "name",
    that component's template can use the name in several ways:
  
    ```app/components/person-profile.js
    import Component from '@ember/component';
  
    export default Component.extend({
      name: 'Jill'
    });
    ```
  
    ```app/templates/components/person-profile.hbs
    {{name}}
    <div>{{name}}</div>
    <span data-name={{name}}></span>
    ```
  
    Any time the "name" property on the component changes, the DOM will be
    updated.
  
    Properties can be chained as well:
  
    ```handlebars
    {{aUserModel.name}}
    <div>{{listOfUsers.firstObject.name}}</div>
    ```
  
    ### Using Ember helpers
  
    When content is passed in mustaches `{{}}`, Ember will first try to find a helper
    or component with that name. For example, the `if` helper:
  
    ```handlebars
    {{if name "I have a name" "I have no name"}}
    <span data-has-name={{if name true}}></span>
    ```
  
    The returned value is placed where the `{{}}` is called. The above style is
    called "inline". A second style of helper usage is called "block". For example:
  
    ```handlebars
    {{#if name}}
    I have a name
    {{else}}
    I have no name
    {{/if}}
    ```
  
    The block form of helpers allows you to control how the UI is created based
    on the values of properties.
    A third form of helper is called "nested". For example here the concat
    helper will add " Doe" to a displayed name if the person has no last name:
  
    ```handlebars
    <span data-name={{concat firstName (
    if lastName (concat " " lastName) "Doe"
    )}}></span>
    ```
  
    Ember's built-in helpers are described under the [Ember.Templates.helpers](/ember/release/classes/Ember.Templates.helpers)
    namespace. Documentation on creating custom helpers can be found under
    [helper](/ember/release/functions/@ember%2Fcomponent%2Fhelper/helper) (or
    under [Helper](/ember/release/classes/Helper) if a helper requires access to
    dependency injection).
  
    ### Invoking a Component
  
    Ember components represent state to the UI of an application. Further
    reading on components can be found under [Component](/ember/release/classes/Component).
  
    @module @ember/component
    @main @ember/component
    @public
   */

});