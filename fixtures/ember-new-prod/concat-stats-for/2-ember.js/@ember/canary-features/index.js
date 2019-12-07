define("@ember/canary-features/index", ["exports", "@ember/-internals/environment", "@ember/polyfills"], function (_exports, _environment, _polyfills) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isEnabled = isEnabled;
  _exports.EMBER_ROUTING_MODEL_ARG = _exports.EMBER_GLIMMER_SET_COMPONENT_TEMPLATE = _exports.EMBER_CUSTOM_COMPONENT_ARG_PROXY = _exports.EMBER_METAL_TRACKED_PROPERTIES = _exports.EMBER_MODULE_UNIFICATION = _exports.EMBER_IMPROVED_INSTRUMENTATION = _exports.EMBER_LIBRARIES_ISREGISTERED = _exports.FEATURES = _exports.DEFAULT_FEATURES = void 0;

  /**
    Set `EmberENV.FEATURES` in your application's `config/environment.js` file
    to enable canary features in your application.
  
    See the [feature flag guide](https://guides.emberjs.com/release/configuring-ember/feature-flags/)
    for more details.
  
    @module @ember/canary-features
    @public
  */
  var DEFAULT_FEATURES = {
    EMBER_LIBRARIES_ISREGISTERED: false,
    EMBER_IMPROVED_INSTRUMENTATION: false,
    EMBER_MODULE_UNIFICATION: false,
    EMBER_METAL_TRACKED_PROPERTIES: true,
    EMBER_CUSTOM_COMPONENT_ARG_PROXY: true,
    EMBER_GLIMMER_SET_COMPONENT_TEMPLATE: true,
    EMBER_ROUTING_MODEL_ARG: true
  };
  /**
    The hash of enabled Canary features. Add to this, any canary features
    before creating your application.
  
    @class FEATURES
    @static
    @since 1.1.0
    @public
  */

  _exports.DEFAULT_FEATURES = DEFAULT_FEATURES;
  var FEATURES = (0, _polyfills.assign)(DEFAULT_FEATURES, _environment.ENV.FEATURES);
  /**
    Determine whether the specified `feature` is enabled. Used by Ember's
    build tools to exclude experimental features from beta/stable builds.
  
    You can define the following configuration options:
  
    * `EmberENV.ENABLE_OPTIONAL_FEATURES` - enable any features that have not been explicitly
      enabled/disabled.
  
    @method isEnabled
    @param {String} feature The feature to check
    @return {Boolean}
    @since 1.1.0
    @public
  */

  _exports.FEATURES = FEATURES;

  function isEnabled(feature) {
    var featureValue = FEATURES[feature];

    if (featureValue === true || featureValue === false) {
      return featureValue;
    } else if (_environment.ENV.ENABLE_OPTIONAL_FEATURES) {
      return true;
    } else {
      return false;
    }
  }

  function featureValue(value) {
    if (_environment.ENV.ENABLE_OPTIONAL_FEATURES && value === null) {
      return true;
    }

    return value;
  }

  var EMBER_LIBRARIES_ISREGISTERED = featureValue(FEATURES.EMBER_LIBRARIES_ISREGISTERED);
  _exports.EMBER_LIBRARIES_ISREGISTERED = EMBER_LIBRARIES_ISREGISTERED;
  var EMBER_IMPROVED_INSTRUMENTATION = featureValue(FEATURES.EMBER_IMPROVED_INSTRUMENTATION);
  _exports.EMBER_IMPROVED_INSTRUMENTATION = EMBER_IMPROVED_INSTRUMENTATION;
  var EMBER_MODULE_UNIFICATION = featureValue(FEATURES.EMBER_MODULE_UNIFICATION);
  _exports.EMBER_MODULE_UNIFICATION = EMBER_MODULE_UNIFICATION;
  var EMBER_METAL_TRACKED_PROPERTIES = featureValue(FEATURES.EMBER_METAL_TRACKED_PROPERTIES);
  _exports.EMBER_METAL_TRACKED_PROPERTIES = EMBER_METAL_TRACKED_PROPERTIES;
  var EMBER_CUSTOM_COMPONENT_ARG_PROXY = featureValue(FEATURES.EMBER_CUSTOM_COMPONENT_ARG_PROXY);
  _exports.EMBER_CUSTOM_COMPONENT_ARG_PROXY = EMBER_CUSTOM_COMPONENT_ARG_PROXY;
  var EMBER_GLIMMER_SET_COMPONENT_TEMPLATE = featureValue(FEATURES.EMBER_GLIMMER_SET_COMPONENT_TEMPLATE);
  _exports.EMBER_GLIMMER_SET_COMPONENT_TEMPLATE = EMBER_GLIMMER_SET_COMPONENT_TEMPLATE;
  var EMBER_ROUTING_MODEL_ARG = featureValue(FEATURES.EMBER_ROUTING_MODEL_ARG);
  _exports.EMBER_ROUTING_MODEL_ARG = EMBER_ROUTING_MODEL_ARG;
});