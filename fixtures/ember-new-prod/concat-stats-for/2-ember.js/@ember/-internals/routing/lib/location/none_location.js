define("@ember/-internals/routing/lib/location/none_location", ["exports", "ember-babel", "@ember/-internals/metal", "@ember/-internals/runtime", "@ember/debug"], function (_exports, _emberBabel, _metal, _runtime, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/routing
  */

  /**
    NoneLocation does not interact with the browser. It is useful for
    testing, or when you need to manage state with your Router, but temporarily
    don't want it to muck with the URL (for example when you embed your
    application in a larger page).
  
    Using `NoneLocation` causes Ember to not store the applications URL state
    in the actual URL. This is generally used for testing purposes, and is one
    of the changes made when calling `App.setupForTesting()`.
  
    @class NoneLocation
    @extends EmberObject
    @protected
  */
  var NoneLocation =
  /*#__PURE__*/
  function (_EmberObject) {
    (0, _emberBabel.inheritsLoose)(NoneLocation, _EmberObject);

    function NoneLocation() {
      var _this;

      _this = _EmberObject.apply(this, arguments) || this;
      _this.implementation = 'none';
      return _this;
    }

    var _proto = NoneLocation.prototype;

    _proto.detect = function detect() {
      var rootURL = this.rootURL;
      (false && !(rootURL.charAt(rootURL.length - 1) === '/') && (0, _debug.assert)('rootURL must end with a trailing forward slash e.g. "/app/"', rootURL.charAt(rootURL.length - 1) === '/'));
    }
    /**
      Returns the current path without `rootURL`.
         @private
      @method getURL
      @return {String} path
    */
    ;

    _proto.getURL = function getURL() {
      var path = this.path,
          rootURL = this.rootURL; // remove trailing slashes if they exists

      rootURL = rootURL.replace(/\/$/, ''); // remove rootURL from url

      return path.replace(new RegExp("^" + rootURL + "(?=/|$)"), '');
    }
    /**
      Set the path and remembers what was set. Using this method
      to change the path will not invoke the `updateURL` callback.
         @private
      @method setURL
      @param path {String}
    */
    ;

    _proto.setURL = function setURL(path) {
      (0, _metal.set)(this, 'path', path);
    }
    /**
      Register a callback to be invoked when the path changes. These
      callbacks will execute when the user presses the back or forward
      button, but not after `setURL` is invoked.
         @private
      @method onUpdateURL
      @param callback {Function}
    */
    ;

    _proto.onUpdateURL = function onUpdateURL(callback) {
      this.updateCallback = callback;
    }
    /**
      Sets the path and calls the `updateURL` callback.
         @private
      @method handleURL
      @param url {String}
    */
    ;

    _proto.handleURL = function handleURL(url) {
      (0, _metal.set)(this, 'path', url);
      this.updateCallback(url);
    }
    /**
      Given a URL, formats it to be placed into the page as part
      of an element's `href` attribute.
         This is used, for example, when using the {{action}} helper
      to generate a URL based on an event.
         @private
      @method formatURL
      @param url {String}
      @return {String} url
    */
    ;

    _proto.formatURL = function formatURL(url) {
      var rootURL = this.rootURL;

      if (url !== '') {
        // remove trailing slashes if they exists
        rootURL = rootURL.replace(/\/$/, '');
      }

      return rootURL + url;
    };

    return NoneLocation;
  }(_runtime.Object);

  _exports.default = NoneLocation;
  NoneLocation.reopen({
    path: '',

    /**
      Will be pre-pended to path.
         @private
      @property rootURL
      @default '/'
    */
    rootURL: '/'
  });
});