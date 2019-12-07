define("ember-test-helpers/legacy-0-6-x/test-module", ["exports", "ember-test-helpers/legacy-0-6-x/abstract-test-module", "@ember/test-helpers", "ember-test-helpers/legacy-0-6-x/build-registry", "@ember/test-helpers/has-ember-version"], function (_exports, _abstractTestModule, _testHelpers, _buildRegistry, _hasEmberVersion) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  var _default =
  /*#__PURE__*/
  function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default(subjectName, description, callbacks) {
      var _this2;

      _classCallCheck(this, _default);

      // Allow `description` to be omitted, in which case it should
      // default to `subjectName`
      if (!callbacks && _typeof(description) === 'object') {
        callbacks = description;
        description = subjectName;
      }

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this, description || subjectName, callbacks));
      _this2.subjectName = subjectName;
      _this2.description = description || subjectName;
      _this2.resolver = _this2.callbacks.resolver || (0, _testHelpers.getResolver)();

      if (_this2.callbacks.integration && _this2.callbacks.needs) {
        throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
      }

      if (_this2.callbacks.integration) {
        _this2.initIntegration(callbacks);

        delete callbacks.integration;
      }

      _this2.initSubject();

      _this2.initNeeds();

      return _this2;
    }

    _createClass(_default, [{
      key: "initIntegration",
      value: function initIntegration(options) {
        if (options.integration === 'legacy') {
          throw new Error("`integration: 'legacy'` is only valid for component tests.");
        }

        this.isIntegration = true;
      }
    }, {
      key: "initSubject",
      value: function initSubject() {
        this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
      }
    }, {
      key: "initNeeds",
      value: function initNeeds() {
        this.needs = [this.subjectName];

        if (this.callbacks.needs) {
          this.needs = this.needs.concat(this.callbacks.needs);
          delete this.callbacks.needs;
        }
      }
    }, {
      key: "initSetupSteps",
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContainer);
        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);
        this.setupSteps.push(this.setupPromiseListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: "initTeardownSteps",
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownSubject);
        this.teardownSteps.push(this.teardownContainer);
        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);
        this.teardownSteps.push(this.teardownPromiseListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: "setupContainer",
      value: function setupContainer() {
        if (this.isIntegration || this.isLegacy) {
          this._setupIntegratedContainer();
        } else {
          this._setupIsolatedContainer();
        }
      }
    }, {
      key: "setupContext",
      value: function setupContext() {
        var subjectName = this.subjectName;
        var container = this.container;

        var factory = function factory() {
          return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
        };

        _get(_getPrototypeOf(_default.prototype), "setupContext", this).call(this, {
          container: this.container,
          registry: this.registry,
          factory: factory,
          register: function register() {
            var target = this.registry || this.container;
            return target.register.apply(target, arguments);
          }
        });

        if (Ember.setOwner) {
          Ember.setOwner(this.context, this.container.owner);
        }

        this.setupInject();
      }
    }, {
      key: "setupInject",
      value: function setupInject() {
        var module = this;
        var context = this.context;

        if (Ember.inject) {
          var keys = (Object.keys || keys)(Ember.inject);
          keys.forEach(function (typeName) {
            context.inject[typeName] = function (name, opts) {
              var alias = opts && opts.as || name;
              Ember.run(function () {
                Ember.set(context, alias, module.container.lookup(typeName + ':' + name));
              });
            };
          });
        }
      }
    }, {
      key: "teardownSubject",
      value: function teardownSubject() {
        var subject = this.cache.subject;

        if (subject) {
          Ember.run(function () {
            Ember.tryInvoke(subject, 'destroy');
          });
        }
      }
    }, {
      key: "teardownContainer",
      value: function teardownContainer() {
        var container = this.container;
        Ember.run(function () {
          container.destroy();
        });
      }
    }, {
      key: "defaultSubject",
      value: function defaultSubject(options, factory) {
        return factory.create(options);
      } // allow arbitrary named factories, like rspec let

    }, {
      key: "contextualizeCallbacks",
      value: function contextualizeCallbacks() {
        var callbacks = this.callbacks;
        var context = this.context;
        this.cache = this.cache || {};
        this.cachedCalls = this.cachedCalls || {};
        var keys = (Object.keys || keys)(callbacks);
        var keysLength = keys.length;

        if (keysLength) {
          var deprecatedContext = this._buildDeprecatedContext(this, context);

          for (var i = 0; i < keysLength; i++) {
            this._contextualizeCallback(context, keys[i], deprecatedContext);
          }
        }
      }
    }, {
      key: "_contextualizeCallback",
      value: function _contextualizeCallback(context, key, callbackContext) {
        var _this = this;

        var callbacks = this.callbacks;
        var factory = context.factory;

        context[key] = function (options) {
          if (_this.cachedCalls[key]) {
            return _this.cache[key];
          }

          var result = callbacks[key].call(callbackContext, options, factory());
          _this.cache[key] = result;
          _this.cachedCalls[key] = true;
          return result;
        };
      }
      /*
        Builds a version of the passed in context that contains deprecation warnings
        for accessing properties that exist on the module.
      */

    }, {
      key: "_buildDeprecatedContext",
      value: function _buildDeprecatedContext(module, context) {
        var deprecatedContext = Object.create(context);
        var keysForDeprecation = Object.keys(module);

        for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
          this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
        }

        return deprecatedContext;
      }
      /*
        Defines a key on an object to act as a proxy for deprecating the original.
      */

    }, {
      key: "_proxyDeprecation",
      value: function _proxyDeprecation(obj, proxy, key) {
        if (typeof proxy[key] === 'undefined') {
          Object.defineProperty(proxy, key, {
            get: function get() {
              (false && !(false) && Ember.deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, {
                id: 'ember-test-helpers.test-module.callback-context',
                until: '0.6.0'
              }));
              return obj[key];
            }
          });
        }
      }
    }, {
      key: "_setupContainer",
      value: function _setupContainer(isolated) {
        var resolver = this.resolver;
        var items = (0, _buildRegistry.default)(!isolated ? resolver : Object.create(resolver, {
          resolve: {
            value: function value() {}
          }
        }));
        this.container = items.container;
        this.registry = items.registry;

        if ((0, _hasEmberVersion.default)(1, 13)) {
          var thingToRegisterWith = this.registry || this.container;
          var router = resolver.resolve('router:main');
          router = router || Ember.Router.extend();
          thingToRegisterWith.register('router:main', router);
        }
      }
    }, {
      key: "_setupIsolatedContainer",
      value: function _setupIsolatedContainer() {
        var resolver = this.resolver;

        this._setupContainer(true);

        var thingToRegisterWith = this.registry || this.container;

        for (var i = this.needs.length; i > 0; i--) {
          var fullName = this.needs[i - 1];
          var normalizedFullName = resolver.normalize(fullName);
          thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
        }

        if (!this.registry) {
          this.container.resolver = function () {};
        }
      }
    }, {
      key: "_setupIntegratedContainer",
      value: function _setupIntegratedContainer() {
        this._setupContainer();
      }
    }]);

    return _default;
  }(_abstractTestModule.default);

  _exports.default = _default;
});