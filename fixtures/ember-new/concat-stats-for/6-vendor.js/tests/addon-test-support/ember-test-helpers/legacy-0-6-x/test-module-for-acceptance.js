define("ember-test-helpers/legacy-0-6-x/test-module-for-acceptance", ["exports", "ember-test-helpers/legacy-0-6-x/abstract-test-module", "@ember/test-helpers"], function (_exports, _abstractTestModule, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class _default extends _abstractTestModule.default {
    setupContext() {
      super.setupContext({
        application: this.createApplication()
      });
    }

    teardownContext() {
      Ember.run(() => {
        (0, _testHelpers.getContext)().application.destroy();
      });
      super.teardownContext();
    }

    createApplication() {
      let {
        Application,
        config
      } = this.callbacks;
      let application;
      Ember.run(() => {
        application = Application.create(config);
        application.setupForTesting();
        application.injectTestHelpers();
      });
      return application;
    }

  }

  _exports.default = _default;
});