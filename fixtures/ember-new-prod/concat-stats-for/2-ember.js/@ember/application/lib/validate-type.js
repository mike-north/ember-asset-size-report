define("@ember/application/lib/validate-type", ["exports", "@ember/debug"], function (_exports, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = validateType;
  var VALIDATED_TYPES = {
    route: ['assert', 'isRouteFactory', 'Ember.Route'],
    component: ['deprecate', 'isComponentFactory', 'Ember.Component'],
    view: ['deprecate', 'isViewFactory', 'Ember.View'],
    service: ['deprecate', 'isServiceFactory', 'Ember.Service']
  };

  function validateType(resolvedType, parsedName) {
    var validationAttributes = VALIDATED_TYPES[parsedName.type];

    if (!validationAttributes) {
      return;
    }

    var factoryFlag = validationAttributes[1],
        expectedType = validationAttributes[2];
    (false && !(Boolean(resolvedType[factoryFlag])) && (0, _debug.assert)("Expected " + parsedName.fullName + " to resolve to an " + expectedType + " but " + ("instead it was " + resolvedType + "."), Boolean(resolvedType[factoryFlag])));
  }
});