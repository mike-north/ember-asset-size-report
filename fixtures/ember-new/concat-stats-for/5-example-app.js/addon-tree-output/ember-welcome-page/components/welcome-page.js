define("ember-welcome-page/components/welcome-page", ["exports", "ember-welcome-page/templates/components/welcome-page"], function (_exports, _welcomePage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    layout: _welcomePage.default,
    emberVersion: Ember.computed(function () {
      let [major, minor] = Ember.VERSION.split(".");
      return `${major}.${minor}.0`;
    }),
    canAngleBracket: Ember.computed(function () {
      return true;
    }),
    isModuleUnification: Ember.computed(function () {
      const config = Ember.getOwner(this).resolveRegistration('config:environment');
      return config && config.isModuleUnification;
    })
  });

  _exports.default = _default;
});