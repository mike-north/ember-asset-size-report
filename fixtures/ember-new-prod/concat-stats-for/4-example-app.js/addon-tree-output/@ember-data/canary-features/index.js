define("@ember-data/canary-features/index", ["exports", "@ember-data/canary-features/default-features"], function (_exports, _defaultFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.CUSTOM_MODEL_CLASS = _exports.IDENTIFIERS = _exports.REQUEST_SERVICE = _exports.RECORD_DATA_STATE = _exports.RECORD_DATA_ERRORS = _exports.SAMPLE_FEATURE_FLAG = _exports.FEATURES = void 0;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  var ENV = (typeof EmberDataENV === "undefined" ? "undefined" : _typeof(EmberDataENV)) === 'object' && EmberDataENV !== null ? EmberDataENV : {};

  function featureValue(value) {
    if (ENV.ENABLE_OPTIONAL_FEATURES && value === null) {
      return true;
    }

    return value;
  }

  var FEATURES = Ember.assign({}, _defaultFeatures.default, ENV.FEATURES);
  _exports.FEATURES = FEATURES;
  var SAMPLE_FEATURE_FLAG = featureValue(FEATURES.SAMPLE_FEATURE_FLAG);
  _exports.SAMPLE_FEATURE_FLAG = SAMPLE_FEATURE_FLAG;
  var RECORD_DATA_ERRORS = featureValue(FEATURES.RECORD_DATA_ERRORS);
  _exports.RECORD_DATA_ERRORS = RECORD_DATA_ERRORS;
  var RECORD_DATA_STATE = featureValue(FEATURES.RECORD_DATA_STATE);
  _exports.RECORD_DATA_STATE = RECORD_DATA_STATE;
  var REQUEST_SERVICE = featureValue(FEATURES.REQUEST_SERVICE);
  _exports.REQUEST_SERVICE = REQUEST_SERVICE;
  var IDENTIFIERS = featureValue(FEATURES.IDENTIFIERS);
  _exports.IDENTIFIERS = IDENTIFIERS;
  var CUSTOM_MODEL_CLASS = featureValue(FEATURES.CUSTOM_MODEL_CLASS);
  _exports.CUSTOM_MODEL_CLASS = CUSTOM_MODEL_CLASS;
});