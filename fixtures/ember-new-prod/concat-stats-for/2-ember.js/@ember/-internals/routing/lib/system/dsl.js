define("@ember/-internals/routing/lib/system/dsl", ["exports", "@ember/debug", "@ember/polyfills"], function (_exports, _debug, _polyfills) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var uuid = 0;

  function isCallback(value) {
    return typeof value === 'function';
  }

  function isOptions(value) {
    return value !== null && typeof value === 'object';
  }

  var DSLImpl =
  /*#__PURE__*/
  function () {
    function DSLImpl(name, options) {
      if (name === void 0) {
        name = null;
      }

      this.explicitIndex = false;
      this.parent = name;
      this.enableLoadingSubstates = Boolean(options && options.enableLoadingSubstates);
      this.matches = [];
      this.options = options;
    }

    var _proto = DSLImpl.prototype;

    _proto.route = function route(name, _options, _callback) {
      var options;
      var callback = null;
      var dummyErrorRoute = "/_unused_dummy_error_path_route_" + name + "/:error";

      if (isCallback(_options)) {
        (false && !(arguments.length === 2) && (0, _debug.assert)('Unexpected arguments', arguments.length === 2));
        options = {};
        callback = _options;
      } else if (isCallback(_callback)) {
        (false && !(arguments.length === 3) && (0, _debug.assert)('Unexpected arguments', arguments.length === 3));
        (false && !(isOptions(_options)) && (0, _debug.assert)('Unexpected arguments', isOptions(_options)));
        options = _options;
        callback = _callback;
      } else {
        options = _options || {};
      }

      (false && !(function () {
        if (options.overrideNameAssertion === true) {
          return true;
        }

        return ['basic', 'application'].indexOf(name) === -1;
      }()) && (0, _debug.assert)("'" + name + "' cannot be used as a route name.", function () {
        if (options.overrideNameAssertion === true) {
          return true;
        }

        return ['basic', 'application'].indexOf(name) === -1;
      }()));
      (false && !(name.indexOf(':') === -1) && (0, _debug.assert)("'" + name + "' is not a valid route name. It cannot contain a ':'. You may want to use the 'path' option instead.", name.indexOf(':') === -1));

      if (this.enableLoadingSubstates) {
        createRoute(this, name + "_loading", {
          resetNamespace: options.resetNamespace
        });
        createRoute(this, name + "_error", {
          resetNamespace: options.resetNamespace,
          path: dummyErrorRoute
        });
      }

      if (callback) {
        var fullName = getFullName(this, name, options.resetNamespace);
        var dsl = new DSLImpl(fullName, this.options);
        createRoute(dsl, 'loading');
        createRoute(dsl, 'error', {
          path: dummyErrorRoute
        });
        callback.call(dsl);
        createRoute(this, name, options, dsl.generate());
      } else {
        createRoute(this, name, options);
      }
    }
    /* eslint-enable no-dupe-class-members */
    ;

    _proto.push = function push(url, name, callback, serialize) {
      var parts = name.split('.');

      if (this.options.engineInfo) {
        var localFullName = name.slice(this.options.engineInfo.fullName.length + 1);
        var routeInfo = (0, _polyfills.assign)({
          localFullName: localFullName
        }, this.options.engineInfo);

        if (serialize) {
          routeInfo.serializeMethod = serialize;
        }

        this.options.addRouteForEngine(name, routeInfo);
      } else if (serialize) {
        throw new Error("Defining a route serializer on route '" + name + "' outside an Engine is not allowed.");
      }

      if (url === '' || url === '/' || parts[parts.length - 1] === 'index') {
        this.explicitIndex = true;
      }

      this.matches.push(url, name, callback);
    };

    _proto.generate = function generate() {
      var dslMatches = this.matches;

      if (!this.explicitIndex) {
        this.route('index', {
          path: '/'
        });
      }

      return function (match) {
        for (var i = 0; i < dslMatches.length; i += 3) {
          match(dslMatches[i]).to(dslMatches[i + 1], dslMatches[i + 2]);
        }
      };
    };

    _proto.mount = function mount(_name, options) {
      if (options === void 0) {
        options = {};
      }

      var engineRouteMap = this.options.resolveRouteMap(_name);
      var name = _name;

      if (options.as) {
        name = options.as;
      }

      var fullName = getFullName(this, name, options.resetNamespace);
      var engineInfo = {
        name: _name,
        instanceId: uuid++,
        mountPoint: fullName,
        fullName: fullName
      };
      var path = options.path;

      if (typeof path !== 'string') {
        path = "/" + name;
      }

      var callback;
      var dummyErrorRoute = "/_unused_dummy_error_path_route_" + name + "/:error";

      if (engineRouteMap) {
        var shouldResetEngineInfo = false;
        var oldEngineInfo = this.options.engineInfo;

        if (oldEngineInfo) {
          shouldResetEngineInfo = true;
          this.options.engineInfo = engineInfo;
        }

        var optionsForChild = (0, _polyfills.assign)({
          engineInfo: engineInfo
        }, this.options);
        var childDSL = new DSLImpl(fullName, optionsForChild);
        createRoute(childDSL, 'loading');
        createRoute(childDSL, 'error', {
          path: dummyErrorRoute
        });
        engineRouteMap.class.call(childDSL);
        callback = childDSL.generate();

        if (shouldResetEngineInfo) {
          this.options.engineInfo = oldEngineInfo;
        }
      }

      var localFullName = 'application';
      var routeInfo = (0, _polyfills.assign)({
        localFullName: localFullName
      }, engineInfo);

      if (this.enableLoadingSubstates) {
        // These values are important to register the loading routes under their
        // proper names for the Router and within the Engine's registry.
        var substateName = name + "_loading";
        var _localFullName = "application_loading";

        var _routeInfo = (0, _polyfills.assign)({
          localFullName: _localFullName
        }, engineInfo);

        createRoute(this, substateName, {
          resetNamespace: options.resetNamespace
        });
        this.options.addRouteForEngine(substateName, _routeInfo);
        substateName = name + "_error";
        _localFullName = "application_error";
        _routeInfo = (0, _polyfills.assign)({
          localFullName: _localFullName
        }, engineInfo);
        createRoute(this, substateName, {
          resetNamespace: options.resetNamespace,
          path: dummyErrorRoute
        });
        this.options.addRouteForEngine(substateName, _routeInfo);
      }

      this.options.addRouteForEngine(fullName, routeInfo);
      this.push(path, fullName, callback);
    };

    return DSLImpl;
  }();

  _exports.default = DSLImpl;

  function canNest(dsl) {
    return dsl.parent !== 'application';
  }

  function getFullName(dsl, name, resetNamespace) {
    if (canNest(dsl) && resetNamespace !== true) {
      return dsl.parent + "." + name;
    } else {
      return name;
    }
  }

  function createRoute(dsl, name, options, callback) {
    if (options === void 0) {
      options = {};
    }

    var fullName = getFullName(dsl, name, options.resetNamespace);

    if (typeof options.path !== 'string') {
      options.path = "/" + name;
    }

    dsl.push(options.path, fullName, callback, options.serialize);
  }
});