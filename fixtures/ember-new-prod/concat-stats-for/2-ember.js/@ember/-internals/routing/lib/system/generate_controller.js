define("@ember/-internals/routing/lib/system/generate_controller", ["exports", "@ember/-internals/metal", "@ember/debug"], function (_exports, _metal, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.generateControllerFactory = generateControllerFactory;
  _exports.default = generateController;

  /**
  @module ember
  */

  /**
    Generates a controller factory
  
    @for Ember
    @method generateControllerFactory
    @private
  */
  function generateControllerFactory(owner, controllerName) {
    var Factory = owner.factoryFor('controller:basic').class;
    Factory = Factory.extend({
      toString: function toString() {
        return "(generated " + controllerName + " controller)";
      }
    });
    var fullName = "controller:" + controllerName;
    owner.register(fullName, Factory);
    return owner.factoryFor(fullName);
  }
  /**
    Generates and instantiates a controller extending from `controller:basic`
    if present, or `Controller` if not.
  
    @for Ember
    @method generateController
    @private
    @since 1.3.0
  */


  function generateController(owner, controllerName) {
    generateControllerFactory(owner, controllerName);
    var fullName = "controller:" + controllerName;
    var instance = owner.lookup(fullName);

    if (false
    /* DEBUG */
    ) {
      if ((0, _metal.get)(instance, 'namespace.LOG_ACTIVE_GENERATION')) {
        (0, _debug.info)("generated -> " + fullName, {
          fullName: fullName
        });
      }
    }

    return instance;
  }
});