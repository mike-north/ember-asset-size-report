define("@ember/object/compat", ["exports", "@ember/-internals/metal", "@ember/debug", "@glimmer/reference"], function (_exports, _metal, _debug, _reference) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.dependentKeyCompat = dependentKeyCompat;

  var wrapGetterSetter = function wrapGetterSetter(_target, key, desc) {
    var originalGet = desc.get;

    if (originalGet !== undefined) {
      desc.get = function () {
        var _this = this;

        var propertyTag = (0, _metal.tagForProperty)(this, key);
        var ret;
        var tag = (0, _metal.track)(function () {
          ret = originalGet.call(_this);
        });
        (0, _reference.update)(propertyTag, tag);
        (0, _metal.consume)(tag);
        return ret;
      };
    }

    return desc;
  };

  function dependentKeyCompat(target, key, desc) {
    (false && !(Boolean(true
    /* EMBER_METAL_TRACKED_PROPERTIES */
    )) && (0, _debug.assert)('The dependentKeyCompat decorator can only be used if the tracked properties feature is enabled', Boolean(true)));

    if (!(0, _metal.isElementDescriptor)([target, key, desc])) {
      desc = target;

      var decorator = function decorator(target, key, _desc, _meta, isClassicDecorator) {
        (false && !(isClassicDecorator) && (0, _debug.assert)('The @dependentKeyCompat decorator may only be passed a method when used in classic classes. You should decorate getters/setters directly in native classes', isClassicDecorator));
        (false && !(desc !== null && typeof desc === 'object' && (typeof desc.get === 'function' || typeof desc.set === 'function')) && (0, _debug.assert)('The dependentKeyCompat() decorator must be passed a getter or setter when used in classic classes', desc !== null && typeof desc === 'object' && (typeof desc.get === 'function' || typeof desc.set === 'function')));
        return wrapGetterSetter(target, key, desc);
      };

      (0, _metal.setClassicDecorator)(decorator);
      return decorator;
    }

    (false && !(desc !== null && typeof desc.get === 'function' || typeof desc.set === 'function') && (0, _debug.assert)('The @dependentKeyCompat decorator must be applied to getters/setters when used in native classes', desc !== null && typeof desc.get === 'function' || typeof desc.set === 'function'));
    return wrapGetterSetter(target, key, desc);
  }

  (0, _metal.setClassicDecorator)(dependentKeyCompat);
});