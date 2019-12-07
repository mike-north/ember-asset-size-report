define("@ember/object/index", ["exports", "@ember/debug", "@ember/polyfills", "@ember/-internals/metal"], function (_exports, _debug, _polyfills, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.action = action;

  /**
    Decorator that turns the target function into an Action which can be accessed
    directly by reference.
  
    ```js
    import Component from '@ember/component';
    import { action, set } from '@ember/object';
  
    export default class Tooltip extends Component {
      @action
      toggleShowing() {
        set(this, 'isShowing', !this.isShowing);
      }
    }
    ```
    ```hbs
    <!-- template.hbs -->
    <button {{action this.toggleShowing}}>Show tooltip</button>
  
    {{#if isShowing}}
      <div class="tooltip">
        I'm a tooltip!
      </div>
    {{/if}}
    ```
  
    Decorated actions also interop with the string style template actions:
  
    ```hbs
    <!-- template.hbs -->
    <button {{action "toggleShowing"}}>Show tooltip</button>
  
    {{#if isShowing}}
      <div class="tooltip">
        I'm a tooltip!
      </div>
    {{/if}}
    ```
  
    It also binds the function directly to the instance, so it can be used in any
    context and will correctly refer to the class it came from:
  
    ```hbs
    <!-- template.hbs -->
    <button
      {{did-insert this.toggleShowing}}
      {{on "click" this.toggleShowing}}
    >
      Show tooltip
    </button>
  
    {{#if isShowing}}
      <div class="tooltip">
        I'm a tooltip!
      </div>
    {{/if}}
    ```
  
    This can also be used in JavaScript code directly:
  
    ```js
    import Component from '@ember/component';
    import { action, set } from '@ember/object';
  
    export default class Tooltip extends Component {
      constructor() {
        super(...arguments);
  
        // this.toggleShowing is still bound correctly when added to
        // the event listener
        document.addEventListener('click', this.toggleShowing);
      }
  
      @action
      toggleShowing() {
        set(this, 'isShowing', !this.isShowing);
      }
    }
    ```
  
    This is considered best practice, since it means that methods will be bound
    correctly no matter where they are used. By contrast, the `{{action}}` helper
    and modifier can also be used to bind context, but it will be required for
    every usage of the method:
  
    ```hbs
    <!-- template.hbs -->
    <button
      {{did-insert (action this.toggleShowing)}}
      {{on "click" (action this.toggleShowing)}}
    >
      Show tooltip
    </button>
  
    {{#if isShowing}}
      <div class="tooltip">
        I'm a tooltip!
      </div>
    {{/if}}
    ```
  
    They also do not have equivalents in JavaScript directly, so they cannot be
    used for other situations where binding would be useful.
  
    @public
    @method action
    @for @ember/object
    @static
    @param {Function|undefined} callback The function to turn into an action,
                                         when used in classic classes
    @return {PropertyDecorator} property decorator instance
  */
  var BINDINGS_MAP = new WeakMap();

  function setupAction(target, key, actionFn) {
    if (target.constructor !== undefined && typeof target.constructor.proto === 'function') {
      target.constructor.proto();
    }

    if (!target.hasOwnProperty('actions')) {
      var parentActions = target.actions; // we need to assign because of the way mixins copy actions down when inheriting

      target.actions = parentActions ? (0, _polyfills.assign)({}, parentActions) : {};
    }

    target.actions[key] = actionFn;
    return {
      get: function get() {
        var bindings = BINDINGS_MAP.get(this);

        if (bindings === undefined) {
          bindings = new Map();
          BINDINGS_MAP.set(this, bindings);
        }

        var fn = bindings.get(actionFn);

        if (fn === undefined) {
          fn = actionFn.bind(this);
          bindings.set(actionFn, fn);
        }

        return fn;
      }
    };
  }

  function action(target, key, desc) {
    var actionFn;

    if (!(0, _metal.isElementDescriptor)([target, key, desc])) {
      actionFn = target;

      var decorator = function decorator(target, key, desc, meta, isClassicDecorator) {
        (false && !(isClassicDecorator) && (0, _debug.assert)('The @action decorator may only be passed a method when used in classic classes. You should decorate methods directly in native classes', isClassicDecorator));
        (false && !(typeof actionFn === 'function') && (0, _debug.assert)('The action() decorator must be passed a method when used in classic classes', typeof actionFn === 'function'));
        return setupAction(target, key, actionFn);
      };

      (0, _metal.setClassicDecorator)(decorator);
      return decorator;
    }

    actionFn = desc.value;
    (false && !(typeof actionFn === 'function') && (0, _debug.assert)('The @action decorator must be applied to methods when used in native classes', typeof actionFn === 'function'));
    return setupAction(target, key, actionFn);
  }

  (0, _metal.setClassicDecorator)(action);
});