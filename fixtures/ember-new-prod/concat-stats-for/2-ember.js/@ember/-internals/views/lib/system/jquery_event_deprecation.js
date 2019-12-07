define("@ember/-internals/views/lib/system/jquery_event_deprecation", ["exports", "@ember/debug", "@ember/-internals/environment", "@ember/-internals/utils", "@ember/deprecated-features"], function (_exports, _debug, _environment, _utils, _deprecatedFeatures) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = addJQueryEventDeprecation;

  /* global Proxy */
  function addJQueryEventDeprecation(jqEvent) {
    if (false
    /* DEBUG */
    && _deprecatedFeatures.JQUERY_INTEGRATION && _utils.HAS_NATIVE_PROXY) {
      var boundFunctions = new Map(); // wrap the jQuery event in a Proxy to add the deprecation message for originalEvent, according to RFC#294
      // we need a native Proxy here, so we can make sure that the internal use of originalEvent in jQuery itself does
      // not trigger a deprecation

      return new Proxy(jqEvent, {
        get: function get(target, name) {
          switch (name) {
            case 'originalEvent':
              (false && !(function (EmberENV) {
                // this deprecation is intentionally checking `global.EmberENV` /
                // `global.ENV` so that we can ensure we _only_ deprecate in the
                // case where jQuery integration is enabled implicitly (e.g.
                // "defaulted" to enabled) as opposed to when the user explicitly
                // opts in to using jQuery
                if (typeof EmberENV !== 'object' || EmberENV === null) return false;
                return EmberENV._JQUERY_INTEGRATION === true;
              }(_environment.global.EmberENV || _environment.global.ENV)) && (0, _debug.deprecate)('Accessing jQuery.Event specific properties is deprecated. Either use the ember-jquery-legacy addon to normalize events to native events, or explicitly opt into jQuery integration using @ember/optional-features.', function (EmberENV) {
                if (typeof EmberENV !== 'object' || EmberENV === null) return false;
                return EmberENV._JQUERY_INTEGRATION === true;
              }(_environment.global.EmberENV || _environment.global.ENV), {
                id: 'ember-views.event-dispatcher.jquery-event',
                until: '4.0.0',
                url: 'https://emberjs.com/deprecations/v3.x#toc_jquery-event'
              }));
              return target[name];
            // provide an escape hatch for ember-jquery-legacy to access originalEvent without a deprecation

            case '__originalEvent':
              return target.originalEvent;

            default:
              if (typeof target[name] === 'function') {
                // cache functions for reuse
                if (!boundFunctions.has(name)) {
                  // for jQuery.Event methods call them with `target` as the `this` context, so they will access
                  // `originalEvent` from the original jQuery event, not our proxy, thus not trigger the deprecation
                  boundFunctions.set(name, target[name].bind(target));
                }

                return boundFunctions.get(name);
              } // same for jQuery's getter functions for simple properties


              return target[name];
          }
        }
      });
    }

    return jqEvent;
  }
});