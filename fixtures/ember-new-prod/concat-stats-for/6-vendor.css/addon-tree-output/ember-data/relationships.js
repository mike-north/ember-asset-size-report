define("ember-data/relationships", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "belongsTo", {
    enumerable: true,
    get: function get() {
      return _model.belongsTo;
    }
  });
  Object.defineProperty(_exports, "hasMany", {
    enumerable: true,
    get: function get() {
      return _model.hasMany;
    }
  });
});