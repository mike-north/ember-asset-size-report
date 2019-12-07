define("@ember/-internals/runtime/lib/ext/rsvp", ["exports", "rsvp", "@ember/runloop", "@ember/-internals/error-handling", "@ember/debug"], function (_exports, RSVP, _runloop, _errorHandling, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.onerrorDefault = onerrorDefault;
  _exports.default = void 0;
  RSVP.configure('async', function (callback, promise) {
    _runloop.backburner.schedule('actions', null, callback, promise);
  });
  RSVP.configure('after', function (cb) {
    _runloop.backburner.schedule(_runloop._rsvpErrorQueue, null, cb);
  });
  RSVP.on('error', onerrorDefault);

  function onerrorDefault(reason) {
    var error = errorFor(reason);

    if (error) {
      var overrideDispatch = (0, _errorHandling.getDispatchOverride)();

      if (overrideDispatch) {
        overrideDispatch(error);
      } else {
        throw error;
      }
    }
  }

  function errorFor(reason) {
    if (!reason) return;

    if (reason.errorThrown) {
      return unwrapErrorThrown(reason);
    }

    if (reason.name === 'UnrecognizedURLError') {
      (false && !(false) && (0, _debug.assert)("The URL '" + reason.message + "' did not match any routes in your application", false));
      return;
    }

    if (reason.name === 'TransitionAborted') {
      return;
    }

    return reason;
  }

  function unwrapErrorThrown(reason) {
    var error = reason.errorThrown;

    if (typeof error === 'string') {
      error = new Error(error);
    }

    Object.defineProperty(error, '__reason_with_error_thrown__', {
      value: reason,
      enumerable: false
    });
    return error;
  }

  var _default = RSVP;
  _exports.default = _default;
});