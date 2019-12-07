define("@ember/-internals/runtime/lib/system/namespace", ["exports", "ember-babel", "@ember/-internals/metal", "@ember/-internals/utils", "@ember/-internals/runtime/lib/system/object"], function (_exports, _emberBabel, _metal, _utils, _object) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */
  // Preloaded into namespaces

  /**
    A Namespace is an object usually used to contain other objects or methods
    such as an application or framework. Create a namespace anytime you want
    to define one of these new containers.
  
    # Example Usage
  
    ```javascript
    MyFramework = Ember.Namespace.create({
      VERSION: '1.0.0'
    });
    ```
  
    @class Namespace
    @namespace Ember
    @extends EmberObject
    @public
  */
  var Namespace =
  /*#__PURE__*/
  function (_EmberObject) {
    (0, _emberBabel.inheritsLoose)(Namespace, _EmberObject);

    function Namespace() {
      return _EmberObject.apply(this, arguments) || this;
    }

    var _proto = Namespace.prototype;

    _proto.init = function init() {
      (0, _metal.addNamespace)(this);
    };

    _proto.toString = function toString() {
      var name = (0, _metal.get)(this, 'name') || (0, _metal.get)(this, 'modulePrefix');

      if (name) {
        return name;
      }

      (0, _metal.findNamespaces)();
      name = (0, _utils.getName)(this);

      if (name === undefined) {
        name = (0, _utils.guidFor)(this);
        (0, _utils.setName)(this, name);
      }

      return name;
    };

    _proto.nameClasses = function nameClasses() {
      (0, _metal.processNamespace)(this);
    };

    _proto.destroy = function destroy() {
      (0, _metal.removeNamespace)(this);

      _EmberObject.prototype.destroy.call(this);
    };

    return Namespace;
  }(_object.default);

  _exports.default = Namespace;
  Namespace.prototype.isNamespace = true;
  Namespace.NAMESPACES = _metal.NAMESPACES;
  Namespace.NAMESPACES_BY_ID = _metal.NAMESPACES_BY_ID;
  Namespace.processAll = _metal.processAllNamespaces;
  Namespace.byName = _metal.findNamespace;
});