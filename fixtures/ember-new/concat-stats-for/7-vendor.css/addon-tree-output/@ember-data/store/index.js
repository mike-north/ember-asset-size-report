define("@ember-data/store/index", ["exports", "@ember-data/store/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.Store;
    }
  });
  Object.defineProperty(_exports, "normalizeModelName", {
    enumerable: true,
    get: function () {
      return _private.normalizeModelName;
    }
  });
  Object.defineProperty(_exports, "setIdentifierGenerationMethod", {
    enumerable: true,
    get: function () {
      return _private.setIdentifierGenerationMethod;
    }
  });
  Object.defineProperty(_exports, "setIdentifierUpdateMethod", {
    enumerable: true,
    get: function () {
      return _private.setIdentifierUpdateMethod;
    }
  });
  Object.defineProperty(_exports, "setIdentifierForgetMethod", {
    enumerable: true,
    get: function () {
      return _private.setIdentifierForgetMethod;
    }
  });
  Object.defineProperty(_exports, "setIdentifierResetMethod", {
    enumerable: true,
    get: function () {
      return _private.setIdentifierResetMethod;
    }
  });
  Object.defineProperty(_exports, "recordIdentifierFor", {
    enumerable: true,
    get: function () {
      return _private.recordIdentifierFor;
    }
  });
});