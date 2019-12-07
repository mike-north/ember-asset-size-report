define("@ember/service/index", ["exports", "@ember/-internals/runtime", "@ember/-internals/metal"], function (_exports, _runtime, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.inject = inject;
  _exports.default = void 0;

  /**
   @module @ember/service
   @public
   */

  /**
    Creates a property that lazily looks up a service in the container. There are
    no restrictions as to what objects a service can be injected into.
  
    Example:
  
    ```app/routes/application.js
    import Route from '@ember/routing/route';
    import { inject as service } from '@ember/service';
  
    export default class ApplicationRoute extends Route {
      @service('auth') authManager;
  
      model() {
        return this.authManager.findCurrentUser();
      }
    }
    ```
  
    Classic Class Example:
  
    ```app/routes/application.js
    import Route from '@ember/routing/route';
    import { inject as service } from '@ember/service';
  
    export default Route.extend({
      authManager: service('auth'),
  
      model() {
        return this.get('authManager').findCurrentUser();
      }
    });
    ```
  
    This example will create an `authManager` property on the application route
    that looks up the `auth` service in the container, making it easily accessible
    in the `model` hook.
  
    @method inject
    @static
    @since 1.10.0
    @for @ember/service
    @param {String} name (optional) name of the service to inject, defaults to
           the property's name
    @return {ComputedDecorator} injection decorator instance
    @public
  */
  function inject() {
    return _metal.inject.apply(void 0, ['service'].concat(Array.prototype.slice.call(arguments)));
  }
  /**
    @class Service
    @extends EmberObject
    @since 1.10.0
    @public
  */


  var Service = _runtime.FrameworkObject.extend();

  Service.reopenClass({
    isServiceFactory: true
  });
  (0, _runtime.setFrameworkClass)(Service);
  var _default = Service;
  _exports.default = _default;
});