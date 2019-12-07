define("@ember/test-helpers/teardown-context", ["exports", "@ember/test-helpers/settled", "@ember/test-helpers/setup-context", "@ember/test-helpers/-utils"], function (_exports, _settled, _setupContext, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = teardownContext;

  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - un-setting the "global testing context" (`unsetContext`)
    - destroy the contexts owner object
    - remove AJAX listeners
  
    @public
    @param {Object} context the context to setup
    @param {Object} [options] options used to override defaults
    @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
    @returns {Promise<void>} resolves when settled
  */
  function teardownContext(context, options) {
    let waitForSettled = true;

    if (options !== undefined && 'waitForSettled' in options) {
      waitForSettled = options.waitForSettled;
    }

    return (0, _utils.nextTickPromise)().then(() => {
      let {
        owner
      } = context;
      (0, _settled._teardownAJAXHooks)();
      Ember.run(owner, 'destroy');
      Ember.testing = false;
      (0, _setupContext.unsetContext)();

      if (waitForSettled) {
        return (0, _settled.default)();
      }

      return (0, _utils.nextTickPromise)();
    }).finally(() => {
      let contextGuid = Ember.guidFor(context);
      (0, _utils.runDestroyablesFor)(_setupContext.CLEANUP, contextGuid);

      if (waitForSettled) {
        return (0, _settled.default)();
      }

      return (0, _utils.nextTickPromise)();
    });
  }
});