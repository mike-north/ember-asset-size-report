define("@ember-data/canary-features/index", ["exports", "@ember-data/canary-features/default-features"], function (_exports, _defaultFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.CUSTOM_MODEL_CLASS = _exports.IDENTIFIERS = _exports.REQUEST_SERVICE = _exports.RECORD_DATA_STATE = _exports.RECORD_DATA_ERRORS = _exports.SAMPLE_FEATURE_FLAG = _exports.FEATURES = void 0;
  const ENV = typeof EmberDataENV === 'object' && EmberDataENV !== null ? EmberDataENV : {};

  function featureValue(value) {
    if (ENV.ENABLE_OPTIONAL_FEATURES && value === null) {
      return true;
    }

    return value;
  }

  const FEATURES = Ember.assign({}, _defaultFeatures.default, ENV.FEATURES);
  _exports.FEATURES = FEATURES;
  const SAMPLE_FEATURE_FLAG = featureValue(FEATURES.SAMPLE_FEATURE_FLAG);
  _exports.SAMPLE_FEATURE_FLAG = SAMPLE_FEATURE_FLAG;
  const RECORD_DATA_ERRORS = featureValue(FEATURES.RECORD_DATA_ERRORS);
  _exports.RECORD_DATA_ERRORS = RECORD_DATA_ERRORS;
  const RECORD_DATA_STATE = featureValue(FEATURES.RECORD_DATA_STATE);
  _exports.RECORD_DATA_STATE = RECORD_DATA_STATE;
  const REQUEST_SERVICE = featureValue(FEATURES.REQUEST_SERVICE);
  _exports.REQUEST_SERVICE = REQUEST_SERVICE;
  const IDENTIFIERS = featureValue(FEATURES.IDENTIFIERS);
  _exports.IDENTIFIERS = IDENTIFIERS;
  const CUSTOM_MODEL_CLASS = featureValue(FEATURES.CUSTOM_MODEL_CLASS);
  _exports.CUSTOM_MODEL_CLASS = CUSTOM_MODEL_CLASS;
});