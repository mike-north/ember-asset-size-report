define("@ember/-internals/views/lib/component_lookup", ["exports", "@ember/-internals/runtime"], function (_exports, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _runtime.Object.extend({
    componentFor: function componentFor(name, owner, options) {
      var fullName = "component:" + name;
      return owner.factoryFor(fullName, options);
    },
    layoutFor: function layoutFor(name, owner, options) {
      var templateFullName = "template:components/" + name;
      return owner.lookup(templateFullName, options);
    }
  });

  _exports.default = _default;
});