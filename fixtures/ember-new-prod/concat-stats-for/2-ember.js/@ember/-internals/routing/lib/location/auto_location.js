define("@ember/-internals/routing/lib/location/auto_location", ["exports", "ember-babel", "@ember/-internals/browser-environment", "@ember/-internals/metal", "@ember/-internals/owner", "@ember/-internals/runtime", "@ember/-internals/utils", "@ember/debug", "@ember/-internals/routing/lib/location/util"], function (_exports, _emberBabel, _browserEnvironment, _metal, _owner, _runtime, _utils, _debug, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getHistoryPath = getHistoryPath;
  _exports.getHashPath = getHashPath;
  _exports.default = void 0;

  /**
  @module @ember/routing
  */

  /**
    AutoLocation will select the best location option based off browser
    support with the priority order: history, hash, none.
  
    Clean pushState paths accessed by hashchange-only browsers will be redirected
    to the hash-equivalent and vice versa so future transitions are consistent.
  
    Keep in mind that since some of your users will use `HistoryLocation`, your
    server must serve the Ember app at all the routes you define.
  
    Browsers that support the `history` API will use `HistoryLocation`, those that
    do not, but still support the `hashchange` event will use `HashLocation`, and
    in the rare case neither is supported will use `NoneLocation`.
  
    Example:
  
    ```app/router.js
    Router.map(function() {
      this.route('posts', function() {
        this.route('new');
      });
    });
  
    Router.reopen({
      location: 'auto'
    });
    ```
  
    This will result in a posts.new url of `/posts/new` for modern browsers that
    support the `history` api or `/#/posts/new` for older ones, like Internet
    Explorer 9 and below.
  
    When a user visits a link to your application, they will be automatically
    upgraded or downgraded to the appropriate `Location` class, with the URL
    transformed accordingly, if needed.
  
    Keep in mind that since some of your users will use `HistoryLocation`, your
    server must serve the Ember app at all the routes you define.
  
    @class AutoLocation
    @static
    @protected
  */
  var AutoLocation =
  /*#__PURE__*/
  function (_EmberObject) {
    (0, _emberBabel.inheritsLoose)(AutoLocation, _EmberObject);

    function AutoLocation() {
      var _this;

      _this = _EmberObject.apply(this, arguments) || this;
      _this.implementation = 'auto';
      return _this;
    }
    /**
     Called by the router to instruct the location to do any feature detection
     necessary. In the case of AutoLocation, we detect whether to use history
     or hash concrete implementations.
        @private
    */


    var _proto = AutoLocation.prototype;

    _proto.detect = function detect() {
      var rootURL = this.rootURL;
      (false && !(rootURL.charAt(rootURL.length - 1) === '/') && (0, _debug.assert)('rootURL must end with a trailing forward slash e.g. "/app/"', rootURL.charAt(rootURL.length - 1) === '/'));
      var implementation = detectImplementation({
        location: this.location,
        history: this.history,
        userAgent: this.userAgent,
        rootURL: rootURL,
        documentMode: this.documentMode,
        global: this.global
      });

      if (implementation === false) {
        (0, _metal.set)(this, 'cancelRouterSetup', true);
        implementation = 'none';
      }

      var concrete = (0, _owner.getOwner)(this).lookup("location:" + implementation);
      (false && !(concrete !== undefined) && (0, _debug.assert)("Could not find location '" + implementation + "'.", concrete !== undefined));
      (0, _metal.set)(concrete, 'rootURL', rootURL);
      (0, _metal.set)(this, 'concreteImplementation', concrete);
    };

    _proto.willDestroy = function willDestroy() {
      var concreteImplementation = this.concreteImplementation;

      if (concreteImplementation) {
        concreteImplementation.destroy();
      }
    };

    return AutoLocation;
  }(_runtime.Object);

  _exports.default = AutoLocation;
  AutoLocation.reopen({
    /**
      @private
         Will be pre-pended to path upon state change.
         @since 1.5.1
      @property rootURL
      @default '/'
    */
    rootURL: '/',
    initState: delegateToConcreteImplementation('initState'),
    getURL: delegateToConcreteImplementation('getURL'),
    setURL: delegateToConcreteImplementation('setURL'),
    replaceURL: delegateToConcreteImplementation('replaceURL'),
    onUpdateURL: delegateToConcreteImplementation('onUpdateURL'),
    formatURL: delegateToConcreteImplementation('formatURL'),

    /**
      @private
         The browser's `location` object. This is typically equivalent to
      `window.location`, but may be overridden for testing.
         @property location
      @default environment.location
    */
    location: _browserEnvironment.location,

    /**
      @private
         The browser's `history` object. This is typically equivalent to
      `window.history`, but may be overridden for testing.
         @since 1.5.1
      @property history
      @default environment.history
    */
    history: _browserEnvironment.history,

    /**
     @private
        The user agent's global variable. In browsers, this will be `window`.
        @since 1.11
     @property global
     @default window
    */
    global: _browserEnvironment.window,

    /**
      @private
         The browser's `userAgent`. This is typically equivalent to
      `navigator.userAgent`, but may be overridden for testing.
         @since 1.5.1
      @property userAgent
      @default environment.history
    */
    userAgent: _browserEnvironment.userAgent,

    /**
      @private
         This property is used by the router to know whether to cancel the routing
      setup process, which is needed while we redirect the browser.
         @since 1.5.1
      @property cancelRouterSetup
      @default false
    */
    cancelRouterSetup: false
  });

  function delegateToConcreteImplementation(methodName) {
    return function () {
      var concreteImplementation = this.concreteImplementation;
      (false && !(Boolean(concreteImplementation)) && (0, _debug.assert)("AutoLocation's detect() method should be called before calling any other hooks.", Boolean(concreteImplementation)));

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (0, _utils.tryInvoke)(concreteImplementation, methodName, args);
    };
  }

  function detectImplementation(options) {
    var location = options.location,
        userAgent = options.userAgent,
        history = options.history,
        documentMode = options.documentMode,
        global = options.global,
        rootURL = options.rootURL;
    var implementation = 'none';
    var cancelRouterSetup = false;
    var currentPath = (0, _util.getFullPath)(location);

    if ((0, _util.supportsHistory)(userAgent, history)) {
      var historyPath = getHistoryPath(rootURL, location); // If the browser supports history and we have a history path, we can use
      // the history location with no redirects.

      if (currentPath === historyPath) {
        implementation = 'history';
      } else if (currentPath.substr(0, 2) === '/#') {
        history.replaceState({
          path: historyPath
        }, '', historyPath);
        implementation = 'history';
      } else {
        cancelRouterSetup = true;
        (0, _util.replacePath)(location, historyPath);
      }
    } else if ((0, _util.supportsHashChange)(documentMode, global)) {
      var hashPath = getHashPath(rootURL, location); // Be sure we're using a hashed path, otherwise let's switch over it to so
      // we start off clean and consistent. We'll count an index path with no
      // hash as "good enough" as well.

      if (currentPath === hashPath || currentPath === '/' && hashPath === '/#/') {
        implementation = 'hash';
      } else {
        // Our URL isn't in the expected hash-supported format, so we want to
        // cancel the router setup and replace the URL to start off clean
        cancelRouterSetup = true;
        (0, _util.replacePath)(location, hashPath);
      }
    }

    if (cancelRouterSetup) {
      return false;
    }

    return implementation;
  }
  /**
    @private
  
    Returns the current path as it should appear for HistoryLocation supported
    browsers. This may very well differ from the real current path (e.g. if it
    starts off as a hashed URL)
  */


  function getHistoryPath(rootURL, location) {
    var path = (0, _util.getPath)(location);
    var hash = (0, _util.getHash)(location);
    var query = (0, _util.getQuery)(location);
    var rootURLIndex = path.indexOf(rootURL);
    var routeHash, hashParts;
    (false && !(rootURLIndex === 0) && (0, _debug.assert)("Path " + path + " does not start with the provided rootURL " + rootURL, rootURLIndex === 0)); // By convention, Ember.js routes using HashLocation are required to start
    // with `#/`. Anything else should NOT be considered a route and should
    // be passed straight through, without transformation.

    if (hash.substr(0, 2) === '#/') {
      // There could be extra hash segments after the route
      hashParts = hash.substr(1).split('#'); // The first one is always the route url

      routeHash = hashParts.shift(); // If the path already has a trailing slash, remove the one
      // from the hashed route so we don't double up.

      if (path.charAt(path.length - 1) === '/') {
        routeHash = routeHash.substr(1);
      } // This is the "expected" final order


      path += routeHash + query;

      if (hashParts.length) {
        path += "#" + hashParts.join('#');
      }
    } else {
      path += query + hash;
    }

    return path;
  }
  /**
    @private
  
    Returns the current path as it should appear for HashLocation supported
    browsers. This may very well differ from the real current path.
  
    @method _getHashPath
  */


  function getHashPath(rootURL, location) {
    var path = rootURL;
    var historyPath = getHistoryPath(rootURL, location);
    var routePath = historyPath.substr(rootURL.length);

    if (routePath !== '') {
      if (routePath[0] !== '/') {
        routePath = "/" + routePath;
      }

      path += "#" + routePath;
    }

    return path;
  }
});