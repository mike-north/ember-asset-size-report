define("@ember/-internals/views/lib/mixins/class_names_support", ["exports", "@ember/-internals/metal", "@ember/debug"], function (_exports, _metal, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */
  var EMPTY_ARRAY = Object.freeze([]);
  /**
    @class ClassNamesSupport
    @namespace Ember
    @private
  */

  var _default = _metal.Mixin.create({
    concatenatedProperties: ['classNames', 'classNameBindings'],
    init: function init() {
      this._super.apply(this, arguments);

      (false && !((0, _metal.descriptorForProperty)(this, 'classNameBindings') === undefined && Array.isArray(this.classNameBindings)) && (0, _debug.assert)("Only arrays are allowed for 'classNameBindings'", (0, _metal.descriptorForProperty)(this, 'classNameBindings') === undefined && Array.isArray(this.classNameBindings)));
      (false && !((0, _metal.descriptorForProperty)(this, 'classNames') === undefined && Array.isArray(this.classNames)) && (0, _debug.assert)("Only arrays of static class strings are allowed for 'classNames'. For dynamic classes, use 'classNameBindings'.", (0, _metal.descriptorForProperty)(this, 'classNames') === undefined && Array.isArray(this.classNames)));
    },

    /**
      Standard CSS class names to apply to the view's outer element. This
      property automatically inherits any class names defined by the view's
      superclasses as well.
       @property classNames
      @type Array
      @default ['ember-view']
      @public
    */
    classNames: EMPTY_ARRAY,

    /**
      A list of properties of the view to apply as class names. If the property
      is a string value, the value of that string will be applied as a class
      name.
       ```javascript
      // Applies the 'high' class to the view element
      import Component from '@ember/component';
      Component.extend({
        classNameBindings: ['priority'],
        priority: 'high'
      });
      ```
       If the value of the property is a Boolean, the name of that property is
      added as a dasherized class name.
       ```javascript
      // Applies the 'is-urgent' class to the view element
      import Component from '@ember/component';
      Component.extend({
        classNameBindings: ['isUrgent'],
        isUrgent: true
      });
      ```
       If you would prefer to use a custom value instead of the dasherized
      property name, you can pass a binding like this:
       ```javascript
      // Applies the 'urgent' class to the view element
      import Component from '@ember/component';
      Component.extend({
        classNameBindings: ['isUrgent:urgent'],
        isUrgent: true
      });
      ```
       If you would like to specify a class that should only be added when the
      property is false, you can declare a binding like this:
       ```javascript
      // Applies the 'disabled' class to the view element
      import Component from '@ember/component';
      Component.extend({
        classNameBindings: ['isEnabled::disabled'],
        isEnabled: false
      });
      ```
       This list of properties is inherited from the component's superclasses as well.
       @property classNameBindings
      @type Array
      @default []
      @public
    */
    classNameBindings: EMPTY_ARRAY
  });

  _exports.default = _default;
});