define("@ember/object/computed", ["exports", "@ember/object/lib/computed/computed_macros", "@ember/object/lib/computed/reduce_computed_macros"], function (_exports, _computed_macros, _reduce_computed_macros) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "empty", {
    enumerable: true,
    get: function get() {
      return _computed_macros.empty;
    }
  });
  Object.defineProperty(_exports, "notEmpty", {
    enumerable: true,
    get: function get() {
      return _computed_macros.notEmpty;
    }
  });
  Object.defineProperty(_exports, "none", {
    enumerable: true,
    get: function get() {
      return _computed_macros.none;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function get() {
      return _computed_macros.not;
    }
  });
  Object.defineProperty(_exports, "bool", {
    enumerable: true,
    get: function get() {
      return _computed_macros.bool;
    }
  });
  Object.defineProperty(_exports, "match", {
    enumerable: true,
    get: function get() {
      return _computed_macros.match;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function get() {
      return _computed_macros.equal;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function get() {
      return _computed_macros.gt;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function get() {
      return _computed_macros.gte;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function get() {
      return _computed_macros.lt;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function get() {
      return _computed_macros.lte;
    }
  });
  Object.defineProperty(_exports, "oneWay", {
    enumerable: true,
    get: function get() {
      return _computed_macros.oneWay;
    }
  });
  Object.defineProperty(_exports, "readOnly", {
    enumerable: true,
    get: function get() {
      return _computed_macros.readOnly;
    }
  });
  Object.defineProperty(_exports, "deprecatingAlias", {
    enumerable: true,
    get: function get() {
      return _computed_macros.deprecatingAlias;
    }
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function get() {
      return _computed_macros.and;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function get() {
      return _computed_macros.or;
    }
  });
  Object.defineProperty(_exports, "sum", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.sum;
    }
  });
  Object.defineProperty(_exports, "min", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.min;
    }
  });
  Object.defineProperty(_exports, "max", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.max;
    }
  });
  Object.defineProperty(_exports, "map", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.map;
    }
  });
  Object.defineProperty(_exports, "sort", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.sort;
    }
  });
  Object.defineProperty(_exports, "setDiff", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.setDiff;
    }
  });
  Object.defineProperty(_exports, "mapBy", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.mapBy;
    }
  });
  Object.defineProperty(_exports, "filter", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.filter;
    }
  });
  Object.defineProperty(_exports, "filterBy", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.filterBy;
    }
  });
  Object.defineProperty(_exports, "uniq", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.uniq;
    }
  });
  Object.defineProperty(_exports, "uniqBy", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.uniqBy;
    }
  });
  Object.defineProperty(_exports, "union", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.union;
    }
  });
  Object.defineProperty(_exports, "intersect", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.intersect;
    }
  });
  Object.defineProperty(_exports, "collect", {
    enumerable: true,
    get: function get() {
      return _reduce_computed_macros.collect;
    }
  });
});