define("@ember/test-helpers/teardown-rendering-context", ["exports", "@ember/test-helpers/setup-rendering-context", "@ember/test-helpers/-utils", "@ember/test-helpers/settled"], function (_exports, _setupRenderingContext, _utils, _settled) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = teardownRenderingContext;

  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - resetting the `ember-testing-container` to its original state (the value
      when `setupRenderingContext` was called).
  
    @public
    @param {Object} context the context to setup
    @param {Object} [options] options used to override defaults
    @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
    @returns {Promise<void>} resolves when settled
  */
  function teardownRenderingContext(context, options) {
    let waitForSettled = true;

    if (options !== undefined && 'waitForSettled' in options) {
      waitForSettled = options.waitForSettled;
    }

    return (0, _utils.nextTickPromise)().then(() => {
      let contextGuid = Ember.guidFor(context);
      (0, _utils.runDestroyablesFor)(_setupRenderingContext.RENDERING_CLEANUP, contextGuid);

      if (waitForSettled) {
        return (0, _settled.default)();
      }

      return (0, _utils.nextTickPromise)();
    });
  }
});