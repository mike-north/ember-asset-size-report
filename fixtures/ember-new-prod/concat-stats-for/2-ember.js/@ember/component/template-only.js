define("@ember/component/template-only", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = templateOnlyComponent;
  _exports.isTemplateOnlyComponent = isTemplateOnlyComponent;
  _exports.TemplateOnlyComponent = void 0;

  // This is only exported for types, don't use this class directly
  var TemplateOnlyComponent =
  /*#__PURE__*/
  function () {
    function TemplateOnlyComponent(moduleName) {
      if (moduleName === void 0) {
        moduleName = '@ember/component/template-only';
      }

      this.moduleName = moduleName;
    }

    var _proto = TemplateOnlyComponent.prototype;

    _proto.toString = function toString() {
      return this.moduleName;
    };

    return TemplateOnlyComponent;
  }();
  /**
    @module @ember/component/template-only
    @public
  */

  /**
    This utility function is used to declare a given component has no backing class. When the rendering engine detects this it
    is able to perform a number of optimizations. Templates that are associated with `templateOnly()` will be rendered _as is_
    without adding a wrapping `<div>` (or any of the other element customization behaviors of [@ember/component](/ember/release/classes/Component)).
    Specifically, this means that the template will be rendered as "outer HTML".
  
    In general, this method will be used by build time tooling and would not be directly written in an application. However,
    at times it may be useful to use directly to leverage the "outer HTML" semantics mentioned above. For example, if an addon would like
    to use these semantics for its templates but cannot be certain it will only be consumed by applications that have enabled the
    `template-only-glimmer-components` optional feature.
  
    @example
  
    ```js
    import templateOnly from '@ember/component/template-only';
  
    export default templateOnly();
    ```
  
    @public
    @method templateOnly
    @param {String} moduleName the module name that the template only component represents, this will be used for debugging purposes
    @category EMBER_GLIMMER_SET_COMPONENT_TEMPLATE
  */


  _exports.TemplateOnlyComponent = TemplateOnlyComponent;

  function templateOnlyComponent(moduleName) {
    return new TemplateOnlyComponent(moduleName);
  }

  function isTemplateOnlyComponent(component) {
    return component instanceof TemplateOnlyComponent;
  }
});