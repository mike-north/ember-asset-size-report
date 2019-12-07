define("@ember/-internals/routing/lib/system/router_state", ["exports", "@ember/polyfills", "@ember/-internals/routing/lib/utils"], function (_exports, _polyfills, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var RouterState =
  /*#__PURE__*/
  function () {
    function RouterState(emberRouter, router, routerJsState) {
      this.emberRouter = emberRouter;
      this.router = router;
      this.routerJsState = routerJsState;
    }

    var _proto = RouterState.prototype;

    _proto.isActiveIntent = function isActiveIntent(routeName, models, queryParams, queryParamsMustMatch) {
      var state = this.routerJsState;

      if (!this.router.isActiveIntent(routeName, models, undefined, state)) {
        return false;
      }

      if (queryParamsMustMatch && Object.keys(queryParams).length > 0) {
        var visibleQueryParams = (0, _polyfills.assign)({}, queryParams);

        this.emberRouter._prepareQueryParams(routeName, models, visibleQueryParams);

        return (0, _utils.shallowEqual)(visibleQueryParams, state.queryParams);
      }

      return true;
    };

    return RouterState;
  }();

  _exports.default = RouterState;
});