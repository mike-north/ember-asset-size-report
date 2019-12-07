define("@ember/instrumentation/index", ["exports", "@ember/-internals/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.instrument = instrument;
  _exports._instrumentStart = _instrumentStart;
  _exports.subscribe = subscribe;
  _exports.unsubscribe = unsubscribe;
  _exports.reset = reset;
  _exports.flaggedInstrument = _exports.subscribers = void 0;

  /* eslint no-console:off */

  /* global console */

  /**
  @module @ember/instrumentation
  @private
  */

  /**
    The purpose of the Ember Instrumentation module is
    to provide efficient, general-purpose instrumentation
    for Ember.
  
    Subscribe to a listener by using `subscribe`:
  
    ```javascript
    import { subscribe } from '@ember/instrumentation';
  
    subscribe("render", {
      before(name, timestamp, payload) {
  
      },
  
      after(name, timestamp, payload) {
  
      }
    });
    ```
  
    If you return a value from the `before` callback, that same
    value will be passed as a fourth parameter to the `after`
    callback.
  
    Instrument a block of code by using `instrument`:
  
    ```javascript
    import { instrument } from '@ember/instrumentation';
  
    instrument("render.handlebars", payload, function() {
      // rendering logic
    }, binding);
    ```
  
    Event names passed to `instrument` are namespaced
    by periods, from more general to more specific. Subscribers
    can listen for events by whatever level of granularity they
    are interested in.
  
    In the above example, the event is `render.handlebars`,
    and the subscriber listened for all events beginning with
    `render`. It would receive callbacks for events named
    `render`, `render.handlebars`, `render.container`, or
    even `render.handlebars.layout`.
  
    @class Instrumentation
    @static
    @private
  */
  var subscribers = [];
  _exports.subscribers = subscribers;
  var cache = {};

  function populateListeners(name) {
    var listeners = [];
    var subscriber;

    for (var i = 0; i < subscribers.length; i++) {
      subscriber = subscribers[i];

      if (subscriber.regex.test(name)) {
        listeners.push(subscriber.object);
      }
    }

    cache[name] = listeners;
    return listeners;
  }

  var time = function () {
    var perf = 'undefined' !== typeof window ? window.performance || {} : {};
    var fn = perf.now || perf.mozNow || perf.webkitNow || perf.msNow || perf.oNow;
    return fn ? fn.bind(perf) : Date.now;
  }();

  function isCallback(value) {
    return typeof value === 'function';
  }

  function instrument(name, p1, p2, p3) {
    var _payload;

    var callback;
    var binding;

    if (arguments.length <= 3 && isCallback(p1)) {
      callback = p1;
      binding = p2;
    } else {
      _payload = p1;
      callback = p2;
      binding = p3;
    } // fast path


    if (subscribers.length === 0) {
      return callback.call(binding);
    } // avoid allocating the payload in fast path


    var payload = _payload || {};

    var finalizer = _instrumentStart(name, function () {
      return payload;
    });

    if (finalizer === NOOP) {
      return callback.call(binding);
    } else {
      return withFinalizer(callback, finalizer, payload, binding);
    }
  }

  var flaggedInstrument;
  _exports.flaggedInstrument = flaggedInstrument;

  if (false
  /* EMBER_IMPROVED_INSTRUMENTATION */
  ) {
      _exports.flaggedInstrument = flaggedInstrument = instrument;
    } else {
    _exports.flaggedInstrument = flaggedInstrument = function instrument(_name, _payload, callback) {
      return callback();
    };
  }

  function withFinalizer(callback, finalizer, payload, binding) {
    try {
      return callback.call(binding);
    } catch (e) {
      payload.exception = e;
      throw e;
    } finally {
      finalizer();
    }
  }

  function NOOP() {}

  function _instrumentStart(name, payloadFunc, payloadArg) {
    if (subscribers.length === 0) {
      return NOOP;
    }

    var listeners = cache[name];

    if (!listeners) {
      listeners = populateListeners(name);
    }

    if (listeners.length === 0) {
      return NOOP;
    }

    var payload = payloadFunc(payloadArg);
    var STRUCTURED_PROFILE = _environment.ENV.STRUCTURED_PROFILE;
    var timeName;

    if (STRUCTURED_PROFILE) {
      timeName = name + ": " + payload.object;
      console.time(timeName);
    }

    var beforeValues = [];
    var timestamp = time();

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      beforeValues.push(listener.before(name, timestamp, payload));
    }

    return function _instrumentEnd() {
      var timestamp = time();

      for (var _i = 0; _i < listeners.length; _i++) {
        var _listener = listeners[_i];

        if (typeof _listener.after === 'function') {
          _listener.after(name, timestamp, payload, beforeValues[_i]);
        }
      }

      if (STRUCTURED_PROFILE) {
        console.timeEnd(timeName);
      }
    };
  }
  /**
    Subscribes to a particular event or instrumented block of code.
  
    @method subscribe
    @for @ember/instrumentation
    @static
  
    @param {String} [pattern] Namespaced event name.
    @param {Object} [object] Before and After hooks.
  
    @return {Subscriber}
    @private
  */


  function subscribe(pattern, object) {
    var paths = pattern.split('.');
    var path;
    var regexes = [];

    for (var i = 0; i < paths.length; i++) {
      path = paths[i];

      if (path === '*') {
        regexes.push('[^\\.]*');
      } else {
        regexes.push(path);
      }
    }

    var regex = regexes.join('\\.');
    regex = regex + "(\\..*)?";
    var subscriber = {
      pattern: pattern,
      regex: new RegExp("^" + regex + "$"),
      object: object
    };
    subscribers.push(subscriber);
    cache = {};
    return subscriber;
  }
  /**
    Unsubscribes from a particular event or instrumented block of code.
  
    @method unsubscribe
    @for @ember/instrumentation
    @static
  
    @param {Object} [subscriber]
    @private
  */


  function unsubscribe(subscriber) {
    var index = 0;

    for (var i = 0; i < subscribers.length; i++) {
      if (subscribers[i] === subscriber) {
        index = i;
      }
    }

    subscribers.splice(index, 1);
    cache = {};
  }
  /**
    Resets `Instrumentation` by flushing list of subscribers.
  
    @method reset
    @for @ember/instrumentation
    @static
    @private
  */


  function reset() {
    subscribers.length = 0;
    cache = {};
  }
});