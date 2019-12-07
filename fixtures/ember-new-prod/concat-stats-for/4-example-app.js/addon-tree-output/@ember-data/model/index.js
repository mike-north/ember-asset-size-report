define("@ember-data/model/index", ["exports", "@ember-data/model/-private", "@ember-data/store/-private"], function (_exports, _private, _private2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "attr", {
    enumerable: true,
    get: function get() {
      return _private.attr;
    }
  });
  Object.defineProperty(_exports, "belongsTo", {
    enumerable: true,
    get: function get() {
      return _private.belongsTo;
    }
  });
  Object.defineProperty(_exports, "hasMany", {
    enumerable: true,
    get: function get() {
      return _private.hasMany;
    }
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _private2.Model;
    }
  });
});