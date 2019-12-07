define("router_js", ["exports", "@ember/polyfills", "ember-babel", "rsvp", "route-recognizer"], function (_exports, _polyfills, _emberBabel, _rsvp, _routeRecognizer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.logAbort = logAbort;
  _exports.InternalRouteInfo = _exports.TransitionError = _exports.TransitionState = _exports.QUERY_PARAMS_SYMBOL = _exports.PARAMS_SYMBOL = _exports.STATE_SYMBOL = _exports.InternalTransition = _exports.default = void 0;

  var TransitionAbortedError = function () {
    TransitionAbortedError.prototype = Object.create(Error.prototype);
    TransitionAbortedError.prototype.constructor = TransitionAbortedError;

    function TransitionAbortedError(message) {
      var error = Error.call(this, message);
      this.name = 'TransitionAborted';
      this.message = message || 'TransitionAborted';

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, TransitionAbortedError);
      } else {
        this.stack = error.stack;
      }
    }

    return TransitionAbortedError;
  }();

  var slice = Array.prototype.slice;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  /**
    Determines if an object is Promise by checking if it is "thenable".
  **/

  function isPromise(p) {
    return p !== null && typeof p === 'object' && typeof p.then === 'function';
  }

  function merge(hash, other) {
    for (var prop in other) {
      if (hasOwnProperty.call(other, prop)) {
        hash[prop] = other[prop];
      }
    }
  }
  /**
    @private
  
    Extracts query params from the end of an array
  **/


  function extractQueryParams(array) {
    var len = array && array.length,
        head,
        queryParams;

    if (len && len > 0) {
      var obj = array[len - 1];

      if (isQueryParams(obj)) {
        queryParams = obj.queryParams;
        head = slice.call(array, 0, len - 1);
        return [head, queryParams];
      }
    }

    return [array, null];
  }

  function isQueryParams(obj) {
    return obj && hasOwnProperty.call(obj, 'queryParams');
  }
  /**
    @private
  
    Coerces query param properties and array elements into strings.
  **/


  function coerceQueryParamsToString(queryParams) {
    for (var key in queryParams) {
      var val = queryParams[key];

      if (typeof val === 'number') {
        queryParams[key] = '' + val;
      } else if (Array.isArray(val)) {
        for (var i = 0, l = val.length; i < l; i++) {
          val[i] = '' + val[i];
        }
      }
    }
  }
  /**
    @private
   */


  function _log(router) {
    if (!router.log) {
      return;
    }

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (args.length === 2) {
      var sequence = args[0],
          msg = args[1];
      router.log('Transition #' + sequence + ': ' + msg);
    } else {
      var _msg = args[0];
      router.log(_msg);
    }
  }

  function isParam(object) {
    return typeof object === 'string' || object instanceof String || typeof object === 'number' || object instanceof Number;
  }

  function forEach(array, callback) {
    for (var i = 0, l = array.length; i < l && callback(array[i]) !== false; i++) {// empty intentionally
    }
  }

  function getChangelist(oldObject, newObject) {
    var key;
    var results = {
      all: {},
      changed: {},
      removed: {}
    };
    merge(results.all, newObject);
    var didChange = false;
    coerceQueryParamsToString(oldObject);
    coerceQueryParamsToString(newObject); // Calculate removals

    for (key in oldObject) {
      if (hasOwnProperty.call(oldObject, key)) {
        if (!hasOwnProperty.call(newObject, key)) {
          didChange = true;
          results.removed[key] = oldObject[key];
        }
      }
    } // Calculate changes


    for (key in newObject) {
      if (hasOwnProperty.call(newObject, key)) {
        var oldElement = oldObject[key];
        var newElement = newObject[key];

        if (isArray(oldElement) && isArray(newElement)) {
          if (oldElement.length !== newElement.length) {
            results.changed[key] = newObject[key];
            didChange = true;
          } else {
            for (var i = 0, l = oldElement.length; i < l; i++) {
              if (oldElement[i] !== newElement[i]) {
                results.changed[key] = newObject[key];
                didChange = true;
              }
            }
          }
        } else if (oldObject[key] !== newObject[key]) {
          results.changed[key] = newObject[key];
          didChange = true;
        }
      }
    }

    return didChange ? results : undefined;
  }

  function isArray(obj) {
    return Array.isArray(obj);
  }

  function _promiseLabel(label) {
    return 'Router: ' + label;
  }

  var STATE_SYMBOL = "__STATE__-2619860001345920-3322w3";
  _exports.STATE_SYMBOL = STATE_SYMBOL;
  var PARAMS_SYMBOL = "__PARAMS__-261986232992830203-23323";
  _exports.PARAMS_SYMBOL = PARAMS_SYMBOL;
  var QUERY_PARAMS_SYMBOL = "__QPS__-2619863929824844-32323";
  /**
    A Transition is a thennable (a promise-like object) that represents
    an attempt to transition to another route. It can be aborted, either
    explicitly via `abort` or by attempting another transition while a
    previous one is still underway. An aborted transition can also
    be `retry()`d later.
  
    @class Transition
    @constructor
    @param {Object} router
    @param {Object} intent
    @param {Object} state
    @param {Object} error
    @private
   */

  _exports.QUERY_PARAMS_SYMBOL = QUERY_PARAMS_SYMBOL;

  var Transition =
  /*#__PURE__*/
  function () {
    function Transition(router, intent, state, error, previousTransition) {
      var _this = this;

      if (error === void 0) {
        error = undefined;
      }

      if (previousTransition === void 0) {
        previousTransition = undefined;
      }

      this.from = null;
      this.to = undefined;
      this.isAborted = false;
      this.isActive = true;
      this.urlMethod = 'update';
      this.resolveIndex = 0;
      this.queryParamsOnly = false;
      this.isTransition = true;
      this.isCausedByAbortingTransition = false;
      this.isCausedByInitialTransition = false;
      this.isCausedByAbortingReplaceTransition = false;
      this._visibleQueryParams = {};
      this[STATE_SYMBOL] = state || router.state;
      this.intent = intent;
      this.router = router;
      this.data = intent && intent.data || {};
      this.resolvedModels = {};
      this[QUERY_PARAMS_SYMBOL] = {};
      this.promise = undefined;
      this.error = undefined;
      this[PARAMS_SYMBOL] = {};
      this.routeInfos = [];
      this.targetName = undefined;
      this.pivotHandler = undefined;
      this.sequence = -1;

      if (error) {
        this.promise = _rsvp.Promise.reject(error);
        this.error = error;
        return;
      } // if you're doing multiple redirects, need the new transition to know if it
      // is actually part of the first transition or not. Any further redirects
      // in the initial transition also need to know if they are part of the
      // initial transition


      this.isCausedByAbortingTransition = !!previousTransition;
      this.isCausedByInitialTransition = !!previousTransition && (previousTransition.isCausedByInitialTransition || previousTransition.sequence === 0); // Every transition in the chain is a replace

      this.isCausedByAbortingReplaceTransition = !!previousTransition && previousTransition.urlMethod === 'replace' && (!previousTransition.isCausedByAbortingTransition || previousTransition.isCausedByAbortingReplaceTransition);

      if (state) {
        this[PARAMS_SYMBOL] = state.params;
        this[QUERY_PARAMS_SYMBOL] = state.queryParams;
        this.routeInfos = state.routeInfos;
        var len = state.routeInfos.length;

        if (len) {
          this.targetName = state.routeInfos[len - 1].name;
        }

        for (var i = 0; i < len; ++i) {
          var handlerInfo = state.routeInfos[i]; // TODO: this all seems hacky

          if (!handlerInfo.isResolved) {
            break;
          }

          this.pivotHandler = handlerInfo.route;
        }

        this.sequence = router.currentSequence++;
        this.promise = state.resolve(function () {
          if (_this.isAborted) {
            return _rsvp.Promise.reject(false, _promiseLabel('Transition aborted - reject'));
          }

          return _rsvp.Promise.resolve(true);
        }, this).catch(function (result) {
          return _rsvp.Promise.reject(_this.router.transitionDidError(result, _this));
        }, _promiseLabel('Handle Abort'));
      } else {
        this.promise = _rsvp.Promise.resolve(this[STATE_SYMBOL]);
        this[PARAMS_SYMBOL] = {};
      }
    }
    /**
      The Transition's internal promise. Calling `.then` on this property
      is that same as calling `.then` on the Transition object itself, but
      this property is exposed for when you want to pass around a
      Transition's promise, but not the Transition object itself, since
      Transition object can be externally `abort`ed, while the promise
      cannot.
         @property promise
      @type {Object}
      @public
     */

    /**
      Custom state can be stored on a Transition's `data` object.
      This can be useful for decorating a Transition within an earlier
      hook and shared with a later hook. Properties set on `data` will
      be copied to new transitions generated by calling `retry` on this
      transition.
         @property data
      @type {Object}
      @public
     */

    /**
      A standard promise hook that resolves if the transition
      succeeds and rejects if it fails/redirects/aborts.
         Forwards to the internal `promise` property which you can
      use in situations where you want to pass around a thennable,
      but not the Transition itself.
         @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
      @public
     */


    var _proto = Transition.prototype;

    _proto.then = function then(onFulfilled, onRejected, label) {
      return this.promise.then(onFulfilled, onRejected, label);
    }
    /**
         Forwards to the internal `promise` property which you can
      use in situations where you want to pass around a thennable,
      but not the Transition itself.
         @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
      @public
     */
    ;

    _proto.catch = function _catch(onRejection, label) {
      return this.promise.catch(onRejection, label);
    }
    /**
         Forwards to the internal `promise` property which you can
      use in situations where you want to pass around a thennable,
      but not the Transition itself.
         @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
      @public
     */
    ;

    _proto.finally = function _finally(callback, label) {
      return this.promise.finally(callback, label);
    }
    /**
      Aborts the Transition. Note you can also implicitly abort a transition
      by initiating another transition while a previous one is underway.
         @method abort
      @return {Transition} this transition
      @public
     */
    ;

    _proto.abort = function abort() {
      this.rollback();
      var transition = new Transition(this.router, undefined, undefined, undefined);
      transition.to = this.from;
      transition.from = this.from;
      transition.isAborted = true;
      this.router.routeWillChange(transition);
      this.router.routeDidChange(transition);
      return this;
    };

    _proto.rollback = function rollback() {
      if (!this.isAborted) {
        _log(this.router, this.sequence, this.targetName + ': transition was aborted');

        if (this.intent !== undefined && this.intent !== null) {
          this.intent.preTransitionState = this.router.state;
        }

        this.isAborted = true;
        this.isActive = false;
        this.router.activeTransition = undefined;
      }
    };

    _proto.redirect = function redirect(newTransition) {
      this.rollback();
      this.router.routeWillChange(newTransition);
    }
    /**
         Retries a previously-aborted transition (making sure to abort the
      transition if it's still active). Returns a new transition that
      represents the new attempt to transition.
         @method retry
      @return {Transition} new transition
      @public
     */
    ;

    _proto.retry = function retry() {
      // TODO: add tests for merged state retry()s
      this.abort();
      var newTransition = this.router.transitionByIntent(this.intent, false); // inheriting a `null` urlMethod is not valid
      // the urlMethod is only set to `null` when
      // the transition is initiated *after* the url
      // has been updated (i.e. `router.handleURL`)
      //
      // in that scenario, the url method cannot be
      // inherited for a new transition because then
      // the url would not update even though it should

      if (this.urlMethod !== null) {
        newTransition.method(this.urlMethod);
      }

      return newTransition;
    }
    /**
         Sets the URL-changing method to be employed at the end of a
      successful transition. By default, a new Transition will just
      use `updateURL`, but passing 'replace' to this method will
      cause the URL to update using 'replaceWith' instead. Omitting
      a parameter will disable the URL change, allowing for transitions
      that don't update the URL at completion (this is also used for
      handleURL, since the URL has already changed before the
      transition took place).
         @method method
      @param {String} method the type of URL-changing method to use
        at the end of a transition. Accepted values are 'replace',
        falsy values, or any other non-falsy value (which is
        interpreted as an updateURL transition).
         @return {Transition} this transition
      @public
     */
    ;

    _proto.method = function method(_method) {
      this.urlMethod = _method;
      return this;
    } // Alias 'trigger' as 'send'
    ;

    _proto.send = function send(ignoreFailure, _name, err, transition, handler) {
      if (ignoreFailure === void 0) {
        ignoreFailure = false;
      }

      this.trigger(ignoreFailure, _name, err, transition, handler);
    }
    /**
         Fires an event on the current list of resolved/resolving
      handlers within this transition. Useful for firing events
      on route hierarchies that haven't fully been entered yet.
         Note: This method is also aliased as `send`
         @method trigger
      @param {Boolean} [ignoreFailure=false] a boolean specifying whether unhandled events throw an error
      @param {String} name the name of the event to fire
      @public
     */
    ;

    _proto.trigger = function trigger(ignoreFailure, name) {
      if (ignoreFailure === void 0) {
        ignoreFailure = false;
      }

      // TODO: Deprecate the current signature
      if (typeof ignoreFailure === 'string') {
        name = ignoreFailure;
        ignoreFailure = false;
      }

      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      this.router.triggerEvent(this[STATE_SYMBOL].routeInfos.slice(0, this.resolveIndex + 1), ignoreFailure, name, args);
    }
    /**
      Transitions are aborted and their promises rejected
      when redirects occur; this method returns a promise
      that will follow any redirects that occur and fulfill
      with the value fulfilled by any redirecting transitions
      that occur.
         @method followRedirects
      @return {Promise} a promise that fulfills with the same
        value that the final redirecting transition fulfills with
      @public
     */
    ;

    _proto.followRedirects = function followRedirects() {
      var router = this.router;
      return this.promise.catch(function (reason) {
        if (router.activeTransition) {
          return router.activeTransition.followRedirects();
        }

        return _rsvp.Promise.reject(reason);
      });
    };

    _proto.toString = function toString() {
      return 'Transition (sequence ' + this.sequence + ')';
    }
    /**
      @private
     */
    ;

    _proto.log = function log(message) {
      _log(this.router, this.sequence, message);
    };

    return Transition;
  }();
  /**
    @private
  
    Logs and returns an instance of TransitionAborted.
   */


  _exports.InternalTransition = Transition;

  function logAbort(transition) {
    _log(transition.router, transition.sequence, 'detected abort.');

    return new TransitionAbortedError();
  }

  function isTransition(obj) {
    return typeof obj === 'object' && obj instanceof Transition && obj.isTransition;
  }

  function prepareResult(obj) {
    if (isTransition(obj)) {
      return null;
    }

    return obj;
  }

  var ROUTE_INFOS = new WeakMap();

  function toReadOnlyRouteInfo(routeInfos, queryParams, includeAttributes) {
    if (queryParams === void 0) {
      queryParams = {};
    }

    if (includeAttributes === void 0) {
      includeAttributes = false;
    }

    return routeInfos.map(function (info, i) {
      var name = info.name,
          params = info.params,
          paramNames = info.paramNames,
          context = info.context,
          route = info.route;

      if (ROUTE_INFOS.has(info) && includeAttributes) {
        var _routeInfo = ROUTE_INFOS.get(info);

        _routeInfo = attachMetadata(route, _routeInfo);
        var routeInfoWithAttribute = createRouteInfoWithAttributes(_routeInfo, context);
        ROUTE_INFOS.set(info, routeInfoWithAttribute);
        return routeInfoWithAttribute;
      }

      var routeInfo = {
        find: function find(predicate, thisArg) {
          var publicInfo;
          var arr = [];

          if (predicate.length === 3) {
            arr = routeInfos.map(function (info) {
              return ROUTE_INFOS.get(info);
            });
          }

          for (var _i = 0; routeInfos.length > _i; _i++) {
            publicInfo = ROUTE_INFOS.get(routeInfos[_i]);

            if (predicate.call(thisArg, publicInfo, _i, arr)) {
              return publicInfo;
            }
          }

          return undefined;
        },

        get name() {
          return name;
        },

        get paramNames() {
          return paramNames;
        },

        get metadata() {
          return buildRouteInfoMetadata(info.route);
        },

        get parent() {
          var parent = routeInfos[i - 1];

          if (parent === undefined) {
            return null;
          }

          return ROUTE_INFOS.get(parent);
        },

        get child() {
          var child = routeInfos[i + 1];

          if (child === undefined) {
            return null;
          }

          return ROUTE_INFOS.get(child);
        },

        get localName() {
          var parts = this.name.split('.');
          return parts[parts.length - 1];
        },

        get params() {
          return params;
        },

        get queryParams() {
          return queryParams;
        }

      };

      if (includeAttributes) {
        routeInfo = createRouteInfoWithAttributes(routeInfo, context);
      }

      ROUTE_INFOS.set(info, routeInfo);
      return routeInfo;
    });
  }

  function createRouteInfoWithAttributes(routeInfo, context) {
    var attributes = {
      get attributes() {
        return context;
      }

    };

    if (Object.isFrozen(routeInfo) || routeInfo.hasOwnProperty('attributes')) {
      return Object.freeze((0, _polyfills.assign)({}, routeInfo, attributes));
    }

    return (0, _polyfills.assign)(routeInfo, attributes);
  }

  function buildRouteInfoMetadata(route) {
    if (route !== undefined && route !== null && route.buildRouteInfoMetadata !== undefined) {
      return route.buildRouteInfoMetadata();
    }

    return null;
  }

  function attachMetadata(route, routeInfo) {
    var metadata = {
      get metadata() {
        return buildRouteInfoMetadata(route);
      }

    };

    if (Object.isFrozen(routeInfo) || routeInfo.hasOwnProperty('metadata')) {
      return Object.freeze((0, _polyfills.assign)({}, routeInfo, metadata));
    }

    return (0, _polyfills.assign)(routeInfo, metadata);
  }

  var InternalRouteInfo =
  /*#__PURE__*/
  function () {
    function InternalRouteInfo(router, name, paramNames, route) {
      this._routePromise = undefined;
      this._route = null;
      this.params = {};
      this.isResolved = false;
      this.name = name;
      this.paramNames = paramNames;
      this.router = router;

      if (route) {
        this._processRoute(route);
      }
    }

    var _proto2 = InternalRouteInfo.prototype;

    _proto2.getModel = function getModel(_transition) {
      return _rsvp.Promise.resolve(this.context);
    };

    _proto2.serialize = function serialize(_context) {
      return this.params || {};
    };

    _proto2.resolve = function resolve(shouldContinue, transition) {
      var _this2 = this;

      return _rsvp.Promise.resolve(this.routePromise).then(function (route) {
        return _this2.checkForAbort(shouldContinue, route);
      }).then(function () {
        return _this2.runBeforeModelHook(transition);
      }).then(function () {
        return _this2.checkForAbort(shouldContinue, null);
      }).then(function () {
        return _this2.getModel(transition);
      }).then(function (resolvedModel) {
        return _this2.checkForAbort(shouldContinue, resolvedModel);
      }).then(function (resolvedModel) {
        return _this2.runAfterModelHook(transition, resolvedModel);
      }).then(function (resolvedModel) {
        return _this2.becomeResolved(transition, resolvedModel);
      });
    };

    _proto2.becomeResolved = function becomeResolved(transition, resolvedContext) {
      var params = this.serialize(resolvedContext);

      if (transition) {
        this.stashResolvedModel(transition, resolvedContext);
        transition[PARAMS_SYMBOL] = transition[PARAMS_SYMBOL] || {};
        transition[PARAMS_SYMBOL][this.name] = params;
      }

      var context;
      var contextsMatch = resolvedContext === this.context;

      if ('context' in this || !contextsMatch) {
        context = resolvedContext;
      }

      var cached = ROUTE_INFOS.get(this);
      var resolved = new ResolvedRouteInfo(this.router, this.name, this.paramNames, params, this.route, context);

      if (cached !== undefined) {
        ROUTE_INFOS.set(resolved, cached);
      }

      return resolved;
    };

    _proto2.shouldSupercede = function shouldSupercede(routeInfo) {
      // Prefer this newer routeInfo over `other` if:
      // 1) The other one doesn't exist
      // 2) The names don't match
      // 3) This route has a context that doesn't match
      //    the other one (or the other one doesn't have one).
      // 4) This route has parameters that don't match the other.
      if (!routeInfo) {
        return true;
      }

      var contextsMatch = routeInfo.context === this.context;
      return routeInfo.name !== this.name || 'context' in this && !contextsMatch || this.hasOwnProperty('params') && !paramsMatch(this.params, routeInfo.params);
    };

    _proto2.log = function log(transition, message) {
      if (transition.log) {
        transition.log(this.name + ': ' + message);
      }
    };

    _proto2.updateRoute = function updateRoute(route) {
      route._internalName = this.name;
      return this.route = route;
    };

    _proto2.runBeforeModelHook = function runBeforeModelHook(transition) {
      if (transition.trigger) {
        transition.trigger(true, 'willResolveModel', transition, this.route);
      }

      var result;

      if (this.route) {
        if (this.route.beforeModel !== undefined) {
          result = this.route.beforeModel(transition);
        }
      }

      if (isTransition(result)) {
        result = null;
      }

      return _rsvp.Promise.resolve(result);
    };

    _proto2.runAfterModelHook = function runAfterModelHook(transition, resolvedModel) {
      // Stash the resolved model on the payload.
      // This makes it possible for users to swap out
      // the resolved model in afterModel.
      var name = this.name;
      this.stashResolvedModel(transition, resolvedModel);
      var result;

      if (this.route !== undefined) {
        if (this.route.afterModel !== undefined) {
          result = this.route.afterModel(resolvedModel, transition);
        }
      }

      result = prepareResult(result);
      return _rsvp.Promise.resolve(result).then(function () {
        // Ignore the fulfilled value returned from afterModel.
        // Return the value stashed in resolvedModels, which
        // might have been swapped out in afterModel.
        return transition.resolvedModels[name];
      });
    };

    _proto2.checkForAbort = function checkForAbort(shouldContinue, value) {
      return _rsvp.Promise.resolve(shouldContinue()).then(function () {
        // We don't care about shouldContinue's resolve value;
        // pass along the original value passed to this fn.
        return value;
      }, null);
    };

    _proto2.stashResolvedModel = function stashResolvedModel(transition, resolvedModel) {
      transition.resolvedModels = transition.resolvedModels || {};
      transition.resolvedModels[this.name] = resolvedModel;
    };

    _proto2.fetchRoute = function fetchRoute() {
      var route = this.router.getRoute(this.name);
      return this._processRoute(route);
    };

    _proto2._processRoute = function _processRoute(route) {
      var _this3 = this;

      // Setup a routePromise so that we can wait for asynchronously loaded routes
      this.routePromise = _rsvp.Promise.resolve(route); // Wait until the 'route' property has been updated when chaining to a route
      // that is a promise

      if (isPromise(route)) {
        this.routePromise = this.routePromise.then(function (r) {
          return _this3.updateRoute(r);
        }); // set to undefined to avoid recursive loop in the route getter

        return this.route = undefined;
      } else if (route) {
        return this.updateRoute(route);
      }

      return undefined;
    };

    (0, _emberBabel.createClass)(InternalRouteInfo, [{
      key: "route",
      get: function get() {
        // _route could be set to either a route object or undefined, so we
        // compare against null to know when it's been set
        if (this._route !== null) {
          return this._route;
        }

        return this.fetchRoute();
      },
      set: function set(route) {
        this._route = route;
      }
    }, {
      key: "routePromise",
      get: function get() {
        if (this._routePromise) {
          return this._routePromise;
        }

        this.fetchRoute();
        return this._routePromise;
      },
      set: function set(routePromise) {
        this._routePromise = routePromise;
      }
    }]);
    return InternalRouteInfo;
  }();

  _exports.InternalRouteInfo = InternalRouteInfo;

  var ResolvedRouteInfo =
  /*#__PURE__*/
  function (_InternalRouteInfo) {
    (0, _emberBabel.inheritsLoose)(ResolvedRouteInfo, _InternalRouteInfo);

    function ResolvedRouteInfo(router, name, paramNames, params, route, context) {
      var _this4;

      _this4 = _InternalRouteInfo.call(this, router, name, paramNames, route) || this;
      _this4.params = params;
      _this4.isResolved = true;
      _this4.context = context;
      return _this4;
    }

    var _proto3 = ResolvedRouteInfo.prototype;

    _proto3.resolve = function resolve(_shouldContinue, transition) {
      // A ResolvedRouteInfo just resolved with itself.
      if (transition && transition.resolvedModels) {
        transition.resolvedModels[this.name] = this.context;
      }

      return _rsvp.Promise.resolve(this);
    };

    return ResolvedRouteInfo;
  }(InternalRouteInfo);

  var UnresolvedRouteInfoByParam =
  /*#__PURE__*/
  function (_InternalRouteInfo2) {
    (0, _emberBabel.inheritsLoose)(UnresolvedRouteInfoByParam, _InternalRouteInfo2);

    function UnresolvedRouteInfoByParam(router, name, paramNames, params, route) {
      var _this5;

      _this5 = _InternalRouteInfo2.call(this, router, name, paramNames, route) || this;
      _this5.params = {};
      _this5.params = params;
      return _this5;
    }

    var _proto4 = UnresolvedRouteInfoByParam.prototype;

    _proto4.getModel = function getModel(transition) {
      var fullParams = this.params;

      if (transition && transition[QUERY_PARAMS_SYMBOL]) {
        fullParams = {};
        merge(fullParams, this.params);
        fullParams.queryParams = transition[QUERY_PARAMS_SYMBOL];
      }

      var route = this.route;
      var result = undefined;

      if (route.deserialize) {
        result = route.deserialize(fullParams, transition);
      } else if (route.model) {
        result = route.model(fullParams, transition);
      }

      if (result && isTransition(result)) {
        result = undefined;
      }

      return _rsvp.Promise.resolve(result);
    };

    return UnresolvedRouteInfoByParam;
  }(InternalRouteInfo);

  var UnresolvedRouteInfoByObject =
  /*#__PURE__*/
  function (_InternalRouteInfo3) {
    (0, _emberBabel.inheritsLoose)(UnresolvedRouteInfoByObject, _InternalRouteInfo3);

    function UnresolvedRouteInfoByObject(router, name, paramNames, context) {
      var _this6;

      _this6 = _InternalRouteInfo3.call(this, router, name, paramNames) || this;
      _this6.context = context;
      _this6.serializer = _this6.router.getSerializer(name);
      return _this6;
    }

    var _proto5 = UnresolvedRouteInfoByObject.prototype;

    _proto5.getModel = function getModel(transition) {
      if (this.router.log !== undefined) {
        this.router.log(this.name + ': resolving provided model');
      }

      return _InternalRouteInfo3.prototype.getModel.call(this, transition);
    }
    /**
      @private
         Serializes a route using its custom `serialize` method or
      by a default that looks up the expected property name from
      the dynamic segment.
         @param {Object} model the model to be serialized for this route
    */
    ;

    _proto5.serialize = function serialize(model) {
      var paramNames = this.paramNames,
          context = this.context;

      if (!model) {
        model = context;
      }

      var object = {};

      if (isParam(model)) {
        object[paramNames[0]] = model;
        return object;
      } // Use custom serialize if it exists.


      if (this.serializer) {
        // invoke this.serializer unbound (getSerializer returns a stateless function)
        return this.serializer.call(null, model, paramNames);
      } else if (this.route !== undefined) {
        if (this.route.serialize) {
          return this.route.serialize(model, paramNames);
        }
      }

      if (paramNames.length !== 1) {
        return;
      }

      var name = paramNames[0];

      if (/_id$/.test(name)) {
        object[name] = model.id;
      } else {
        object[name] = model;
      }

      return object;
    };

    return UnresolvedRouteInfoByObject;
  }(InternalRouteInfo);

  function paramsMatch(a, b) {
    if (!a !== !b) {
      // Only one is null.
      return false;
    }

    if (!a) {
      // Both must be null.
      return true;
    } // Note: this assumes that both params have the same
    // number of keys, but since we're comparing the
    // same routes, they should.


    for (var k in a) {
      if (a.hasOwnProperty(k) && a[k] !== b[k]) {
        return false;
      }
    }

    return true;
  }

  var TransitionIntent = function TransitionIntent(router, data) {
    if (data === void 0) {
      data = {};
    }

    this.router = router;
    this.data = data;
  };

  var TransitionState =
  /*#__PURE__*/
  function () {
    function TransitionState() {
      this.routeInfos = [];
      this.queryParams = {};
      this.params = {};
    }

    var _proto6 = TransitionState.prototype;

    _proto6.promiseLabel = function promiseLabel(label) {
      var targetName = '';
      forEach(this.routeInfos, function (routeInfo) {
        if (targetName !== '') {
          targetName += '.';
        }

        targetName += routeInfo.name;
        return true;
      });
      return _promiseLabel("'" + targetName + "': " + label);
    };

    _proto6.resolve = function resolve(shouldContinue, transition) {
      // First, calculate params for this state. This is useful
      // information to provide to the various route hooks.
      var params = this.params;
      forEach(this.routeInfos, function (routeInfo) {
        params[routeInfo.name] = routeInfo.params || {};
        return true;
      });
      transition.resolveIndex = 0;
      var currentState = this;
      var wasAborted = false; // The prelude RSVP.resolve() asyncs us into the promise land.

      return _rsvp.Promise.resolve(null, this.promiseLabel('Start transition')).then(resolveOneRouteInfo, null, this.promiseLabel('Resolve route')).catch(handleError, this.promiseLabel('Handle error'));

      function innerShouldContinue() {
        return _rsvp.Promise.resolve(shouldContinue(), currentState.promiseLabel('Check if should continue')).catch(function (reason) {
          // We distinguish between errors that occurred
          // during resolution (e.g. before"Model/model/afterModel),
          // and aborts due to a rejecting promise from shouldContinue().
          wasAborted = true;
          return _rsvp.Promise.reject(reason);
        }, currentState.promiseLabel('Handle abort'));
      }

      function handleError(error) {
        // This is the only possible
        // reject value of TransitionState#resolve
        var routeInfos = currentState.routeInfos;
        var errorHandlerIndex = transition.resolveIndex >= routeInfos.length ? routeInfos.length - 1 : transition.resolveIndex;
        return _rsvp.Promise.reject(new TransitionError(error, currentState.routeInfos[errorHandlerIndex].route, wasAborted, currentState));
      }

      function proceed(resolvedRouteInfo) {
        var wasAlreadyResolved = currentState.routeInfos[transition.resolveIndex].isResolved; // Swap the previously unresolved routeInfo with
        // the resolved routeInfo

        currentState.routeInfos[transition.resolveIndex++] = resolvedRouteInfo;

        if (!wasAlreadyResolved) {
          // Call the redirect hook. The reason we call it here
          // vs. afterModel is so that redirects into child
          // routes don't re-run the model hooks for this
          // already-resolved route.
          var route = resolvedRouteInfo.route;

          if (route !== undefined) {
            if (route.redirect) {
              route.redirect(resolvedRouteInfo.context, transition);
            }
          }
        } // Proceed after ensuring that the redirect hook
        // didn't abort this transition by transitioning elsewhere.


        return innerShouldContinue().then(resolveOneRouteInfo, null, currentState.promiseLabel('Resolve route'));
      }

      function resolveOneRouteInfo() {
        if (transition.resolveIndex === currentState.routeInfos.length) {
          // This is is the only possible
          // fulfill value of TransitionState#resolve
          return currentState;
        }

        var routeInfo = currentState.routeInfos[transition.resolveIndex];
        return routeInfo.resolve(innerShouldContinue, transition).then(proceed, null, currentState.promiseLabel('Proceed'));
      }
    };

    return TransitionState;
  }();

  _exports.TransitionState = TransitionState;

  var TransitionError = function TransitionError(error, route, wasAborted, state) {
    this.error = error;
    this.route = route;
    this.wasAborted = wasAborted;
    this.state = state;
  };

  _exports.TransitionError = TransitionError;

  var NamedTransitionIntent =
  /*#__PURE__*/
  function (_TransitionIntent) {
    (0, _emberBabel.inheritsLoose)(NamedTransitionIntent, _TransitionIntent);

    function NamedTransitionIntent(router, name, pivotHandler, contexts, queryParams, data) {
      var _this7;

      if (contexts === void 0) {
        contexts = [];
      }

      if (queryParams === void 0) {
        queryParams = {};
      }

      _this7 = _TransitionIntent.call(this, router, data) || this;
      _this7.preTransitionState = undefined;
      _this7.name = name;
      _this7.pivotHandler = pivotHandler;
      _this7.contexts = contexts;
      _this7.queryParams = queryParams;
      return _this7;
    }

    var _proto7 = NamedTransitionIntent.prototype;

    _proto7.applyToState = function applyToState(oldState, isIntermediate) {
      // TODO: WTF fix me
      var partitionedArgs = extractQueryParams([this.name].concat(this.contexts)),
          pureArgs = partitionedArgs[0],
          handlers = this.router.recognizer.handlersFor(pureArgs[0]);
      var targetRouteName = handlers[handlers.length - 1].handler;
      return this.applyToHandlers(oldState, handlers, targetRouteName, isIntermediate, false);
    };

    _proto7.applyToHandlers = function applyToHandlers(oldState, parsedHandlers, targetRouteName, isIntermediate, checkingIfActive) {
      var i, len;
      var newState = new TransitionState();
      var objects = this.contexts.slice(0);
      var invalidateIndex = parsedHandlers.length; // Pivot handlers are provided for refresh transitions

      if (this.pivotHandler) {
        for (i = 0, len = parsedHandlers.length; i < len; ++i) {
          if (parsedHandlers[i].handler === this.pivotHandler._internalName) {
            invalidateIndex = i;
            break;
          }
        }
      }

      for (i = parsedHandlers.length - 1; i >= 0; --i) {
        var result = parsedHandlers[i];
        var name = result.handler;
        var oldHandlerInfo = oldState.routeInfos[i];
        var newHandlerInfo = null;

        if (result.names.length > 0) {
          if (i >= invalidateIndex) {
            newHandlerInfo = this.createParamHandlerInfo(name, result.names, objects, oldHandlerInfo);
          } else {
            newHandlerInfo = this.getHandlerInfoForDynamicSegment(name, result.names, objects, oldHandlerInfo, targetRouteName, i);
          }
        } else {
          // This route has no dynamic segment.
          // Therefore treat as a param-based handlerInfo
          // with empty params. This will cause the `model`
          // hook to be called with empty params, which is desirable.
          newHandlerInfo = this.createParamHandlerInfo(name, result.names, objects, oldHandlerInfo);
        }

        if (checkingIfActive) {
          // If we're performing an isActive check, we want to
          // serialize URL params with the provided context, but
          // ignore mismatches between old and new context.
          newHandlerInfo = newHandlerInfo.becomeResolved(null, newHandlerInfo.context);
          var oldContext = oldHandlerInfo && oldHandlerInfo.context;

          if (result.names.length > 0 && oldHandlerInfo.context !== undefined && newHandlerInfo.context === oldContext) {
            // If contexts match in isActive test, assume params also match.
            // This allows for flexibility in not requiring that every last
            // handler provide a `serialize` method
            newHandlerInfo.params = oldHandlerInfo && oldHandlerInfo.params;
          }

          newHandlerInfo.context = oldContext;
        }

        var handlerToUse = oldHandlerInfo;

        if (i >= invalidateIndex || newHandlerInfo.shouldSupercede(oldHandlerInfo)) {
          invalidateIndex = Math.min(i, invalidateIndex);
          handlerToUse = newHandlerInfo;
        }

        if (isIntermediate && !checkingIfActive) {
          handlerToUse = handlerToUse.becomeResolved(null, handlerToUse.context);
        }

        newState.routeInfos.unshift(handlerToUse);
      }

      if (objects.length > 0) {
        throw new Error('More context objects were passed than there are dynamic segments for the route: ' + targetRouteName);
      }

      if (!isIntermediate) {
        this.invalidateChildren(newState.routeInfos, invalidateIndex);
      }

      merge(newState.queryParams, this.queryParams || {});
      return newState;
    };

    _proto7.invalidateChildren = function invalidateChildren(handlerInfos, invalidateIndex) {
      for (var i = invalidateIndex, l = handlerInfos.length; i < l; ++i) {
        var handlerInfo = handlerInfos[i];

        if (handlerInfo.isResolved) {
          var _handlerInfos$i = handlerInfos[i],
              name = _handlerInfos$i.name,
              params = _handlerInfos$i.params,
              route = _handlerInfos$i.route,
              paramNames = _handlerInfos$i.paramNames;
          handlerInfos[i] = new UnresolvedRouteInfoByParam(this.router, name, paramNames, params, route);
        }
      }
    };

    _proto7.getHandlerInfoForDynamicSegment = function getHandlerInfoForDynamicSegment(name, names, objects, oldHandlerInfo, _targetRouteName, i) {
      var objectToUse;

      if (objects.length > 0) {
        // Use the objects provided for this transition.
        objectToUse = objects[objects.length - 1];

        if (isParam(objectToUse)) {
          return this.createParamHandlerInfo(name, names, objects, oldHandlerInfo);
        } else {
          objects.pop();
        }
      } else if (oldHandlerInfo && oldHandlerInfo.name === name) {
        // Reuse the matching oldHandlerInfo
        return oldHandlerInfo;
      } else {
        if (this.preTransitionState) {
          var preTransitionHandlerInfo = this.preTransitionState.routeInfos[i];
          objectToUse = preTransitionHandlerInfo && preTransitionHandlerInfo.context;
        } else {
          // Ideally we should throw this error to provide maximal
          // information to the user that not enough context objects
          // were provided, but this proves too cumbersome in Ember
          // in cases where inner template helpers are evaluated
          // before parent helpers un-render, in which cases this
          // error somewhat prematurely fires.
          //throw new Error("Not enough context objects were provided to complete a transition to " + targetRouteName + ". Specifically, the " + name + " route needs an object that can be serialized into its dynamic URL segments [" + names.join(', ') + "]");
          return oldHandlerInfo;
        }
      }

      return new UnresolvedRouteInfoByObject(this.router, name, names, objectToUse);
    };

    _proto7.createParamHandlerInfo = function createParamHandlerInfo(name, names, objects, oldHandlerInfo) {
      var params = {}; // Soak up all the provided string/numbers

      var numNames = names.length;
      var missingParams = [];

      while (numNames--) {
        // Only use old params if the names match with the new handler
        var oldParams = oldHandlerInfo && name === oldHandlerInfo.name && oldHandlerInfo.params || {};
        var peek = objects[objects.length - 1];
        var paramName = names[numNames];

        if (isParam(peek)) {
          params[paramName] = '' + objects.pop();
        } else {
          // If we're here, this means only some of the params
          // were string/number params, so try and use a param
          // value from a previous handler.
          if (oldParams.hasOwnProperty(paramName)) {
            params[paramName] = oldParams[paramName];
          } else {
            missingParams.push(paramName);
          }
        }
      }

      if (missingParams.length > 0) {
        throw new Error("You didn't provide enough string/numeric parameters to satisfy all of the dynamic segments for route " + name + "." + (" Missing params: " + missingParams));
      }

      return new UnresolvedRouteInfoByParam(this.router, name, names, params);
    };

    return NamedTransitionIntent;
  }(TransitionIntent);

  var UnrecognizedURLError = function () {
    UnrecognizedURLError.prototype = Object.create(Error.prototype);
    UnrecognizedURLError.prototype.constructor = UnrecognizedURLError;

    function UnrecognizedURLError(message) {
      var error = Error.call(this, message);
      this.name = 'UnrecognizedURLError';
      this.message = message || 'UnrecognizedURL';

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, UnrecognizedURLError);
      } else {
        this.stack = error.stack;
      }
    }

    return UnrecognizedURLError;
  }();

  var URLTransitionIntent =
  /*#__PURE__*/
  function (_TransitionIntent2) {
    (0, _emberBabel.inheritsLoose)(URLTransitionIntent, _TransitionIntent2);

    function URLTransitionIntent(router, url, data) {
      var _this8;

      _this8 = _TransitionIntent2.call(this, router, data) || this;
      _this8.url = url;
      _this8.preTransitionState = undefined;
      return _this8;
    }

    var _proto8 = URLTransitionIntent.prototype;

    _proto8.applyToState = function applyToState(oldState) {
      var newState = new TransitionState();
      var results = this.router.recognizer.recognize(this.url),
          i,
          len;

      if (!results) {
        throw new UnrecognizedURLError(this.url);
      }

      var statesDiffer = false;
      var _url = this.url; // Checks if a handler is accessible by URL. If it is not, an error is thrown.
      // For the case where the handler is loaded asynchronously, the error will be
      // thrown once it is loaded.

      function checkHandlerAccessibility(handler) {
        if (handler && handler.inaccessibleByURL) {
          throw new UnrecognizedURLError(_url);
        }

        return handler;
      }

      for (i = 0, len = results.length; i < len; ++i) {
        var result = results[i];
        var name = result.handler;
        var paramNames = [];

        if (this.router.recognizer.hasRoute(name)) {
          paramNames = this.router.recognizer.handlersFor(name)[i].names;
        }

        var newRouteInfo = new UnresolvedRouteInfoByParam(this.router, name, paramNames, result.params);
        var route = newRouteInfo.route;

        if (route) {
          checkHandlerAccessibility(route);
        } else {
          // If the hanlder is being loaded asynchronously, check if we can
          // access it after it has resolved
          newRouteInfo.routePromise = newRouteInfo.routePromise.then(checkHandlerAccessibility);
        }

        var oldRouteInfo = oldState.routeInfos[i];

        if (statesDiffer || newRouteInfo.shouldSupercede(oldRouteInfo)) {
          statesDiffer = true;
          newState.routeInfos[i] = newRouteInfo;
        } else {
          newState.routeInfos[i] = oldRouteInfo;
        }
      }

      merge(newState.queryParams, results.queryParams);
      return newState;
    };

    return URLTransitionIntent;
  }(TransitionIntent);

  var Router =
  /*#__PURE__*/
  function () {
    function Router(logger) {
      this._lastQueryParams = {};
      this.state = undefined;
      this.oldState = undefined;
      this.activeTransition = undefined;
      this.currentRouteInfos = undefined;
      this._changedQueryParams = undefined;
      this.currentSequence = 0;
      this.log = logger;
      this.recognizer = new _routeRecognizer.default();
      this.reset();
    }
    /**
      The main entry point into the router. The API is essentially
      the same as the `map` method in `route-recognizer`.
         This method extracts the String handler at the last `.to()`
      call and uses it as the name of the whole route.
         @param {Function} callback
    */


    var _proto9 = Router.prototype;

    _proto9.map = function map(callback) {
      this.recognizer.map(callback, function (recognizer, routes) {
        for (var i = routes.length - 1, proceed = true; i >= 0 && proceed; --i) {
          var route = routes[i];
          var handler = route.handler;
          recognizer.add(routes, {
            as: handler
          });
          proceed = route.path === '/' || route.path === '' || handler.slice(-6) === '.index';
        }
      });
    };

    _proto9.hasRoute = function hasRoute(route) {
      return this.recognizer.hasRoute(route);
    };

    _proto9.queryParamsTransition = function queryParamsTransition(changelist, wasTransitioning, oldState, newState) {
      var _this9 = this;

      this.fireQueryParamDidChange(newState, changelist);

      if (!wasTransitioning && this.activeTransition) {
        // One of the routes in queryParamsDidChange
        // caused a transition. Just return that transition.
        return this.activeTransition;
      } else {
        // Running queryParamsDidChange didn't change anything.
        // Just update query params and be on our way.
        // We have to return a noop transition that will
        // perform a URL update at the end. This gives
        // the user the ability to set the url update
        // method (default is replaceState).
        var newTransition = new Transition(this, undefined, undefined);
        newTransition.queryParamsOnly = true;
        oldState.queryParams = this.finalizeQueryParamChange(newState.routeInfos, newState.queryParams, newTransition);
        newTransition[QUERY_PARAMS_SYMBOL] = newState.queryParams;
        this.toReadOnlyInfos(newTransition, newState);
        this.routeWillChange(newTransition);
        newTransition.promise = newTransition.promise.then(function (result) {
          _this9._updateURL(newTransition, oldState);

          _this9.didTransition(_this9.currentRouteInfos);

          _this9.toInfos(newTransition, newState.routeInfos, true);

          _this9.routeDidChange(newTransition);

          return result;
        }, null, _promiseLabel('Transition complete'));
        return newTransition;
      }
    };

    _proto9.transitionByIntent = function transitionByIntent(intent, isIntermediate) {
      try {
        return this.getTransitionByIntent(intent, isIntermediate);
      } catch (e) {
        return new Transition(this, intent, undefined, e, undefined);
      }
    };

    _proto9.recognize = function recognize(url) {
      var intent = new URLTransitionIntent(this, url);
      var newState = this.generateNewState(intent);

      if (newState === null) {
        return newState;
      }

      var readonlyInfos = toReadOnlyRouteInfo(newState.routeInfos, newState.queryParams);
      return readonlyInfos[readonlyInfos.length - 1];
    };

    _proto9.recognizeAndLoad = function recognizeAndLoad(url) {
      var intent = new URLTransitionIntent(this, url);
      var newState = this.generateNewState(intent);

      if (newState === null) {
        return _rsvp.Promise.reject("URL " + url + " was not recognized");
      }

      var newTransition = new Transition(this, intent, newState, undefined);
      return newTransition.then(function () {
        var routeInfosWithAttributes = toReadOnlyRouteInfo(newState.routeInfos, newTransition[QUERY_PARAMS_SYMBOL], true);
        return routeInfosWithAttributes[routeInfosWithAttributes.length - 1];
      });
    };

    _proto9.generateNewState = function generateNewState(intent) {
      try {
        return intent.applyToState(this.state, false);
      } catch (e) {
        return null;
      }
    };

    _proto9.getTransitionByIntent = function getTransitionByIntent(intent, isIntermediate) {
      var _this10 = this;

      var wasTransitioning = !!this.activeTransition;
      var oldState = wasTransitioning ? this.activeTransition[STATE_SYMBOL] : this.state;
      var newTransition;
      var newState = intent.applyToState(oldState, isIntermediate);
      var queryParamChangelist = getChangelist(oldState.queryParams, newState.queryParams);

      if (routeInfosEqual(newState.routeInfos, oldState.routeInfos)) {
        // This is a no-op transition. See if query params changed.
        if (queryParamChangelist) {
          var _newTransition = this.queryParamsTransition(queryParamChangelist, wasTransitioning, oldState, newState);

          _newTransition.queryParamsOnly = true;
          return _newTransition;
        } // No-op. No need to create a new transition.


        return this.activeTransition || new Transition(this, undefined, undefined);
      }

      if (isIntermediate) {
        var transition = new Transition(this, undefined, undefined);
        this.toReadOnlyInfos(transition, newState);
        this.setupContexts(newState);
        this.routeWillChange(transition);
        return this.activeTransition;
      } // Create a new transition to the destination route.


      newTransition = new Transition(this, intent, newState, undefined, this.activeTransition); // transition is to same route with same params, only query params differ.
      // not caught above probably because refresh() has been used

      if (routeInfosSameExceptQueryParams(newState.routeInfos, oldState.routeInfos)) {
        newTransition.queryParamsOnly = true;
      }

      this.toReadOnlyInfos(newTransition, newState); // Abort and usurp any previously active transition.

      if (this.activeTransition) {
        this.activeTransition.redirect(newTransition);
      }

      this.activeTransition = newTransition; // Transition promises by default resolve with resolved state.
      // For our purposes, swap out the promise to resolve
      // after the transition has been finalized.

      newTransition.promise = newTransition.promise.then(function (result) {
        return _this10.finalizeTransition(newTransition, result);
      }, null, _promiseLabel('Settle transition promise when transition is finalized'));

      if (!wasTransitioning) {
        this.notifyExistingHandlers(newState, newTransition);
      }

      this.fireQueryParamDidChange(newState, queryParamChangelist);
      return newTransition;
    }
    /**
    @private
       Begins and returns a Transition based on the provided
    arguments. Accepts arguments in the form of both URL
    transitions and named transitions.
       @param {Router} router
    @param {Array[Object]} args arguments passed to transitionTo,
      replaceWith, or handleURL
    */
    ;

    _proto9.doTransition = function doTransition(name, modelsArray, isIntermediate) {
      if (modelsArray === void 0) {
        modelsArray = [];
      }

      if (isIntermediate === void 0) {
        isIntermediate = false;
      }

      var lastArg = modelsArray[modelsArray.length - 1];
      var queryParams = {};

      if (lastArg !== undefined && lastArg.hasOwnProperty('queryParams')) {
        queryParams = modelsArray.pop().queryParams;
      }

      var intent;

      if (name === undefined) {
        _log(this, 'Updating query params'); // A query param update is really just a transition
        // into the route you're already on.


        var routeInfos = this.state.routeInfos;
        intent = new NamedTransitionIntent(this, routeInfos[routeInfos.length - 1].name, undefined, [], queryParams);
      } else if (name.charAt(0) === '/') {
        _log(this, 'Attempting URL transition to ' + name);

        intent = new URLTransitionIntent(this, name);
      } else {
        _log(this, 'Attempting transition to ' + name);

        intent = new NamedTransitionIntent(this, name, undefined, modelsArray, queryParams);
      }

      return this.transitionByIntent(intent, isIntermediate);
    }
    /**
    @private
       Updates the URL (if necessary) and calls `setupContexts`
    to update the router's array of `currentRouteInfos`.
    */
    ;

    _proto9.finalizeTransition = function finalizeTransition(transition, newState) {
      try {
        _log(transition.router, transition.sequence, 'Resolved all models on destination route; finalizing transition.');

        var routeInfos = newState.routeInfos; // Run all the necessary enter/setup/exit hooks

        this.setupContexts(newState, transition); // Check if a redirect occurred in enter/setup

        if (transition.isAborted) {
          // TODO: cleaner way? distinguish b/w targetRouteInfos?
          this.state.routeInfos = this.currentRouteInfos;
          return _rsvp.Promise.reject(logAbort(transition));
        }

        this._updateURL(transition, newState);

        transition.isActive = false;
        this.activeTransition = undefined;
        this.triggerEvent(this.currentRouteInfos, true, 'didTransition', []);
        this.didTransition(this.currentRouteInfos);
        this.toInfos(transition, newState.routeInfos, true);
        this.routeDidChange(transition);

        _log(this, transition.sequence, 'TRANSITION COMPLETE.'); // Resolve with the final route.


        return routeInfos[routeInfos.length - 1].route;
      } catch (e) {
        if (!(e instanceof TransitionAbortedError)) {
          var infos = transition[STATE_SYMBOL].routeInfos;
          transition.trigger(true, 'error', e, transition, infos[infos.length - 1].route);
          transition.abort();
        }

        throw e;
      }
    }
    /**
    @private
       Takes an Array of `RouteInfo`s, figures out which ones are
    exiting, entering, or changing contexts, and calls the
    proper route hooks.
       For example, consider the following tree of routes. Each route is
    followed by the URL segment it handles.
       ```
    |~index ("/")
    | |~posts ("/posts")
    | | |-showPost ("/:id")
    | | |-newPost ("/new")
    | | |-editPost ("/edit")
    | |~about ("/about/:id")
    ```
       Consider the following transitions:
       1. A URL transition to `/posts/1`.
       1. Triggers the `*model` callbacks on the
          `index`, `posts`, and `showPost` routes
       2. Triggers the `enter` callback on the same
       3. Triggers the `setup` callback on the same
    2. A direct transition to `newPost`
       1. Triggers the `exit` callback on `showPost`
       2. Triggers the `enter` callback on `newPost`
       3. Triggers the `setup` callback on `newPost`
    3. A direct transition to `about` with a specified
       context object
       1. Triggers the `exit` callback on `newPost`
          and `posts`
       2. Triggers the `serialize` callback on `about`
       3. Triggers the `enter` callback on `about`
       4. Triggers the `setup` callback on `about`
       @param {Router} transition
    @param {TransitionState} newState
    */
    ;

    _proto9.setupContexts = function setupContexts(newState, transition) {
      var partition = this.partitionRoutes(this.state, newState);
      var i, l, route;

      for (i = 0, l = partition.exited.length; i < l; i++) {
        route = partition.exited[i].route;
        delete route.context;

        if (route !== undefined) {
          if (route._internalReset !== undefined) {
            route._internalReset(true, transition);
          }

          if (route.exit !== undefined) {
            route.exit(transition);
          }
        }
      }

      var oldState = this.oldState = this.state;
      this.state = newState;
      var currentRouteInfos = this.currentRouteInfos = partition.unchanged.slice();

      try {
        for (i = 0, l = partition.reset.length; i < l; i++) {
          route = partition.reset[i].route;

          if (route !== undefined) {
            if (route._internalReset !== undefined) {
              route._internalReset(false, transition);
            }
          }
        }

        for (i = 0, l = partition.updatedContext.length; i < l; i++) {
          this.routeEnteredOrUpdated(currentRouteInfos, partition.updatedContext[i], false, transition);
        }

        for (i = 0, l = partition.entered.length; i < l; i++) {
          this.routeEnteredOrUpdated(currentRouteInfos, partition.entered[i], true, transition);
        }
      } catch (e) {
        this.state = oldState;
        this.currentRouteInfos = oldState.routeInfos;
        throw e;
      }

      this.state.queryParams = this.finalizeQueryParamChange(currentRouteInfos, newState.queryParams, transition);
    }
    /**
    @private
       Fires queryParamsDidChange event
    */
    ;

    _proto9.fireQueryParamDidChange = function fireQueryParamDidChange(newState, queryParamChangelist) {
      // If queryParams changed trigger event
      if (queryParamChangelist) {
        // This is a little hacky but we need some way of storing
        // changed query params given that no activeTransition
        // is guaranteed to have occurred.
        this._changedQueryParams = queryParamChangelist.all;
        this.triggerEvent(newState.routeInfos, true, 'queryParamsDidChange', [queryParamChangelist.changed, queryParamChangelist.all, queryParamChangelist.removed]);
        this._changedQueryParams = undefined;
      }
    }
    /**
    @private
       Helper method used by setupContexts. Handles errors or redirects
    that may happen in enter/setup.
    */
    ;

    _proto9.routeEnteredOrUpdated = function routeEnteredOrUpdated(currentRouteInfos, routeInfo, enter, transition) {
      var route = routeInfo.route,
          context = routeInfo.context;

      function _routeEnteredOrUpdated(route) {
        if (enter) {
          if (route.enter !== undefined) {
            route.enter(transition);
          }
        }

        if (transition && transition.isAborted) {
          throw new TransitionAbortedError();
        }

        route.context = context;

        if (route.contextDidChange !== undefined) {
          route.contextDidChange();
        }

        if (route.setup !== undefined) {
          route.setup(context, transition);
        }

        if (transition && transition.isAborted) {
          throw new TransitionAbortedError();
        }

        currentRouteInfos.push(routeInfo);
        return route;
      } // If the route doesn't exist, it means we haven't resolved the route promise yet


      if (route === undefined) {
        routeInfo.routePromise = routeInfo.routePromise.then(_routeEnteredOrUpdated);
      } else {
        _routeEnteredOrUpdated(route);
      }

      return true;
    }
    /**
    @private
       This function is called when transitioning from one URL to
    another to determine which routes are no longer active,
    which routes are newly active, and which routes remain
    active but have their context changed.
       Take a list of old routes and new routes and partition
    them into four buckets:
       * unchanged: the route was active in both the old and
      new URL, and its context remains the same
    * updated context: the route was active in both the
      old and new URL, but its context changed. The route's
      `setup` method, if any, will be called with the new
      context.
    * exited: the route was active in the old URL, but is
      no longer active.
    * entered: the route was not active in the old URL, but
      is now active.
       The PartitionedRoutes structure has four fields:
       * `updatedContext`: a list of `RouteInfo` objects that
      represent routes that remain active but have a changed
      context
    * `entered`: a list of `RouteInfo` objects that represent
      routes that are newly active
    * `exited`: a list of `RouteInfo` objects that are no
      longer active.
    * `unchanged`: a list of `RouteInfo` objects that remain active.
       @param {Array[InternalRouteInfo]} oldRoutes a list of the route
      information for the previous URL (or `[]` if this is the
      first handled transition)
    @param {Array[InternalRouteInfo]} newRoutes a list of the route
      information for the new URL
       @return {Partition}
    */
    ;

    _proto9.partitionRoutes = function partitionRoutes(oldState, newState) {
      var oldRouteInfos = oldState.routeInfos;
      var newRouteInfos = newState.routeInfos;
      var routes = {
        updatedContext: [],
        exited: [],
        entered: [],
        unchanged: [],
        reset: []
      };
      var routeChanged,
          contextChanged = false,
          i,
          l;

      for (i = 0, l = newRouteInfos.length; i < l; i++) {
        var oldRouteInfo = oldRouteInfos[i],
            newRouteInfo = newRouteInfos[i];

        if (!oldRouteInfo || oldRouteInfo.route !== newRouteInfo.route) {
          routeChanged = true;
        }

        if (routeChanged) {
          routes.entered.push(newRouteInfo);

          if (oldRouteInfo) {
            routes.exited.unshift(oldRouteInfo);
          }
        } else if (contextChanged || oldRouteInfo.context !== newRouteInfo.context) {
          contextChanged = true;
          routes.updatedContext.push(newRouteInfo);
        } else {
          routes.unchanged.push(oldRouteInfo);
        }
      }

      for (i = newRouteInfos.length, l = oldRouteInfos.length; i < l; i++) {
        routes.exited.unshift(oldRouteInfos[i]);
      }

      routes.reset = routes.updatedContext.slice();
      routes.reset.reverse();
      return routes;
    };

    _proto9._updateURL = function _updateURL(transition, state) {
      var urlMethod = transition.urlMethod;

      if (!urlMethod) {
        return;
      }

      var routeInfos = state.routeInfos;
      var routeName = routeInfos[routeInfos.length - 1].name;
      var params = {};

      for (var i = routeInfos.length - 1; i >= 0; --i) {
        var routeInfo = routeInfos[i];
        merge(params, routeInfo.params);

        if (routeInfo.route.inaccessibleByURL) {
          urlMethod = null;
        }
      }

      if (urlMethod) {
        params.queryParams = transition._visibleQueryParams || state.queryParams;
        var url = this.recognizer.generate(routeName, params); // transitions during the initial transition must always use replaceURL.
        // When the app boots, you are at a url, e.g. /foo. If some route
        // redirects to bar as part of the initial transition, you don't want to
        // add a history entry for /foo. If you do, pressing back will immediately
        // hit the redirect again and take you back to /bar, thus killing the back
        // button

        var initial = transition.isCausedByInitialTransition; // say you are at / and you click a link to route /foo. In /foo's
        // route, the transition is aborted using replacewith('/bar').
        // Because the current url is still /, the history entry for / is
        // removed from the history. Clicking back will take you to the page
        // you were on before /, which is often not even the app, thus killing
        // the back button. That's why updateURL is always correct for an
        // aborting transition that's not the initial transition

        var replaceAndNotAborting = urlMethod === 'replace' && !transition.isCausedByAbortingTransition; // because calling refresh causes an aborted transition, this needs to be
        // special cased - if the initial transition is a replace transition, the
        // urlMethod should be honored here.

        var isQueryParamsRefreshTransition = transition.queryParamsOnly && urlMethod === 'replace'; // say you are at / and you a `replaceWith(/foo)` is called. Then, that
        // transition is aborted with `replaceWith(/bar)`. At the end, we should
        // end up with /bar replacing /. We are replacing the replace. We only
        // will replace the initial route if all subsequent aborts are also
        // replaces. However, there is some ambiguity around the correct behavior
        // here.

        var replacingReplace = urlMethod === 'replace' && transition.isCausedByAbortingReplaceTransition;

        if (initial || replaceAndNotAborting || isQueryParamsRefreshTransition || replacingReplace) {
          this.replaceURL(url);
        } else {
          this.updateURL(url);
        }
      }
    };

    _proto9.finalizeQueryParamChange = function finalizeQueryParamChange(resolvedHandlers, newQueryParams, transition) {
      // We fire a finalizeQueryParamChange event which
      // gives the new route hierarchy a chance to tell
      // us which query params it's consuming and what
      // their final values are. If a query param is
      // no longer consumed in the final route hierarchy,
      // its serialized segment will be removed
      // from the URL.
      for (var k in newQueryParams) {
        if (newQueryParams.hasOwnProperty(k) && newQueryParams[k] === null) {
          delete newQueryParams[k];
        }
      }

      var finalQueryParamsArray = [];
      this.triggerEvent(resolvedHandlers, true, 'finalizeQueryParamChange', [newQueryParams, finalQueryParamsArray, transition]);

      if (transition) {
        transition._visibleQueryParams = {};
      }

      var finalQueryParams = {};

      for (var i = 0, len = finalQueryParamsArray.length; i < len; ++i) {
        var qp = finalQueryParamsArray[i];
        finalQueryParams[qp.key] = qp.value;

        if (transition && qp.visible !== false) {
          transition._visibleQueryParams[qp.key] = qp.value;
        }
      }

      return finalQueryParams;
    };

    _proto9.toReadOnlyInfos = function toReadOnlyInfos(newTransition, newState) {
      var oldRouteInfos = this.state.routeInfos;
      this.fromInfos(newTransition, oldRouteInfos);
      this.toInfos(newTransition, newState.routeInfos);
      this._lastQueryParams = newState.queryParams;
    };

    _proto9.fromInfos = function fromInfos(newTransition, oldRouteInfos) {
      if (newTransition !== undefined && oldRouteInfos.length > 0) {
        var fromInfos = toReadOnlyRouteInfo(oldRouteInfos, (0, _polyfills.assign)({}, this._lastQueryParams), true);
        newTransition.from = fromInfos[fromInfos.length - 1] || null;
      }
    };

    _proto9.toInfos = function toInfos(newTransition, newRouteInfos, includeAttributes) {
      if (includeAttributes === void 0) {
        includeAttributes = false;
      }

      if (newTransition !== undefined && newRouteInfos.length > 0) {
        var toInfos = toReadOnlyRouteInfo(newRouteInfos, (0, _polyfills.assign)({}, newTransition[QUERY_PARAMS_SYMBOL]), includeAttributes);
        newTransition.to = toInfos[toInfos.length - 1] || null;
      }
    };

    _proto9.notifyExistingHandlers = function notifyExistingHandlers(newState, newTransition) {
      var oldRouteInfos = this.state.routeInfos,
          i,
          oldRouteInfoLen,
          oldHandler,
          newRouteInfo;
      oldRouteInfoLen = oldRouteInfos.length;

      for (i = 0; i < oldRouteInfoLen; i++) {
        oldHandler = oldRouteInfos[i];
        newRouteInfo = newState.routeInfos[i];

        if (!newRouteInfo || oldHandler.name !== newRouteInfo.name) {
          break;
        }

        if (!newRouteInfo.isResolved) {}
      }

      this.triggerEvent(oldRouteInfos, true, 'willTransition', [newTransition]);
      this.routeWillChange(newTransition);
      this.willTransition(oldRouteInfos, newState.routeInfos, newTransition);
    }
    /**
      Clears the current and target route routes and triggers exit
      on each of them starting at the leaf and traversing up through
      its ancestors.
    */
    ;

    _proto9.reset = function reset() {
      if (this.state) {
        forEach(this.state.routeInfos.slice().reverse(), function (routeInfo) {
          var route = routeInfo.route;

          if (route !== undefined) {
            if (route.exit !== undefined) {
              route.exit();
            }
          }

          return true;
        });
      }

      this.oldState = undefined;
      this.state = new TransitionState();
      this.currentRouteInfos = undefined;
    }
    /**
      let handler = routeInfo.handler;
      The entry point for handling a change to the URL (usually
      via the back and forward button).
         Returns an Array of handlers and the parameters associated
      with those parameters.
         @param {String} url a URL to process
         @return {Array} an Array of `[handler, parameter]` tuples
    */
    ;

    _proto9.handleURL = function handleURL(url) {
      // Perform a URL-based transition, but don't change
      // the URL afterward, since it already happened.
      if (url.charAt(0) !== '/') {
        url = '/' + url;
      }

      return this.doTransition(url).method(null);
    }
    /**
      Transition into the specified named route.
         If necessary, trigger the exit callback on any routes
      that are no longer represented by the target route.
         @param {String} name the name of the route
    */
    ;

    _proto9.transitionTo = function transitionTo(name) {
      for (var _len3 = arguments.length, contexts = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        contexts[_key3 - 1] = arguments[_key3];
      }

      if (typeof name === 'object') {
        contexts.push(name);
        return this.doTransition(undefined, contexts, false);
      }

      return this.doTransition(name, contexts);
    };

    _proto9.intermediateTransitionTo = function intermediateTransitionTo(name) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      return this.doTransition(name, args, true);
    };

    _proto9.refresh = function refresh(pivotRoute) {
      var previousTransition = this.activeTransition;
      var state = previousTransition ? previousTransition[STATE_SYMBOL] : this.state;
      var routeInfos = state.routeInfos;

      if (pivotRoute === undefined) {
        pivotRoute = routeInfos[0].route;
      }

      _log(this, 'Starting a refresh transition');

      var name = routeInfos[routeInfos.length - 1].name;
      var intent = new NamedTransitionIntent(this, name, pivotRoute, [], this._changedQueryParams || state.queryParams);
      var newTransition = this.transitionByIntent(intent, false); // if the previous transition is a replace transition, that needs to be preserved

      if (previousTransition && previousTransition.urlMethod === 'replace') {
        newTransition.method(previousTransition.urlMethod);
      }

      return newTransition;
    }
    /**
      Identical to `transitionTo` except that the current URL will be replaced
      if possible.
         This method is intended primarily for use with `replaceState`.
         @param {String} name the name of the route
    */
    ;

    _proto9.replaceWith = function replaceWith(name) {
      return this.doTransition(name).method('replace');
    }
    /**
      Take a named route and context objects and generate a
      URL.
         @param {String} name the name of the route to generate
        a URL for
      @param {...Object} objects a list of objects to serialize
         @return {String} a URL
    */
    ;

    _proto9.generate = function generate(routeName) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      var partitionedArgs = extractQueryParams(args),
          suppliedParams = partitionedArgs[0],
          queryParams = partitionedArgs[1]; // Construct a TransitionIntent with the provided params
      // and apply it to the present state of the router.

      var intent = new NamedTransitionIntent(this, routeName, undefined, suppliedParams);
      var state = intent.applyToState(this.state, false);
      var params = {};

      for (var i = 0, len = state.routeInfos.length; i < len; ++i) {
        var routeInfo = state.routeInfos[i];
        var routeParams = routeInfo.serialize();
        merge(params, routeParams);
      }

      params.queryParams = queryParams;
      return this.recognizer.generate(routeName, params);
    };

    _proto9.applyIntent = function applyIntent(routeName, contexts) {
      var intent = new NamedTransitionIntent(this, routeName, undefined, contexts);
      var state = this.activeTransition && this.activeTransition[STATE_SYMBOL] || this.state;
      return intent.applyToState(state, false);
    };

    _proto9.isActiveIntent = function isActiveIntent(routeName, contexts, queryParams, _state) {
      var state = _state || this.state,
          targetRouteInfos = state.routeInfos,
          routeInfo,
          len;

      if (!targetRouteInfos.length) {
        return false;
      }

      var targetHandler = targetRouteInfos[targetRouteInfos.length - 1].name;
      var recogHandlers = this.recognizer.handlersFor(targetHandler);
      var index = 0;

      for (len = recogHandlers.length; index < len; ++index) {
        routeInfo = targetRouteInfos[index];

        if (routeInfo.name === routeName) {
          break;
        }
      }

      if (index === recogHandlers.length) {
        // The provided route name isn't even in the route hierarchy.
        return false;
      }

      var testState = new TransitionState();
      testState.routeInfos = targetRouteInfos.slice(0, index + 1);
      recogHandlers = recogHandlers.slice(0, index + 1);
      var intent = new NamedTransitionIntent(this, targetHandler, undefined, contexts);
      var newState = intent.applyToHandlers(testState, recogHandlers, targetHandler, true, true);
      var routesEqual = routeInfosEqual(newState.routeInfos, testState.routeInfos);

      if (!queryParams || !routesEqual) {
        return routesEqual;
      } // Get a hash of QPs that will still be active on new route


      var activeQPsOnNewHandler = {};
      merge(activeQPsOnNewHandler, queryParams);
      var activeQueryParams = state.queryParams;

      for (var key in activeQueryParams) {
        if (activeQueryParams.hasOwnProperty(key) && activeQPsOnNewHandler.hasOwnProperty(key)) {
          activeQPsOnNewHandler[key] = activeQueryParams[key];
        }
      }

      return routesEqual && !getChangelist(activeQPsOnNewHandler, queryParams);
    };

    _proto9.isActive = function isActive(routeName) {
      for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }

      var partitionedArgs = extractQueryParams(args);
      return this.isActiveIntent(routeName, partitionedArgs[0], partitionedArgs[1]);
    };

    _proto9.trigger = function trigger(name) {
      for (var _len7 = arguments.length, args = new Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        args[_key7 - 1] = arguments[_key7];
      }

      this.triggerEvent(this.currentRouteInfos, false, name, args);
    };

    return Router;
  }();

  function routeInfosEqual(routeInfos, otherRouteInfos) {
    if (routeInfos.length !== otherRouteInfos.length) {
      return false;
    }

    for (var i = 0, len = routeInfos.length; i < len; ++i) {
      if (routeInfos[i] !== otherRouteInfos[i]) {
        return false;
      }
    }

    return true;
  }

  function routeInfosSameExceptQueryParams(routeInfos, otherRouteInfos) {
    if (routeInfos.length !== otherRouteInfos.length) {
      return false;
    }

    for (var i = 0, len = routeInfos.length; i < len; ++i) {
      if (routeInfos[i].name !== otherRouteInfos[i].name) {
        return false;
      }

      if (!paramsEqual(routeInfos[i].params, otherRouteInfos[i].params)) {
        return false;
      }
    }

    return true;
  }

  function paramsEqual(params, otherParams) {
    if (!params && !otherParams) {
      return true;
    } else if (!params && !!otherParams || !!params && !otherParams) {
      // one is falsy but other is not;
      return false;
    }

    var keys = Object.keys(params);
    var otherKeys = Object.keys(otherParams);

    if (keys.length !== otherKeys.length) {
      return false;
    }

    for (var i = 0, len = keys.length; i < len; ++i) {
      var key = keys[i];

      if (params[key] !== otherParams[key]) {
        return false;
      }
    }

    return true;
  }

  var _default = Router;
  _exports.default = _default;
});