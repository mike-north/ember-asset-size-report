define("node-module/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.require = _exports.module = _exports.IS_NODE = void 0;

  /*global module */
  var IS_NODE = typeof module === 'object' && typeof module.require === 'function';
  _exports.IS_NODE = IS_NODE;
  var exportModule;
  _exports.module = exportModule;
  var exportRequire;
  _exports.require = exportRequire;

  if (IS_NODE) {
    _exports.module = exportModule = module;
    _exports.require = exportRequire = module.require;
  } else {
    _exports.module = exportModule = null;
    _exports.require = exportRequire = null;
  }
});