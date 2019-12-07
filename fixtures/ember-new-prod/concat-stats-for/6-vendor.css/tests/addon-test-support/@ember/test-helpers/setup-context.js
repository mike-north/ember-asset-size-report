define("@ember/test-helpers/setup-context", ["exports", "@ember/test-helpers/build-owner", "@ember/test-helpers/settled", "@ember/test-helpers/global", "@ember/test-helpers/resolver", "@ember/test-helpers/application", "@ember/test-helpers/-utils", "@ember/test-helpers/test-metadata"], function (_exports, _buildOwner, _settled, _global, _resolver, _application, _utils, _testMetadata) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isTestContext = isTestContext;
  _exports.setContext = setContext;
  _exports.getContext = getContext;
  _exports.unsetContext = unsetContext;
  _exports.pauseTest = pauseTest;
  _exports.resumeTest = resumeTest;
  _exports.default = setupContext;
  _exports.CLEANUP = void 0;

  // eslint-disable-next-line require-jsdoc
  function isTestContext(context) {
    return typeof context.pauseTest === 'function' && typeof context.resumeTest === 'function';
  }

  var __test_context__;
  /**
    Stores the provided context as the "global testing context".
  
    Generally setup automatically by `setupContext`.
  
    @public
    @param {Object} context the context to use
  */


  function setContext(context) {
    __test_context__ = context;
  }
  /**
    Retrive the "global testing context" as stored by `setContext`.
  
    @public
    @returns {Object} the previously stored testing context
  */


  function getContext() {
    return __test_context__;
  }
  /**
    Clear the "global testing context".
  
    Generally invoked from `teardownContext`.
  
    @public
  */


  function unsetContext() {
    __test_context__ = undefined;
  }
  /**
   * Returns a promise to be used to pauses the current test (due to being
   * returned from the test itself).  This is useful for debugging while testing
   * or for test-driving.  It allows you to inspect the state of your application
   * at any point.
   *
   * The test framework wrapper (e.g. `ember-qunit` or `ember-mocha`) should
   * ensure that when `pauseTest()` is used, any framework specific test timeouts
   * are disabled.
   *
   * @public
   * @returns {Promise<void>} resolves _only_ when `resumeTest()` is invoked
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { setupRenderingTest } from 'ember-qunit';
   * import { render, click, pauseTest } from '@ember/test-helpers';
   *
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', async function(assert) {
   *     await render(hbs`{{awesome-sauce}}`);
   *
   *     // added here to visualize / interact with the DOM prior
   *     // to the interaction below
   *     await pauseTest();
   *
   *     click('.some-selector');
   *
   *     assert.equal(this.element.textContent, 'this sauce is awesome!');
   *   });
   * });
   */


  function pauseTest() {
    var context = getContext();

    if (!context || !isTestContext(context)) {
      throw new Error('Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    return context.pauseTest();
  }
  /**
    Resumes a test previously paused by `await pauseTest()`.
  
    @public
  */


  function resumeTest() {
    var context = getContext();

    if (!context || !isTestContext(context)) {
      throw new Error('Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    context.resumeTest();
  }

  var CLEANUP = Object.create(null);
  /**
    Used by test framework addons to setup the provided context for testing.
  
    Responsible for:
  
    - sets the "global testing context" to the provided context (`setContext`)
    - create an owner object and set it on the provided context (e.g. `this.owner`)
    - setup `this.set`, `this.setProperties`, `this.get`, and `this.getProperties` to the provided context
    - setting up AJAX listeners
    - setting up `pauseTest` (also available as `this.pauseTest()`) and `resumeTest` helpers
  
    @public
    @param {Object} context the context to setup
    @param {Object} [options] options used to override defaults
    @param {Resolver} [options.resolver] a resolver to use for customizing normal resolution
    @returns {Promise<Object>} resolves with the context that was setup
  */

  _exports.CLEANUP = CLEANUP;

  function setupContext(context) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    Ember.testing = true;
    setContext(context);
    var contextGuid = Ember.guidFor(context);
    CLEANUP[contextGuid] = [];
    var testMetadata = (0, _testMetadata.default)(context);
    testMetadata.setupTypes.push('setupContext');
    Ember.run.backburner.DEBUG = true;
    return (0, _utils.nextTickPromise)().then(function () {
      var application = (0, _application.getApplication)();

      if (application) {
        return application.boot().then(function () {});
      }

      return;
    }).then(function () {
      var testElementContainer = document.getElementById('ember-testing-container'); // TODO remove "!"

      var fixtureResetValue = testElementContainer.innerHTML; // push this into the final cleanup bucket, to be ran _after_ the owner
      // is destroyed and settled (e.g. flushed run loops, etc)

      CLEANUP[contextGuid].push(function () {
        testElementContainer.innerHTML = fixtureResetValue;
      });
      var resolver = options.resolver; // This handles precendence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...

      if (resolver) {
        return (0, _buildOwner.default)(null, resolver);
      }

      return (0, _buildOwner.default)((0, _application.getApplication)(), (0, _resolver.getResolver)());
    }).then(function (owner) {
      Object.defineProperty(context, 'owner', {
        configurable: true,
        enumerable: true,
        value: owner,
        writable: false
      });
      Object.defineProperty(context, 'set', {
        configurable: true,
        enumerable: true,
        value: function value(key, _value) {
          var ret = Ember.run(function () {
            return Ember.set(context, key, _value);
          });
          return ret;
        },
        writable: false
      });
      Object.defineProperty(context, 'setProperties', {
        configurable: true,
        enumerable: true,
        value: function value(hash) {
          var ret = Ember.run(function () {
            return Ember.setProperties(context, hash);
          });
          return ret;
        },
        writable: false
      });
      Object.defineProperty(context, 'get', {
        configurable: true,
        enumerable: true,
        value: function value(key) {
          return Ember.get(context, key);
        },
        writable: false
      });
      Object.defineProperty(context, 'getProperties', {
        configurable: true,
        enumerable: true,
        value: function value() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return Ember.getProperties(context, args);
        },
        writable: false
      });
      var resume;

      context.resumeTest = function resumeTest() {
        (false && !(Boolean(resume)) && Ember.assert('Testing has not been paused. There is nothing to resume.', Boolean(resume)));
        resume();
        _global.default.resumeTest = resume = undefined;
      };

      context.pauseTest = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new Ember.RSVP.Promise(function (resolve) {
          resume = resolve;
          _global.default.resumeTest = resumeTest;
        }, 'TestAdapter paused promise');
      };

      (0, _settled._setupAJAXHooks)();
      return context;
    });
  }
});