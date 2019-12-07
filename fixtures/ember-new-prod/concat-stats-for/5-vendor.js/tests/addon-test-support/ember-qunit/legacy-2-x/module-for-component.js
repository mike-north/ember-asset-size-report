define("ember-qunit/legacy-2-x/module-for-component", ["exports", "ember-qunit/legacy-2-x/qunit-module", "ember-test-helpers"], function (_exports, _qunitModule, _emberTestHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = moduleForComponent;

  function moduleForComponent(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModuleForComponent, name, description, callbacks);
    (false && !(false) && Ember.deprecate("The usage \"moduleForComponent\" is deprecated. Please migrate the \"".concat(name, "\" module to use \"setupRenderingTest\"."), false, {
      id: 'ember-qunit.deprecate-legacy-apis',
      until: '5.0.0',
      url: 'https://github.com/emberjs/ember-qunit/blob/master/docs/migration.md'
    }));
  }
});