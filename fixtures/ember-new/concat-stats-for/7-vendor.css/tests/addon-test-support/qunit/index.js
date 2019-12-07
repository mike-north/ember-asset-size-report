define("qunit/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.todo = _exports.only = _exports.skip = _exports.test = _exports.module = void 0;

  /* globals QUnit */
  var module = QUnit.module;
  _exports.module = module;
  var test = QUnit.test;
  _exports.test = test;
  var skip = QUnit.skip;
  _exports.skip = skip;
  var only = QUnit.only;
  _exports.only = only;
  var todo = QUnit.todo;
  _exports.todo = todo;
  var _default = QUnit;
  _exports.default = _default;
});