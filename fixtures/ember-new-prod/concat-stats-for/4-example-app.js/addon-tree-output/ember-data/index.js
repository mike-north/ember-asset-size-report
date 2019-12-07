define("ember-data/index", ["exports", "@ember-data/store", "ember-data/-private", "ember-inflector", "ember-data/setup-container", "ember-data/initialize-store-service", "@ember-data/serializer/transform", "@ember-data/serializer/-private", "@ember-data/adapter", "@ember-data/adapter/json-api", "@ember-data/adapter/rest", "@ember-data/adapter/error", "@ember-data/serializer", "@ember-data/serializer/json-api", "@ember-data/serializer/json", "@ember-data/serializer/rest", "@ember-data/model"], function (_exports, _store, _private, _emberInflector, _setupContainer, _initializeStoreService, _transform, _private2, _adapter, _jsonApi, _rest, _error, _serializer, _jsonApi2, _json, _rest2, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  if (Ember.VERSION.match(/^1\.([0-9]|1[0-2])\./)) {
    throw new Ember.Error('Ember Data requires at least Ember 1.13.0, but you have ' + Ember.VERSION + '. Please upgrade your version of Ember, then upgrade Ember Data.');
  }

  _private.DS.Store = _store.default;
  _private.DS.PromiseArray = _private.PromiseArray;
  _private.DS.PromiseObject = _private.PromiseObject;
  _private.DS.PromiseManyArray = _private.PromiseManyArray;
  _private.DS.Model = _model.default;
  _private.DS.RootState = _private.RootState;
  _private.DS.attr = _model.attr;
  _private.DS.Errors = _private.Errors;
  _private.DS.InternalModel = _private.InternalModel;
  _private.DS.Snapshot = _private.Snapshot;
  _private.DS.Adapter = _adapter.default;
  _private.DS.AdapterError = _error.default;
  _private.DS.InvalidError = _error.InvalidError;
  _private.DS.TimeoutError = _error.TimeoutError;
  _private.DS.AbortError = _error.AbortError;
  _private.DS.UnauthorizedError = _error.UnauthorizedError;
  _private.DS.ForbiddenError = _error.ForbiddenError;
  _private.DS.NotFoundError = _error.NotFoundError;
  _private.DS.ConflictError = _error.ConflictError;
  _private.DS.ServerError = _error.ServerError;
  _private.DS.errorsHashToArray = _error.errorsHashToArray;
  _private.DS.errorsArrayToHash = _error.errorsArrayToHash;
  _private.DS.Serializer = _serializer.default;
  _private.DS.DebugAdapter = _private.DebugAdapter;
  _private.DS.RecordArray = _private.RecordArray;
  _private.DS.AdapterPopulatedRecordArray = _private.AdapterPopulatedRecordArray;
  _private.DS.ManyArray = _private.ManyArray;
  _private.DS.RecordArrayManager = _private.RecordArrayManager;
  _private.DS.RESTAdapter = _rest.default;
  _private.DS.BuildURLMixin = _adapter.BuildURLMixin;
  _private.DS.RESTSerializer = _rest2.default;
  _private.DS.JSONSerializer = _json.default;
  _private.DS.JSONAPIAdapter = _jsonApi.default;
  _private.DS.JSONAPISerializer = _jsonApi2.default;
  _private.DS.Transform = _transform.default;
  _private.DS.DateTransform = _private2.DateTransform;
  _private.DS.StringTransform = _private2.StringTransform;
  _private.DS.NumberTransform = _private2.NumberTransform;
  _private.DS.BooleanTransform = _private2.BooleanTransform;
  _private.DS.EmbeddedRecordsMixin = _rest2.EmbeddedRecordsMixin;
  _private.DS.belongsTo = _model.belongsTo;
  _private.DS.hasMany = _model.hasMany;
  _private.DS.Relationship = _private.Relationship;
  _private.DS._setupContainer = _setupContainer.default;
  _private.DS._initializeStoreService = _initializeStoreService.default;
  Object.defineProperty(_private.DS, 'normalizeModelName', {
    enumerable: true,
    writable: false,
    configurable: false,
    value: _store.normalizeModelName
  });
  var _default = _private.DS;
  _exports.default = _default;
});