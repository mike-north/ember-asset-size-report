define("@ember/-internals/extension-support/lib/data_adapter", ["exports", "@ember/-internals/owner", "@ember/runloop", "@ember/-internals/metal", "@ember/string", "@ember/-internals/runtime"], function (_exports, _owner, _runloop, _metal, _string, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/debug
  */

  /**
    The `DataAdapter` helps a data persistence library
    interface with tools that debug Ember such
    as the [Ember Inspector](https://github.com/emberjs/ember-inspector)
    for Chrome and Firefox.
  
    This class will be extended by a persistence library
    which will override some of the methods with
    library-specific code.
  
    The methods likely to be overridden are:
  
    * `getFilters`
    * `detect`
    * `columnsForType`
    * `getRecords`
    * `getRecordColumnValues`
    * `getRecordKeywords`
    * `getRecordFilterValues`
    * `getRecordColor`
    * `observeRecord`
  
    The adapter will need to be registered
    in the application's container as `dataAdapter:main`.
  
    Example:
  
    ```javascript
    Application.initializer({
      name: "data-adapter",
  
      initialize: function(application) {
        application.register('data-adapter:main', DS.DataAdapter);
      }
    });
    ```
  
    @class DataAdapter
    @extends EmberObject
    @public
  */
  var _default = _runtime.Object.extend({
    init: function init() {
      this._super.apply(this, arguments);

      this.releaseMethods = (0, _runtime.A)();
    },

    /**
      The container-debug-adapter which is used
      to list all models.
       @property containerDebugAdapter
      @default undefined
      @since 1.5.0
      @public
    **/
    containerDebugAdapter: undefined,

    /**
      The number of attributes to send
      as columns. (Enough to make the record
      identifiable).
       @private
      @property attributeLimit
      @default 3
      @since 1.3.0
    */
    attributeLimit: 3,

    /**
       Ember Data > v1.0.0-beta.18
       requires string model names to be passed
       around instead of the actual factories.
        This is a stamp for the Ember Inspector
       to differentiate between the versions
       to be able to support older versions too.
        @public
       @property acceptsModelName
     */
    acceptsModelName: true,

    /**
      Stores all methods that clear observers.
      These methods will be called on destruction.
       @private
      @property releaseMethods
      @since 1.3.0
    */
    releaseMethods: (0, _runtime.A)(),

    /**
      Specifies how records can be filtered.
      Records returned will need to have a `filterValues`
      property with a key for every name in the returned array.
       @public
      @method getFilters
      @return {Array} List of objects defining filters.
       The object should have a `name` and `desc` property.
    */
    getFilters: function getFilters() {
      return (0, _runtime.A)();
    },

    /**
      Fetch the model types and observe them for changes.
       @public
      @method watchModelTypes
       @param {Function} typesAdded Callback to call to add types.
      Takes an array of objects containing wrapped types (returned from `wrapModelType`).
       @param {Function} typesUpdated Callback to call when a type has changed.
      Takes an array of objects containing wrapped types.
       @return {Function} Method to call to remove all observers
    */
    watchModelTypes: function watchModelTypes(typesAdded, typesUpdated) {
      var _this = this;

      var modelTypes = this.getModelTypes();
      var releaseMethods = (0, _runtime.A)();
      var typesToSend;
      typesToSend = modelTypes.map(function (type) {
        var klass = type.klass;

        var wrapped = _this.wrapModelType(klass, type.name);

        releaseMethods.push(_this.observeModelType(type.name, typesUpdated));
        return wrapped;
      });
      typesAdded(typesToSend);

      var release = function release() {
        releaseMethods.forEach(function (fn) {
          return fn();
        });

        _this.releaseMethods.removeObject(release);
      };

      this.releaseMethods.pushObject(release);
      return release;
    },
    _nameToClass: function _nameToClass(type) {
      if (typeof type === 'string') {
        var owner = (0, _owner.getOwner)(this);
        var Factory = owner.factoryFor("model:" + type);
        type = Factory && Factory.class;
      }

      return type;
    },

    /**
      Fetch the records of a given type and observe them for changes.
       @public
      @method watchRecords
       @param {String} modelName The model name.
       @param {Function} recordsAdded Callback to call to add records.
      Takes an array of objects containing wrapped records.
      The object should have the following properties:
        columnValues: {Object} The key and value of a table cell.
        object: {Object} The actual record object.
       @param {Function} recordsUpdated Callback to call when a record has changed.
      Takes an array of objects containing wrapped records.
       @param {Function} recordsRemoved Callback to call when a record has removed.
      Takes the following parameters:
        index: The array index where the records were removed.
        count: The number of records removed.
       @return {Function} Method to call to remove all observers.
    */
    watchRecords: function watchRecords(modelName, recordsAdded, recordsUpdated, recordsRemoved) {
      var _this2 = this;

      var releaseMethods = (0, _runtime.A)();

      var klass = this._nameToClass(modelName);

      var records = this.getRecords(klass, modelName);

      var _release;

      function recordUpdated(updatedRecord) {
        recordsUpdated([updatedRecord]);
      }

      var recordsToSend = records.map(function (record) {
        releaseMethods.push(_this2.observeRecord(record, recordUpdated));
        return _this2.wrapRecord(record);
      });

      var contentDidChange = function contentDidChange(array, idx, removedCount, addedCount) {
        for (var i = idx; i < idx + addedCount; i++) {
          var record = (0, _metal.objectAt)(array, i);

          var wrapped = _this2.wrapRecord(record);

          releaseMethods.push(_this2.observeRecord(record, recordUpdated));
          recordsAdded([wrapped]);
        }

        if (removedCount) {
          recordsRemoved(idx, removedCount);
        }
      };

      var observer = {
        didChange: contentDidChange,
        willChange: function willChange() {
          return this;
        }
      };
      (0, _metal.addArrayObserver)(records, this, observer);

      _release = function release() {
        releaseMethods.forEach(function (fn) {
          return fn();
        });
        (0, _metal.removeArrayObserver)(records, _this2, observer);

        _this2.releaseMethods.removeObject(_release);
      };

      recordsAdded(recordsToSend);
      this.releaseMethods.pushObject(_release);
      return _release;
    },

    /**
      Clear all observers before destruction
      @private
      @method willDestroy
    */
    willDestroy: function willDestroy() {
      this._super.apply(this, arguments);

      this.releaseMethods.forEach(function (fn) {
        return fn();
      });
    },

    /**
      Detect whether a class is a model.
       Test that against the model class
      of your persistence library.
       @public
      @method detect
      @return boolean Whether the class is a model class or not.
    */
    detect: function detect() {
      return false;
    },

    /**
      Get the columns for a given model type.
       @public
      @method columnsForType
      @return {Array} An array of columns of the following format:
       name: {String} The name of the column.
       desc: {String} Humanized description (what would show in a table column name).
    */
    columnsForType: function columnsForType() {
      return (0, _runtime.A)();
    },

    /**
      Adds observers to a model type class.
       @private
      @method observeModelType
      @param {String} modelName The model type name.
      @param {Function} typesUpdated Called when a type is modified.
      @return {Function} The function to call to remove observers.
    */
    observeModelType: function observeModelType(modelName, typesUpdated) {
      var _this3 = this;

      var klass = this._nameToClass(modelName);

      var records = this.getRecords(klass, modelName);

      function onChange() {
        typesUpdated([this.wrapModelType(klass, modelName)]);
      }

      var observer = {
        didChange: function didChange(array, idx, removedCount, addedCount) {
          // Only re-fetch records if the record count changed
          // (which is all we care about as far as model types are concerned).
          if (removedCount > 0 || addedCount > 0) {
            (0, _runloop.scheduleOnce)('actions', this, onChange);
          }
        },
        willChange: function willChange() {
          return this;
        }
      };
      (0, _metal.addArrayObserver)(records, this, observer);

      var release = function release() {
        return (0, _metal.removeArrayObserver)(records, _this3, observer);
      };

      return release;
    },

    /**
      Wraps a given model type and observes changes to it.
       @private
      @method wrapModelType
      @param {Class} klass A model class.
      @param {String} modelName Name of the class.
      @return {Object} Contains the wrapped type and the function to remove observers
      Format:
        type: {Object} The wrapped type.
          The wrapped type has the following format:
            name: {String} The name of the type.
            count: {Integer} The number of records available.
            columns: {Columns} An array of columns to describe the record.
            object: {Class} The actual Model type class.
        release: {Function} The function to remove observers.
    */
    wrapModelType: function wrapModelType(klass, name) {
      var records = this.getRecords(klass, name);
      var typeToSend;
      typeToSend = {
        name: name,
        count: (0, _metal.get)(records, 'length'),
        columns: this.columnsForType(klass),
        object: klass
      };
      return typeToSend;
    },

    /**
      Fetches all models defined in the application.
       @private
      @method getModelTypes
      @return {Array} Array of model types.
    */
    getModelTypes: function getModelTypes() {
      var _this4 = this;

      var containerDebugAdapter = this.get('containerDebugAdapter');
      var types;

      if (containerDebugAdapter.canCatalogEntriesByType('model')) {
        types = containerDebugAdapter.catalogEntriesByType('model');
      } else {
        types = this._getObjectsOnNamespaces();
      } // New adapters return strings instead of classes.


      types = (0, _runtime.A)(types).map(function (name) {
        return {
          klass: _this4._nameToClass(name),
          name: name
        };
      });
      types = (0, _runtime.A)(types).filter(function (type) {
        return _this4.detect(type.klass);
      });
      return (0, _runtime.A)(types);
    },

    /**
      Loops over all namespaces and all objects
      attached to them.
       @private
      @method _getObjectsOnNamespaces
      @return {Array} Array of model type strings.
    */
    _getObjectsOnNamespaces: function _getObjectsOnNamespaces() {
      var _this5 = this;

      var namespaces = (0, _runtime.A)(_runtime.Namespace.NAMESPACES);
      var types = (0, _runtime.A)();
      namespaces.forEach(function (namespace) {
        for (var key in namespace) {
          if (!namespace.hasOwnProperty(key)) {
            continue;
          } // Even though we will filter again in `getModelTypes`,
          // we should not call `lookupFactory` on non-models


          if (!_this5.detect(namespace[key])) {
            continue;
          }

          var name = (0, _string.dasherize)(key);
          types.push(name);
        }
      });
      return types;
    },

    /**
      Fetches all loaded records for a given type.
       @public
      @method getRecords
      @return {Array} An array of records.
       This array will be observed for changes,
       so it should update when new records are added/removed.
    */
    getRecords: function getRecords() {
      return (0, _runtime.A)();
    },

    /**
      Wraps a record and observers changes to it.
       @private
      @method wrapRecord
      @param {Object} record The record instance.
      @return {Object} The wrapped record. Format:
      columnValues: {Array}
      searchKeywords: {Array}
    */
    wrapRecord: function wrapRecord(record) {
      var recordToSend = {
        object: record
      };
      recordToSend.columnValues = this.getRecordColumnValues(record);
      recordToSend.searchKeywords = this.getRecordKeywords(record);
      recordToSend.filterValues = this.getRecordFilterValues(record);
      recordToSend.color = this.getRecordColor(record);
      return recordToSend;
    },

    /**
      Gets the values for each column.
       @public
      @method getRecordColumnValues
      @return {Object} Keys should match column names defined
      by the model type.
    */
    getRecordColumnValues: function getRecordColumnValues() {
      return {};
    },

    /**
      Returns keywords to match when searching records.
       @public
      @method getRecordKeywords
      @return {Array} Relevant keywords for search.
    */
    getRecordKeywords: function getRecordKeywords() {
      return (0, _runtime.A)();
    },

    /**
      Returns the values of filters defined by `getFilters`.
       @public
      @method getRecordFilterValues
      @param {Object} record The record instance.
      @return {Object} The filter values.
    */
    getRecordFilterValues: function getRecordFilterValues() {
      return {};
    },

    /**
      Each record can have a color that represents its state.
       @public
      @method getRecordColor
      @param {Object} record The record instance
      @return {String} The records color.
        Possible options: black, red, blue, green.
    */
    getRecordColor: function getRecordColor() {
      return null;
    },

    /**
      Observes all relevant properties and re-sends the wrapped record
      when a change occurs.
       @public
      @method observerRecord
      @return {Function} The function to call to remove all observers.
    */
    observeRecord: function observeRecord() {
      return function () {};
    }
  });

  _exports.default = _default;
});