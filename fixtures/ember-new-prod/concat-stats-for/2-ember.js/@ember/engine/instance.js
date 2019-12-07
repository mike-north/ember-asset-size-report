define("@ember/engine/instance", ["exports", "ember-babel", "@ember/-internals/utils", "@ember/-internals/runtime", "@ember/debug", "@ember/error", "@ember/-internals/container", "@ember/engine/lib/engine-parent"], function (_exports, _emberBabel, _utils, _runtime, _debug, _error, _container, _engineParent) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _templateObject2() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["template-compiler:main"]);

    _templateObject2 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _templateObject() {
    var data = (0, _emberBabel.taggedTemplateLiteralLoose)(["-bucket-cache:main"]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  /**
    The `EngineInstance` encapsulates all of the stateful aspects of a
    running `Engine`.
  
    @public
    @class EngineInstance
    @extends EmberObject
    @uses RegistryProxyMixin
    @uses ContainerProxyMixin
  */
  var EngineInstance = _runtime.Object.extend(_runtime.RegistryProxyMixin, _runtime.ContainerProxyMixin, {
    /**
      The base `Engine` for which this is an instance.
       @property {Engine} engine
      @private
    */
    base: null,
    init: function init() {
      this._super.apply(this, arguments);

      (0, _utils.guidFor)(this);
      var base = this.base;

      if (!base) {
        base = this.application;
        this.base = base;
      } // Create a per-instance registry that will use the application's registry
      // as a fallback for resolving registrations.


      var registry = this.__registry__ = new _container.Registry({
        fallback: base.__registry__
      }); // Create a per-instance container from the instance's registry

      this.__container__ = registry.container({
        owner: this
      });
      this._booted = false;
    },

    /**
      Initialize the `EngineInstance` and return a promise that resolves
      with the instance itself when the boot process is complete.
       The primary task here is to run any registered instance initializers.
       See the documentation on `BootOptions` for the options it takes.
       @public
      @method boot
      @param options {Object}
      @return {Promise<EngineInstance,Error>}
    */
    boot: function boot(options) {
      var _this = this;

      if (this._bootPromise) {
        return this._bootPromise;
      }

      this._bootPromise = new _runtime.RSVP.Promise(function (resolve) {
        return resolve(_this._bootSync(options));
      });
      return this._bootPromise;
    },

    /**
      Unfortunately, a lot of existing code assumes booting an instance is
      synchronous – specifically, a lot of tests assume the last call to
      `app.advanceReadiness()` or `app.reset()` will result in a new instance
      being fully-booted when the current runloop completes.
       We would like new code (like the `visit` API) to stop making this
      assumption, so we created the asynchronous version above that returns a
      promise. But until we have migrated all the code, we would have to expose
      this method for use *internally* in places where we need to boot an instance
      synchronously.
       @private
    */
    _bootSync: function _bootSync(options) {
      if (this._booted) {
        return this;
      }

      (false && !((0, _engineParent.getEngineParent)(this)) && (0, _debug.assert)("An engine instance's parent must be set via `setEngineParent(engine, parent)` prior to calling `engine.boot()`.", (0, _engineParent.getEngineParent)(this)));
      this.cloneParentDependencies();
      this.setupRegistry(options);
      this.base.runInstanceInitializers(this);
      this._booted = true;
      return this;
    },
    setupRegistry: function setupRegistry(options) {
      if (options === void 0) {
        options = this.__container__.lookup('-environment:main');
      }

      this.constructor.setupRegistry(this.__registry__, options);
    },

    /**
     Unregister a factory.
      Overrides `RegistryProxy#unregister` in order to clear any cached instances
     of the unregistered factory.
      @public
     @method unregister
     @param {String} fullName
     */
    unregister: function unregister(fullName) {
      this.__container__.reset(fullName);

      this._super.apply(this, arguments);
    },

    /**
      Build a new `EngineInstance` that's a child of this instance.
       Engines must be registered by name with their parent engine
      (or application).
       @private
      @method buildChildEngineInstance
      @param name {String} the registered name of the engine.
      @param options {Object} options provided to the engine instance.
      @return {EngineInstance,Error}
    */
    buildChildEngineInstance: function buildChildEngineInstance(name, options) {
      if (options === void 0) {
        options = {};
      }

      var Engine = this.lookup("engine:" + name);

      if (!Engine) {
        throw new _error.default("You attempted to mount the engine '" + name + "', but it is not registered with its parent.");
      }

      var engineInstance = Engine.buildInstance(options);
      (0, _engineParent.setEngineParent)(engineInstance, this);
      return engineInstance;
    },

    /**
      Clone dependencies shared between an engine instance and its parent.
       @private
      @method cloneParentDependencies
    */
    cloneParentDependencies: function cloneParentDependencies() {
      var _this2 = this;

      var parent = (0, _engineParent.getEngineParent)(this);
      var registrations = ['route:basic', 'service:-routing', 'service:-glimmer-environment'];
      registrations.forEach(function (key) {
        return _this2.register(key, parent.resolveRegistration(key));
      });
      var env = parent.lookup('-environment:main');
      this.register('-environment:main', env, {
        instantiate: false
      });
      var singletons = ['router:main', (0, _container.privatize)(_templateObject()), '-view-registry:main', "renderer:-" + (env.isInteractive ? 'dom' : 'inert'), 'service:-document', (0, _container.privatize)(_templateObject2())];

      if (env.isInteractive) {
        singletons.push('event_dispatcher:main');
      }

      singletons.forEach(function (key) {
        return _this2.register(key, parent.lookup(key), {
          instantiate: false
        });
      });
      this.inject('view', '_environment', '-environment:main');
      this.inject('route', '_environment', '-environment:main');
    }
  });

  EngineInstance.reopenClass({
    /**
     @private
     @method setupRegistry
     @param {Registry} registry
     @param {BootOptions} options
     */
    setupRegistry: function setupRegistry(registry, options) {
      // when no options/environment is present, do nothing
      if (!options) {
        return;
      }

      registry.injection('view', '_environment', '-environment:main');
      registry.injection('route', '_environment', '-environment:main');

      if (options.isInteractive) {
        registry.injection('view', 'renderer', 'renderer:-dom');
        registry.injection('component', 'renderer', 'renderer:-dom');
      } else {
        registry.injection('view', 'renderer', 'renderer:-inert');
        registry.injection('component', 'renderer', 'renderer:-inert');
      }
    }
  });
  var _default = EngineInstance;
  _exports.default = _default;
});