define("@ember/-internals/views/lib/system/jquery", ["exports", "@ember/-internals/environment", "@ember/-internals/browser-environment", "@ember/deprecated-features"], function (_exports, _environment, _browserEnvironment, _deprecatedFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.jQueryDisabled = _exports.jQuery = void 0;
  var jQuery;
  _exports.jQuery = jQuery;
  var jQueryDisabled = !_deprecatedFeatures.JQUERY_INTEGRATION || _environment.ENV._JQUERY_INTEGRATION === false;
  _exports.jQueryDisabled = jQueryDisabled;

  if (_deprecatedFeatures.JQUERY_INTEGRATION && _browserEnvironment.hasDOM) {
    _exports.jQuery = jQuery = _environment.context.imports.jQuery;

    if (!jQueryDisabled && jQuery) {
      if (jQuery.event.addProp) {
        jQuery.event.addProp('dataTransfer');
      } else {
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html#dndevents
        ['dragstart', 'drag', 'dragenter', 'dragleave', 'dragover', 'drop', 'dragend'].forEach(function (eventName) {
          jQuery.event.fixHooks[eventName] = {
            props: ['dataTransfer']
          };
        });
      }
    } else {
      _exports.jQuery = jQuery = undefined;
      _exports.jQueryDisabled = jQueryDisabled = true;
    }
  }
});