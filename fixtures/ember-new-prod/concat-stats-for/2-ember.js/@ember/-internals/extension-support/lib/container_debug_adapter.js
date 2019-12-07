define("@ember/-internals/extension-support/lib/container_debug_adapter", ["exports", "@ember/string", "@ember/-internals/runtime"], function (_exports, _string, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/debug
  */

  /**
    The `ContainerDebugAdapter` helps the container and resolver interface
    with tools that debug Ember such as the
    [Ember Inspector](https://github.com/emberjs/ember-inspector)
    for Chrome and Firefox.
  
    This class can be extended by a custom resolver implementer
    to override some of the methods with library-specific code.
  
    The methods likely to be overridden are:
  
    * `canCatalogEntriesByType`
    * `catalogEntriesByType`
  
    The adapter will need to be registered
    in the application's container as `container-debug-adapter:main`.
  
    Example:
  
    ```javascript
    Application.initializer({
      name: "containerDebugAdapter",
  
      initialize(application) {
        application.register('container-debug-adapter:main', require('app/container-debug-adapter'));
      }
    });
    ```
  
    @class ContainerDebugAdapter
    @extends EmberObject
    @since 1.5.0
    @public
  */
  var _default = _runtime.Object.extend({
    /**
      The resolver instance of the application
      being debugged. This property will be injected
      on creation.
       @property resolver
      @default null
      @public
    */
    resolver: null,

    /**
      Returns true if it is possible to catalog a list of available
      classes in the resolver for a given type.
       @method canCatalogEntriesByType
      @param {String} type The type. e.g. "model", "controller", "route".
      @return {boolean} whether a list is available for this type.
      @public
    */
    canCatalogEntriesByType: function canCatalogEntriesByType(type) {
      if (type === 'model' || type === 'template') {
        return false;
      }

      return true;
    },

    /**
      Returns the available classes a given type.
       @method catalogEntriesByType
      @param {String} type The type. e.g. "model", "controller", "route".
      @return {Array} An array of strings.
      @public
    */
    catalogEntriesByType: function catalogEntriesByType(type) {
      var namespaces = (0, _runtime.A)(_runtime.Namespace.NAMESPACES);
      var types = (0, _runtime.A)();
      var typeSuffixRegex = new RegExp((0, _string.classify)(type) + "$");
      namespaces.forEach(function (namespace) {
        for (var key in namespace) {
          if (!namespace.hasOwnProperty(key)) {
            continue;
          }

          if (typeSuffixRegex.test(key)) {
            var klass = namespace[key];

            if ((0, _runtime.typeOf)(klass) === 'class') {
              types.push((0, _string.dasherize)(key.replace(typeSuffixRegex, '')));
            }
          }
        }
      });
      return types;
    }
  });

  _exports.default = _default;
});