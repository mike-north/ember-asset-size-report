define("ember-data/adapters/errors", ["exports", "@ember-data/adapter/error"], function (_exports, _error) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "AbortError", {
    enumerable: true,
    get: function () {
      return _error.AbortError;
    }
  });
  Object.defineProperty(_exports, "AdapterError", {
    enumerable: true,
    get: function () {
      return _error.AdapterError;
    }
  });
  Object.defineProperty(_exports, "ConflictError", {
    enumerable: true,
    get: function () {
      return _error.ConflictError;
    }
  });
  Object.defineProperty(_exports, "ForbiddenError", {
    enumerable: true,
    get: function () {
      return _error.ForbiddenError;
    }
  });
  Object.defineProperty(_exports, "InvalidError", {
    enumerable: true,
    get: function () {
      return _error.InvalidError;
    }
  });
  Object.defineProperty(_exports, "NotFoundError", {
    enumerable: true,
    get: function () {
      return _error.NotFoundError;
    }
  });
  Object.defineProperty(_exports, "ServerError", {
    enumerable: true,
    get: function () {
      return _error.ServerError;
    }
  });
  Object.defineProperty(_exports, "TimeoutError", {
    enumerable: true,
    get: function () {
      return _error.TimeoutError;
    }
  });
  Object.defineProperty(_exports, "UnauthorizedError", {
    enumerable: true,
    get: function () {
      return _error.UnauthorizedError;
    }
  });
  Object.defineProperty(_exports, "errorsArrayToHash", {
    enumerable: true,
    get: function () {
      return _error.errorsArrayToHash;
    }
  });
  Object.defineProperty(_exports, "errorsHashToArray", {
    enumerable: true,
    get: function () {
      return _error.errorsHashToArray;
    }
  });
});