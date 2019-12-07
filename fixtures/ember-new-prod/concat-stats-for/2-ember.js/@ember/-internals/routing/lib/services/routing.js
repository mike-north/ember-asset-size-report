define("@ember/-internals/routing/lib/services/routing", ["exports", "ember-babel", "@ember/object/computed", "@ember/polyfills", "@ember/service"], function (_exports, _emberBabel, _computed, _polyfills, _service) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module ember
  */

  /**
    The Routing service is used by LinkComponent, and provides facilities for
    the component/view layer to interact with the router.
  
    This is a private service for internal usage only. For public usage,
    refer to the `Router` service.
  
    @private
    @class RoutingService
  */
  var RoutingService =
  /*#__PURE__*/
  function (_Service) {
    (0, _emberBabel.inheritsLoose)(RoutingService, _Service);

    function RoutingService() {
      return _Service.apply(this, arguments) || this;
    }

    var _proto = RoutingService.prototype;

    _proto.hasRoute = function hasRoute(routeName) {
      return this.router.hasRoute(routeName);
    };

    _proto.transitionTo = function transitionTo(routeName, models, queryParams, shouldReplace) {
      var transition = this.router._doTransition(routeName, models, queryParams);

      if (shouldReplace) {
        transition.method('replace');
      }

      return transition;
    };

    _proto.normalizeQueryParams = function normalizeQueryParams(routeName, models, queryParams) {
      this.router._prepareQueryParams(routeName, models, queryParams);
    };

    _proto.generateURL = function generateURL(routeName, models, queryParams) {
      var router = this.router; // return early when the router microlib is not present, which is the case for {{link-to}} in integration tests

      if (!router._routerMicrolib) {
        return;
      }

      var visibleQueryParams = {};

      if (queryParams) {
        (0, _polyfills.assign)(visibleQueryParams, queryParams);
        this.normalizeQueryParams(routeName, models, visibleQueryParams);
      }

      return router.generate.apply(router, [routeName].concat(models, [{
        queryParams: visibleQueryParams
      }]));
    };

    _proto.isActiveForRoute = function isActiveForRoute(contexts, queryParams, routeName, routerState, isCurrentWhenSpecified) {
      var handlers = this.router._routerMicrolib.recognizer.handlersFor(routeName);

      var leafName = handlers[handlers.length - 1].handler;
      var maximumContexts = numberOfContextsAcceptedByHandler(routeName, handlers); // NOTE: any ugliness in the calculation of activeness is largely
      // due to the fact that we support automatic normalizing of
      // `resource` -> `resource.index`, even though there might be
      // dynamic segments / query params defined on `resource.index`
      // which complicates (and makes somewhat ambiguous) the calculation
      // of activeness for links that link to `resource` instead of
      // directly to `resource.index`.
      // if we don't have enough contexts revert back to full route name
      // this is because the leaf route will use one of the contexts

      if (contexts.length > maximumContexts) {
        routeName = leafName;
      }

      return routerState.isActiveIntent(routeName, contexts, queryParams, !isCurrentWhenSpecified);
    };

    return RoutingService;
  }(_service.default);

  _exports.default = RoutingService;
  RoutingService.reopen({
    targetState: (0, _computed.readOnly)('router.targetState'),
    currentState: (0, _computed.readOnly)('router.currentState'),
    currentRouteName: (0, _computed.readOnly)('router.currentRouteName'),
    currentPath: (0, _computed.readOnly)('router.currentPath')
  });

  function numberOfContextsAcceptedByHandler(handlerName, handlerInfos) {
    var req = 0;

    for (var i = 0; i < handlerInfos.length; i++) {
      req += handlerInfos[i].names.length;

      if (handlerInfos[i].handler === handlerName) {
        break;
      }
    }

    return req;
  }
});