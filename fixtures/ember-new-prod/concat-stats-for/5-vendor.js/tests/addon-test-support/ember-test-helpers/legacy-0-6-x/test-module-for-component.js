define("ember-test-helpers/legacy-0-6-x/test-module-for-component", ["exports", "ember-test-helpers/legacy-0-6-x/test-module", "ember-test-helpers/has-ember-version", "ember-test-helpers/legacy-0-6-x/-legacy-overrides"], function (_exports, _testModule, _hasEmberVersion, _legacyOverrides) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setupComponentIntegrationTest = _setupComponentIntegrationTest;
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

  var ACTION_KEY;

  if ((0, _hasEmberVersion.default)(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  var isPreGlimmer = !(0, _hasEmberVersion.default)(1, 13);

  var _default =
  /*#__PURE__*/
  function (_TestModule) {
    _inherits(_default, _TestModule);

    function _default(componentName, description, callbacks) {
      var _this2;

      _classCallCheck(this, _default);

      // Allow `description` to be omitted
      if (!callbacks && _typeof(description) === 'object') {
        callbacks = description;
        description = null;
      } else if (!callbacks) {
        callbacks = {};
      }

      var integrationOption = callbacks.integration;
      var hasNeeds = Array.isArray(callbacks.needs);
      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this, 'component:' + componentName, description, callbacks));
      _this2.componentName = componentName;

      if (hasNeeds || callbacks.unit || integrationOption === false) {
        _this2.isUnitTest = true;
      } else if (integrationOption) {
        _this2.isUnitTest = false;
      } else {
        (false && !(false) && Ember.deprecate('the component:' + componentName + ' test module is implicitly running in unit test mode, ' + 'which will change to integration test mode by default in an upcoming version of ' + 'ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit ' + 'test mode.', false, {
          id: 'ember-test-helpers.test-module-for-component.test-type',
          until: '0.6.0'
        }));
        _this2.isUnitTest = true;
      }

      if (!_this2.isUnitTest && !_this2.isLegacy) {
        callbacks.integration = true;
      }

      if (_this2.isUnitTest || _this2.isLegacy) {
        _this2.setupSteps.push(_this2.setupComponentUnitTest);
      } else {
        _this2.callbacks.subject = function () {
          throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/current/testing/testing-components/");
        };

        _this2.setupSteps.push(_this2.setupComponentIntegrationTest);

        _this2.teardownSteps.unshift(_this2.teardownComponent);
      }

      if (Ember.View && Ember.View.views) {
        _this2.setupSteps.push(_this2._aliasViewRegistry);

        _this2.teardownSteps.unshift(_this2._resetViewRegistry);
      }

      return _this2;
    }

    _createClass(_default, [{
      key: "initIntegration",
      value: function initIntegration(options) {
        this.isLegacy = options.integration === 'legacy';
        this.isIntegration = options.integration !== 'legacy';
      }
    }, {
      key: "_aliasViewRegistry",
      value: function _aliasViewRegistry() {
        this._originalGlobalViewRegistry = Ember.View.views;
        var viewRegistry = this.container.lookup('-view-registry:main');

        if (viewRegistry) {
          Ember.View.views = viewRegistry;
        }
      }
    }, {
      key: "_resetViewRegistry",
      value: function _resetViewRegistry() {
        Ember.View.views = this._originalGlobalViewRegistry;
      }
    }, {
      key: "setupComponentUnitTest",
      value: function setupComponentUnitTest() {
        var _this = this;

        var resolver = this.resolver;
        var context = this.context;
        var layoutName = 'template:components/' + this.componentName;
        var layout = resolver.resolve(layoutName);
        var thingToRegisterWith = this.registry || this.container;

        if (layout) {
          thingToRegisterWith.register(layoutName, layout);
          thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
        }

        var eventDispatcher = resolver.resolve('event_dispatcher:main');

        if (eventDispatcher) {
          thingToRegisterWith.register('event_dispatcher:main', eventDispatcher);
        }

        context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
        context.dispatcher.setup({}, '#ember-testing');
        context._element = null;

        this.callbacks.render = function () {
          var subject;
          Ember.run(function () {
            subject = context.subject();
            subject.appendTo('#ember-testing');
          });
          context._element = subject.element;

          _this.teardownSteps.unshift(function () {
            Ember.run(function () {
              Ember.tryInvoke(subject, 'destroy');
            });
          });
        };

        this.callbacks.append = function () {
          (false && !(false) && Ember.deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.', false, {
            id: 'ember-test-helpers.test-module-for-component.append',
            until: '0.6.0'
          }));
          return context.$();
        };

        context.$ = function () {
          this.render();
          var subject = this.subject();
          return subject.$.apply(subject, arguments);
        };
      }
    }, {
      key: "setupComponentIntegrationTest",
      value: function setupComponentIntegrationTest() {
        if (isPreGlimmer) {
          return _legacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
        } else {
          return _setupComponentIntegrationTest.apply(this, arguments);
        }
      }
    }, {
      key: "setupContext",
      value: function setupContext() {
        _get(_getPrototypeOf(_default.prototype), "setupContext", this).call(this); // only setup the injection if we are running against a version
        // of Ember that has `-view-registry:main` (Ember >= 1.12)


        if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
          (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
        }

        if (!this.isUnitTest && !this.isLegacy) {
          this.context.factory = function () {};
        }
      }
    }, {
      key: "teardownComponent",
      value: function teardownComponent() {
        var component = this.component;

        if (component) {
          Ember.run(component, 'destroy');
          this.component = null;
        }
      }
    }]);

    return _default;
  }(_testModule.default);

  _exports.default = _default;

  function getOwnerFromModule(module) {
    return Ember.getOwner && Ember.getOwner(module.container) || module.container.owner;
  }

  function lookupTemplateFromModule(module, templateFullName) {
    var template = module.container.lookup(templateFullName);
    if (typeof template === 'function') template = template(getOwnerFromModule(module));
    return template;
  }

  function _setupComponentIntegrationTest() {
    var module = this;
    var context = this.context;
    this.actionHooks = context[ACTION_KEY] = {};
    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    var hasRendered = false;
    var OutletView = module.container.factoryFor ? module.container.factoryFor('view:-outlet') : module.container.lookupFactory('view:-outlet');
    var OutletTemplate = lookupTemplateFromModule(module, 'template:-outlet');
    var toplevelView = module.component = OutletView.create();
    var hasOutletTemplate = !!OutletTemplate;
    var outletState = {
      render: {
        owner: getOwnerFromModule(module),
        into: undefined,
        outlet: 'main',
        name: 'application',
        controller: module.context,
        ViewClass: undefined,
        template: OutletTemplate
      },
      outlets: {}
    };
    var element = document.getElementById('ember-testing');
    var templateId = 0;

    if (hasOutletTemplate) {
      Ember.run(function () {
        toplevelView.setOutletState(outletState);
      });
    }

    context.render = function (template) {
      if (!template) {
        throw new Error('in a component integration test you must pass a template to `render()`');
      }

      if (Ember.isArray(template)) {
        template = template.join('');
      }

      if (typeof template === 'string') {
        template = Ember.Handlebars.compile(template);
      }

      var templateFullName = 'template:-undertest-' + ++templateId;
      this.registry.register(templateFullName, template);
      var stateToRender = {
        owner: getOwnerFromModule(module),
        into: undefined,
        outlet: 'main',
        name: 'index',
        controller: module.context,
        ViewClass: undefined,
        template: lookupTemplateFromModule(module, templateFullName),
        outlets: {}
      };

      if (hasOutletTemplate) {
        stateToRender.name = 'index';
        outletState.outlets.main = {
          render: stateToRender,
          outlets: {}
        };
      } else {
        stateToRender.name = 'application';
        outletState = {
          render: stateToRender,
          outlets: {}
        };
      }

      Ember.run(function () {
        toplevelView.setOutletState(outletState);
      });

      if (!hasRendered) {
        Ember.run(module.component, 'appendTo', '#ember-testing');
        hasRendered = true;
      }

      if (EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        context._element = element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context._element = element = document.querySelector('#ember-testing');
      }
    };

    context.$ = function (selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? jQuery(selector, element) : jQuery(element);
    };

    context.set = function (key, value) {
      var ret = Ember.run(function () {
        return Ember.set(context, key, value);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = Ember.run(function () {
        return Ember.setProperties(context, hash);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return Ember.get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return Ember.getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];

      if (!hook) {
        throw new Error('integration testing template received unexpected action ' + actionName);
      }

      hook.apply(module.context, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      Ember.run(function () {
        toplevelView.setOutletState({
          render: {
            owner: module.container,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: module.context,
            ViewClass: undefined,
            template: undefined
          },
          outlets: {}
        });
      });
    };
  }
});