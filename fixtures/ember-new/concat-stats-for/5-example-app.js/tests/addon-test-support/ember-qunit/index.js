define("ember-qunit/index", ["exports", "ember-qunit/legacy-2-x/module-for", "ember-qunit/legacy-2-x/module-for-component", "ember-qunit/legacy-2-x/module-for-model", "ember-qunit/adapter", "qunit", "ember-qunit/test-loader", "@ember/test-helpers", "ember-qunit/test-isolation-validation"], function (_exports, _moduleFor, _moduleForComponent, _moduleForModel, _adapter, _qunit, _testLoader, _testHelpers, _testIsolationValidation) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setupTest = setupTest;
  _exports.setupRenderingTest = setupRenderingTest;
  _exports.setupApplicationTest = setupApplicationTest;
  _exports.setupTestContainer = setupTestContainer;
  _exports.startTests = startTests;
  _exports.setupTestAdapter = setupTestAdapter;
  _exports.setupEmberTesting = setupEmberTesting;
  _exports.setupEmberOnerrorValidation = setupEmberOnerrorValidation;
  _exports.setupResetOnerror = setupResetOnerror;
  _exports.setupTestIsolationValidation = setupTestIsolationValidation;
  _exports.start = start;
  Object.defineProperty(_exports, "moduleFor", {
    enumerable: true,
    get: function () {
      return _moduleFor.default;
    }
  });
  Object.defineProperty(_exports, "moduleForComponent", {
    enumerable: true,
    get: function () {
      return _moduleForComponent.default;
    }
  });
  Object.defineProperty(_exports, "moduleForModel", {
    enumerable: true,
    get: function () {
      return _moduleForModel.default;
    }
  });
  Object.defineProperty(_exports, "QUnitAdapter", {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(_exports, "nonTestDoneCallback", {
    enumerable: true,
    get: function () {
      return _adapter.nonTestDoneCallback;
    }
  });
  Object.defineProperty(_exports, "module", {
    enumerable: true,
    get: function () {
      return _qunit.module;
    }
  });
  Object.defineProperty(_exports, "test", {
    enumerable: true,
    get: function () {
      return _qunit.test;
    }
  });
  Object.defineProperty(_exports, "skip", {
    enumerable: true,
    get: function () {
      return _qunit.skip;
    }
  });
  Object.defineProperty(_exports, "only", {
    enumerable: true,
    get: function () {
      return _qunit.only;
    }
  });
  Object.defineProperty(_exports, "todo", {
    enumerable: true,
    get: function () {
      return _qunit.todo;
    }
  });
  Object.defineProperty(_exports, "loadTests", {
    enumerable: true,
    get: function () {
      return _testLoader.loadTests;
    }
  });
  let waitForSettled = true;

  function setupTest(hooks, _options) {
    let options = _options === undefined ? {
      waitForSettled
    } : Ember.assign({
      waitForSettled
    }, _options);
    hooks.beforeEach(function (assert) {
      let testMetadata = (0, _testHelpers.getTestMetadata)(this);
      testMetadata.framework = 'qunit';
      return (0, _testHelpers.setupContext)(this, options).then(() => {
        let originalPauseTest = this.pauseTest;

        this.pauseTest = function QUnit_pauseTest() {
          assert.timeout(-1); // prevent the test from timing out
          // This is a temporary work around for
          // https://github.com/emberjs/ember-qunit/issues/496 this clears the
          // timeout that would fail the test when it hits the global testTimeout
          // value.

          clearTimeout(_qunit.default.config.timeout);
          return originalPauseTest.call(this);
        };
      });
    });
    hooks.afterEach(function () {
      return (0, _testHelpers.teardownContext)(this, options);
    });
  }

  function setupRenderingTest(hooks, _options) {
    let options = _options === undefined ? {
      waitForSettled
    } : Ember.assign({
      waitForSettled
    }, _options);
    setupTest(hooks, options);
    hooks.beforeEach(function () {
      return (0, _testHelpers.setupRenderingContext)(this);
    });
    hooks.afterEach(function () {
      return (0, _testHelpers.teardownRenderingContext)(this, options);
    });
  }

  function setupApplicationTest(hooks, _options) {
    let options = _options === undefined ? {
      waitForSettled
    } : Ember.assign({
      waitForSettled
    }, _options);
    setupTest(hooks, options);
    hooks.beforeEach(function () {
      return (0, _testHelpers.setupApplicationContext)(this);
    });
    hooks.afterEach(function () {
      return (0, _testHelpers.teardownApplicationContext)(this, options);
    });
  }
  /**
     Uses current URL configuration to setup the test container.
  
     * If `?nocontainer` is set, the test container will be hidden.
     * If `?dockcontainer` or `?devmode` are set the test container will be
       absolutely positioned.
     * If `?devmode` is set, the test container will be made full screen.
  
     @method setupTestContainer
   */


  function setupTestContainer() {
    let testContainer = document.getElementById('ember-testing-container');

    if (!testContainer) {
      return;
    }

    let params = _qunit.default.urlParams;
    let containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    let containerPosition = params.dockcontainer || params.devmode ? 'fixed' : 'relative';

    if (params.devmode) {
      testContainer.className = ' full-screen';
    }

    testContainer.style.visibility = containerVisibility;
    testContainer.style.position = containerPosition;
    let qunitContainer = document.getElementById('qunit');

    if (params.dockcontainer) {
      qunitContainer.style.marginBottom = window.getComputedStyle(testContainer).height;
    }
  }
  /**
     Instruct QUnit to start the tests.
     @method startTests
   */


  function startTests() {
    _qunit.default.start();
  }
  /**
     Sets up the `Ember.Test` adapter for usage with QUnit 2.x.
  
     @method setupTestAdapter
   */


  function setupTestAdapter() {
    Ember.Test.adapter = _adapter.default.create();
  }
  /**
    Ensures that `Ember.testing` is set to `true` before each test begins
    (including `before` / `beforeEach`), and reset to `false` after each test is
    completed. This is done via `QUnit.testStart` and `QUnit.testDone`.
  
   */


  function setupEmberTesting() {
    _qunit.default.testStart(() => {
      Ember.testing = true;
    });

    _qunit.default.testDone(() => {
      Ember.testing = false;
    });
  }
  /**
    Ensures that `Ember.onerror` (if present) is properly configured to re-throw
    errors that occur while `Ember.testing` is `true`.
  */


  function setupEmberOnerrorValidation() {
    _qunit.default.module('ember-qunit: Ember.onerror validation', function () {
      _qunit.default.test('Ember.onerror is functioning properly', function (assert) {
        assert.expect(1);
        let result = (0, _testHelpers.validateErrorHandler)();
        assert.ok(result.isValid, `Ember.onerror handler with invalid testing behavior detected. An Ember.onerror handler _must_ rethrow exceptions when \`Ember.testing\` is \`true\` or the test suite is unreliable. See https://git.io/vbine for more details.`);
      });
    });
  }

  function setupResetOnerror() {
    _qunit.default.testDone(_testHelpers.resetOnerror);
  }

  function setupTestIsolationValidation(delay) {
    waitForSettled = false;
    Ember.run.backburner.DEBUG = true;

    _qunit.default.on('testStart', () => (0, _testIsolationValidation.installTestNotIsolatedHook)(delay));
  }
  /**
     @method start
     @param {Object} [options] Options to be used for enabling/disabling behaviors
     @param {Boolean} [options.loadTests] If `false` tests will not be loaded automatically.
     @param {Boolean} [options.setupTestContainer] If `false` the test container will not
     be setup based on `devmode`, `dockcontainer`, or `nocontainer` URL params.
     @param {Boolean} [options.startTests] If `false` tests will not be automatically started
     (you must run `QUnit.start()` to kick them off).
     @param {Boolean} [options.setupTestAdapter] If `false` the default Ember.Test adapter will
     not be updated.
     @param {Boolean} [options.setupEmberTesting] `false` opts out of the
     default behavior of setting `Ember.testing` to `true` before all tests and
     back to `false` after each test will.
     @param {Boolean} [options.setupEmberOnerrorValidation] If `false` validation
     of `Ember.onerror` will be disabled.
     @param {Boolean} [options.setupTestIsolationValidation] If `false` test isolation validation
     will be disabled.
     @param {Number} [options.testIsolationValidationDelay] When using
     setupTestIsolationValidation this number represents the maximum amount of
     time in milliseconds that is allowed _after_ the test is completed for all
     async to have been completed. The default value is 50.
   */


  function start(options = {}) {
    if (options.loadTests !== false) {
      (0, _testLoader.loadTests)();
    }

    if (options.setupTestContainer !== false) {
      setupTestContainer();
    }

    if (options.setupTestAdapter !== false) {
      setupTestAdapter();
    }

    if (options.setupEmberTesting !== false) {
      setupEmberTesting();
    }

    if (options.setupEmberOnerrorValidation !== false) {
      setupEmberOnerrorValidation();
    }

    if (typeof options.setupTestIsolationValidation !== 'undefined' && options.setupTestIsolationValidation !== false) {
      setupTestIsolationValidation(options.testIsolationValidationDelay);
    }

    if (options.startTests !== false) {
      startTests();
    }

    setupResetOnerror();
  }
});