define("@ember/-internals/error-handling/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getOnerror = getOnerror;
  _exports.setOnerror = setOnerror;
  _exports.getDispatchOverride = getDispatchOverride;
  _exports.setDispatchOverride = setDispatchOverride;
  _exports.onErrorTarget = void 0;
  var onerror;
  var onErrorTarget = {
    get onerror() {
      return onerror;
    }

  }; // Ember.onerror getter

  _exports.onErrorTarget = onErrorTarget;

  function getOnerror() {
    return onerror;
  } // Ember.onerror setter


  function setOnerror(handler) {
    onerror = handler;
  }

  var dispatchOverride; // allows testing adapter to override dispatch

  function getDispatchOverride() {
    return dispatchOverride;
  }

  function setDispatchOverride(handler) {
    dispatchOverride = handler;
  }
});