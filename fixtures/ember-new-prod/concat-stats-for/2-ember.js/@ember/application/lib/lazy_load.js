define("@ember/application/lib/lazy_load", ["exports", "@ember/-internals/environment", "@ember/-internals/browser-environment"], function (_exports, _environment, _browserEnvironment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.onLoad = onLoad;
  _exports.runLoadHooks = runLoadHooks;
  _exports._loaded = void 0;

  /*globals CustomEvent */

  /**
    @module @ember/application
  */
  var loadHooks = _environment.ENV.EMBER_LOAD_HOOKS || {};
  var loaded = {};
  var _loaded = loaded;
  /**
    Detects when a specific package of Ember (e.g. 'Application')
    has fully loaded and is available for extension.
  
    The provided `callback` will be called with the `name` passed
    resolved from a string into the object:
  
    ``` javascript
    import { onLoad } from '@ember/application';
  
    onLoad('Ember.Application' function(hbars) {
      hbars.registerHelper(...);
    });
    ```
  
    @method onLoad
    @static
    @for @ember/application
    @param name {String} name of hook
    @param callback {Function} callback to be called
    @private
  */

  _exports._loaded = _loaded;

  function onLoad(name, callback) {
    var object = loaded[name];
    loadHooks[name] = loadHooks[name] || [];
    loadHooks[name].push(callback);

    if (object) {
      callback(object);
    }
  }
  /**
    Called when an Ember.js package (e.g Application) has finished
    loading. Triggers any callbacks registered for this event.
  
    @method runLoadHooks
    @static
    @for @ember/application
    @param name {String} name of hook
    @param object {Object} object to pass to callbacks
    @private
  */


  function runLoadHooks(name, object) {
    loaded[name] = object;

    if (_browserEnvironment.window && typeof CustomEvent === 'function') {
      var event = new CustomEvent(name, {
        detail: object,
        name: name
      });

      _browserEnvironment.window.dispatchEvent(event);
    }

    if (loadHooks[name]) {
      loadHooks[name].forEach(function (callback) {
        return callback(object);
      });
    }
  }
});