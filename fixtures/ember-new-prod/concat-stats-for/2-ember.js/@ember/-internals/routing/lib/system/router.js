define("@ember/-internals/routing/lib/system/router", ["exports", "ember-babel", "@ember/-internals/metal", "@ember/-internals/owner", "@ember/-internals/runtime", "@ember/debug", "@ember/deprecated-features", "@ember/error", "@ember/polyfills", "@ember/runloop", "@ember/-internals/routing/lib/location/api", "@ember/-internals/routing/lib/utils", "@ember/-internals/routing/lib/system/dsl", "@ember/-internals/routing/lib/system/route", "@ember/-internals/routing/lib/system/router_state", "router_js"], function (_exports, _emberBabel, _metal, _owner, _runtime, _debug, _deprecatedFeatures, _error3, _polyfills, _runloop, _api, _utils, _dsl, _route, _router_state, _router_js) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.triggerEvent = _triggerEvent;
  _exports.default = void 0;

  function defaultDidTransition(infos) {
    updatePaths(this);

    this._cancelSlowTransitionTimer();

    this.notifyPropertyChange('url');
    this.set('currentState', this.targetState); // Put this in the runloop so url will be accurate. Seems
    // less surprising than didTransition being out of sync.

    (0, _runloop.once)(this, this.trigger, 'didTransition');

    if (false
    /* DEBUG */
    ) {
      if ((0, _metal.get)(this, 'namespace').LOG_TRANSITIONS) {
        // eslint-disable-next-line no-console
        console.log("Transitioned into '" + EmberRouter._routePath(infos) + "'");
      }
    }
  }

  function defaultWillTransition(oldInfos, newInfos, transition) {
    (0, _runloop.once)(this, this.trigger, 'willTransition', transition);

    if (false
    /* DEBUG */
    ) {
      if ((0, _metal.get)(this, 'namespace').LOG_TRANSITIONS) {
        // eslint-disable-next-line no-console
        console.log("Preparing to transition from '" + EmberRouter._routePath(oldInfos) + "' to '" + EmberRouter._routePath(newInfos) + "'");
      }
    }
  }

  function K() {
    return this;
  }

  var slice = Array.prototype.slice;
  /**
    The `EmberRouter` class manages the application state and URLs. Refer to
    the [routing guide](https://guides.emberjs.com/release/routing/) for documentation.
  
    @class EmberRouter
    @extends EmberObject
    @uses Evented
    @public
  */

  var EmberRouter =
  /*#__PURE__*/
  function (_EmberObject) {
    (0, _emberBabel.inheritsLoose)(EmberRouter, _EmberObject);

    function EmberRouter() {
      var _this;

      _this = _EmberObject.apply(this, arguments) || this;
      _this.currentURL = null;
      _this.currentRouteName = null;
      _this.currentPath = null;
      _this.currentRoute = null;
      _this._qpCache = Object.create(null);
      _this._qpUpdates = new Set();
      _this._handledErrors = new Set();
      _this._engineInstances = Object.create(null);
      _this._engineInfoByRoute = Object.create(null);
      _this.currentState = null;
      _this.targetState = null;

      _this._resetQueuedQueryParameterChanges();

      return _this;
    }

    var _proto = EmberRouter.prototype;

    _proto._initRouterJs = function _initRouterJs() {
      var location = (0, _metal.get)(this, 'location');
      var router = this;
      var owner = (0, _owner.getOwner)(this);
      var seen = Object.create(null);

      var PrivateRouter =
      /*#__PURE__*/
      function (_Router) {
        (0, _emberBabel.inheritsLoose)(PrivateRouter, _Router);

        function PrivateRouter() {
          return _Router.apply(this, arguments) || this;
        }

        var _proto2 = PrivateRouter.prototype;

        _proto2.getRoute = function getRoute(name) {
          var routeName = name;
          var routeOwner = owner;
          var engineInfo = router._engineInfoByRoute[routeName];

          if (engineInfo) {
            var engineInstance = router._getEngineInstance(engineInfo);

            routeOwner = engineInstance;
            routeName = engineInfo.localFullName;
          }

          var fullRouteName = "route:" + routeName;
          var route = routeOwner.lookup(fullRouteName);

          if (seen[name]) {
            return route;
          }

          seen[name] = true;

          if (!route) {
            var DefaultRoute = routeOwner.factoryFor('route:basic').class;
            routeOwner.register(fullRouteName, DefaultRoute.extend());
            route = routeOwner.lookup(fullRouteName);

            if (false
            /* DEBUG */
            ) {
              if ((0, _metal.get)(router, 'namespace.LOG_ACTIVE_GENERATION')) {
                (0, _debug.info)("generated -> " + fullRouteName, {
                  fullName: fullRouteName
                });
              }
            }
          }

          route._setRouteName(routeName);

          if (engineInfo && !(0, _route.hasDefaultSerialize)(route)) {
            throw new Error('Defining a custom serialize method on an Engine route is not supported.');
          }

          return route;
        };

        _proto2.getSerializer = function getSerializer(name) {
          var engineInfo = router._engineInfoByRoute[name]; // If this is not an Engine route, we fall back to the handler for serialization

          if (!engineInfo) {
            return;
          }

          return engineInfo.serializeMethod || _route.defaultSerialize;
        };

        _proto2.updateURL = function updateURL(path) {
          (0, _runloop.once)(function () {
            location.setURL(path);
            (0, _metal.set)(router, 'currentURL', path);
          });
        };

        _proto2.didTransition = function didTransition(infos) {
          if (_deprecatedFeatures.ROUTER_EVENTS) {
            if (router.didTransition !== defaultDidTransition) {
              (false && !(false) && (0, _debug.deprecate)('You attempted to override the "didTransition" method which is deprecated. Please inject the router service and listen to the "routeDidChange" event.', false, {
                id: 'deprecate-router-events',
                until: '4.0.0',
                url: 'https://emberjs.com/deprecations/v3.x#toc_deprecate-router-events'
              }));
            }
          }

          router.didTransition(infos);
        };

        _proto2.willTransition = function willTransition(oldInfos, newInfos, transition) {
          if (_deprecatedFeatures.ROUTER_EVENTS) {
            if (router.willTransition !== defaultWillTransition) {
              (false && !(false) && (0, _debug.deprecate)('You attempted to override the "willTransition" method which is deprecated. Please inject the router service and listen to the "routeWillChange" event.', false, {
                id: 'deprecate-router-events',
                until: '4.0.0',
                url: 'https://emberjs.com/deprecations/v3.x#toc_deprecate-router-events'
              }));
            }
          }

          router.willTransition(oldInfos, newInfos, transition);
        };

        _proto2.triggerEvent = function triggerEvent(routeInfos, ignoreFailure, name, args) {
          return _triggerEvent.bind(router)(routeInfos, ignoreFailure, name, args);
        };

        _proto2.routeWillChange = function routeWillChange(transition) {
          router.trigger('routeWillChange', transition);
        };

        _proto2.routeDidChange = function routeDidChange(transition) {
          router.set('currentRoute', transition.to);
          (0, _runloop.once)(function () {
            router.trigger('routeDidChange', transition);
          });
        };

        _proto2.transitionDidError = function transitionDidError(error, transition) {
          if (error.wasAborted || transition.isAborted) {
            // If the error was a transition erorr or the transition aborted
            // log the abort.
            return (0, _router_js.logAbort)(transition);
          } else {
            // Otherwise trigger the "error" event to attempt an intermediate
            // transition into an error substate
            transition.trigger(false, 'error', error.error, transition, error.route);

            if (router._isErrorHandled(error.error)) {
              // If we handled the error with a substate just roll the state back on
              // the transition and send the "routeDidChange" event for landing on
              // the error substate and return the error.
              transition.rollback();
              this.routeDidChange(transition);
              return error.error;
            } else {
              // If it was not handled, abort the transition completely and return
              // the error.
              transition.abort();
              return error.error;
            }
          }
        };

        _proto2._triggerWillChangeContext = function _triggerWillChangeContext() {
          return router;
        };

        _proto2._triggerWillLeave = function _triggerWillLeave() {
          return router;
        };

        _proto2.replaceURL = function replaceURL(url) {
          if (location.replaceURL) {
            var doReplaceURL = function doReplaceURL() {
              location.replaceURL(url);
              (0, _metal.set)(router, 'currentURL', url);
            };

            (0, _runloop.once)(doReplaceURL);
          } else {
            this.updateURL(url);
          }
        };

        return PrivateRouter;
      }(_router_js.default);

      var routerMicrolib = this._routerMicrolib = new PrivateRouter();
      var dslCallbacks = this.constructor.dslCallbacks || [K];

      var dsl = this._buildDSL();

      dsl.route('application', {
        path: '/',
        resetNamespace: true,
        overrideNameAssertion: true
      }, function () {
        for (var i = 0; i < dslCallbacks.length; i++) {
          dslCallbacks[i].call(this);
        }
      });

      if (false
      /* DEBUG */
      ) {
        if ((0, _metal.get)(this, 'namespace.LOG_TRANSITIONS_INTERNAL')) {
          routerMicrolib.log = console.log.bind(console); // eslint-disable-line no-console
        }
      }

      routerMicrolib.map(dsl.generate());
    };

    _proto._buildDSL = function _buildDSL() {
      var enableLoadingSubstates = this._hasModuleBasedResolver();

      var router = this;
      var owner = (0, _owner.getOwner)(this);
      var options = {
        enableLoadingSubstates: enableLoadingSubstates,
        resolveRouteMap: function resolveRouteMap(name) {
          return owner.factoryFor("route-map:" + name);
        },
        addRouteForEngine: function addRouteForEngine(name, engineInfo) {
          if (!router._engineInfoByRoute[name]) {
            router._engineInfoByRoute[name] = engineInfo;
          }
        }
      };
      return new _dsl.default(null, options);
    }
    /*
      Resets all pending query parameter changes.
      Called after transitioning to a new route
      based on query parameter changes.
    */
    ;

    _proto._resetQueuedQueryParameterChanges = function _resetQueuedQueryParameterChanges() {
      this._queuedQPChanges = {};
    };

    _proto._hasModuleBasedResolver = function _hasModuleBasedResolver() {
      var owner = (0, _owner.getOwner)(this);

      if (!owner) {
        return false;
      }

      var resolver = (0, _metal.get)(owner, 'application.__registry__.resolver.moduleBasedResolver');
      return Boolean(resolver);
    }
    /**
      Initializes the current router instance and sets up the change handling
      event listeners used by the instances `location` implementation.
         A property named `initialURL` will be used to determine the initial URL.
      If no value is found `/` will be used.
         @method startRouting
      @private
    */
    ;

    _proto.startRouting = function startRouting() {
      var initialURL = (0, _metal.get)(this, 'initialURL');

      if (this.setupRouter()) {
        if (initialURL === undefined) {
          initialURL = (0, _metal.get)(this, 'location').getURL();
        }

        var initialTransition = this.handleURL(initialURL);

        if (initialTransition && initialTransition.error) {
          throw initialTransition.error;
        }
      }
    };

    _proto.setupRouter = function setupRouter() {
      var _this2 = this;

      this._setupLocation();

      var location = (0, _metal.get)(this, 'location'); // Allow the Location class to cancel the router setup while it refreshes
      // the page

      if ((0, _metal.get)(location, 'cancelRouterSetup')) {
        return false;
      }

      this._initRouterJs();

      location.onUpdateURL(function (url) {
        _this2.handleURL(url);
      });
      return true;
    };

    _proto._setOutlets = function _setOutlets() {
      // This is triggered async during Route#willDestroy.
      // If the router is also being destroyed we do not want to
      // to create another this._toplevelView (and leak the renderer)
      if (this.isDestroying || this.isDestroyed) {
        return;
      }

      var routeInfos = this._routerMicrolib.currentRouteInfos;
      var route;
      var defaultParentState;
      var liveRoutes = null;

      if (!routeInfos) {
        return;
      }

      for (var i = 0; i < routeInfos.length; i++) {
        route = routeInfos[i].route;

        var connections = _route.ROUTE_CONNECTIONS.get(route);

        var ownState = void 0;

        for (var j = 0; j < connections.length; j++) {
          var appended = appendLiveRoute(liveRoutes, defaultParentState, connections[j]);
          liveRoutes = appended.liveRoutes;

          if (appended.ownState.render.name === route.routeName || appended.ownState.render.outlet === 'main') {
            ownState = appended.ownState;
          }
        }

        if (connections.length === 0) {
          ownState = representEmptyRoute(liveRoutes, defaultParentState, route);
        }

        defaultParentState = ownState;
      } // when a transitionTo happens after the validation phase
      // during the initial transition _setOutlets is called
      // when no routes are active. However, it will get called
      // again with the correct values during the next turn of
      // the runloop


      if (!liveRoutes) {
        return;
      }

      if (!this._toplevelView) {
        var owner = (0, _owner.getOwner)(this);
        var OutletView = owner.factoryFor('view:-outlet');
        this._toplevelView = OutletView.create();

        this._toplevelView.setOutletState(liveRoutes);

        var instance = owner.lookup('-application-instance:main');
        instance.didCreateRootView(this._toplevelView);
      } else {
        this._toplevelView.setOutletState(liveRoutes);
      }
    };

    _proto.handleURL = function handleURL(url) {
      // Until we have an ember-idiomatic way of accessing #hashes, we need to
      // remove it because router.js doesn't know how to handle it.
      var _url = url.split(/#(.+)?/)[0];
      return this._doURLTransition('handleURL', _url);
    };

    _proto._doURLTransition = function _doURLTransition(routerJsMethod, url) {
      var transition = this._routerMicrolib[routerJsMethod](url || '/');

      didBeginTransition(transition, this);
      return transition;
    }
    /**
      Transition the application into another route. The route may
      be either a single route or route path:
         See [transitionTo](/ember/release/classes/Route/methods/transitionTo?anchor=transitionTo) for more info.
         @method transitionTo
      @param {String} name the name of the route or a URL
      @param {...Object} models the model(s) or identifier(s) to be used while
        transitioning to the route.
      @param {Object} [options] optional hash with a queryParams property
        containing a mapping of query parameters
      @return {Transition} the transition object associated with this
        attempted transition
      @public
    */
    ;

    _proto.transitionTo = function transitionTo() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if ((0, _utils.resemblesURL)(args[0])) {
        (false && !(!this.isDestroying && !this.isDestroyed) && (0, _debug.assert)("A transition was attempted from '" + this.currentRouteName + "' to '" + args[0] + "' but the application instance has already been destroyed.", !this.isDestroying && !this.isDestroyed));
        return this._doURLTransition('transitionTo', args[0]);
      }

      var _extractRouteArgs = (0, _utils.extractRouteArgs)(args),
          routeName = _extractRouteArgs.routeName,
          models = _extractRouteArgs.models,
          queryParams = _extractRouteArgs.queryParams;

      (false && !(!this.isDestroying && !this.isDestroyed) && (0, _debug.assert)("A transition was attempted from '" + this.currentRouteName + "' to '" + routeName + "' but the application instance has already been destroyed.", !this.isDestroying && !this.isDestroyed));
      return this._doTransition(routeName, models, queryParams);
    };

    _proto.intermediateTransitionTo = function intermediateTransitionTo(name) {
      var _this$_routerMicrolib;

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      (_this$_routerMicrolib = this._routerMicrolib).intermediateTransitionTo.apply(_this$_routerMicrolib, [name].concat(args));

      updatePaths(this);

      if (false
      /* DEBUG */
      ) {
        var infos = this._routerMicrolib.currentRouteInfos;

        if ((0, _metal.get)(this, 'namespace').LOG_TRANSITIONS) {
          // eslint-disable-next-line no-console
          console.log("Intermediate-transitioned into '" + EmberRouter._routePath(infos) + "'");
        }
      }
    };

    _proto.replaceWith = function replaceWith() {
      return this.transitionTo.apply(this, arguments).method('replace');
    };

    _proto.generate = function generate(name) {
      var _this$_routerMicrolib2;

      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var url = (_this$_routerMicrolib2 = this._routerMicrolib).generate.apply(_this$_routerMicrolib2, [name].concat(args));

      return this.location.formatURL(url);
    }
    /**
      Determines if the supplied route is currently active.
         @method isActive
      @param routeName
      @return {Boolean}
      @private
    */
    ;

    _proto.isActive = function isActive(routeName) {
      return this._routerMicrolib.isActive(routeName);
    }
    /**
      An alternative form of `isActive` that doesn't require
      manual concatenation of the arguments into a single
      array.
         @method isActiveIntent
      @param routeName
      @param models
      @param queryParams
      @return {Boolean}
      @private
      @since 1.7.0
    */
    ;

    _proto.isActiveIntent = function isActiveIntent(routeName, models, queryParams) {
      return this.currentState.isActiveIntent(routeName, models, queryParams);
    };

    _proto.send = function send(name) {
      var _this$_routerMicrolib3;

      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      /*name, context*/
      (_this$_routerMicrolib3 = this._routerMicrolib).trigger.apply(_this$_routerMicrolib3, [name].concat(args));
    }
    /**
      Does this router instance have the given route.
         @method hasRoute
      @return {Boolean}
      @private
    */
    ;

    _proto.hasRoute = function hasRoute(route) {
      return this._routerMicrolib.hasRoute(route);
    }
    /**
      Resets the state of the router by clearing the current route
      handlers and deactivating them.
         @private
      @method reset
     */
    ;

    _proto.reset = function reset() {
      if (this._routerMicrolib) {
        this._routerMicrolib.reset();
      }
    };

    _proto.willDestroy = function willDestroy() {
      if (this._toplevelView) {
        this._toplevelView.destroy();

        this._toplevelView = null;
      }

      this._super.apply(this, arguments);

      this.reset();
      var instances = this._engineInstances;

      for (var name in instances) {
        for (var id in instances[name]) {
          (0, _runloop.run)(instances[name][id], 'destroy');
        }
      }
    }
    /*
      Called when an active route's query parameter has changed.
      These changes are batched into a runloop run and trigger
      a single transition.
    */
    ;

    _proto._activeQPChanged = function _activeQPChanged(queryParameterName, newValue) {
      this._queuedQPChanges[queryParameterName] = newValue;
      (0, _runloop.once)(this, this._fireQueryParamTransition);
    };

    _proto._updatingQPChanged = function _updatingQPChanged(queryParameterName) {
      this._qpUpdates.add(queryParameterName);
    }
    /*
      Triggers a transition to a route based on query parameter changes.
      This is called once per runloop, to batch changes.
         e.g.
         if these methods are called in succession:
      this._activeQPChanged('foo', '10');
        // results in _queuedQPChanges = { foo: '10' }
      this._activeQPChanged('bar', false);
        // results in _queuedQPChanges = { foo: '10', bar: false }
         _queuedQPChanges will represent both of these changes
      and the transition using `transitionTo` will be triggered
      once.
    */
    ;

    _proto._fireQueryParamTransition = function _fireQueryParamTransition() {
      this.transitionTo({
        queryParams: this._queuedQPChanges
      });

      this._resetQueuedQueryParameterChanges();
    };

    _proto._setupLocation = function _setupLocation() {
      var location = this.location;
      var rootURL = this.rootURL;
      var owner = (0, _owner.getOwner)(this);

      if ('string' === typeof location && owner) {
        var resolvedLocation = owner.lookup("location:" + location);

        if (resolvedLocation !== undefined) {
          location = (0, _metal.set)(this, 'location', resolvedLocation);
        } else {
          // Allow for deprecated registration of custom location API's
          var options = {
            implementation: location
          };
          location = (0, _metal.set)(this, 'location', _api.default.create(options));
        }
      }

      if (location !== null && typeof location === 'object') {
        if (rootURL) {
          (0, _metal.set)(location, 'rootURL', rootURL);
        } // Allow the location to do any feature detection, such as AutoLocation
        // detecting history support. This gives it a chance to set its
        // `cancelRouterSetup` property which aborts routing.


        if (typeof location.detect === 'function') {
          location.detect();
        } // ensure that initState is called AFTER the rootURL is set on
        // the location instance


        if (typeof location.initState === 'function') {
          location.initState();
        }
      }
    }
    /**
      Serializes the given query params according to their QP meta information.
         @private
      @method _serializeQueryParams
      @param {Arrray<RouteInfo>} routeInfos
      @param {Object} queryParams
      @return {Void}
    */
    ;

    _proto._serializeQueryParams = function _serializeQueryParams(routeInfos, queryParams) {
      var _this3 = this;

      forEachQueryParam(this, routeInfos, queryParams, function (key, value, qp) {
        if (qp) {
          delete queryParams[key];
          queryParams[qp.urlKey] = qp.route.serializeQueryParam(value, qp.urlKey, qp.type);
        } else if (value === undefined) {
          return; // We don't serialize undefined values
        } else {
          queryParams[key] = _this3._serializeQueryParam(value, (0, _runtime.typeOf)(value));
        }
      });
    }
    /**
      Serializes the value of a query parameter based on a type
         @private
      @method _serializeQueryParam
      @param {Object} value
      @param {String} type
    */
    ;

    _proto._serializeQueryParam = function _serializeQueryParam(value, type) {
      if (value === null || value === undefined) {
        return value;
      } else if (type === 'array') {
        return JSON.stringify(value);
      }

      return "" + value;
    }
    /**
      Deserializes the given query params according to their QP meta information.
         @private
      @method _deserializeQueryParams
      @param {Array<RouteInfo>} routeInfos
      @param {Object} queryParams
      @return {Void}
    */
    ;

    _proto._deserializeQueryParams = function _deserializeQueryParams(routeInfos, queryParams) {
      forEachQueryParam(this, routeInfos, queryParams, function (key, value, qp) {
        // If we don't have QP meta info for a given key, then we do nothing
        // because all values will be treated as strings
        if (qp) {
          delete queryParams[key];
          queryParams[qp.prop] = qp.route.deserializeQueryParam(value, qp.urlKey, qp.type);
        }
      });
    }
    /**
      Deserializes the value of a query parameter based on a default type
         @private
      @method _deserializeQueryParam
      @param {Object} value
      @param {String} defaultType
    */
    ;

    _proto._deserializeQueryParam = function _deserializeQueryParam(value, defaultType) {
      if (value === null || value === undefined) {
        return value;
      } else if (defaultType === 'boolean') {
        return value === 'true';
      } else if (defaultType === 'number') {
        return Number(value).valueOf();
      } else if (defaultType === 'array') {
        return (0, _runtime.A)(JSON.parse(value));
      }

      return value;
    }
    /**
      Removes (prunes) any query params with default values from the given QP
      object. Default values are determined from the QP meta information per key.
         @private
      @method _pruneDefaultQueryParamValues
      @param {Array<RouteInfo>} routeInfos
      @param {Object} queryParams
      @return {Void}
    */
    ;

    _proto._pruneDefaultQueryParamValues = function _pruneDefaultQueryParamValues(routeInfos, queryParams) {
      var qps = this._queryParamsFor(routeInfos);

      for (var key in queryParams) {
        var qp = qps.map[key];

        if (qp && qp.serializedDefaultValue === queryParams[key]) {
          delete queryParams[key];
        }
      }
    };

    _proto._doTransition = function _doTransition(_targetRouteName, models, _queryParams, _keepDefaultQueryParamValues) {
      var _this$_routerMicrolib4;

      var targetRouteName = _targetRouteName || (0, _utils.getActiveTargetName)(this._routerMicrolib);

      (false && !(Boolean(targetRouteName) && this._routerMicrolib.hasRoute(targetRouteName)) && (0, _debug.assert)("The route " + targetRouteName + " was not found", Boolean(targetRouteName) && this._routerMicrolib.hasRoute(targetRouteName)));
      var queryParams = {};

      this._processActiveTransitionQueryParams(targetRouteName, models, queryParams, _queryParams);

      (0, _polyfills.assign)(queryParams, _queryParams);

      this._prepareQueryParams(targetRouteName, models, queryParams, Boolean(_keepDefaultQueryParamValues));

      var transition = (_this$_routerMicrolib4 = this._routerMicrolib).transitionTo.apply(_this$_routerMicrolib4, [targetRouteName].concat(models, [{
        queryParams: queryParams
      }]));

      didBeginTransition(transition, this);
      return transition;
    };

    _proto._processActiveTransitionQueryParams = function _processActiveTransitionQueryParams(targetRouteName, models, queryParams, _queryParams) {
      // merge in any queryParams from the active transition which could include
      // queryParams from the url on initial load.
      if (!this._routerMicrolib.activeTransition) {
        return;
      }

      var unchangedQPs = {};
      var qpUpdates = this._qpUpdates;
      var params = this._routerMicrolib.activeTransition[_router_js.QUERY_PARAMS_SYMBOL];

      for (var key in params) {
        if (!qpUpdates.has(key)) {
          unchangedQPs[key] = params[key];
        }
      } // We need to fully scope queryParams so that we can create one object
      // that represents both passed-in queryParams and ones that aren't changed
      // from the active transition.


      this._fullyScopeQueryParams(targetRouteName, models, _queryParams);

      this._fullyScopeQueryParams(targetRouteName, models, unchangedQPs);

      (0, _polyfills.assign)(queryParams, unchangedQPs);
    }
    /**
      Prepares the query params for a URL or Transition. Restores any undefined QP
      keys/values, serializes all values, and then prunes any default values.
         @private
      @method _prepareQueryParams
      @param {String} targetRouteName
      @param {Array<Object>} models
      @param {Object} queryParams
      @param {boolean} keepDefaultQueryParamValues
      @return {Void}
    */
    ;

    _proto._prepareQueryParams = function _prepareQueryParams(targetRouteName, models, queryParams, _fromRouterService) {
      var state = calculatePostTransitionState(this, targetRouteName, models);

      this._hydrateUnsuppliedQueryParams(state, queryParams, Boolean(_fromRouterService));

      this._serializeQueryParams(state.routeInfos, queryParams);

      if (!_fromRouterService) {
        this._pruneDefaultQueryParamValues(state.routeInfos, queryParams);
      }
    }
    /**
      Returns the meta information for the query params of a given route. This
      will be overridden to allow support for lazy routes.
         @private
      @method _getQPMeta
      @param {RouteInfo} routeInfo
      @return {Object}
    */
    ;

    _proto._getQPMeta = function _getQPMeta(routeInfo) {
      var route = routeInfo.route;
      return route && (0, _metal.get)(route, '_qp');
    }
    /**
      Returns a merged query params meta object for a given set of routeInfos.
      Useful for knowing what query params are available for a given route hierarchy.
         @private
      @method _queryParamsFor
      @param {Array<RouteInfo>} routeInfos
      @return {Object}
     */
    ;

    _proto._queryParamsFor = function _queryParamsFor(routeInfos) {
      var routeInfoLength = routeInfos.length;
      var leafRouteName = routeInfos[routeInfoLength - 1].name;
      var cached = this._qpCache[leafRouteName];

      if (cached !== undefined) {
        return cached;
      }

      var shouldCache = true;
      var map = {};
      var qps = [];
      var qpsByUrlKey = false
      /* DEBUG */
      ? {} : null;
      var qpMeta;
      var qp;
      var urlKey;
      var qpOther;

      for (var i = 0; i < routeInfoLength; ++i) {
        qpMeta = this._getQPMeta(routeInfos[i]);

        if (!qpMeta) {
          shouldCache = false;
          continue;
        } // Loop over each QP to make sure we don't have any collisions by urlKey


        for (var _i = 0; _i < qpMeta.qps.length; _i++) {
          qp = qpMeta.qps[_i];

          if (false
          /* DEBUG */
          ) {
            urlKey = qp.urlKey;
            qpOther = qpsByUrlKey[urlKey];

            if (qpOther && qpOther.controllerName !== qp.controllerName) {
              (false && !(false) && (0, _debug.assert)("You're not allowed to have more than one controller property map to the same query param key, but both `" + qpOther.scopedPropertyName + "` and `" + qp.scopedPropertyName + "` map to `" + urlKey + "`. You can fix this by mapping one of the controller properties to a different query param key via the `as` config option, e.g. `" + qpOther.prop + ": { as: 'other-" + qpOther.prop + "' }`", false));
            }

            qpsByUrlKey[urlKey] = qp;
          }

          qps.push(qp);
        }

        (0, _polyfills.assign)(map, qpMeta.map);
      }

      var finalQPMeta = {
        qps: qps,
        map: map
      };

      if (shouldCache) {
        this._qpCache[leafRouteName] = finalQPMeta;
      }

      return finalQPMeta;
    }
    /**
      Maps all query param keys to their fully scoped property name of the form
      `controllerName:propName`.
         @private
      @method _fullyScopeQueryParams
      @param {String} leafRouteName
      @param {Array<Object>} contexts
      @param {Object} queryParams
      @return {Void}
    */
    ;

    _proto._fullyScopeQueryParams = function _fullyScopeQueryParams(leafRouteName, contexts, queryParams) {
      var state = calculatePostTransitionState(this, leafRouteName, contexts);
      var routeInfos = state.routeInfos;
      var qpMeta;

      for (var i = 0, len = routeInfos.length; i < len; ++i) {
        qpMeta = this._getQPMeta(routeInfos[i]);

        if (!qpMeta) {
          continue;
        }

        var qp = void 0;
        var presentProp = void 0;

        for (var j = 0, qpLen = qpMeta.qps.length; j < qpLen; ++j) {
          qp = qpMeta.qps[j];
          presentProp = qp.prop in queryParams && qp.prop || qp.scopedPropertyName in queryParams && qp.scopedPropertyName || qp.urlKey in queryParams && qp.urlKey;

          if (presentProp) {
            if (presentProp !== qp.scopedPropertyName) {
              queryParams[qp.scopedPropertyName] = queryParams[presentProp];
              delete queryParams[presentProp];
            }
          }
        }
      }
    }
    /**
      Hydrates (adds/restores) any query params that have pre-existing values into
      the given queryParams hash. This is what allows query params to be "sticky"
      and restore their last known values for their scope.
         @private
      @method _hydrateUnsuppliedQueryParams
      @param {TransitionState} state
      @param {Object} queryParams
      @return {Void}
    */
    ;

    _proto._hydrateUnsuppliedQueryParams = function _hydrateUnsuppliedQueryParams(state, queryParams, _fromRouterService) {
      var routeInfos = state.routeInfos;
      var appCache = this._bucketCache;
      var qpMeta;
      var qp;
      var presentProp;

      for (var i = 0; i < routeInfos.length; ++i) {
        qpMeta = this._getQPMeta(routeInfos[i]);

        if (!qpMeta) {
          continue;
        }

        for (var j = 0, qpLen = qpMeta.qps.length; j < qpLen; ++j) {
          qp = qpMeta.qps[j];
          presentProp = qp.prop in queryParams && qp.prop || qp.scopedPropertyName in queryParams && qp.scopedPropertyName || qp.urlKey in queryParams && qp.urlKey;
          (false && !(function () {
            if (qp.urlKey === presentProp) {
              return true;
            }

            if (_fromRouterService && presentProp !== false && qp.urlKey !== qp.prop) {
              // assumptions (mainly from current transitionTo_test):
              // - this is only supposed to be run when there is an alias to a query param and the alias is used to set the param
              // - when there is no alias: qp.urlKey == qp.prop
              return false;
            }

            return true;
          }()) && (0, _debug.assert)("You passed the `" + presentProp + "` query parameter during a transition into " + qp.route.routeName + ", please update to " + qp.urlKey, function () {
            if (qp.urlKey === presentProp) {
              return true;
            }

            if (_fromRouterService && presentProp !== false && qp.urlKey !== qp.prop) {
              return false;
            }

            return true;
          }()));

          if (presentProp) {
            if (presentProp !== qp.scopedPropertyName) {
              queryParams[qp.scopedPropertyName] = queryParams[presentProp];
              delete queryParams[presentProp];
            }
          } else {
            var cacheKey = (0, _utils.calculateCacheKey)(qp.route.fullRouteName, qp.parts, state.params);
            queryParams[qp.scopedPropertyName] = appCache.lookup(cacheKey, qp.prop, qp.defaultValue);
          }
        }
      }
    };

    _proto._scheduleLoadingEvent = function _scheduleLoadingEvent(transition, originRoute) {
      this._cancelSlowTransitionTimer();

      this._slowTransitionTimer = (0, _runloop.scheduleOnce)('routerTransitions', this, '_handleSlowTransition', transition, originRoute);
    };

    _proto._handleSlowTransition = function _handleSlowTransition(transition, originRoute) {
      if (!this._routerMicrolib.activeTransition) {
        // Don't fire an event if we've since moved on from
        // the transition that put us in a loading state.
        return;
      }

      var targetState = new _router_state.default(this, this._routerMicrolib, this._routerMicrolib.activeTransition[_router_js.STATE_SYMBOL]);
      this.set('targetState', targetState);
      transition.trigger(true, 'loading', transition, originRoute);
    };

    _proto._cancelSlowTransitionTimer = function _cancelSlowTransitionTimer() {
      if (this._slowTransitionTimer) {
        (0, _runloop.cancel)(this._slowTransitionTimer);
      }

      this._slowTransitionTimer = null;
    } // These three helper functions are used to ensure errors aren't
    // re-raised if they're handled in a route's error action.
    ;

    _proto._markErrorAsHandled = function _markErrorAsHandled(error) {
      this._handledErrors.add(error);
    };

    _proto._isErrorHandled = function _isErrorHandled(error) {
      return this._handledErrors.has(error);
    };

    _proto._clearHandledError = function _clearHandledError(error) {
      this._handledErrors.delete(error);
    };

    _proto._getEngineInstance = function _getEngineInstance(_ref) {
      var name = _ref.name,
          instanceId = _ref.instanceId,
          mountPoint = _ref.mountPoint;
      var engineInstances = this._engineInstances;

      if (!engineInstances[name]) {
        engineInstances[name] = Object.create(null);
      }

      var engineInstance = engineInstances[name][instanceId];

      if (!engineInstance) {
        var owner = (0, _owner.getOwner)(this);
        (false && !(owner.hasRegistration("engine:" + name)) && (0, _debug.assert)("You attempted to mount the engine '" + name + "' in your router map, but the engine can not be found.", owner.hasRegistration("engine:" + name)));
        engineInstance = owner.buildChildEngineInstance(name, {
          routable: true,
          mountPoint: mountPoint
        });
        engineInstance.boot();
        engineInstances[name][instanceId] = engineInstance;
      }

      return engineInstance;
    };

    return EmberRouter;
  }(_runtime.Object);
  /*
    Helper function for iterating over routes in a set of routeInfos that are
    at or above the given origin route. Example: if `originRoute` === 'foo.bar'
    and the routeInfos given were for 'foo.bar.baz', then the given callback
    will be invoked with the routes for 'foo.bar', 'foo', and 'application'
    individually.
  
    If the callback returns anything other than `true`, then iteration will stop.
  
    @private
    @param {Route} originRoute
    @param {Array<RouteInfo>} routeInfos
    @param {Function} callback
    @return {Void}
   */


  function forEachRouteAbove(routeInfos, callback) {
    for (var i = routeInfos.length - 1; i >= 0; --i) {
      var routeInfo = routeInfos[i];
      var route = routeInfo.route; // routeInfo.handler being `undefined` generally means either:
      //
      // 1. an error occurred during creation of the route in question
      // 2. the route is across an async boundary (e.g. within an engine)
      //
      // In both of these cases, we cannot invoke the callback on that specific
      // route, because it just doesn't exist...

      if (route === undefined) {
        continue;
      }

      if (callback(route, routeInfo) !== true) {
        return;
      }
    }
  } // These get invoked when an action bubbles above ApplicationRoute
  // and are not meant to be overridable.


  var defaultActionHandlers = {
    willResolveModel: function willResolveModel(_routeInfos, transition, originRoute) {
      this._scheduleLoadingEvent(transition, originRoute);
    },
    // Attempt to find an appropriate error route or substate to enter.
    error: function error(routeInfos, _error2, transition) {
      var router = this;
      var routeInfoWithError = routeInfos[routeInfos.length - 1];
      forEachRouteAbove(routeInfos, function (route, routeInfo) {
        // We don't check the leaf most routeInfo since that would
        // technically be below where we're at in the route hierarchy.
        if (routeInfo !== routeInfoWithError) {
          // Check for the existence of an 'error' route.
          var errorRouteName = findRouteStateName(route, 'error');

          if (errorRouteName) {
            router._markErrorAsHandled(_error2);

            router.intermediateTransitionTo(errorRouteName, _error2);
            return false;
          }
        } // Check for an 'error' substate route


        var errorSubstateName = findRouteSubstateName(route, 'error');

        if (errorSubstateName) {
          router._markErrorAsHandled(_error2);

          router.intermediateTransitionTo(errorSubstateName, _error2);
          return false;
        }

        return true;
      });
      logError(_error2, "Error while processing route: " + transition.targetName);
    },
    // Attempt to find an appropriate loading route or substate to enter.
    loading: function loading(routeInfos, transition) {
      var router = this;
      var routeInfoWithSlowLoading = routeInfos[routeInfos.length - 1];
      forEachRouteAbove(routeInfos, function (route, routeInfo) {
        // We don't check the leaf most routeInfos since that would
        // technically be below where we're at in the route hierarchy.
        if (routeInfo !== routeInfoWithSlowLoading) {
          // Check for the existence of a 'loading' route.
          var loadingRouteName = findRouteStateName(route, 'loading');

          if (loadingRouteName) {
            router.intermediateTransitionTo(loadingRouteName);
            return false;
          }
        } // Check for loading substate


        var loadingSubstateName = findRouteSubstateName(route, 'loading');

        if (loadingSubstateName) {
          router.intermediateTransitionTo(loadingSubstateName);
          return false;
        } // Don't bubble above pivot route.


        return transition.pivotHandler !== route;
      });
    }
  };

  function logError(_error, initialMessage) {
    var _console;

    var errorArgs = [];
    var error;

    if (_error && typeof _error === 'object' && typeof _error.errorThrown === 'object') {
      error = _error.errorThrown;
    } else {
      error = _error;
    }

    if (initialMessage) {
      errorArgs.push(initialMessage);
    }

    if (error) {
      if (error.message) {
        errorArgs.push(error.message);
      }

      if (error.stack) {
        errorArgs.push(error.stack);
      }

      if (typeof error === 'string') {
        errorArgs.push(error);
      }
    }

    (_console = console).error.apply(_console, errorArgs); //eslint-disable-line no-console

  }
  /**
    Finds the name of the substate route if it exists for the given route. A
    substate route is of the form `route_state`, such as `foo_loading`.
  
    @private
    @param {Route} route
    @param {String} state
    @return {String}
  */


  function findRouteSubstateName(route, state) {
    var owner = (0, _owner.getOwner)(route);
    var routeName = route.routeName,
        fullRouteName = route.fullRouteName,
        router = route._router;
    var substateName = routeName + "_" + state;
    var substateNameFull = fullRouteName + "_" + state;
    return routeHasBeenDefined(owner, router, substateName, substateNameFull) ? substateNameFull : '';
  }
  /**
    Finds the name of the state route if it exists for the given route. A state
    route is of the form `route.state`, such as `foo.loading`. Properly Handles
    `application` named routes.
  
    @private
    @param {Route} route
    @param {String} state
    @return {String}
  */


  function findRouteStateName(route, state) {
    var owner = (0, _owner.getOwner)(route);
    var routeName = route.routeName,
        fullRouteName = route.fullRouteName,
        router = route._router;
    var stateName = routeName === 'application' ? state : routeName + "." + state;
    var stateNameFull = fullRouteName === 'application' ? state : fullRouteName + "." + state;
    return routeHasBeenDefined(owner, router, stateName, stateNameFull) ? stateNameFull : '';
  }
  /**
    Determines whether or not a route has been defined by checking that the route
    is in the Router's map and the owner has a registration for that route.
  
    @private
    @param {Owner} owner
    @param {Router} router
    @param {String} localName
    @param {String} fullName
    @return {Boolean}
  */


  function routeHasBeenDefined(owner, router, localName, fullName) {
    var routerHasRoute = router.hasRoute(fullName);
    var ownerHasRoute = owner.hasRegistration("template:" + localName) || owner.hasRegistration("route:" + localName);
    return routerHasRoute && ownerHasRoute;
  }

  function _triggerEvent(routeInfos, ignoreFailure, name, args) {
    if (!routeInfos) {
      if (ignoreFailure) {
        return;
      }

      throw new _error3.default("Can't trigger action '" + name + "' because your app hasn't finished transitioning into its first route. To trigger an action on destination routes during a transition, you can call `.send()` on the `Transition` object passed to the `model/beforeModel/afterModel` hooks.");
    }

    var eventWasHandled = false;
    var routeInfo, handler, actionHandler;

    for (var i = routeInfos.length - 1; i >= 0; i--) {
      routeInfo = routeInfos[i];
      handler = routeInfo.route;
      actionHandler = handler && handler.actions && handler.actions[name];

      if (actionHandler) {
        if (actionHandler.apply(handler, args) === true) {
          eventWasHandled = true;
        } else {
          // Should only hit here if a non-bubbling error action is triggered on a route.
          if (name === 'error') {
            handler._router._markErrorAsHandled(args[0]);
          }

          return;
        }
      }
    }

    var defaultHandler = defaultActionHandlers[name];

    if (defaultHandler) {
      defaultHandler.apply(this, [routeInfos].concat(args));
      return;
    }

    if (!eventWasHandled && !ignoreFailure) {
      throw new _error3.default("Nothing handled the action '" + name + "'. If you did handle the action, this error can be caused by returning true from an action handler in a controller, causing the action to bubble.");
    }
  }

  function calculatePostTransitionState(emberRouter, leafRouteName, contexts) {
    var state = emberRouter._routerMicrolib.applyIntent(leafRouteName, contexts);

    var routeInfos = state.routeInfos,
        params = state.params;

    for (var i = 0; i < routeInfos.length; ++i) {
      var routeInfo = routeInfos[i]; // If the routeInfo is not resolved, we serialize the context into params

      if (!routeInfo.isResolved) {
        params[routeInfo.name] = routeInfo.serialize(routeInfo.context);
      } else {
        params[routeInfo.name] = routeInfo.params;
      }
    }

    return state;
  }

  function updatePaths(router) {
    var infos = router._routerMicrolib.currentRouteInfos;

    if (infos.length === 0) {
      return;
    }

    var path = EmberRouter._routePath(infos);

    var currentRouteName = infos[infos.length - 1].name;
    var currentURL = router.get('location').getURL();
    (0, _metal.set)(router, 'currentPath', path);
    (0, _metal.set)(router, 'currentRouteName', currentRouteName);
    (0, _metal.set)(router, 'currentURL', currentURL);
    var appController = (0, _owner.getOwner)(router).lookup('controller:application');

    if (!appController) {
      // appController might not exist when top-level loading/error
      // substates have been entered since ApplicationRoute hasn't
      // actually been entered at that point.
      return;
    }

    if (_deprecatedFeatures.APP_CTRL_ROUTER_PROPS) {
      if (!('currentPath' in appController)) {
        Object.defineProperty(appController, 'currentPath', {
          get: function get() {
            (false && !(false) && (0, _debug.deprecate)('Accessing `currentPath` on `controller:application` is deprecated, use the `currentPath` property on `service:router` instead.', false, {
              id: 'application-controller.router-properties',
              until: '4.0.0',
              url: 'https://emberjs.com/deprecations/v3.x#toc_application-controller-router-properties'
            }));
            return (0, _metal.get)(router, 'currentPath');
          }
        });
      }

      (0, _metal.notifyPropertyChange)(appController, 'currentPath');

      if (!('currentRouteName' in appController)) {
        Object.defineProperty(appController, 'currentRouteName', {
          get: function get() {
            (false && !(false) && (0, _debug.deprecate)('Accessing `currentRouteName` on `controller:application` is deprecated, use the `currentRouteName` property on `service:router` instead.', false, {
              id: 'application-controller.router-properties',
              until: '4.0.0',
              url: 'https://emberjs.com/deprecations/v3.x#toc_application-controller-router-properties'
            }));
            return (0, _metal.get)(router, 'currentRouteName');
          }
        });
      }

      (0, _metal.notifyPropertyChange)(appController, 'currentRouteName');
    }
  }

  EmberRouter.reopenClass({
    /**
      The `Router.map` function allows you to define mappings from URLs to routes
      in your application. These mappings are defined within the
      supplied callback function using `this.route`.
         The first parameter is the name of the route which is used by default as the
      path name as well.
         The second parameter is the optional options hash. Available options are:
           * `path`: allows you to provide your own path as well as mark dynamic
          segments.
        * `resetNamespace`: false by default; when nesting routes, ember will
          combine the route names to form the fully-qualified route name, which is
          used with `{{link-to}}` or manually transitioning to routes. Setting
          `resetNamespace: true` will cause the route not to inherit from its
          parent route's names. This is handy for preventing extremely long route names.
          Keep in mind that the actual URL path behavior is still retained.
         The third parameter is a function, which can be used to nest routes.
      Nested routes, by default, will have the parent route tree's route name and
      path prepended to it's own.
         ```app/router.js
      Router.map(function(){
        this.route('post', { path: '/post/:post_id' }, function() {
          this.route('edit');
          this.route('comments', { resetNamespace: true }, function() {
            this.route('new');
          });
        });
      });
      ```
         @method map
      @param callback
      @public
    */
    map: function map(callback) {
      if (!this.dslCallbacks) {
        this.dslCallbacks = [];
        this.reopenClass({
          dslCallbacks: this.dslCallbacks
        });
      }

      this.dslCallbacks.push(callback);
      return this;
    },
    _routePath: function _routePath(routeInfos) {
      var path = []; // We have to handle coalescing resource names that
      // are prefixed with their parent's names, e.g.
      // ['foo', 'foo.bar.baz'] => 'foo.bar.baz', not 'foo.foo.bar.baz'

      function intersectionMatches(a1, a2) {
        for (var i = 0; i < a1.length; ++i) {
          if (a1[i] !== a2[i]) {
            return false;
          }
        }

        return true;
      }

      var name, nameParts, oldNameParts;

      for (var i = 1; i < routeInfos.length; i++) {
        name = routeInfos[i].name;
        nameParts = name.split('.');
        oldNameParts = slice.call(path);

        while (oldNameParts.length) {
          if (intersectionMatches(oldNameParts, nameParts)) {
            break;
          }

          oldNameParts.shift();
        }

        path.push.apply(path, nameParts.slice(oldNameParts.length));
      }

      return path.join('.');
    }
  });

  function didBeginTransition(transition, router) {
    var routerState = new _router_state.default(router, router._routerMicrolib, transition[_router_js.STATE_SYMBOL]);

    if (!router.currentState) {
      router.set('currentState', routerState);
    }

    router.set('targetState', routerState);
    transition.promise = transition.catch(function (error) {
      if (router._isErrorHandled(error)) {
        router._clearHandledError(error);
      } else {
        throw error;
      }
    }, 'Transition Error');
  }

  function forEachQueryParam(router, routeInfos, queryParams, callback) {
    var qpCache = router._queryParamsFor(routeInfos);

    for (var key in queryParams) {
      if (!queryParams.hasOwnProperty(key)) {
        continue;
      }

      var value = queryParams[key];
      var qp = qpCache.map[key];
      callback(key, value, qp);
    }
  }

  function findLiveRoute(liveRoutes, name) {
    if (!liveRoutes) {
      return;
    }

    var stack = [liveRoutes];

    while (stack.length > 0) {
      var test = stack.shift();

      if (test.render.name === name) {
        return test;
      }

      var outlets = test.outlets;

      for (var outletName in outlets) {
        stack.push(outlets[outletName]);
      }
    }

    return;
  }

  function appendLiveRoute(liveRoutes, defaultParentState, renderOptions) {
    var target;
    var myState = {
      render: renderOptions,
      outlets: Object.create(null),
      wasUsed: false
    };

    if (renderOptions.into) {
      target = findLiveRoute(liveRoutes, renderOptions.into);
    } else {
      target = defaultParentState;
    }

    if (target) {
      (0, _metal.set)(target.outlets, renderOptions.outlet, myState);
    } else {
      liveRoutes = myState;
    }

    return {
      liveRoutes: liveRoutes,
      ownState: myState
    };
  }

  function representEmptyRoute(liveRoutes, defaultParentState, route) {
    // the route didn't render anything
    var alreadyAppended = findLiveRoute(liveRoutes, route.routeName);

    if (alreadyAppended) {
      // But some other route has already rendered our default
      // template, so that becomes the default target for any
      // children we may have.
      return alreadyAppended;
    } else {
      // Create an entry to represent our default template name,
      // just so other routes can target it and inherit its place
      // in the outlet hierarchy.
      defaultParentState.outlets.main = {
        render: {
          name: route.routeName,
          outlet: 'main'
        },
        outlets: {}
      };
      return defaultParentState;
    }
  }

  EmberRouter.reopen(_runtime.Evented, {
    /**
      Handles updating the paths and notifying any listeners of the URL
      change.
         Triggers the router level `didTransition` hook.
         For example, to notify google analytics when the route changes,
      you could use this hook.  (Note: requires also including GA scripts, etc.)
         ```javascript
      import config from './config/environment';
      import EmberRouter from '@ember/routing/router';
      import { inject as service } from '@ember/service';
         let Router = EmberRouter.extend({
        location: config.locationType,
           router: service(),
           didTransition: function() {
          this._super(...arguments);
             ga('send', 'pageview', {
            page: this.router.currentURL,
            title: this.router.currentRouteName,
          });
        }
      });
      ```
         @method didTransition
      @public
      @since 1.2.0
    */
    didTransition: defaultDidTransition,

    /**
      Handles notifying any listeners of an impending URL
      change.
         Triggers the router level `willTransition` hook.
         @method willTransition
      @public
      @since 1.11.0
    */
    willTransition: defaultWillTransition,

    /**
     Represents the URL of the root of the application, often '/'. This prefix is
     assumed on all routes defined on this router.
        @property rootURL
     @default '/'
     @public
    */
    rootURL: '/',

    /**
     The `location` property determines the type of URL's that your
     application will use.
        The following location types are currently available:
        * `history` - use the browser's history API to make the URLs look just like any standard URL
     * `hash` - use `#` to separate the server part of the URL from the Ember part: `/blog/#/posts/new`
     * `none` - do not store the Ember URL in the actual browser URL (mainly used for testing)
     * `auto` - use the best option based on browser capabilities: `history` if possible, then `hash` if possible, otherwise `none`
        This value is defaulted to `auto` by the `locationType` setting of `/config/environment.js`
        @property location
     @default 'hash'
     @see {Location}
     @public
    */
    location: 'hash',

    /**
     Represents the current URL.
        @property url
     @type {String}
     @private
    */
    url: (0, _metal.computed)(function () {
      var location = (0, _metal.get)(this, 'location');

      if (typeof location === 'string') {
        return undefined;
      }

      return location.getURL();
    })
  });

  if (_deprecatedFeatures.ROUTER_EVENTS) {
    EmberRouter.reopen(_route.ROUTER_EVENT_DEPRECATIONS);
  }

  var _default = EmberRouter;
  _exports.default = _default;
});