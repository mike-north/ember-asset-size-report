define("@ember/-internals/runtime/lib/mixins/copyable", ["exports", "@ember/-internals/metal"], function (_exports, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */

  /**
    Implements some standard methods for copying an object. Add this mixin to
    any object you create that can create a copy of itself. This mixin is
    added automatically to the built-in array.
  
    You should generally implement the `copy()` method to return a copy of the
    receiver.
  
    @class Copyable
    @namespace Ember
    @since Ember 0.9
    @deprecated Use 'ember-copy' addon instead
    @private
  */
  var _default = _metal.Mixin.create({
    /**
      __Required.__ You must implement this method to apply this mixin.
       Override to return a copy of the receiver. Default implementation raises
      an exception.
       @method copy
      @param {Boolean} deep if `true`, a deep copy of the object should be made
      @return {Object} copy of receiver
      @private
    */
    copy: null
  });

  _exports.default = _default;
});