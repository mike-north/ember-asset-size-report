define("ember-qunit/legacy-2-x/module-for-model", ["exports", "ember-qunit/legacy-2-x/qunit-module", "ember-test-helpers"], function (_exports, _qunitModule, _emberTestHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = moduleForModel;

  function moduleForModel(name, description, callbacks) {
    (false && !(false) && Ember.deprecate("The usage \"moduleForModel\" is deprecated. Please migrate the \"".concat(name, "\" module to the new test APIs."), false, {
      id: 'ember-qunit.deprecate-legacy-apis',
      until: '5.0.0',
      url: 'https://github.com/emberjs/ember-qunit/blob/master/docs/migration.md'
    }));
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModuleForModel, name, description, callbacks);
  }
});