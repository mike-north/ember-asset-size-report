define('ember-data/-private', ['exports', '@ember-data/store/-private', '@ember-data/store', 'ember-data/version', '@ember-data/model'], function (exports, Private, store, VERSION, Model) { 'use strict';

  store = store && store.hasOwnProperty('default') ? store['default'] : store;
  VERSION = VERSION && VERSION.hasOwnProperty('default') ? VERSION['default'] : VERSION;
  Model = Model && Model.hasOwnProperty('default') ? Model['default'] : Model;

  /**
   * @property VERSION
   * @public
   * @static
   * @for @ember-data
   */

  var DS = Ember.Namespace.create({
    VERSION: VERSION,
    name: 'DS'
  });

  if (Ember.libraries) {
    Ember.libraries.registerCoreLibrary('Ember Data', VERSION);
  }

  function featureIsEnabled() {
    return Ember.FEATURES.isEnabled(...arguments);
  }

  /**
    Implements `@ember/debug/data-adapter` with for EmberData
    integration with the ember-inspector.

    @class DebugAdapter
    @extends DataAdapter
    @private
  */

  var debugAdapter = Ember.DataAdapter.extend({
    /**
      Specifies how records can be filtered based on the state of the record
      Records returned will need to have a `filterValues`
      property with a key for every name in the returned array
      @public
      @method getFilters
      @return {Array} List of objects defining filters
       The object should have a `name` and `desc` property
    */
    getFilters() {
      return [{
        name: 'isNew',
        desc: 'New'
      }, {
        name: 'isModified',
        desc: 'Modified'
      }, {
        name: 'isClean',
        desc: 'Clean'
      }];
    },

    /**
      Detect whether a class is a Model
      @public
      @method detect
      @param {Model} typeClass
      @return {Boolean} Whether the typeClass is a Model class or not
    */
    detect(typeClass) {
      return typeClass !== Model && Model.detect(typeClass);
    },

    /**
      Creates a human readable string used for column headers
      @public
      @method columnNameToDesc
      @param {String} name The attribute name
      @return {String} Human readable string based on the attribute name
    */
    columnNameToDesc(name) {
      return Ember.String.capitalize(Ember.String.underscore(name).replace(/_/g, ' ').trim());
    },

    /**
      Get the columns for a given model type
      @public
      @method columnsForType
      @param {Model} typeClass
      @return {Array} An array of columns of the following format:
       name: {String} The name of the column
       desc: {String} Humanized description (what would show in a table column name)
    */
    columnsForType(typeClass) {
      var columns = [{
        name: 'id',
        desc: 'Id'
      }];
      var count = 0;
      var self = this;
      Ember.get(typeClass, 'attributes').forEach((meta, name) => {
        if (count++ > self.attributeLimit) {
          return false;
        }

        var desc = this.columnNameToDesc(name);
        columns.push({
          name: name,
          desc: desc
        });
      });
      return columns;
    },

    /**
      Fetches all loaded records for a given type
      @public
      @method getRecords
      @param {Model} modelClass of the record
      @param {String} modelName of the record
      @return {Array} An array of Model records
       This array will be observed for changes,
       so it should update when new records are added/removed
    */
    getRecords(modelClass, modelName) {
      if (arguments.length < 2) {
        // Legacy Ember.js < 1.13 support
        var containerKey = modelClass._debugContainerKey;

        if (containerKey) {
          var match = containerKey.match(/model:(.*)/);

          if (match !== null) {
            modelName = match[1];
          }
        }
      }

      ( !(!!modelName) && Ember.assert('Cannot find model name. Please upgrade to Ember.js >= 1.13 for Ember Inspector support', !!modelName));
      return this.get('store').peekAll(modelName);
    },

    /**
      Gets the values for each column
      This is the attribute values for a given record
      @public
      @method getRecordColumnValues
      @param {Model} record to get values from
      @return {Object} Keys should match column names defined by the model type
    */
    getRecordColumnValues(record) {
      var count = 0;
      var columnValues = {
        id: Ember.get(record, 'id')
      };
      record.eachAttribute(key => {
        if (count++ > this.attributeLimit) {
          return false;
        }

        columnValues[key] = Ember.get(record, key);
      });
      return columnValues;
    },

    /**
      Returns keywords to match when searching records
      @public
      @method getRecordKeywords
      @param {Model} record
      @return {Array} Relevant keywords for search based on the record's attribute values
    */
    getRecordKeywords(record) {
      var keywords = [];
      var keys = Ember.A(['id']);
      record.eachAttribute(key => keys.push(key));
      keys.forEach(key => keywords.push(Ember.get(record, key)));
      return keywords;
    },

    /**
      Returns the values of filters defined by `getFilters`
      These reflect the state of the record
      @public
      @method getRecordFilterValues
      @param {Model} record
      @return {Object} The record state filter values
    */
    getRecordFilterValues(record) {
      return {
        isNew: record.get('isNew'),
        isModified: record.get('hasDirtyAttributes') && !record.get('isNew'),
        isClean: !record.get('hasDirtyAttributes')
      };
    },

    /**
      Returns a color that represents the record's state
      @public
      @method getRecordColor
      @param {Model} record
      @return {String} The record color
        Possible options: black, blue, green
    */
    getRecordColor(record) {
      var color = 'black';

      if (record.get('isNew')) {
        color = 'green';
      } else if (record.get('hasDirtyAttributes')) {
        color = 'blue';
      }

      return color;
    },

    /**
      Observes all relevant properties and re-sends the wrapped record
      when a change occurs
      @public
      @method observerRecord
      @param {Model} record
      @param {Function} recordUpdated Callback used to notify changes
      @return {Function} The function to call to remove all observers
    */
    observeRecord(record, recordUpdated) {
      var releaseMethods = Ember.A();
      var keysToObserve = Ember.A(['id', 'isNew', 'hasDirtyAttributes']);
      record.eachAttribute(key => keysToObserve.push(key));
      var adapter = this;
      keysToObserve.forEach(function (key) {
        var handler = function () {
          recordUpdated(adapter.wrapRecord(record));
        };

        Ember.addObserver(record, key, handler);
        releaseMethods.push(function () {
          Ember.removeObserver(record, key, handler);
        });
      });

      var release = function () {
        releaseMethods.forEach(fn => fn());
      };

      return release;
    }

  });

  Object.defineProperty(exports, 'AdapterPopulatedRecordArray', {
    enumerable: true,
    get: function () {
      return Private.AdapterPopulatedRecordArray;
    }
  });
  Object.defineProperty(exports, 'Errors', {
    enumerable: true,
    get: function () {
      return Private.Errors;
    }
  });
  Object.defineProperty(exports, 'InternalModel', {
    enumerable: true,
    get: function () {
      return Private.InternalModel;
    }
  });
  Object.defineProperty(exports, 'ManyArray', {
    enumerable: true,
    get: function () {
      return Private.ManyArray;
    }
  });
  Object.defineProperty(exports, 'PromiseArray', {
    enumerable: true,
    get: function () {
      return Private.PromiseArray;
    }
  });
  Object.defineProperty(exports, 'PromiseManyArray', {
    enumerable: true,
    get: function () {
      return Private.PromiseManyArray;
    }
  });
  Object.defineProperty(exports, 'PromiseObject', {
    enumerable: true,
    get: function () {
      return Private.PromiseObject;
    }
  });
  Object.defineProperty(exports, 'RecordArray', {
    enumerable: true,
    get: function () {
      return Private.RecordArray;
    }
  });
  Object.defineProperty(exports, 'RecordArrayManager', {
    enumerable: true,
    get: function () {
      return Private.RecordArrayManager;
    }
  });
  Object.defineProperty(exports, 'RecordData', {
    enumerable: true,
    get: function () {
      return Private.RecordData;
    }
  });
  Object.defineProperty(exports, 'Relationship', {
    enumerable: true,
    get: function () {
      return Private.Relationship;
    }
  });
  Object.defineProperty(exports, 'RootState', {
    enumerable: true,
    get: function () {
      return Private.RootState;
    }
  });
  Object.defineProperty(exports, 'Snapshot', {
    enumerable: true,
    get: function () {
      return Private.Snapshot;
    }
  });
  Object.defineProperty(exports, 'SnapshotRecordArray', {
    enumerable: true,
    get: function () {
      return Private.SnapshotRecordArray;
    }
  });
  Object.defineProperty(exports, 'coerceId', {
    enumerable: true,
    get: function () {
      return Private.coerceId;
    }
  });
  Object.defineProperty(exports, 'normalizeModelName', {
    enumerable: true,
    get: function () {
      return Private.normalizeModelName;
    }
  });
  Object.defineProperty(exports, 'recordDataFor', {
    enumerable: true,
    get: function () {
      return Private.recordDataFor;
    }
  });
  Object.defineProperty(exports, 'relationshipStateFor', {
    enumerable: true,
    get: function () {
      return Private.relationshipStateFor;
    }
  });
  Object.defineProperty(exports, 'relationshipsFor', {
    enumerable: true,
    get: function () {
      return Private.relationshipsFor;
    }
  });
  exports.Store = store;
  exports.DS = DS;
  exports.DebugAdapter = debugAdapter;
  exports.isEnabled = featureIsEnabled;

  Object.defineProperty(exports, '__esModule', { value: true });

});
