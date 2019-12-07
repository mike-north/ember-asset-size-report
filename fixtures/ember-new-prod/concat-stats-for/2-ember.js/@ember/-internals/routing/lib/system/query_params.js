define("@ember/-internals/routing/lib/system/query_params", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var QueryParams = function QueryParams(values) {
    if (values === void 0) {
      values = null;
    }

    this.isQueryParams = true;
    this.values = values;
  };

  _exports.default = QueryParams;
});