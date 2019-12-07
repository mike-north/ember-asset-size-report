define("ember-testing/lib/test/adapter", ["exports", "@ember/-internals/error-handling"], function (_exports, _errorHandling) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getAdapter = getAdapter;
  _exports.setAdapter = setAdapter;
  _exports.asyncStart = asyncStart;
  _exports.asyncEnd = asyncEnd;
  var adapter;

  function getAdapter() {
    return adapter;
  }

  function setAdapter(value) {
    adapter = value;

    if (value && typeof value.exception === 'function') {
      (0, _errorHandling.setDispatchOverride)(adapterDispatch);
    } else {
      (0, _errorHandling.setDispatchOverride)(null);
    }
  }

  function asyncStart() {
    if (adapter) {
      adapter.asyncStart();
    }
  }

  function asyncEnd() {
    if (adapter) {
      adapter.asyncEnd();
    }
  }

  function adapterDispatch(error) {
    adapter.exception(error);
    console.error(error.stack); // eslint-disable-line no-console
  }
});