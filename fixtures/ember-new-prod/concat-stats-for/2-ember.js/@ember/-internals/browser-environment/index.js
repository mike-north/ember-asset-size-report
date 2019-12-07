define("@ember/-internals/browser-environment/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.hasDOM = _exports.isFirefox = _exports.isChrome = _exports.userAgent = _exports.history = _exports.location = _exports.window = void 0;
  // check if window exists and actually is the global
  var hasDom = typeof self === 'object' && self !== null && self.Object === Object && typeof Window !== 'undefined' && self.constructor === Window && typeof document === 'object' && document !== null && self.document === document && typeof location === 'object' && location !== null && self.location === location && typeof history === 'object' && history !== null && self.history === history && typeof navigator === 'object' && navigator !== null && self.navigator === navigator && typeof navigator.userAgent === 'string';
  _exports.hasDOM = hasDom;
  var window = hasDom ? self : null;
  _exports.window = window;
  var location$1 = hasDom ? self.location : null;
  _exports.location = location$1;
  var history$1 = hasDom ? self.history : null;
  _exports.history = history$1;
  var userAgent = hasDom ? self.navigator.userAgent : 'Lynx (textmode)';
  _exports.userAgent = userAgent;
  var isChrome = hasDom ? Boolean(window.chrome) && !window.opera : false;
  _exports.isChrome = isChrome;
  var isFirefox = hasDom ? typeof InstallTrigger !== 'undefined' : false;
  _exports.isFirefox = isFirefox;
});