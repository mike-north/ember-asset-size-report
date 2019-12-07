define("@ember/-internals/routing/lib/location/api", ["exports", "@ember/debug"], function (_exports, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/routing
  */

  /**
    Location returns an instance of the correct implementation of
    the `location` API.
  
    ## Implementations
  
    You can pass an implementation name (`hash`, `history`, `none`, `auto`) to force a
    particular implementation to be used in your application.
  
    See [HashLocation](/ember/release/classes/HashLocation).
    See [HistoryLocation](/ember/release/classes/HistoryLocation).
    See [NoneLocation](/ember/release/classes/NoneLocation).
    See [AutoLocation](/ember/release/classes/AutoLocation).
  
    ## Location API
  
    Each location implementation must provide the following methods:
  
    * implementation: returns the string name used to reference the implementation.
    * getURL: returns the current URL.
    * setURL(path): sets the current URL.
    * replaceURL(path): replace the current URL (optional).
    * onUpdateURL(callback): triggers the callback when the URL changes.
    * formatURL(url): formats `url` to be placed into `href` attribute.
    * detect() (optional): instructs the location to do any feature detection
        necessary. If the location needs to redirect to a different URL, it
        can cancel routing by setting the `cancelRouterSetup` property on itself
        to `false`.
  
    Calling setURL or replaceURL will not trigger onUpdateURL callbacks.
  
    ## Custom implementation
  
    Ember scans `app/locations/*` for extending the Location API.
  
    Example:
  
    ```javascript
    import HistoryLocation from '@ember/routing/history-location';
  
    export default class MyHistory {
      implementation: 'my-custom-history',
      constructor() {
        this._history = HistoryLocation.create(...arguments);
      }
      create() {
        return new this(...arguments);
      }
      pushState(path) {
         this._history.pushState(path);
      }
    }
    ```
  
    @class Location
    @private
  */
  var _default = {
    /**
     This is deprecated in favor of using the container to lookup the location
     implementation as desired.
        For example:
        ```javascript
     // Given a location registered as follows:
     container.register('location:history-test', HistoryTestLocation);
        // You could create a new instance via:
     container.lookup('location:history-test');
     ```
         @method create
      @param {Object} options
      @return {Object} an instance of an implementation of the `location` API
      @deprecated Use the container to lookup the location implementation that you
      need.
      @private
    */
    create: function create(options) {
      var implementation = options && options.implementation;
      (false && !(Boolean(implementation)) && (0, _debug.assert)("Location.create: you must specify a 'implementation' option", Boolean(implementation)));
      var implementationClass = this.implementations[implementation];
      (false && !(Boolean(implementationClass)) && (0, _debug.assert)("Location.create: " + implementation + " is not a valid implementation", Boolean(implementationClass)));
      return implementationClass.create.apply(implementationClass, arguments);
    },
    implementations: {}
  };
  _exports.default = _default;
});