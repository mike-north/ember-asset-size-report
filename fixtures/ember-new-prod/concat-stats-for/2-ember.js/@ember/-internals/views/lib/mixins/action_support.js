define("@ember/-internals/views/lib/mixins/action_support", ["exports", "@ember/-internals/utils", "@ember/-internals/metal", "@ember/debug", "@ember/-internals/views/lib/compat/attrs", "@ember/deprecated-features"], function (_exports, _utils, _metal, _debug, _attrs, _deprecatedFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   @module ember
  */
  var mixinObj = {
    send: function send(actionName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (false && !(!this.isDestroying && !this.isDestroyed) && (0, _debug.assert)("Attempted to call .send() with the action '" + actionName + "' on the destroyed object '" + this + "'.", !this.isDestroying && !this.isDestroyed));
      var action = this.actions && this.actions[actionName];

      if (action) {
        var shouldBubble = action.apply(this, args) === true;

        if (!shouldBubble) {
          return;
        }
      }

      var target = (0, _metal.get)(this, 'target');

      if (target) {
        (false && !(typeof target.send === 'function') && (0, _debug.assert)("The `target` for " + this + " (" + target + ") does not have a `send` method", typeof target.send === 'function'));
        target.send.apply(target, arguments);
      } else {
        (false && !(action) && (0, _debug.assert)((0, _utils.inspect)(this) + " had no action handler for: " + actionName, action));
      }
    }
  };

  if (_deprecatedFeatures.SEND_ACTION) {
    /**
      Calls an action passed to a component.
       For example a component for playing or pausing music may translate click events
      into action notifications of "play" or "stop" depending on some internal state
      of the component:
       ```app/components/play-button.js
      import Component from '@ember/component';
       export default Component.extend({
        click() {
          if (this.get('isPlaying')) {
            this.sendAction('play');
          } else {
            this.sendAction('stop');
          }
        }
      });
      ```
       The actions "play" and "stop" must be passed to this `play-button` component:
       ```handlebars
      {{! app/templates/application.hbs }}
      {{play-button play=(action "musicStarted") stop=(action "musicStopped")}}
      ```
       When the component receives a browser `click` event it translate this
      interaction into application-specific semantics ("play" or "stop") and
      calls the specified action.
       ```app/controller/application.js
      import Controller from '@ember/controller';
       export default Controller.extend({
        actions: {
          musicStarted() {
            // called when the play button is clicked
            // and the music started playing
          },
          musicStopped() {
            // called when the play button is clicked
            // and the music stopped playing
          }
        }
      });
      ```
       If no action is passed to `sendAction` a default name of "action"
      is assumed.
       ```app/components/next-button.js
      import Component from '@ember/component';
       export default Component.extend({
        click() {
          this.sendAction();
        }
      });
      ```
       ```handlebars
      {{! app/templates/application.hbs }}
      {{next-button action=(action "playNextSongInAlbum")}}
      ```
       ```app/controllers/application.js
      import Controller from '@ember/controller';
       export default Controller.extend({
        actions: {
          playNextSongInAlbum() {
            ...
          }
        }
      });
      ```
       @method sendAction
      @param [action] {String} the action to call
      @param [params] {*} arguments for the action
      @public
      @deprecated
    */
    var sendAction = function sendAction(action) {
      (false && !(!this.isDestroying && !this.isDestroyed) && (0, _debug.assert)("Attempted to call .sendAction() with the action '" + action + "' on the destroyed object '" + this + "'.", !this.isDestroying && !this.isDestroyed));
      (false && !(false) && (0, _debug.deprecate)("You called " + (0, _utils.inspect)(this) + ".sendAction(" + (typeof action === 'string' ? "\"" + action + "\"" : '') + ") but Component#sendAction is deprecated. Please use closure actions instead.", false, {
        id: 'ember-component.send-action',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_ember-component-send-action'
      }));
      var actionName; // Send the default action

      if (action === undefined) {
        action = 'action';
      }

      actionName = (0, _metal.get)(this, "attrs." + action) || (0, _metal.get)(this, action);
      actionName = validateAction(this, actionName); // If no action name for that action could be found, just abort.

      if (actionName === undefined) {
        return;
      }

      for (var _len2 = arguments.length, contexts = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        contexts[_key2 - 1] = arguments[_key2];
      }

      if (typeof actionName === 'function') {
        actionName.apply(void 0, contexts);
      } else {
        this.triggerAction({
          action: actionName,
          actionContext: contexts
        });
      }
    };

    var validateAction = function validateAction(component, actionName) {
      if (actionName && actionName[_attrs.MUTABLE_CELL]) {
        actionName = actionName.value;
      }

      (false && !(actionName === null || actionName === undefined || typeof actionName === 'string' || typeof actionName === 'function') && (0, _debug.assert)("The default action was triggered on the component " + component.toString() + ", but the action name (" + actionName + ") was not a string.", actionName === null || actionName === undefined || typeof actionName === 'string' || typeof actionName === 'function'));
      return actionName;
    };

    mixinObj.sendAction = sendAction;
  }
  /**
   @class ActionSupport
   @namespace Ember
   @private
  */


  var _default = _metal.Mixin.create(mixinObj);

  _exports.default = _default;
});