define("@ember/-internals/routing/lib/location/history_location", ["exports", "ember-babel", "@ember/-internals/metal", "@ember/-internals/runtime", "@ember/-internals/routing/lib/location/util"], function (_exports, _emberBabel, _metal, _runtime, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/routing
  */
  var popstateFired = false;

  function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  /**
    HistoryLocation implements the location API using the browser's
    history.pushState API.
  
    Using `HistoryLocation` results in URLs that are indistinguishable from a
    standard URL. This relies upon the browser's `history` API.
  
    Example:
  
    ```app/router.js
    Router.map(function() {
      this.route('posts', function() {
        this.route('new');
      });
    });
  
    Router.reopen({
      location: 'history'
    });
    ```
  
    This will result in a posts.new url of `/posts/new`.
  
    Keep in mind that your server must serve the Ember app at all the routes you
    define.
  
    @class HistoryLocation
    @extends EmberObject
    @protected
  */


  var HistoryLocation =
  /*#__PURE__*/
  function (_EmberObject) {
    (0, _emberBabel.inheritsLoose)(HistoryLocation, _EmberObject);

    function HistoryLocation() {
      var _this;

      _this = _EmberObject.apply(this, arguments) || this;
      _this.implementation = 'history';
      /**
        Will be pre-pended to path upon state change
               @property rootURL
        @default '/'
        @private
      */

      _this.rootURL = '/';
      return _this;
    }
    /**
      @private
         Returns normalized location.hash
         @method getHash
    */


    var _proto = HistoryLocation.prototype;

    _proto.getHash = function getHash() {
      return (0, _util.getHash)(this.location);
    };

    _proto.init = function init() {
      this._super.apply(this, arguments);

      var base = document.querySelector('base');
      var baseURL = '';

      if (base) {
        baseURL = base.getAttribute('href');
      }

      (0, _metal.set)(this, 'baseURL', baseURL);
      (0, _metal.set)(this, 'location', this.location || window.location);
      this._popstateHandler = undefined;
    }
    /**
      Used to set state on first call to setURL
         @private
      @method initState
    */
    ;

    _proto.initState = function initState() {
      var history = this.history || window.history;
      (0, _metal.set)(this, 'history', history);

      if (history && 'state' in history) {
        this.supportsHistory = true;
      }

      var state = this.getState();
      var path = this.formatURL(this.getURL());

      if (state && state.path === path) {
        // preserve existing state
        // used for webkit workaround, since there will be no initial popstate event
        this._previousURL = this.getURL();
      } else {
        this.replaceState(path);
      }
    }
    /**
      Returns the current `location.pathname` without `rootURL` or `baseURL`
         @private
      @method getURL
      @return url {String}
    */
    ;

    _proto.getURL = function getURL() {
      var location = this.location,
          rootURL = this.rootURL,
          baseURL = this.baseURL;
      var path = location.pathname; // remove trailing slashes if they exists

      rootURL = rootURL.replace(/\/$/, '');
      baseURL = baseURL.replace(/\/$/, ''); // remove baseURL and rootURL from start of path

      var url = path.replace(new RegExp("^" + baseURL + "(?=/|$)"), '').replace(new RegExp("^" + rootURL + "(?=/|$)"), '').replace(/\/\//g, '/'); // remove extra slashes

      var search = location.search || '';
      url += search + this.getHash();
      return url;
    }
    /**
      Uses `history.pushState` to update the url without a page reload.
         @private
      @method setURL
      @param path {String}
    */
    ;

    _proto.setURL = function setURL(path) {
      var state = this.getState();
      path = this.formatURL(path);

      if (!state || state.path !== path) {
        this.pushState(path);
      }
    }
    /**
      Uses `history.replaceState` to update the url without a page reload
      or history modification.
         @private
      @method replaceURL
      @param path {String}
    */
    ;

    _proto.replaceURL = function replaceURL(path) {
      var state = this.getState();
      path = this.formatURL(path);

      if (!state || state.path !== path) {
        this.replaceState(path);
      }
    }
    /**
      Get the current `history.state`. Checks for if a polyfill is
      required and if so fetches this._historyState. The state returned
      from getState may be null if an iframe has changed a window's
      history.
         The object returned will contain a `path` for the given state as well
      as a unique state `id`. The state index will allow the app to distinguish
      between two states with similar paths but should be unique from one another.
         @private
      @method getState
      @return state {Object}
    */
    ;

    _proto.getState = function getState() {
      if (this.supportsHistory) {
        return this.history.state;
      }

      return this._historyState;
    }
    /**
     Pushes a new state.
        @private
     @method pushState
     @param path {String}
    */
    ;

    _proto.pushState = function pushState(path) {
      var state = {
        path: path,
        uuid: _uuid()
      };
      this.history.pushState(state, null, path);
      this._historyState = state; // used for webkit workaround

      this._previousURL = this.getURL();
    }
    /**
     Replaces the current state.
        @private
     @method replaceState
     @param path {String}
    */
    ;

    _proto.replaceState = function replaceState(path) {
      var state = {
        path: path,
        uuid: _uuid()
      };
      this.history.replaceState(state, null, path);
      this._historyState = state; // used for webkit workaround

      this._previousURL = this.getURL();
    }
    /**
      Register a callback to be invoked whenever the browser
      history changes, including using forward and back buttons.
         @private
      @method onUpdateURL
      @param callback {Function}
    */
    ;

    _proto.onUpdateURL = function onUpdateURL(callback) {
      var _this2 = this;

      this._removeEventListener();

      this._popstateHandler = function () {
        // Ignore initial page load popstate event in Chrome
        if (!popstateFired) {
          popstateFired = true;

          if (_this2.getURL() === _this2._previousURL) {
            return;
          }
        }

        callback(_this2.getURL());
      };

      window.addEventListener('popstate', this._popstateHandler);
    }
    /**
      Used when using `{{action}}` helper.  The url is always appended to the rootURL.
         @private
      @method formatURL
      @param url {String}
      @return formatted url {String}
    */
    ;

    _proto.formatURL = function formatURL(url) {
      var rootURL = this.rootURL,
          baseURL = this.baseURL;

      if (url !== '') {
        // remove trailing slashes if they exists
        rootURL = rootURL.replace(/\/$/, '');
        baseURL = baseURL.replace(/\/$/, '');
      } else if (baseURL[0] === '/' && rootURL[0] === '/') {
        // if baseURL and rootURL both start with a slash
        // ... remove trailing slash from baseURL if it exists
        baseURL = baseURL.replace(/\/$/, '');
      }

      return baseURL + rootURL + url;
    }
    /**
      Cleans up the HistoryLocation event listener.
         @private
      @method willDestroy
    */
    ;

    _proto.willDestroy = function willDestroy() {
      this._removeEventListener();
    };

    _proto._removeEventListener = function _removeEventListener() {
      if (this._popstateHandler) {
        window.removeEventListener('popstate', this._popstateHandler);
      }
    };

    return HistoryLocation;
  }(_runtime.Object);

  _exports.default = HistoryLocation;
});