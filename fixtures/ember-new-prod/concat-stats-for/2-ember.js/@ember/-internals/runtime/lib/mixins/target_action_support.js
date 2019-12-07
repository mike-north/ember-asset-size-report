define("@ember/-internals/runtime/lib/mixins/target_action_support", ["exports", "@ember/-internals/environment", "@ember/-internals/metal", "@ember/debug"], function (_exports, _environment, _metal, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */

  /**
  `Ember.TargetActionSupport` is a mixin that can be included in a class
  to add a `triggerAction` method with semantics similar to the Handlebars
  `{{action}}` helper. In normal Ember usage, the `{{action}}` helper is
  usually the best choice. This mixin is most often useful when you are
  doing more complex event handling in Components.
  
  @class TargetActionSupport
  @namespace Ember
  @extends Mixin
  @private
  */
  var _default = _metal.Mixin.create({
    target: null,
    action: null,
    actionContext: null,
    actionContextObject: (0, _metal.computed)('actionContext', function () {
      var actionContext = (0, _metal.get)(this, 'actionContext');

      if (typeof actionContext === 'string') {
        var value = (0, _metal.get)(this, actionContext);

        if (value === undefined) {
          value = (0, _metal.get)(_environment.context.lookup, actionContext);
        }

        return value;
      } else {
        return actionContext;
      }
    }),

    /**
    Send an `action` with an `actionContext` to a `target`. The action, actionContext
    and target will be retrieved from properties of the object. For example:
     ```javascript
    import { alias } from '@ember/object/computed';
     App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
      target: alias('controller'),
      action: 'save',
      actionContext: alias('context'),
      click() {
        this.triggerAction(); // Sends the `save` action, along with the current context
                              // to the current controller
      }
    });
    ```
     The `target`, `action`, and `actionContext` can be provided as properties of
    an optional object argument to `triggerAction` as well.
     ```javascript
    App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
      click() {
        this.triggerAction({
          action: 'save',
          target: this.get('controller'),
          actionContext: this.get('context')
        }); // Sends the `save` action, along with the current context
            // to the current controller
      }
    });
    ```
     The `actionContext` defaults to the object you are mixing `TargetActionSupport` into.
    But `target` and `action` must be specified either as properties or with the argument
    to `triggerAction`, or a combination:
     ```javascript
    import { alias } from '@ember/object/computed';
     App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
      target: alias('controller'),
      click() {
        this.triggerAction({
          action: 'save'
        }); // Sends the `save` action, along with a reference to `this`,
            // to the current controller
      }
    });
    ```
     @method triggerAction
    @param opts {Object} (optional, with the optional keys action, target and/or actionContext)
    @return {Boolean} true if the action was sent successfully and did not return false
    @private
    */
    triggerAction: function triggerAction(opts) {
      if (opts === void 0) {
        opts = {};
      }

      var _opts = opts,
          action = _opts.action,
          target = _opts.target,
          actionContext = _opts.actionContext;
      action = action || (0, _metal.get)(this, 'action');
      target = target || getTarget(this);

      if (actionContext === undefined) {
        actionContext = (0, _metal.get)(this, 'actionContextObject') || this;
      }

      if (target && action) {
        var ret;

        if (target.send) {
          var _target;

          ret = (_target = target).send.apply(_target, [action].concat(actionContext));
        } else {
          var _target2;

          (false && !(typeof target[action] === 'function') && (0, _debug.assert)("The action '" + action + "' did not exist on " + target, typeof target[action] === 'function'));
          ret = (_target2 = target)[action].apply(_target2, [].concat(actionContext));
        }

        if (ret !== false) {
          return true;
        }
      }

      return false;
    }
  });

  _exports.default = _default;

  function getTarget(instance) {
    var target = (0, _metal.get)(instance, 'target');

    if (target) {
      if (typeof target === 'string') {
        var value = (0, _metal.get)(instance, target);

        if (value === undefined) {
          value = (0, _metal.get)(_environment.context.lookup, target);
        }

        return value;
      } else {
        return target;
      }
    }

    if (instance._target) {
      return instance._target;
    }

    return null;
  }
});