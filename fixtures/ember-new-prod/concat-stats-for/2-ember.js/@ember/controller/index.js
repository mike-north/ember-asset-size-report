define("@ember/controller/index", ["exports", "@ember/-internals/runtime", "@ember/-internals/metal", "@ember/controller/lib/controller_mixin"], function (_exports, _runtime, _metal, _controller_mixin) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.inject = inject;
  _exports.default = void 0;

  /**
  @module @ember/controller
  */

  /**
    @class Controller
    @extends EmberObject
    @uses Ember.ControllerMixin
    @public
  */
  var Controller = _runtime.FrameworkObject.extend(_controller_mixin.default);

  (0, _runtime.setFrameworkClass)(Controller);
  /**
    Creates a property that lazily looks up another controller in the container.
    Can only be used when defining another controller.
  
    Example:
  
    ```app/controllers/post.js
    import Controller, {
      inject as controller
    } from '@ember/controller';
  
    export default class PostController extends Controller {
      @controller posts;
    }
    ```
  
    Classic Class Example:
  
    ```app/controllers/post.js
    import Controller, {
      inject as controller
    } from '@ember/controller';
  
    export default Controller.extend({
      posts: controller()
    });
    ```
  
    This example will create a `posts` property on the `post` controller that
    looks up the `posts` controller in the container, making it easy to reference
    other controllers.
  
    @method inject
    @static
    @for @ember/controller
    @since 1.10.0
    @param {String} name (optional) name of the controller to inject, defaults to
           the property's name
    @return {ComputedDecorator} injection decorator instance
    @public
  */

  function inject() {
    return _metal.inject.apply(void 0, ['controller'].concat(Array.prototype.slice.call(arguments)));
  }

  var _default = Controller;
  _exports.default = _default;
});