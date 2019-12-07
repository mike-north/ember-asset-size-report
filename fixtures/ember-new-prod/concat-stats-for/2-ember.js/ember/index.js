define("ember/index", ["exports", "require", "@ember/-internals/environment", "node-module", "@ember/-internals/utils", "@ember/-internals/container", "@ember/instrumentation", "@ember/-internals/meta", "@ember/-internals/metal", "@ember/canary-features", "@ember/debug", "backburner", "@ember/-internals/console", "@ember/controller", "@ember/controller/lib/controller_mixin", "@ember/string", "@ember/service", "@ember/object", "@ember/object/compat", "@ember/object/computed", "@ember/-internals/runtime", "@ember/-internals/glimmer", "ember/version", "@ember/-internals/views", "@ember/-internals/routing", "@ember/-internals/extension-support", "@ember/error", "@ember/runloop", "@ember/-internals/error-handling", "@ember/-internals/owner", "@ember/application", "@ember/application/globals-resolver", "@ember/application/instance", "@ember/engine", "@ember/engine/instance", "@ember/polyfills", "@ember/deprecated-features", "@ember/component/template-only"], function (_exports, _require, _environment, _nodeModule, utils, _container, instrumentation, _meta, metal, _canaryFeatures, EmberDebug, _backburner, _console, _controller, _controller_mixin, _string, _service, _object, _compat, _computed, _runtime, _glimmer, _version, views, routing, extensionSupport, _error, runloop, _errorHandling, _owner, _application, _globalsResolver, _instance, _engine, _instance2, _polyfills, _deprecatedFeatures, _templateOnly) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  // eslint-disable-next-line import/no-unresolved
  // ****@ember/-internals/environment****
  var Ember = typeof _environment.context.imports.Ember === 'object' && _environment.context.imports.Ember || {};
  Ember.isNamespace = true;

  Ember.toString = function () {
    return 'Ember';
  };

  Object.defineProperty(Ember, 'ENV', {
    get: _environment.getENV,
    enumerable: false
  });
  Object.defineProperty(Ember, 'lookup', {
    get: _environment.getLookup,
    set: _environment.setLookup,
    enumerable: false
  });

  if (_deprecatedFeatures.EMBER_EXTEND_PROTOTYPES) {
    Object.defineProperty(Ember, 'EXTEND_PROTOTYPES', {
      enumerable: false,
      get: function get() {
        (false && !(false) && (0, EmberDebug.deprecate)('Accessing Ember.EXTEND_PROTOTYPES is deprecated, please migrate to Ember.ENV.EXTEND_PROTOTYPES', false, {
          id: 'ember-env.old-extend-prototypes',
          until: '4.0.0'
        }));
        return _environment.ENV.EXTEND_PROTOTYPES;
      }
    });
  } // ****@ember/application****


  Ember.getOwner = _owner.getOwner;
  Ember.setOwner = _owner.setOwner;
  Ember.Application = _application.default;
  Ember.DefaultResolver = Ember.Resolver = _globalsResolver.default;
  Ember.ApplicationInstance = _instance.default; // ****@ember/engine****

  Ember.Engine = _engine.default;
  Ember.EngineInstance = _instance2.default; // ****@ember/polyfills****

  Ember.assign = _polyfills.assign;
  Ember.merge = _polyfills.merge; // ****@ember/-internals/utils****

  Ember.generateGuid = utils.generateGuid;
  Ember.GUID_KEY = utils.GUID_KEY;
  Ember.guidFor = utils.guidFor;
  Ember.inspect = utils.inspect;
  Ember.makeArray = utils.makeArray;
  Ember.canInvoke = utils.canInvoke;
  Ember.tryInvoke = utils.tryInvoke;
  Ember.wrap = utils.wrap;
  Ember.uuid = utils.uuid; // ****@ember/-internals/container****

  Ember.Container = _container.Container;
  Ember.Registry = _container.Registry; // ****@ember/debug****

  Ember.assert = EmberDebug.assert;
  Ember.warn = EmberDebug.warn;
  Ember.debug = EmberDebug.debug;
  Ember.deprecate = EmberDebug.deprecate;
  Ember.deprecateFunc = EmberDebug.deprecateFunc;
  Ember.runInDebug = EmberDebug.runInDebug; // ****@ember/error****

  Ember.Error = _error.default;
  /**
    @public
    @class Ember.Debug
  */

  Ember.Debug = {
    registerDeprecationHandler: EmberDebug.registerDeprecationHandler,
    registerWarnHandler: EmberDebug.registerWarnHandler,
    isComputed: metal.isComputed
  }; // ****@ember/instrumentation****

  Ember.instrument = instrumentation.instrument;
  Ember.subscribe = instrumentation.subscribe;
  Ember.Instrumentation = {
    instrument: instrumentation.instrument,
    subscribe: instrumentation.subscribe,
    unsubscribe: instrumentation.unsubscribe,
    reset: instrumentation.reset
  }; // ****@ember/runloop****
  // Using _globalsRun here so that mutating the function (adding
  // `next`, `later`, etc to it) is only available in globals builds

  Ember.run = runloop._globalsRun;
  Ember.run.backburner = runloop.backburner;
  Ember.run.begin = runloop.begin;
  Ember.run.bind = runloop.bind;
  Ember.run.cancel = runloop.cancel;
  Ember.run.debounce = runloop.debounce;
  Ember.run.end = runloop.end;
  Ember.run.hasScheduledTimers = runloop.hasScheduledTimers;
  Ember.run.join = runloop.join;
  Ember.run.later = runloop.later;
  Ember.run.next = runloop.next;
  Ember.run.once = runloop.once;
  Ember.run.schedule = runloop.schedule;
  Ember.run.scheduleOnce = runloop.scheduleOnce;
  Ember.run.throttle = runloop.throttle;
  Ember.run.cancelTimers = runloop.cancelTimers;
  Object.defineProperty(Ember.run, 'currentRunLoop', {
    get: runloop.getCurrentRunLoop,
    enumerable: false
  }); // ****@ember/-internals/metal****
  // Using _globalsComputed here so that mutating the function is only available
  // in globals builds

  var computed = metal._globalsComputed;
  Ember.computed = computed;
  Ember._descriptor = metal.nativeDescDecorator;
  Ember._tracked = metal.tracked;
  computed.alias = metal.alias;
  Ember.cacheFor = metal.getCachedValueFor;
  Ember.ComputedProperty = metal.ComputedProperty;
  Object.defineProperty(Ember, '_setComputedDecorator', {
    get: function get() {
      (false && !(false) && (0, EmberDebug.deprecate)('Please migrate from Ember._setComputedDecorator to Ember._setClassicDecorator', false, {
        id: 'ember._setComputedDecorator',
        until: '3.13.0'
      }));
      return metal.setClassicDecorator;
    }
  });
  Ember._setClassicDecorator = metal.setClassicDecorator;
  Ember.meta = _meta.meta;
  Ember.get = metal.get;
  Ember.getWithDefault = metal.getWithDefault;
  Ember._getPath = metal._getPath;
  Ember.set = metal.set;
  Ember.trySet = metal.trySet;
  Ember.FEATURES = (0, _polyfills.assign)({
    isEnabled: _canaryFeatures.isEnabled
  }, _canaryFeatures.FEATURES);
  Ember._Cache = utils.Cache;
  Ember.on = metal.on;
  Ember.addListener = metal.addListener;
  Ember.removeListener = metal.removeListener;
  Ember.sendEvent = metal.sendEvent;
  Ember.hasListeners = metal.hasListeners;
  Ember.isNone = metal.isNone;
  Ember.isEmpty = metal.isEmpty;
  Ember.isBlank = metal.isBlank;
  Ember.isPresent = metal.isPresent;
  Ember.notifyPropertyChange = metal.notifyPropertyChange;
  Ember.overrideChains = metal.overrideChains;
  Ember.beginPropertyChanges = metal.beginPropertyChanges;
  Ember.endPropertyChanges = metal.endPropertyChanges;
  Ember.changeProperties = metal.changeProperties;
  Ember.platform = {
    defineProperty: true,
    hasPropertyAccessors: true
  };
  Ember.defineProperty = metal.defineProperty;
  Ember.watchKey = metal.watchKey;
  Ember.unwatchKey = metal.unwatchKey;
  Ember.removeChainWatcher = metal.removeChainWatcher;
  Ember._ChainNode = metal.ChainNode;
  Ember.finishChains = metal.finishChains;
  Ember.watchPath = metal.watchPath;
  Ember.unwatchPath = metal.unwatchPath;
  Ember.watch = metal.watch;
  Ember.isWatching = metal.isWatching;
  Ember.unwatch = metal.unwatch;
  Ember.destroy = _meta.deleteMeta;
  Ember.libraries = metal.libraries;
  Ember.getProperties = metal.getProperties;
  Ember.setProperties = metal.setProperties;
  Ember.expandProperties = metal.expandProperties;
  Ember.addObserver = metal.addObserver;
  Ember.removeObserver = metal.removeObserver;
  Ember.aliasMethod = metal.aliasMethod;
  Ember.observer = metal.observer;
  Ember.mixin = metal.mixin;
  Ember.Mixin = metal.Mixin;
  /**
    A function may be assigned to `Ember.onerror` to be called when Ember
    internals encounter an error. This is useful for specialized error handling
    and reporting code.
  
    ```javascript
    import $ from 'jquery';
  
    Ember.onerror = function(error) {
      $.ajax('/report-error', 'POST', {
        stack: error.stack,
        otherInformation: 'whatever app state you want to provide'
      });
    };
    ```
  
    Internally, `Ember.onerror` is used as Backburner's error handler.
  
    @event onerror
    @for Ember
    @param {Exception} error the error object
    @public
  */

  Object.defineProperty(Ember, 'onerror', {
    get: _errorHandling.getOnerror,
    set: _errorHandling.setOnerror,
    enumerable: false
  });
  Object.defineProperty(Ember, 'testing', {
    get: EmberDebug.isTesting,
    set: EmberDebug.setTesting,
    enumerable: false
  });
  Ember._Backburner = _backburner.default; // ****@ember/-internals/console****

  if (_deprecatedFeatures.LOGGER) {
    Ember.Logger = _console.default;
  } // ****@ember/-internals/runtime****


  Ember.A = _runtime.A;
  Ember.String = {
    loc: _string.loc,
    w: _string.w,
    dasherize: _string.dasherize,
    decamelize: _string.decamelize,
    camelize: _string.camelize,
    classify: _string.classify,
    underscore: _string.underscore,
    capitalize: _string.capitalize
  };
  Ember.Object = _runtime.Object;
  Ember._RegistryProxyMixin = _runtime.RegistryProxyMixin;
  Ember._ContainerProxyMixin = _runtime.ContainerProxyMixin;
  Ember.compare = _runtime.compare;
  Ember.copy = _runtime.copy;
  Ember.isEqual = _runtime.isEqual;
  Ember._setFrameworkClass = _runtime.setFrameworkClass;
  /**
  @module ember
  */

  /**
    Namespace for injection helper methods.
  
    @class inject
    @namespace Ember
    @static
    @public
  */

  Ember.inject = function inject() {
    (false && !(false) && (0, EmberDebug.assert)("Injected properties must be created through helpers, see '" + Object.keys(inject).map(function (k) {
      return "'inject." + k + "'";
    }).join(' or ') + "'"));
  };

  Ember.inject.service = _service.inject;
  Ember.inject.controller = _controller.inject;
  Ember.Array = _runtime.Array;
  Ember.Comparable = _runtime.Comparable;
  Ember.Enumerable = _runtime.Enumerable;
  Ember.ArrayProxy = _runtime.ArrayProxy;
  Ember.ObjectProxy = _runtime.ObjectProxy;
  Ember.ActionHandler = _runtime.ActionHandler;
  Ember.CoreObject = _runtime.CoreObject;
  Ember.NativeArray = _runtime.NativeArray;
  Ember.Copyable = _runtime.Copyable;
  Ember.MutableEnumerable = _runtime.MutableEnumerable;
  Ember.MutableArray = _runtime.MutableArray;
  Ember.TargetActionSupport = _runtime.TargetActionSupport;
  Ember.Evented = _runtime.Evented;
  Ember.PromiseProxyMixin = _runtime.PromiseProxyMixin;
  Ember.Observable = _runtime.Observable;
  Ember.typeOf = _runtime.typeOf;
  Ember.isArray = _runtime.isArray;
  Ember.Object = _runtime.Object;
  Ember.onLoad = _application.onLoad;
  Ember.runLoadHooks = _application.runLoadHooks;
  Ember.Controller = _controller.default;
  Ember.ControllerMixin = _controller_mixin.default;
  Ember.Service = _service.default;
  Ember._ProxyMixin = _runtime._ProxyMixin;
  Ember.RSVP = _runtime.RSVP;
  Ember.Namespace = _runtime.Namespace;
  Ember._action = _object.action;
  Ember._dependentKeyCompat = _compat.dependentKeyCompat;
  computed.empty = _computed.empty;
  computed.notEmpty = _computed.notEmpty;
  computed.none = _computed.none;
  computed.not = _computed.not;
  computed.bool = _computed.bool;
  computed.match = _computed.match;
  computed.equal = _computed.equal;
  computed.gt = _computed.gt;
  computed.gte = _computed.gte;
  computed.lt = _computed.lt;
  computed.lte = _computed.lte;
  computed.oneWay = _computed.oneWay;
  computed.reads = _computed.oneWay;
  computed.readOnly = _computed.readOnly;
  computed.deprecatingAlias = _computed.deprecatingAlias;
  computed.and = _computed.and;
  computed.or = _computed.or;
  computed.sum = _computed.sum;
  computed.min = _computed.min;
  computed.max = _computed.max;
  computed.map = _computed.map;
  computed.sort = _computed.sort;
  computed.setDiff = _computed.setDiff;
  computed.mapBy = _computed.mapBy;
  computed.filter = _computed.filter;
  computed.filterBy = _computed.filterBy;
  computed.uniq = _computed.uniq;
  computed.uniqBy = _computed.uniqBy;
  computed.union = _computed.union;
  computed.intersect = _computed.intersect;
  computed.collect = _computed.collect;
  /**
    Defines the hash of localized strings for the current language. Used by
    the `String.loc` helper. To localize, add string values to this
    hash.
  
    @property STRINGS
    @for Ember
    @type Object
    @private
  */

  Object.defineProperty(Ember, 'STRINGS', {
    configurable: false,
    get: _string._getStrings,
    set: _string._setStrings
  });
  /**
    Whether searching on the global for new Namespace instances is enabled.
  
    This is only exported here as to not break any addons.  Given the new
    visit API, you will have issues if you treat this as a indicator of
    booted.
  
    Internally this is only exposing a flag in Namespace.
  
    @property BOOTED
    @for Ember
    @type Boolean
    @private
  */

  Object.defineProperty(Ember, 'BOOTED', {
    configurable: false,
    enumerable: false,
    get: metal.isNamespaceSearchDisabled,
    set: metal.setNamespaceSearchDisabled
  }); // ****@ember/-internals/glimmer****

  Ember.Component = _glimmer.Component;
  _glimmer.Helper.helper = _glimmer.helper;
  Ember.Helper = _glimmer.Helper;
  Ember.Checkbox = _glimmer.Checkbox;
  Ember.TextField = _glimmer.TextField;
  Ember.TextArea = _glimmer.TextArea;
  Ember.LinkComponent = _glimmer.LinkComponent;
  Ember._setComponentManager = _glimmer.setComponentManager;
  Ember._componentManagerCapabilities = _glimmer.capabilities;
  Ember._setModifierManager = _glimmer.setModifierManager;
  Ember._modifierManagerCapabilities = _glimmer.modifierCapabilities;

  if (true
  /* EMBER_GLIMMER_SET_COMPONENT_TEMPLATE */
  ) {
      Ember._getComponentTemplate = _glimmer.getComponentTemplate;
      Ember._setComponentTemplate = _glimmer.setComponentTemplate;
      Ember._templateOnlyComponent = _templateOnly.default;
    }

  Ember._captureRenderTree = EmberDebug.captureRenderTree;
  Ember.Handlebars = {
    template: _glimmer.template,
    Utils: {
      escapeExpression: _glimmer.escapeExpression
    }
  };
  Ember.HTMLBars = {
    template: _glimmer.template
  };

  if (_environment.ENV.EXTEND_PROTOTYPES.String) {
    String.prototype.htmlSafe = function () {
      return (0, _glimmer.htmlSafe)(this);
    };
  }

  Ember.String.htmlSafe = _glimmer.htmlSafe;
  Ember.String.isHTMLSafe = _glimmer.isHTMLSafe;
  /**
    Global hash of shared templates. This will automatically be populated
    by the build tools so that you can store your Handlebars templates in
    separate files that get loaded into JavaScript at buildtime.
  
    @property TEMPLATES
    @for Ember
    @type Object
    @private
  */

  Object.defineProperty(Ember, 'TEMPLATES', {
    get: _glimmer.getTemplates,
    set: _glimmer.setTemplates,
    configurable: false,
    enumerable: false
  });
  /**
    The semantic version
  
    @property VERSION
    @type String
    @public
  */

  Ember.VERSION = _version.default; // ****@ember/-internals/views****

  if (_deprecatedFeatures.JQUERY_INTEGRATION && !views.jQueryDisabled) {
    Object.defineProperty(Ember, '$', {
      get: function get() {
        (false && !(false) && (0, EmberDebug.deprecate)("Using Ember.$() has been deprecated, use `import jQuery from 'jquery';` instead", false, {
          id: 'ember-views.curly-components.jquery-element',
          until: '4.0.0',
          url: 'https://emberjs.com/deprecations/v3.x#toc_jquery-apis'
        }));
        return views.jQuery;
      },
      configurable: true,
      enumerable: true
    });
  }

  Ember.ViewUtils = {
    isSimpleClick: views.isSimpleClick,
    getElementView: views.getElementView,
    getViewElement: views.getViewElement,
    getViewBounds: views.getViewBounds,
    getViewClientRects: views.getViewClientRects,
    getViewBoundingClientRect: views.getViewBoundingClientRect,
    getRootViews: views.getRootViews,
    getChildViews: views.getChildViews,
    isSerializationFirstNode: _glimmer.isSerializationFirstNode
  };
  Ember.TextSupport = views.TextSupport;
  Ember.ComponentLookup = views.ComponentLookup;
  Ember.EventDispatcher = views.EventDispatcher; // ****@ember/-internals/routing****

  Ember.Location = routing.Location;
  Ember.AutoLocation = routing.AutoLocation;
  Ember.HashLocation = routing.HashLocation;
  Ember.HistoryLocation = routing.HistoryLocation;
  Ember.NoneLocation = routing.NoneLocation;
  Ember.controllerFor = routing.controllerFor;
  Ember.generateControllerFactory = routing.generateControllerFactory;
  Ember.generateController = routing.generateController;
  Ember.RouterDSL = routing.RouterDSL;
  Ember.Router = routing.Router;
  Ember.Route = routing.Route;
  (0, _application.runLoadHooks)('Ember.Application', _application.default);
  Ember.DataAdapter = extensionSupport.DataAdapter;
  Ember.ContainerDebugAdapter = extensionSupport.ContainerDebugAdapter;

  if ((0, _require.has)('ember-template-compiler')) {
    (0, _require.default)("ember-template-compiler");
  } // do this to ensure that Ember.Test is defined properly on the global
  // if it is present.


  if ((0, _require.has)('ember-testing')) {
    var testing = (0, _require.default)("ember-testing");
    Ember.Test = testing.Test;
    Ember.Test.Adapter = testing.Adapter;
    Ember.Test.QUnitAdapter = testing.QUnitAdapter;
    Ember.setupForTesting = testing.setupForTesting;
  }

  (0, _application.runLoadHooks)('Ember');
  var _default = Ember;
  _exports.default = _default;

  if (_nodeModule.IS_NODE) {
    _nodeModule.module.exports = Ember;
  } else {
    _environment.context.exports.Ember = _environment.context.exports.Em = Ember;
  }
  /**
   @module jquery
   @public
   */

  /**
   @class jquery
   @public
   @static
   */

  /**
    Alias for jQuery
  
    @for jquery
    @method $
    @static
    @public
  */

});