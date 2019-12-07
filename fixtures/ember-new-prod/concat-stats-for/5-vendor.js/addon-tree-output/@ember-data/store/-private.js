define('@ember-data/store/-private', ['exports', 'ember-inflector', '@ember-data/canary-features', '@ember/ordered-set', '@ember-data/adapter/error', 'require'], function (exports, emberInflector, canaryFeatures, EmberOrderedSet, error, require) { 'use strict';

  EmberOrderedSet = EmberOrderedSet && EmberOrderedSet.hasOwnProperty('default') ? EmberOrderedSet['default'] : EmberOrderedSet;
  var require__default = 'default' in require ? require['default'] : require;

  /**
    @module @ember-data/store
  */

  var DeprecatedEvented =  Ember.Evented;

  /**
    @module @ember-data/store
  */

  /*
    A `PromiseArray` is an object that acts like both an `Ember.Array`
    and a promise. When the promise is resolved the resulting value
    will be set to the `PromiseArray`'s `content` property. This makes
    it easy to create data bindings with the `PromiseArray` that will be
    updated when the promise resolves.

    For more information see the [Ember.PromiseProxyMixin
    documentation](/api/classes/Ember.PromiseProxyMixin.html).

    Example

    ```javascript
    let promiseArray = PromiseArray.create({
      promise: $.getJSON('/some/remote/data.json')
    });

    promiseArray.get('length'); // 0

    promiseArray.then(function() {
      promiseArray.get('length'); // 100
    });
    ```

    @class PromiseArray
    @extends Ember.ArrayProxy
    @uses Ember.PromiseProxyMixin
  */
  var PromiseArray = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin, {
    meta: Ember.computed.reads('content.meta')
  });
  /*
    A `PromiseObject` is an object that acts like both an `EmberObject`
    and a promise. When the promise is resolved, then the resulting value
    will be set to the `PromiseObject`'s `content` property. This makes
    it easy to create data bindings with the `PromiseObject` that will
    be updated when the promise resolves.

    For more information see the [Ember.PromiseProxyMixin
    documentation](/api/classes/Ember.PromiseProxyMixin.html).

    Example

    ```javascript
    let promiseObject = PromiseObject.create({
      promise: $.getJSON('/some/remote/data.json')
    });

    promiseObject.get('name'); // null

    promiseObject.then(function() {
      promiseObject.get('name'); // 'Tomster'
    });
    ```

    @class PromiseObject
    @extends Ember.ObjectProxy
    @uses Ember.PromiseProxyMixin
  */

  var PromiseObject = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);
  function promiseObject(promise, label) {
    return PromiseObject.create({
      promise: Ember.RSVP.Promise.resolve(promise, label)
    });
  }
  function promiseArray(promise, label) {
    return PromiseArray.create({
      promise: Ember.RSVP.Promise.resolve(promise, label)
    });
  }
  var PromiseBelongsTo = PromiseObject.extend({
    // we don't proxy meta because we would need to proxy it to the relationship state container
    //  however, meta on relationships does not trigger change notifications.
    //  if you need relationship meta, you should do `record.belongsTo(relationshipName).meta()`
    meta: Ember.computed(function () {
    }),
    reload: function reload(options) {
      var _this = this;
      var _this$_belongsToState = this._belongsToState,
          key = _this$_belongsToState.key,
          store = _this$_belongsToState.store,
          originatingInternalModel = _this$_belongsToState.originatingInternalModel;
      return store.reloadBelongsTo(this, originatingInternalModel, key, options).then(function () {
        return _this;
      });
    }
  });
  function proxyToContent(method) {
    return function () {
      var _EmberGet;

      return (_EmberGet = Ember.get(this, 'content'))[method].apply(_EmberGet, arguments);
    };
  }
  /*
    A PromiseManyArray is a PromiseArray that also proxies certain method calls
    to the underlying manyArray.
    Right now we proxy:

      * `reload()`
      * `createRecord()`
      * `on()`
      * `one()`
      * `trigger()`
      * `off()`
      * `has()`

    @class PromiseManyArray
    @extends Ember.ArrayProxy
  */

  var PromiseManyArray = PromiseArray.extend({
    reload: function reload(options) {
      this.set('promise', this.get('content').reload(options));
      return this;
    },
    createRecord: proxyToContent('createRecord'),
    on: proxyToContent('on'),
    one: proxyToContent('one'),
    trigger: proxyToContent('trigger'),
    off: proxyToContent('off'),
    has: proxyToContent('has')
  });

  /**
    @module @ember-data/store
  */
  var SOURCE_POINTER_REGEXP = /^\/?data\/(attributes|relationships)\/(.*)/;
  var SOURCE_POINTER_PRIMARY_REGEXP = /^\/?data/;
  var PRIMARY_ATTRIBUTE_KEY = 'base';
  /**
    Convert an hash of errors into an array with errors in JSON-API format.
     ```javascript
    import DS from 'ember-data';
     const { errorsHashToArray } = DS;
     let errors = {
      base: 'Invalid attributes on saving this record',
      name: 'Must be present',
      age: ['Must be present', 'Must be a number']
    };
     let errorsArray = errorsHashToArray(errors);
    // [
    //   {
    //     title: "Invalid Document",
    //     detail: "Invalid attributes on saving this record",
    //     source: { pointer: "/data" }
    //   },
    //   {
    //     title: "Invalid Attribute",
    //     detail: "Must be present",
    //     source: { pointer: "/data/attributes/name" }
    //   },
    //   {
    //     title: "Invalid Attribute",
    //     detail: "Must be present",
    //     source: { pointer: "/data/attributes/age" }
    //   },
    //   {
    //     title: "Invalid Attribute",
    //     detail: "Must be a number",
    //     source: { pointer: "/data/attributes/age" }
    //   }
    // ]
    ```
    @method errorsHashToArray
    @public
    @param {Object} errors hash with errors as properties
    @return {Array} array of errors in JSON-API format
  */

  function errorsHashToArray(errors) {
    var out = [];

    if (Ember.isPresent(errors)) {
      Object.keys(errors).forEach(function (key) {
        var messages = Ember.makeArray(errors[key]);

        for (var i = 0; i < messages.length; i++) {
          var title = 'Invalid Attribute';
          var pointer = "/data/attributes/" + key;

          if (key === PRIMARY_ATTRIBUTE_KEY) {
            title = 'Invalid Document';
            pointer = "/data";
          }

          out.push({
            title: title,
            detail: messages[i],
            source: {
              pointer: pointer
            }
          });
        }
      });
    }

    return out;
  }
  /**
    Convert an array of errors in JSON-API format into an object.

    ```javascript
    import DS from 'ember-data';

    const { errorsArrayToHash } = DS;

    let errorsArray = [
      {
        title: 'Invalid Attribute',
        detail: 'Must be present',
        source: { pointer: '/data/attributes/name' }
      },
      {
        title: 'Invalid Attribute',
        detail: 'Must be present',
        source: { pointer: '/data/attributes/age' }
      },
      {
        title: 'Invalid Attribute',
        detail: 'Must be a number',
        source: { pointer: '/data/attributes/age' }
      }
    ];

    let errors = errorsArrayToHash(errorsArray);
    // {
    //   "name": ["Must be present"],
    //   "age":  ["Must be present", "must be a number"]
    // }
    ```

    @method errorsArrayToHash
    @public
    @param {Array} errors array of errors in JSON-API format
    @return {Object}
  */

  function errorsArrayToHash(errors) {
    var out = {};

    if (Ember.isPresent(errors)) {
      errors.forEach(function (error) {
        if (error.source && error.source.pointer) {
          var key = error.source.pointer.match(SOURCE_POINTER_REGEXP);

          if (key) {
            key = key[2];
          } else if (error.source.pointer.search(SOURCE_POINTER_PRIMARY_REGEXP) !== -1) {
            key = PRIMARY_ATTRIBUTE_KEY;
          }

          if (key) {
            out[key] = out[key] || [];
            out[key].push(error.detail || error.title);
          }
        }
      });
    }

    return out;
  }

  /**
    @module @ember-data/store
  */

  /**
    Holds validation errors for a given record, organized by attribute names.

    Every `Model` has an `errors` property that is an instance of
    `Errors`. This can be used to display validation error
    messages returned from the server when a `record.save()` rejects.

    For Example, if you had a `User` model that looked like this:

    ```app/models/user.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      username: attr('string'),
      email: attr('string')
    });
    ```
    And you attempted to save a record that did not validate on the backend:

    ```javascript
    let user = store.createRecord('user', {
      username: 'tomster',
      email: 'invalidEmail'
    });
    user.save();
    ```

    Your backend would be expected to return an error response that described
    the problem, so that error messages can be generated on the app.

    API responses will be translated into instances of `Errors` differently,
    depending on the specific combination of adapter and serializer used. You
    may want to check the documentation or the source code of the libraries
    that you are using, to know how they expect errors to be communicated.

    Errors can be displayed to the user by accessing their property name
    to get an array of all the error objects for that property. Each
    error object is a JavaScript object with two keys:

    - `message` A string containing the error message from the backend
    - `attribute` The name of the property associated with this error message

    ```handlebars
    <label>Username: {{input value=username}} </label>
    {{#each model.errors.username as |error|}}
      <div class="error">
        {{error.message}}
      </div>
    {{/each}}

    <label>Email: {{input value=email}} </label>
    {{#each model.errors.email as |error|}}
      <div class="error">
        {{error.message}}
      </div>
    {{/each}}
    ```

    You can also access the special `messages` property on the error
    object to get an array of all the error strings.

    ```handlebars
    {{#each model.errors.messages as |message|}}
      <div class="error">
        {{message}}
      </div>
    {{/each}}
    ```

    @class Errors
    @extends Ember.ArrayProxy
    @uses Ember.Evented
   */
  var Errors = Ember.ArrayProxy.extend(DeprecatedEvented, {
    /**
      Register with target handler
       @method _registerHandlers
      @private
    */
    _registerHandlers: function _registerHandlers(becameInvalid, becameValid) {
      this._registeredHandlers = {
        becameInvalid: becameInvalid,
        becameValid: becameValid
      };
    },

    /**
      @property errorsByAttributeName
      @type {MapWithDefault}
      @private
    */
    errorsByAttributeName: Ember.computed(function () {
      return new Map();
    }),

    /**
      Returns errors for a given attribute
       ```javascript
      let user = store.createRecord('user', {
        username: 'tomster',
        email: 'invalidEmail'
      });
      user.save().catch(function(){
        user.get('errors').errorsFor('email'); // returns:
        // [{attribute: "email", message: "Doesn't look like a valid email."}]
      });
      ```
       @method errorsFor
      @param {String} attribute
      @return {Array}
    */
    errorsFor: function errorsFor(attribute) {
      var map = Ember.get(this, 'errorsByAttributeName');

      if (!map.has(attribute)) {
        map.set(attribute, Ember.A());
      }

      return map.get(attribute);
    },

    /**
      An array containing all of the error messages for this
      record. This is useful for displaying all errors to the user.
       ```handlebars
      {{#each model.errors.messages as |message|}}
        <div class="error">
          {{message}}
        </div>
      {{/each}}
      ```
       @property messages
      @type {Array}
    */
    messages: Ember.computed.mapBy('content', 'message'),

    /**
      @property content
      @type {Array}
      @private
    */
    content: Ember.computed(function () {
      return Ember.A();
    }),

    /**
      @method unknownProperty
      @private
    */
    unknownProperty: function unknownProperty(attribute) {
      var errors = this.errorsFor(attribute);

      if (errors.length === 0) {
        return undefined;
      }

      return errors;
    },

    /**
      Total number of errors.
       @property length
      @type {Number}
      @readOnly
    */

    /**
      @property isEmpty
      @type {Boolean}
      @readOnly
    */
    isEmpty: Ember.computed.not('length').readOnly(),

    /**
     Manually adds errors to the record. This will triger the `becameInvalid` event/ lifecycle method on
      the record and transition the record into an `invalid` state.
      Example
     ```javascript
      let errors = get(user, 'errors');
       // add multiple errors
      errors.add('password', [
        'Must be at least 12 characters',
        'Must contain at least one symbol',
        'Cannot contain your name'
      ]);
       errors.errorsFor('password');
      // =>
      // [
      //   { attribute: 'password', message: 'Must be at least 12 characters' },
      //   { attribute: 'password', message: 'Must contain at least one symbol' },
      //   { attribute: 'password', message: 'Cannot contain your name' },
      // ]
       // add a single error
      errors.add('username', 'This field is required');
       errors.errorsFor('password');
      // =>
      // [
      //   { attribute: 'username', message: 'This field is required' },
      // ]
     ```
    @method add
    @param {string} attribute - the property name of an attribute or relationship
    @param {string[]|string} messages - an error message or array of error messages for the attribute
     */
    add: function add(attribute, messages) {
      var wasEmpty = Ember.get(this, 'isEmpty');

      this._add(attribute, messages);

      if (wasEmpty && !Ember.get(this, 'isEmpty')) {
        this._registeredHandlers && this._registeredHandlers.becameInvalid();
      }
    },

    /**
      Adds error messages to a given attribute without sending event.
       @method _add
      @private
    */
    _add: function _add(attribute, messages) {
      messages = this._findOrCreateMessages(attribute, messages);
      this.addObjects(messages);
      this.errorsFor(attribute).addObjects(messages);
      this.notifyPropertyChange(attribute);
    },

    /**
      @method _findOrCreateMessages
      @private
    */
    _findOrCreateMessages: function _findOrCreateMessages(attribute, messages) {
      var errors = this.errorsFor(attribute);
      var messagesArray = Ember.makeArray(messages);

      var _messages = new Array(messagesArray.length);

      for (var i = 0; i < messagesArray.length; i++) {
        var message = messagesArray[i];
        var err = errors.findBy('message', message);

        if (err) {
          _messages[i] = err;
        } else {
          _messages[i] = {
            attribute: attribute,
            message: message
          };
        }
      }

      return _messages;
    },

    /**
     Manually removes all errors for a given member from the record.
       This will transition the record into a `valid` state, and
      triggers the `becameValid` event and lifecycle method.
      Example:
      ```javascript
      let errors = get('user', errors);
      errors.add('phone', ['error-1', 'error-2']);
       errors.errorsFor('phone');
      // =>
      // [
      //   { attribute: 'phone', message: 'error-1' },
      //   { attribute: 'phone', message: 'error-2' },
      // ]
       errors.remove('phone');
       errors.errorsFor('phone');
      // => undefined
     ```
     @method remove
     @param {string} member - the property name of an attribute or relationship
     */
    remove: function remove(attribute) {
      if (Ember.get(this, 'isEmpty')) {
        return;
      }

      this._remove(attribute);

      if (Ember.get(this, 'isEmpty')) {
        this._registeredHandlers && this._registeredHandlers.becameValid();
      }
    },

    /**
      Removes all error messages from the given attribute without sending event.
       @method _remove
      @private
    */
    _remove: function _remove(attribute) {
      if (Ember.get(this, 'isEmpty')) {
        return;
      }

      var content = this.rejectBy('attribute', attribute);
      Ember.get(this, 'content').setObjects(content);
      Ember.get(this, 'errorsByAttributeName').delete(attribute);
      this.notifyPropertyChange(attribute);
      this.notifyPropertyChange('length');
    },

    /**
     Manually clears all errors for the record.
       This will transition the record into a `valid` state, and
       will trigger the `becameValid` event and lifecycle method.
     Example:
      ```javascript
     let errors = get('user', errors);
     errors.add('username', ['error-a']);
     errors.add('phone', ['error-1', 'error-2']);
      errors.errorsFor('username');
     // =>
     // [
     //   { attribute: 'username', message: 'error-a' },
     // ]
      errors.errorsFor('phone');
     // =>
     // [
     //   { attribute: 'phone', message: 'error-1' },
     //   { attribute: 'phone', message: 'error-2' },
     // ]
      errors.clear();
      errors.errorsFor('username');
     // => undefined
      errors.errorsFor('phone');
     // => undefined
      errors.get('messages')
     // => []
     ```
     @method remove
     */
    clear: function clear() {
      if (Ember.get(this, 'isEmpty')) {
        return;
      }

      this._clear();

      this._registeredHandlers && this._registeredHandlers.becameValid();
    },

    /**
      Removes all error messages.
      to the record.
       @method _clear
      @private
    */
    _clear: function _clear() {
      var _this = this;

      if (Ember.get(this, 'isEmpty')) {
        return;
      }

      var errorsByAttributeName = Ember.get(this, 'errorsByAttributeName');
      var attributes = [];
      errorsByAttributeName.forEach(function (_, attribute) {
        attributes.push(attribute);
      });
      errorsByAttributeName.clear();
      attributes.forEach(function (attribute) {
        _this.notifyPropertyChange(attribute);
      });
      Ember.ArrayProxy.prototype.clear.call(this);
    },

    /**
      Checks if there are error messages for the given attribute.
       ```app/routes/user/edit.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        actions: {
          save: function(user) {
            if (user.get('errors').has('email')) {
              return alert('Please update your email before attempting to save.');
            }
            user.save();
          }
        }
      });
      ```
       @method has
      @param {String} attribute
      @return {Boolean} true if there some errors on given attribute
    */
    has: function has(attribute) {
      return this.errorsFor(attribute).length > 0;
    }
  });

  /**
    @module @ember-data/store
  */
  // All modelNames are dasherized internally. Changing this function may
  // require changes to other normalization hooks (such as typeForRoot).

  /**
   This method normalizes a modelName into the format Ember Data uses
   internally.

    @method normalizeModelName
    @public
    @param {String} modelName
    @return {String} normalizedModelName
  */
  function normalizeModelName(modelName) {
    return Ember.String.dasherize(modelName);
  }

  /**
    @module @ember-data/store
  */

  /**
   * This symbol provides a Symbol replacement for browsers that do not have it
   * (eg. IE 11).
   *
   * The replacement is different from the native Symbol in some ways. It is a
   * function that produces an output:
   * - iterable;
   * - that is a string, not a symbol.
   *
   * @internal
   */
  var symbol = typeof Symbol !== 'undefined' ? Symbol : function (key) {
    return "__" + key + Math.floor(Math.random() * Date.now()) + "__";
  };

  /**
    @module @ember-data/store
  */

  /**
   * Use this brand to assign a string key to an interface
   * for mapping the interface to a tightly coupled internal
   * class implementation.
   *
   * This allows us to expose the interface publicly but
   * seamlessly upgrade these interfaces for our own use
   * internally when internal methods and properties are
   * needed.
   *
   * @internal
   */

  var BRAND_SYMBOL = symbol('DEBUG-ts-brand');

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  /**
    @module @ember-data/store
  */
  function typeForRelationshipMeta(meta) {
    var modelName;
    modelName = meta.type || meta.key;
    modelName = normalizeModelName(modelName);

    if (meta.kind === 'hasMany') {
      modelName = emberInflector.singularize(modelName);
    }

    return modelName;
  }

  function shouldFindInverse(relationshipMeta) {
    var options = relationshipMeta.options;
    return !(options && options.inverse === null);
  }

  var RelationshipDefinition =
  /*#__PURE__*/
  function () {
    function RelationshipDefinition(meta) {
      this.meta = meta;
      this[BRAND_SYMBOL] = void 0;
      this._type = '';
      this.__inverseKey = '';
      this.__inverseIsAsync = true;
      this.__hasCalculatedInverse = false;
      this.parentModelName = void 0;
      this.inverse = void 0;
      this.inverseIsAsync = void 0;
      this.parentModelName = meta.parentModelName;
    }

    var _proto = RelationshipDefinition.prototype;

    _proto._inverseKey = function _inverseKey(store, modelClass) {
      if (this.__hasCalculatedInverse === false) {
        this._calculateInverse(store, modelClass);
      }

      return this.__inverseKey;
    };

    _proto._inverseIsAsync = function _inverseIsAsync(store, modelClass) {
      if (this.__hasCalculatedInverse === false) {
        this._calculateInverse(store, modelClass);
      }

      return this.__inverseIsAsync;
    };

    _proto._calculateInverse = function _calculateInverse(store, modelClass) {
      this.__hasCalculatedInverse = true;
      var inverseKey, inverseIsAsync;
      var inverse = null;

      if (shouldFindInverse(this.meta)) {
        inverse = modelClass.inverseFor(this.key, store);
      }

      if (inverse) {
        inverseKey = inverse.name;
        inverseIsAsync = isInverseAsync(inverse);
      } else {
        inverseKey = null;
        inverseIsAsync = false;
      }

      this.__inverseKey = inverseKey;
      this.__inverseIsAsync = inverseIsAsync;
    };

    _createClass(RelationshipDefinition, [{
      key: "key",
      get: function get() {
        return this.meta.key;
      }
    }, {
      key: "kind",
      get: function get() {
        return this.meta.kind;
      }
    }, {
      key: "type",
      get: function get() {
        if (this._type) {
          return this._type;
        }

        this._type = typeForRelationshipMeta(this.meta);
        return this._type;
      }
    }, {
      key: "options",
      get: function get() {
        return this.meta.options;
      }
    }, {
      key: "name",
      get: function get() {
        return this.meta.name;
      }
    }]);

    return RelationshipDefinition;
  }();

  function isInverseAsync(meta) {
    var inverseAsync = meta.options && meta.options.async;
    return typeof inverseAsync === 'undefined' ? true : inverseAsync;
  }

  function relationshipFromMeta(meta) {
    return new RelationshipDefinition(meta);
  }

  /**
    @module @ember-data/store
  */

  var relationshipsDescriptor = Ember.computed(function () {
    var map = new Map();
    var relationshipsByName = Ember.get(this, 'relationshipsByName'); // Loop through each computed property on the class

    relationshipsByName.forEach(function (desc) {
      var type = desc.type;

      if (!map.has(type)) {
        map.set(type, []);
      }

      map.get(type).push(desc);
    });
    return map;
  }).readOnly();
  var relatedTypesDescriptor = Ember.computed(function () {

    var parentModelName = this.modelName;
    var types = Ember.A(); // Loop through each computed property on the class,
    // and create an array of the unique types involved
    // in relationships

    this.eachComputedProperty(function (name, meta) {
      if (meta.isRelationship) {
        meta.key = name;
        var modelName = typeForRelationshipMeta(meta);

        if (!types.includes(modelName)) {
          types.push(modelName);
        }
      }
    });
    return types;
  }).readOnly();
  var relationshipsObjectDescriptor = Ember.computed(function () {
    var relationships = Object.create(null);
    var modelName = this.modelName;
    this.eachComputedProperty(function (name, meta) {
      if (meta.isRelationship) {
        meta.key = name;
        meta.name = name;
        meta.parentModelName = modelName;
        relationships[name] = relationshipFromMeta(meta);
      }
    });
    return relationships;
  });
  var relationshipsByNameDescriptor = Ember.computed(function () {
    var map = new Map();
    var rels = Ember.get(this, 'relationshipsObject');
    var relationships = Object.keys(rels);

    for (var i = 0; i < relationships.length; i++) {
      var key = relationships[i];
      var value = rels[key];
      map.set(value.key, value);
    }

    return map;
  }).readOnly();

  /**
    @module @ember-data/store
  */

  /*
   * Returns the RecordData instance associated with a given
   * Model or InternalModel.
   *
   * Intentionally "loose" to allow anything with an _internalModel
   * property until InternalModel is eliminated.
   *
   * Intentionally not typed to `InternalModel` due to circular dependency
   *  which that creates.
   *
   * Overtime, this should shift to a "weakmap" based lookup in the
   *  "Ember.getOwner(obj)" style.
   */
  function recordDataFor(instance) {
    var internalModel = instance._internalModel || instance.internalModel || instance;
    return internalModel._recordData || null;
  }
  function relationshipsFor(instance) {
    var recordData = recordDataFor(instance) || instance;
    return recordData._relationships;
  }
  function relationshipStateFor(instance, propertyName) {
    return relationshipsFor(instance).get(propertyName);
  }
  function implicitRelationshipsFor(instance) {
    var recordData = recordDataFor(instance) || instance;
    return recordData.__implicitRelationships;
  }
  function implicitRelationshipStateFor(instance, propertyName) {
    return implicitRelationshipsFor(instance)[propertyName];
  }

  /**
    @module @ember-data/store
  */
  /*
    This file encapsulates the various states that a record can transition
    through during its lifecycle.
  */

  /**
    ### State

    Each record has a `currentState` property that explicitly tracks what
    state a record is in at any given time. For instance, if a record is
    newly created and has not yet been sent to the adapter to be saved,
    it would be in the `root.loaded.created.uncommitted` state.  If a
    record has had local modifications made to it that are in the
    process of being saved, the record would be in the
    `root.loaded.updated.inFlight` state. (This state path will be
    explained in more detail below.)

    Events are sent by the record or its store to the record's
    `currentState` property. How the state reacts to these events is
    dependent on which state it is in. In some states, certain events
    will be invalid and will cause an exception to be raised.

    States are hierarchical and every state is a sub-state of the
    `RootState`. For example, a record can be in the
    `root.deleted.uncommitted` state then transitions into the
    `root.deleted.inFlight` state. If a child state does not implement
    an event handler, the state manager will attempt to invoke the event
    on all parent states until the root state is reached. The state
    hierarchy of a record is described in terms of a path string. You
    can determine a record's current state by getting the state's
    `stateName` property:

    ```javascript
    record.get('currentState.stateName');
    //=> "root.created.uncommitted"
     ```

    The hierarchy of valid states that ship with ember data looks like
    this:

    ```text
    * root
      * deleted
        * saved
        * uncommitted
        * inFlight
      * empty
      * loaded
        * created
          * uncommitted
          * inFlight
        * saved
        * updated
          * uncommitted
          * inFlight
      * loading
    ```

    The `Model` states are themselves stateless. What that means is
    that, the hierarchical states that each of *those* points to is a
    shared data structure. For performance reasons, instead of each
    record getting its own copy of the hierarchy of states, each record
    points to this global, immutable shared instance. How does a state
    know which record it should be acting on? We pass the record
    instance into the state's event handlers as the first argument.

    The record passed as the first parameter is where you should stash
    state about the record if needed; you should never store data on the state
    object itself.

    ### Events and Flags

    A state may implement zero or more events and flags.

    #### Events

    Events are named functions that are invoked when sent to a record. The
    record will first look for a method with the given name on the
    current state. If no method is found, it will search the current
    state's parent, and then its grandparent, and so on until reaching
    the top of the hierarchy. If the root is reached without an event
    handler being found, an exception will be raised. This can be very
    helpful when debugging new features.

    Here's an example implementation of a state with a `myEvent` event handler:

    ```javascript
    aState: State.create({
      myEvent: function(manager, param) {
        console.log("Received myEvent with", param);
      }
    })
    ```

    To trigger this event:

    ```javascript
    record.send('myEvent', 'foo');
    //=> "Received myEvent with foo"
    ```

    Note that an optional parameter can be sent to a record's `send()` method,
    which will be passed as the second parameter to the event handler.

    Events should transition to a different state if appropriate. This can be
    done by calling the record's `transitionTo()` method with a path to the
    desired state. The state manager will attempt to resolve the state path
    relative to the current state. If no state is found at that path, it will
    attempt to resolve it relative to the current state's parent, and then its
    parent, and so on until the root is reached. For example, imagine a hierarchy
    like this:

        * created
          * uncommitted <-- currentState
          * inFlight
        * updated
          * inFlight

    If we are currently in the `uncommitted` state, calling
    `transitionTo('inFlight')` would transition to the `created.inFlight` state,
    while calling `transitionTo('updated.inFlight')` would transition to
    the `updated.inFlight` state.

    Remember that *only events* should ever cause a state transition. You should
    never call `transitionTo()` from outside a state's event handler. If you are
    tempted to do so, create a new event and send that to the state manager.

    #### Flags

    Flags are Boolean values that can be used to introspect a record's current
    state in a more user-friendly way than examining its state path. For example,
    instead of doing this:

    ```javascript
    var statePath = record.get('stateManager.currentPath');
    if (statePath === 'created.inFlight') {
      doSomething();
    }
    ```

    You can say:

    ```javascript
    if (record.get('isNew') && record.get('isSaving')) {
      doSomething();
    }
    ```

    If your state does not set a value for a given flag, the value will
    be inherited from its parent (or the first place in the state hierarchy
    where it is defined).

    The current set of flags are defined below. If you want to add a new flag,
    in addition to the area below, you will also need to declare it in the
    `Model` class.


     * [isEmpty](Model/properties/isEmpty?anchor=isEmpty)
     * [isLoading](Model/properties/isLoading?anchor=isLoading)
     * [isLoaded](Model/properties/isLoaded?anchor=isLoaded)
     * [hasDirtyAttributes](Model/properties/hasDirtyAttributes?anchor=hasDirtyAttributes)
     * [isSaving](Model/properties/isSaving?anchor=isSaving)
     * [isDeleted](Model/properties/isDeleted?anchor=isDeleted)
     * [isNew](Model/properties/isNew?anchor=isNew)
     * [isValid](Model/properties/isValid?anchor=isValid)

    @class RootState
  */

  function _didSetProperty(internalModel, context) {
    if (context.isDirty) {
      internalModel.send('becomeDirty');
    } else {
      internalModel.send('propertyWasReset');
    }

    internalModel.updateRecordArrays();
  } // Implementation notes:
  //
  // Each state has a boolean value for all of the following flags:
  //
  // * isLoaded: The record has a populated `data` property. When a
  //   record is loaded via `store.find`, `isLoaded` is false
  //   until the adapter sets it. When a record is created locally,
  //   its `isLoaded` property is always true.
  // * isDirty: The record has local changes that have not yet been
  //   saved by the adapter. This includes records that have been
  //   created (but not yet saved) or deleted.
  // * isSaving: The record has been committed, but
  //   the adapter has not yet acknowledged that the changes have
  //   been persisted to the backend.
  // * isDeleted: The record was marked for deletion. When `isDeleted`
  //   is true and `isDirty` is true, the record is deleted locally
  //   but the deletion was not yet persisted. When `isSaving` is
  //   true, the change is in-flight. When both `isDirty` and
  //   `isSaving` are false, the change has persisted.
  // * isNew: The record was created on the client and the adapter
  //   did not yet report that it was successfully saved.
  // * isValid: The adapter did not report any server-side validation
  //   failures.
  // The dirty state is a abstract state whose functionality is
  // shared between the `created` and `updated` states.
  //
  // The deleted state shares the `isDirty` flag with the
  // subclasses of `DirtyState`, but with a very different
  // implementation.
  //
  // Dirty states have three child states:
  //
  // `uncommitted`: the store has not yet handed off the record
  //   to be saved.
  // `inFlight`: the store has handed off the record to be saved,
  //   but the adapter has not yet acknowledged success.
  // `invalid`: the record has invalid information and cannot be
  //   sent to the adapter yet.


  var DirtyState = {
    initialState: 'uncommitted',
    // FLAGS
    isDirty: true,
    // SUBSTATES
    // When a record first becomes dirty, it is `uncommitted`.
    // This means that there are local pending changes, but they
    // have not yet begun to be saved, and are not invalid.
    uncommitted: {
      // EVENTS
      didSetProperty: _didSetProperty,
      //TODO(Igor) reloading now triggers a
      //loadingData event, though it seems fine?
      loadingData: function loadingData() {},
      propertyWasReset: function propertyWasReset(internalModel, name) {
        if (!internalModel.hasChangedAttributes()) {
          internalModel.send('rolledBack');
        }
      },
      pushedData: function pushedData(internalModel) {
        if (!internalModel.hasChangedAttributes()) {
          internalModel.transitionTo('loaded.saved');
        }
      },
      becomeDirty: function becomeDirty() {},
      willCommit: function willCommit(internalModel) {
        internalModel.transitionTo('inFlight');
      },
      reloadRecord: function reloadRecord(internalModel, _ref) {
        var resolve = _ref.resolve,
            options = _ref.options;
        resolve(internalModel.store._reloadRecord(internalModel, options));
      },
      rolledBack: function rolledBack(internalModel) {
        internalModel.transitionTo('loaded.saved');
        internalModel.triggerLater('rolledBack');
      },
      becameInvalid: function becameInvalid(internalModel) {
        internalModel.transitionTo('invalid');
      },
      rollback: function rollback(internalModel) {
        internalModel.rollbackAttributes();
        internalModel.triggerLater('ready');
      }
    },
    // Once a record has been handed off to the adapter to be
    // saved, it is in the 'in flight' state. Changes to the
    // record cannot be made during this window.
    inFlight: {
      // FLAGS
      isSaving: true,
      // EVENTS
      didSetProperty: _didSetProperty,
      becomeDirty: function becomeDirty() {},
      pushedData: function pushedData() {},
      unloadRecord: assertAgainstUnloadRecord,
      // TODO: More robust semantics around save-while-in-flight
      willCommit: function willCommit() {},
      didCommit: function didCommit(internalModel) {
        internalModel.transitionTo('saved');
        internalModel.send('invokeLifecycleCallbacks', this.dirtyType);
      },
      rolledBack: function rolledBack(internalModel) {
        internalModel.triggerLater('rolledBack');
      },
      becameInvalid: function becameInvalid(internalModel) {
        internalModel.transitionTo('invalid');
        internalModel.send('invokeLifecycleCallbacks');
      },
      becameError: function becameError(internalModel) {
        internalModel.transitionTo('uncommitted');
        internalModel.triggerLater('becameError', internalModel);
      }
    },
    // A record is in the `invalid` if the adapter has indicated
    // the the record failed server-side invalidations.
    invalid: {
      // FLAGS
      isValid: false,
      // EVENTS
      deleteRecord: function deleteRecord(internalModel) {
        internalModel.transitionTo('deleted.uncommitted');
      },
      didSetProperty: function didSetProperty(internalModel, context) {
        internalModel.removeErrorMessageFromAttribute(context.name);

        _didSetProperty(internalModel, context);

        if (!internalModel.hasErrors()) {
          this.becameValid(internalModel);
        }
      },
      becameInvalid: function becameInvalid() {},
      becomeDirty: function becomeDirty() {},
      pushedData: function pushedData() {},
      willCommit: function willCommit(internalModel) {
        internalModel.clearErrorMessages();
        internalModel.transitionTo('inFlight');
      },
      rolledBack: function rolledBack(internalModel) {
        internalModel.clearErrorMessages();
        internalModel.transitionTo('loaded.saved');
        internalModel.triggerLater('ready');
      },
      becameValid: function becameValid(internalModel) {
        internalModel.transitionTo('uncommitted');
      },
      invokeLifecycleCallbacks: function invokeLifecycleCallbacks(internalModel) {
        internalModel.triggerLater('becameInvalid', internalModel);
      }
    }
  }; // The created and updated states are created outside the state
  // chart so we can reopen their substates and add mixins as
  // necessary.

  function deepClone(object) {
    var clone = {};
    var value;

    for (var prop in object) {
      value = object[prop];

      if (value && typeof value === 'object') {
        clone[prop] = deepClone(value);
      } else {
        clone[prop] = value;
      }
    }

    return clone;
  }

  function mixin(original, hash) {
    for (var prop in hash) {
      original[prop] = hash[prop];
    }

    return original;
  }

  function dirtyState(options) {
    var newState = deepClone(DirtyState);
    return mixin(newState, options);
  }

  var createdState = dirtyState({
    dirtyType: 'created',
    // FLAGS
    isNew: true
  });

  createdState.invalid.rolledBack = function (internalModel) {
    internalModel.transitionTo('deleted.saved');
    internalModel.triggerLater('rolledBack');
  };

  createdState.uncommitted.rolledBack = function (internalModel) {
    internalModel.transitionTo('deleted.saved');
    internalModel.triggerLater('rolledBack');
  };

  var updatedState = dirtyState({
    dirtyType: 'updated'
  });

  function createdStateDeleteRecord(internalModel) {
    internalModel.transitionTo('deleted.saved');
    internalModel.send('invokeLifecycleCallbacks');
  }

  createdState.uncommitted.deleteRecord = createdStateDeleteRecord;
  createdState.invalid.deleteRecord = createdStateDeleteRecord;

  createdState.uncommitted.rollback = function (internalModel) {
    DirtyState.uncommitted.rollback.apply(this, arguments);
    internalModel.transitionTo('deleted.saved');
  };

  createdState.uncommitted.pushedData = function (internalModel) {
    internalModel.transitionTo('loaded.updated.uncommitted');
    internalModel.triggerLater('didLoad');
  };

  createdState.uncommitted.propertyWasReset = function () {};

  function assertAgainstUnloadRecord(internalModel) {
  }

  updatedState.invalid.becameValid = function (internalModel) {
    // we're eagerly transition into the loaded.saved state, even though we could
    // be still dirty; but the setup hook of the loaded.saved state checks for
    // dirty attributes and transitions into the corresponding dirty state
    internalModel.transitionTo('loaded.saved');
  };

  updatedState.inFlight.unloadRecord = assertAgainstUnloadRecord;

  updatedState.uncommitted.deleteRecord = function (internalModel) {
    internalModel.transitionTo('deleted.uncommitted');
  };

  updatedState.invalid.rolledBack = function (internalModel) {
    internalModel.clearErrorMessages();
    internalModel.transitionTo('loaded.saved');
    internalModel.triggerLater('rolledBack');
  };

  var RootState = {
    // FLAGS
    isEmpty: false,
    isLoading: false,
    isLoaded: false,
    isDirty: false,
    isSaving: false,
    isDeleted: false,
    isNew: false,
    isValid: true,
    // DEFAULT EVENTS
    // Trying to roll back if you're not in the dirty state
    // doesn't change your state. For example, if you're in the
    // in-flight state, rolling back the record doesn't move
    // you out of the in-flight state.
    rolledBack: function rolledBack() {},
    unloadRecord: function unloadRecord(internalModel) {},
    propertyWasReset: function propertyWasReset() {},
    // SUBSTATES
    // A record begins its lifecycle in the `empty` state.
    // If its data will come from the adapter, it will
    // transition into the `loading` state. Otherwise, if
    // the record is being created on the client, it will
    // transition into the `created` state.
    empty: {
      isEmpty: true,
      // EVENTS
      loadingData: function loadingData(internalModel, promise) {
        if (!canaryFeatures.REQUEST_SERVICE) {
          internalModel._promiseProxy = promise;
        }

        internalModel.transitionTo('loading');
      },
      loadedData: function loadedData(internalModel) {
        internalModel.transitionTo('loaded.created.uncommitted');
        internalModel.triggerLater('ready');
      },
      pushedData: function pushedData(internalModel) {
        internalModel.transitionTo('loaded.saved');
        internalModel.triggerLater('didLoad');
        internalModel.triggerLater('ready');
      }
    },
    // A record enters this state when the store asks
    // the adapter for its data. It remains in this state
    // until the adapter provides the requested data.
    //
    // Usually, this process is asynchronous, using an
    // XHR to retrieve the data.
    loading: {
      // FLAGS
      isLoading: true,
      exit: function exit(internalModel) {
        internalModel._promiseProxy = null;
      },
      loadingData: function loadingData() {},
      // EVENTS
      pushedData: function pushedData(internalModel) {
        internalModel.transitionTo('loaded.saved');
        internalModel.triggerLater('didLoad');
        internalModel.triggerLater('ready'); //TODO this seems out of place here

        internalModel.didCleanError();
      },
      becameError: function becameError(internalModel) {
        internalModel.triggerLater('becameError', internalModel);
      },
      notFound: function notFound(internalModel) {
        internalModel.transitionTo('empty');
      }
    },
    // A record enters this state when its data is populated.
    // Most of a record's lifecycle is spent inside substates
    // of the `loaded` state.
    loaded: {
      initialState: 'saved',
      // FLAGS
      isLoaded: true,
      //TODO(Igor) Reloading now triggers a loadingData event,
      //but it should be ok?
      loadingData: function loadingData() {},
      // SUBSTATES
      // If there are no local changes to a record, it remains
      // in the `saved` state.
      saved: {
        setup: function setup(internalModel) {
          if (internalModel.hasChangedAttributes()) {
            internalModel.adapterDidDirty();
          }
        },
        // EVENTS
        didSetProperty: _didSetProperty,
        pushedData: function pushedData() {},
        becomeDirty: function becomeDirty(internalModel) {
          internalModel.transitionTo('updated.uncommitted');
        },
        willCommit: function willCommit(internalModel) {
          internalModel.transitionTo('updated.inFlight');
        },
        reloadRecord: function reloadRecord(internalModel, _ref2) {
          var resolve = _ref2.resolve,
              options = _ref2.options;

          if (!canaryFeatures.REQUEST_SERVICE) {
            resolve(internalModel.store._reloadRecord(internalModel, options));
          }
        },
        deleteRecord: function deleteRecord(internalModel) {
          internalModel.transitionTo('deleted.uncommitted');
        },
        unloadRecord: function unloadRecord(internalModel) {},
        didCommit: function didCommit() {},
        // loaded.saved.notFound would be triggered by a failed
        // `reload()` on an unchanged record
        notFound: function notFound() {}
      },
      // A record is in this state after it has been locally
      // created but before the adapter has indicated that
      // it has been saved.
      created: createdState,
      // A record is in this state if it has already been
      // saved to the server, but there are new local changes
      // that have not yet been saved.
      updated: updatedState
    },
    // A record is in this state if it was deleted from the store.
    deleted: {
      initialState: 'uncommitted',
      dirtyType: 'deleted',
      // FLAGS
      isDeleted: true,
      isLoaded: true,
      isDirty: true,
      // TRANSITIONS
      setup: function setup(internalModel) {
        internalModel.updateRecordArrays();
      },
      // SUBSTATES
      // When a record is deleted, it enters the `start`
      // state. It will exit this state when the record
      // starts to commit.
      uncommitted: {
        // EVENTS
        willCommit: function willCommit(internalModel) {
          internalModel.transitionTo('inFlight');
        },
        rollback: function rollback(internalModel) {
          internalModel.rollbackAttributes();
          internalModel.triggerLater('ready');
        },
        pushedData: function pushedData() {},
        becomeDirty: function becomeDirty() {},
        deleteRecord: function deleteRecord() {},
        rolledBack: function rolledBack(internalModel) {
          internalModel.transitionTo('loaded.saved');
          internalModel.triggerLater('ready');
          internalModel.triggerLater('rolledBack');
        }
      },
      // After a record starts committing, but
      // before the adapter indicates that the deletion
      // has saved to the server, a record is in the
      // `inFlight` substate of `deleted`.
      inFlight: {
        // FLAGS
        isSaving: true,
        // EVENTS
        unloadRecord: assertAgainstUnloadRecord,
        // TODO: More robust semantics around save-while-in-flight
        willCommit: function willCommit() {},
        didCommit: function didCommit(internalModel) {
          internalModel.transitionTo('saved');
          internalModel.send('invokeLifecycleCallbacks');
        },
        becameError: function becameError(internalModel) {
          internalModel.transitionTo('uncommitted');
          internalModel.triggerLater('becameError', internalModel);
        },
        becameInvalid: function becameInvalid(internalModel) {
          internalModel.transitionTo('invalid');
          internalModel.triggerLater('becameInvalid', internalModel);
        }
      },
      // Once the adapter indicates that the deletion has
      // been saved, the record enters the `saved` substate
      // of `deleted`.
      saved: {
        // FLAGS
        isDirty: false,
        setup: function setup(internalModel) {
          internalModel.removeFromInverseRelationships();
        },
        invokeLifecycleCallbacks: function invokeLifecycleCallbacks(internalModel) {
          internalModel.triggerLater('didDelete', internalModel);
          internalModel.triggerLater('didCommit', internalModel);
        },
        willCommit: function willCommit() {},
        didCommit: function didCommit() {},
        pushedData: function pushedData() {}
      },
      invalid: {
        isValid: false,
        didSetProperty: function didSetProperty(internalModel, context) {
          internalModel.removeErrorMessageFromAttribute(context.name);

          _didSetProperty(internalModel, context);

          if (!internalModel.hasErrors()) {
            this.becameValid(internalModel);
          }
        },
        becameInvalid: function becameInvalid() {},
        becomeDirty: function becomeDirty() {},
        deleteRecord: function deleteRecord() {},
        willCommit: function willCommit() {},
        rolledBack: function rolledBack(internalModel) {
          internalModel.clearErrorMessages();
          internalModel.transitionTo('loaded.saved');
          internalModel.triggerLater('ready');
        },
        becameValid: function becameValid(internalModel) {
          internalModel.transitionTo('uncommitted');
        }
      }
    },
    invokeLifecycleCallbacks: function invokeLifecycleCallbacks(internalModel, dirtyType) {
      if (dirtyType === 'created') {
        internalModel.triggerLater('didCreate', internalModel);
      } else {
        internalModel.triggerLater('didUpdate', internalModel);
      }

      internalModel.triggerLater('didCommit', internalModel);
    }
  };

  function wireState(object, parent, name) {
    // TODO: Use Object.create and copy instead
    object = mixin(parent ? Object.create(parent) : {}, object);
    object.parentState = parent;
    object.stateName = name;

    for (var prop in object) {
      if (!Object.prototype.hasOwnProperty.call(object, prop) || prop === 'parentState' || prop === 'stateName') {
        continue;
      }

      if (typeof object[prop] === 'object') {
        object[prop] = wireState(object[prop], object, name + '.' + prop);
      }
    }

    return object;
  }

  var RootState$1 = wireState(RootState, null, 'root');

  function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }
  /**
    @class Snapshot
    @private
    @constructor
    @param {Model} internalModel The model to create a snapshot from
  */

  var Snapshot =
  /*#__PURE__*/
  function () {
    function Snapshot(options, identifier, store) {
      this.__attributes = null;
      this._belongsToRelationships = Object.create(null);
      this._belongsToIds = Object.create(null);
      this._hasManyRelationships = Object.create(null);
      this._hasManyIds = Object.create(null);

      var internalModel = this._internalModel = store._internalModelForResource(identifier);

      this._store = store;
      this.modelName = identifier.type;

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        this.identifier = identifier;
      }
      /*
        If the internalModel does not yet have a record, then we are
        likely a snapshot being provided to a find request, so we
        populate __attributes lazily. Else, to preserve the "moment
        in time" in which a snapshot is created, we greedily grab
        the values.
       */


      if (internalModel.hasRecord) {
        this._attributes;
      }
      /**O
       The id of the snapshot's underlying record
        Example
        ```javascript
       // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
       postSnapshot.id; // => '1'
       ```
        @property id
       @type {String}
       */


      this.id = identifier.id;
      /**
       A hash of adapter options
       @property adapterOptions
       @type {Object}
       */

      this.adapterOptions = options.adapterOptions;
      this.include = options.include;
      /**
       The name of the type of the underlying record for this snapshot, as a string.
        @property modelName
       @type {String}
       */

      this.modelName = internalModel.modelName;

      if (internalModel.hasRecord) {
        this._changedAttributes = recordDataFor(internalModel).changedAttributes();
      }
    }
    /**
     The underlying record for this snapshot. Can be used to access methods and
     properties defined on the record.
      Example
      ```javascript
     let json = snapshot.record.toJSON();
     ```
      @property record
     @type {Model}
     */


    var _proto = Snapshot.prototype;

    /**
     Returns the value of an attribute.
      Example
      ```javascript
     // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
     postSnapshot.attr('author'); // => 'Tomster'
     postSnapshot.attr('title'); // => 'Ember.js rocks'
     ```
      Note: Values are loaded eagerly and cached when the snapshot is created.
      @method attr
     @param {String} keyName
     @return {Object} The attribute value or undefined
     */
    _proto.attr = function attr(keyName) {
      if (keyName in this._attributes) {
        return this._attributes[keyName];
      }

      throw new Ember.Error("Model '" + Ember.inspect(this.record) + "' has no attribute named '" + keyName + "' defined.");
    }
    /**
     Returns all attributes and their corresponding values.
      Example
      ```javascript
     // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
     postSnapshot.attributes(); // => { author: 'Tomster', title: 'Ember.js rocks' }
     ```
      @method attributes
     @return {Object} All attributes of the current snapshot
     */
    ;

    _proto.attributes = function attributes() {
      return Ember.assign({}, this._attributes);
    }
    /**
     Returns all changed attributes and their old and new values.
      Example
      ```javascript
     // store.push('post', { id: 1, author: 'Tomster', title: 'Ember.js rocks' });
     postModel.set('title', 'Ember.js rocks!');
     postSnapshot.changedAttributes(); // => { title: ['Ember.js rocks', 'Ember.js rocks!'] }
     ```
      @method changedAttributes
     @return {Object} All changed attributes of the current snapshot
     */
    ;

    _proto.changedAttributes = function changedAttributes() {
      var changedAttributes = Object.create(null);
      var changedAttributeKeys = Object.keys(this._changedAttributes);

      for (var i = 0, length = changedAttributeKeys.length; i < length; i++) {
        var key = changedAttributeKeys[i];
        changedAttributes[key] = this._changedAttributes[key].slice();
      }

      return changedAttributes;
    }
    /**
     Returns the current value of a belongsTo relationship.
      `belongsTo` takes an optional hash of options as a second parameter,
     currently supported options are:
      - `id`: set to `true` if you only want the ID of the related record to be
     returned.
      Example
      ```javascript
     // store.push('post', { id: 1, title: 'Hello World' });
     // store.createRecord('comment', { body: 'Lorem ipsum', post: post });
     commentSnapshot.belongsTo('post'); // => Snapshot
     commentSnapshot.belongsTo('post', { id: true }); // => '1'
      // store.push('comment', { id: 1, body: 'Lorem ipsum' });
     commentSnapshot.belongsTo('post'); // => undefined
     ```
      Calling `belongsTo` will return a new Snapshot as long as there's any known
     data for the relationship available, such as an ID. If the relationship is
     known but unset, `belongsTo` will return `null`. If the contents of the
     relationship is unknown `belongsTo` will return `undefined`.
      Note: Relationships are loaded lazily and cached upon first access.
      @method belongsTo
     @param {String} keyName
     @param {Object} [options]
     @return {(Snapshot|String|null|undefined)} A snapshot or ID of a known
     relationship or null if the relationship is known but unset. undefined
     will be returned if the contents of the relationship is unknown.
     */
    ;

    _proto.belongsTo = function belongsTo(keyName, options) {
      var id = options && options.id;
      var relationship;
      var inverseInternalModel;
      var result;
      var store = this._internalModel.store;

      if (id && keyName in this._belongsToIds) {
        return this._belongsToIds[keyName];
      }

      if (!id && keyName in this._belongsToRelationships) {
        return this._belongsToRelationships[keyName];
      }

      var relationshipMeta = store._relationshipMetaFor(this.modelName, null, keyName);

      if (!(relationshipMeta && relationshipMeta.kind === 'belongsTo')) {
        throw new Ember.Error("Model '" + Ember.inspect(this.record) + "' has no belongsTo relationship named '" + keyName + "' defined.");
      }

      relationship = relationshipStateFor(this, keyName);
      var value = relationship.getData();
      var data = value && value.data;
      inverseInternalModel = data && store._internalModelForResource(data);

      if (value && value.data !== undefined) {
        if (inverseInternalModel && !inverseInternalModel.isDeleted()) {
          if (id) {
            result = Ember.get(inverseInternalModel, 'id');
          } else {
            result = inverseInternalModel.createSnapshot();
          }
        } else {
          result = null;
        }
      }

      if (id) {
        this._belongsToIds[keyName] = result;
      } else {
        this._belongsToRelationships[keyName] = result;
      }

      return result;
    }
    /**
     Returns the current value of a hasMany relationship.
      `hasMany` takes an optional hash of options as a second parameter,
     currently supported options are:
      - `ids`: set to `true` if you only want the IDs of the related records to be
     returned.
      Example
      ```javascript
     // store.push('post', { id: 1, title: 'Hello World', comments: [2, 3] });
     postSnapshot.hasMany('comments'); // => [Snapshot, Snapshot]
     postSnapshot.hasMany('comments', { ids: true }); // => ['2', '3']
      // store.push('post', { id: 1, title: 'Hello World' });
     postSnapshot.hasMany('comments'); // => undefined
     ```
      Note: Relationships are loaded lazily and cached upon first access.
      @method hasMany
     @param {String} keyName
     @param {Object} [options]
     @return {(Array|undefined)} An array of snapshots or IDs of a known
     relationship or an empty array if the relationship is known but unset.
     undefined will be returned if the contents of the relationship is unknown.
     */
    ;

    _proto.hasMany = function hasMany(keyName, options) {
      var ids = options && options.ids;
      var relationship;
      var results;

      if (ids && keyName in this._hasManyIds) {
        return this._hasManyIds[keyName];
      }

      if (!ids && keyName in this._hasManyRelationships) {
        return this._hasManyRelationships[keyName];
      }

      var store = this._internalModel.store;

      var relationshipMeta = store._relationshipMetaFor(this.modelName, null, keyName);

      if (!(relationshipMeta && relationshipMeta.kind === 'hasMany')) {
        throw new Ember.Error("Model '" + Ember.inspect(this.record) + "' has no hasMany relationship named '" + keyName + "' defined.");
      }

      relationship = relationshipStateFor(this, keyName);
      var value = relationship.getData();

      if (value.data) {
        results = [];
        value.data.forEach(function (member) {
          var internalModel = store._internalModelForResource(member);

          if (!internalModel.isDeleted()) {
            if (ids) {
              results.push(member.id);
            } else {
              results.push(internalModel.createSnapshot());
            }
          }
        });
      }

      if (ids) {
        this._hasManyIds[keyName] = results;
      } else {
        this._hasManyRelationships[keyName] = results;
      }

      return results;
    }
    /**
      Iterates through all the attributes of the model, calling the passed
      function on each attribute.
       Example
       ```javascript
      snapshot.eachAttribute(function(name, meta) {
        // ...
      });
      ```
       @method eachAttribute
      @param {Function} callback the callback to execute
      @param {Object} [binding] the value to which the callback's `this` should be bound
    */
    ;

    _proto.eachAttribute = function eachAttribute(callback, binding) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        var attrDefs = this._store._attributesDefinitionFor(this.modelName, this.identifier);

        Object.keys(attrDefs).forEach(function (key) {
          callback.call(binding, key, attrDefs[key]);
        });
      } else {
        this.record.eachAttribute(callback, binding);
      }
    }
    /**
      Iterates through all the relationships of the model, calling the passed
      function on each relationship.
       Example
       ```javascript
      snapshot.eachRelationship(function(name, relationship) {
        // ...
      });
      ```
       @method eachRelationship
      @param {Function} callback the callback to execute
      @param {Object} [binding] the value to which the callback's `this` should be bound
    */
    ;

    _proto.eachRelationship = function eachRelationship(callback, binding) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        var relationshipDefs = this._store._relationshipsDefinitionFor(this.modelName, this.identifier);

        Object.keys(relationshipDefs).forEach(function (key) {
          callback.call(binding, key, relationshipDefs[key]);
        });
      } else {
        this.record.eachRelationship(callback, binding);
      }
    }
    /**
      Serializes the snapshot using the serializer for the model.
       Example
       ```app/adapters/application.js
      import Adapter from '@ember-data/adapter';
       export default Adapter.extend({
        createRecord(store, type, snapshot) {
          var data = snapshot.serialize({ includeId: true });
          var url = `/${type.modelName}`;
           return fetch(url, {
            method: 'POST',
            body: data,
          }).then((response) => response.json())
        }
      });
      ```
       @method serialize
      @param {Object} options
      @return {Object} an object whose values are primitive JSON values only
     */
    ;

    _proto.serialize = function serialize(options) {
      return this.record.store.serializerFor(this.modelName).serialize(this, options);
    };

    _createClass$1(Snapshot, [{
      key: "record",
      get: function get() {
        return this._internalModel.getRecord();
      }
    }, {
      key: "_attributes",
      get: function get() {
        var _this = this;

        var attributes = this.__attributes;

        if (attributes === null) {
          var record = this.record;
          attributes = this.__attributes = Object.create(null);
          var attrs;

          if (canaryFeatures.CUSTOM_MODEL_CLASS) {
            attrs = Object.keys(this._store._attributesDefinitionFor(this.modelName, this.identifier));
          } else {
            attrs = Object.keys(this._store._attributesDefinitionFor(this.modelName, record.id));
          }

          if (canaryFeatures.CUSTOM_MODEL_CLASS) {
            attrs.forEach(function (keyName) {
              if (_this.type.isModel) {
                attributes[keyName] = Ember.get(record, keyName);
              } else {
                attributes[keyName] = recordDataFor(_this._internalModel).getAttr(keyName);
              }
            });
          } else {
            record.eachAttribute(function (keyName) {
              return attributes[keyName] = Ember.get(record, keyName);
            });
          }
        }

        return attributes;
      }
      /**
       The type of the underlying record for this snapshot, as a Model.
        @property type
       @type {Model}
       */

    }, {
      key: "type",
      get: function get() {
        // TODO @runspired we should deprecate this in favor of modelClass but only once
        // we've cleaned up the internals enough that a public change to follow suite is
        // uncontroversial.
        return this._internalModel.modelClass;
      }
    }, {
      key: "isNew",
      get: function get() {
        if (!canaryFeatures.CUSTOM_MODEL_CLASS) {
          throw new Error('isNew is only available when custom model class ff is on');
        }

        return this._internalModel.isNew();
      }
    }]);

    return Snapshot;
  }();

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  /**
    @module @ember-data/store
  */
  var EmberDataOrderedSet =
  /*#__PURE__*/
  function (_EmberOrderedSet) {
    _inheritsLoose(EmberDataOrderedSet, _EmberOrderedSet);

    function EmberDataOrderedSet() {
      return _EmberOrderedSet.apply(this, arguments) || this;
    }

    EmberDataOrderedSet.create = function create() {
      return new this();
    };

    var _proto = EmberDataOrderedSet.prototype;

    _proto.addWithIndex = function addWithIndex(obj, idx) {
      var guid = Ember.guidFor(obj);
      var presenceSet = this.presenceSet;
      var list = this.list;

      if (presenceSet[guid] === true) {
        return;
      }

      presenceSet[guid] = true;

      if (idx === undefined || idx === null) {
        list.push(obj);
      } else {
        list.splice(idx, 0, obj);
      }

      this.size += 1;
      return this;
    };

    return EmberDataOrderedSet;
  }(EmberOrderedSet);

  /**
    @module @ember-data/store
  */
  function _bind(fn) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return function () {
      return fn.apply(undefined, args);
    };
  }
  function _guard(promise, test) {
    var guarded = promise.finally(function () {
      if (!test()) {
        guarded._subscribers.length = 0;
      }
    });
    return guarded;
  }
  function _objectIsAlive(object) {
    return !(Ember.get(object, 'isDestroyed') || Ember.get(object, 'isDestroying'));
  }
  function guardDestroyedStore(promise, store, label) {

    var wrapperPromise = Ember.RSVP.resolve(promise, label).then(function (v) {
      return promise;
    });
    return _guard(wrapperPromise, function () {

      return _objectIsAlive(store);
    });
  }

  /**
    @module @ember-data/store
  */

  /**
    @method diffArray
    @private
    @param {Array} oldArray the old array
    @param {Array} newArray the new array
    @return {hash} {
        firstChangeIndex: <integer>,  // null if no change
        addedCount: <integer>,        // 0 if no change
        removedCount: <integer>       // 0 if no change
      }
  */
  function diffArray(oldArray, newArray) {
    var oldLength = oldArray.length;
    var newLength = newArray.length;
    var shortestLength = Math.min(oldLength, newLength);
    var firstChangeIndex = null; // null signifies no changes
    // find the first change

    for (var i = 0; i < shortestLength; i++) {
      // compare each item in the array
      if (oldArray[i] !== newArray[i]) {
        firstChangeIndex = i;
        break;
      }
    }

    if (firstChangeIndex === null && newLength !== oldLength) {
      // no change found in the overlapping block
      // and array lengths differ,
      // so change starts at end of overlap
      firstChangeIndex = shortestLength;
    }

    var addedCount = 0;
    var removedCount = 0;

    if (firstChangeIndex !== null) {
      // we found a change, find the end of the change
      var unchangedEndBlockLength = shortestLength - firstChangeIndex; // walk back from the end of both arrays until we find a change

      for (var _i = 1; _i <= shortestLength; _i++) {
        // compare each item in the array
        if (oldArray[oldLength - _i] !== newArray[newLength - _i]) {
          unchangedEndBlockLength = _i - 1;
          break;
        }
      }

      addedCount = newLength - unchangedEndBlockLength - firstChangeIndex;
      removedCount = oldLength - unchangedEndBlockLength - firstChangeIndex;
    }

    return {
      firstChangeIndex: firstChangeIndex,
      addedCount: addedCount,
      removedCount: removedCount
    };
  }

  //import Evented from '@ember/object/evented';
  /**
    A `ManyArray` is a `MutableArray` that represents the contents of a has-many
    relationship.

    The `ManyArray` is instantiated lazily the first time the relationship is
    requested.

    ### Inverses

    Often, the relationships in Ember Data applications will have
    an inverse. For example, imagine the following models are
    defined:

    ```app/models/post.js
    import Model, { hasMany } from '@ember-data/model';

    export default Model.extend({
      comments: hasMany('comment')
    });
    ```

    ```app/models/comment.js
    import Model, { belongsTo } from '@ember-data/model';

    export default Model.extend({
      post: belongsTo('post')
    });
    ```

    If you created a new instance of `Post` and added
    a `Comment` record to its `comments` has-many
    relationship, you would expect the comment's `post`
    property to be set to the post that contained
    the has-many.

    We call the record to which a relationship belongs-to the
    relationship's _owner_.

    @class ManyArray
    @extends EmberObject
    @uses Ember.MutableArray, EmberData.DeprecatedEvent
  */

  var ManyArray = Ember.Object.extend(Ember.MutableArray, DeprecatedEvented, {
    // here to make TS happy
    _inverseIsAsync: false,
    isLoaded: false,
    init: function init() {
      this._super.apply(this, arguments);
      /**
      The loading state of this array
       @property {Boolean} isLoaded
      */


      this.isLoaded = this.isLoaded || false;
      this.length = 0;
      /**
      Used for async `hasMany` arrays
      to keep track of when they will resolve.
       @property {Ember.RSVP.Promise} promise
      @private
      */

      this.promise = null;
      /**
      Metadata associated with the request for async hasMany relationships.
       Example
       Given that the server returns the following JSON payload when fetching a
      hasMany relationship:
       ```js
      {
        "comments": [{
          "id": 1,
          "comment": "This is the first comment",
        }, {
      // ...
        }],
         "meta": {
          "page": 1,
          "total": 5
        }
      }
      ```
       You can then access the metadata via the `meta` property:
       ```js
      post.get('comments').then(function(comments) {
        var meta = comments.get('meta');
       // meta.page => 1
      // meta.total => 5
      });
      ```
       @property {Object} meta
      @public
      */
      // TODO this is likely broken in our refactor

      this.meta = this.meta || null;
      /**
      `true` if the relationship is polymorphic, `false` otherwise.
       @property {Boolean} isPolymorphic
      @private
      */

      this.isPolymorphic = this.isPolymorphic || false;
      /**
      The relationship which manages this array.
       @property {ManyRelationship} relationship
      @private
      */

      this.currentState = [];
      this.flushCanonical(this.initialState, false);
    },
    // TODO: if(DEBUG)
    anyUnloaded: function anyUnloaded() {
      // Use `filter[0]` as opposed to `find` because of IE11
      var unloaded = this.currentState.filter(function (im) {
        return im._isDematerializing || !im.isLoaded();
      })[0];
      return !!unloaded;
    },
    removeUnloadedInternalModel: function removeUnloadedInternalModel() {
      for (var i = 0; i < this.currentState.length; ++i) {
        var internalModel = this.currentState[i];
        var shouldRemove = void 0;

        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          shouldRemove = internalModel._isDematerializing;
        } else {
          shouldRemove = internalModel._isDematerializing || !internalModel.isLoaded();
        }

        if (shouldRemove) {
          this.arrayContentWillChange(i, 1, 0);
          this.currentState.splice(i, 1);
          this.set('length', this.currentState.length);
          this.arrayContentDidChange(i, 1, 0);
          return true;
        }
      }

      return false;
    },
    objectAt: function objectAt(index) {
      // TODO we likely need to force flush here

      /*
      if (this.relationship._willUpdateManyArray) {
        this.relationship._flushPendingManyArrayUpdates();
      }
      */
      var internalModel = this.currentState[index];

      if (internalModel === undefined) {
        return;
      }

      return internalModel.getRecord();
    },
    flushCanonical: function flushCanonical(toSet, isInitialized) {
      if (isInitialized === void 0) {
        isInitialized = true;
      }

      // It’s possible the parent side of the relationship may have been unloaded by this point
      if (!_objectIsAlive(this)) {
        return;
      } // diff to find changes


      var diff = diffArray(this.currentState, toSet);

      if (diff.firstChangeIndex !== null) {
        // it's null if no change found
        // we found a change
        this.arrayContentWillChange(diff.firstChangeIndex, diff.removedCount, diff.addedCount);
        this.set('length', toSet.length);
        this.currentState = toSet.slice();
        this.arrayContentDidChange(diff.firstChangeIndex, diff.removedCount, diff.addedCount);

        if (isInitialized && diff.addedCount > 0) {
          //notify only on additions
          //TODO only notify if unloaded
          this.internalModel.manyArrayRecordAdded(this.get('key'));
        }
      }
    },
    replace: function replace(idx, amt, objects) {
      var internalModels;

      if (amt > 0) {
        internalModels = this.currentState.slice(idx, idx + amt);
        this.get('recordData').removeFromHasMany(this.get('key'), internalModels.map(function (im) {
          return recordDataFor(im);
        }));
      }

      if (objects) {
        this.get('recordData').addToHasMany(this.get('key'), objects.map(function (obj) {
          return recordDataFor(obj);
        }), idx);
      }

      this.retrieveLatest();
    },
    // Ok this is kinda funky because if buggy we might lose positions, etc.
    // but current code is this way so shouldn't be too big of a problem
    retrieveLatest: function retrieveLatest() {
      var jsonApi = this.get('recordData').getHasMany(this.get('key')); // TODO this is odd, why should ManyArray ever tell itself to resync?

      var internalModels = this.store._getHasManyByJsonApiResource(jsonApi);

      if (jsonApi.meta) {
        this.set('meta', jsonApi.meta);
      }

      this.flushCanonical(internalModels, true);
    },

    /**
      Reloads all of the records in the manyArray. If the manyArray
      holds a relationship that was originally fetched using a links url
      Ember Data will revisit the original links url to repopulate the
      relationship.
       If the manyArray holds the result of a `store.query()` reload will
      re-run the original query.
       Example
       ```javascript
      var user = store.peekRecord('user', 1)
      user.login().then(function() {
        user.get('permissions').then(function(permissions) {
          return permissions.reload();
        });
      });
      ```
       @method reload
      @public
    */
    reload: function reload(options) {
      // TODO this is odd, we don't ask the store for anything else like this?
      return this.get('store').reloadManyArray(this, this.get('internalModel'), this.get('key'), options);
    },

    /**
      Saves all of the records in the `ManyArray`.
       Example
       ```javascript
      store.findRecord('inbox', 1).then(function(inbox) {
        inbox.get('messages').then(function(messages) {
          messages.forEach(function(message) {
            message.set('isRead', true);
          });
          messages.save()
        });
      });
      ```
       @method save
      @return {PromiseArray} promise
    */
    save: function save() {
      var manyArray = this;
      var promiseLabel = 'DS: ManyArray#save ' + Ember.get(this, 'type');
      var promise = Ember.RSVP.all(this.invoke('save'), promiseLabel).then(function () {
        return manyArray;
      }, null, 'DS: ManyArray#save return ManyArray');
      return PromiseArray.create({
        promise: promise
      });
    },

    /**
      Create a child record within the owner
       @method createRecord
      @private
      @param {Object} hash
      @return {Model} record
    */
    createRecord: function createRecord(hash) {
      var store = Ember.get(this, 'store');
      var type = Ember.get(this, 'type');
      var record = store.createRecord(type.modelName, hash);
      this.pushObject(record);
      return record;
    }
  });

  function isResourceIdentiferWithRelatedLinks(value) {
    return value && value.links && value.links.related;
  }
  /**
    This is the baseClass for the different References
    like RecordReference/HasManyReference/BelongsToReference

   @class Reference
   */


  var Reference =
  /*#__PURE__*/
  function () {
    function Reference(store, internalModel) {
      this.store = store;
      this.internalModel = internalModel;
      this.recordData = void 0;
      this.recordData = recordDataFor(this);
    }

    var _proto = Reference.prototype;

    _proto._resource = function _resource() {}
    /**
     This returns a string that represents how the reference will be
     looked up when it is loaded. If the relationship has a link it will
     use the "link" otherwise it defaults to "id".
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
      export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```javascript
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      // get the identifier of the reference
     if (commentsRef.remoteType() === "ids") {
       let ids = commentsRef.ids();
     } else if (commentsRef.remoteType() === "link") {
       let link = commentsRef.link();
     }
     ```
      @method remoteType
     @return {String} The name of the remote type. This should either be "link" or "ids"
     */
    ;

    _proto.remoteType = function remoteType() {
      var value = this._resource();

      if (isResourceIdentiferWithRelatedLinks(value)) {
        return 'link';
      }

      return 'id';
    }
    /**
     The link Ember Data will use to fetch or reload this belongs-to
     relationship.
      Example
      ```javascript
     // models/blog.js
     import Model, { belongsTo } from '@ember-data/model';
     export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              links: {
                related: '/articles/1/author'
              }
            }
          }
        }
      });
     let userRef = blog.belongsTo('user');
      // get the identifier of the reference
     if (userRef.remoteType() === "link") {
        let link = userRef.link();
      }
     ```
      @method link
     @return {String} The link Ember Data will use to fetch or reload this belongs-to relationship.
     */
    ;

    _proto.link = function link() {
      var link = null;

      var resource = this._resource();

      if (isResourceIdentiferWithRelatedLinks(resource)) {
        if (resource.links) {
          link = resource.links.related;
        }
      }

      return link;
    }
    /**
     The meta data for the belongs-to relationship.
      Example
      ```javascript
     // models/blog.js
     import Model, { belongsTo } from '@ember-data/model';
     export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              links: {
                related: {
                  href: '/articles/1/author'
                },
                meta: {
                  lastUpdated: 1458014400000
                }
              }
            }
          }
        }
      });
      let userRef = blog.belongsTo('user');
      userRef.meta() // { lastUpdated: 1458014400000 }
     ```
      @method meta
     @return {Object} The meta information for the belongs-to relationship.
     */
    ;

    _proto.meta = function meta() {
      var meta = null;

      var resource = this._resource();

      if (resource && resource.meta && typeof resource.meta === 'object') {
        meta = resource.meta;
      }

      return meta;
    };

    return Reference;
  }();

  function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); if (staticProps) _defineProperties$2(Constructor, staticProps); return Constructor; }

  function _inheritsLoose$1(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  /**
    @module @ember-data/store
  */

  /**
     A `RecordReference` is a low-level API that allows users and
     addon authors to perform meta-operations on a record.

     @class RecordReference
     @extends Reference
  */
  var RecordReference =
  /*#__PURE__*/
  function (_Reference) {
    _inheritsLoose$1(RecordReference, _Reference);

    function RecordReference() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Reference.call.apply(_Reference, [this].concat(args)) || this;
      _this.type = _this.internalModel.modelName;
      return _this;
    }

    var _proto = RecordReference.prototype;

    /**
       The `id` of the record that this reference refers to.
        Together, the `type` and `id` properties form a composite key for
       the identity map.
        Example
        ```javascript
       let userRef = store.getReference('user', 1);
        userRef.id(); // '1'
       ```
        @method id
       @return {String} The id of the record.
    */
    _proto.id = function id() {
      return this._id;
    }
    /**
       How the reference will be looked up when it is loaded. Currently
       this always returns `identity` to signify that a record will be
       loaded by its `type` and `id`.
        Example
        ```javascript
       const userRef = store.getReference('user', 1);
        userRef.remoteType(); // 'identity'
       ```
        @method remoteType
       @return {String} 'identity'
    */
    ;

    _proto.remoteType = function remoteType() {
      return 'identity';
    }
    /**
      This API allows you to provide a reference with new data. The
      simplest usage of this API is similar to `store.push`: you provide a
      normalized hash of data and the object represented by the reference
      will update.
       If you pass a promise to `push`, Ember Data will not ask the adapter
      for the data if another attempt to fetch it is made in the
      interim. When the promise resolves, the underlying object is updated
      with the new data, and the promise returned by *this function* is resolved
      with that object.
       For example, `recordReference.push(promise)` will be resolved with a
      record.
        Example
        ```javascript
       let userRef = store.getReference('user', 1);
        // provide data for reference
       userRef.push({
         data: {
           id: "1",
           type: "user",
           attributes: {
             username: "@user"
           }
         }
       }).then(function(user) {
         userRef.value() === user;
       });
       ```
       @method push
      @param objectOrPromise a JSON:API ResourceDocument or a promise resolving to one
      @return a promise for the value (record or relationship)
    */
    ;

    _proto.push = function push(objectOrPromise) {
      var _this2 = this;

      return Ember.RSVP.resolve(objectOrPromise).then(function (data) {
        return _this2.store.push(data);
      });
    }
    /**
      If the entity referred to by the reference is already loaded, it is
      present as `reference.value`. Otherwise the value returned by this function
      is `null`.
        Example
        ```javascript
       let userRef = store.getReference('user', 1);
        userRef.value(); // user
       ```
        @method value
       @return {Model} the record for this RecordReference
    */
    ;

    _proto.value = function value() {
      if (this.internalModel.hasRecord) {
        return this.internalModel.getRecord();
      }

      return null;
    }
    /**
       Triggers a fetch for the backing entity based on its `remoteType`
       (see `remoteType` definitions per reference type).
        Example
        ```javascript
       let userRef = store.getReference('user', 1);
        // load user (via store.find)
       userRef.load().then(...)
       ```
        @method load
       @return {Promise<record>} the record for this RecordReference
    */
    ;

    _proto.load = function load() {
      if (this._id !== null) {
        return this.store.findRecord(this.type, this._id);
      }

      throw new Error("Unable to fetch record of type " + this.type + " without an id");
    }
    /**
       Reloads the record if it is already loaded. If the record is not
       loaded it will load the record via `store.findRecord`
        Example
        ```javascript
       let userRef = store.getReference('user', 1);
        // or trigger a reload
       userRef.reload().then(...)
       ```
        @method reload
       @return {Promise<record>} the record for this RecordReference
    */
    ;

    _proto.reload = function reload() {
      var record = this.value();

      if (record) {
        return record.reload();
      }

      return this.load();
    };

    _createClass$2(RecordReference, [{
      key: "_id",
      get: function get() {
        return this.internalModel.id;
      }
    }]);

    return RecordReference;
  }(Reference);

  function _inheritsLoose$2(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
  /**
    @module @ember-data/store
  */

  /**
   A `BelongsToReference` is a low-level API that allows users and
   addon authors to perform meta-operations on a belongs-to
   relationship.

   @class BelongsToReference
   @extends Reference
   */

  var BelongsToReference =
  /*#__PURE__*/
  function (_Reference) {
    _inheritsLoose$2(BelongsToReference, _Reference);

    function BelongsToReference(store, parentInternalModel, belongsToRelationship, key) {
      var _this;

      _this = _Reference.call(this, store, parentInternalModel) || this;
      _this.key = key;
      _this.belongsToRelationship = belongsToRelationship;
      _this.type = belongsToRelationship.relationshipMeta.type;
      _this.parent = parentInternalModel.recordReference;
      _this.parentInternalModel = parentInternalModel; // TODO inverse

      return _this;
    }
    /**
     The `id` of the record that this reference refers to. Together, the
     `type()` and `id()` methods form a composite key for the identity
     map. This can be used to access the id of an async relationship
     without triggering a fetch that would normally happen if you
     attempted to use `record.get('relationship.id')`.
      Example
      ```javascript
     // models/blog.js
     export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              data: { type: 'user', id: 1 }
            }
          }
        }
      });
     let userRef = blog.belongsTo('user');
      // get the identifier of the reference
     if (userRef.remoteType() === "id") {
        let id = userRef.id();
      }
     ```
      @method id
     @return {String} The id of the record in this belongsTo relationship.
     */


    var _proto = BelongsToReference.prototype;

    _proto.id = function id() {
      var id = null;

      var resource = this._resource();

      if (resource && resource.data && resource.data.id) {
        id = resource.data.id;
      }

      return id;
    };

    _proto._resource = function _resource() {
      return this.recordData.getBelongsTo(this.key);
    }
    /**
     `push` can be used to update the data in the relationship and Ember
     Data will treat the new data as the conanical value of this
     relationship on the backend.
      Example
      ```app/models/blog.js
     import Model, { belongsTo } from '@ember-data/model';
      export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              data: { type: 'user', id: 1 }
            }
          }
        }
      });
     let userRef = blog.belongsTo('user');
      // provide data for reference
     userRef.push({
        data: {
          type: 'user',
          id: 1,
          attributes: {
            username: "@user"
          }
        }
      }).then(function(user) {
        userRef.value() === user;
      });
     ```
      @method push
     @param {Object|Promise} objectOrPromise a promise that resolves to a JSONAPI document object describing the new value of this relationship.
     @return {Promise<record>} A promise that resolves with the new value in this belongs-to relationship.
     */
    ;

    _proto.push = function push(objectOrPromise) {
      var _this2 = this;

      return Ember.RSVP.resolve(objectOrPromise).then(function (data) {
        var record; // TODO deprecate data as Model

        if (data instanceof Model) {
          record = data;
        } else {
          record = _this2.store.push(data);
        }

        //TODO Igor cleanup, maybe move to relationship push
        _this2.belongsToRelationship.setCanonicalRecordData(recordDataFor(record));

        return record;
      });
    }
    /**
     `value()` synchronously returns the current value of the belongs-to
     relationship. Unlike `record.get('relationshipName')`, calling
     `value()` on a reference does not trigger a fetch if the async
     relationship is not yet loaded. If the relationship is not loaded
     it will always return `null`.
      Example
      ```javascript
     // models/blog.js
     import Model, { belongsTo } from '@ember-data/model';
      export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              data: { type: 'user', id: 1 }
            }
          }
        }
      });
     let userRef = blog.belongsTo('user');
      userRef.value(); // null
      // provide data for reference
     userRef.push({
        data: {
          type: 'user',
          id: 1,
          attributes: {
            username: "@user"
          }
        }
      }).then(function(user) {
        userRef.value(); // user
      });
     ```
      @method value
     @return {Model} the record in this relationship
     */
    ;

    _proto.value = function value() {
      var store = this.parentInternalModel.store;

      var resource = this._resource();

      if (resource && resource.data) {
        var inverseInternalModel = store._internalModelForResource(resource.data);

        if (inverseInternalModel && inverseInternalModel.isLoaded()) {
          return inverseInternalModel.getRecord();
        }
      }

      return null;
    }
    /**
     Loads a record in a belongs-to relationship if it is not already
     loaded. If the relationship is already loaded this method does not
     trigger a new load.
      Example
      ```javascript
     // models/blog.js
     import Model, { belongsTo } from '@ember-data/model';
      export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              data: { type: 'user', id: 1 }
            }
          }
        }
      });
     let userRef = blog.belongsTo('user');
      userRef.value(); // null
      userRef.load().then(function(user) {
        userRef.value() === user
      });
     ```
      You may also pass in an options object whose properties will be
     fed forward. This enables you to pass `adapterOptions` into the
     request given to the adapter via the reference.
      Example
      ```javascript
     userRef.load({ adapterOptions: { isPrivate: true } }).then(function(user) {
       userRef.value() === user;
     });
     ```
      ```app/adapters/user.js
     export default ApplicationAdapter.extend({
       findRecord(store, type, id, snapshot) {
         // In the adapter you will have access to adapterOptions.
         let adapterOptions = snapshot.adapterOptions;
       }
     });
     ```
      @method load
     @param {Object} options the options to pass in.
     @return {Promise} a promise that resolves with the record in this belongs-to relationship.
     */
    ;

    _proto.load = function load(options) {
      return this.parentInternalModel.getBelongsTo(this.key, options);
    }
    /**
     Triggers a reload of the value in this relationship. If the
     remoteType is `"link"` Ember Data will use the relationship link to
     reload the relationship. Otherwise it will reload the record by its
     id.
      Example
      ```javascript
     // models/blog.js
     import Model, { belongsTo } from '@ember-data/model';
     export default Model.extend({
        user: belongsTo({ async: true })
      });
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              data: { type: 'user', id: 1 }
            }
          }
        }
      });
     let userRef = blog.belongsTo('user');
      userRef.reload().then(function(user) {
        userRef.value() === user
      });
     ```
      You may also pass in an options object whose properties will be
     fed forward. This enables you to pass `adapterOptions` into the
     request given to the adapter via the reference. A full example
     can be found in the `load` method.
      Example
      ```javascript
     userRef.reload({ adapterOptions: { isPrivate: true } })
     ```
      @method reload
     @param {Object} options the options to pass in.
     @return {Promise} a promise that resolves with the record in this belongs-to relationship after the reload has completed.
     */
    ;

    _proto.reload = function reload(options) {
      var _this3 = this;

      return this.parentInternalModel.reloadBelongsTo(this.key, options).then(function (internalModel) {
        return _this3.value();
      });
    };

    return BelongsToReference;
  }(Reference);

  function _inheritsLoose$3(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
  /**
    @module @ember-data/store
  */

  /**
   A `HasManyReference` is a low-level API that allows users and addon
   authors to perform meta-operations on a has-many relationship.

   @class HasManyReference
   @extends Reference
   */

  var HasManyReference =
  /*#__PURE__*/
  function (_Reference) {
    _inheritsLoose$3(HasManyReference, _Reference);

    function HasManyReference(store, parentInternalModel, hasManyRelationship, key) {
      var _this;

      _this = _Reference.call(this, store, parentInternalModel) || this;
      _this.key = key;
      _this.hasManyRelationship = hasManyRelationship;
      _this.type = hasManyRelationship.relationshipMeta.type;
      _this.parent = parentInternalModel.recordReference;
      _this.parentInternalModel = parentInternalModel; // TODO inverse

      return _this;
    }

    var _proto = HasManyReference.prototype;

    _proto._resource = function _resource() {
      return this.recordData.getHasMany(this.key);
    }
    /**
     This returns a string that represents how the reference will be
     looked up when it is loaded. If the relationship has a link it will
     use the "link" otherwise it defaults to "id".
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
     export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```javascript
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      // get the identifier of the reference
     if (commentsRef.remoteType() === "ids") {
       let ids = commentsRef.ids();
     } else if (commentsRef.remoteType() === "link") {
       let link = commentsRef.link();
     }
     ```
      @method remoteType
     @return {String} The name of the remote type. This should either be `link` or `ids`
     */
    ;

    _proto.remoteType = function remoteType() {
      var value = this._resource();

      if (value && value.links && value.links.related) {
        return 'link';
      }

      return 'ids';
    }
    /**
     `ids()` returns an array of the record IDs in this relationship.
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
     export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```javascript
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      commentsRef.ids(); // ['1']
     ```
      @method ids
     @return {Array} The ids in this has-many relationship
     */
    ;

    _proto.ids = function ids() {
      var resource = this._resource();

      var ids = [];

      if (resource.data) {
        ids = resource.data.map(function (data) {
          return data.id;
        });
      }

      return ids;
    }
    /**
     `push` can be used to update the data in the relationship and Ember
     Data will treat the new data as the canonical value of this
     relationship on the backend.
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
     export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      commentsRef.ids(); // ['1']
      commentsRef.push([
     [{ type: 'comment', id: 2 }],
     [{ type: 'comment', id: 3 }],
     ])
      commentsRef.ids(); // ['2', '3']
     ```
      @method push
     @param {Array|Promise} objectOrPromise a promise that resolves to a JSONAPI document object describing the new value of this relationship.
     @return {ManyArray}
     */
    ;

    _proto.push = function push(objectOrPromise) {
      var _this2 = this;

      return Ember.RSVP.resolve(objectOrPromise).then(function (payload) {
        var array = payload;

        if (typeof payload === 'object' && payload.data) {
          array = payload.data;
        }

        var internalModels = array.map(function (obj) {
          var record = _this2.store.push(obj);

          return recordDataFor(record);
        });

        _this2.hasManyRelationship.computeChanges(internalModels);

        return _this2.internalModel.getHasMany(_this2.hasManyRelationship.key); // TODO IGOR it seems wrong that we were returning the many array here
        //return this.hasManyRelationship.manyArray;
      });
    };

    _proto._isLoaded = function _isLoaded() {
      var _this3 = this;

      var hasRelationshipDataProperty = Ember.get(this.hasManyRelationship, 'hasAnyRelationshipData');

      if (!hasRelationshipDataProperty) {
        return false;
      }

      var members = this.hasManyRelationship.members.toArray(); //TODO Igor cleanup

      return members.every(function (recordData) {
        var store = _this3.parentInternalModel.store;

        var internalModel = store._internalModelForResource(recordData.getResourceIdentifier());

        return internalModel.isLoaded() === true;
      });
    }
    /**
     `value()` synchronously returns the current value of the has-many
     relationship. Unlike `record.get('relationshipName')`, calling
     `value()` on a reference does not trigger a fetch if the async
     relationship is not yet loaded. If the relationship is not loaded
     it will always return `null`.
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
     export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```javascript
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      post.get('comments').then(function(comments) {
       commentsRef.value() === comments
     })
     ```
      @method value
     @return {ManyArray}
     */
    ;

    _proto.value = function value() {
      if (this._isLoaded()) {
        return this.internalModel.getManyArray(this.key);
      }

      return null;
    }
    /**
     Loads the relationship if it is not already loaded.  If the
     relationship is already loaded this method does not trigger a new
     load. This causes a request to the specified
     relationship link or reloads all items currently in the relationship.
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
     export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```javascript
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      commentsRef.load().then(function(comments) {
       //...
     });
     ```
      You may also pass in an options object whose properties will be
     fed forward. This enables you to pass `adapterOptions` into the
     request given to the adapter via the reference.
      Example
      ```javascript
     commentsRef.load({ adapterOptions: { isPrivate: true } })
       .then(function(comments) {
         //...
       });
     ```
      ```app/adapters/comment.js
     export default ApplicationAdapter.extend({
       findMany(store, type, id, snapshots) {
         // In the adapter you will have access to adapterOptions.
         let adapterOptions = snapshots[0].adapterOptions;
       }
     });
     ```
      @method load
     @param {Object} options the options to pass in.
     @return {Promise} a promise that resolves with the ManyArray in
     this has-many relationship.
     */
    ;

    _proto.load = function load(options) {
      return this.internalModel.getHasMany(this.key, options);
    }
    /**
     Reloads this has-many relationship. This causes a request to the specified
     relationship link or reloads all items currently in the relationship.
      Example
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
     export default Model.extend({
       comments: hasMany({ async: true })
     });
     ```
      ```javascript
     let post = store.push({
       data: {
         type: 'post',
         id: 1,
         relationships: {
           comments: {
             data: [{ type: 'comment', id: 1 }]
           }
         }
       }
     });
      let commentsRef = post.hasMany('comments');
      commentsRef.reload().then(function(comments) {
       //...
     });
     ```
      You may also pass in an options object whose properties will be
     fed forward. This enables you to pass `adapterOptions` into the
     request given to the adapter via the reference. A full example
     can be found in the `load` method.
      Example
      ```javascript
     commentsRef.reload({ adapterOptions: { isPrivate: true } })
     ```
      @method reload
     @param {Object} options the options to pass in.
     @return {Promise} a promise that resolves with the ManyArray in this has-many relationship.
     */
    ;

    _proto.reload = function reload(options) {
      return this.internalModel.reloadHasMany(this.key, options);
    };

    return HasManyReference;
  }(Reference);

  /**
    @module @ember-data/store
  */
  // Used by the store to normalize IDs entering the store.  Despite the fact
  // that developers may provide IDs as numbers (e.g., `store.findRecord('person', 1)`),
  // it is important that internally we use strings, since IDs may be serialized
  // and lose type information.  For example, Ember's router may put a record's
  // ID into the URL, and if we later try to deserialize that URL and find the
  // corresponding record, we will not know if it is a string or a number.
  function coerceId(id) {
    if (id === null || id === undefined || id === '') {
      return null;
    }

    if (typeof id === 'string') {
      return id;
    }

    if (typeof id === 'symbol') {
      return id.toString();
    }

    return '' + id;
  }

  function ensureStringId(id) {
    var normalized = null;

    if (typeof id === 'string') {
      normalized = id.length > 0 ? id : null;
    } else if (typeof id === 'number' && !isNaN(id)) {
      normalized = '' + id;
    }

    return normalized;
  }

  /**
    @module @ember-data/store
  */
  // support IE11
  var CRYPTO = function () {
    var hasWindow = typeof window !== 'undefined';
    var isFastBoot = typeof FastBoot !== 'undefined';

    if (isFastBoot) {
      return {
        getRandomValues: function getRandomValues(buffer) {
          return FastBoot.require('crypto').randomFillSync(buffer);
        }
      };
    } else if (hasWindow && typeof window.crypto !== 'undefined') {
      return window.crypto;
    } else if (hasWindow && typeof window.msCrypto !== 'undefined' && typeof window.msCrypto.getRandomValues === 'function') {
      return window.msCrypto;
    } else {
      throw new Error('ember-data: Cannot find a valid way to generate local identifiers');
    }
  }(); // we might be able to optimize this by requesting more bytes than we need at a time


  function rng() {
    // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
    var rnds8 = new Uint8Array(16);
    return CRYPTO.getRandomValues(rnds8);
  }
  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */


  var byteToHex = [];

  for (var i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }

  function bytesToUuid(buf) {
    var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

    return [bth[buf[0]], bth[buf[1]], bth[buf[2]], bth[buf[3]], '-', bth[buf[4]], bth[buf[5]], '-', bth[buf[6]], bth[buf[7]], '-', bth[buf[8]], bth[buf[9]], '-', bth[buf[10]], bth[buf[11]], bth[buf[12]], bth[buf[13]], bth[buf[14]], bth[buf[15]]].join('');
  }

  function uuidv4() {
    var rnds = rng(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80;
    return bytesToUuid(rnds);
  }

  /**
    @module @ember-data/store
  */
  var IDENTIFIERS = new WeakMap();
  function isStableIdentifier(identifier) {
    return IDENTIFIERS.has(identifier);
  }
  function markStableIdentifier(identifier) {
    IDENTIFIERS.set(identifier, 'is-identifier');
  }
  function unmarkStableIdentifier(identifier) {
    IDENTIFIERS.delete(identifier);
  }

  function isNonEmptyString(str) {
    return typeof str === 'string' && str.length > 0;
  }

  var configuredForgetMethod;
  var configuredGenerationMethod;
  var configuredResetMethod;
  var configuredUpdateMethod;
  function setIdentifierGenerationMethod(method) {
    configuredGenerationMethod = method;
  }
  function setIdentifierUpdateMethod(method) {
    configuredUpdateMethod = method;
  }
  function setIdentifierForgetMethod(method) {
    configuredForgetMethod = method;
  }
  function setIdentifierResetMethod(method) {
    configuredResetMethod = method;
  }

  function defaultGenerationMethod(data, bucket) {
    if (isNonEmptyString(data.lid)) {
      return data.lid;
    }

    var type = data.type,
        id = data.id;

    if (isNonEmptyString(id)) {
      return "@ember-data:lid-" + normalizeModelName(type) + "-" + id;
    }

    return uuidv4();
  }

  var IdentifierCaches = new WeakMap();
  function identifierCacheFor(store) {
    var cache = IdentifierCaches.get(store);

    if (cache === undefined) {
      cache = new IdentifierCache();
      IdentifierCaches.set(store, cache);
    }

    return cache;
  }

  function defaultEmptyCallback() {}

  var IdentifierCache =
  /*#__PURE__*/
  function () {
    // Typescript still leaks private properties in the final
    // compiled class, so we may want to move these from _underscore
    // to a WeakMap to avoid leaking
    // currently we leak this for test purposes
    function IdentifierCache() {
      this._cache = {
        lids: Object.create(null),
        types: Object.create(null)
      };
      this._generate = void 0;
      this._update = void 0;
      this._forget = void 0;
      this._reset = void 0;
      this._merge = void 0;
      // we cache the user configuredGenerationMethod at init because it must
      // be configured prior and is not allowed to be changed
      this._generate = configuredGenerationMethod || defaultGenerationMethod;
      this._update = configuredUpdateMethod || defaultEmptyCallback;
      this._forget = configuredForgetMethod || defaultEmptyCallback;
      this._reset = configuredResetMethod || defaultEmptyCallback;
      this._merge = defaultEmptyCallback;
    }
    /**
     * hook to allow management of merge conflicts with identifiers.
     *
     * we allow late binding of this private internal merge so that `internalModelFactory`
     * can insert itself here to handle elimination of duplicates
     *
     * @internal
     */


    var _proto = IdentifierCache.prototype;

    _proto.__configureMerge = function __configureMerge(method) {
      this._merge = method || defaultEmptyCallback;
    }
    /**
     * @internal
     */
    ;

    _proto._getRecordIdentifier = function _getRecordIdentifier(resource, shouldGenerate) {
      if (shouldGenerate === void 0) {
        shouldGenerate = false;
      }

      // short circuit if we're already the stable version
      if (isStableIdentifier(resource)) {

        return resource;
      } // `type` must always be present

      var type = normalizeModelName(resource.type);
      var keyOptions = getTypeIndex(this._cache.types, type);
      var identifier;
      var lid = coerceId(resource.lid);
      var id = coerceId(resource.id); // go straight for the stable RecordIdentifier key'd to `lid`

      if (lid !== null) {
        identifier = keyOptions.lid[lid];
      } // we may have not seen this resource before
      // but just in case we check our own secondary lookup (`id`)


      if (identifier === undefined && id !== null) {
        identifier = keyOptions.id[id];
      }

      if (identifier === undefined) {
        // we have definitely not seen this resource before
        // so we allow the user configured `GenerationMethod` to tell us
        var newLid = this._generate(resource, 'record'); // we do this _even_ when `lid` is present because secondary lookups
        // may need to be populated, but we enforce not giving us something
        // different than expected


        if (lid !== null && newLid !== lid) {
          throw new Error("You should not change the <lid> of a RecordIdentifier");
        } else if (lid === null) {
          // allow configuration to tell us that we have
          // seen this `lid` before. E.g. a secondary lookup
          // connects this resource to a previously seen
          // resource.
          identifier = keyOptions.lid[newLid];
        }

        if (shouldGenerate === true) {
          if (identifier === undefined) {
            // if we still don't have an identifier, time to generate one
            identifier = makeStableRecordIdentifier(id, type, newLid); // populate our unique table

            this._cache.lids[identifier.lid] = identifier; // populate our primary lookup table
            // TODO consider having the `lid` cache be
            // one level up

            keyOptions.lid[identifier.lid] = identifier; // TODO exists temporarily to support `peekAll`
            // but likely to move

            keyOptions._allIdentifiers.push(identifier);
          } // populate our own secondary lookup table
          // even for the "successful" secondary lookup
          // by `_generate()`, since we missed the cache
          // previously
          // we use identifier.id instead of id here
          // because they may not match and we prefer
          // what we've set via resource data


          if (identifier.id !== null) {
            keyOptions.id[identifier.id] = identifier; // TODO allow filling out of `id` here
            // for the `username` non-client created
            // case.
          }
        }
      }

      return identifier;
    }
    /**
     * allows us to peek without generating when needed
     * useful for the "create" case when we need to see if
     * we are accidentally overwritting something
     *
     * @internal
     */
    ;

    _proto.peekRecordIdentifier = function peekRecordIdentifier(resource) {
      return this._getRecordIdentifier(resource, false);
    }
    /*
      Returns the Identifier for the given Resource, creates one if it does not yet exist.
       Specifically this means that we:
       - validate the `id` `type` and `lid` combo against known identifiers
      - return an object with an `lid` that is stable (repeated calls with the same
        `id` + `type` or `lid` will return the same `lid` value)
      - this referential stability of the object itself is guaranteed
    */
    ;

    _proto.getOrCreateRecordIdentifier = function getOrCreateRecordIdentifier(resource) {
      return this._getRecordIdentifier(resource, true);
    }
    /*
     Returns a new Identifier for the supplied data. Call this method to generate
     an identifier when a new resource is being created local to the client and
     potentially does not have an `id`.
      Delegates generation to the user supplied `GenerateMethod` if one has been provided
     with the signature `generateMethod({ type }, 'record')`.
     */
    ;

    _proto.createIdentifierForNewRecord = function createIdentifierForNewRecord(data) {
      var newLid = this._generate(data, 'record');

      var identifier = makeStableRecordIdentifier(data.id || null, data.type, newLid);
      var keyOptions = getTypeIndex(this._cache.types, data.type); // populate our unique table

      this._cache.lids[identifier.lid] = identifier; // populate the type+lid cache

      keyOptions.lid[newLid] = identifier; // ensure a peekAll sees our new identifier too
      // TODO move this outta here?

      keyOptions._allIdentifiers.push(identifier);

      return identifier;
    }
    /*
     Provides the opportunity to update secondary lookup tables for existing identifiers
     Called after an identifier created with `createIdentifierForNewRecord` has been
     committed.
      Assigned `id` to an `Identifier` if `id` has not previously existed; however,
     attempting to change the `id` or calling update without providing an `id` when
     one is missing will throw an error.
       - sets `id` (if `id` was previously `null`)
      - `lid` and `type` MUST NOT be altered post creation
       If a merge occurs, it is possible the returned identifier does not match the originally
      provided identifier. In this case the abandoned identifier will go through the usual
      `forgetRecordIdentifier` codepaths.
    */
    ;

    _proto.updateRecordIdentifier = function updateRecordIdentifier(identifierObject, data) {
      var identifier = this.getOrCreateRecordIdentifier(identifierObject);
      var id = identifier.id;
      var newId = coerceId(data.id);
      var keyOptions = getTypeIndex(this._cache.types, identifier.type);
      var existingIdentifier = detectMerge(keyOptions, identifier, newId);

      if (existingIdentifier) {
        identifier = this._mergeRecordIdentifiers(keyOptions, identifier, existingIdentifier, data, newId);
      }

      id = identifier.id;
      performRecordIdentifierUpdate(identifier, data, this._update);
      newId = identifier.id; // add to our own secondary lookup table

      if (id !== newId && newId !== null) {
        var _keyOptions = getTypeIndex(this._cache.types, identifier.type);

        _keyOptions.id[newId] = identifier;

        if (id !== null) {
          delete _keyOptions.id[id];
        }
      }

      return identifier;
    };

    _proto._mergeRecordIdentifiers = function _mergeRecordIdentifiers(keyOptions, identifier, existingIdentifier, data, newId) {
      // delegate determining which identifier to keep to the configured MergeMethod
      var kept = this._merge(identifier, existingIdentifier, data);

      var abandoned = kept === identifier ? existingIdentifier : identifier; // cleanup the identifier we no longer need

      this.forgetRecordIdentifier(abandoned); // ensure a secondary cache entry for this id for the identifier we do keep

      keyOptions.id[newId] = kept; // make sure that the `lid` on the data we are processing matches the lid we kept

      data.lid = kept.lid;
      return kept;
    }
    /*
     Provides the opportunity to eliminate an identifier from secondary lookup tables
     as well as eliminates it from ember-data's own lookup tables and book keeping.
      Useful when a record has been deleted and the deletion has been persisted and
     we do not care about the record anymore. Especially useful when an `id` of a
     deleted record might be reused later for a new record.
    */
    ;

    _proto.forgetRecordIdentifier = function forgetRecordIdentifier(identifierObject) {
      var identifier = this.getOrCreateRecordIdentifier(identifierObject);
      var keyOptions = getTypeIndex(this._cache.types, identifier.type);

      if (identifier.id !== null) {
        delete keyOptions.id[identifier.id];
      }

      delete this._cache.lids[identifier.lid];
      delete keyOptions.lid[identifier.lid];

      var index = keyOptions._allIdentifiers.indexOf(identifier);

      keyOptions._allIdentifiers.splice(index, 1);

      unmarkStableIdentifier(identifierObject);

      this._forget(identifier, 'record');
    };

    _proto.destroy = function destroy() {
      this._reset();
    };

    return IdentifierCache;
  }();

  function getTypeIndex(typeMap, type) {
    var typeIndex = typeMap[type];

    if (typeIndex === undefined) {
      typeIndex = {
        lid: Object.create(null),
        id: Object.create(null),
        _allIdentifiers: []
      };
      typeMap[type] = typeIndex;
    }

    return typeIndex;
  }

  function makeStableRecordIdentifier(id, type, lid, bucket, clientOriginated) {

    var recordIdentifier = {
      lid: lid,
      id: id,
      type: type
    };
    markStableIdentifier(recordIdentifier);

    return recordIdentifier;
  }

  function performRecordIdentifierUpdate(identifier, data, updateFn) {
    var id = data.id,
        lid = data.lid;
    var type = normalizeModelName(data.type);

    {
      updateFn(identifier, data, 'record');
    } // upgrade the ID, this is a "one time only" ability
    // for the multiple-cache-key scenario we "could"
    // use a heuristic to guess the best id for display
    // (usually when `data.id` is available and `data.attributes` is not)


    if (id !== undefined) {
      identifier.id = coerceId(id);
    }
  }

  function detectMerge(keyOptions, identifier, newId) {
    var id = identifier.id;

    if (id !== null && id !== newId && newId !== null) {
      var existingIdentifier = keyOptions.id[newId];
      return existingIdentifier !== undefined ? existingIdentifier : false;
    }

    return false;
  }

  function _defineProperties$3(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$3(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$3(Constructor.prototype, protoProps); if (staticProps) _defineProperties$3(Constructor, staticProps); return Constructor; }

  /**
    @module @ember-data/store
  */

  /**
   `InternalModelMap` is a custom storage map for internalModels of a given modelName
   used by `IdentityMap`.

   It was extracted from an implicit pojo based "internalModel map" and preserves
   that interface while we work towards a more official API.

   @class InternalModelMap
   @private
   */
  var InternalModelMap =
  /*#__PURE__*/
  function () {
    function InternalModelMap(modelName) {
      this.modelName = modelName;
      this._idToModel = Object.create(null);
      this._models = [];
      this._metadata = null;
    }
    /**
     * @method get
     * @param id {String}
     * @return {InternalModel}
     */


    var _proto = InternalModelMap.prototype;

    _proto.get = function get(id) {
      return this._idToModel[id] || null;
    };

    _proto.has = function has(id) {
      return !!this._idToModel[id];
    };

    _proto.set = function set(id, internalModel) {
      this._idToModel[id] = internalModel;
    };

    _proto.add = function add(internalModel, id) {

      if (id) {
        this._idToModel[id] = internalModel;
      }

      this._models.push(internalModel);
    };

    _proto.remove = function remove(internalModel, id) {
      delete this._idToModel[id];

      var loc = this._models.indexOf(internalModel);

      if (loc !== -1) {
        this._models.splice(loc, 1);
      }
    };

    _proto.contains = function contains(internalModel) {
      return this._models.indexOf(internalModel) !== -1;
    }
    /**
     An array of all models of this modelName
     @property models
     @type Array
     */
    ;

    /**
     Destroy all models in the internalModelTest and wipe metadata.
      @method clear
     */
    _proto.clear = function clear() {
      var internalModels = this._models;
      this._models = [];

      for (var i = 0; i < internalModels.length; i++) {
        var internalModel = internalModels[i];
        internalModel.unloadRecord();
      }

      this._metadata = null;
    };

    _createClass$3(InternalModelMap, [{
      key: "length",
      get: function get() {
        return this._models.length;
      }
    }, {
      key: "models",
      get: function get() {
        return this._models;
      }
      /**
       * meta information about internalModels
       * @property metadata
       * @type Object
       */

    }, {
      key: "metadata",
      get: function get() {
        return this._metadata || (this._metadata = Object.create(null));
      }
    }]);

    return InternalModelMap;
  }();

  /**
    @module @ember-data/store
  */

  /**
   `IdentityMap` is a custom storage map for records by modelName
   used by `Store`.

   @class IdentityMap
   @private
   */
  var IdentityMap =
  /*#__PURE__*/
  function () {
    function IdentityMap() {
      this._map = Object.create(null);
    }

    var _proto = IdentityMap.prototype;

    /**
     Retrieves the `InternalModelMap` for a given modelName,
     creating one if one did not already exist. This is
     similar to `getWithDefault` or `get` on a `MapWithDefault`
      @method retrieve
     @param modelName a previously normalized modelName
     @return {InternalModelMap} the InternalModelMap for the given modelName
     */
    _proto.retrieve = function retrieve(modelName) {
      var map = this._map[modelName];

      if (map === undefined) {
        map = this._map[modelName] = new InternalModelMap(modelName);
      }

      return map;
    }
    /**
     Clears the contents of all known `RecordMaps`, but does
     not remove the InternalModelMap instances.
      @method clear
     */
    ;

    _proto.clear = function clear() {
      var map = this._map;
      var keys = Object.keys(map);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        map[key].clear();
      }
    };

    return IdentityMap;
  }();

  function constructResource(type, id, lid) {
    var trueId = coerceId(id);

    if (!isNonEmptyString(trueId)) {
      if (isNonEmptyString(lid)) {
        return {
          type: type,
          id: trueId,
          lid: lid
        };
      }

      throw new Error("Expected either id or lid to be a valid string");
    }

    if (isNonEmptyString(lid)) {
      return {
        type: type,
        id: trueId,
        lid: lid
      };
    }

    return {
      type: type,
      id: trueId
    };
  }

  /**
    @module @ember-data/store
  */

  var FactoryCache = new WeakMap();
  var RecordCache = new WeakMap();
  function recordIdentifierFor(record) {
    var identifier = RecordCache.get(record);

    return identifier;
  }
  function setRecordIdentifier(record, identifier) {
    /*
    It would be nice to do a reverse check here that an identifier has not
    previously been assigned a record; however, unload + rematerialization
    prevents us from having a great way of doing so when CustomRecordClasses
    don't necessarily give us access to a `isDestroyed` for dematerialized
    instance.
    */


    RecordCache.set(record, identifier);
  }
  function internalModelFactoryFor(store) {
    var factory = FactoryCache.get(store);

    if (factory === undefined) {
      factory = new InternalModelFactory(store);
      FactoryCache.set(store, factory);
    }

    return factory;
  }
  /**
   * The InternalModelFactory handles the lifecyle of
   * instantiating, caching, and destroying InternalModel
   * instances.
   *
   * @internal
   */

  var InternalModelFactory =
  /*#__PURE__*/
  function () {
    function InternalModelFactory(store) {
      var _this = this;

      this.store = store;
      this._identityMap = void 0;
      this._newlyCreated = void 0;
      this.identifierCache = void 0;
      this.identifierCache = identifierCacheFor(store);

      this.identifierCache.__configureMerge(function (identifier, matchedIdentifier, resourceData) {
        var intendedIdentifier = identifier.id === resourceData.id ? identifier : matchedIdentifier;
        var altIdentifier = identifier.id === resourceData.id ? matchedIdentifier : identifier; // check for duplicate InternalModel's

        var map = _this.modelMapFor(identifier.type);

        var im = map.get(intendedIdentifier.lid);
        var otherIm = map.get(altIdentifier.lid); // we cannot merge internalModels when both have records
        // (this may not be strictly true, we could probably swap the internalModel the record points at)

        if (im && otherIm && im.hasRecord && otherIm.hasRecord) {
          throw new Error("Failed to update the 'id' for the RecordIdentifier '" + identifier + "' to '" + resourceData.id + "', because that id is already in use by '" + matchedIdentifier + "'");
        } // remove otherIm from cache


        if (otherIm) {
          map.remove(otherIm, altIdentifier.lid);
        }

        if (im === null && otherIm === null) {
          // nothing more to do
          return intendedIdentifier; // only the other has an InternalModel
          // OR only the other has a Record
        } else if (im === null && otherIm !== null || im && !im.hasRecord && otherIm && otherIm.hasRecord) {
          if (im) {
            // TODO check if we are retained in any async relationships
            map.remove(im, intendedIdentifier.lid); // im.destroy();
          }

          im = otherIm; // TODO do we need to notify the id change?

          im._id = intendedIdentifier.id;
          map.add(im, intendedIdentifier.lid); // just use im
        }

        return intendedIdentifier;
      });

      this._identityMap = new IdentityMap();

      if (!canaryFeatures.IDENTIFIERS) {
        this._newlyCreated = new IdentityMap();
      }
    }
    /**
     * Retrieve the InternalModel for a given { type, id, lid }.
     *
     * If an InternalModel does not exist, it instantiates one.
     *
     * If an InternalModel does exist bus has a scheduled destroy,
     *   the scheduled destroy will be cancelled.
     *
     * @internal
     */


    var _proto = InternalModelFactory.prototype;

    _proto.lookup = function lookup(resource, data) {
      if (canaryFeatures.IDENTIFIERS && data !== undefined) {
        // if we've been given data associated with this lookup
        // we must first give secondary-caches for LIDs the
        // opportunity to populate based on it
        this.identifierCache.getOrCreateRecordIdentifier(data);
      }

      var identifier = this.identifierCache.getOrCreateRecordIdentifier(resource);
      var internalModel = this.peek(identifier);

      if (internalModel) {
        // unloadRecord is async, if one attempts to unload + then sync push,
        //   we must ensure the unload is canceled before continuing
        //   The createRecord path will take _existingInternalModelForId()
        //   which will call `destroySync` instead for this unload + then
        //   sync createRecord scenario. Once we have true client-side
        //   delete signaling, we should never call destroySync
        if (internalModel.hasScheduledDestroy()) {
          internalModel.cancelDestroy();
        }

        return internalModel;
      }

      return this._build(identifier, false);
    }
    /**
     * Peek the InternalModel for a given { type, id, lid }.
     *
     * If an InternalModel does not exist, return `null`.
     *
     * @internal
     */
    ;

    _proto.peek = function peek(identifier) {
      if (canaryFeatures.IDENTIFIERS) {
        return this.modelMapFor(identifier.type).get(identifier.lid);
      } else {
        var internalModel = null;
        internalModel = this._newlyCreatedModelsFor(identifier.type).get(identifier.lid);

        if (!internalModel && identifier.id) {
          internalModel = this.modelMapFor(identifier.type).get(identifier.id);
        }

        return internalModel;
      }
    };

    _proto.getByResource = function getByResource(resource) {
      if (canaryFeatures.IDENTIFIERS) {
        var normalizedResource = constructResource(resource.type, resource.id, resource.lid);
        return this.lookup(normalizedResource);
      } else {
        var res = resource;
        var internalModel = null;

        if (res.clientId) {
          internalModel = this._newlyCreatedModelsFor(resource.type).get(res.clientId);
        }

        if (internalModel === null) {
          internalModel = this.lookup(resource);
        }

        return internalModel;
      }
    };

    _proto.setRecordId = function setRecordId(type, id, lid) {
      var resource = {
        type: type,
        id: null,
        lid: lid
      };
      var identifier = this.identifierCache.getOrCreateRecordIdentifier(resource);
      var internalModel = this.peek(identifier);

      if (internalModel === null) {
        throw new Error("Cannot set the id " + id + " on the record " + type + ":" + lid + " as there is no such record in the cache.");
      }

      var oldId = internalModel.id;
      var modelName = internalModel.modelName; // ID absolutely can't be missing if the oldID is empty (missing Id in response for a new record)
      // however, this is more than likely a developer error.

      if (oldId !== null && id === null) {
        return;
      }

      var existingInternalModel = this.peekById(modelName, id);

      if (!canaryFeatures.IDENTIFIERS) {
        this.modelMapFor(type).set(id, internalModel);

        this._newlyCreatedModelsFor(type).remove(internalModel, lid);
      }

      if (identifier.id === null) {
        this.identifierCache.updateRecordIdentifier(identifier, {
          type: type,
          id: id
        });
      }

      internalModel.setId(id);
    };

    _proto.peekById = function peekById(type, id) {
      var identifier = this.identifierCache.peekRecordIdentifier({
        type: type,
        id: id
      });
      var internalModel;

      if (canaryFeatures.IDENTIFIERS) {
        internalModel = identifier ? this.modelMapFor(type).get(identifier.lid) : null;
      } else {
        internalModel = this.modelMapFor(type).get(id);
      }

      if (internalModel && internalModel.hasScheduledDestroy()) {
        // unloadRecord is async, if one attempts to unload + then sync create,
        //   we must ensure the unload is complete before starting the create
        //   The push path will take this.lookup()
        //   which will call `cancelDestroy` instead for this unload + then
        //   sync push scenario. Once we have true client-side
        //   delete signaling, we should never call destroySync
        internalModel.destroySync();
        internalModel = null;
      }

      return internalModel;
    };

    _proto.build = function build(newResourceInfo) {
      return this._build(newResourceInfo, true);
    };

    _proto._build = function _build(resource, isCreate) {
      if (isCreate === void 0) {
        isCreate = false;
      }

      if (isCreate === true && resource.id) {
        var existingInternalModel = this.peekById(resource.type, resource.id);
      }

      var identifierCache = this.identifierCache;
      var identifier;

      if (isCreate === true) {
        identifier = identifierCache.createIdentifierForNewRecord(resource);
      } else {
        identifier = resource;
      } // lookupFactory should really return an object that creates
      // instances with the injections applied


      var internalModel = new InternalModel(this.store, identifier);

      if (canaryFeatures.IDENTIFIERS) {
        this.modelMapFor(resource.type).add(internalModel, identifier.lid);
      } else {
        if (isCreate === true) {
          this._newlyCreatedModelsFor(identifier.type).add(internalModel, identifier.lid);
        } // TODO @runspired really?!


        this.modelMapFor(resource.type).add(internalModel, identifier.id);
      }

      return internalModel;
    };

    _proto.remove = function remove(internalModel) {
      var recordMap = this.modelMapFor(internalModel.modelName);
      var clientId = internalModel.identifier.lid;

      if (canaryFeatures.IDENTIFIERS) {
        recordMap.remove(internalModel, clientId);
      } else {
        if (internalModel.id) {
          recordMap.remove(internalModel, internalModel.id);
        }

        this._newlyCreatedModelsFor(internalModel.modelName).remove(internalModel, clientId);
      }

      var identifier = internalModel.identifier;
      this.identifierCache.forgetRecordIdentifier(identifier);
    };

    _proto.modelMapFor = function modelMapFor(type) {
      return this._identityMap.retrieve(type);
    };

    _proto._newlyCreatedModelsFor = function _newlyCreatedModelsFor(type) {
      return this._newlyCreated.retrieve(type);
    };

    _proto.clear = function clear(type) {
      if (type === undefined) {
        this._identityMap.clear();
      } else {
        this.modelMapFor(type).clear();
      }
    };

    return InternalModelFactory;
  }();

  function _defineProperties$4(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$4(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$4(Constructor.prototype, protoProps); if (staticProps) _defineProperties$4(Constructor, staticProps); return Constructor; }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  /**
    @module @ember-data/store
  */
  // move to TS hacks module that we can delete when this is no longer a necessary recast

  // TODO this should be integrated with the code removal so we can use it together with the if condition
  // and not alongside it
  function isNotCustomModelClass(store) {
    return !canaryFeatures.CUSTOM_MODEL_CLASS;
  }

  /*
    The TransitionChainMap caches the `state.enters`, `state.setups`, and final state reached
    when transitioning from one state to another, so that future transitions can replay the
    transition without needing to walk the state tree, collect these hook calls and determine
     the state to transition into.

     A future optimization would be to build a single chained method out of the collected enters
     and setups. It may also be faster to do a two level cache (from: { to }) instead of caching based
     on a key that adds the two together.
   */
  var TransitionChainMap = Object.create(null);

  var _extractPivotNameCache = Object.create(null);

  var _splitOnDotCache = Object.create(null);

  function splitOnDot(name) {
    return _splitOnDotCache[name] || (_splitOnDotCache[name] = name.split('.'));
  }

  function extractPivotName(name) {
    return _extractPivotNameCache[name] || (_extractPivotNameCache[name] = splitOnDot(name)[0]);
  }
  /*
    `InternalModel` is the Model class that we use internally inside Ember Data to represent models.
    Internal ED methods should only deal with `InternalModel` objects. It is a fast, plain Javascript class.

    We expose `Model` to application code, by materializing a `Model` from `InternalModel` lazily, as
    a performance optimization.

    `InternalModel` should never be exposed to application code. At the boundaries of the system, in places
    like `find`, `push`, etc. we convert between Models and InternalModels.

    We need to make sure that the properties from `InternalModel` are correctly exposed/proxied on `Model`
    if they are needed.

    @private
    @class InternalModel
  */


  var InternalModel =
  /*#__PURE__*/
  function () {
    // Not typed yet
    // The previous ManyArrays for this relationship which will be destroyed when
    // we create a new ManyArray, but in the interim the retained version will be
    // updated if inverse internal models are unloaded.
    function InternalModel(store, identifier) {
      this.store = store;
      this.identifier = identifier;
      this._id = void 0;
      this.modelName = void 0;
      this.clientId = void 0;
      this.__recordData = void 0;
      this._isDestroyed = void 0;
      this.isError = void 0;
      this._pendingRecordArrayManagerFlush = void 0;
      this._isDematerializing = void 0;
      this.isReloading = void 0;
      this._doNotDestroy = void 0;
      this.isDestroying = void 0;
      this._promiseProxy = void 0;
      this._record = void 0;
      this._scheduledDestroy = void 0;
      this._modelClass = void 0;
      this.__deferredTriggers = void 0;
      this.__recordArrays = void 0;
      this._references = void 0;
      this._recordReference = void 0;
      this._manyArrayCache = Object.create(null);
      this._retainedManyArrayCache = Object.create(null);
      this._relationshipPromisesCache = Object.create(null);
      this._relationshipProxyCache = Object.create(null);
      this.currentState = void 0;
      this.error = void 0;
      this._id = identifier.id;
      this.modelName = identifier.type;
      this.clientId = identifier.lid;
      this.__recordData = null; // this ensure ordered set can quickly identify this as unique

      this[Ember.GUID_KEY] = identifier.lid;
      this._promiseProxy = null;
      this._record = null;
      this._isDestroyed = false;
      this.isError = false;
      this._pendingRecordArrayManagerFlush = false; // used by the recordArrayManager
      // During dematerialization we don't want to rematerialize the record.  The
      // reason this might happen is that dematerialization removes records from
      // record arrays,  and Ember arrays will always `objectAt(0)` and
      // `objectAt(len - 1)` to test whether or not `firstObject` or `lastObject`
      // have changed.

      this._isDematerializing = false;
      this._scheduledDestroy = null;
      this.resetRecord(); // caches for lazy getters

      this._modelClass = null;
      this.__deferredTriggers = null;
      this.__recordArrays = null;
      this._references = null;
      this._recordReference = null;
    }

    var _proto = InternalModel.prototype;

    _proto.isHiddenFromRecordArrays = function isHiddenFromRecordArrays() {
      // During dematerialization we don't want to rematerialize the record.
      // recordWasDeleted can cause other records to rematerialize because it
      // removes the internal model from the array and Ember arrays will always
      // `objectAt(0)` and `objectAt(len -1)` to check whether `firstObject` or
      // `lastObject` have changed.  When this happens we don't want those
      // models to rematerialize their records.
      // eager checks to avoid instantiating record data if we are empty or loading
      if (this.isEmpty()) {
        return true;
      }

      if (canaryFeatures.RECORD_DATA_STATE) {
        if (this.isLoading()) {
          return false;
        }
      }

      var isRecordFullyDeleted;

      if (canaryFeatures.RECORD_DATA_STATE) {
        isRecordFullyDeleted = this._isRecordFullyDeleted();
      } else {
        isRecordFullyDeleted = this.currentState.stateName === 'root.deleted.saved';
      }

      return this._isDematerializing || this.hasScheduledDestroy() || this.isDestroyed || isRecordFullyDeleted;
    };

    _proto._isRecordFullyDeleted = function _isRecordFullyDeleted() {
      if (canaryFeatures.RECORD_DATA_STATE) {
        if (this._recordData.isDeletionCommitted && this._recordData.isDeletionCommitted()) {
          return true;
        } else if (this._recordData.isNew && this._recordData.isDeleted && this._recordData.isNew() && this._recordData.isDeleted()) {
          return true;
        } else {
          return this.currentState.stateName === 'root.deleted.saved';
        }
      } else {
        // assert here
        return false;
      }
    };

    _proto.isRecordInUse = function isRecordInUse() {
      var record = this._record;
      return record && !(record.get('isDestroyed') || record.get('isDestroying'));
    };

    _proto.isEmpty = function isEmpty() {
      return this.currentState.isEmpty;
    };

    _proto.isLoading = function isLoading() {
      return this.currentState.isLoading;
    };

    _proto.isLoaded = function isLoaded() {
      return this.currentState.isLoaded;
    };

    _proto.hasDirtyAttributes = function hasDirtyAttributes() {
      return this.currentState.hasDirtyAttributes;
    };

    _proto.isSaving = function isSaving() {
      return this.currentState.isSaving;
    };

    _proto.isDeleted = function isDeleted() {
      if (canaryFeatures.RECORD_DATA_STATE) {
        if (this._recordData.isDeleted) {
          return this._recordData.isDeleted();
        } else {
          return this.currentState.isDeleted;
        }
      } else {
        return this.currentState.isDeleted;
      }
    };

    _proto.isNew = function isNew() {
      if (canaryFeatures.RECORD_DATA_STATE) {
        if (this._recordData.isNew) {
          return this._recordData.isNew();
        } else {
          return this.currentState.isNew;
        }
      } else {
        return this.currentState.isNew;
      }
    };

    _proto.isValid = function isValid() {
      if (!canaryFeatures.RECORD_DATA_ERRORS) {
        return this.currentState.isValid;
      }
    };

    _proto.dirtyType = function dirtyType() {
      return this.currentState.dirtyType;
    };

    _proto.getRecord = function getRecord(properties) {
      if (!this._record && !this._isDematerializing) {
        var _store = this.store;

        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this._record = _store._instantiateRecord(this, this.modelName, this._recordData, this.identifier, properties);
        } else {
          if (isNotCustomModelClass()) {
            // lookupFactory should really return an object that creates
            // instances with the injections applied
            var createOptions = {
              store: _store,
              _internalModel: this,
              currentState: this.currentState
            };

            if (!canaryFeatures.REQUEST_SERVICE) {
              createOptions.isError = this.isError;
              createOptions.adapterError = this.error;
            }

            if (properties !== undefined) {

              if ('id' in properties) {
                var id = coerceId(properties.id);

                if (id !== null) {
                  this.setId(id);
                }
              } // convert relationship Records to RecordDatas before passing to RecordData


              var defs = _store._relationshipsDefinitionFor(this.modelName);

              if (defs !== null) {
                var keys = Object.keys(properties);
                var relationshipValue;

                for (var i = 0; i < keys.length; i++) {
                  var prop = keys[i];
                  var def = defs[prop];

                  if (def !== undefined) {
                    if (def.kind === 'hasMany') {

                      relationshipValue = extractRecordDatasFromRecords(properties[prop]);
                    } else {
                      relationshipValue = extractRecordDataFromRecord(properties[prop]);
                    }

                    properties[prop] = relationshipValue;
                  }
                }
              }
            }

            var additionalCreateOptions = this._recordData._initRecordCreateOptions(properties);

            Ember.assign(createOptions, additionalCreateOptions); // ensure that `getOwner(this)` works inside a model instance

            Ember.setOwner(createOptions, Ember.getOwner(_store));
            this._record = _store._modelFactoryFor(this.modelName).create(createOptions);
            setRecordIdentifier(this._record, this.identifier);
          }
        }

        this._triggerDeferredTriggers();
      }

      return this._record;
    };

    _proto.resetRecord = function resetRecord() {
      this._record = null;
      this.isReloading = false;
      this.error = null;
      this.currentState = RootState$1.empty;
    };

    _proto.dematerializeRecord = function dematerializeRecord() {
      var _this = this;

      this._isDematerializing = true; // TODO IGOR add a test that fails when this is missing, something that involves canceliing a destroy
      // and the destroy not happening, and then later on trying to destroy

      this._doNotDestroy = false;

      if (this._record) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store.teardownRecord(this._record);
        } else {
          this._record.destroy();
        }

        Object.keys(this._relationshipProxyCache).forEach(function (key) {
          if (_this._relationshipProxyCache[key].destroy) {
            _this._relationshipProxyCache[key].destroy();
          }

          delete _this._relationshipProxyCache[key];
        });
        Object.keys(this._manyArrayCache).forEach(function (key) {
          var manyArray = _this._retainedManyArrayCache[key] = _this._manyArrayCache[key];
          delete _this._manyArrayCache[key];

          if (manyArray && !manyArray._inverseIsAsync) {
            /*
              If the manyArray is for a sync relationship, we should clear it
                to preserve the semantics of client-side delete.
               It is likely in this case instead of retaining we should destroy
                - @runspired
            */
            manyArray.clear();
          }
        });
      } // move to an empty never-loaded state


      this._recordData.unloadRecord();

      this.resetRecord();
      this.updateRecordArrays();
    };

    _proto.deleteRecord = function deleteRecord() {
      if (canaryFeatures.RECORD_DATA_STATE) {
        if (this._recordData.setIsDeleted) {
          this._recordData.setIsDeleted(true);
        }
      }

      this.send('deleteRecord');
    };

    _proto.save = function save(options) {
      var promiseLabel = 'DS: Model#save ' + this;
      var resolver = Ember.RSVP.defer(promiseLabel);

      if (canaryFeatures.REQUEST_SERVICE) {
        // Casting to narrow due to the feature flag paths inside scheduleSave
        return this.store.scheduleSave(this, resolver, options);
      } else {
        this.store.scheduleSave(this, resolver, options);
        return resolver.promise;
      }
    };

    _proto.startedReloading = function startedReloading() {
      this.isReloading = true;

      if (this.hasRecord) {
        Ember.set(this._record, 'isReloading', true);
      }
    };

    _proto.finishedReloading = function finishedReloading() {
      this.isReloading = false;

      if (this.hasRecord) {
        Ember.set(this._record, 'isReloading', false);
      }
    };

    _proto.reload = function reload(options) {
      if (canaryFeatures.REQUEST_SERVICE) {
        if (!options) {
          options = {};
        }

        this.startedReloading();
        var internalModel = this;
        return internalModel.store._reloadRecord(internalModel, options).then(function () {
          //TODO NOW seems like we shouldn't need to do this
          return internalModel;
        }, function (error) {
          throw error;
        }, 'DS: Model#reload complete, update flags').finally(function () {
          internalModel.finishedReloading();
          internalModel.updateRecordArrays();
        });
      } else {
        this.startedReloading();

        var _internalModel = this;

        var promiseLabel = 'DS: Model#reload of ' + this;
        return new Ember.RSVP.Promise(function (resolve) {
          _internalModel.send('reloadRecord', {
            resolve: resolve,
            options: options
          });
        }, promiseLabel).then(function () {
          _internalModel.didCleanError();

          return _internalModel;
        }, function (error) {
          _internalModel.didError(error);

          throw error;
        }, 'DS: Model#reload complete, update flags').finally(function () {
          _internalModel.finishedReloading();

          _internalModel.updateRecordArrays();
        });
      }
    }
    /*
      Unload the record for this internal model. This will cause the record to be
      destroyed and freed up for garbage collection. It will also do a check
      for cleaning up internal models.
       This check is performed by first computing the set of related internal
      models. If all records in this set are unloaded, then the entire set is
      destroyed. Otherwise, nothing in the set is destroyed.
       This means that this internal model will be freed up for garbage collection
      once all models that refer to it via some relationship are also unloaded.
    */
    ;

    _proto.unloadRecord = function unloadRecord() {
      if (this.isDestroyed) {
        return;
      }

      this.send('unloadRecord');
      this.dematerializeRecord();

      if (this._scheduledDestroy === null) {
        this._scheduledDestroy = Ember.run.backburner.schedule('destroy', this, '_checkForOrphanedInternalModels');
      }
    };

    _proto.hasScheduledDestroy = function hasScheduledDestroy() {
      return !!this._scheduledDestroy;
    };

    _proto.cancelDestroy = function cancelDestroy() {
      this._doNotDestroy = true;
      this._isDematerializing = false;
      Ember.run.cancel(this._scheduledDestroy);
      this._scheduledDestroy = null;
    } // typically, we prefer to async destroy this lets us batch cleanup work.
    // Unfortunately, some scenarios where that is not possible. Such as:
    //
    // ```js
    // const record = store.find(‘record’, 1);
    // record.unloadRecord();
    // store.createRecord(‘record’, 1);
    // ```
    //
    // In those scenarios, we make that model's cleanup work, sync.
    //
    ;

    _proto.destroySync = function destroySync() {
      if (this._isDematerializing) {
        this.cancelDestroy();
      }

      this._checkForOrphanedInternalModels();

      if (this.isDestroyed || this.isDestroying) {
        return;
      } // just in-case we are not one of the orphaned, we should still
      // still destroy ourselves


      this.destroy();
    };

    _proto._checkForOrphanedInternalModels = function _checkForOrphanedInternalModels() {
      this._isDematerializing = false;
      this._scheduledDestroy = null;

      if (this.isDestroyed) {
        return;
      }
    };

    _proto.eachRelationship = function eachRelationship(callback, binding) {
      return this.modelClass.eachRelationship(callback, binding);
    };

    _proto._findBelongsTo = function _findBelongsTo(key, resource, relationshipMeta, options) {
      var _this2 = this;

      // TODO @runspired follow up if parent isNew then we should not be attempting load here
      return this.store._findBelongsToByJsonApiResource(resource, this, relationshipMeta, options).then(function (internalModel) {
        return handleCompletedRelationshipRequest(_this2, key, resource._relationship, internalModel, null);
      }, function (e) {
        return handleCompletedRelationshipRequest(_this2, key, resource._relationship, null, e);
      });
    };

    _proto.getBelongsTo = function getBelongsTo(key, options) {
      var resource = this._recordData.getBelongsTo(key);

      var identifier = resource && resource.data ? identifierCacheFor(this.store).getOrCreateRecordIdentifier(resource.data) : null;

      var relationshipMeta = this.store._relationshipMetaFor(this.modelName, null, key);

      var store = this.store;
      var async = relationshipMeta.options.async;
      var isAsync = typeof async === 'undefined' ? true : async;
      var _belongsToState = {
        key: key,
        store: store,
        originatingInternalModel: this,
        modelName: relationshipMeta.type
      };

      if (isAsync) {
        var internalModel = identifier !== null ? store._internalModelForResource(identifier) : null;

        if (resource._relationship.hasFailedLoadAttempt) {
          return this._relationshipProxyCache[key];
        }

        var promise = this._findBelongsTo(key, resource, relationshipMeta, options);

        return this._updatePromiseProxyFor('belongsTo', key, {
          promise: promise,
          content: internalModel ? internalModel.getRecord() : null,
          _belongsToState: _belongsToState
        });
      } else {
        if (identifier === null) {
          return null;
        } else {
          var _internalModel2 = store._internalModelForResource(identifier);

          var toReturn = _internalModel2.getRecord();
          return toReturn;
        }
      }
    } // TODO Igor consider getting rid of initial state
    ;

    _proto.getManyArray = function getManyArray(key, isAsync) {
      if (isAsync === void 0) {
        isAsync = false;
      }

      var relationshipMeta = this.store._relationshipMetaFor(this.modelName, null, key);

      var jsonApi = this._recordData.getHasMany(key);

      var manyArray = this._manyArrayCache[key];

      if (!manyArray) {
        var initialState = this.store._getHasManyByJsonApiResource(jsonApi); // TODO move this to a public api


        var inverseIsAsync = jsonApi._relationship ? jsonApi._relationship._inverseIsAsync() : false;
        manyArray = ManyArray.create({
          store: this.store,
          type: this.store.modelFor(relationshipMeta.type),
          recordData: this._recordData,
          meta: jsonApi.meta,
          key: key,
          isPolymorphic: relationshipMeta.options.polymorphic,
          initialState: initialState.slice(),
          _inverseIsAsync: inverseIsAsync,
          internalModel: this,
          isLoaded: !isAsync
        });
        this._manyArrayCache[key] = manyArray;
      }

      if (this._retainedManyArrayCache[key]) {
        this._retainedManyArrayCache[key].destroy();

        delete this._retainedManyArrayCache[key];
      }

      return manyArray;
    };

    _proto.fetchAsyncHasMany = function fetchAsyncHasMany(key, relationshipMeta, jsonApi, manyArray, options) {
      var _this3 = this;

      // TODO @runspired follow up if parent isNew then we should not be attempting load here
      var loadingPromise = this._relationshipPromisesCache[key];

      if (loadingPromise) {
        return loadingPromise;
      }

      loadingPromise = this.store._findHasManyByJsonApiResource(jsonApi, this, relationshipMeta, options).then(function (initialState) {
        // TODO why don't we do this in the store method
        manyArray.retrieveLatest();
        manyArray.set('isLoaded', true);
        return manyArray;
      }).then(function (manyArray) {
        return handleCompletedRelationshipRequest(_this3, key, jsonApi._relationship, manyArray, null);
      }, function (e) {
        return handleCompletedRelationshipRequest(_this3, key, jsonApi._relationship, null, e);
      });
      this._relationshipPromisesCache[key] = loadingPromise;
      return loadingPromise;
    };

    _proto.getHasMany = function getHasMany(key, options) {
      var jsonApi = this._recordData.getHasMany(key);

      var relationshipMeta = this.store._relationshipMetaFor(this.modelName, null, key);

      var async = relationshipMeta.options.async;
      var isAsync = typeof async === 'undefined' ? true : async;
      var manyArray = this.getManyArray(key, isAsync);

      if (isAsync) {
        if (jsonApi._relationship.hasFailedLoadAttempt) {
          return this._relationshipProxyCache[key];
        }

        var promise = this.fetchAsyncHasMany(key, relationshipMeta, jsonApi, manyArray, options);
        return this._updatePromiseProxyFor('hasMany', key, {
          promise: promise,
          content: manyArray
        });
      } else {
        return manyArray;
      }
    };

    _proto._updatePromiseProxyFor = function _updatePromiseProxyFor(kind, key, args) {
      var promiseProxy = this._relationshipProxyCache[key];

      if (promiseProxy) {
        if (args.content !== undefined) {
          // this usage of `any` can be removed when `@types/ember_object` proxy allows `null` for content
          promiseProxy.set('content', args.content);
        }

        promiseProxy.set('promise', args.promise);
      } else {
        var klass = kind === 'hasMany' ? PromiseManyArray : PromiseBelongsTo; // this usage of `any` can be removed when `@types/ember_object` proxy allows `null` for content

        this._relationshipProxyCache[key] = klass.create(args);
      }

      return this._relationshipProxyCache[key];
    };

    _proto.reloadHasMany = function reloadHasMany(key, options) {
      var loadingPromise = this._relationshipPromisesCache[key];

      if (loadingPromise) {
        return loadingPromise;
      }

      var jsonApi = this._recordData.getHasMany(key); // TODO move this to a public api


      if (jsonApi._relationship) {
        jsonApi._relationship.setHasFailedLoadAttempt(false);

        jsonApi._relationship.setShouldForceReload(true);
      }

      var relationshipMeta = this.store._relationshipMetaFor(this.modelName, null, key);

      var manyArray = this.getManyArray(key);
      var promise = this.fetchAsyncHasMany(key, relationshipMeta, jsonApi, manyArray, options);

      if (this._relationshipProxyCache[key]) {
        return this._updatePromiseProxyFor('hasMany', key, {
          promise: promise
        });
      }

      return promise;
    };

    _proto.reloadBelongsTo = function reloadBelongsTo(key, options) {
      var loadingPromise = this._relationshipPromisesCache[key];

      if (loadingPromise) {
        return loadingPromise;
      }

      var resource = this._recordData.getBelongsTo(key); // TODO move this to a public api


      if (resource._relationship) {
        resource._relationship.setHasFailedLoadAttempt(false);

        resource._relationship.setShouldForceReload(true);
      }

      var relationshipMeta = this.store._relationshipMetaFor(this.modelName, null, key);

      var promise = this._findBelongsTo(key, resource, relationshipMeta, options);

      if (this._relationshipProxyCache[key]) {
        return this._updatePromiseProxyFor('belongsTo', key, {
          promise: promise
        });
      }

      return promise;
    };

    _proto.destroyFromRecordData = function destroyFromRecordData() {
      if (this._doNotDestroy) {
        this._doNotDestroy = false;
        return;
      }

      this.destroy();
    };

    _proto.destroy = function destroy() {
      var _this4 = this;
      this.isDestroying = true;
      Object.keys(this._retainedManyArrayCache).forEach(function (key) {
        _this4._retainedManyArrayCache[key].destroy();

        delete _this4._retainedManyArrayCache[key];
      });
      internalModelFactoryFor(this.store).remove(this);
      this._isDestroyed = true;
    };

    _proto.eachAttribute = function eachAttribute(callback, binding) {
      return this.modelClass.eachAttribute(callback, binding);
    };

    _proto.inverseFor = function inverseFor(key) {
      return this.modelClass.inverseFor(key);
    };

    _proto.setupData = function setupData(data) {
      var changedKeys = this._recordData.pushData(data, this.hasRecord);

      if (this.hasRecord) {
        this._record._notifyProperties(changedKeys);
      }

      this.pushedData();
    };

    _proto.getAttributeValue = function getAttributeValue(key) {
      return this._recordData.getAttr(key);
    };

    _proto.setDirtyHasMany = function setDirtyHasMany(key, records) {
      return this._recordData.setDirtyHasMany(key, extractRecordDatasFromRecords(records));
    };

    _proto.setDirtyBelongsTo = function setDirtyBelongsTo(key, value) {
      return this._recordData.setDirtyBelongsTo(key, extractRecordDataFromRecord(value));
    };

    _proto.setDirtyAttribute = function setDirtyAttribute(key, value) {
      if (this.isDeleted()) {
        throw new Ember.Error("Attempted to set '" + key + "' to '" + value + "' on the deleted record " + this);
      }

      var currentValue = this.getAttributeValue(key);

      if (currentValue !== value) {
        this._recordData.setDirtyAttribute(key, value);

        var isDirty = this._recordData.isAttrDirty(key);

        this.send('didSetProperty', {
          name: key,
          isDirty: isDirty
        });
      }

      return value;
    };

    /*
      @method createSnapshot
      @private
    */
    _proto.createSnapshot = function createSnapshot(options) {
      return new Snapshot(options || {}, this.identifier, this.store);
    }
    /*
      @method loadingData
      @private
      @param {Promise} promise
    */
    ;

    _proto.loadingData = function loadingData(promise) {
      if (canaryFeatures.REQUEST_SERVICE) {
        this.send('loadingData');
      } else {
        this.send('loadingData', promise);
      }
    }
    /*
      @method loadedData
      @private
    */
    ;

    _proto.loadedData = function loadedData() {
      this.send('loadedData');
    }
    /*
      @method notFound
      @private
    */
    ;

    _proto.notFound = function notFound() {
      this.send('notFound');
    }
    /*
      @method pushedData
      @private
    */
    ;

    _proto.pushedData = function pushedData() {
      this.send('pushedData');
    };

    _proto.hasChangedAttributes = function hasChangedAttributes() {
      if (canaryFeatures.REQUEST_SERVICE) {
        if (!this.__recordData) {
          // no need to calculate changed attributes when calling `findRecord`
          return false;
        }
      } else {
        if (this.isLoading() && !this.isReloading) {
          // no need to calculate changed attributes when calling `findRecord`
          return false;
        }
      }

      return this._recordData.hasChangedAttributes();
    }
    /*
      Returns an object, whose keys are changed properties, and value is an
      [oldProp, newProp] array.
       @method changedAttributes
      @private
    */
    ;

    _proto.changedAttributes = function changedAttributes() {
      if (canaryFeatures.REQUEST_SERVICE) {
        if (!this.__recordData) {
          // no need to calculate changed attributes when calling `findRecord`
          return {};
        }
      } else {
        if (this.isLoading() && !this.isReloading) {
          // no need to calculate changed attributes when calling `findRecord`
          return {};
        }
      }

      return this._recordData.changedAttributes();
    }
    /*
      @method adapterWillCommit
      @private
    */
    ;

    _proto.adapterWillCommit = function adapterWillCommit() {
      this._recordData.willCommit();

      this.send('willCommit');
    }
    /*
      @method adapterDidDirty
      @private
    */
    ;

    _proto.adapterDidDirty = function adapterDidDirty() {
      this.send('becomeDirty');
      this.updateRecordArrays();
    }
    /*
      @method send
      @private
      @param {String} name
      @param {Object} context
    */
    ;

    _proto.send = function send(name, context) {
      var currentState = this.currentState;

      if (!currentState[name]) {
        this._unhandledEvent(currentState, name, context);
      }

      return currentState[name](this, context);
    };

    _proto.manyArrayRecordAdded = function manyArrayRecordAdded(key) {
      if (this.hasRecord) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store._notificationManager.notify(this.identifier, 'relationships');
        } else {
          this._record.notifyHasManyAdded(key);
        }
      }
    };

    _proto.notifyHasManyChange = function notifyHasManyChange(key) {
      if (this.hasRecord) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store._notificationManager.notify(this.identifier, 'relationships');
        } else {
          var manyArray = this._manyArrayCache[key];

          if (manyArray) {
            // TODO: this will "resurrect" previously unloaded records
            // see test '1:many async unload many side'
            //  in `tests/integration/records/unload-test.js`
            //  probably we don't want to retrieve latest eagerly when notifyhasmany changed
            //  but rather lazily when someone actually asks for a manyarray
            //
            //  that said, also not clear why we haven't moved this to retainedmanyarray so maybe that's the bit that's just not workign
            manyArray.retrieveLatest();
          }
        }

        this.updateRecordArrays();
      }
    };

    _proto.notifyBelongsToChange = function notifyBelongsToChange(key) {
      if (this.hasRecord) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store._notificationManager.notify(this.identifier, 'relationships');
        } else {
          this._record.notifyBelongsToChange(key, this._record);
        }

        this.updateRecordArrays();
      }
    };

    _proto.hasManyRemovalCheck = function hasManyRemovalCheck(key) {
      var manyArray = this._manyArrayCache[key] || this._retainedManyArrayCache[key];
      var didRemoveUnloadedModel = false;

      if (manyArray) {
        didRemoveUnloadedModel = manyArray.removeUnloadedInternalModel();

        if (this._manyArrayCache[key] && didRemoveUnloadedModel) {
          this._retainedManyArrayCache[key] = this._manyArrayCache[key];
          delete this._manyArrayCache[key];
        }
      }

      return didRemoveUnloadedModel;
    };

    _proto.notifyPropertyChange = function notifyPropertyChange(key) {
      if (this.hasRecord) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store._notificationManager.notify(this.identifier, 'property');
        } else {
          this._record.notifyPropertyChange(key);
        }

        this.updateRecordArrays();
      }

      if (!canaryFeatures.CUSTOM_MODEL_CLASS) {
        var manyArray = this._manyArrayCache[key] || this._retainedManyArrayCache[key];

        if (manyArray) {
          var didRemoveUnloadedModel = manyArray.removeUnloadedInternalModel();

          if (this._manyArrayCache[key] && didRemoveUnloadedModel) {
            this._retainedManyArrayCache[key] = this._manyArrayCache[key];
            delete this._manyArrayCache[key];
          }
        }
      }
    };

    _proto.notifyStateChange = function notifyStateChange(key) {

      if (this.hasRecord) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store._notificationManager.notify(this.identifier, 'state');
        } else {
          if (!key || key === 'isNew') {
            this.getRecord().notifyPropertyChange('isNew');
          }

          if (!key || key === 'isDeleted') {
            this.getRecord().notifyPropertyChange('isDeleted');
          }
        }
      }

      if (!key || key === 'isDeletionCommitted') {
        this.updateRecordArrays();
      }
    };

    _proto.didCreateRecord = function didCreateRecord() {
      this._recordData.clientDidCreate();
    };

    _proto.rollbackAttributes = function rollbackAttributes() {
      var dirtyKeys = this._recordData.rollbackAttributes();

      if (Ember.get(this, 'isError')) {
        this.didCleanError();
      }

      this.send('rolledBack');

      if (this._record && dirtyKeys && dirtyKeys.length > 0) {
        this._record._notifyProperties(dirtyKeys);
      }
    }
    /*
      @method transitionTo
      @private
      @param {String} name
    */
    ;

    _proto.transitionTo = function transitionTo(name) {
      // POSSIBLE TODO: Remove this code and replace with
      // always having direct reference to state objects
      var pivotName = extractPivotName(name);
      var state = this.currentState;
      var transitionMapId = state.stateName + "->" + name;

      do {
        if (state.exit) {
          state.exit(this);
        }

        state = state.parentState;
      } while (!state[pivotName]);

      var setups;
      var enters;
      var i;
      var l;
      var map = TransitionChainMap[transitionMapId];

      if (map) {
        setups = map.setups;
        enters = map.enters;
        state = map.state;
      } else {
        setups = [];
        enters = [];
        var path = splitOnDot(name);

        for (i = 0, l = path.length; i < l; i++) {
          state = state[path[i]];

          if (state.enter) {
            enters.push(state);
          }

          if (state.setup) {
            setups.push(state);
          }
        }

        TransitionChainMap[transitionMapId] = {
          setups: setups,
          enters: enters,
          state: state
        };
      }

      for (i = 0, l = enters.length; i < l; i++) {
        enters[i].enter(this);
      }

      this.currentState = state;

      if (this.hasRecord) {
        Ember.set(this._record, 'currentState', state);
      }

      for (i = 0, l = setups.length; i < l; i++) {
        setups[i].setup(this);
      }

      this.updateRecordArrays();
    };

    _proto._unhandledEvent = function _unhandledEvent(state, name, context) {
      var errorMessage = 'Attempted to handle event `' + name + '` ';
      errorMessage += 'on ' + String(this) + ' while in state ';
      errorMessage += state.stateName + '. ';

      if (context !== undefined) {
        errorMessage += 'Called with ' + Ember.inspect(context) + '.';
      }

      throw new Ember.Error(errorMessage);
    };

    _proto.triggerLater = function triggerLater() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (this._deferredTriggers.push(args) !== 1) {
        return;
      }

      this.store._updateInternalModel(this);
    };

    _proto._triggerDeferredTriggers = function _triggerDeferredTriggers() {
      //TODO: Before 1.0 we want to remove all the events that happen on the pre materialized record,
      //but for now, we queue up all the events triggered before the record was materialized, and flush
      //them once we have the record
      if (!this.hasRecord) {
        return;
      }

      var triggers = this._deferredTriggers;
      var record = this._record;
      var trigger = record.trigger; // TODO Igor make nicer check

      if (trigger) {
        for (var i = 0, l = triggers.length; i < l; i++) {
          var eventName = triggers[i];
          trigger.apply(record, eventName);
        }
      }

      triggers.length = 0;
    };

    _proto.removeFromInverseRelationships = function removeFromInverseRelationships(isNew) {
      if (isNew === void 0) {
        isNew = false;
      }

      this._recordData.removeFromInverseRelationships(isNew);
    }
    /*
      When a find request is triggered on the store, the user can optionally pass in
      attributes and relationships to be preloaded. These are meant to behave as if they
      came back from the server, except the user obtained them out of band and is informing
      the store of their existence. The most common use case is for supporting client side
      nested URLs, such as `/posts/1/comments/2` so the user can do
      `store.findRecord('comment', 2, { preload: { post: 1 } })` without having to fetch the post.
       Preloaded data can be attributes and relationships passed in either as IDs or as actual
      models.
       @method preloadData
      @private
      @param {Object} preload
    */
    ;

    _proto.preloadData = function preloadData(preload) {
      var _this5 = this;

      var jsonPayload = {}; //TODO(Igor) consider the polymorphic case

      Object.keys(preload).forEach(function (key) {
        var preloadValue = Ember.get(preload, key);

        var relationshipMeta = _this5.modelClass.metaForProperty(key);

        if (relationshipMeta.isRelationship) {
          if (!jsonPayload.relationships) {
            jsonPayload.relationships = {};
          }

          jsonPayload.relationships[key] = _this5._preloadRelationship(key, preloadValue);
        } else {
          if (!jsonPayload.attributes) {
            jsonPayload.attributes = {};
          }

          jsonPayload.attributes[key] = preloadValue;
        }
      });

      this._recordData.pushData(jsonPayload);
    };

    _proto._preloadRelationship = function _preloadRelationship(key, preloadValue) {
      var _this6 = this;

      var relationshipMeta = this.modelClass.metaForProperty(key);
      var modelClass = relationshipMeta.type;
      var data;

      if (relationshipMeta.kind === 'hasMany') {
        data = preloadValue.map(function (value) {
          return _this6._convertPreloadRelationshipToJSON(value, modelClass);
        });
      } else {
        data = this._convertPreloadRelationshipToJSON(preloadValue, modelClass);
      }

      return {
        data: data
      };
    };

    _proto._convertPreloadRelationshipToJSON = function _convertPreloadRelationshipToJSON(value, modelClass) {
      if (typeof value === 'string' || typeof value === 'number') {
        return {
          type: modelClass,
          id: value
        };
      }

      var internalModel;

      if (value._internalModel) {
        internalModel = value._internalModel;
      } else {
        internalModel = value;
      } // TODO IGOR DAVID assert if no id is present


      return {
        type: internalModel.modelName,
        id: internalModel.id
      };
    }
    /*
      Used to notify the store to update FilteredRecordArray membership.
       @method updateRecordArrays
      @private
    */
    ;

    _proto.updateRecordArrays = function updateRecordArrays() {
      // @ts-ignore: Store is untyped and typescript does not detect instance props set in `init`
      this.store.recordArrayManager.recordDidChange(this);
    };

    _proto.setId = function setId(id) {

      var didChange = id !== this._id;
      this._id = id;

      if (didChange && id !== null) {
        this.store.setRecordId(this.modelName, id, this.clientId);
      }

      if (didChange && this.hasRecord) {
        if (canaryFeatures.CUSTOM_MODEL_CLASS) {
          this.store._notificationManager.notify(this.identifier, 'identity');
        } else {
          this.notifyPropertyChange('id');
        }
      }
    };

    _proto.didError = function didError(error) {
      if (!canaryFeatures.REQUEST_SERVICE) {
        this.error = error;
        this.isError = true;

        if (this.hasRecord) {
          this._record.setProperties({
            isError: true,
            adapterError: error
          });
        }
      }
    };

    _proto.didCleanError = function didCleanError() {
      if (!canaryFeatures.REQUEST_SERVICE) {
        this.error = null;
        this.isError = false;

        if (this.hasRecord) {
          this._record.setProperties({
            isError: false,
            adapterError: null
          });
        }
      }
    }
    /*
      If the adapter did not return a hash in response to a commit,
      merge the changed attributes and relationships into the existing
      saved data.
       @method adapterDidCommit
    */
    ;

    _proto.adapterDidCommit = function adapterDidCommit(data) {
      this.didCleanError();

      var changedKeys = this._recordData.didCommit(data);

      this.send('didCommit');
      this.updateRecordArrays();

      if (!data) {
        return;
      }

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        this.store._notificationManager.notify(this.identifier, 'attributes');
      } else {
        this._record._notifyProperties(changedKeys);
      }
    };

    _proto.addErrorMessageToAttribute = function addErrorMessageToAttribute(attribute, message) {
      Ember.get(this.getRecord(), 'errors')._add(attribute, message);
    };

    _proto.removeErrorMessageFromAttribute = function removeErrorMessageFromAttribute(attribute) {
      Ember.get(this.getRecord(), 'errors')._remove(attribute);
    };

    _proto.clearErrorMessages = function clearErrorMessages() {
      Ember.get(this.getRecord(), 'errors')._clear();
    };

    _proto.hasErrors = function hasErrors() {
      if (canaryFeatures.RECORD_DATA_ERRORS) {
        if (this._recordData.getErrors) {
          return this._recordData.getErrors(canaryFeatures.IDENTIFIERS ? this.identifier : {}).length > 0;
        } else {
          var errors = Ember.get(this.getRecord(), 'errors');
          return errors.get('length') > 0;
        }
      } else {
        var _errors = Ember.get(this.getRecord(), 'errors');

        return _errors.get('length') > 0;
      }
    } // FOR USE DURING COMMIT PROCESS

    /*
      @method adapterDidInvalidate
      @private
    */
    ;

    _proto.adapterDidInvalidate = function adapterDidInvalidate(parsedErrors, error) {
      if (canaryFeatures.RECORD_DATA_ERRORS) {
        var attribute;

        if (error && parsedErrors) {
          if (!this._recordData.getErrors) {
            for (attribute in parsedErrors) {
              if (hasOwnProperty.call(parsedErrors, attribute)) {
                this.addErrorMessageToAttribute(attribute, parsedErrors[attribute]);
              }
            }
          }

          var jsonApiErrors = errorsHashToArray(parsedErrors);
          this.send('becameInvalid');

          if (jsonApiErrors.length === 0) {
            jsonApiErrors = [{
              title: 'Invalid Error',
              detail: '',
              source: {
                pointer: '/data'
              }
            }];
          }

          this._recordData.commitWasRejected(canaryFeatures.IDENTIFIERS ? this.identifier : {}, jsonApiErrors);
        } else {
          this.send('becameError');

          this._recordData.commitWasRejected(canaryFeatures.IDENTIFIERS ? this.identifier : {});
        }
      } else {
        var _attribute;

        for (_attribute in parsedErrors) {
          if (hasOwnProperty.call(parsedErrors, _attribute)) {
            this.addErrorMessageToAttribute(_attribute, parsedErrors[_attribute]);
          }
        }

        this.send('becameInvalid');

        this._recordData.commitWasRejected();
      }
    };

    _proto.notifyErrorsChange = function notifyErrorsChange() {
      var invalidErrors;

      if (this._recordData.getErrors) {
        invalidErrors = this._recordData.getErrors(canaryFeatures.IDENTIFIERS ? this.identifier : {}) || [];
      } else {
        return;
      }

      this.notifyInvalidErrorsChange(invalidErrors);
    };

    _proto.notifyInvalidErrorsChange = function notifyInvalidErrorsChange(jsonApiErrors) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        this.store._notificationManager.notify(this.identifier, 'errors');
      } else {
        this.getRecord().invalidErrorsChanged(jsonApiErrors);
      }
    }
    /*
      @method adapterDidError
      @private
    */
    ;

    _proto.adapterDidError = function adapterDidError(error) {
      this.send('becameError');
      this.didError(error);

      this._recordData.commitWasRejected();
    };

    _proto.toString = function toString() {
      return "<" + this.modelName + ":" + this.id + ">";
    };

    _proto.referenceFor = function referenceFor(kind, name) {
      var reference = this.references[name];

      if (!reference) {
        // TODO IGOR AND DAVID REFACTOR
        var relationship = relationshipStateFor(this, name);

        var relationshipKind = relationship.relationshipMeta.kind;

        if (relationshipKind === 'belongsTo') {
          reference = new BelongsToReference(this.store, this, relationship, name);
        } else if (relationshipKind === 'hasMany') {
          reference = new HasManyReference(this.store, this, relationship, name);
        }

        this.references[name] = reference;
      }

      return reference;
    };

    _createClass$4(InternalModel, [{
      key: "id",
      get: function get() {
        if (canaryFeatures.IDENTIFIERS) {
          return this.identifier.id; // || this._id;
        }

        return this._id;
      },
      set: function set(value) {
        if (canaryFeatures.IDENTIFIERS) {
          if (value !== this._id) {
            var newIdentifier = {
              type: this.identifier.type,
              lid: this.identifier.lid,
              id: value
            };
            identifierCacheFor(this.store).updateRecordIdentifier(this.identifier, newIdentifier); // TODO Show deprecation for private api
          }
        } else if (!canaryFeatures.IDENTIFIERS) {
          this._id = value;
        }
      }
    }, {
      key: "modelClass",
      get: function get() {
        if (this.store.modelFor) {
          return this._modelClass || (this._modelClass = this.store.modelFor(this.modelName));
        }
      }
    }, {
      key: "type",
      get: function get() {
        return this.modelClass;
      }
    }, {
      key: "recordReference",
      get: function get() {
        if (this._recordReference === null) {
          this._recordReference = new RecordReference(this.store, this);
        }

        return this._recordReference;
      }
    }, {
      key: "_recordData",
      get: function get() {
        if (this.__recordData === null) {
          var recordData = this.store._createRecordData(this.identifier);

          this._recordData = recordData;
          return recordData;
        }

        return this.__recordData;
      },
      set: function set(newValue) {
        this.__recordData = newValue;
      }
    }, {
      key: "_recordArrays",
      get: function get() {
        if (this.__recordArrays === null) {
          this.__recordArrays = new EmberDataOrderedSet();
        }

        return this.__recordArrays;
      }
    }, {
      key: "references",
      get: function get() {
        if (this._references === null) {
          this._references = Object.create(null);
        }

        return this._references;
      }
    }, {
      key: "_deferredTriggers",
      get: function get() {
        if (this.__deferredTriggers === null) {
          this.__deferredTriggers = [];
        }

        return this.__deferredTriggers;
      }
    }, {
      key: "isDestroyed",
      get: function get() {
        return this._isDestroyed;
      }
    }, {
      key: "hasRecord",
      get: function get() {
        return !!this._record;
      }
    }]);

    return InternalModel;
  }();

  function handleCompletedRelationshipRequest(internalModel, key, relationship, value, error) {
    delete internalModel._relationshipPromisesCache[key];
    relationship.setShouldForceReload(false);

    if (error) {
      relationship.setHasFailedLoadAttempt(true);
      var proxy = internalModel._relationshipProxyCache[key]; // belongsTo relationships are sometimes unloaded
      // when a load fails, in this case we need
      // to make sure that we aren't proxying
      // to destroyed content
      // for the sync belongsTo reload case there will be no proxy
      // for the async reload case there will be no proxy if the ui
      // has never been accessed

      if (proxy && relationship.kind === 'belongsTo') {
        if (proxy.content && proxy.content.isDestroying) {
          proxy.set('content', null);
        }
      }

      throw error;
    }

    relationship.setHasFailedLoadAttempt(false); // only set to not stale if no error is thrown

    relationship.setRelationshipIsStale(false);
    return value;
  }
  function extractRecordDatasFromRecords(records) {
    return records.map(extractRecordDataFromRecord);
  }
  function extractRecordDataFromRecord(recordOrPromiseRecord) {
    if (!recordOrPromiseRecord) {
      return null;
    }

    if (recordOrPromiseRecord.then) {
      var content = recordOrPromiseRecord.get && recordOrPromiseRecord.get('content');
      return content ? recordDataFor(content) : null;
    }

    return recordDataFor(recordOrPromiseRecord);
  }

  var changeProperties = Ember.changeProperties;

  function findPossibleInverses(type, inverseType, name, relationshipsSoFar) {
    var possibleRelationships = relationshipsSoFar || [];
    var relationshipMap = Ember.get(inverseType, 'relationships');

    if (!relationshipMap) {
      return possibleRelationships;
    }

    var relationshipsForType = relationshipMap.get(type.modelName);
    var relationships = Array.isArray(relationshipsForType) ? relationshipsForType.filter(function (relationship) {
      var optionsForRelationship = inverseType.metaForProperty(relationship.name).options;

      if (!optionsForRelationship.inverse && optionsForRelationship.inverse !== null) {
        return true;
      }

      return name === optionsForRelationship.inverse;
    }) : null;

    if (relationships) {
      possibleRelationships.push.apply(possibleRelationships, relationships);
    } //Recurse to support polymorphism


    if (type.superclass) {
      findPossibleInverses(type.superclass, inverseType, name, possibleRelationships);
    }

    return possibleRelationships;
  }

  var retrieveFromCurrentState = Ember.computed('currentState', function (key) {
    return Ember.get(this._internalModel.currentState, key);
  }).readOnly();
  var isValidRecordData = Ember.computed('errors.length', function (key) {
    return !(this.get('errors.length') > 0);
  }).readOnly();
  var isValid = canaryFeatures.RECORD_DATA_ERRORS ? isValidRecordData : retrieveFromCurrentState;
  var isDeletedCP;

  if (canaryFeatures.RECORD_DATA_STATE) {
    isDeletedCP = Ember.computed('currentState', function () {
      var rd = recordDataFor(this);

      if (rd.isDeleted) {
        return rd.isDeleted();
      } else {
        return Ember.get(this._internalModel.currentState, 'isDeleted');
      }
    }).readOnly();
  } else {
    isDeletedCP = retrieveFromCurrentState;
  }

  var isNewCP;

  if (canaryFeatures.RECORD_DATA_STATE) {
    isNewCP = Ember.computed('currentState', function () {
      var rd = recordDataFor(this);

      if (rd.isNew) {
        return rd.isNew();
      } else {
        return Ember.get(this._internalModel.currentState, 'isNew');
      }
    }).readOnly();
  } else {
    isNewCP = retrieveFromCurrentState;
  }

  var adapterError;

  if (canaryFeatures.REQUEST_SERVICE) {
    adapterError = Ember.computed(function () {
      var request = this._lastError;

      if (!request) {
        return null;
      }

      return request.state === 'rejected' && request.response.data;
    });
  } else {
    adapterError = null;
  }

  var isError;

  if (canaryFeatures.REQUEST_SERVICE) {
    isError = Ember.computed(function () {
      var errorReq = this._errorRequests[this._errorRequests.length - 1];

      if (!errorReq) {
        return false;
      } else {
        return true;
      }
    });
  } else {
    isError = false;
  }

  var isReloading;

  if (canaryFeatures.REQUEST_SERVICE) {
    isReloading = Ember.computed(function () {
      var requests = this.store.getRequestStateService().getPendingRequestsForRecord(recordIdentifierFor(this));
      return !!requests.find(function (req) {
        return req.request.data[0].options.isReloading;
      });
    });
  } else {
    isReloading = false;
  }
  /**
    @class Model
    @module @ember-data/model
    @extends EmberObject
    @uses EmberData.DeprecatedEvented
  */


  var Model = Ember.Object.extend(DeprecatedEvented, {
    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);

      if (canaryFeatures.RECORD_DATA_ERRORS) {
        this._invalidRequests = [];
      }

      if (canaryFeatures.REQUEST_SERVICE) {
        this.store.getRequestStateService().subscribeForRecord(this._internalModel.identifier, function (request) {
          if (request.state === 'rejected') {
            // TODO filter out queries
            _this._lastError = request;

            if (!(request.response && request.response.data instanceof error.InvalidError)) {
              _this._errorRequests.push(request);
            } else {
              _this._invalidRequests.push(request);
            }
          } else if (request.state === 'fulfilled') {
            _this._invalidRequests = [];
            _this._errorRequests = [];
            _this._lastError = null;
          }

          _this._notifyNetworkChanges();
        });
        this._errorRequests = [];
        this._lastError = null;
      }
    },
    _notifyNetworkChanges: function _notifyNetworkChanges() {
      var _this2 = this;

      if (canaryFeatures.REQUEST_SERVICE) {
        ['isSaving', 'isValid', 'isError', 'adapterError', 'isReloading'].forEach(function (key) {
          return _this2.notifyPropertyChange(key);
        });
      } else {
        ['isValid'].forEach(function (key) {
          return _this2.notifyPropertyChange(key);
        });
      }
    },

    /**
      If this property is `true` the record is in the `empty`
      state. Empty is the first state all records enter after they have
      been created. Most records created by the store will quickly
      transition to the `loading` state if data needs to be fetched from
      the server or the `created` state if the record is created on the
      client. A record can also enter the empty state if the adapter is
      unable to locate the record.
       @property isEmpty
      @type {Boolean}
      @readOnly
    */
    isEmpty: retrieveFromCurrentState,

    /**
      If this property is `true` the record is in the `loading` state. A
      record enters this state when the store asks the adapter for its
      data. It remains in this state until the adapter provides the
      requested data.
       @property isLoading
      @type {Boolean}
      @readOnly
    */
    isLoading: retrieveFromCurrentState,

    /**
      If this property is `true` the record is in the `loaded` state. A
      record enters this state when its data is populated. Most of a
      record's lifecycle is spent inside substates of the `loaded`
      state.
       Example
       ```javascript
      let record = store.createRecord('model');
      record.get('isLoaded'); // true
       store.findRecord('model', 1).then(function(model) {
        model.get('isLoaded'); // true
      });
      ```
       @property isLoaded
      @type {Boolean}
      @readOnly
    */
    isLoaded: retrieveFromCurrentState,

    /**
      If this property is `true` the record is in the `dirty` state. The
      record has local changes that have not yet been saved by the
      adapter. This includes records that have been created (but not yet
      saved) or deleted.
       Example
       ```javascript
      let record = store.createRecord('model');
      record.get('hasDirtyAttributes'); // true
       store.findRecord('model', 1).then(function(model) {
        model.get('hasDirtyAttributes'); // false
        model.set('foo', 'some value');
        model.get('hasDirtyAttributes'); // true
      });
      ```
       @since 1.13.0
      @property hasDirtyAttributes
      @type {Boolean}
      @readOnly
    */
    hasDirtyAttributes: Ember.computed('currentState.isDirty', function () {
      return this.get('currentState.isDirty');
    }),

    /**
      If this property is `true` the record is in the `saving` state. A
      record enters the saving state when `save` is called, but the
      adapter has not yet acknowledged that the changes have been
      persisted to the backend.
       Example
       ```javascript
      let record = store.createRecord('model');
      record.get('isSaving'); // false
      let promise = record.save();
      record.get('isSaving'); // true
      promise.then(function() {
        record.get('isSaving'); // false
      });
      ```
       @property isSaving
      @type {Boolean}
      @readOnly
    */
    isSaving: retrieveFromCurrentState,

    /**
      If this property is `true` the record is in the `deleted` state
      and has been marked for deletion. When `isDeleted` is true and
      `hasDirtyAttributes` is true, the record is deleted locally but the deletion
      was not yet persisted. When `isSaving` is true, the change is
      in-flight. When both `hasDirtyAttributes` and `isSaving` are false, the
      change has persisted.
       Example
       ```javascript
      let record = store.createRecord('model');
      record.get('isDeleted');    // false
      record.deleteRecord();
       // Locally deleted
      record.get('isDeleted');           // true
      record.get('hasDirtyAttributes');  // true
      record.get('isSaving');            // false
       // Persisting the deletion
      let promise = record.save();
      record.get('isDeleted');    // true
      record.get('isSaving');     // true
       // Deletion Persisted
      promise.then(function() {
        record.get('isDeleted');          // true
        record.get('isSaving');           // false
        record.get('hasDirtyAttributes'); // false
      });
      ```
       @property isDeleted
      @type {Boolean}
      @readOnly
    */
    isDeleted: isDeletedCP,

    /**
      If this property is `true` the record is in the `new` state. A
      record will be in the `new` state when it has been created on the
      client and the adapter has not yet report that it was successfully
      saved.
       Example
       ```javascript
      let record = store.createRecord('model');
      record.get('isNew'); // true
       record.save().then(function(model) {
        model.get('isNew'); // false
      });
      ```
       @property isNew
      @type {Boolean}
      @readOnly
    */
    isNew: isNewCP,

    /**
      If this property is `true` the record is in the `valid` state.
       A record will be in the `valid` state when the adapter did not report any
      server-side validation failures.
       @property isValid
      @type {Boolean}
      @readOnly
    */
    isValid: isValid,
    _markInvalidRequestAsClean: function _markInvalidRequestAsClean() {
      if (canaryFeatures.RECORD_DATA_ERRORS) {
        this._invalidRequests = [];

        this._notifyNetworkChanges();
      }
    },

    /**
      If the record is in the dirty state this property will report what
      kind of change has caused it to move into the dirty
      state. Possible values are:
       - `created` The record has been created by the client and not yet saved to the adapter.
      - `updated` The record has been updated by the client and not yet saved to the adapter.
      - `deleted` The record has been deleted by the client and not yet saved to the adapter.
       Example
       ```javascript
      let record = store.createRecord('model');
      record.get('dirtyType'); // 'created'
      ```
       @property dirtyType
      @type {String}
      @readOnly
    */
    dirtyType: retrieveFromCurrentState,

    /**
      If `true` the adapter reported that it was unable to save local
      changes to the backend for any reason other than a server-side
      validation error.
       Example
       ```javascript
      record.get('isError'); // false
      record.set('foo', 'valid value');
      record.save().then(null, function() {
        record.get('isError'); // true
      });
      ```
       @property isError
      @type {Boolean}
      @readOnly
    */
    isError: isError,
    _markErrorRequestAsClean: function _markErrorRequestAsClean() {
      this._errorRequests = [];
      this._lastError = null;

      this._notifyNetworkChanges();
    },

    /**
      If `true` the store is attempting to reload the record from the adapter.
       Example
       ```javascript
      record.get('isReloading'); // false
      record.reload();
      record.get('isReloading'); // true
      ```
       @property isReloading
      @type {Boolean}
      @readOnly
    */
    isReloading: isReloading,

    /**
      All ember models have an id property. This is an identifier
      managed by an external source. These are always coerced to be
      strings before being used internally. Note when declaring the
      attributes for a model it is an error to declare an id
      attribute.
       ```javascript
      let record = store.createRecord('model');
      record.get('id'); // null
       store.findRecord('model', 1).then(function(model) {
        model.get('id'); // '1'
      });
      ```
       @property id
      @type {String}
    */

    /**
      @property currentState
      @private
      @type {Object}
    */
    currentState: RootState$1.empty,
    // defined here to avoid triggering setUnknownProperty

    /**
     @property _internalModel
     @private
     @type {Object}
     */
    _internalModel: null,
    // defined here to avoid triggering setUnknownProperty

    /**
     @property recordData
     @private
     @type undefined (reserved)
     */
    // will be defined here to avoid triggering setUnknownProperty

    /**
     @property store
     */
    store: null,
    // defined here to avoid triggering setUnknownProperty

    /**
      When the record is in the `invalid` state this object will contain
      any errors returned by the adapter. When present the errors hash
      contains keys corresponding to the invalid property names
      and values which are arrays of Javascript objects with two keys:
       - `message` A string containing the error message from the backend
      - `attribute` The name of the property associated with this error message
       ```javascript
      record.get('errors.length'); // 0
      record.set('foo', 'invalid value');
      record.save().catch(function() {
        record.get('errors').get('foo');
        // [{message: 'foo should be a number.', attribute: 'foo'}]
      });
      ```
       The `errors` property us useful for displaying error messages to
      the user.
       ```handlebars
      <label>Username: {{input value=username}} </label>
      {{#each model.errors.username as |error|}}
        <div class="error">
          {{error.message}}
        </div>
      {{/each}}
      <label>Email: {{input value=email}} </label>
      {{#each model.errors.email as |error|}}
        <div class="error">
          {{error.message}}
        </div>
      {{/each}}
      ```
        You can also access the special `messages` property on the error
      object to get an array of all the error strings.
       ```handlebars
      {{#each model.errors.messages as |message|}}
        <div class="error">
          {{message}}
        </div>
      {{/each}}
      ```
       @property errors
      @type {Errors}
    */
    errors: Ember.computed(function () {
      var _this3 = this;

      var errors = Errors.create();

      errors._registerHandlers(function () {
        _this3.send('becameInvalid');
      }, function () {
        _this3.send('becameValid');
      });

      if (canaryFeatures.RECORD_DATA_ERRORS) {
        var recordData = recordDataFor(this);
        var jsonApiErrors;

        if (recordData.getErrors) {
          jsonApiErrors = recordData.getErrors();

          if (jsonApiErrors) {
            var errorsHash = errorsArrayToHash(jsonApiErrors);
            var errorKeys = Object.keys(errorsHash);

            for (var i = 0; i < errorKeys.length; i++) {
              errors._add(errorKeys[i], errorsHash[errorKeys[i]]);
            }
          }
        }
      }

      return errors;
    }).readOnly(),
    invalidErrorsChanged: function invalidErrorsChanged(jsonApiErrors) {
      if (canaryFeatures.RECORD_DATA_ERRORS) {
        this._clearErrorMessages();

        var errors = errorsArrayToHash(jsonApiErrors);
        var errorKeys = Object.keys(errors);

        for (var i = 0; i < errorKeys.length; i++) {
          this._addErrorMessageToAttribute(errorKeys[i], errors[errorKeys[i]]);
        }
      }
    },
    _addErrorMessageToAttribute: function _addErrorMessageToAttribute(attribute, message) {
      this.get('errors')._add(attribute, message);
    },
    _clearErrorMessages: function _clearErrorMessages() {
      this.get('errors')._clear();
    },

    /**
      This property holds the `AdapterError` object with which
      last adapter operation was rejected.
       @property adapterError
      @type {AdapterError}
    */
    adapterError: adapterError,

    /**
      Create a JSON representation of the record, using the serialization
      strategy of the store's adapter.
      `serialize` takes an optional hash as a parameter, currently
      supported options are:
      - `includeId`: `true` if the record's ID should be included in the
        JSON representation.
       @method serialize
      @param {Object} options
      @return {Object} an object whose values are primitive JSON values only
    */
    serialize: function serialize(options) {
      return this._internalModel.createSnapshot().serialize(options);
    },

    /**
      Use [JSONSerializer](JSONSerializer.html) to
      get the JSON representation of a record.
       `toJSON` takes an optional hash as a parameter, currently
      supported options are:
       - `includeId`: `true` if the record's ID should be included in the
        JSON representation.
       @method toJSON
      @param {Object} options
      @return {Object} A JSON representation of the object.
    */
    toJSON: function toJSON(options) {

      var serializer = this._internalModel.store.serializerFor('-default');

      var snapshot = this._internalModel.createSnapshot();

      return serializer.serialize(snapshot, options);
    },

    /**
      Fired when the record is ready to be interacted with,
      that is either loaded from the server or created locally.
       @event ready
    */
    ready: null,

    /**
      Fired when the record is loaded from the server.
       @event didLoad
    */
    didLoad: null,

    /**
      Fired when the record is updated.
       @event didUpdate
    */
    didUpdate: null,

    /**
      Fired when a new record is commited to the server.
       @event didCreate
    */
    didCreate: null,

    /**
      Fired when the record is deleted.
       @event didDelete
    */
    didDelete: null,

    /**
      Fired when the record becomes invalid.
       @event becameInvalid
    */
    becameInvalid: null,

    /**
      Fired when the record enters the error state.
       @event becameError
    */
    becameError: null,

    /**
      Fired when the record is rolled back.
       @event rolledBack
    */
    rolledBack: null,
    //TODO Do we want to deprecate these?

    /**
      @method send
      @private
      @param {String} name
      @param {Object} context
    */
    send: function send(name, context) {
      return this._internalModel.send(name, context);
    },

    /**
      @method transitionTo
      @private
      @param {String} name
    */
    transitionTo: function transitionTo(name) {
      return this._internalModel.transitionTo(name);
    },

    /**
      Marks the record as deleted but does not save it. You must call
      `save` afterwards if you want to persist it. You might use this
      method if you want to allow the user to still `rollbackAttributes()`
      after a delete was made.
       Example
       ```app/routes/model/delete.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        actions: {
          softDelete() {
            this.get('controller.model').deleteRecord();
          },
          confirm() {
            this.get('controller.model').save();
          },
          undo() {
            this.get('controller.model').rollbackAttributes();
          }
        }
      });
      ```
       @method deleteRecord
    */
    deleteRecord: function deleteRecord() {
      this._internalModel.deleteRecord();
    },

    /**
      Same as `deleteRecord`, but saves the record immediately.
       Example
       ```app/routes/model/delete.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        actions: {
          delete() {
            this.get('controller.model').destroyRecord().then(function() {
              controller.transitionToRoute('model.index');
            });
          }
        }
      });
      ```
       If you pass an object on the `adapterOptions` property of the options
      argument it will be passed to your adapter via the snapshot
       ```js
      record.destroyRecord({ adapterOptions: { subscribe: false } });
      ```
       ```app/adapters/post.js
      import MyCustomAdapter from './custom-adapter';
       export default MyCustomAdapter.extend({
        deleteRecord(store, type, snapshot) {
          if (snapshot.adapterOptions.subscribe) {
            // ...
          }
          // ...
        }
      });
      ```
       @method destroyRecord
      @param {Object} options
      @return {Promise} a promise that will be resolved when the adapter returns
      successfully or rejected if the adapter returns with an error.
    */
    destroyRecord: function destroyRecord(options) {
      this.deleteRecord();
      return this.save(options);
    },

    /**
      Unloads the record from the store. This will not send a delete request
      to your server, it just unloads the record from memory.
       @method unloadRecord
    */
    unloadRecord: function unloadRecord() {
      if (this.isDestroyed) {
        return;
      }

      this._internalModel.unloadRecord();
    },

    /**
      @method _notifyProperties
      @private
    */
    _notifyProperties: function _notifyProperties(keys) {
      var _this4 = this;

      // changeProperties defers notifications until after the delegate
      // and protects with a try...finally block
      // previously used begin...endPropertyChanges but this is private API
      changeProperties(function () {
        var key;

        for (var i = 0, length = keys.length; i < length; i++) {
          key = keys[i];

          _this4.notifyPropertyChange(key);
        }
      });
    },

    /**
      Returns an object, whose keys are changed properties, and value is
      an [oldProp, newProp] array.
       The array represents the diff of the canonical state with the local state
      of the model. Note: if the model is created locally, the canonical state is
      empty since the adapter hasn't acknowledged the attributes yet:
       Example
       ```app/models/mascot.js
      import Model, { attr } from '@ember-data/model';
       export default Model.extend({
        name: attr('string'),
        isAdmin: attr('boolean', {
          defaultValue: false
        })
      });
      ```
       ```javascript
      let mascot = store.createRecord('mascot');
       mascot.changedAttributes(); // {}
       mascot.set('name', 'Tomster');
      mascot.changedAttributes(); // { name: [undefined, 'Tomster'] }
       mascot.set('isAdmin', true);
      mascot.changedAttributes(); // { isAdmin: [undefined, true], name: [undefined, 'Tomster'] }
       mascot.save().then(function() {
        mascot.changedAttributes(); // {}
         mascot.set('isAdmin', false);
        mascot.changedAttributes(); // { isAdmin: [true, false] }
      });
      ```
       @method changedAttributes
      @return {Object} an object, whose keys are changed properties,
        and value is an [oldProp, newProp] array.
    */
    changedAttributes: function changedAttributes() {
      return this._internalModel.changedAttributes();
    },

    /**
      If the model `hasDirtyAttributes` this function will discard any unsaved
      changes. If the model `isNew` it will be removed from the store.
       Example
       ```javascript
      record.get('name'); // 'Untitled Document'
      record.set('name', 'Doc 1');
      record.get('name'); // 'Doc 1'
      record.rollbackAttributes();
      record.get('name'); // 'Untitled Document'
      ```
       @since 1.13.0
      @method rollbackAttributes
    */
    rollbackAttributes: function rollbackAttributes() {
      this._internalModel.rollbackAttributes();

      if (canaryFeatures.RECORD_DATA_ERRORS) {
        this._markInvalidRequestAsClean();
      }

      if (canaryFeatures.REQUEST_SERVICE) {
        this._markErrorRequestAsClean();
      }
    },

    /*
      @method _createSnapshot
      @private
    */
    _createSnapshot: function _createSnapshot() {
      return this._internalModel.createSnapshot();
    },
    toStringExtension: function toStringExtension() {
      // the _internalModel guard exists, because some dev-only deprecation code
      // (addListener via validatePropertyInjections) invokes toString before the
      // object is real.
      return this._internalModel && this._internalModel.id;
    },

    /**
      Save the record and persist any changes to the record to an
      external source via the adapter.
       Example
       ```javascript
      record.set('name', 'Tomster');
      record.save().then(function() {
        // Success callback
      }, function() {
        // Error callback
      });
      ```
      If you pass an object using the `adapterOptions` property of the options
     argument it will be passed to your adapter via the snapshot.
       ```js
      record.save({ adapterOptions: { subscribe: false } });
      ```
       ```app/adapters/post.js
      import MyCustomAdapter from './custom-adapter';
       export default MyCustomAdapter.extend({
        updateRecord(store, type, snapshot) {
          if (snapshot.adapterOptions.subscribe) {
            // ...
          }
          // ...
        }
      });
      ```
       @method save
      @param {Object} options
      @return {Promise} a promise that will be resolved when the adapter returns
      successfully or rejected if the adapter returns with an error.
    */
    save: function save(options) {
      var _this5 = this;

      return PromiseObject.create({
        promise: this._internalModel.save(options).then(function () {
          return _this5;
        })
      });
    },

    /**
      Reload the record from the adapter.
       This will only work if the record has already finished loading.
       Example
       ```app/routes/model/view.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        actions: {
          reload() {
            this.controller.get('model').reload().then(function(model) {
              // do something with the reloaded model
            });
          }
        }
      });
      ```
       @method reload
      @param {Object} options optional, may include `adapterOptions` hash which will be passed to adapter request
      @return {Promise} a promise that will be resolved with the record when the
      adapter returns successfully or rejected if the adapter returns
      with an error.
    */
    reload: function reload(options) {
      var _this6 = this;

      var wrappedAdapterOptions;

      if (typeof options === 'object' && options !== null && options.adapterOptions) {
        wrappedAdapterOptions = {
          adapterOptions: options.adapterOptions
        };
      }

      return PromiseObject.create({
        promise: this._internalModel.reload(wrappedAdapterOptions).then(function () {
          return _this6;
        })
      });
    },

    /**
      Override the default event firing from Ember.Evented to
      also call methods with the given name.
       @method trigger
      @private
      @param {String} name
    */
    trigger: function trigger(name) {
      var fn = this[name];

      if (typeof fn === 'function') {
        var length = arguments.length;
        var args = new Array(length - 1);

        for (var i = 1; i < length; i++) {
          args[i - 1] = arguments[i];
        }

        fn.apply(this, args);
      }

      var _hasEvent =  this.has(name);

      if (_hasEvent) {
        this._super.apply(this, arguments);
      }
    },
    attr: function attr() {
    },

    /**
      Get the reference for the specified belongsTo relationship.
       Example
       ```app/models/blog.js
      import Model, { belongsTo } from '@ember-data/model';
       export default Model.extend({
        user: belongsTo({ async: true })
      });
      ```
       ```javascript
      let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            user: {
              data: { type: 'user', id: 1 }
            }
          }
        }
      });
      let userRef = blog.belongsTo('user');
       // check if the user relationship is loaded
      let isLoaded = userRef.value() !== null;
       // get the record of the reference (null if not yet available)
      let user = userRef.value();
       // get the identifier of the reference
      if (userRef.remoteType() === "id") {
        let id = userRef.id();
      } else if (userRef.remoteType() === "link") {
        let link = userRef.link();
      }
       // load user (via store.findRecord or store.findBelongsTo)
      userRef.load().then(...)
       // or trigger a reload
      userRef.reload().then(...)
       // provide data for reference
      userRef.push({
        type: 'user',
        id: 1,
        attributes: {
          username: "@user"
        }
      }).then(function(user) {
        userRef.value() === user;
      });
      ```
       @method belongsTo
      @param {String} name of the relationship
      @since 2.5.0
      @return {BelongsToReference} reference for this relationship
    */
    belongsTo: function belongsTo(name) {
      return this._internalModel.referenceFor('belongsTo', name);
    },

    /**
      Get the reference for the specified hasMany relationship.
       Example
       ```app/models/blog.js
      import Model, { hasMany } from '@ember-data/model';
       export default Model.extend({
        comments: hasMany({ async: true })
      });
       let blog = store.push({
        data: {
          type: 'blog',
          id: 1,
          relationships: {
            comments: {
              data: [
                { type: 'comment', id: 1 },
                { type: 'comment', id: 2 }
              ]
            }
          }
        }
      });
      let commentsRef = blog.hasMany('comments');
       // check if the comments are loaded already
      let isLoaded = commentsRef.value() !== null;
       // get the records of the reference (null if not yet available)
      let comments = commentsRef.value();
       // get the identifier of the reference
      if (commentsRef.remoteType() === "ids") {
        let ids = commentsRef.ids();
      } else if (commentsRef.remoteType() === "link") {
        let link = commentsRef.link();
      }
       // load comments (via store.findMany or store.findHasMany)
      commentsRef.load().then(...)
       // or trigger a reload
      commentsRef.reload().then(...)
       // provide data for reference
      commentsRef.push([{ type: 'comment', id: 1 }, { type: 'comment', id: 2 }]).then(function(comments) {
        commentsRef.value() === comments;
      });
      ```
       @method hasMany
      @param {String} name of the relationship
      @since 2.5.0
      @return {HasManyReference} reference for this relationship
    */
    hasMany: function hasMany(name) {
      return this._internalModel.referenceFor('hasMany', name);
    },

    /**
     Provides info about the model for debugging purposes
     by grouping the properties into more semantic groups.
      Meant to be used by debugging tools such as the Chrome Ember Extension.
      - Groups all attributes in "Attributes" group.
     - Groups all belongsTo relationships in "Belongs To" group.
     - Groups all hasMany relationships in "Has Many" group.
     - Groups all flags in "Flags" group.
     - Flags relationship CPs as expensive properties.
      @method _debugInfo
     @for Model
     @private
     */
    _debugInfo: function _debugInfo() {
      var attributes = ['id'];
      var relationships = {};
      var expensiveProperties = [];
      this.eachAttribute(function (name, meta) {
        return attributes.push(name);
      });
      var groups = [{
        name: 'Attributes',
        properties: attributes,
        expand: true
      }];
      this.eachRelationship(function (name, relationship) {
        var properties = relationships[relationship.kind];

        if (properties === undefined) {
          properties = relationships[relationship.kind] = [];
          groups.push({
            name: relationship.kind,
            properties: properties,
            expand: true
          });
        }

        properties.push(name);
        expensiveProperties.push(name);
      });
      groups.push({
        name: 'Flags',
        properties: ['isLoaded', 'hasDirtyAttributes', 'isSaving', 'isDeleted', 'isError', 'isNew', 'isValid']
      });
      return {
        propertyInfo: {
          // include all other mixins / properties (not just the grouped ones)
          includeOtherProperties: true,
          groups: groups,
          // don't pre-calculate unless cached
          expensiveProperties: expensiveProperties
        }
      };
    },
    notifyBelongsToChange: function notifyBelongsToChange(key) {
      this.notifyPropertyChange(key);
    },

    /**
     Given a callback, iterates over each of the relationships in the model,
     invoking the callback with the name of each relationship and its relationship
     descriptor.
       The callback method you provide should have the following signature (all
     parameters are optional):
      ```javascript
     function(name, descriptor);
     ```
      - `name` the name of the current property in the iteration
     - `descriptor` the meta object that describes this relationship
      The relationship descriptor argument is an object with the following properties.
      - **key** <span class="type">String</span> the name of this relationship on the Model
     - **kind** <span class="type">String</span> "hasMany" or "belongsTo"
     - **options** <span class="type">Object</span> the original options hash passed when the relationship was declared
     - **parentType** <span class="type">Model</span> the type of the Model that owns this relationship
     - **type** <span class="type">String</span> the type name of the related Model
      Note that in addition to a callback, you can also pass an optional target
     object that will be set as `this` on the context.
      Example
      ```app/serializers/application.js
     import JSONSerializer from '@ember-data/serializer/json';
      export default JSONSerializer.extend({
      serialize: function(record, options) {
        let json = {};
         record.eachRelationship(function(name, descriptor) {
          if (descriptor.kind === 'hasMany') {
            let serializedHasManyName = name.toUpperCase() + '_IDS';
            json[serializedHasManyName] = record.get(name).mapBy('id');
          }
        });
         return json;
      }
    });
     ```
      @method eachRelationship
     @param {Function} callback the callback to invoke
     @param {any} binding the value to which the callback's `this` should be bound
     */
    eachRelationship: function eachRelationship(callback, binding) {
      this.constructor.eachRelationship(callback, binding);
    },
    relationshipFor: function relationshipFor(name) {
      return Ember.get(this.constructor, 'relationshipsByName').get(name);
    },
    inverseFor: function inverseFor(key) {
      return this.constructor.inverseFor(key, this._internalModel.store);
    },
    notifyHasManyAdded: function notifyHasManyAdded(key) {
      //We need to notifyPropertyChange in the adding case because we need to make sure
      //we fetch the newly added record in case it is unloaded
      //TODO(Igor): Consider whether we could do this only if the record state is unloaded
      this.notifyPropertyChange(key);
    },
    eachAttribute: function eachAttribute(callback, binding) {
      this.constructor.eachAttribute(callback, binding);
    }
  });
  /**
   @property data
   @private
   @deprecated
   @type {Object}
   */

  Object.defineProperty(Model.prototype, 'data', {
    configurable: false,
    get: function get() {
      return recordDataFor(this)._data;
    }
  });
  var ID_DESCRIPTOR = {
    configurable: false,
    set: function set(id) {
      var normalizedId = coerceId(id);

      if (normalizedId !== null) {
        this._internalModel.setId(normalizedId);
      }
    },
    get: function get() {
      // the _internalModel guard exists, because some dev-only deprecation code
      // (addListener via validatePropertyInjections) invokes toString before the
      // object is real.
      return this._internalModel && this._internalModel.id;
    }
  };
  Object.defineProperty(Model.prototype, 'id', ID_DESCRIPTOR);

  Model.reopenClass({
    isModel: true,

    /**
      Create should only ever be called by the store. To create an instance of a
      `Model` in a dirty state use `store.createRecord`.
      To create instances of `Model` in a clean state, use `store.push`
       @method create
      @private
      @static
    */

    /**
     Represents the model's class name as a string. This can be used to look up the model's class name through
     `Store`'s modelFor method.
      `modelName` is generated for you by Ember Data. It will be a lowercased, dasherized string.
     For example:
      ```javascript
     store.modelFor('post').modelName; // 'post'
     store.modelFor('blog-post').modelName; // 'blog-post'
     ```
      The most common place you'll want to access `modelName` is in your serializer's `payloadKeyFromModelName` method. For example, to change payload
     keys to underscore (instead of dasherized), you might use the following code:
      ```javascript
     import RESTSerializer from '@ember-data/serializer/rest';
     import { underscore } from '@ember/string';
      export default const PostSerializer = RESTSerializer.extend({
       payloadKeyFromModelName(modelName) {
         return underscore(modelName);
       }
     });
     ```
     @property modelName
     @type String
     @readonly
     @static
    */
    modelName: null,

    /*
     These class methods below provide relationship
     introspection abilities about relationships.
      A note about the computed properties contained here:
      **These properties are effectively sealed once called for the first time.**
     To avoid repeatedly doing expensive iteration over a model's fields, these
     values are computed once and then cached for the remainder of the runtime of
     your application.
      If your application needs to modify a class after its initial definition
     (for example, using `reopen()` to add additional attributes), make sure you
     do it before using your model with the store, which uses these properties
     extensively.
     */

    /**
     For a given relationship name, returns the model type of the relationship.
      For example, if you define a model like this:
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
      export default Model.extend({
        comments: hasMany('comment')
      });
     ```
      Calling `store.modelFor('post').typeForRelationship('comments', store)` will return `Comment`.
      @method typeForRelationship
     @static
     @param {String} name the name of the relationship
     @param {store} store an instance of Store
     @return {Model} the type of the relationship, or undefined
     */
    typeForRelationship: function typeForRelationship(name, store) {
      var relationship = Ember.get(this, 'relationshipsByName').get(name);
      return relationship && store.modelFor(relationship.type);
    },
    inverseMap: Ember.computed(function () {
      return Object.create(null);
    }),

    /**
     Find the relationship which is the inverse of the one asked for.
      For example, if you define models like this:
      ```app/models/post.js
     import Model, { hasMany } from '@ember-data/model';
      export default Model.extend({
        comments: hasMany('message')
      });
     ```
      ```app/models/message.js
     import Model, { belongsTo } from '@ember-data/model';
      export default Model.extend({
        owner: belongsTo('post')
      });
     ```
      ``` js
     store.modelFor('post').inverseFor('comments', store) // { type: App.Message, name: 'owner', kind: 'belongsTo' }
     store.modelFor('message').inverseFor('owner', store) // { type: App.Post, name: 'comments', kind: 'hasMany' }
     ```
      @method inverseFor
     @static
     @param {String} name the name of the relationship
     @param {Store} store
     @return {Object} the inverse relationship, or null
     */
    inverseFor: function inverseFor(name, store) {
      var inverseMap = Ember.get(this, 'inverseMap');

      if (inverseMap[name]) {
        return inverseMap[name];
      } else {
        var inverse = this._findInverseFor(name, store);

        inverseMap[name] = inverse;
        return inverse;
      }
    },
    //Calculate the inverse, ignoring the cache
    _findInverseFor: function _findInverseFor(name, store) {
      var inverseType = this.typeForRelationship(name, store);

      if (!inverseType) {
        return null;
      }

      var propertyMeta = this.metaForProperty(name); //If inverse is manually specified to be null, like  `comments: hasMany('message', { inverse: null })`

      var options = propertyMeta.options;

      if (options.inverse === null) {
        return null;
      }

      var inverseName, inverseKind, inverse, inverseOptions; //If inverse is specified manually, return the inverse

      if (options.inverse) {
        inverseName = options.inverse;
        inverse = Ember.get(inverseType, 'relationshipsByName').get(inverseName);

        inverseKind = inverse.kind;
        inverseOptions = inverse.options;
      } else {
        //No inverse was specified manually, we need to use a heuristic to guess one
        if (propertyMeta.type === propertyMeta.parentModelName) ;

        var possibleRelationships = findPossibleInverses(this, inverseType, name);

        if (possibleRelationships.length === 0) {
          return null;
        }

        var filteredRelationships = possibleRelationships.filter(function (possibleRelationship) {
          var optionsForRelationship = inverseType.metaForProperty(possibleRelationship.name).options;
          return name === optionsForRelationship.inverse;
        });

        if (filteredRelationships.length === 1) {
          possibleRelationships = filteredRelationships;
        }
        inverseName = possibleRelationships[0].name;
        inverseKind = possibleRelationships[0].kind;
        inverseOptions = possibleRelationships[0].options;
      }
      return {
        type: inverseType,
        name: inverseName,
        kind: inverseKind,
        options: inverseOptions
      };
    },

    /**
     The model's relationships as a map, keyed on the type of the
     relationship. The value of each entry is an array containing a descriptor
     for each relationship with that type, describing the name of the relationship
     as well as the type.
      For example, given the following model definition:
      ```app/models/blog.js
     import Model, { belongsTo, hasMany } from '@ember-data/model';
      export default Model.extend({
        users: hasMany('user'),
        owner: belongsTo('user'),
        posts: hasMany('post')
      });
     ```
      This computed property would return a map describing these
     relationships, like this:
      ```javascript
     import Ember from 'ember';
     import Blog from 'app/models/blog';
     import User from 'app/models/user';
     import Post from 'app/models/post';
      let relationships = Ember.get(Blog, 'relationships');
     relationships.get('user');
     //=> [ { name: 'users', kind: 'hasMany' },
     //     { name: 'owner', kind: 'belongsTo' } ]
     relationships.get('post');
     //=> [ { name: 'posts', kind: 'hasMany' } ]
     ```
      @property relationships
     @static
     @type Map
     @readOnly
     */
    relationships: relationshipsDescriptor,

    /**
     A hash containing lists of the model's relationships, grouped
     by the relationship kind. For example, given a model with this
     definition:
      ```app/models/blog.js
     import Model, { belongsTo, hasMany } from '@ember-data/model';
      export default Model.extend({
        users: hasMany('user'),
        owner: belongsTo('user'),
         posts: hasMany('post')
      });
     ```
      This property would contain the following:
      ```javascript
     import Ember from 'ember';
     import Blog from 'app/models/blog';
      let relationshipNames = Ember.get(Blog, 'relationshipNames');
     relationshipNames.hasMany;
     //=> ['users', 'posts']
     relationshipNames.belongsTo;
     //=> ['owner']
     ```
      @property relationshipNames
     @static
     @type Object
     @readOnly
     */
    relationshipNames: Ember.computed(function () {
      var names = {
        hasMany: [],
        belongsTo: []
      };
      this.eachComputedProperty(function (name, meta) {
        if (meta.isRelationship) {
          names[meta.kind].push(name);
        }
      });
      return names;
    }),

    /**
     An array of types directly related to a model. Each type will be
     included once, regardless of the number of relationships it has with
     the model.
      For example, given a model with this definition:
      ```app/models/blog.js
     import Model, { belongsTo, hasMany } from '@ember-data/model';
      export default Model.extend({
        users: hasMany('user'),
        owner: belongsTo('user'),
         posts: hasMany('post')
      });
     ```
      This property would contain the following:
      ```javascript
     import Ember from 'ember';
     import Blog from 'app/models/blog';
      let relatedTypes = Ember.get(Blog, 'relatedTypes');
     //=> [ User, Post ]
     ```
      @property relatedTypes
     @static
     @type Ember.Array
     @readOnly
     */
    relatedTypes: relatedTypesDescriptor,

    /**
     A map whose keys are the relationships of a model and whose values are
     relationship descriptors.
      For example, given a model with this
     definition:
      ```app/models/blog.js
     import Model, { belongsTo, hasMany } from '@ember-data/model';
      export default Model.extend({
        users: hasMany('user'),
        owner: belongsTo('user'),
         posts: hasMany('post')
      });
     ```
      This property would contain the following:
      ```javascript
     import Ember from 'ember';
     import Blog from 'app/models/blog';
      let relationshipsByName = Ember.get(Blog, 'relationshipsByName');
     relationshipsByName.get('users');
     //=> { key: 'users', kind: 'hasMany', type: 'user', options: Object, isRelationship: true }
     relationshipsByName.get('owner');
     //=> { key: 'owner', kind: 'belongsTo', type: 'user', options: Object, isRelationship: true }
     ```
      @property relationshipsByName
     @static
     @type Map
     @readOnly
     */
    relationshipsByName: relationshipsByNameDescriptor,
    relationshipsObject: relationshipsObjectDescriptor,

    /**
     A map whose keys are the fields of the model and whose values are strings
     describing the kind of the field. A model's fields are the union of all of its
     attributes and relationships.
      For example:
      ```app/models/blog.js
     import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
      export default Model.extend({
        users: hasMany('user'),
        owner: belongsTo('user'),
         posts: hasMany('post'),
         title: attr('string')
      });
     ```
      ```js
     import Ember from 'ember';
     import Blog from 'app/models/blog';
      let fields = Ember.get(Blog, 'fields');
     fields.forEach(function(kind, field) {
        console.log(field, kind);
      });
      // prints:
     // users, hasMany
     // owner, belongsTo
     // posts, hasMany
     // title, attribute
     ```
      @property fields
     @static
     @type Map
     @readOnly
     */
    fields: Ember.computed(function () {
      var map = new Map();
      this.eachComputedProperty(function (name, meta) {
        if (meta.isRelationship) {
          map.set(name, meta.kind);
        } else if (meta.isAttribute) {
          map.set(name, 'attribute');
        }
      });
      return map;
    }).readOnly(),

    /**
     Given a callback, iterates over each of the relationships in the model,
     invoking the callback with the name of each relationship and its relationship
     descriptor.
      @method eachRelationship
     @static
     @param {Function} callback the callback to invoke
     @param {any} binding the value to which the callback's `this` should be bound
     */
    eachRelationship: function eachRelationship(callback, binding) {
      Ember.get(this, 'relationshipsByName').forEach(function (relationship, name) {
        callback.call(binding, name, relationship);
      });
    },

    /**
     Given a callback, iterates over each of the types related to a model,
     invoking the callback with the related type's class. Each type will be
     returned just once, regardless of how many different relationships it has
     with a model.
      @method eachRelatedType
     @static
     @param {Function} callback the callback to invoke
     @param {any} binding the value to which the callback's `this` should be bound
     */
    eachRelatedType: function eachRelatedType(callback, binding) {
      var relationshipTypes = Ember.get(this, 'relatedTypes');

      for (var i = 0; i < relationshipTypes.length; i++) {
        var type = relationshipTypes[i];
        callback.call(binding, type);
      }
    },
    determineRelationshipType: function determineRelationshipType(knownSide, store) {
      var knownKey = knownSide.key;
      var knownKind = knownSide.kind;
      var inverse = this.inverseFor(knownKey, store); // let key;

      var otherKind;

      if (!inverse) {
        return knownKind === 'belongsTo' ? 'oneToNone' : 'manyToNone';
      } // key = inverse.name;


      otherKind = inverse.kind;

      if (otherKind === 'belongsTo') {
        return knownKind === 'belongsTo' ? 'oneToOne' : 'manyToOne';
      } else {
        return knownKind === 'belongsTo' ? 'oneToMany' : 'manyToMany';
      }
    },

    /**
     A map whose keys are the attributes of the model (properties
     described by attr) and whose values are the meta object for the
     property.
      Example
      ```app/models/person.js
     import Model, { attr } from '@ember-data/model';
      export default Model.extend({
        firstName: attr('string'),
        lastName: attr('string'),
        birthday: attr('date')
      });
     ```
      ```javascript
     import Ember from 'ember';
     import Person from 'app/models/person';
      let attributes = Ember.get(Person, 'attributes')
      attributes.forEach(function(meta, name) {
        console.log(name, meta);
      });
      // prints:
     // firstName {type: "string", isAttribute: true, options: Object, parentType: function, name: "firstName"}
     // lastName {type: "string", isAttribute: true, options: Object, parentType: function, name: "lastName"}
     // birthday {type: "date", isAttribute: true, options: Object, parentType: function, name: "birthday"}
     ```
      @property attributes
     @static
     @type {Map}
     @readOnly
     */
    attributes: Ember.computed(function () {

      var map = new Map();
      this.eachComputedProperty(function (name, meta) {
        if (meta.isAttribute) {
          meta.name = name;
          map.set(name, meta);
        }
      });
      return map;
    }).readOnly(),

    /**
     A map whose keys are the attributes of the model (properties
     described by attr) and whose values are type of transformation
     applied to each attribute. This map does not include any
     attributes that do not have an transformation type.
      Example
      ```app/models/person.js
     import Model, { attr } from '@ember-data/model';
      export default Model.extend({
        firstName: attr(),
        lastName: attr('string'),
        birthday: attr('date')
      });
     ```
      ```javascript
     import Ember from 'ember';
     import Person from 'app/models/person';
      let transformedAttributes = Ember.get(Person, 'transformedAttributes')
      transformedAttributes.forEach(function(field, type) {
        console.log(field, type);
      });
      // prints:
     // lastName string
     // birthday date
     ```
      @property transformedAttributes
     @static
     @type {Map}
     @readOnly
     */
    transformedAttributes: Ember.computed(function () {
      var map = new Map();
      this.eachAttribute(function (key, meta) {
        if (meta.type) {
          map.set(key, meta.type);
        }
      });
      return map;
    }).readOnly(),

    /**
     Iterates through the attributes of the model, calling the passed function on each
     attribute.
      The callback method you provide should have the following signature (all
     parameters are optional):
      ```javascript
     function(name, meta);
     ```
      - `name` the name of the current property in the iteration
     - `meta` the meta object for the attribute property in the iteration
      Note that in addition to a callback, you can also pass an optional target
     object that will be set as `this` on the context.
      Example
      ```javascript
     import Model, { attr } from '@ember-data/model';
      let Person = Model.extend({
        firstName: attr('string'),
        lastName: attr('string'),
        birthday: attr('date')
      });
      Person.eachAttribute(function(name, meta) {
        console.log(name, meta);
      });
      // prints:
     // firstName {type: "string", isAttribute: true, options: Object, parentType: function, name: "firstName"}
     // lastName {type: "string", isAttribute: true, options: Object, parentType: function, name: "lastName"}
     // birthday {type: "date", isAttribute: true, options: Object, parentType: function, name: "birthday"}
     ```
      @method eachAttribute
     @param {Function} callback The callback to execute
     @param {Object} [binding] the value to which the callback's `this` should be bound
     @static
     */
    eachAttribute: function eachAttribute(callback, binding) {
      Ember.get(this, 'attributes').forEach(function (meta, name) {
        callback.call(binding, name, meta);
      });
    },

    /**
     Iterates through the transformedAttributes of the model, calling
     the passed function on each attribute. Note the callback will not be
     called for any attributes that do not have an transformation type.
      The callback method you provide should have the following signature (all
     parameters are optional):
      ```javascript
     function(name, type);
     ```
      - `name` the name of the current property in the iteration
     - `type` a string containing the name of the type of transformed
     applied to the attribute
      Note that in addition to a callback, you can also pass an optional target
     object that will be set as `this` on the context.
      Example
      ```javascript
     import Model, { attr } from '@ember-data/model';
      let Person = Model.extend({
        firstName: attr(),
        lastName: attr('string'),
        birthday: attr('date')
      });
      Person.eachTransformedAttribute(function(name, type) {
        console.log(name, type);
      });
      // prints:
     // lastName string
     // birthday date
     ```
      @method eachTransformedAttribute
     @param {Function} callback The callback to execute
     @param {Object} [binding] the value to which the callback's `this` should be bound
     @static
     */
    eachTransformedAttribute: function eachTransformedAttribute(callback, binding) {
      Ember.get(this, 'transformedAttributes').forEach(function (type, name) {
        callback.call(binding, name, type);
      });
    },

    /**
     Returns the name of the model class.
      @method toString
     @static
     */
    toString: function toString() {
      return "model:" + Ember.get(this, 'modelName');
    }
  });

  /**
    @module @ember-data/store
  */

  /**
   * Casts a public interface to the matching internal class implementation
   *
   * @internal
   */
  function upgradeForInternal(external) {
    return external;
  }

  function _defineProperties$5(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$5(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$5(Constructor.prototype, protoProps); if (staticProps) _defineProperties$5(Constructor, staticProps); return Constructor; }

  var RecordDataStoreWrapper =
  /*#__PURE__*/
  function () {
    function RecordDataStoreWrapper(_store) {
      this._store = _store;
      this[BRAND_SYMBOL] = void 0;
      this._willUpdateManyArrays = void 0;
      this._pendingManyArrayUpdates = void 0;
      this._willUpdateManyArrays = false;
      this._pendingManyArrayUpdates = [];
    }

    var _proto = RecordDataStoreWrapper.prototype;

    /**
     * Exists so that DefaultRecordData can check for model types
     * in DEBUG for relationships. Should be refactored away.
     *
     * @internal
     */
    _proto._hasModelFor = function _hasModelFor(type) {
      return this._store._hasModelFor(type);
    }
    /**
     * @internal
     */
    ;

    _proto._scheduleManyArrayUpdate = function _scheduleManyArrayUpdate(identifier, key) {
      var _this = this;

      var pending = this._pendingManyArrayUpdates = this._pendingManyArrayUpdates || [];
      pending.push(identifier, key);

      if (this._willUpdateManyArrays === true) {
        return;
      }

      this._willUpdateManyArrays = true;
      var backburner = this._store._backburner;
      backburner.join(function () {
        backburner.schedule('syncRelationships', _this, _this._flushPendingManyArrayUpdates);
      });
    };

    _proto.notifyErrorsChange = function notifyErrorsChange(type, id, lid) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      var internalModel = internalModelFactoryFor(this._store).peek(identifier);

      if (internalModel) {
        internalModel.notifyErrorsChange();
      }
    };

    _proto._flushPendingManyArrayUpdates = function _flushPendingManyArrayUpdates() {
      if (this._willUpdateManyArrays === false) {
        return;
      }

      var pending = this._pendingManyArrayUpdates;
      this._pendingManyArrayUpdates = [];
      this._willUpdateManyArrays = false;
      var factory = internalModelFactoryFor(this._store);

      for (var i = 0; i < pending.length; i += 2) {
        var identifier = pending[i];
        var _key = pending[i + 1];
        var internalModel = factory.peek(identifier);

        if (internalModel) {
          internalModel.notifyHasManyChange(_key);
        }
      }
    };

    _proto.attributesDefinitionFor = function attributesDefinitionFor(type) {
      return this._store._attributesDefinitionFor(type);
    };

    _proto.relationshipsDefinitionFor = function relationshipsDefinitionFor(type) {
      return this._store._relationshipsDefinitionFor(type);
    };

    _proto.inverseForRelationship = function inverseForRelationship(type, key) {
      var modelClass = this._store.modelFor(type);

      var definition = upgradeForInternal(this.relationshipsDefinitionFor(type)[key]);

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (definition.inverse !== undefined) {
          return definition.inverse;
        } else {
          //TODO add a test for this branch
          if (!definition._inverseKey) {
            return null;
          }

          return definition._inverseKey(this._store, modelClass);
        }
      } else {
        return definition._inverseKey(this._store, modelClass);
      }
    };

    _proto.inverseIsAsyncForRelationship = function inverseIsAsyncForRelationship(type, key) {
      var modelClass = this._store.modelFor(type);

      var definition = upgradeForInternal(this.relationshipsDefinitionFor(type)[key]);

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (definition.inverse === null) {
          return false;
        }

        if (definition.inverseIsAsync !== undefined) {
          return !!definition.inverseIsAsync;
        } else {
          return definition._inverseIsAsync(this._store, modelClass);
        }
      } else {
        return definition._inverseIsAsync(this._store, modelClass);
      }
    };

    _proto.notifyPropertyChange = function notifyPropertyChange(type, id, lid, key) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      var internalModel = internalModelFactoryFor(this._store).peek(identifier);

      if (internalModel) {
        internalModel.notifyPropertyChange(key);
      }
    };

    _proto.notifyHasManyChange = function notifyHasManyChange(type, id, lid, key) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);

      this._scheduleManyArrayUpdate(identifier, key);
    };

    _proto.notifyBelongsToChange = function notifyBelongsToChange(type, id, lid, key) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      var internalModel = internalModelFactoryFor(this._store).peek(identifier);

      if (internalModel) {
        internalModel.notifyBelongsToChange(key);
      }
    };

    _proto.notifyStateChange = function notifyStateChange(type, id, lid, key) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      var internalModel = internalModelFactoryFor(this._store).peek(identifier);

      if (internalModel) {
        internalModel.notifyStateChange(key);
      }
    };

    _proto.recordDataFor = function recordDataFor(type, id, lid) {
      var identifier;
      var isCreate = false;

      if (!id && !lid) {
        isCreate = true;
        identifier = {
          type: type
        };
      } else {
        var resource = constructResource(type, id, lid);
        identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      }

      return this._store.recordDataFor(identifier, isCreate);
    };

    _proto.setRecordId = function setRecordId(type, id, lid) {
      this._store.setRecordId(type, id, lid);
    };

    _proto.isRecordInUse = function isRecordInUse(type, id, lid) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      var internalModel = internalModelFactoryFor(this._store).peek(identifier);

      if (!internalModel) {
        return false;
      }

      return internalModel.isRecordInUse();
    };

    _proto.disconnectRecord = function disconnectRecord(type, id, lid) {
      var resource = constructResource(type, id, lid);
      var identifier = identifierCacheFor(this._store).getOrCreateRecordIdentifier(resource);
      var internalModel = internalModelFactoryFor(this._store).peek(identifier);

      if (internalModel) {
        internalModel.destroyFromRecordData();
      }
    };

    _createClass$5(RecordDataStoreWrapper, [{
      key: "identifierCache",
      get: function get() {
        if (!canaryFeatures.IDENTIFIERS) {
          throw new Error("Store.identifierCache is unavailable in this build of EmberData");
        }

        return identifierCacheFor(this._store);
      }
    }]);

    return RecordDataStoreWrapper;
  }();

  /**
    @module @ember-data/store
  */
  /*
    This is a helper method that always returns a JSON-API Document.

    @method normalizeResponseHelper
    @param {Serializer} serializer
    @param {Store} store
    @param {subclass of Model} modelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */

  function normalizeResponseHelper(serializer, store, modelClass, payload, id, requestType) {
    var normalizedResponse = serializer.normalizeResponse(store, modelClass, payload, id, requestType);
    return normalizedResponse;
  }

  var RequestStateEnum;

  (function (RequestStateEnum) {
    RequestStateEnum["pending"] = "pending";
    RequestStateEnum["fulfilled"] = "fulfilled";
    RequestStateEnum["rejected"] = "rejected";
  })(RequestStateEnum || (RequestStateEnum = {}));

  var Touching = symbol('touching');
  var RequestPromise = symbol('promise');

  function hasRecordIdentifier(op) {
    return 'recordIdentifier' in op;
  }

  var RequestCache =
  /*#__PURE__*/
  function () {
    function RequestCache() {
      this._pending = Object.create(null);
      this._done = Object.create(null);
      this._subscriptions = Object.create(null);
    }

    var _proto = RequestCache.prototype;

    _proto.enqueue = function enqueue(promise, queryRequest) {
      var _this = this;

      var query = queryRequest.data[0];

      if (hasRecordIdentifier(query)) {
        var _request;

        var _lid = query.recordIdentifier.lid;
        var type = query.op === 'saveRecord' ? 'mutation' : 'query';

        if (!this._pending[_lid]) {
          this._pending[_lid] = [];
        }

        var request = (_request = {
          state: RequestStateEnum.pending,
          request: queryRequest,
          type: type
        }, _request[Touching] = [query.recordIdentifier], _request[RequestPromise] = promise, _request);

        this._pending[_lid].push(request);

        this._triggerSubscriptions(request);

        promise.then(function (result) {
          var _finalizedRequest;

          _this._dequeue(_lid, request);

          var finalizedRequest = (_finalizedRequest = {
            state: RequestStateEnum.fulfilled,
            request: queryRequest,
            type: type
          }, _finalizedRequest[Touching] = request[Touching], _finalizedRequest.response = {
            data: result
          }, _finalizedRequest);

          _this._addDone(finalizedRequest);

          _this._triggerSubscriptions(finalizedRequest);
        }, function (error) {
          var _finalizedRequest2;

          _this._dequeue(_lid, request);

          var finalizedRequest = (_finalizedRequest2 = {
            state: RequestStateEnum.rejected,
            request: queryRequest,
            type: type
          }, _finalizedRequest2[Touching] = request[Touching], _finalizedRequest2.response = {
            data: error && error.error
          }, _finalizedRequest2);

          _this._addDone(finalizedRequest);

          _this._triggerSubscriptions(finalizedRequest);
        });
      }
    };

    _proto._triggerSubscriptions = function _triggerSubscriptions(req) {
      var _this2 = this;

      req[Touching].forEach(function (identifier) {
        if (_this2._subscriptions[identifier.lid]) {
          _this2._subscriptions[identifier.lid].forEach(function (callback) {
            return callback(req);
          });
        }
      });
    };

    _proto._dequeue = function _dequeue(lid, request) {
      this._pending[lid] = this._pending[lid].filter(function (req) {
        return req !== request;
      });
    };

    _proto._addDone = function _addDone(request) {
      var _this3 = this;

      request[Touching].forEach(function (identifier) {
        if (!_this3._done[identifier.lid]) {
          _this3._done[identifier.lid] = [];
        } // TODO add support for multiple


        var requestDataOp = request.request.data[0].op;
        _this3._done[identifier.lid] = _this3._done[identifier.lid].filter(function (req) {
          // TODO add support for multiple
          var data;

          if (req.request.data instanceof Array) {
            data = req.request.data[0];
          } else {
            data = req.request.data;
          }

          return data.op !== requestDataOp;
        });

        _this3._done[identifier.lid].push(request);
      });
    };

    _proto.subscribeForRecord = function subscribeForRecord(identifier, callback) {
      if (!this._subscriptions[identifier.lid]) {
        this._subscriptions[identifier.lid] = [];
      }

      this._subscriptions[identifier.lid].push(callback);
    };

    _proto.getPendingRequestsForRecord = function getPendingRequestsForRecord(identifier) {
      if (this._pending[identifier.lid]) {
        return this._pending[identifier.lid];
      }

      return [];
    };

    _proto.getLastRequestForRecord = function getLastRequestForRecord(identifier) {
      var requests = this._done[identifier.lid];

      if (requests) {
        return requests[requests.length - 1];
      }

      return null;
    };

    return RequestCache;
  }();

  var emberRun = Ember.run.backburner;
  var SaveOp = symbol('SaveOp');

  var FetchManager =
  /*#__PURE__*/
  function () {
    // saves which are pending in the runloop
    // fetches pending in the runloop, waiting to be coalesced
    function FetchManager(_store) {
      this._store = _store;
      this.isDestroyed = void 0;
      this.requestCache = void 0;
      this._pendingSave = void 0;
      this._pendingFetch = void 0;
      // used to keep track of all the find requests that need to be coalesced
      this._pendingFetch = new Map();
      this._pendingSave = [];
      this.requestCache = new RequestCache();
    }
    /**
      This method is called by `record.save`, and gets passed a
      resolver for the promise that `record.save` returns.
       It schedules saving to happen at the end of the run loop.
    */


    var _proto = FetchManager.prototype;

    _proto.scheduleSave = function scheduleSave(identifier, options) {
      if (options === void 0) {
        options = {};
      }

      var promiseLabel = 'DS: Model#save ' + this;
      var resolver = Ember.RSVP.defer(promiseLabel);
      var query = {
        op: 'saveRecord',
        recordIdentifier: identifier,
        options: options
      };
      var queryRequest = {
        data: [query]
      };
      var snapshot = new Snapshot(options, identifier, this._store);
      var pendingSaveItem = {
        snapshot: snapshot,
        resolver: resolver,
        identifier: identifier,
        options: options,
        queryRequest: queryRequest
      };

      this._pendingSave.push(pendingSaveItem);

      emberRun.scheduleOnce('actions', this, this._flushPendingSaves);
      this.requestCache.enqueue(resolver.promise, pendingSaveItem.queryRequest);
      return resolver.promise;
    };

    _proto._flushPendingSave = function _flushPendingSave(pending) {
      var snapshot = pending.snapshot,
          resolver = pending.resolver,
          identifier = pending.identifier,
          options = pending.options;

      var adapter = this._store.adapterFor(identifier.type);

      var operation = options[SaveOp];
      var internalModel = snapshot._internalModel;
      var modelName = snapshot.modelName;
      var store = this._store;
      var modelClass = store.modelFor(modelName);
      var promise = Ember.RSVP.Promise.resolve().then(function () {
        return adapter[operation](store, modelClass, snapshot);
      });
      var serializer = store.serializerFor(modelName);
      var label = "DS: Extract and notify about " + operation + " completion of " + internalModel;
      promise = guardDestroyedStore(promise, store, label);
      promise = _guard(promise, _bind(_objectIsAlive, internalModel));
      promise = promise.then(function (adapterPayload) {
        if (adapterPayload) {
          return normalizeResponseHelper(serializer, store, modelClass, adapterPayload, snapshot.id, operation);
        }
      }, function (error$1) {
        if (error$1 instanceof error.InvalidError) {
          var parsedErrors = error$1.errors;

          if (typeof serializer.extractErrors === 'function') {
            parsedErrors = serializer.extractErrors(store, modelClass, error$1, snapshot.id);
          } else {
            parsedErrors = errorsArrayToHash(error$1.errors);
          }

          throw {
            error: error$1,
            parsedErrors: parsedErrors
          };
        } else {
          throw {
            error: error$1
          };
        }
      }, label);
      resolver.resolve(promise);
    }
    /**
      This method is called at the end of the run loop, and
      flushes any records passed into `scheduleSave`
       @method flushPendingSave
      @private
    */
    ;

    _proto._flushPendingSaves = function _flushPendingSaves() {
      var pending = this._pendingSave.slice();

      this._pendingSave = [];

      for (var i = 0, j = pending.length; i < j; i++) {
        var pendingItem = pending[i];

        this._flushPendingSave(pendingItem);
      }
    };

    _proto.scheduleFetch = function scheduleFetch(identifier, options, shouldTrace) {
      // TODO Probably the store should pass in the query object
      var query = {
        op: 'findRecord',
        recordIdentifier: identifier,
        options: options
      };
      var queryRequest = {
        data: [query]
      };

      var pendingFetches = this._pendingFetch.get(identifier.type); // We already have a pending fetch for this


      if (pendingFetches) {
        var matchingPendingFetch = pendingFetches.find(function (fetch) {
          return fetch.identifier.id === identifier.id;
        });

        if (matchingPendingFetch) {
          return matchingPendingFetch.resolver.promise;
        }
      }

      var id = identifier.id;
      var modelName = identifier.type;
      var resolver = Ember.RSVP.defer("Fetching " + modelName + "' with id: " + id);
      var pendingFetchItem = {
        identifier: identifier,
        resolver: resolver,
        options: options,
        queryRequest: queryRequest
      };

      var promise = resolver.promise;

      if (this._pendingFetch.size === 0) {
        emberRun.schedule('actions', this, this.flushAllPendingFetches);
      }

      var fetches = this._pendingFetch;

      if (!fetches.has(modelName)) {
        fetches.set(modelName, []);
      }

      fetches.get(modelName).push(pendingFetchItem);
      this.requestCache.enqueue(promise, pendingFetchItem.queryRequest);
      return promise;
    };

    _proto._fetchRecord = function _fetchRecord(fetchItem) {
      var _this = this;

      var identifier = fetchItem.identifier;
      var modelName = identifier.type;

      var adapter = this._store.adapterFor(modelName);
      var snapshot = new Snapshot(fetchItem.options, identifier, this._store);

      var klass = this._store.modelFor(identifier.type);

      var promise = Ember.RSVP.Promise.resolve().then(function () {
        return adapter.findRecord(_this._store, klass, identifier.id, snapshot);
      });
      var id = identifier.id;
      var label = "DS: Handle Adapter#findRecord of '" + modelName + "' with id: '" + id + "'";
      promise = guardDestroyedStore(promise, this._store, label);
      promise = promise.then(function (adapterPayload) {

        var serializer = _this._store.serializerFor(modelName);

        var payload = normalizeResponseHelper(serializer, _this._store, klass, adapterPayload, id, 'findRecord');
        return payload;
      }, function (error) {
        throw error;
      }, "DS: Extract payload of '" + modelName + "'");
      fetchItem.resolver.resolve(promise);
    } // TODO should probably refactor expectedSnapshots to be identifiers
    ;

    _proto.handleFoundRecords = function handleFoundRecords(seeking, coalescedPayload, expectedSnapshots) {
      // resolve found records
      var found = Object.create(null);
      var payloads = coalescedPayload.data;
      var coalescedIncluded = coalescedPayload.included || [];

      for (var i = 0, l = payloads.length; i < l; i++) {
        var payload = payloads[i];
        var pair = seeking[payload.id];
        found[payload.id] = payload;
        var included = coalescedIncluded.concat(payloads); // TODO remove original data from included

        if (pair) {
          var resolver = pair.resolver;
          resolver.resolve({
            data: payload,
            included: included
          });
        }
      } // reject missing records
      // TODO NOW clean this up to refer to payloads


      var missingSnapshots = [];

      for (var _i = 0, _l = expectedSnapshots.length; _i < _l; _i++) {
        var snapshot = expectedSnapshots[_i];

        if (!found[snapshot.id]) {
          missingSnapshots.push(snapshot);
        }
      }

      if (missingSnapshots.length) {
        this.rejectFetchedItems(seeking, missingSnapshots);
      }
    };

    _proto.rejectFetchedItems = function rejectFetchedItems(seeking, snapshots, error) {
      for (var i = 0, l = snapshots.length; i < l; i++) {
        var identifier = snapshots[i];
        var pair = seeking[identifier.id];

        if (pair) {
          pair.resolver.reject(error || new Error("Expected: '<" + identifier.modelName + ":" + identifier.id + ">' to be present in the adapter provided payload, but it was not found."));
        }
      }
    };

    _proto._findMany = function _findMany(adapter, store, modelName, snapshots, identifiers, optionsMap) {
      var modelClass = store.modelFor(modelName); // `adapter.findMany` gets the modelClass still

      var ids = snapshots.map(function (s) {
        return s.id;
      });
      var promise = adapter.findMany(store, modelClass, ids, Ember.A(snapshots));
      var label = "DS: Handle Adapter#findMany of '" + modelName + "'";

      if (promise === undefined) {
        throw new Error('adapter.findMany returned undefined, this was very likely a mistake');
      }

      promise = guardDestroyedStore(promise, store, label);
      return promise.then(function (adapterPayload) {
        var serializer = store.serializerFor(modelName);
        var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'findMany');
        return payload;
      }, null, "DS: Extract payload of " + modelName);
    };

    _proto._processCoalescedGroup = function _processCoalescedGroup(seeking, group, adapter, optionsMap, modelName) {
      var _this2 = this;

      //TODO check what happened with identifiers here
      var totalInGroup = group.length;
      var ids = new Array(totalInGroup);
      var groupedSnapshots = new Array(totalInGroup);

      for (var j = 0; j < totalInGroup; j++) {
        groupedSnapshots[j] = group[j];
        ids[j] = groupedSnapshots[j].id;
      }

      var store = this._store;

      if (totalInGroup > 1) {
        this._findMany(adapter, store, modelName, group, groupedSnapshots, optionsMap).then(function (payloads) {
          _this2.handleFoundRecords(seeking, payloads, groupedSnapshots);
        }).catch(function (error) {
          _this2.rejectFetchedItems(seeking, groupedSnapshots, error);
        });
      } else if (ids.length === 1) {
        var pair = seeking[groupedSnapshots[0].id];

        this._fetchRecord(pair);
      }
    };

    _proto._flushPendingFetchForType = function _flushPendingFetchForType(pendingFetchItems, modelName) {
      var adapter = this._store.adapterFor(modelName);

      var shouldCoalesce = !!adapter.findMany && adapter.coalesceFindRequests;
      var totalItems = pendingFetchItems.length;
      var identifiers = new Array(totalItems);
      var seeking = Object.create(null);
      var optionsMap = new WeakMap();

      for (var i = 0; i < totalItems; i++) {
        var pendingItem = pendingFetchItems[i];
        var identifier = pendingItem.identifier;
        identifiers[i] = identifier;
        optionsMap.set(identifier, pendingItem.options);
        seeking[identifier.id] = pendingItem;
      }

      if (shouldCoalesce) {
        // TODO: Improve records => snapshots => records => snapshots
        //
        // We want to provide records to all store methods and snapshots to all
        // adapter methods. To make sure we're doing that we're providing an array
        // of snapshots to adapter.groupRecordsForFindMany(), which in turn will
        // return grouped snapshots instead of grouped records.
        //
        // But since the _findMany() finder is a store method we need to get the
        // records from the grouped snapshots even though the _findMany() finder
        // will once again convert the records to snapshots for adapter.findMany()
        var snapshots = new Array(totalItems);

        for (var _i2 = 0; _i2 < totalItems; _i2++) {
          var options = optionsMap.get(identifiers[_i2]);
          snapshots[_i2] = new Snapshot(options, identifiers[_i2], this._store);
        }

        var groups = adapter.groupRecordsForFindMany(this, snapshots);

        for (var _i3 = 0, l = groups.length; _i3 < l; _i3++) {
          this._processCoalescedGroup(seeking, groups[_i3], adapter, optionsMap, modelName);
        }
      } else {
        for (var _i4 = 0; _i4 < totalItems; _i4++) {
          this._fetchRecord(pendingFetchItems[_i4]);
        }
      }
    };

    _proto.flushAllPendingFetches = function flushAllPendingFetches() {
      if (this.isDestroyed) {
        return;
      }

      this._pendingFetch.forEach(this._flushPendingFetchForType, this);

      this._pendingFetch.clear();
    };

    _proto.destroy = function destroy() {
      this.isDestroyed = true;
    };

    return FetchManager;
  }();

  function _find(adapter, store, modelClass, id, internalModel, options) {

    var snapshot = internalModel.createSnapshot(options);
    var modelName = internalModel.modelName;
    var promise = Ember.RSVP.Promise.resolve().then(function () {
      return adapter.findRecord(store, modelClass, id, snapshot);
    });
    var label = "DS: Handle Adapter#findRecord of '" + modelName + "' with id: '" + id + "'";
    var identifier = internalModel.identifier;
    promise = guardDestroyedStore(promise, store, label);
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(modelName);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, id, 'findRecord');

      if (canaryFeatures.IDENTIFIERS) {
        // ensure that regardless of id returned we assign to the correct record
        payload.data.lid = identifier.lid;
      }

      return store._push(payload);
    }, function (error) {
      internalModel.notFound();

      if (internalModel.isEmpty()) {
        internalModel.unloadRecord();
      }

      throw error;
    }, "DS: Extract payload of '" + modelName + "'");
  }
  function _findMany(adapter, store, modelName, ids, internalModels, optionsMap) {
    var snapshots = Ember.A(internalModels.map(function (internalModel) {
      return internalModel.createSnapshot(optionsMap.get(internalModel));
    }));
    var modelClass = store.modelFor(modelName); // `adapter.findMany` gets the modelClass still

    var promise = adapter.findMany(store, modelClass, ids, snapshots);
    var label = "DS: Handle Adapter#findMany of '" + modelName + "'";

    if (promise === undefined) {
      throw new Error('adapter.findMany returned undefined, this was very likely a mistake');
    }

    promise = guardDestroyedStore(promise, store, label);
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(modelName);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'findMany');
      return store._push(payload);
    }, null, "DS: Extract payload of " + modelName);
  }

  function iterateData(data, fn) {
    if (Array.isArray(data)) {
      return data.map(fn);
    } else {
      return fn(data);
    }
  } // sync
  // iterate over records in payload.data
  // for each record
  //   assert that record.relationships[inverse] is either undefined (so we can fix it)
  //     or provide a data: {id, type} that matches the record that requested it
  //   return the relationship data for the parent


  function syncRelationshipDataFromLink(store, payload, parentInternalModel, relationship) {
    var _relationships;

    // ensure the right hand side (incoming payload) points to the parent record that
    // requested this relationship
    var relationshipData = iterateData(payload.data, function (data, index) {
      var id = data.id,
          type = data.type;
      ensureRelationshipIsSetToParent(data, parentInternalModel, store, relationship);
      return {
        id: id,
        type: type
      };
    }); // now, push the left hand side (the parent record) to ensure things are in sync, since
    // the payload will be pushed with store._push

    var parentPayload = {
      id: parentInternalModel.id,
      type: parentInternalModel.modelName,
      relationships: (_relationships = {}, _relationships[relationship.key] = {
        meta: payload.meta,
        links: payload.links,
        data: relationshipData
      }, _relationships)
    };

    if (!Array.isArray(payload.included)) {
      payload.included = [];
    }

    payload.included.push(parentPayload);
    return payload;
  }

  function ensureRelationshipIsSetToParent(payload, parentInternalModel, store, parentRelationship, index) {
    var id = payload.id,
        type = payload.type;

    if (!payload.relationships) {
      payload.relationships = {};
    }

    var relationships = payload.relationships;
    var inverse = getInverse(store, parentInternalModel, parentRelationship, type);

    if (inverse) {
      var inverseKey = inverse.inverseKey,
          kind = inverse.kind;
      var relationshipData = relationships[inverseKey] && relationships[inverseKey].data;

      if (kind !== 'hasMany' || typeof relationshipData !== 'undefined') {
        relationships[inverseKey] = relationships[inverseKey] || {};
        relationships[inverseKey].data = fixRelationshipData(relationshipData, kind, parentInternalModel);
      }
    }
  }

  function getInverse(store, parentInternalModel, parentRelationship, type) {
    return recordDataFindInverseRelationshipInfo(store, parentInternalModel, parentRelationship, type);
  }

  function recordDataFindInverseRelationshipInfo(_ref, parentInternalModel, parentRelationship, type) {
    var _storeWrapper = _ref._storeWrapper;
    var lhs_relationshipName = parentRelationship.name;
    var modelName = parentInternalModel.modelName;

    var inverseKey = _storeWrapper.inverseForRelationship(modelName, lhs_relationshipName);

    if (inverseKey) {
      var kind = _storeWrapper.relationshipsDefinitionFor(type)[inverseKey].meta.kind;

      return {
        inverseKey: inverseKey,
        kind: kind
      };
    }
  }

  function fixRelationshipData(relationshipData, relationshipKind, _ref2) {
    var id = _ref2.id,
        modelName = _ref2.modelName;
    var parentRelationshipData = {
      id: id,
      type: modelName
    };
    var payload;

    if (relationshipKind === 'hasMany') {
      payload = relationshipData || [];
      payload.push(parentRelationshipData);
    } else {
      payload = relationshipData || {};
      Ember.assign(payload, parentRelationshipData);
    }

    return payload;
  }

  function _findHasMany(adapter, store, internalModel, link, relationship, options) {
    var snapshot = internalModel.createSnapshot(options);
    var modelClass = store.modelFor(relationship.type);
    var promise = adapter.findHasMany(store, snapshot, link, relationship);
    var label = "DS: Handle Adapter#findHasMany of '" + internalModel.modelName + "' : '" + relationship.type + "'";
    promise = guardDestroyedStore(promise, store, label);
    promise = _guard(promise, _bind(_objectIsAlive, internalModel));
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(relationship.type);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'findHasMany');
      payload = syncRelationshipDataFromLink(store, payload, internalModel, relationship);

      var internalModelArray = store._push(payload);

      return internalModelArray;
    }, null, "DS: Extract payload of '" + internalModel.modelName + "' : hasMany '" + relationship.type + "'");
  }
  function _findBelongsTo(adapter, store, internalModel, link, relationship, options) {
    var snapshot = internalModel.createSnapshot(options);
    var modelClass = store.modelFor(relationship.type);
    var promise = adapter.findBelongsTo(store, snapshot, link, relationship);
    var label = "DS: Handle Adapter#findBelongsTo of " + internalModel.modelName + " : " + relationship.type;
    promise = guardDestroyedStore(promise, store, label);
    promise = _guard(promise, _bind(_objectIsAlive, internalModel));
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(relationship.type);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'findBelongsTo');

      if (!payload.data) {
        return null;
      }

      payload = syncRelationshipDataFromLink(store, payload, internalModel, relationship);
      return store._push(payload);
    }, null, "DS: Extract payload of " + internalModel.modelName + " : " + relationship.type);
  }
  function _findAll(adapter, store, modelName, options) {
    var modelClass = store.modelFor(modelName); // adapter.findAll depends on the class

    var recordArray = store.peekAll(modelName);

    var snapshotArray = recordArray._createSnapshot(options);

    var promise = Ember.RSVP.Promise.resolve().then(function () {
      return adapter.findAll(store, modelClass, null, snapshotArray);
    });
    var label = 'DS: Handle Adapter#findAll of ' + modelClass;
    promise = guardDestroyedStore(promise, store, label);
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(modelName);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'findAll');

      store._push(payload);

      store._didUpdateAll(modelName);

      return recordArray;
    }, null, 'DS: Extract payload of findAll ${modelName}');
  }
  function _query(adapter, store, modelName, query, recordArray, options) {
    var modelClass = store.modelFor(modelName); // adapter.query needs the class

    recordArray = recordArray || store.recordArrayManager.createAdapterPopulatedRecordArray(modelName, query);
    var promise = Ember.RSVP.Promise.resolve().then(function () {
      return adapter.query(store, modelClass, query, recordArray, options);
    });
    var label = "DS: Handle Adapter#query of " + modelName;
    promise = guardDestroyedStore(promise, store, label);
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(modelName);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'query');

      var internalModels = store._push(payload);

      if (recordArray) {
        recordArray._setInternalModels(internalModels, payload);
      } else {
        recordArray = store.recordArrayManager.createAdapterPopulatedRecordArray(modelName, query, internalModels, payload);
      }

      return recordArray;
    }, null, "DS: Extract payload of query " + modelName);
  }
  function _queryRecord(adapter, store, modelName, query, options) {
    var modelClass = store.modelFor(modelName); // adapter.queryRecord needs the class

    var promise = Ember.RSVP.Promise.resolve().then(function () {
      return adapter.queryRecord(store, modelClass, query, options);
    });
    var label = "DS: Handle Adapter#queryRecord of " + modelName;
    promise = guardDestroyedStore(promise, store, label);
    return promise.then(function (adapterPayload) {
      var serializer = store.serializerFor(modelName);
      var payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, null, 'queryRecord');
      return store._push(payload);
    }, null, "DS: Extract payload of queryRecord " + modelName);
  }

  function _defineProperties$6(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$6(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$6(Constructor.prototype, protoProps); if (staticProps) _defineProperties$6(Constructor, staticProps); return Constructor; }

  /**
    @module @ember-data/store
  */

  /**
    @class SnapshotRecordArray
    @private
    @constructor
    @param {Array} snapshots An array of snapshots
    @param {Object} meta
  */
  var SnapshotRecordArray =
  /*#__PURE__*/
  function () {
    function SnapshotRecordArray(recordArray, meta, options) {
      if (options === void 0) {
        options = {};
      }

      /**
        An array of snapshots
        @private
        @property _snapshots
        @type {Array}
      */
      this._snapshots = null;
      /**
        An array of records
        @private
        @property _recordArray
        @type {Array}
      */

      this._recordArray = recordArray;
      /**
        Number of records in the array
         Example
         ```app/adapters/post.js
        import JSONAPIAdapter from '@ember-data/adapter/json-api';
         export default JSONAPIAdapter.extend({
          shouldReloadAll(store, snapshotRecordArray) {
            return !snapshotRecordArray.length;
          },
        });
        ```
         @property length
        @type {Number}
      */

      this.length = recordArray.get('length');
      this._type = null;
      /**
        Meta objects for the record array.
         Example
         ```app/adapters/post.js
        import JSONAPIAdapter from '@ember-data/adapter/json-api';
         export default JSONAPIAdapter.extend({
          shouldReloadAll(store, snapshotRecordArray) {
            var lastRequestTime = snapshotRecordArray.meta.lastRequestTime;
            var twentyMinutes = 20 * 60 * 1000;
            return Date.now() > lastRequestTime + twentyMinutes;
          },
        });
        ```
         @property meta
        @type {Object}
      */

      this.meta = meta;
      /**
        A hash of adapter options passed into the store method for this request.
         Example
         ```app/adapters/post.js
        import MyCustomAdapter from './custom-adapter';
         export default MyCustomAdapter.extend({
          findAll(store, type, sinceToken, snapshotRecordArray) {
            if (snapshotRecordArray.adapterOptions.subscribe) {
              // ...
            }
            // ...
          }
        });
        ```
         @property adapterOptions
        @type {Object}
      */

      this.adapterOptions = options.adapterOptions;
      /**
        The relationships to include for this request.
         Example
         ```app/adapters/application.js
        import Adapter from '@ember-data/adapter';
         export default Adapter.extend({
          findAll(store, type, snapshotRecordArray) {
            var url = `/${type.modelName}?include=${encodeURIComponent(snapshotRecordArray.include)}`;
             return fetch(url).then((response) => response.json())
          }
        });
         @property include
        @type {String|Array}
      */

      this.include = options.include;
    }
    /**
      The type of the underlying records for the snapshots in the array, as a Model
      @property type
      @type {Model}
    */


    var _proto = SnapshotRecordArray.prototype;

    /**
      Get snapshots of the underlying record array
       Example
       ```app/adapters/post.js
      import JSONAPIAdapter from '@ember-data/adapter/json-api';
       export default JSONAPIAdapter.extend({
        shouldReloadAll(store, snapshotArray) {
          var snapshots = snapshotArray.snapshots();
           return snapshots.any(function(ticketSnapshot) {
            var timeDiff = moment().diff(ticketSnapshot.attr('lastAccessedAt'), 'minutes');
            if (timeDiff > 20) {
              return true;
            } else {
              return false;
            }
          });
        }
      });
      ```
       @method snapshots
      @return {Array} Array of snapshots
    */
    _proto.snapshots = function snapshots() {
      if (this._snapshots !== null) {
        return this._snapshots;
      }

      this._snapshots = this._recordArray._takeSnapshot();
      return this._snapshots;
    };

    _createClass$6(SnapshotRecordArray, [{
      key: "type",
      get: function get() {
        return this._type || (this._type = this._recordArray.get('type'));
      }
      /**
        The modelName of the underlying records for the snapshots in the array, as a Model
        @property type
        @type {Model}
      */

    }, {
      key: "modelName",
      get: function get() {
        return this._recordArray.modelName;
      }
    }]);

    return SnapshotRecordArray;
  }();

  /**
    @module @ember-data/store
  */
  /**
    A record array is an array that contains records of a certain modelName. The record
    array materializes records as needed when they are retrieved for the first
    time. You should not create record arrays yourself. Instead, an instance of
    `RecordArray` or its subclasses will be returned by your application's store
    in response to queries.

    @class RecordArray
    @extends ArrayProxy
    @uses Ember.Evented
  */

  var RecordArray = Ember.ArrayProxy.extend(DeprecatedEvented, {
    init: function init() {

      this._super.apply(this, arguments);
      /**
        The array of client ids backing the record array. When a
        record is requested from the record array, the record
        for the client id at the same index is materialized, if
        necessary, by the store.
         @property content
        @private
        @type Ember.Array
        */


      this.set('content', this.content || null);
      /**
      The flag to signal a `RecordArray` is finished loading data.
       Example
       ```javascript
      var people = store.peekAll('person');
      people.get('isLoaded'); // true
      ```
       @property isLoaded
      @type Boolean
      */

      this.isLoaded = this.isLoaded || false;
      /**
      The flag to signal a `RecordArray` is currently loading data.
       Example
       ```javascript
      var people = store.peekAll('person');
      people.get('isUpdating'); // false
      people.update();
      people.get('isUpdating'); // true
      ```
       @property isUpdating
      @type Boolean
      */

      this.isUpdating = false;
      /**
      The store that created this record array.
       @property store
      @private
      @type Store
      */

      this.store = this.store || null;
      this._updatingPromise = null;
    },
    replace: function replace() {
      throw new Error("The result of a server query (for all " + this.modelName + " types) is immutable. To modify contents, use toArray()");
    },

    /**
     The modelClass represented by this record array.
      @property type
     @type Model
     */
    type: Ember.computed('modelName', function () {
      if (!this.modelName) {
        return null;
      }

      return this.store.modelFor(this.modelName);
    }).readOnly(),

    /**
      Retrieves an object from the content by index.
       @method objectAtContent
      @private
      @param {Number} index
      @return {Model} record
    */
    objectAtContent: function objectAtContent(index) {
      var internalModel = Ember.get(this, 'content').objectAt(index);
      return internalModel && internalModel.getRecord();
    },

    /**
      Used to get the latest version of all of the records in this array
      from the adapter.
       Example
       ```javascript
      var people = store.peekAll('person');
      people.get('isUpdating'); // false
       people.update().then(function() {
        people.get('isUpdating'); // false
      });
       people.get('isUpdating'); // true
      ```
       @method update
    */
    update: function update() {
      var _this2 = this;

      if (Ember.get(this, 'isUpdating')) {
        return this._updatingPromise;
      }

      this.set('isUpdating', true);

      var updatingPromise = this._update().finally(function () {
        _this2._updatingPromise = null;

        if (_this2.get('isDestroying') || _this2.get('isDestroyed')) {
          return;
        }

        _this2.set('isUpdating', false);
      });

      this._updatingPromise = updatingPromise;
      return updatingPromise;
    },

    /*
      Update this RecordArray and return a promise which resolves once the update
      is finished.
     */
    _update: function _update() {
      return this.store.findAll(this.modelName, {
        reload: true
      });
    },

    /**
      Adds an internal model to the `RecordArray` without duplicates
       @method _pushInternalModels
      @private
      @param {InternalModel} internalModel
    */
    _pushInternalModels: function _pushInternalModels(internalModels) {
      // pushObjects because the internalModels._recordArrays set was already
      // consulted for inclusion, so addObject and its on .contains call is not
      // required.
      Ember.get(this, 'content').pushObjects(internalModels);
    },

    /**
      Removes an internalModel to the `RecordArray`.
       @method removeInternalModel
      @private
      @param {InternalModel} internalModel
    */
    _removeInternalModels: function _removeInternalModels(internalModels) {
      Ember.get(this, 'content').removeObjects(internalModels);
    },

    /**
      Saves all of the records in the `RecordArray`.
       Example
       ```javascript
      var messages = store.peekAll('message');
      messages.forEach(function(message) {
        message.set('hasBeenSeen', true);
      });
      messages.save();
      ```
       @method save
      @return {PromiseArray} promise
    */
    save: function save() {
      var _this3 = this;

      var promiseLabel = "DS: RecordArray#save " + this.modelName;
      var promise = Ember.RSVP.Promise.all(this.invoke('save'), promiseLabel).then(function () {
        return _this3;
      }, null, 'DS: RecordArray#save return RecordArray');
      return PromiseArray.create({
        promise: promise
      });
    },
    _dissociateFromOwnRecords: function _dissociateFromOwnRecords() {
      var _this4 = this;

      this.get('content').forEach(function (internalModel) {
        var recordArrays = internalModel.__recordArrays;

        if (recordArrays) {
          recordArrays.delete(_this4);
        }
      });
    },

    /**
      @method _unregisterFromManager
      @private
    */
    _unregisterFromManager: function _unregisterFromManager() {
      this.manager.unregisterRecordArray(this);
    },
    willDestroy: function willDestroy() {
      this._unregisterFromManager();

      this._dissociateFromOwnRecords(); // TODO: we should not do work during destroy:
      //   * when objects are destroyed, they should simply be left to do
      //   * if logic errors do to this, that logic needs to be more careful during
      //    teardown (ember provides isDestroying/isDestroyed) for this reason
      //   * the exception being: if an dominator has a reference to this object,
      //     and must be informed to release e.g. e.g. removing itself from th
      //     recordArrayMananger


      Ember.set(this, 'content', null);
      Ember.set(this, 'length', 0);

      this._super.apply(this, arguments);
    },

    /*
      @method _createSnapshot
      @private
    */
    _createSnapshot: function _createSnapshot(options) {
      // this is private for users, but public for ember-data internals
      return new SnapshotRecordArray(this, this.get('meta'), options);
    },

    /*
      @method _takeSnapshot
      @private
    */
    _takeSnapshot: function _takeSnapshot() {
      return Ember.get(this, 'content').map(function (internalModel) {
        return internalModel.createSnapshot();
      });
    }
  });

  /**
    @module @ember-data/store
  */

  /**
    Represents an ordered list of records whose order and membership is
    determined by the adapter. For example, a query sent to the adapter
    may trigger a search on the server, whose results would be loaded
    into an instance of the `AdapterPopulatedRecordArray`.

    ---

    If you want to update the array and get the latest records from the
    adapter, you can invoke [`update()`](AdapterPopulatedRecordArray/methods/update?anchor=update):

    Example

    ```javascript
    // GET /users?isAdmin=true
    store.query('user', { isAdmin: true }).then(function(admins) {

      admins.then(function() {
        console.log(admins.get("length")); // 42
      });

      // somewhere later in the app code, when new admins have been created
      // in the meantime
      //
      // GET /users?isAdmin=true
      admins.update().then(function() {
        admins.get('isUpdating'); // false
        console.log(admins.get("length")); // 123
      });

      admins.get('isUpdating'); // true
    }
    ```

    @class AdapterPopulatedRecordArray
    @extends RecordArray
  */
  var AdapterPopulatedRecordArray = RecordArray.extend({
    init: function init() {

      // yes we are touching `this` before super, but ArrayProxy has a bug that requires this.
      this.set('content', this.get('content') || Ember.A());

      this._super.apply(this, arguments);

      this.query = this.query || null;
      this.links = this.links || null;
    },
    replace: function replace() {
      throw new Error("The result of a server query (on " + this.modelName + ") is immutable.");
    },
    _update: function _update() {
      var store = Ember.get(this, 'store');
      var query = Ember.get(this, 'query');
      return store._query(this.modelName, query, this);
    },

    /**
      @method _setInternalModels
      @param {Array} internalModels
      @param {Object} payload normalized payload
      @private
    */
    _setInternalModels: function _setInternalModels(internalModels, payload) {
      // TODO: initial load should not cause change events at all, only
      // subsequent. This requires changing the public api of adapter.query, but
      // hopefully we can do that soon.
      this.get('content').setObjects(internalModels);
      this.setProperties({
        isLoaded: true,
        isUpdating: false,
        meta: Ember.assign({}, payload.meta),
        links: Ember.assign({}, payload.links)
      });

      this.manager._associateWithRecordArray(internalModels, this);

      var _hasDidLoad =  this.has('didLoad');

      if (_hasDidLoad) {
        // TODO: should triggering didLoad event be the last action of the runLoop?
        Ember.run.once(this, 'trigger', 'didLoad');
      }
    }
  });

  var emberRun$1 = Ember.run.backburner;
  /**
    @class RecordArrayManager
    @private
  */

  var RecordArrayManager =
  /*#__PURE__*/
  function () {
    function RecordArrayManager(options) {
      this.store = options.store;
      this.isDestroying = false;
      this.isDestroyed = false;
      this._liveRecordArrays = Object.create(null);
      this._pending = Object.create(null);
      this._adapterPopulatedRecordArrays = [];
    }

    var _proto = RecordArrayManager.prototype;

    _proto.recordDidChange = function recordDidChange(internalModel) {
      // TODO: change name
      // TODO: track that it was also a change
      this.internalModelDidChange(internalModel);
    };

    _proto.recordWasLoaded = function recordWasLoaded(internalModel) {
      // TODO: change name
      // TODO: track that it was also that it was first loaded
      this.internalModelDidChange(internalModel);
    };

    _proto.internalModelDidChange = function internalModelDidChange(internalModel) {
      var modelName = internalModel.modelName;

      if (internalModel._pendingRecordArrayManagerFlush) {
        return;
      }

      internalModel._pendingRecordArrayManagerFlush = true;
      var pending = this._pending;
      var models = pending[modelName] = pending[modelName] || [];

      if (models.push(internalModel) !== 1) {
        return;
      }

      emberRun$1.schedule('actions', this, this._flush);
    };

    _proto._flushPendingInternalModelsForModelName = function _flushPendingInternalModelsForModelName(modelName, internalModels) {
      var modelsToRemove = [];

      for (var j = 0; j < internalModels.length; j++) {
        var internalModel = internalModels[j]; // mark internalModels, so they can once again be processed by the
        // recordArrayManager

        internalModel._pendingRecordArrayManagerFlush = false; // build up a set of models to ensure we have purged correctly;

        if (internalModel.isHiddenFromRecordArrays()) {
          modelsToRemove.push(internalModel);
        }
      }

      var array = this._liveRecordArrays[modelName];

      if (array) {
        // TODO: skip if it only changed
        // process liveRecordArrays
        this.updateLiveRecordArray(array, internalModels);
      } // process adapterPopulatedRecordArrays


      if (modelsToRemove.length > 0) {
        removeFromAdapterPopulatedRecordArrays(modelsToRemove);
      }
    };

    _proto._flush = function _flush() {
      var pending = this._pending;
      this._pending = Object.create(null);

      for (var modelName in pending) {
        this._flushPendingInternalModelsForModelName(modelName, pending[modelName]);
      }
    };

    _proto.updateLiveRecordArray = function updateLiveRecordArray(array, internalModels) {
      return _updateLiveRecordArray(array, internalModels);
    };

    _proto._syncLiveRecordArray = function _syncLiveRecordArray(array, modelName) {
      var pending = this._pending[modelName];
      var hasPendingChanges = Array.isArray(pending);
      var hasNoPotentialDeletions = !hasPendingChanges || pending.length === 0;
      var map = internalModelFactoryFor(this.store).modelMapFor(modelName);
      var hasNoInsertionsOrRemovals = Ember.get(map, 'length') === Ember.get(array, 'length');
      /*
        Ideally the recordArrayManager has knowledge of the changes to be applied to
        liveRecordArrays, and is capable of strategically flushing those changes and applying
        small diffs if desired.  However, until we've refactored recordArrayManager, this dirty
        check prevents us from unnecessarily wiping out live record arrays returned by peekAll.
        */

      if (hasNoPotentialDeletions && hasNoInsertionsOrRemovals) {
        return;
      }

      if (hasPendingChanges) {
        this._flushPendingInternalModelsForModelName(modelName, pending);

        delete this._pending[modelName];
      }

      var internalModels = this._visibleInternalModelsByType(modelName);

      var modelsToAdd = [];

      for (var i = 0; i < internalModels.length; i++) {
        var internalModel = internalModels[i];
        var recordArrays = internalModel._recordArrays;

        if (recordArrays.has(array) === false) {
          recordArrays.add(array);
          modelsToAdd.push(internalModel);
        }
      }

      if (modelsToAdd.length) {
        array._pushInternalModels(modelsToAdd);
      }
    };

    _proto._didUpdateAll = function _didUpdateAll(modelName) {
      var recordArray = this._liveRecordArrays[modelName];

      if (recordArray) {
        Ember.set(recordArray, 'isUpdating', false);
      }
    }
    /**
      Get the `RecordArray` for a modelName, which contains all loaded records of
      given modelName.
       @method liveRecordArrayFor
      @param {String} modelName
      @return {RecordArray}
    */
    ;

    _proto.liveRecordArrayFor = function liveRecordArrayFor(modelName) {
      var array = this._liveRecordArrays[modelName];

      if (array) {
        // if the array already exists, synchronize
        this._syncLiveRecordArray(array, modelName);
      } else {
        // if the array is being newly created merely create it with its initial
        // content already set. This prevents unneeded change events.
        var internalModels = this._visibleInternalModelsByType(modelName);

        array = this.createRecordArray(modelName, internalModels);
        this._liveRecordArrays[modelName] = array;
      }

      return array;
    };

    _proto._visibleInternalModelsByType = function _visibleInternalModelsByType(modelName) {
      var all = internalModelFactoryFor(this.store).modelMapFor(modelName)._models;

      var visible = [];

      for (var i = 0; i < all.length; i++) {
        var model = all[i];

        if (model.isHiddenFromRecordArrays() === false) {
          visible.push(model);
        }
      }

      return visible;
    }
    /**
      Create a `RecordArray` for a modelName.
       @method createRecordArray
      @param {String} modelName
      @param {Array} _content (optional|private)
      @return {RecordArray}
    */
    ;

    _proto.createRecordArray = function createRecordArray(modelName, content) {
      var array = RecordArray.create({
        modelName: modelName,
        content: Ember.A(content || []),
        store: this.store,
        isLoaded: true,
        manager: this
      });

      if (Array.isArray(content)) {
        associateWithRecordArray(content, array);
      }

      return array;
    }
    /**
      Create a `AdapterPopulatedRecordArray` for a modelName with given query.
       @method createAdapterPopulatedRecordArray
      @param {String} modelName
      @param {Object} query
      @return {AdapterPopulatedRecordArray}
    */
    ;

    _proto.createAdapterPopulatedRecordArray = function createAdapterPopulatedRecordArray(modelName, query, internalModels, payload) {
      var array;

      if (Array.isArray(internalModels)) {
        array = AdapterPopulatedRecordArray.create({
          modelName: modelName,
          query: query,
          content: Ember.A(internalModels),
          store: this.store,
          manager: this,
          isLoaded: true,
          isUpdating: false,
          meta: Ember.assign({}, payload.meta),
          links: Ember.assign({}, payload.links)
        });
        associateWithRecordArray(internalModels, array);
      } else {
        array = AdapterPopulatedRecordArray.create({
          modelName: modelName,
          query: query,
          content: Ember.A(),
          store: this.store,
          manager: this
        });
      }

      this._adapterPopulatedRecordArrays.push(array);

      return array;
    }
    /**
      Unregister a RecordArray.
      So manager will not update this array.
       @method unregisterRecordArray
      @param {RecordArray} array
    */
    ;

    _proto.unregisterRecordArray = function unregisterRecordArray(array) {
      var modelName = array.modelName; // remove from adapter populated record array

      var removedFromAdapterPopulated = remove(this._adapterPopulatedRecordArrays, array);

      if (!removedFromAdapterPopulated) {
        var liveRecordArrayForType = this._liveRecordArrays[modelName]; // unregister live record array

        if (liveRecordArrayForType) {
          if (array === liveRecordArrayForType) {
            delete this._liveRecordArrays[modelName];
          }
        }
      }
    };

    _proto._associateWithRecordArray = function _associateWithRecordArray(internalModels, array) {
      associateWithRecordArray(internalModels, array);
    };

    _proto.willDestroy = function willDestroy() {
      var _this = this;

      Object.keys(this._liveRecordArrays).forEach(function (modelName) {
        return _this._liveRecordArrays[modelName].destroy();
      });

      this._adapterPopulatedRecordArrays.forEach(destroy);

      this.isDestroyed = true;
    };

    _proto.destroy = function destroy() {
      this.isDestroying = true;
      emberRun$1.schedule('actions', this, this.willDestroy);
    };

    return RecordArrayManager;
  }();

  function destroy(entry) {
    entry.destroy();
  }

  function remove(array, item) {
    var index = array.indexOf(item);

    if (index !== -1) {
      array.splice(index, 1);
      return true;
    }

    return false;
  }

  function _updateLiveRecordArray(array, internalModels) {
    var modelsToAdd = [];
    var modelsToRemove = [];

    for (var i = 0; i < internalModels.length; i++) {
      var internalModel = internalModels[i];
      var isDeleted = internalModel.isHiddenFromRecordArrays();
      var recordArrays = internalModel._recordArrays;

      if (!isDeleted && !internalModel.isEmpty()) {
        if (!recordArrays.has(array)) {
          modelsToAdd.push(internalModel);
          recordArrays.add(array);
        }
      }

      if (isDeleted) {
        modelsToRemove.push(internalModel);
        recordArrays.delete(array);
      }
    }

    if (modelsToAdd.length > 0) {
      array._pushInternalModels(modelsToAdd);
    }

    if (modelsToRemove.length > 0) {
      array._removeInternalModels(modelsToRemove);
    } // return whether we performed an update.
    // Necessary until 3.5 allows us to finish off ember-data-filter support.


    return (modelsToAdd.length || modelsToRemove.length) > 0;
  }

  function removeFromAdapterPopulatedRecordArrays(internalModels) {
    for (var i = 0; i < internalModels.length; i++) {
      var internalModel = internalModels[i];
      var list = internalModel._recordArrays.list;

      for (var j = 0; j < list.length; j++) {
        // TODO: group by arrays, so we can batch remove
        list[j]._removeInternalModels([internalModel]);
      }

      internalModel._recordArrays.clear();
    }
  }

  function associateWithRecordArray(internalModels, array) {
    for (var i = 0, l = internalModels.length; i < l; i++) {
      var internalModel = internalModels[i];

      internalModel._recordArrays.add(array);
    }
  }

  /**
    @module @ember-data/store
  */

  /*
    This method normalizes a link to an "links object". If the passed link is
    already an object it's returned without any modifications.

    See http://jsonapi.org/format/#document-links for more information.

    @method _normalizeLink
    @private
    @param {String} link
    @return {Object|null}
  */
  function _normalizeLink(link) {
    switch (typeof link) {
      case 'object':
        return link;

      case 'string':
        return {
          href: link
        };
    }

    return null;
  }

  function _defineProperties$7(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$7(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$7(Constructor.prototype, protoProps); if (staticProps) _defineProperties$7(Constructor, staticProps); return Constructor; }
  /**
    @module @ember-data/store
  */

  var Relationship =
  /*#__PURE__*/
  function () {
    function Relationship(store, inverseKey, relationshipMeta, recordData, inverseIsAsync) {
      this.inverseIsAsync = void 0;
      this.kind = void 0;
      this.recordData = void 0;
      this.members = void 0;
      this.canonicalMembers = void 0;
      this.store = void 0;
      this.key = void 0;
      this.inverseKey = void 0;
      this.isAsync = void 0;
      this.isPolymorphic = void 0;
      this.relationshipMeta = void 0;
      this.inverseKeyForImplicit = void 0;
      this.meta = void 0;
      this.__inverseMeta = void 0;
      this._tempModelName = void 0;
      this.shouldForceReload = false;
      this.relationshipIsStale = void 0;
      this.hasDematerializedInverse = void 0;
      this.hasAnyRelationshipData = void 0;
      this.relationshipIsEmpty = void 0;
      this.hasFailedLoadAttempt = false;
      this.link = void 0;
      this.willSync = void 0;
      this.inverseIsAsync = inverseIsAsync;
      this.kind = relationshipMeta.kind;
      var async = relationshipMeta.options.async;
      var polymorphic = relationshipMeta.options.polymorphic;
      this.recordData = recordData;
      this.members = new EmberDataOrderedSet();
      this.canonicalMembers = new EmberDataOrderedSet();
      this.store = store;
      this.key = relationshipMeta.key || null;
      this.inverseKey = inverseKey;
      this.isAsync = typeof async === 'undefined' ? true : async;
      this.isPolymorphic = typeof polymorphic === 'undefined' ? false : polymorphic;
      this.relationshipMeta = relationshipMeta; //This probably breaks for polymorphic relationship in complex scenarios, due to
      //multiple possible modelNames

      this.inverseKeyForImplicit = this._tempModelName + this.key;
      this.meta = null;
      this.__inverseMeta = undefined;
      /*
       This flag forces fetch. `true` for a single request once `reload()`
         has been called `false` at all other times.
      */
      // this.shouldForceReload = false;

      /*
         This flag indicates whether we should
          re-fetch the relationship the next time
          it is accessed.
           The difference between this flag and `shouldForceReload`
          is in how we treat the presence of partially missing data:
            - for a forced reload, we will reload the link or EVERY record
            - for a stale reload, we will reload the link (if present) else only MISSING records
           Ideally these flags could be merged, but because we don't give the
          request layer the option of deciding how to resolve the data being queried
          we are forced to differentiate for now.
           It is also possible for a relationship to remain stale after a forced reload; however,
          in this case `hasFailedLoadAttempt` ought to be `true`.
         false when
          => recordData.isNew() on initial setup
          => a previously triggered request has resolved
          => we get relationship data via push
         true when
          => !recordData.isNew() on initial setup
          => an inverse has been unloaded
          => we get a new link for the relationship
         TODO @runspired unskip the acceptance tests and fix these flags
       */

      this.relationshipIsStale = false;
      /*
       This flag indicates whether we should
        **partially** re-fetch the relationship the
        next time it is accessed.
       false when
        => initial setup
        => a previously triggered request has resolved
       true when
        => an inverse has been unloaded
      */

      this.hasDematerializedInverse = false;
      /*
        This flag indicates whether we should consider the content
         of this relationship "known".
         If we have no relationship knowledge, and the relationship
         is `async`, we will attempt to fetch the relationship on
         access if it is also stale.
        Snapshot uses this to tell the difference between unknown
        (`undefined`) or empty (`null`). The reason for this is that
        we wouldn't want to serialize  unknown relationships as `null`
        as that might overwrite remote state.
         All relationships for a newly created (`store.createRecord()`) are
         considered known (`hasAnyRelationshipData === true`).
         true when
          => we receive a push with either new data or explicit empty (`[]` or `null`)
          => the relationship is a belongsTo and we have received data from
               the other side.
         false when
          => we have received no signal about what data belongs in this relationship
          => the relationship is a hasMany and we have only received data from
              the other side.
       */

      this.hasAnyRelationshipData = false;
      /*
        Flag that indicates whether an empty relationship is explicitly empty
          (signaled by push giving us an empty array or null relationship)
          e.g. an API response has told us that this relationship is empty.
         Thus far, it does not appear that we actually need this flag; however,
          @runspired has found it invaluable when debugging relationship tests
          to determine whether (and why if so) we are in an incorrect state.
         true when
          => we receive a push with explicit empty (`[]` or `null`)
          => we have received no signal about what data belongs in this relationship
          => on initial create (as no signal is known yet)
         false at all other times
       */

      this.relationshipIsEmpty = true;
      /*
        Flag def here for reference, defined as getter in has-many.js / belongs-to.js
         true when
          => hasAnyRelationshipData is true
          AND
          => members (NOT canonicalMembers) @each !isEmpty
         TODO, consider changing the conditional here from !isEmpty to !hiddenFromRecordArrays
      */
      // TODO do we want this anymore? Seems somewhat useful
      //   especially if we rename to `hasUpdatedLink`
      //   which would tell us slightly more about why the
      //   relationship is stale
      // this.updatedLink = false;
    }

    var _proto = Relationship.prototype;

    _proto._inverseIsAsync = function _inverseIsAsync() {
      return !!this.inverseIsAsync;
    };

    _proto._inverseIsSync = function _inverseIsSync() {
      return !!(this.inverseKey && !this.inverseIsAsync);
    };

    _proto._hasSupportForImplicitRelationships = function _hasSupportForImplicitRelationships(recordData) {
      return recordData._implicitRelationships !== undefined && recordData._implicitRelationships !== null;
    };

    _proto._hasSupportForRelationships = function _hasSupportForRelationships(recordData) {
      return recordData._relationships !== undefined && recordData._relationships !== null;
    };

    _proto.recordDataDidDematerialize = function recordDataDidDematerialize() {
      var _this = this;

      var inverseKey = this.inverseKey;

      if (!inverseKey) {
        return;
      } // we actually want a union of members and canonicalMembers
      // they should be disjoint but currently are not due to a bug


      this.forAllMembers(function (inverseRecordData) {
        if (!_this._hasSupportForRelationships(inverseRecordData)) {
          return;
        }

        var relationship = relationshipStateFor(inverseRecordData, inverseKey);

        var belongsToRelationship = inverseRecordData.getBelongsTo(inverseKey)._relationship; // For canonical members, it is possible that inverseRecordData has already been associated to
        // to another record. For such cases, do not dematerialize the inverseRecordData


        if (!belongsToRelationship || !belongsToRelationship.inverseRecordData || _this.recordData === belongsToRelationship.inverseRecordData) {
          relationship.inverseDidDematerialize(_this.recordData);
        }
      });
    };

    _proto.forAllMembers = function forAllMembers(callback) {
      var seen = Object.create(null);

      for (var i = 0; i < this.members.list.length; i++) {
        var inverseInternalModel = this.members.list[i];
        var id = Ember.guidFor(inverseInternalModel);

        if (!seen[id]) {
          seen[id] = true;
          callback(inverseInternalModel);
        }
      }

      for (var _i = 0; _i < this.canonicalMembers.list.length; _i++) {
        var _inverseInternalModel = this.canonicalMembers.list[_i];

        var _id = Ember.guidFor(_inverseInternalModel);

        if (!seen[_id]) {
          seen[_id] = true;
          callback(_inverseInternalModel);
        }
      }
    };

    _proto.inverseDidDematerialize = function inverseDidDematerialize(inverseRecordData) {
      if (!this.isAsync || inverseRecordData && inverseRecordData.isNew()) {
        // unloading inverse of a sync relationship is treated as a client-side
        // delete, so actually remove the models don't merely invalidate the cp
        // cache.
        // if the record being unloaded only exists on the client, we similarly
        // treat it as a client side delete
        this.removeRecordDataFromOwn(inverseRecordData);
        this.removeCanonicalRecordDataFromOwn(inverseRecordData);
        this.setRelationshipIsEmpty(true);
      } else {
        this.setHasDematerializedInverse(true);
      }
    };

    _proto.updateMeta = function updateMeta(meta) {
      this.meta = meta;
    };

    _proto.clear = function clear() {
      var members = this.members.list;

      while (members.length > 0) {
        var member = members[0];
        this.removeRecordData(member);
      }

      var canonicalMembers = this.canonicalMembers.list;

      while (canonicalMembers.length > 0) {
        var _member = canonicalMembers[0];
        this.removeCanonicalRecordData(_member);
      }
    };

    _proto.removeAllRecordDatasFromOwn = function removeAllRecordDatasFromOwn() {
      this.setRelationshipIsStale(true);
      this.members.clear();
    };

    _proto.removeAllCanonicalRecordDatasFromOwn = function removeAllCanonicalRecordDatasFromOwn() {
      this.canonicalMembers.clear();
      this.flushCanonicalLater();
    };

    _proto.removeRecordDatas = function removeRecordDatas(recordDatas) {
      var _this2 = this;

      recordDatas.forEach(function (recordData) {
        return _this2.removeRecordData(recordData);
      });
    };

    _proto.addRecordDatas = function addRecordDatas(recordDatas, idx) {
      var _this3 = this;

      recordDatas.forEach(function (recordData) {
        _this3.addRecordData(recordData, idx);

        if (idx !== undefined) {
          idx++;
        }
      });
    };

    _proto.addCanonicalRecordDatas = function addCanonicalRecordDatas(recordDatas, idx) {
      for (var i = 0; i < recordDatas.length; i++) {
        if (idx !== undefined) {
          this.addCanonicalRecordData(recordDatas[i], i + idx);
        } else {
          this.addCanonicalRecordData(recordDatas[i]);
        }
      }
    };

    _proto.addCanonicalRecordData = function addCanonicalRecordData(recordData, idx) {
      if (!this.canonicalMembers.has(recordData)) {
        this.canonicalMembers.add(recordData);
        this.setupInverseRelationship(recordData);
      }

      this.flushCanonicalLater();
      this.setHasAnyRelationshipData(true);
    };

    _proto.setupInverseRelationship = function setupInverseRelationship(recordData) {
      if (this.inverseKey) {
        if (!this._hasSupportForRelationships(recordData)) {
          return;
        }

        var relationship = relationshipStateFor(recordData, this.inverseKey); // if we have only just initialized the inverse relationship, then it
        // already has this.recordData in its canonicalMembers, so skip the
        // unnecessary work.  The exception to this is polymorphic
        // relationships whose members are determined by their inverse, as those
        // relationships cannot efficiently find their inverse payloads.

        relationship.addCanonicalRecordData(this.recordData);
      } else {
        if (!this._hasSupportForImplicitRelationships(recordData)) {
          return;
        }

        var relationships = recordData._implicitRelationships;
        var _relationship = relationships[this.inverseKeyForImplicit];

        if (!_relationship) {
          _relationship = relationships[this.inverseKeyForImplicit] = new Relationship(this.store, this.key, {
            options: {
              async: this.isAsync
            }
          }, recordData);
        }

        _relationship.addCanonicalRecordData(this.recordData);
      }
    };

    _proto.removeCanonicalRecordDatas = function removeCanonicalRecordDatas(recordDatas, idx) {
      for (var i = 0; i < recordDatas.length; i++) {
        if (idx !== undefined) {
          this.removeCanonicalRecordData(recordDatas[i], i + idx);
        } else {
          this.removeCanonicalRecordData(recordDatas[i]);
        }
      }
    };

    _proto.removeCanonicalRecordData = function removeCanonicalRecordData(recordData, idx) {
      if (this.canonicalMembers.has(recordData)) {
        this.removeCanonicalRecordDataFromOwn(recordData);

        if (this.inverseKey) {
          this.removeCanonicalRecordDataFromInverse(recordData);
        } else {
          if (this._hasSupportForImplicitRelationships(recordData) && recordData._implicitRelationships[this.inverseKeyForImplicit]) {
            recordData._implicitRelationships[this.inverseKeyForImplicit].removeCanonicalRecordData(this.recordData);
          }
        }
      }

      this.flushCanonicalLater();
    };

    _proto.addRecordData = function addRecordData(recordData, idx) {
      if (!this.members.has(recordData)) {
        this.members.addWithIndex(recordData, idx);
        this.notifyRecordRelationshipAdded(recordData, idx);

        if (this._hasSupportForRelationships(recordData) && this.inverseKey) {
          relationshipStateFor(recordData, this.inverseKey).addRecordData(this.recordData);
        } else {
          if (this._hasSupportForImplicitRelationships(recordData)) {
            if (!recordData._implicitRelationships[this.inverseKeyForImplicit]) {
              recordData._implicitRelationships[this.inverseKeyForImplicit] = new Relationship(this.store, this.key, {
                options: {
                  async: this.isAsync
                }
              }, recordData, this.isAsync);
            }

            recordData._implicitRelationships[this.inverseKeyForImplicit].addRecordData(this.recordData);
          }
        }
      }

      this.setHasAnyRelationshipData(true);
    };

    _proto.removeRecordData = function removeRecordData(recordData) {
      if (this.members.has(recordData)) {
        this.removeRecordDataFromOwn(recordData);

        if (this.inverseKey) {
          this.removeRecordDataFromInverse(recordData);
        } else {
          if (this._hasSupportForImplicitRelationships(recordData) && recordData._implicitRelationships[this.inverseKeyForImplicit]) {
            recordData._implicitRelationships[this.inverseKeyForImplicit].removeRecordData(this.recordData);
          }
        }
      }
    };

    _proto.removeRecordDataFromInverse = function removeRecordDataFromInverse(recordData) {
      if (!this._hasSupportForRelationships(recordData)) {
        return;
      }

      var inverseRelationship = relationshipStateFor(recordData, this.inverseKey); //Need to check for existence, as the record might unloading at the moment

      if (inverseRelationship) {
        inverseRelationship.removeRecordDataFromOwn(this.recordData);
      }
    };

    _proto.removeRecordDataFromOwn = function removeRecordDataFromOwn(recordData, idx) {
      this.members.delete(recordData);
    };

    _proto.removeCanonicalRecordDataFromInverse = function removeCanonicalRecordDataFromInverse(recordData) {
      if (!this._hasSupportForRelationships(recordData)) {
        return;
      }

      var inverseRelationship = relationshipStateFor(recordData, this.inverseKey); //Need to check for existence, as the record might unloading at the moment

      if (inverseRelationship) {
        inverseRelationship.removeCanonicalRecordDataFromOwn(this.recordData);
      }
    };

    _proto.removeCanonicalRecordDataFromOwn = function removeCanonicalRecordDataFromOwn(recordData, idx) {
      this.canonicalMembers.delete(recordData);
      this.flushCanonicalLater();
    }
    /*
      Call this method once a record deletion has been persisted
      to purge it from BOTH current and canonical state of all
      relationships.
       @method removeCompletelyFromInverse
      @private
     */
    ;

    _proto.removeCompletelyFromInverse = function removeCompletelyFromInverse() {
      var _this4 = this;

      if (!this.inverseKey && !this.inverseKeyForImplicit) {
        return;
      } // we actually want a union of members and canonicalMembers
      // they should be disjoint but currently are not due to a bug


      var seen = Object.create(null);
      var recordData = this.recordData;
      var unload;

      if (this.inverseKey) {
        unload = function unload(inverseRecordData) {
          var id = Ember.guidFor(inverseRecordData);

          if (_this4._hasSupportForRelationships(inverseRecordData) && seen[id] === undefined) {
            var relationship = relationshipStateFor(inverseRecordData, _this4.inverseKey);
            relationship.removeCompletelyFromOwn(recordData);
            seen[id] = true;
          }
        };
      } else {
        unload = function unload(inverseRecordData) {
          var id = Ember.guidFor(inverseRecordData);

          if (_this4._hasSupportForImplicitRelationships(inverseRecordData) && seen[id] === undefined) {
            var relationship = implicitRelationshipStateFor(inverseRecordData, _this4.inverseKeyForImplicit);
            relationship.removeCompletelyFromOwn(recordData);
            seen[id] = true;
          }
        };
      }

      this.members.forEach(unload);
      this.canonicalMembers.forEach(unload);

      if (!this.isAsync) {
        this.clear();
      }
    }
    /*
      Removes the given RecordData from BOTH canonical AND current state.
       This method is useful when either a deletion or a rollback on a new record
      needs to entirely purge itself from an inverse relationship.
     */
    ;

    _proto.removeCompletelyFromOwn = function removeCompletelyFromOwn(recordData) {
      this.canonicalMembers.delete(recordData);
      this.members.delete(recordData);
    };

    _proto.flushCanonical = function flushCanonical() {
      var list = this.members.list;
      this.willSync = false; //a hack for not removing new RecordDatas
      //TODO remove once we have proper diffing

      var newRecordDatas = [];

      for (var i = 0; i < list.length; i++) {
        // TODO Igor deal with this
        if (list[i].isNew()) {
          newRecordDatas.push(list[i]);
        }
      } //TODO(Igor) make this less abysmally slow


      this.members = this.canonicalMembers.copy();

      for (var _i2 = 0; _i2 < newRecordDatas.length; _i2++) {
        this.members.add(newRecordDatas[_i2]);
      }
    };

    _proto.flushCanonicalLater = function flushCanonicalLater() {
      if (this.willSync) {
        return;
      }

      this.willSync = true; // Reaching back into the store to use ED's runloop

      this.store._updateRelationshipState(this);
    };

    _proto.updateLink = function updateLink(link) {
      this.link = link;
    };

    _proto.updateRecordDatasFromAdapter = function updateRecordDatasFromAdapter(recordDatas) {
      this.setHasAnyRelationshipData(true); //TODO(Igor) move this to a proper place
      //TODO Once we have adapter support, we need to handle updated and canonical changes

      this.computeChanges(recordDatas);
    };

    _proto.computeChanges = function computeChanges(recordDatas) {};

    _proto.notifyRecordRelationshipAdded = function notifyRecordRelationshipAdded(recordData, idxs) {};

    _proto.setHasAnyRelationshipData = function setHasAnyRelationshipData(value) {
      this.hasAnyRelationshipData = value;
    };

    _proto.setHasDematerializedInverse = function setHasDematerializedInverse(value) {
      this.hasDematerializedInverse = value;
    };

    _proto.setRelationshipIsStale = function setRelationshipIsStale(value) {
      this.relationshipIsStale = value;
    };

    _proto.setRelationshipIsEmpty = function setRelationshipIsEmpty(value) {
      this.relationshipIsEmpty = value;
    };

    _proto.setShouldForceReload = function setShouldForceReload(value) {
      this.shouldForceReload = value;
    };

    _proto.setHasFailedLoadAttempt = function setHasFailedLoadAttempt(value) {
      this.hasFailedLoadAttempt = value;
    }
    /*
     `push` for a relationship allows the store to push a JSON API Relationship
     Object onto the relationship. The relationship will then extract and set the
     meta, data and links of that relationship.
      `push` use `updateMeta`, `updateData` and `updateLink` to update the state
     of the relationship.
     */
    ;

    _proto.push = function push(payload, initial) {
      var hasRelationshipDataProperty = false;
      var hasLink = false;

      if (payload.meta) {
        this.updateMeta(payload.meta);
      }

      if (payload.data !== undefined) {
        hasRelationshipDataProperty = true;
        this.updateData(payload.data, initial);
      } else if (this.isAsync === false && !this.hasAnyRelationshipData) {
        hasRelationshipDataProperty = true;
        var data = this.kind === 'hasMany' ? [] : null;
        this.updateData(data, initial);
      }

      if (payload.links && payload.links.related) {
        var relatedLink = _normalizeLink(payload.links.related);

        if (relatedLink && relatedLink.href && relatedLink.href !== this.link) {
          hasLink = true;
          this.updateLink(relatedLink.href);
        }
      }
      /*
       Data being pushed into the relationship might contain only data or links,
       or a combination of both.
        IF contains only data
       IF contains both links and data
        relationshipIsEmpty -> true if is empty array (has-many) or is null (belongs-to)
        hasAnyRelationshipData -> true
        hasDematerializedInverse -> false
        relationshipIsStale -> false
        allInverseRecordsAreLoaded -> run-check-to-determine
        IF contains only links
        relationshipIsStale -> true
       */


      this.setHasFailedLoadAttempt(false);

      if (hasRelationshipDataProperty) {
        var relationshipIsEmpty = payload.data === null || Array.isArray(payload.data) && payload.data.length === 0;
        this.setHasAnyRelationshipData(true);
        this.setRelationshipIsStale(false);
        this.setHasDematerializedInverse(false);
        this.setRelationshipIsEmpty(relationshipIsEmpty);
      } else if (hasLink) {
        this.setRelationshipIsStale(true);

        if (!initial) {
          var recordData = this.recordData;
          var storeWrapper = this.recordData.storeWrapper;

          if (canaryFeatures.CUSTOM_MODEL_CLASS) {
            storeWrapper.notifyBelongsToChange(recordData.modelName, recordData.id, recordData.clientId, this.key);
          } else {
            storeWrapper.notifyPropertyChange(recordData.modelName, recordData.id, recordData.clientId, // We know we are not an implicit relationship here
            this.key);
          }
        }
      }
    };

    _proto.localStateIsEmpty = function localStateIsEmpty() {};

    _proto.updateData = function updateData(payload, initial) {};

    _proto.destroy = function destroy() {};

    _createClass$7(Relationship, [{
      key: "isNew",
      get: function get() {
        return this.recordData.isNew();
      }
    }, {
      key: "_inverseMeta",
      get: function get() {
        if (this.__inverseMeta === undefined) {
          var inverseMeta = null;

          if (this.inverseKey) {
            // We know we have a full inverse relationship
            var type = this.relationshipMeta.type;
            var inverseModelClass = this.store.modelFor(type);
            var inverseRelationships = Ember.get(inverseModelClass, 'relationshipsByName');
            inverseMeta = inverseRelationships.get(this.inverseKey);
          }

          this.__inverseMeta = inverseMeta;
        }

        return this.__inverseMeta;
      }
    }]);

    return Relationship;
  }();

  function _defineProperties$8(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$8(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$8(Constructor.prototype, protoProps); if (staticProps) _defineProperties$8(Constructor, staticProps); return Constructor; }

  function _inheritsLoose$4(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
  /**
    @module @ember-data/store
  */

  var ManyRelationship =
  /*#__PURE__*/
  function (_Relationship) {
    _inheritsLoose$4(ManyRelationship, _Relationship);

    function ManyRelationship(store, inverseKey, relationshipMeta, recordData, inverseIsAsync) {
      var _this;

      _this = _Relationship.call(this, store, inverseKey, relationshipMeta, recordData, inverseIsAsync) || this;
      _this.canonicalState = void 0;
      _this.currentState = void 0;
      _this._willUpdateManyArray = void 0;
      _this._pendingManyArrayUpdates = void 0;
      _this.key = void 0;
      _this.canonicalState = [];
      _this.currentState = [];
      _this._willUpdateManyArray = false;
      _this._pendingManyArrayUpdates = null;
      _this.key = relationshipMeta.key;
      return _this;
    }

    var _proto = ManyRelationship.prototype;

    _proto.addCanonicalRecordData = function addCanonicalRecordData(recordData, idx) {
      if (this.canonicalMembers.has(recordData)) {
        return;
      }

      if (idx !== undefined) {
        this.canonicalState.splice(idx, 0, recordData);
      } else {
        this.canonicalState.push(recordData);
      }

      _Relationship.prototype.addCanonicalRecordData.call(this, recordData, idx);
    };

    _proto.inverseDidDematerialize = function inverseDidDematerialize(inverseRecordData) {
      _Relationship.prototype.inverseDidDematerialize.call(this, inverseRecordData);

      if (this.isAsync) {
        this.notifyManyArrayIsStale();
      }
    };

    _proto.addRecordData = function addRecordData(recordData, idx) {
      if (this.members.has(recordData)) {
        return;
      } // TODO Type this


      _Relationship.prototype.addRecordData.call(this, recordData, idx); // make lazy later


      if (idx === undefined) {
        idx = this.currentState.length;
      }

      this.currentState.splice(idx, 0, recordData); // TODO Igor consider making direct to remove the indirection
      // We are not lazily accessing the manyArray here because the change is coming from app side
      // this.manyArray.flushCanonical(this.currentState);

      this.notifyHasManyChange();
    };

    _proto.removeCanonicalRecordDataFromOwn = function removeCanonicalRecordDataFromOwn(recordData, idx) {
      var i = idx;

      if (!this.canonicalMembers.has(recordData)) {
        return;
      }

      if (i === undefined) {
        i = this.canonicalState.indexOf(recordData);
      }

      if (i > -1) {
        this.canonicalState.splice(i, 1);
      }

      _Relationship.prototype.removeCanonicalRecordDataFromOwn.call(this, recordData, idx); //TODO(Igor) Figure out what to do here

    };

    _proto.removeAllCanonicalRecordDatasFromOwn = function removeAllCanonicalRecordDatasFromOwn() {
      _Relationship.prototype.removeAllCanonicalRecordDatasFromOwn.call(this);

      this.canonicalMembers.clear();
      this.canonicalState.splice(0, this.canonicalState.length);

      _Relationship.prototype.removeAllCanonicalRecordDatasFromOwn.call(this);
    } //TODO(Igor) DO WE NEED THIS?
    ;

    _proto.removeCompletelyFromOwn = function removeCompletelyFromOwn(recordData) {
      _Relationship.prototype.removeCompletelyFromOwn.call(this, recordData); // TODO SkEPTICAL


      var canonicalIndex = this.canonicalState.indexOf(recordData);

      if (canonicalIndex !== -1) {
        this.canonicalState.splice(canonicalIndex, 1);
      }

      this.removeRecordDataFromOwn(recordData);
    };

    _proto.flushCanonical = function flushCanonical() {
      var toSet = this.canonicalState; //a hack for not removing new records
      //TODO remove once we have proper diffing

      var newRecordDatas = this.currentState.filter( // only add new internalModels which are not yet in the canonical state of this
      // relationship (a new internalModel can be in the canonical state if it has
      // been 'acknowleged' to be in the relationship via a store.push)
      //TODO Igor deal with this
      function (recordData) {
        return recordData.isNew() && toSet.indexOf(recordData) === -1;
      });
      toSet = toSet.concat(newRecordDatas);
      /*
      if (this._manyArray) {
        this._manyArray.flushCanonical(toSet);
      }
      */

      this.currentState = toSet;

      _Relationship.prototype.flushCanonical.call(this); // Once we clean up all the flushing, we will be left with at least the notifying part


      this.notifyHasManyChange();
    } //TODO(Igor) idx not used currently, fix
    ;

    _proto.removeRecordDataFromOwn = function removeRecordDataFromOwn(recordData, idx) {
      _Relationship.prototype.removeRecordDataFromOwn.call(this, recordData, idx);

      var index = idx || this.currentState.indexOf(recordData); //TODO IGOR DAVID INVESTIGATE

      if (index === -1) {
        return;
      }

      this.currentState.splice(index, 1); // TODO Igor consider making direct to remove the indirection
      // We are not lazily accessing the manyArray here because the change is coming from app side

      this.notifyHasManyChange(); // this.manyArray.flushCanonical(this.currentState);
    };

    _proto.notifyRecordRelationshipAdded = function notifyRecordRelationshipAdded() {
      this.notifyHasManyChange();
    };

    _proto.computeChanges = function computeChanges(recordDatas) {
      if (recordDatas === void 0) {
        recordDatas = [];
      }

      var members = this.canonicalMembers;
      var recordDatasToRemove = [];
      var recordDatasSet = setForArray(recordDatas);
      members.forEach(function (member) {
        if (recordDatasSet.has(member)) {
          return;
        }

        recordDatasToRemove.push(member);
      });
      this.removeCanonicalRecordDatas(recordDatasToRemove);

      for (var i = 0, l = recordDatas.length; i < l; i++) {
        var recordData = recordDatas[i];
        this.removeCanonicalRecordData(recordData);
        this.addCanonicalRecordData(recordData, i);
      }
    };

    _proto.setInitialRecordDatas = function setInitialRecordDatas(recordDatas) {
      if (Array.isArray(recordDatas) === false || !recordDatas || recordDatas.length === 0) {
        return;
      }

      for (var i = 0; i < recordDatas.length; i++) {
        var recordData = recordDatas[i];

        if (this.canonicalMembers.has(recordData)) {
          continue;
        }

        this.canonicalMembers.add(recordData);
        this.members.add(recordData);
        this.setupInverseRelationship(recordData);
      }

      this.canonicalState = this.canonicalMembers.toArray();
    }
    /*
      This is essentially a "sync" version of
        notifyHasManyChange. We should work to unify
        these worlds
         - @runspired
    */
    ;

    _proto.notifyManyArrayIsStale = function notifyManyArrayIsStale() {
      var recordData = this.recordData;
      var storeWrapper = recordData.storeWrapper;

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        storeWrapper.notifyHasManyChange(recordData.modelName, recordData.id, recordData.clientId, this.key);
      } else {
        storeWrapper.notifyPropertyChange(recordData.modelName, recordData.id, recordData.clientId, this.key);
      }
    };

    _proto.notifyHasManyChange = function notifyHasManyChange() {
      var recordData = this.recordData;
      var storeWrapper = recordData.storeWrapper;
      storeWrapper.notifyHasManyChange(recordData.modelName, recordData.id, recordData.clientId, this.key);
    };

    _proto.getData = function getData() {
      var payload = {};

      if (this.hasAnyRelationshipData) {
        payload.data = this.currentState.map(function (recordData) {
          return recordData.getResourceIdentifier();
        });
      }

      if (this.link) {
        payload.links = {
          related: this.link
        };
      }

      if (this.meta) {
        payload.meta = this.meta;
      } // TODO @runspired: the @igor refactor is too limiting for relationship state
      //   we should reconsider where we fetch from.


      payload._relationship = this;
      return payload;
    };

    _proto.updateData = function updateData(data, initial) {
      var recordDatas;

      if (Ember.isNone(data)) {
        recordDatas = undefined;
      } else {
        recordDatas = new Array(data.length);

        for (var i = 0; i < data.length; i++) {
          recordDatas[i] = this.recordData.storeWrapper.recordDataFor(data[i].type, data[i].id);
        }
      }

      if (initial) {
        this.setInitialRecordDatas(recordDatas);
      } else {
        this.updateRecordDatasFromAdapter(recordDatas);
      }
    }
    /**
     * Flag indicating whether all inverse records are available
     *
     * true if inverse records exist and are all loaded (all not empty)
     * true if there are no inverse records
     * false if the inverse records exist and any are not loaded (any empty)
     *
     * @return {boolean}
     */
    ;

    _createClass$8(ManyRelationship, [{
      key: "allInverseRecordsAreLoaded",
      get: function get() {
        // check currentState for unloaded records
        var hasEmptyRecords = this.currentState.reduce(function (hasEmptyModel, i) {
          return hasEmptyModel || i.isEmpty();
        }, false); // check un-synced state for unloaded records

        if (!hasEmptyRecords && this.willSync) {
          hasEmptyRecords = this.canonicalState.reduce(function (hasEmptyModel, i) {
            return hasEmptyModel || !i.isEmpty();
          }, false);
        }

        return !hasEmptyRecords;
      }
    }]);

    return ManyRelationship;
  }(Relationship);

  function setForArray(array) {
    var set = new EmberDataOrderedSet();

    if (array) {
      for (var i = 0, l = array.length; i < l; i++) {
        set.add(array[i]);
      }
    }

    return set;
  }

  function _defineProperties$9(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$9(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$9(Constructor.prototype, protoProps); if (staticProps) _defineProperties$9(Constructor, staticProps); return Constructor; }

  function _inheritsLoose$5(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  /**
    @module @ember-data/store
  */
  var BelongsToRelationship =
  /*#__PURE__*/
  function (_Relationship) {
    _inheritsLoose$5(BelongsToRelationship, _Relationship);

    function BelongsToRelationship(store, inverseKey, relationshipMeta, recordData, inverseIsAsync) {
      var _this;

      _this = _Relationship.call(this, store, inverseKey, relationshipMeta, recordData, inverseIsAsync) || this;
      _this.inverseRecordData = void 0;
      _this.canonicalState = void 0;
      _this.key = void 0;
      _this.key = relationshipMeta.key;
      _this.inverseRecordData = null;
      _this.canonicalState = null;
      _this.key = relationshipMeta.key;
      return _this;
    }

    var _proto = BelongsToRelationship.prototype;

    _proto.setRecordData = function setRecordData(recordData) {
      if (recordData) {
        this.addRecordData(recordData);
      } else if (this.inverseRecordData) {
        this.removeRecordData(this.inverseRecordData);
      }

      this.setHasAnyRelationshipData(true);
      this.setRelationshipIsStale(false);
      this.setRelationshipIsEmpty(false);
    };

    _proto.setCanonicalRecordData = function setCanonicalRecordData(recordData) {
      if (recordData) {
        this.addCanonicalRecordData(recordData);
      } else if (this.canonicalState) {
        this.removeCanonicalRecordData(this.canonicalState);
      }

      this.flushCanonicalLater();
    };

    _proto.setInitialCanonicalRecordData = function setInitialCanonicalRecordData(recordData) {
      if (!recordData) {
        return;
      } // When we initialize a belongsTo relationship, we want to avoid work like
      // notifying our internalModel that we've "changed" and excessive thrash on
      // setting up inverse relationships


      this.canonicalMembers.add(recordData);
      this.members.add(recordData);
      this.inverseRecordData = this.canonicalState = recordData;
      this.setupInverseRelationship(recordData);
    };

    _proto.addCanonicalRecordData = function addCanonicalRecordData(recordData) {
      if (this.canonicalMembers.has(recordData)) {
        return;
      }

      if (this.canonicalState) {
        this.removeCanonicalRecordData(this.canonicalState);
      }

      this.canonicalState = recordData;

      _Relationship.prototype.addCanonicalRecordData.call(this, recordData);

      this.setHasAnyRelationshipData(true);
      this.setRelationshipIsEmpty(false);
    };

    _proto.inverseDidDematerialize = function inverseDidDematerialize() {
      _Relationship.prototype.inverseDidDematerialize.call(this, this.inverseRecordData);

      this.notifyBelongsToChange();
    };

    _proto.removeCompletelyFromOwn = function removeCompletelyFromOwn(recordData) {
      _Relationship.prototype.removeCompletelyFromOwn.call(this, recordData);

      if (this.canonicalState === recordData) {
        this.canonicalState = null;
      }

      if (this.inverseRecordData === recordData) {
        this.inverseRecordData = null;
        this.notifyBelongsToChange();
      }
    };

    _proto.removeCompletelyFromInverse = function removeCompletelyFromInverse() {
      _Relationship.prototype.removeCompletelyFromInverse.call(this);

      this.inverseRecordData = null;
    };

    _proto.flushCanonical = function flushCanonical() {
      //temporary fix to not remove newly created records if server returned null.
      //TODO remove once we have proper diffing
      if (this.inverseRecordData && this.inverseRecordData.isNew() && !this.canonicalState) {
        this.willSync = false;
        return;
      }

      if (this.inverseRecordData !== this.canonicalState) {
        this.inverseRecordData = this.canonicalState;
        this.notifyBelongsToChange();
      }

      _Relationship.prototype.flushCanonical.call(this);
    };

    _proto.addRecordData = function addRecordData(recordData) {
      if (this.members.has(recordData)) {
        return;
      } // TODO Igor cleanup


      if (this.inverseRecordData) {
        this.removeRecordData(this.inverseRecordData);
      }

      this.inverseRecordData = recordData;

      _Relationship.prototype.addRecordData.call(this, recordData);

      this.notifyBelongsToChange();
    };

    _proto.removeRecordDataFromOwn = function removeRecordDataFromOwn(recordData) {
      if (!this.members.has(recordData)) {
        return;
      }

      this.inverseRecordData = null;

      _Relationship.prototype.removeRecordDataFromOwn.call(this, recordData);

      this.notifyBelongsToChange();
    };

    _proto.removeAllRecordDatasFromOwn = function removeAllRecordDatasFromOwn() {
      _Relationship.prototype.removeAllRecordDatasFromOwn.call(this);

      this.inverseRecordData = null;
      this.notifyBelongsToChange();
    };

    _proto.notifyBelongsToChange = function notifyBelongsToChange() {
      var recordData = this.recordData;
      var storeWrapper = this.recordData.storeWrapper;
      storeWrapper.notifyBelongsToChange(recordData.modelName, recordData.id, recordData.clientId, this.key);
    };

    _proto.removeCanonicalRecordDataFromOwn = function removeCanonicalRecordDataFromOwn(recordData) {
      if (!this.canonicalMembers.has(recordData)) {
        return;
      }

      this.canonicalState = null;
      this.setHasAnyRelationshipData(true);
      this.setRelationshipIsEmpty(true);

      _Relationship.prototype.removeCanonicalRecordDataFromOwn.call(this, recordData);
    };

    _proto.removeAllCanonicalRecordDatasFromOwn = function removeAllCanonicalRecordDatasFromOwn() {
      _Relationship.prototype.removeAllCanonicalRecordDatasFromOwn.call(this);

      this.canonicalState = null;
    };

    _proto.getData = function getData() {
      var data;
      var payload = {};

      if (this.inverseRecordData) {
        data = this.inverseRecordData.getResourceIdentifier();
      }

      if (this.inverseRecordData === null && this.hasAnyRelationshipData) {
        data = null;
      }

      if (this.link) {
        payload.links = {
          related: this.link
        };
      }

      if (data !== undefined) {
        payload.data = data;
      }

      if (this.meta) {
        payload.meta = this.meta;
      }

      payload._relationship = this;
      return payload;
    }
    /**
     * Flag indicating whether all inverse records are available
     *
     * true if the inverse exists and is loaded (not empty)
     * true if there is no inverse
     * false if the inverse exists and is not loaded (empty)
     *
     * @return {boolean}
     */
    ;

    _proto.updateData = function updateData(data, initial) {
      var recordData;

      if (Ember.isNone(data)) {
        recordData = null;
      }

      if (recordData !== null) {
        recordData = this.recordData.storeWrapper.recordDataFor(data.type, data.id);
      }

      if (initial) {
        this.setInitialCanonicalRecordData(recordData);
      } else {
        this.setCanonicalRecordData(recordData);
      }
    };

    _createClass$9(BelongsToRelationship, [{
      key: "allInverseRecordsAreLoaded",
      get: function get() {
        var recordData = this.inverseRecordData;
        var isEmpty = recordData !== null && recordData.isEmpty();
        return !isEmpty;
      }
    }]);

    return BelongsToRelationship;
  }(Relationship);

  /**
    @module @ember-data/store
  */
  function createRelationshipFor(relationshipMeta, store, recordData, key) {
    var inverseKey = recordData.storeWrapper.inverseForRelationship(recordData.modelName, key);
    var inverseIsAsync = recordData.storeWrapper.inverseIsAsyncForRelationship(recordData.modelName, key);

    if (relationshipMeta.kind === 'hasMany') {
      return new ManyRelationship(store, inverseKey, relationshipMeta, recordData, inverseIsAsync);
    } else {
      return new BelongsToRelationship(store, inverseKey, relationshipMeta, recordData, inverseIsAsync);
    }
  }

  var Relationships =
  /*#__PURE__*/
  function () {
    function Relationships(recordData) {
      this.recordData = recordData;
      this._store = void 0;
      this._storeWrapper = void 0;
      this.initializedRelationships = void 0;
      this.initializedRelationships = Object.create(null);
      this._storeWrapper = upgradeForInternal(recordData.storeWrapper);
      this._store = this._storeWrapper._store;
    }

    var _proto = Relationships.prototype;

    _proto.has = function has(key) {
      return !!this.initializedRelationships[key];
    };

    _proto.forEach = function forEach(cb) {
      var rels = this.initializedRelationships;
      Object.keys(rels).forEach(function (name) {
        cb(name, rels[name]);
      });
    };

    _proto.get = function get(key) {
      var relationships = this.initializedRelationships;
      var relationship = relationships[key];

      if (!relationship) {
        var _recordData = this.recordData;
        var rel = this.recordData.storeWrapper.relationshipsDefinitionFor(this.recordData.modelName)[key];

        if (rel) {
          relationship = relationships[key] = createRelationshipFor(rel, this._store, _recordData, key);
        }
      }

      return relationship;
    };

    return Relationships;
  }();

  function _defineProperties$a(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$a(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$a(Constructor.prototype, protoProps); if (staticProps) _defineProperties$a(Constructor, staticProps); return Constructor; }

  /**
    @module @ember-data/store
  */
  var nextBfsId = 1;

  var RecordDataDefault =
  /*#__PURE__*/
  function () {
    function RecordDataDefault(arg1, arg2) {
      this._errors = void 0;
      this.__relationships = void 0;
      this.__implicitRelationships = void 0;
      this.modelName = void 0;
      this.clientId = void 0;
      this.id = void 0;
      this.isDestroyed = void 0;
      this._isNew = void 0;
      this._bfsId = void 0;
      this.__attributes = void 0;
      this.__inFlightAttributes = void 0;
      this.__data = void 0;
      this._scheduledDestroy = void 0;
      this._isDeleted = void 0;
      this._isDeletionCommited = void 0;
      this.identifier = void 0;
      this.storeWrapper = void 0;

      if (canaryFeatures.IDENTIFIERS) {
        var _identifier = arguments[0],
            _storeWrapper = arguments[1];
        this.identifier = _identifier;
        this.modelName = _identifier.type;
        this.clientId = _identifier.lid;
        this.id = _identifier.id;
        this.storeWrapper = _storeWrapper;
      } else {
        var _modelName = arguments[0],
            _id = arguments[1],
            _clientId = arguments[2],
            _storeWrapper2 = arguments[3];
        this.modelName = _modelName;
        this.clientId = _clientId;
        this.id = _id;
        this.storeWrapper = _storeWrapper2;
      }

      this.__relationships = null;
      this.__implicitRelationships = null;
      this.isDestroyed = false;
      this._isNew = false;
      this._isDeleted = false; // Used during the mark phase of unloading to avoid checking the same internal
      // model twice in the same scan

      this._bfsId = 0;
      this.reset();
    } // PUBLIC API


    var _proto = RecordDataDefault.prototype;

    _proto.getResourceIdentifier = function getResourceIdentifier() {
      return canaryFeatures.IDENTIFIERS ? this.identifier : {
        id: this.id,
        type: this.modelName,
        lid: this.clientId,
        clientId: this.clientId
      };
    };

    _proto.pushData = function pushData(data, calculateChange) {
      var changedKeys;

      if (this._isNew) {
        this._isNew = false;
        this.notifyStateChange();
      }

      if (calculateChange) {
        changedKeys = this._changedKeys(data.attributes);
      }

      Ember.assign(this._data, data.attributes);

      if (this.__attributes) {
        // only do if we have attribute changes
        this._updateChangedAttributes();
      }

      if (data.relationships) {
        this._setupRelationships(data);
      }

      if (data.id) {
        this.id = coerceId(data.id);
      }

      return changedKeys;
    };

    _proto.willCommit = function willCommit() {
      this._inFlightAttributes = this._attributes;
      this._attributes = null;
    };

    _proto.hasChangedAttributes = function hasChangedAttributes() {
      return this.__attributes !== null && Object.keys(this.__attributes).length > 0;
    };

    _proto._clearErrors = function _clearErrors() {
      if (canaryFeatures.RECORD_DATA_ERRORS) {
        if (this._errors) {
          this._errors = undefined;
          this.storeWrapper.notifyErrorsChange(this.modelName, this.id, this.clientId);
        }
      }
    };

    _proto.getErrors = function getErrors() {

      if (canaryFeatures.RECORD_DATA_ERRORS) {
        var errors = this._errors || [];
        return errors;
      } else {
        return [];
      }
    } // this is a hack bc we don't have access to the state machine
    //   and relationships need this info and @runspired didn't see
    //   how to get it just yet from storeWrapper.
    ;

    _proto.isEmpty = function isEmpty() {
      return this.__attributes === null && this.__inFlightAttributes === null && this.__data === null;
    };

    _proto.deleteRecord = function deleteRecord() {
      this._isDeleted = true;
      this.notifyStateChange();
    };

    _proto.isDeleted = function isDeleted() {
      return this._isDeleted;
    };

    _proto.setIsDeleted = function setIsDeleted(isDeleted) {
      this._isDeleted = isDeleted;

      if (this._isNew) {
        this._deletionConfirmed();
      }

      this.notifyStateChange();
    };

    _proto.isDeletionCommitted = function isDeletionCommitted() {
      return this._isDeletionCommited;
    };

    _proto.reset = function reset() {
      this.__attributes = null;
      this.__inFlightAttributes = null;
      this.__data = null;
      this._errors = undefined;
    };

    _proto._setupRelationships = function _setupRelationships(data) {
      var relationships = this.storeWrapper.relationshipsDefinitionFor(this.modelName);
      var keys = Object.keys(relationships);

      for (var i = 0; i < keys.length; i++) {
        var relationshipName = keys[i];

        if (!data.relationships[relationshipName]) {
          continue;
        } // in debug, assert payload validity eagerly


        var relationshipData = data.relationships[relationshipName];

        var relationship = this._relationships.get(relationshipName);

        relationship.push(relationshipData);
      }
    }
    /*
      Checks if the attributes which are considered as changed are still
      different to the state which is acknowledged by the server.
       This method is needed when data for the internal model is pushed and the
      pushed data might acknowledge dirty attributes as confirmed.
       @method updateChangedAttributes
      @private
     */
    ;

    _proto._updateChangedAttributes = function _updateChangedAttributes() {
      var changedAttributes = this.changedAttributes();
      var changedAttributeNames = Object.keys(changedAttributes);
      var attrs = this._attributes;

      for (var i = 0, length = changedAttributeNames.length; i < length; i++) {
        var attribute = changedAttributeNames[i];
        var data = changedAttributes[attribute];
        var oldData = data[0];
        var newData = data[1];

        if (oldData === newData) {
          delete attrs[attribute];
        }
      }
    }
    /*
      Returns an object, whose keys are changed properties, and value is an
      [oldProp, newProp] array.
       @method changedAttributes
      @private
    */
    ;

    _proto.changedAttributes = function changedAttributes() {
      var oldData = this._data;
      var currentData = this._attributes;
      var inFlightData = this._inFlightAttributes;
      var newData = Ember.assign({}, inFlightData, currentData);
      var diffData = Object.create(null);
      var newDataKeys = Object.keys(newData);

      for (var i = 0, length = newDataKeys.length; i < length; i++) {
        var _key = newDataKeys[i];
        diffData[_key] = [oldData[_key], newData[_key]];
      }

      return diffData;
    };

    _proto.isNew = function isNew() {
      return this._isNew;
    };

    _proto.rollbackAttributes = function rollbackAttributes() {
      var dirtyKeys;
      this._isDeleted = false;

      if (this.hasChangedAttributes()) {
        dirtyKeys = Object.keys(this._attributes);
        this._attributes = null;
      }

      if (this.isNew()) {
        this.removeFromInverseRelationships(true);
        this._isDeleted = true;
        this._isNew = false;
      }

      this._inFlightAttributes = null;

      this._clearErrors();

      this.notifyStateChange();
      return dirtyKeys;
    };

    _proto._deletionConfirmed = function _deletionConfirmed() {
      this.removeFromInverseRelationships();
    };

    _proto.didCommit = function didCommit(data) {
      if (this._isDeleted) {
        this._deletionConfirmed();

        this._isDeletionCommited = true;
      }

      this._isNew = false;
      var newCanonicalAttributes = null;

      if (data) {
        // this.store._internalModelDidReceiveRelationshipData(this.modelName, this.id, data.relationships);
        if (data.relationships) {
          this._setupRelationships(data);
        }

        if (data.id) {
          // didCommit provided an ID, notify the store of it
          this.storeWrapper.setRecordId(this.modelName, data.id, this.clientId);
          this.id = coerceId(data.id);
        }

        newCanonicalAttributes = data.attributes || null;
      }

      var changedKeys = this._changedKeys(newCanonicalAttributes);

      Ember.assign(this._data, this.__inFlightAttributes, newCanonicalAttributes);
      this._inFlightAttributes = null;

      this._updateChangedAttributes();

      this._clearErrors();

      this.notifyStateChange();
      return changedKeys;
    };

    _proto.notifyStateChange = function notifyStateChange() {
      if (canaryFeatures.RECORD_DATA_STATE) {
        this.storeWrapper.notifyStateChange(this.modelName, this.id, this.clientId);
      }
    } // get ResourceIdentifiers for "current state"
    ;

    _proto.getHasMany = function getHasMany(key) {
      return this._relationships.get(key).getData();
    } // set a new "current state" via ResourceIdentifiers
    ;

    _proto.setDirtyHasMany = function setDirtyHasMany(key, recordDatas) {
      var relationship = this._relationships.get(key);

      relationship.clear();
      relationship.addRecordDatas(recordDatas);
    } // append to "current state" via RecordDatas
    ;

    _proto.addToHasMany = function addToHasMany(key, recordDatas, idx) {
      this._relationships.get(key).addRecordDatas(recordDatas, idx);
    } // remove from "current state" via RecordDatas
    ;

    _proto.removeFromHasMany = function removeFromHasMany(key, recordDatas) {
      this._relationships.get(key).removeRecordDatas(recordDatas);
    };

    _proto.commitWasRejected = function commitWasRejected(identifier, errors) {
      var keys = Object.keys(this._inFlightAttributes);

      if (keys.length > 0) {
        var attrs = this._attributes;

        for (var i = 0; i < keys.length; i++) {
          if (attrs[keys[i]] === undefined) {
            attrs[keys[i]] = this._inFlightAttributes[keys[i]];
          }
        }
      }

      this._inFlightAttributes = null;

      if (canaryFeatures.RECORD_DATA_ERRORS) {
        if (errors) {
          this._errors = errors;
        }

        this.storeWrapper.notifyErrorsChange(this.modelName, this.id, this.clientId);
      }
    };

    _proto.getBelongsTo = function getBelongsTo(key) {
      return this._relationships.get(key).getData();
    };

    _proto.setDirtyBelongsTo = function setDirtyBelongsTo(key, recordData) {
      this._relationships.get(key).setRecordData(recordData);
    };

    _proto.setDirtyAttribute = function setDirtyAttribute(key, value) {
      var originalValue; // Add the new value to the changed attributes hash

      this._attributes[key] = value;

      if (key in this._inFlightAttributes) {
        originalValue = this._inFlightAttributes[key];
      } else {
        originalValue = this._data[key];
      } // If we went back to our original value, we shouldn't keep the attribute around anymore


      if (value === originalValue) {
        delete this._attributes[key];
      }
    };

    _proto.getAttr = function getAttr(key) {
      if (key in this._attributes) {
        return this._attributes[key];
      } else if (key in this._inFlightAttributes) {
        return this._inFlightAttributes[key];
      } else {
        return this._data[key];
      }
    };

    _proto.hasAttr = function hasAttr(key) {
      return key in this._attributes || key in this._inFlightAttributes || key in this._data;
    };

    _proto.unloadRecord = function unloadRecord() {
      if (this.isDestroyed) {
        return;
      }

      this._destroyRelationships();

      this.reset();

      if (!this._scheduledDestroy) {
        this._scheduledDestroy = Ember.run.backburner.schedule('destroy', this, '_cleanupOrphanedRecordDatas');
      }
    };

    _proto._cleanupOrphanedRecordDatas = function _cleanupOrphanedRecordDatas() {
      var relatedRecordDatas = this._allRelatedRecordDatas();

      if (areAllModelsUnloaded(relatedRecordDatas)) {
        for (var i = 0; i < relatedRecordDatas.length; ++i) {
          var recordData = relatedRecordDatas[i];

          if (!recordData.isDestroyed) {
            recordData.destroy();
          }
        }
      }

      this._scheduledDestroy = null;
    };

    _proto.destroy = function destroy() {
      this._relationships.forEach(function (name, rel) {
        return rel.destroy();
      });

      this.isDestroyed = true;
      this.storeWrapper.disconnectRecord(this.modelName, this.id, this.clientId);
    };

    _proto.isRecordInUse = function isRecordInUse() {
      return this.storeWrapper.isRecordInUse(this.modelName, this.id, this.clientId);
    }
    /**
      Computes the set of internal models reachable from `this` across exactly one
      relationship.
       @return {Array} An array containing the internal models that `this` belongs
      to or has many.
     */
    ;

    _proto._directlyRelatedRecordDatas = function _directlyRelatedRecordDatas() {
      var array = [];

      this._relationships.forEach(function (name, rel) {
        var members = rel.members.list;
        var canonicalMembers = rel.canonicalMembers.list;
        array = array.concat(members, canonicalMembers);
      });

      return array;
    }
    /**
      Computes the set of internal models reachable from this internal model.
       Reachability is determined over the relationship graph (ie a graph where
      nodes are internal models and edges are belongs to or has many
      relationships).
       @return {Array} An array including `this` and all internal models reachable
      from `this`.
    */
    ;

    _proto._allRelatedRecordDatas = function _allRelatedRecordDatas() {
      var array = [];
      var queue = [];
      var bfsId = nextBfsId++;
      queue.push(this);
      this._bfsId = bfsId;

      while (queue.length > 0) {
        var node = queue.shift();
        array.push(node);

        var related = node._directlyRelatedRecordDatas();

        for (var i = 0; i < related.length; ++i) {
          var recordData = related[i];

          if (recordData instanceof RecordDataDefault) {

            if (recordData._bfsId < bfsId) {
              queue.push(recordData);
              recordData._bfsId = bfsId;
            }
          }
        }
      }

      return array;
    };

    _proto.isAttrDirty = function isAttrDirty(key) {
      if (this._attributes[key] === undefined) {
        return false;
      }

      var originalValue;

      if (this._inFlightAttributes[key] !== undefined) {
        originalValue = this._inFlightAttributes[key];
      } else {
        originalValue = this._data[key];
      }

      return originalValue !== this._attributes[key];
    };

    /**
     * Receives options passed to `store.createRecord` and is given the opportunity
     * to handle them.
     *
     * The return value is an object of options to pass to `Record.create()`
     *
     * @param options
     * @private
     */
    _proto._initRecordCreateOptions = function _initRecordCreateOptions(options) {
      var createOptions = {};

      if (options !== undefined) {
        var _modelName2 = this.modelName,
            _storeWrapper4 = this.storeWrapper;

        var attributeDefs = _storeWrapper4.attributesDefinitionFor(_modelName2);

        var relationshipDefs = _storeWrapper4.relationshipsDefinitionFor(_modelName2);

        var relationships = this._relationships;
        var propertyNames = Object.keys(options);

        for (var i = 0; i < propertyNames.length; i++) {
          var name = propertyNames[i];
          var propertyValue = options[name];

          if (name === 'id') {
            this.id = propertyValue;
            continue;
          }

          var fieldType = relationshipDefs[name] || attributeDefs[name];
          var kind = fieldType !== undefined ? fieldType.kind : null;
          var relationship = void 0;

          switch (kind) {
            case 'attribute':
              this.setDirtyAttribute(name, propertyValue);
              break;

            case 'belongsTo':
              this.setDirtyBelongsTo(name, propertyValue);
              relationship = relationships.get(name);
              relationship.setHasAnyRelationshipData(true);
              relationship.setRelationshipIsEmpty(false);
              break;

            case 'hasMany':
              this.setDirtyHasMany(name, propertyValue);
              relationship = relationships.get(name);
              relationship.setHasAnyRelationshipData(true);
              relationship.setRelationshipIsEmpty(false);
              break;

            default:
              // reflect back (pass-thru) unknown properties
              createOptions[name] = propertyValue;
          }
        }
      }

      return createOptions;
    }
    /*
        TODO IGOR AND DAVID this shouldn't be public
     This method should only be called by records in the `isNew()` state OR once the record
     has been deleted and that deletion has been persisted.
      It will remove this record from any associated relationships.
      If `isNew` is true (default false), it will also completely reset all
      relationships to an empty state as well.
       @method removeFromInverseRelationships
      @param {Boolean} isNew whether to unload from the `isNew` perspective
      @private
     */
    ;

    _proto.removeFromInverseRelationships = function removeFromInverseRelationships(isNew) {
      if (isNew === void 0) {
        isNew = false;
      }

      this._relationships.forEach(function (name, rel) {
        rel.removeCompletelyFromInverse();

        if (isNew === true) {
          rel.clear();
        }
      });

      var implicitRelationships = this._implicitRelationships;
      this.__implicitRelationships = null;
      Object.keys(implicitRelationships).forEach(function (key) {
        var rel = implicitRelationships[key];
        rel.removeCompletelyFromInverse();

        if (isNew === true) {
          rel.clear();
        }
      });
    };

    _proto._destroyRelationships = function _destroyRelationships() {
      var relationships = this._relationships;
      relationships.forEach(function (name, rel) {
        return destroyRelationship(rel);
      });
      var implicitRelationships = this._implicitRelationships;
      this.__implicitRelationships = null;
      Object.keys(implicitRelationships).forEach(function (key) {
        var rel = implicitRelationships[key];
        destroyRelationship(rel);
      });
    };

    _proto.clientDidCreate = function clientDidCreate() {
      this._isNew = true;
    }
    /*
      Ember Data has 3 buckets for storing the value of an attribute on an internalModel.
       `_data` holds all of the attributes that have been acknowledged by
      a backend via the adapter. When rollbackAttributes is called on a model all
      attributes will revert to the record's state in `_data`.
       `_attributes` holds any change the user has made to an attribute
      that has not been acknowledged by the adapter. Any values in
      `_attributes` are have priority over values in `_data`.
       `_inFlightAttributes`. When a record is being synced with the
      backend the values in `_attributes` are copied to
      `_inFlightAttributes`. This way if the backend acknowledges the
      save but does not return the new state Ember Data can copy the
      values from `_inFlightAttributes` to `_data`. Without having to
      worry about changes made to `_attributes` while the save was
      happenign.
        Changed keys builds a list of all of the values that may have been
      changed by the backend after a successful save.
       It does this by iterating over each key, value pair in the payload
      returned from the server after a save. If the `key` is found in
      `_attributes` then the user has a local changed to the attribute
      that has not been synced with the server and the key is not
      included in the list of changed keys.
    
      If the value, for a key differs from the value in what Ember Data
      believes to be the truth about the backend state (A merger of the
      `_data` and `_inFlightAttributes` objects where
      `_inFlightAttributes` has priority) then that means the backend
      has updated the value and the key is added to the list of changed
      keys.
       @method _changedKeys
      @private
    */

    /*
        TODO IGOR DAVID
        There seems to be a potential bug here, where we will return keys that are not
        in the schema
    */
    ;

    _proto._changedKeys = function _changedKeys(updates) {
      var changedKeys = [];

      if (updates) {
        var original, i, value, _key2;

        var keys = Object.keys(updates);
        var length = keys.length;
        var hasAttrs = this.hasChangedAttributes();
        var attrs;

        if (hasAttrs) {
          attrs = this._attributes;
        }

        original = Ember.assign(Object.create(null), this._data, this.__inFlightAttributes);

        for (i = 0; i < length; i++) {
          _key2 = keys[i];
          value = updates[_key2]; // A value in _attributes means the user has a local change to
          // this attributes. We never override this value when merging
          // updates from the backend so we should not sent a change
          // notification if the server value differs from the original.

          if (hasAttrs === true && attrs[_key2] !== undefined) {
            continue;
          }

          if (!Ember.isEqual(original[_key2], value)) {
            changedKeys.push(_key2);
          }
        }
      }

      return changedKeys;
    };

    _proto.toString = function toString() {
      return "<" + this.modelName + ":" + this.id + ">";
    };

    _createClass$a(RecordDataDefault, [{
      key: "_attributes",
      get: function get() {
        if (this.__attributes === null) {
          this.__attributes = Object.create(null);
        }

        return this.__attributes;
      },
      set: function set(v) {
        this.__attributes = v;
      }
    }, {
      key: "_relationships",
      get: function get() {
        if (this.__relationships === null) {
          this.__relationships = new Relationships(this);
        }

        return this.__relationships;
      }
    }, {
      key: "_data",
      get: function get() {
        if (this.__data === null) {
          this.__data = Object.create(null);
        }

        return this.__data;
      },
      set: function set(v) {
        this.__data = v;
      }
      /*
       implicit relationships are relationship which have not been declared but the inverse side exists on
       another record somewhere
       For example if there was
        ```app/models/comment.js
       import Model, { attr } from '@ember-data/model';
        export default Model.extend({
         name: attr()
       });
       ```
        but there is also
        ```app/models/post.js
       import Model, { attr, hasMany } from '@ember-data/model';
        export default Model.extend({
         name: attr(),
         comments: hasMany('comment')
       });
       ```
        would have a implicit post relationship in order to be do things like remove ourselves from the post
       when we are deleted
      */

    }, {
      key: "_implicitRelationships",
      get: function get() {
        if (this.__implicitRelationships === null) {
          var relationships = Object.create(null);
          this.__implicitRelationships = relationships;
          return relationships;
        }

        return this.__implicitRelationships;
      }
    }, {
      key: "_inFlightAttributes",
      get: function get() {
        if (this.__inFlightAttributes === null) {
          this.__inFlightAttributes = Object.create(null);
        }

        return this.__inFlightAttributes;
      },
      set: function set(v) {
        this.__inFlightAttributes = v;
      }
    }]);

    return RecordDataDefault;
  }();
  // relationship of the dematerialization: this is done so the relationship can
  // notify its inverse which needs to update state
  //
  // If the inverse is sync, unloading this record is treated as a client-side
  // delete, so we remove the inverse records from this relationship to
  // disconnect the graph.  Because it's not async, we don't need to keep around
  // the internalModel as an id-wrapper for references and because the graph is
  // disconnected we can actually destroy the internalModel when checking for
  // orphaned models.


  function destroyRelationship(rel) {
    rel.recordDataDidDematerialize();

    if (rel._inverseIsSync()) {
      rel.removeAllRecordDatasFromOwn();
      rel.removeAllCanonicalRecordDatasFromOwn();
    }
  }

  function areAllModelsUnloaded(recordDatas) {
    for (var i = 0; i < recordDatas.length; ++i) {
      if (recordDatas[i].isRecordInUse()) {
        return false;
      }
    }

    return true;
  }

  var backburner = new Ember._Backburner(['normalizeRelationships', 'syncRelationships', 'finished']);

  /**
    @module @ember-data/store
  */

  /**
   * Get the materialized model from the internalModel/promise
   * that returns an internal model and return it in a promiseObject.
   *
   * Useful for returning from find methods
   *
   * @internal
   */
  function promiseRecord(internalModelPromise, label) {
    var toReturn = internalModelPromise.then(function (internalModel) {
      return internalModel.getRecord();
    });
    return promiseObject(toReturn, label);
  }

  var Cache = new WeakMap();
  var Tokens = new WeakMap();
  /*
    Currently only support a single callback per identifier
  */

  var NotificationManager =
  /*#__PURE__*/
  function () {
    function NotificationManager(store) {
      this.store = store;
    }

    var _proto = NotificationManager.prototype;

    _proto.subscribe = function subscribe(identifier, callback) {
      var stableIdentifier = identifierCacheFor(this.store).getOrCreateRecordIdentifier(identifier);
      Cache.set(stableIdentifier, callback);
      var unsubToken = new Object();
      Tokens.set(unsubToken, stableIdentifier);
      return identifier;
    };

    _proto.notify = function notify(identifier, value) {
      var stableIdentifier = identifierCacheFor(this.store).getOrCreateRecordIdentifier(identifier);
      var callback = Cache.get(stableIdentifier);

      if (!callback) {
        return false;
      }

      callback(stableIdentifier, value);
      return true;
    };

    return NotificationManager;
  }();

  function _defineProperties$b(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$b(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$b(Constructor.prototype, protoProps); if (staticProps) _defineProperties$b(Constructor, staticProps); return Constructor; }

  // Mimics the static apis of DSModel
  var ShimModelClass =
  /*#__PURE__*/
  function () {
    // TODO Maybe expose the class here?
    function ShimModelClass(__store, modelName) {
      this.__store = __store;
      this.modelName = modelName;
    }

    var _proto = ShimModelClass.prototype;

    _proto.eachAttribute = function eachAttribute(callback, binding) {
      var attrDefs = this.__store._attributesDefinitionFor(this.modelName);

      Object.keys(attrDefs).forEach(function (key) {
        callback.call(binding, key, attrDefs[key]);
      });
    };

    _proto.eachRelationship = function eachRelationship(callback, binding) {
      var relationshipDefs = this.__store._relationshipsDefinitionFor(this.modelName);

      Object.keys(relationshipDefs).forEach(function (key) {
        callback.call(binding, key, relationshipDefs[key]);
      });
    };

    _proto.eachTransformedAttribute = function eachTransformedAttribute(callback, binding) {
      var relationshipDefs = this.__store._relationshipsDefinitionFor(this.modelName);

      Object.keys(relationshipDefs).forEach(function (key) {
        if (relationshipDefs[key].type) {
          callback.call(binding, key, relationshipDefs[key]);
        }
      });
    };

    _createClass$b(ShimModelClass, [{
      key: "fields",
      get: function get() {
        var attrs = this.__store._attributesDefinitionFor(this.modelName);

        var relationships = this.__store._relationshipsDefinitionFor(this.modelName);

        var fields = new Map();
        Object.keys(attrs).forEach(function (key) {
          return fields.set(key, 'attribute');
        });
        Object.keys(relationships).forEach(function (key) {
          return fields.set(key, relationships[key].kind);
        });
        return fields;
      }
    }, {
      key: "attributes",
      get: function get() {
        var attrs = this.__store._attributesDefinitionFor(this.modelName);

        return new Map(Object.entries(attrs));
      }
    }, {
      key: "relationshipsByName",
      get: function get() {
        var relationships = this.__store._relationshipsDefinitionFor(this.modelName);

        return new Map(Object.entries(relationships));
      }
    }]);

    return ShimModelClass;
  }();

  function _defineProperties$c(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$c(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$c(Constructor.prototype, protoProps); if (staticProps) _defineProperties$c(Constructor, staticProps); return Constructor; }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _inheritsLoose$6(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
  var emberRun$2 = Ember.run.backburner;
  var ENV = Ember.ENV;
  var globalClientIdCounter = 1;
  var HAS_SERIALIZER_PACKAGE = require.has('@ember-data/serializer');
  var HAS_ADAPTER_PACKAGE = require.has('@ember-data/adapter');
  /**
    The store contains all of the data for records loaded from the server.
    It is also responsible for creating instances of `Model` that wrap
    the individual data for a record, so that they can be bound to in your
    Handlebars templates.

    Define your application's store like this:

    ```app/services/store.js
    import Store from '@ember-data/store';

    export default Store.extend({
    });
    ```

    Most Ember.js applications will only have a single `Store` that is
    automatically created by their `Ember.Application`.

    You can retrieve models from the store in several ways. To retrieve a record
    for a specific id, use `Store`'s `findRecord()` method:

    ```javascript
    store.findRecord('person', 123).then(function (person) {
    });
    ```

    By default, the store will talk to your backend using a standard
    REST mechanism. You can customize how the store talks to your
    backend by specifying a custom adapter:

    ```app/adapters/application.js
    import Adapter from '@ember-data/adapter';

    export default Adapter.extend({
    });
    ```

    You can learn more about writing a custom adapter by reading the `Adapter`
    documentation.

    ### Store createRecord() vs. push() vs. pushPayload()

    The store provides multiple ways to create new record objects. They have
    some subtle differences in their use which are detailed below:

    [createRecord](Store/methods/createRecord?anchor=createRecord) is used for creating new
    records on the client side. This will return a new record in the
    `created.uncommitted` state. In order to persist this record to the
    backend, you will need to call `record.save()`.

    [push](Store/methods/push?anchor=push) is used to notify Ember Data's store of new or
    updated records that exist in the backend. This will return a record
    in the `loaded.saved` state. The primary use-case for `store#push` is
    to notify Ember Data about record updates (full or partial) that happen
    outside of the normal adapter methods (for example
    [SSE](http://dev.w3.org/html5/eventsource/) or [Web
    Sockets](http://www.w3.org/TR/2009/WD-websockets-20091222/)).

    [pushPayload](Store/methods/pushPayload?anchor=pushPayload) is a convenience wrapper for
    `store#push` that will deserialize payloads if the
    Serializer implements a `pushPayload` method.

    Note: When creating a new record using any of the above methods
    Ember Data will update `RecordArray`s such as those returned by
    `store#peekAll()` or `store#findAll()`. This means any
    data bindings or computed properties that depend on the RecordArray
    will automatically be synced to include the new or updated record
    values.

    @class Store
    @extends Ember.Service
  */


  var CoreStore =
  /*#__PURE__*/
  function (_EmberService) {
    _inheritsLoose$6(CoreStore, _EmberService);

    /**
     * EmberData specific backburner instance
     */

    /*
      Ember Data uses several specialized micro-queues for organizing
      and coalescing similar async work.
       These queues are currently controlled by a flush scheduled into
      ember-data's custom backburner instance.
      */
    // used for coalescing record save requests
    // used for coalescing relationship updates
    // used for coalescing internal model updates
    // used to keep track of all the find requests that need to be coalesced
    // DEBUG-only properties

    /**
      The default adapter to use to communicate to a backend server or
      other persistence layer. This will be overridden by an application
      adapter if present.
       If you want to specify `app/adapters/custom.js` as a string, do:
       ```js
      import Store from '@ember-data/store';
       export default Store.extend({
        init() {
          this._super(...arguments);
          this.adapter = 'custom';
        }
      });
      ```
       @property adapter
      @default '-json-api'
      @type {String}
    */

    /**
    This property returns the adapter, after resolving a possible
    string key.
     If the supplied `adapter` was a class, or a String property
    path resolved to a class, this property will instantiate the
    class.
     This property is cacheable, so the same instance of a specified
    adapter class should be used for the lifetime of the store.
     @property defaultAdapter
    @private
    @return Adapter
    */

    /**
      @method init
      @private
    */
    function CoreStore() {
      var _this;

      _this = _EmberService.apply(this, arguments) || this;
      _this._backburner = backburner;
      _this.recordArrayManager = new RecordArrayManager({
        store: _assertThisInitialized(_this)
      });
      _this._notificationManager = void 0;
      _this._adapterCache = Object.create(null);
      _this._serializerCache = Object.create(null);
      _this._storeWrapper = new RecordDataStoreWrapper(_assertThisInitialized(_this));
      _this._pendingSave = [];
      _this._updatedRelationships = [];
      _this._updatedInternalModels = [];
      _this._pendingFetch = new Map();
      _this._fetchManager = void 0;
      _this._schemaDefinitionService = void 0;
      _this._trackedAsyncRequests = void 0;
      _this.shouldAssertMethodCallsOnDestroyedStore = false;
      _this.shouldTrackAsyncRequests = false;
      _this.generateStackTracesForTrackedRequests = false;
      _this._trackAsyncRequestStart = void 0;
      _this._trackAsyncRequestEnd = void 0;
      _this.__asyncWaiter = void 0;

      if (canaryFeatures.REQUEST_SERVICE) {
        _this._fetchManager = new FetchManager(_assertThisInitialized(_this));
      }

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        _this._notificationManager = new NotificationManager(_assertThisInitialized(_this));
        _this.__recordDataFor = _this.__recordDataFor.bind(_assertThisInitialized(_this));
      }

      return _this;
    }

    var _proto = CoreStore.prototype;

    _proto.getRequestStateService = function getRequestStateService() {
      if (canaryFeatures.REQUEST_SERVICE) {
        return this._fetchManager.requestCache;
      }

      throw new Error('RequestService is not available unless the feature flag is on and running on a canary build');
    };

    _proto._instantiateRecord = function _instantiateRecord(internalModel, modelName, recordData, identifier, properties) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        // assert here
        if (properties !== undefined) {

          if ('id' in properties) {
            internalModel.setId(properties.id);
          } // convert relationship Records to RecordDatas before passing to RecordData


          var defs = this._relationshipsDefinitionFor(modelName);

          if (defs !== null) {
            var keys = Object.keys(properties);
            var relationshipValue;

            for (var i = 0; i < keys.length; i++) {
              var prop = keys[i];
              var def = defs[prop];

              if (def !== undefined) {
                if (def.kind === 'hasMany') {

                  relationshipValue = extractRecordDatasFromRecords(properties[prop]);
                } else {
                  relationshipValue = extractRecordDataFromRecord(properties[prop]);
                }

                properties[prop] = relationshipValue;
              }
            }
          }
        } // TODO guard against initRecordOptions no being there


        var createOptions = recordData._initRecordCreateOptions(properties); //TODO Igor pass a wrapper instead of RD


        var _record = this.instantiateRecord(identifier, createOptions, this.__recordDataFor, this._notificationManager);

        setRecordIdentifier(_record, identifier); //recordToInternalModelMap.set(record, internalModel);

        return _record;
      } else {
        throw new Error('should not be here, custom model class ff error');
      }
    };

    _proto._internalDeleteRecord = function _internalDeleteRecord(internalModel) {
      internalModel.deleteRecord();
    } // FeatureFlagged in the DSModelStore claas
    ;

    _proto._attributesDefinitionFor = function _attributesDefinitionFor(modelName, identifier) {
      if (identifier) {
        return this.getSchemaDefinitionService().attributesDefinitionFor(identifier);
      } else {
        return this.getSchemaDefinitionService().attributesDefinitionFor(modelName);
      }
    };

    _proto._relationshipsDefinitionFor = function _relationshipsDefinitionFor(modelName, identifier) {
      if (identifier) {
        return this.getSchemaDefinitionService().relationshipsDefinitionFor(identifier);
      } else {
        return this.getSchemaDefinitionService().relationshipsDefinitionFor(modelName);
      }
    };

    _proto.registerSchemaDefinitionService = function registerSchemaDefinitionService(schema) {
      this._schemaDefinitionService = schema;
    };

    _proto.getSchemaDefinitionService = function getSchemaDefinitionService() {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        return this._schemaDefinitionService;
      } else {
        throw new Error('need to enable CUSTOM_MODEL_CLASS feature flag in order to access SchemaDefinitionService');
      }
    } // TODO Double check this return value is correct
    ;

    _proto._relationshipMetaFor = function _relationshipMetaFor(modelName, id, key) {
      return this._relationshipsDefinitionFor(modelName)[key];
    };

    _proto.modelFor = function modelFor(modelName) {

      return new ShimModelClass(this, modelName);
    } // Feature Flagged in DSModelStore

    /*
    Returns whether a ModelClass exists for a given modelName
    This exists for legacy support for the RESTSerializer,
    which due to how it must guess whether a key is a model
    must query for whether a match exists.
     We should investigate an RFC to make this public or removing
    this requirement.
     @private
    */
    ;

    _proto._hasModelFor = function _hasModelFor(modelName) {
      return this.getSchemaDefinitionService().doesTypeExist(modelName);
    } // .....................
    // . CREATE NEW RECORD .
    // .....................

    /**
      Create a new record in the current store. The properties passed
      to this method are set on the newly created record.
       To create a new instance of a `Post`:
       ```js
      store.createRecord('post', {
        title: 'Ember is awesome!'
      });
      ```
       To create a new instance of a `Post` that has a relationship with a `User` record:
       ```js
      let user = this.store.peekRecord('user', 1);
      store.createRecord('post', {
        title: 'Ember is awesome!',
        user: user
      });
      ```
       @method createRecord
      @param {String} modelName
      @param {Object} inputProperties a hash of properties to set on the
        newly created record.
      @return {Model} record
    */
    ;

    _proto.createRecord = function createRecord(modelName, inputProperties) {
      var _this2 = this;
      //   calls to `createRecord`. The run loop usage here is because we batch the joining and updating
      //   of record-arrays via ember's run loop, not our own.
      //
      //   to remove this, we would need to move to a new `async` API.

      return emberRun$2.join(function () {
        return _this2._backburner.join(function () {
          var normalizedModelName = normalizeModelName(modelName);
          var properties = Ember.assign({}, inputProperties); // If the passed properties do not include a primary key,
          // give the adapter an opportunity to generate one. Typically,
          // client-side ID generators will use something like uuid.js
          // to avoid conflicts.

          if (Ember.isNone(properties.id)) {
            properties.id = _this2._generateId(normalizedModelName, properties);
          } // Coerce ID to a string


          properties.id = coerceId(properties.id);
          var factory = internalModelFactoryFor(_this2);
          var internalModel = factory.build({
            type: normalizedModelName,
            id: properties.id
          });
          internalModel.loadedData(); // TODO this exists just to proxy `isNew` to RecordData which is weird

          internalModel.didCreateRecord();
          return internalModel.getRecord(properties);
        });
      });
    }
    /**
      If possible, this method asks the adapter to generate an ID for
      a newly created record.
       @method _generateId
      @private
      @param {String} modelName
      @param {Object} properties from the new record
      @return {String} if the adapter can generate one, an ID
    */
    ;

    _proto._generateId = function _generateId(modelName, properties) {
      var adapter = this.adapterFor(modelName);

      if (adapter && adapter.generateIdForRecord) {
        return adapter.generateIdForRecord(this, modelName, properties);
      }

      return null;
    } // .................
    // . DELETE RECORD .
    // .................

    /**
      For symmetry, a record can be deleted via the store.
       Example
       ```javascript
      let post = store.createRecord('post', {
        title: 'Ember is awesome!'
      });
       store.deleteRecord(post);
      ```
       @method deleteRecord
      @param {Model} record
    */
    ;

    _proto.deleteRecord = function deleteRecord(record) {

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (record instanceof Model) {
          return record.deleteRecord();
        } else {
          var _identifier = recordIdentifierFor(record);

          var internalModel = internalModelFactoryFor(this).peek(_identifier);
          internalModel.deleteRecord();
        }
      } else {
        record.deleteRecord();
      }
    }
    /**
      For symmetry, a record can be unloaded via the store.
      This will cause the record to be destroyed and freed up for garbage collection.
       Example
       ```javascript
      store.findRecord('post', 1).then(function(post) {
        store.unloadRecord(post);
      });
      ```
       @method unloadRecord
      @param {Model} record
    */
    ;

    _proto.unloadRecord = function unloadRecord(record) {

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (record instanceof Model) {
          return record.unloadRecord();
        } else {
          var _identifier2 = recordIdentifierFor(record);

          var internalModel = internalModelFactoryFor(this).peek(_identifier2);
          internalModel.unloadRecord();
        }
      } else {
        record.unloadRecord();
      }
    } // ................
    // . FIND RECORDS .
    // ................

    /**
      @method find
      @param {String} modelName
      @param {String|Integer} id
      @param {Object} options
      @return {Promise} promise
      @private
    */
    ;

    _proto.find = function find(modelName, id, options) {
      return this.findRecord(modelName, id);
    }
    /**
      This method returns a record for a given type and id combination.
       The `findRecord` method will always resolve its promise with the same
      object for a given type and `id`.
       The `findRecord` method will always return a **promise** that will be
      resolved with the record.
       Example
       ```app/routes/post.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findRecord('post', params.post_id);
        }
      });
      ```
       If the record is not yet available, the store will ask the adapter's `find`
      method to find the necessary data. If the record is already present in the
      store, it depends on the reload behavior _when_ the returned promise
      resolves.
       ### Preloading
       You can optionally `preload` specific attributes and relationships that you know of
      by passing them via the passed `options`.
       For example, if your Ember route looks like `/posts/1/comments/2` and your API route
      for the comment also looks like `/posts/1/comments/2` if you want to fetch the comment
      without fetching the post you can pass in the post to the `findRecord` call:
       ```javascript
      store.findRecord('comment', 2, { preload: { post: 1 } });
      ```
       If you have access to the post model you can also pass the model itself:
       ```javascript
      store.findRecord('post', 1).then(function (myPostModel) {
        store.findRecord('comment', 2, { post: myPostModel });
      });
      ```
       ### Reloading
       The reload behavior is configured either via the passed `options` hash or
      the result of the adapter's `shouldReloadRecord`.
       If `{ reload: true }` is passed or `adapter.shouldReloadRecord` evaluates
      to `true`, then the returned promise resolves once the adapter returns
      data, regardless if the requested record is already in the store:
       ```js
      store.push({
        data: {
          id: 1,
          type: 'post',
          revision: 1
        }
      });
       // adapter#findRecord resolves with
      // [
      //   {
      //     id: 1,
      //     type: 'post',
      //     revision: 2
      //   }
      // ]
      store.findRecord('post', 1, { reload: true }).then(function(post) {
        post.get('revision'); // 2
      });
      ```
       If no reload is indicated via the above mentioned ways, then the promise
      immediately resolves with the cached version in the store.
       ### Background Reloading
       Optionally, if `adapter.shouldBackgroundReloadRecord` evaluates to `true`,
      then a background reload is started, which updates the records' data, once
      it is available:
       ```js
      // app/adapters/post.js
      import ApplicationAdapter from "./application";
       export default ApplicationAdapter.extend({
        shouldReloadRecord(store, snapshot) {
          return false;
        },
         shouldBackgroundReloadRecord(store, snapshot) {
          return true;
        }
      });
       // ...
       store.push({
        data: {
          id: 1,
          type: 'post',
          revision: 1
        }
      });
       let blogPost = store.findRecord('post', 1).then(function(post) {
        post.get('revision'); // 1
      });
       // later, once adapter#findRecord resolved with
      // [
      //   {
      //     id: 1,
      //     type: 'post',
      //     revision: 2
      //   }
      // ]
       blogPost.get('revision'); // 2
      ```
       If you would like to force or prevent background reloading, you can set a
      boolean value for `backgroundReload` in the options object for
      `findRecord`.
       ```app/routes/post/edit.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findRecord('post', params.post_id, { backgroundReload: false });
        }
      });
      ```
       If you pass an object on the `adapterOptions` property of the options
      argument it will be passed to you adapter via the snapshot
       ```app/routes/post/edit.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findRecord('post', params.post_id, {
            adapterOptions: { subscribe: false }
          });
        }
      });
      ```
       ```app/adapters/post.js
      import MyCustomAdapter from './custom-adapter';
       export default MyCustomAdapter.extend({
        findRecord(store, type, id, snapshot) {
          if (snapshot.adapterOptions.subscribe) {
            // ...
          }
          // ...
        }
      });
      ```
       See [peekRecord](Store/methods/peekRecord?anchor=peekRecord) to get the cached version of a record.
       ### Retrieving Related Model Records
       If you use an adapter such as Ember's default
      [`JSONAPIAdapter`](/ember-data/release/classes/JSONAPIAdapter)
      that supports the [JSON API specification](http://jsonapi.org/) and if your server
      endpoint supports the use of an
      ['include' query parameter](http://jsonapi.org/format/#fetching-includes),
      you can use `findRecord()` to automatically retrieve additional records related to
      the one you request by supplying an `include` parameter in the `options` object.
       For example, given a `post` model that has a `hasMany` relationship with a `comment`
      model, when we retrieve a specific post we can have the server also return that post's
      comments in the same request:
       ```app/routes/post.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findRecord('post', params.post_id, { include: 'comments' });
        }
      });
       ```
      In this case, the post's comments would then be available in your template as
      `model.comments`.
       Multiple relationships can be requested using an `include` parameter consisting of a
      comma-separated list (without white-space) while nested relationships can be specified
      using a dot-separated sequence of relationship names. So to request both the post's
      comments and the authors of those comments the request would look like this:
       ```app/routes/post.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findRecord('post', params.post_id, { include: 'comments,comments.author' });
        }
      });
       ```
       @since 1.13.0
      @method findRecord
      @param {String} modelName
      @param {(String|Integer)} id
      @param {Object} [options]
      @param {Object} preload - optional set of attributes and relationships passed in either as IDs or as actual models
      @return {Promise} promise
    */
    ;

    _proto.findRecord = function findRecord(modelName, id, options) {
      var type = normalizeModelName(modelName);
      var normalizedId = ensureStringId(id);
      var resource = constructResource(type, normalizedId);
      var internalModel = internalModelFactoryFor(this).lookup(resource);
      options = options || {};

      if (!this.hasRecordForId(type, normalizedId)) {
        return this._findByInternalModel(internalModel, options);
      }

      var fetchedInternalModel = this._findRecord(internalModel, options);

      return promiseRecord(fetchedInternalModel, "DS: Store#findRecord " + type + " with id: " + id);
    };

    _proto._findRecord = function _findRecord(internalModel, options) {
      // Refetch if the reload option is passed
      if (options.reload) {
        return this._scheduleFetch(internalModel, options);
      }

      var snapshot = internalModel.createSnapshot(options);
      var adapter = this.adapterFor(internalModel.modelName); // Refetch the record if the adapter thinks the record is stale

      if (adapter.shouldReloadRecord(this, snapshot)) {
        return this._scheduleFetch(internalModel, options);
      }

      if (options.backgroundReload === false) {
        return Ember.RSVP.Promise.resolve(internalModel);
      } // Trigger the background refetch if backgroundReload option is passed


      if (options.backgroundReload || adapter.shouldBackgroundReloadRecord(this, snapshot)) {
        this._scheduleFetch(internalModel, options);
      } // Return the cached record


      return Ember.RSVP.Promise.resolve(internalModel);
    };

    _proto._findByInternalModel = function _findByInternalModel(internalModel, options) {
      if (options === void 0) {
        options = {};
      }

      if (options.preload) {
        internalModel.preloadData(options.preload);
      }

      var fetchedInternalModel = this._findEmptyInternalModel(internalModel, options);

      return promiseRecord(fetchedInternalModel, "DS: Store#findRecord " + internalModel.modelName + " with id: " + internalModel.id);
    };

    _proto._findEmptyInternalModel = function _findEmptyInternalModel(internalModel, options) {
      if (internalModel.isEmpty()) {
        return this._scheduleFetch(internalModel, options);
      } //TODO double check about reloading


      if (!canaryFeatures.REQUEST_SERVICE) {
        if (internalModel.isLoading()) {
          return internalModel._promiseProxy;
        }
      } else {
        if (internalModel.isLoading()) {
          return this._scheduleFetch(internalModel, options);
        }
      }

      return Ember.RSVP.Promise.resolve(internalModel);
    }
    /**
      This method makes a series of requests to the adapter's `find` method
      and returns a promise that resolves once they are all loaded.
       @private
      @method findByIds
      @param {String} modelName
      @param {Array} ids
      @return {Promise} promise
    */
    ;

    _proto.findByIds = function findByIds(modelName, ids) {
      var promises = new Array(ids.length);
      var normalizedModelName = normalizeModelName(modelName);

      for (var i = 0; i < ids.length; i++) {
        promises[i] = this.findRecord(normalizedModelName, ids[i]);
      }

      return promiseArray(Ember.RSVP.all(promises).then(Ember.A, null, "DS: Store#findByIds of " + normalizedModelName + " complete"));
    }
    /**
      This method is called by `findRecord` if it discovers that a particular
      type/id pair hasn't been loaded yet to kick off a request to the
      adapter.
       @method _fetchRecord
      @private
      @param {InternalModel} internalModel model
      @return {Promise} promise
     */
    ;

    _proto._fetchRecord = function _fetchRecord(internalModel, options) {
      var modelName = internalModel.modelName;
      var adapter = this.adapterFor(modelName);
      return _find(adapter, this, internalModel.type, internalModel.id, internalModel, options);
    };

    _proto._scheduleFetchMany = function _scheduleFetchMany(internalModels, options) {
      var fetches = new Array(internalModels.length);

      for (var i = 0; i < internalModels.length; i++) {
        fetches[i] = this._scheduleFetch(internalModels[i], options);
      }

      return Ember.RSVP.Promise.all(fetches);
    };

    _proto._scheduleFetchThroughFetchManager = function _scheduleFetchThroughFetchManager(internalModel, options) {
      var _this3 = this;

      if (options === void 0) {
        options = {};
      }

      var generateStackTrace = this.generateStackTracesForTrackedRequests; // TODO  remove this once we dont rely on state machine

      internalModel.loadingData();
      var identifier = internalModel.identifier;

      var promise = this._fetchManager.scheduleFetch(internalModel.identifier, options, generateStackTrace);

      return promise.then(function (payload) {
        if (canaryFeatures.IDENTIFIERS) {
          // ensure that regardless of id returned we assign to the correct record
          if (payload.data && !Array.isArray(payload.data)) {
            payload.data.lid = identifier.lid;
          }
        } // Returning this._push here, breaks typing but not any tests, invesstigate potential missing tests


        var potentiallyNewIm = _this3._push(payload);

        if (potentiallyNewIm && !Array.isArray(potentiallyNewIm)) {
          return potentiallyNewIm;
        } else {
          return internalModel;
        }
      }, function (error) {
        // TODO  remove this once we dont rely on state machine
        internalModel.notFound();

        if (internalModel.isEmpty()) {
          internalModel.unloadRecord();
        }

        throw error;
      });
    };

    _proto._scheduleFetch = function _scheduleFetch(internalModel, options) {
      if (canaryFeatures.REQUEST_SERVICE) {
        return this._scheduleFetchThroughFetchManager(internalModel, options);
      } else {
        if (internalModel._promiseProxy) {
          return internalModel._promiseProxy;
        }

        var id = internalModel.id,
            modelName = internalModel.modelName;
        var resolver = Ember.RSVP.defer("Fetching " + modelName + "' with id: " + id);
        var pendingFetchItem = {
          internalModel: internalModel,
          resolver: resolver,
          options: options
        };

        var promise = resolver.promise;
        internalModel.loadingData(promise);

        if (this._pendingFetch.size === 0) {
          emberRun$2.schedule('actions', this, this.flushAllPendingFetches);
        }

        var fetches = this._pendingFetch;
        var pending = fetches.get(modelName);

        if (pending === undefined) {
          pending = [];
          fetches.set(modelName, pending);
        }

        pending.push(pendingFetchItem);
        return promise;
      }
    };

    _proto.flushAllPendingFetches = function flushAllPendingFetches() {
      if (canaryFeatures.REQUEST_SERVICE) {
        return; //assert here
      } else {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        this._pendingFetch.forEach(this._flushPendingFetchForType, this);

        this._pendingFetch.clear();
      }
    };

    _proto._flushPendingFetchForType = function _flushPendingFetchForType(pendingFetchItems, modelName) {
      var store = this;
      var adapter = store.adapterFor(modelName);
      var shouldCoalesce = !!adapter.findMany && adapter.coalesceFindRequests;
      var totalItems = pendingFetchItems.length;
      var internalModels = new Array(totalItems);
      var seeking = Object.create(null);
      var optionsMap = new WeakMap();

      for (var _i = 0; _i < totalItems; _i++) {
        var pendingItem = pendingFetchItems[_i];
        var _internalModel = pendingItem.internalModel;
        internalModels[_i] = _internalModel;
        optionsMap.set(_internalModel, pendingItem.options); // We can remove this "not null" cast once we have enough typing
        // to know we are only dealing with ExistingResourceIdentifierObjects

        seeking[_internalModel.id] = pendingItem;
      }

      function _fetchRecord(recordResolverPair) {
        var recordFetch = store._fetchRecord(recordResolverPair.internalModel, recordResolverPair.options);

        recordResolverPair.resolver.resolve(recordFetch);
      }

      function handleFoundRecords(foundInternalModels, expectedInternalModels) {
        // resolve found records
        var found = Object.create(null);

        for (var _i2 = 0, _l = foundInternalModels.length; _i2 < _l; _i2++) {
          var _internalModel2 = foundInternalModels[_i2]; // We can remove this "not null" cast once we have enough typing
          // to know we are only dealing with ExistingResourceIdentifierObjects

          var _pair = seeking[_internalModel2.id];
          found[_internalModel2.id] = _internalModel2;

          if (_pair) {
            var resolver = _pair.resolver;
            resolver.resolve(_internalModel2);
          }
        } // reject missing records


        var missingInternalModels = [];

        for (var _i3 = 0, _l2 = expectedInternalModels.length; _i3 < _l2; _i3++) {
          var _internalModel3 = expectedInternalModels[_i3]; // We can remove this "not null" cast once we have enough typing
          // to know we are only dealing with ExistingResourceIdentifierObjects

          if (!found[_internalModel3.id]) {
            missingInternalModels.push(_internalModel3);
          }
        }

        if (missingInternalModels.length) {
          rejectInternalModels(missingInternalModels);
        }
      }

      function rejectInternalModels(internalModels, error) {
        for (var _i4 = 0, _l3 = internalModels.length; _i4 < _l3; _i4++) {
          var _internalModel4 = internalModels[_i4]; // We can remove this "not null" cast once we have enough typing
          // to know we are only dealing with ExistingResourceIdentifierObjects

          var _pair2 = seeking[_internalModel4.id];

          if (_pair2) {
            _pair2.resolver.reject(error || new Error("Expected: '" + _internalModel4 + "' to be present in the adapter provided payload, but it was not found."));
          }
        }
      }

      if (shouldCoalesce) {
        // TODO: Improve records => snapshots => records => snapshots
        //
        // We want to provide records to all store methods and snapshots to all
        // adapter methods. To make sure we're doing that we're providing an array
        // of snapshots to adapter.groupRecordsForFindMany(), which in turn will
        // return grouped snapshots instead of grouped records.
        //
        // But since the _findMany() finder is a store method we need to get the
        // records from the grouped snapshots even though the _findMany() finder
        // will once again convert the records to snapshots for adapter.findMany()
        var snapshots = new Array(totalItems);

        for (var _i5 = 0; _i5 < totalItems; _i5++) {
          snapshots[_i5] = internalModels[_i5].createSnapshot(optionsMap.get(internalModel));
        }

        var groups = adapter.groupRecordsForFindMany(this, snapshots);

        for (var i = 0, l = groups.length; i < l; i++) {
          var group = groups[i];
          var totalInGroup = groups[i].length;
          var ids = new Array(totalInGroup);
          var groupedInternalModels = new Array(totalInGroup);

          for (var j = 0; j < totalInGroup; j++) {
            var internalModel = group[j]._internalModel;
            groupedInternalModels[j] = internalModel;
            ids[j] = internalModel.id;
          }

          if (totalInGroup > 1) {
            (function (groupedInternalModels) {
              _findMany(adapter, store, modelName, ids, groupedInternalModels, optionsMap).then(function (foundInternalModels) {
                handleFoundRecords(foundInternalModels, groupedInternalModels);
              }).catch(function (error) {
                rejectInternalModels(groupedInternalModels, error);
              });
            })(groupedInternalModels);
          } else if (ids.length === 1) {
            var pair = seeking[groupedInternalModels[0].id];

            _fetchRecord(pair);
          }
        }
      } else {
        for (var _i6 = 0; _i6 < totalItems; _i6++) {
          _fetchRecord(pendingFetchItems[_i6]);
        }
      }
    }
    /**
      Get the reference for the specified record.
       Example
       ```javascript
      let userRef = store.getReference('user', 1);
       // check if the user is loaded
      let isLoaded = userRef.value() !== null;
       // get the record of the reference (null if not yet available)
      let user = userRef.value();
       // get the identifier of the reference
      if (userRef.remoteType() === 'id') {
      let id = userRef.id();
      }
       // load user (via store.find)
      userRef.load().then(...)
       // or trigger a reload
      userRef.reload().then(...)
       // provide data for reference
      userRef.push({ id: 1, username: '@user' }).then(function(user) {
        userRef.value() === user;
      });
      ```
       @method getReference
      @param {String} modelName
      @param {String|Integer} id
      @since 2.5.0
      @return {RecordReference}
    */
    ;

    _proto.getReference = function getReference(modelName, id) {

      var type = normalizeModelName(modelName);
      var normalizedId = ensureStringId(id);
      var resource = constructResource(type, normalizedId);
      return internalModelFactoryFor(this).lookup(resource).recordReference;
    }
    /**
      Get a record by a given type and ID without triggering a fetch.
       This method will synchronously return the record if it is available in the store,
      otherwise it will return `null`. A record is available if it has been fetched earlier, or
      pushed manually into the store.
       See [findRecord](Store/methods/findRecord?anchor=findRecord) if you would like to request this record from the backend.
       _Note: This is a synchronous method and does not return a promise._
       ```js
      let post = store.peekRecord('post', 1);
       post.get('id'); // 1
      ```
       @since 1.13.0
      @method peekRecord
      @param {String} modelName
      @param {String|Integer} id
      @return {Model|null} record
    */
    ;

    _proto.peekRecord = function peekRecord(modelName, id) {
      var type = normalizeModelName(modelName);
      var normalizedId = ensureStringId(id);

      if (this.hasRecordForId(type, normalizedId)) {
        var resource = constructResource(type, normalizedId);
        return internalModelFactoryFor(this).lookup(resource).getRecord();
      } else {
        return null;
      }
    }
    /**
      This method is called by the record's `reload` method.
       This method calls the adapter's `find` method, which returns a promise. When
      **that** promise resolves, `_reloadRecord` will resolve the promise returned
      by the record's `reload`.
       @method _reloadRecord
      @private
      @param {Model} internalModel
      @param options optional to include adapterOptions
      @return {Promise} promise
    */
    ;

    _proto._reloadRecord = function _reloadRecord(internalModel, options) {
      if (canaryFeatures.REQUEST_SERVICE) {
        options.isReloading = true;
      }

      var id = internalModel.id,
          modelName = internalModel.modelName;
      var adapter = this.adapterFor(modelName);
      return this._scheduleFetch(internalModel, options);
    }
    /**
     This method returns true if a record for a given modelName and id is already
     loaded in the store. Use this function to know beforehand if a findRecord()
     will result in a request or that it will be a cache hit.
      Example
      ```javascript
     store.hasRecordForId('post', 1); // false
     store.findRecord('post', 1).then(function() {
       store.hasRecordForId('post', 1); // true
     });
     ```
       @method hasRecordForId
      @param {String} modelName
      @param {(String|Integer)} id
      @return {Boolean}
    */
    ;

    _proto.hasRecordForId = function hasRecordForId(modelName, id) {
      var type = normalizeModelName(modelName);
      var trueId = ensureStringId(id);
      var resource = {
        type: type,
        id: trueId
      };
      var identifier = identifierCacheFor(this).peekRecordIdentifier(resource);
      var internalModel = identifier && internalModelFactoryFor(this).peek(identifier);
      return !!internalModel && internalModel.isLoaded();
    }
    /**
      Returns id record for a given type and ID. If one isn't already loaded,
      it builds a new record and leaves it in the `empty` state.
       @method recordForId
      @private
      @param {String} modelName
      @param {(String|Integer)} id
      @return {Model} record
    */
    ;

    _proto.recordForId = function recordForId(modelName, id) {
      var resource = constructResource(modelName, ensureStringId(id));
      return internalModelFactoryFor(this).lookup(resource).getRecord();
    }
    /**
      @method findMany
      @private
      @param {Array} internalModels
      @return {Promise} promise
    */
    ;

    _proto.findMany = function findMany(internalModels, options) {

      var finds = new Array(internalModels.length);

      for (var i = 0; i < internalModels.length; i++) {
        finds[i] = this._findEmptyInternalModel(internalModels[i], options);
      }

      return Ember.RSVP.Promise.all(finds);
    }
    /**
      If a relationship was originally populated by the adapter as a link
      (as opposed to a list of IDs), this method is called when the
      relationship is fetched.
       The link (which is usually a URL) is passed through unchanged, so the
      adapter can make whatever request it wants.
       The usual use-case is for the server to register a URL as a link, and
      then use that URL in the future to make a request for the relationship.
       @method findHasMany
      @private
      @param {InternalModel} internalModel
      @param {any} link
      @param {(Relationship)} relationship
      @return {Promise} promise
    */
    ;

    _proto.findHasMany = function findHasMany(internalModel, link, relationship, options) {

      var adapter = this.adapterFor(internalModel.modelName);
      return _findHasMany(adapter, this, internalModel, link, relationship, options);
    };

    _proto._findHasManyByJsonApiResource = function _findHasManyByJsonApiResource(resource, parentInternalModel, relationshipMeta, options) {
      var _this4 = this;

      if (!resource) {
        return Ember.RSVP.resolve([]);
      }

      var _resource$_relationsh = resource._relationship,
          relationshipIsStale = _resource$_relationsh.relationshipIsStale,
          allInverseRecordsAreLoaded = _resource$_relationsh.allInverseRecordsAreLoaded,
          hasDematerializedInverse = _resource$_relationsh.hasDematerializedInverse,
          hasAnyRelationshipData = _resource$_relationsh.hasAnyRelationshipData,
          relationshipIsEmpty = _resource$_relationsh.relationshipIsEmpty,
          shouldForceReload = _resource$_relationsh.shouldForceReload;
      var shouldFindViaLink = resource.links && resource.links.related && (shouldForceReload || hasDematerializedInverse || relationshipIsStale || !allInverseRecordsAreLoaded && !relationshipIsEmpty); // fetch via link

      if (shouldFindViaLink) {
        return this.findHasMany(parentInternalModel, resource.links.related, relationshipMeta, options);
      }

      var preferLocalCache = hasAnyRelationshipData && !relationshipIsEmpty;
      var hasLocalPartialData = hasDematerializedInverse || relationshipIsEmpty && Array.isArray(resource.data) && resource.data.length > 0; // fetch using data, pulling from local cache if possible

      if (!shouldForceReload && !relationshipIsStale && (preferLocalCache || hasLocalPartialData)) {
        var internalModels = resource.data.map(function (json) {
          return _this4._internalModelForResource(json);
        });
        return this.findMany(internalModels, options);
      }

      var hasData = hasAnyRelationshipData && !relationshipIsEmpty; // fetch by data

      if (hasData || hasLocalPartialData) {
        var _internalModels = resource.data.map(function (json) {
          return _this4._internalModelForResource(json);
        });

        return this._scheduleFetchMany(_internalModels, options);
      } // we were explicitly told we have no data and no links.
      //   TODO if the relationshipIsStale, should we hit the adapter anyway?


      return Ember.RSVP.resolve([]);
    };

    _proto._getHasManyByJsonApiResource = function _getHasManyByJsonApiResource(resource) {
      var _this5 = this;

      var internalModels = [];

      if (resource && resource.data) {
        internalModels = resource.data.map(function (reference) {
          return _this5._internalModelForResource(reference);
        });
      }

      return internalModels;
    }
    /**
      @method findBelongsTo
      @private
      @param {InternalModel} internalModel
      @param {any} link
      @param {Relationship} relationship
      @return {Promise} promise
    */
    ;

    _proto.findBelongsTo = function findBelongsTo(internalModel, link, relationship, options) {

      var adapter = this.adapterFor(internalModel.modelName);
      return _findBelongsTo(adapter, this, internalModel, link, relationship, options);
    };

    _proto._fetchBelongsToLinkFromResource = function _fetchBelongsToLinkFromResource(resource, parentInternalModel, relationshipMeta, options) {
      if (!resource || !resource.links || !resource.links.related) {
        // should we warn here, not sure cause its an internal method
        return Ember.RSVP.resolve(null);
      }

      return this.findBelongsTo(parentInternalModel, resource.links.related, relationshipMeta, options).then(function (internalModel) {
        return internalModel ? internalModel.getRecord() : null;
      });
    };

    _proto._findBelongsToByJsonApiResource = function _findBelongsToByJsonApiResource(resource, parentInternalModel, relationshipMeta, options) {
      if (!resource) {
        return Ember.RSVP.resolve(null);
      }

      var internalModel = resource.data ? this._internalModelForResource(resource.data) : null;
      var _resource$_relationsh2 = resource._relationship,
          relationshipIsStale = _resource$_relationsh2.relationshipIsStale,
          allInverseRecordsAreLoaded = _resource$_relationsh2.allInverseRecordsAreLoaded,
          hasDematerializedInverse = _resource$_relationsh2.hasDematerializedInverse,
          hasAnyRelationshipData = _resource$_relationsh2.hasAnyRelationshipData,
          relationshipIsEmpty = _resource$_relationsh2.relationshipIsEmpty,
          shouldForceReload = _resource$_relationsh2.shouldForceReload;
      var shouldFindViaLink = resource.links && resource.links.related && (shouldForceReload || hasDematerializedInverse || relationshipIsStale || !allInverseRecordsAreLoaded && !relationshipIsEmpty);

      if (internalModel) {
        // short circuit if we are already loading
        if (canaryFeatures.REQUEST_SERVICE) {
          // Temporary fix for requests already loading until we move this inside the fetch manager
          var pendingRequests = this.getRequestStateService().getPendingRequestsForRecord(internalModel.identifier).filter(function (req) {
            return req.type === 'query';
          });

          if (pendingRequests.length > 0) {
            return pendingRequests[0][RequestPromise].then(function () {
              return internalModel.getRecord();
            });
          }
        } else {
          if (internalModel.isLoading()) {
            return internalModel._promiseProxy.then(function () {
              return internalModel.getRecord();
            });
          }
        }
      } // fetch via link


      if (shouldFindViaLink) {
        return this._fetchBelongsToLinkFromResource(resource, parentInternalModel, relationshipMeta, options);
      }

      var preferLocalCache = hasAnyRelationshipData && allInverseRecordsAreLoaded && !relationshipIsEmpty;
      var hasLocalPartialData = hasDematerializedInverse || relationshipIsEmpty && resource.data; // null is explicit empty, undefined is "we don't know anything"

      var localDataIsEmpty = resource.data === undefined || resource.data === null; // fetch using data, pulling from local cache if possible

      if (!shouldForceReload && !relationshipIsStale && (preferLocalCache || hasLocalPartialData)) {
        /*
          We have canonical data, but our local state is empty
         */
        if (localDataIsEmpty) {
          return Ember.RSVP.resolve(null);
        }

        return this._findByInternalModel(internalModel, options);
      }

      var resourceIsLocal = !localDataIsEmpty && resource.data.id === null;

      if (internalModel && resourceIsLocal) {
        return Ember.RSVP.resolve(internalModel.getRecord());
      } // fetch by data


      if (internalModel && !localDataIsEmpty) {
        return this._scheduleFetch(internalModel, options).then(function () {
          return internalModel.getRecord();
        });
      } // we were explicitly told we have no data and no links.
      //   TODO if the relationshipIsStale, should we hit the adapter anyway?


      return Ember.RSVP.resolve(null);
    }
    /**
      This method delegates a query to the adapter. This is the one place where
      adapter-level semantics are exposed to the application.
       Each time this method is called a new request is made through the adapter.
       Exposing queries this way seems preferable to creating an abstract query
      language for all server-side queries, and then require all adapters to
      implement them.
       ---
       If you do something like this:
       ```javascript
      store.query('person', { page: 1 });
      ```
       The request made to the server will look something like this:
       ```
      GET "/api/v1/person?page=1"
      ```
       ---
       If you do something like this:
       ```javascript
      store.query('person', { ids: [1, 2, 3] });
      ```
       The request made to the server will look something like this:
       ```
      GET "/api/v1/person?ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3"
      decoded: "/api/v1/person?ids[]=1&ids[]=2&ids[]=3"
      ```
       This method returns a promise, which is resolved with an
      [`AdapterPopulatedRecordArray`](/ember-data/release/classes/AdapterPopulatedRecordArray)
      once the server returns.
       @since 1.13.0
      @method query
      @param {String} modelName
      @param {any} query an opaque query to be used by the adapter
      @param {Object} options optional, may include `adapterOptions` hash which will be passed to adapter.query
      @return {Promise} promise
    */
    ;

    _proto.query = function query(modelName, _query2, options) {
      var adapterOptionsWrapper = {};

      if (options && options.adapterOptions) {
        adapterOptionsWrapper.adapterOptions = options.adapterOptions;
      }

      var normalizedModelName = normalizeModelName(modelName);
      return this._query(normalizedModelName, _query2, null, adapterOptionsWrapper);
    };

    _proto._query = function _query$1(modelName, query, array, options) {
      var adapter = this.adapterFor(modelName);
      return promiseArray(_query(adapter, this, modelName, query, array, options));
    }
    /**
      This method makes a request for one record, where the `id` is not known
      beforehand (if the `id` is known, use [`findRecord`](Store/methods/findRecord?anchor=findRecord)
      instead).
       This method can be used when it is certain that the server will return a
      single object for the primary data.
       Each time this method is called a new request is made through the adapter.
       Let's assume our API provides an endpoint for the currently logged in user
      via:
       ```
      // GET /api/current_user
      {
        user: {
          id: 1234,
          username: 'admin'
        }
      }
      ```
       Since the specific `id` of the `user` is not known beforehand, we can use
      `queryRecord` to get the user:
       ```javascript
      store.queryRecord('user', {}).then(function(user) {
        let username = user.get('username');
        console.log(`Currently logged in as ${username}`);
      });
      ```
       The request is made through the adapters' `queryRecord`:
       ```app/adapters/user.js
      import $ from 'jquery';
      import Adapter from '@ember-data/adapter';
       export default Adapter.extend({
        queryRecord(modelName, query) {
          return $.getJSON('/api/current_user');
        }
      });
      ```
       Note: the primary use case for `store.queryRecord` is when a single record
      is queried and the `id` is not known beforehand. In all other cases
      `store.query` and using the first item of the array is likely the preferred
      way:
       ```
      // GET /users?username=unique
      {
        data: [{
          id: 1234,
          type: 'user',
          attributes: {
            username: "unique"
          }
        }]
      }
      ```
       ```javascript
      store.query('user', { username: 'unique' }).then(function(users) {
        return users.get('firstObject');
      }).then(function(user) {
        let id = user.get('id');
      });
      ```
       This method returns a promise, which resolves with the found record.
       If the adapter returns no data for the primary data of the payload, then
      `queryRecord` resolves with `null`:
       ```
      // GET /users?username=unique
      {
        data: null
      }
      ```
       ```javascript
      store.queryRecord('user', { username: 'unique' }).then(function(user) {
        console.log(user); // null
      });
      ```
       @since 1.13.0
      @method queryRecord
      @param {String} modelName
      @param {any} query an opaque query to be used by the adapter
      @param {Object} options optional, may include `adapterOptions` hash which will be passed to adapter.queryRecord
      @return {Promise} promise which resolves with the found record or `null`
    */
    ;

    _proto.queryRecord = function queryRecord(modelName, query, options) {
      var normalizedModelName = normalizeModelName(modelName);
      var adapter = this.adapterFor(normalizedModelName);
      var adapterOptionsWrapper = {};

      if (options && options.adapterOptions) {
        adapterOptionsWrapper.adapterOptions = options.adapterOptions;
      }
      return promiseObject(_queryRecord(adapter, this, normalizedModelName, query, adapterOptionsWrapper).then(function (internalModel) {
        // the promise returned by store.queryRecord is expected to resolve with
        // an instance of Model
        if (internalModel) {
          return internalModel.getRecord();
        }

        return null;
      }));
    }
    /**
      `findAll` asks the adapter's `findAll` method to find the records for the
      given type, and returns a promise which will resolve with all records of
      this type present in the store, even if the adapter only returns a subset
      of them.
       ```app/routes/authors.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findAll('author');
        }
      });
      ```
       _When_ the returned promise resolves depends on the reload behavior,
      configured via the passed `options` hash and the result of the adapter's
      `shouldReloadAll` method.
       ### Reloading
       If `{ reload: true }` is passed or `adapter.shouldReloadAll` evaluates to
      `true`, then the returned promise resolves once the adapter returns data,
      regardless if there are already records in the store:
       ```js
      store.push({
        data: {
          id: 'first',
          type: 'author'
        }
      });
       // adapter#findAll resolves with
      // [
      //   {
      //     id: 'second',
      //     type: 'author'
      //   }
      // ]
      store.findAll('author', { reload: true }).then(function(authors) {
        authors.getEach('id'); // ['first', 'second']
      });
      ```
       If no reload is indicated via the above mentioned ways, then the promise
      immediately resolves with all the records currently loaded in the store.
       ### Background Reloading
       Optionally, if `adapter.shouldBackgroundReloadAll` evaluates to `true`,
      then a background reload is started. Once this resolves, the array with
      which the promise resolves, is updated automatically so it contains all the
      records in the store:
       ```app/adapters/application.js
      import Adapter from '@ember-data/adapter';
      export default Adapter.extend({
        shouldReloadAll(store, snapshotsArray) {
          return false;
        },
         shouldBackgroundReloadAll(store, snapshotsArray) {
          return true;
        }
      });
       // ...
       store.push({
        data: {
          id: 'first',
          type: 'author'
        }
      });
       let allAuthors;
      store.findAll('author').then(function(authors) {
        authors.getEach('id'); // ['first']
         allAuthors = authors;
      });
       // later, once adapter#findAll resolved with
      // [
      //   {
      //     id: 'second',
      //     type: 'author'
      //   }
      // ]
       allAuthors.getEach('id'); // ['first', 'second']
      ```
       If you would like to force or prevent background reloading, you can set a
      boolean value for `backgroundReload` in the options object for
      `findAll`.
       ```app/routes/post/edit.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model() {
          return this.store.findAll('post', { backgroundReload: false });
        }
      });
      ```
       If you pass an object on the `adapterOptions` property of the options
      argument it will be passed to you adapter via the `snapshotRecordArray`
       ```app/routes/posts.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model(params) {
          return this.store.findAll('post', {
            adapterOptions: { subscribe: false }
          });
        }
      });
      ```
       ```app/adapters/post.js
      import MyCustomAdapter from './custom-adapter';
       export default MyCustomAdapter.extend({
        findAll(store, type, sinceToken, snapshotRecordArray) {
          if (snapshotRecordArray.adapterOptions.subscribe) {
            // ...
          }
          // ...
        }
      });
      ```
       See [peekAll](Store/methods/peekAll?anchor=peekAll) to get an array of current records in the
      store, without waiting until a reload is finished.
       ### Retrieving Related Model Records
       If you use an adapter such as Ember's default
      [`JSONAPIAdapter`](/ember-data/release/classes/JSONAPIAdapter)
      that supports the [JSON API specification](http://jsonapi.org/) and if your server
      endpoint supports the use of an
      ['include' query parameter](http://jsonapi.org/format/#fetching-includes),
      you can use `findAll()` to automatically retrieve additional records related to
      those requested by supplying an `include` parameter in the `options` object.
       For example, given a `post` model that has a `hasMany` relationship with a `comment`
      model, when we retrieve all of the post records we can have the server also return
      all of the posts' comments in the same request:
       ```app/routes/posts.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model() {
          return this.store.findAll('post', { include: 'comments' });
        }
      });
       ```
      Multiple relationships can be requested using an `include` parameter consisting of a
      comma-separated list (without white-space) while nested relationships can be specified
      using a dot-separated sequence of relationship names. So to request both the posts'
      comments and the authors of those comments the request would look like this:
       ```app/routes/posts.js
      import Route from '@ember/routing/route';
       export default Route.extend({
        model() {
          return this.store.findAll('post', { include: 'comments,comments.author' });
        }
      });
       ```
       See [query](Store/methods/query?anchor=query) to only get a subset of records from the server.
       @since 1.13.0
      @method findAll
      @param {String} modelName
      @param {Object} options
      @return {Promise} promise
    */
    ;

    _proto.findAll = function findAll(modelName, options) {
      var normalizedModelName = normalizeModelName(modelName);

      var fetch = this._fetchAll(normalizedModelName, this.peekAll(normalizedModelName), options);

      return fetch;
    }
    /**
      @method _fetchAll
      @private
      @param {Model} modelName
      @param {RecordArray} array
      @return {Promise} promise
    */
    ;

    _proto._fetchAll = function _fetchAll(modelName, array, options) {
      if (options === void 0) {
        options = {};
      }

      var adapter = this.adapterFor(modelName);

      if (options.reload) {
        Ember.set(array, 'isUpdating', true);
        return promiseArray(_findAll(adapter, this, modelName, options));
      }

      var snapshotArray = array._createSnapshot(options);

      if (adapter.shouldReloadAll(this, snapshotArray)) {
        Ember.set(array, 'isUpdating', true);
        return promiseArray(_findAll(adapter, this, modelName, options));
      }

      if (options.backgroundReload === false) {
        return promiseArray(Ember.RSVP.Promise.resolve(array));
      }

      if (options.backgroundReload || adapter.shouldBackgroundReloadAll(this, snapshotArray)) {
        Ember.set(array, 'isUpdating', true);

        _findAll(adapter, this, modelName, options);
      }

      return promiseArray(Ember.RSVP.Promise.resolve(array));
    }
    /**
      @method _didUpdateAll
      @param {String} modelName
      @private
    */
    ;

    _proto._didUpdateAll = function _didUpdateAll(modelName) {
      this.recordArrayManager._didUpdateAll(modelName);
    }
    /**
      This method returns a filtered array that contains all of the
      known records for a given type in the store.
       Note that because it's just a filter, the result will contain any
      locally created records of the type, however, it will not make a
      request to the backend to retrieve additional records. If you
      would like to request all the records from the backend please use
      [store.findAll](Store/methods/findAll?anchor=findAll).
       Also note that multiple calls to `peekAll` for a given type will always
      return the same `RecordArray`.
       Example
       ```javascript
      let localPosts = store.peekAll('post');
      ```
       @since 1.13.0
      @method peekAll
      @param {String} modelName
      @return {RecordArray}
    */
    ;

    _proto.peekAll = function peekAll(modelName) {
      var normalizedModelName = normalizeModelName(modelName);
      return this.recordArrayManager.liveRecordArrayFor(normalizedModelName);
    }
    /**
      This method unloads all records in the store.
      It schedules unloading to happen during the next run loop.
       Optionally you can pass a type which unload all records for a given type.
       ```javascript
      store.unloadAll();
      store.unloadAll('post');
      ```
       @method unloadAll
      @param {String} modelName
    */
    ;

    _proto.unloadAll = function unloadAll(modelName) {
      var factory = internalModelFactoryFor(this);

      if (modelName === undefined) {
        factory.clear();
      } else {
        var normalizedModelName = normalizeModelName(modelName);
        factory.clear(normalizedModelName);
      }
    };

    _proto.filter = function filter() {
    } // ..............
    // . PERSISTING .
    // ..............

    /**
      This method is called by `record.save`, and gets passed a
      resolver for the promise that `record.save` returns.
       It schedules saving to happen at the end of the run loop.
       @method scheduleSave
      @private
      @param {InternalModel} internalModel
      @param {Resolver} resolver
      @param {Object} options
    */
    ;

    _proto.scheduleSave = function scheduleSave(internalModel, resolver, options) {
      var _this6 = this;

      var snapshot = internalModel.createSnapshot(options);

      if (internalModel._isRecordFullyDeleted()) {
        resolver.resolve();
        return resolver.promise;
      }

      internalModel.adapterWillCommit();

      if (canaryFeatures.REQUEST_SERVICE) {
        if (!options) {
          options = {};
        }

        var recordData = internalModel._recordData;
        var operation = 'updateRecord'; // TODO handle missing isNew

        if (recordData.isNew && recordData.isNew()) {
          operation = 'createRecord';
        } else if (recordData.isDeleted && recordData.isDeleted()) {
          operation = 'deleteRecord';
        }

        options[SaveOp] = operation;

        var fetchManagerPromise = this._fetchManager.scheduleSave(internalModel.identifier, options);

        var promise = fetchManagerPromise.then(function (payload) {
          /*
          Note to future spelunkers hoping to optimize.
          We rely on this `run` to create a run loop if needed
          that `store._push` and `store.didSaveRecord` will both share.
          We use `join` because it is often the case that we
          have an outer run loop available still from the first
          call to `store._push`;
          */
          _this6._backburner.join(function () {
            var data = payload && payload.data;

            _this6.didSaveRecord(internalModel, {
              data: data
            }, operation);

            if (payload && payload.included) {
              _this6._push({
                data: null,
                included: payload.included
              });
            }
          });
        }, function (_ref) {
          var error = _ref.error,
              parsedErrors = _ref.parsedErrors;

          _this6.recordWasInvalid(internalModel, parsedErrors, error);

          throw error;
        });
        return promise;
      }

      this._pendingSave.push({
        snapshot: snapshot,
        resolver: resolver
      });

      emberRun$2.scheduleOnce('actions', this, this.flushPendingSave);
    }
    /**
      This method is called at the end of the run loop, and
      flushes any records passed into `scheduleSave`
       @method flushPendingSave
      @private
    */
    ;

    _proto.flushPendingSave = function flushPendingSave() {
      if (canaryFeatures.REQUEST_SERVICE) {
        // assert here
        return;
      }

      var pending = this._pendingSave.slice();

      this._pendingSave = [];

      for (var i = 0, j = pending.length; i < j; i++) {
        var pendingItem = pending[i];
        var snapshot = pendingItem.snapshot;
        var resolver = pendingItem.resolver;
        var internalModel = snapshot._internalModel;
        var adapter = this.adapterFor(internalModel.modelName);
        var operation = void 0;

        if (canaryFeatures.RECORD_DATA_STATE) {
          // TODO move this out of internalModel
          if (internalModel.isNew()) {
            operation = 'createRecord';
          } else if (internalModel.isDeleted()) {
            operation = 'deleteRecord';
          } else {
            operation = 'updateRecord';
          }
        } else {
          if (internalModel.currentState.stateName === 'root.deleted.saved') {
            resolver.resolve();
            continue;
          } else if (internalModel.isNew()) {
            operation = 'createRecord';
          } else if (internalModel.isDeleted()) {
            operation = 'deleteRecord';
          } else {
            operation = 'updateRecord';
          }
        }

        resolver.resolve(_commit(adapter, this, operation, snapshot));
      }
    }
    /**
      This method is called once the promise returned by an
      adapter's `createRecord`, `updateRecord` or `deleteRecord`
      is resolved.
       If the data provides a server-generated ID, it will
      update the record and the store's indexes.
       @method didSaveRecord
      @private
      @param {InternalModel} internalModel the in-flight internal model
      @param {Object} data optional data (see above)
      @param {string} op the adapter operation that was committed
    */
    ;

    _proto.didSaveRecord = function didSaveRecord(internalModel, dataArg, op) {

      var data;

      if (dataArg) {
        data = dataArg.data;
      }

      if (canaryFeatures.IDENTIFIERS) {
        var cache = identifierCacheFor(this);
        var _identifier3 = internalModel.identifier;

        if (op !== 'deleteRecord' && data) {
          cache.updateRecordIdentifier(_identifier3, data);
        }
      } //We first make sure the primary data has been updated
      //TODO try to move notification to the user to the end of the runloop


      internalModel.adapterDidCommit(data);
    }
    /**
      This method is called once the promise returned by an
      adapter's `createRecord`, `updateRecord` or `deleteRecord`
      is rejected with a `InvalidError`.
       @method recordWasInvalid
      @private
      @param {InternalModel} internalModel
      @param {Object} errors
    */
    ;

    _proto.recordWasInvalid = function recordWasInvalid(internalModel, parsedErrors, error) {

      if (canaryFeatures.RECORD_DATA_ERRORS) {
        internalModel.adapterDidInvalidate(parsedErrors, error);
      } else {
        internalModel.adapterDidInvalidate(parsedErrors);
      }
    }
    /**
      This method is called once the promise returned by an
      adapter's `createRecord`, `updateRecord` or `deleteRecord`
      is rejected (with anything other than a `InvalidError`).
       @method recordWasError
      @private
      @param {InternalModel} internalModel
      @param {Error} error
    */
    ;

    _proto.recordWasError = function recordWasError(internalModel, error) {

      internalModel.adapterDidError(error);
    }
    /**
      Sets newly received ID from the adapter's `createRecord`, `updateRecord`
      or `deleteRecord`.
       @method setRecordId
      @private
      @param {String} modelName
      @param {string} newId
      @param {string} clientId
     */
    ;

    _proto.setRecordId = function setRecordId(modelName, newId, clientId) {

      internalModelFactoryFor(this).setRecordId(modelName, newId, clientId);
    } // ................
    // . LOADING DATA .
    // ................

    /**
      This internal method is used by `push`.
       @method _load
      @private
      @param {Object} data
    */
    ;

    _proto._load = function _load(data) {
      var resource = constructResource(normalizeModelName(data.type), ensureStringId(data.id), coerceId(data.lid));
      var internalModel = internalModelFactoryFor(this).lookup(resource, data); // store.push will be from empty
      // findRecord will be from root.loading
      // all else will be updates

      var isLoading = internalModel.currentState.stateName === 'root.loading';
      var isUpdate = internalModel.currentState.isEmpty === false && !isLoading;

      if (canaryFeatures.IDENTIFIERS) {
        // exclude store.push (root.empty) case
        if (isUpdate || isLoading) {
          var _identifier4 = internalModel.identifier;
          var updatedIdentifier = identifierCacheFor(this).updateRecordIdentifier(_identifier4, data);

          if (updatedIdentifier !== _identifier4) {
            // we encountered a merge of identifiers in which
            // two identifiers (and likely two internalModels)
            // existed for the same resource. Now that we have
            // determined the correct identifier to use, make sure
            // that we also use the correct internalModel.
            _identifier4 = updatedIdentifier;
            internalModel = internalModelFactoryFor(this).lookup(_identifier4);
          }
        }
      }

      internalModel.setupData(data);

      if (isUpdate) {
        this.recordArrayManager.recordDidChange(internalModel);
      } else {
        this.recordArrayManager.recordWasLoaded(internalModel);
      }

      return internalModel;
    }
    /**
      Push some data for a given type into the store.
       This method expects normalized [JSON API](http://jsonapi.org/) document. This means you have to follow [JSON API specification](http://jsonapi.org/format/) with few minor adjustments:
      - record's `type` should always be in singular, dasherized form
      - members (properties) should be camelCased
       [Your primary data should be wrapped inside `data` property](http://jsonapi.org/format/#document-top-level):
       ```js
      store.push({
        data: {
          // primary data for single record of type `Person`
          id: '1',
          type: 'person',
          attributes: {
            firstName: 'Daniel',
            lastName: 'Kmak'
          }
        }
      });
      ```
       [Demo.](http://ember-twiddle.com/fb99f18cd3b4d3e2a4c7)
       `data` property can also hold an array (of records):
       ```js
      store.push({
        data: [
          // an array of records
          {
            id: '1',
            type: 'person',
            attributes: {
              firstName: 'Daniel',
              lastName: 'Kmak'
            }
          },
          {
            id: '2',
            type: 'person',
            attributes: {
              firstName: 'Tom',
              lastName: 'Dale'
            }
          }
        ]
      });
      ```
       [Demo.](http://ember-twiddle.com/69cdbeaa3702159dc355)
       There are some typical properties for `JSONAPI` payload:
      * `id` - mandatory, unique record's key
      * `type` - mandatory string which matches `model`'s dasherized name in singular form
      * `attributes` - object which holds data for record attributes - `attr`'s declared in model
      * `relationships` - object which must contain any of the following properties under each relationships' respective key (example path is `relationships.achievements.data`):
        - [`links`](http://jsonapi.org/format/#document-links)
        - [`data`](http://jsonapi.org/format/#document-resource-object-linkage) - place for primary data
        - [`meta`](http://jsonapi.org/format/#document-meta) - object which contains meta-information about relationship
       For this model:
       ```app/models/person.js
      import Model, { attr, hasMany } from '@ember-data/model';
       export default Model.extend({
        firstName: attr('string'),
        lastName: attr('string'),
         children: hasMany('person')
      });
      ```
       To represent the children as IDs:
       ```js
      {
        data: {
          id: '1',
          type: 'person',
          attributes: {
            firstName: 'Tom',
            lastName: 'Dale'
          },
          relationships: {
            children: {
              data: [
                {
                  id: '2',
                  type: 'person'
                },
                {
                  id: '3',
                  type: 'person'
                },
                {
                  id: '4',
                  type: 'person'
                }
              ]
            }
          }
        }
      }
      ```
       [Demo.](http://ember-twiddle.com/343e1735e034091f5bde)
       To represent the children relationship as a URL:
       ```js
      {
        data: {
          id: '1',
          type: 'person',
          attributes: {
            firstName: 'Tom',
            lastName: 'Dale'
          },
          relationships: {
            children: {
              links: {
                related: '/people/1/children'
              }
            }
          }
        }
      }
      ```
       If you're streaming data or implementing an adapter, make sure
      that you have converted the incoming data into this form. The
      store's [normalize](Store/methods/normalize?anchor=normalize) method is a convenience
      helper for converting a json payload into the form Ember Data
      expects.
       ```js
      store.push(store.normalize('person', data));
      ```
       This method can be used both to push in brand new
      records, as well as to update existing records.
       @method push
      @param {Object} data
      @return the record(s) that was created or
        updated.
    */
    ;

    _proto.push = function push(data) {

      var pushed = this._push(data);

      if (Array.isArray(pushed)) {
        var records = pushed.map(function (internalModel) {
          return internalModel.getRecord();
        });
        return records;
      }

      if (pushed === null) {
        return null;
      }

      var record = pushed.getRecord();
      return record;
    }
    /*
      Push some data in the form of a json-api document into the store,
      without creating materialized records.
       @method _push
      @private
      @param {Object} jsonApiDoc
      @return {InternalModel|Array<InternalModel>} pushed InternalModel(s)
    */
    ;

    _proto._push = function _push(jsonApiDoc) {
      var _this7 = this;

      var internalModelOrModels = this._backburner.join(function () {
        var included = jsonApiDoc.included;
        var i, length;

        if (included) {
          for (i = 0, length = included.length; i < length; i++) {
            _this7._pushInternalModel(included[i]);
          }
        }

        if (Array.isArray(jsonApiDoc.data)) {
          length = jsonApiDoc.data.length;
          var internalModels = new Array(length);

          for (i = 0; i < length; i++) {
            internalModels[i] = _this7._pushInternalModel(jsonApiDoc.data[i]);
          }

          return internalModels;
        }

        if (jsonApiDoc.data === null) {
          return null;
        }
        return _this7._pushInternalModel(jsonApiDoc.data);
      }); // this typecast is necessary because `backburner.join` is mistyped to return void


      return internalModelOrModels;
    };

    _proto._pushInternalModel = function _pushInternalModel(data) {
      var modelName = data.type;


      var internalModel = this._load(data); //    this._setupRelationshipsForModel(internalModel, data);


      return internalModel;
    }
    /**
      Push some raw data into the store.
       This method can be used both to push in brand new
      records, as well as to update existing records. You
      can push in more than one type of object at once.
      All objects should be in the format expected by the
      serializer.
       ```app/serializers/application.js
      import RESTSerializer from '@ember-data/serializer/rest';
       export default RESTSerializer;
      ```
       ```js
      let pushData = {
        posts: [
          { id: 1, postTitle: "Great post", commentIds: [2] }
        ],
        comments: [
          { id: 2, commentBody: "Insightful comment" }
        ]
      }
       store.pushPayload(pushData);
      ```
       By default, the data will be deserialized using a default
      serializer (the application serializer if it exists).
       Alternatively, `pushPayload` will accept a model type which
      will determine which serializer will process the payload.
       ```app/serializers/application.js
      import RESTSerializer from '@ember-data/serializer/rest';
       export default RESTSerializer;
      ```
       ```app/serializers/post.js
      import JSONSerializer from '@ember-data/serializer/json';
       export default JSONSerializer;
      ```
       ```js
      store.pushPayload(pushData); // Will use the application serializer
      store.pushPayload('post', pushData); // Will use the post serializer
      ```
       @method pushPayload
      @param {String} modelName Optionally, a model type used to determine which serializer will be used
      @param {Object} inputPayload
    */
    ;

    _proto.pushPayload = function pushPayload(modelName, inputPayload) {

      var serializer;
      var payload;

      if (!inputPayload) {
        payload = modelName;
        serializer = this.serializerFor('application');
      } else {
        payload = inputPayload;
        var normalizedModelName = normalizeModelName(modelName);
        serializer = this.serializerFor(normalizedModelName);
      }

      serializer.pushPayload(this, payload);
    };

    _proto.reloadManyArray = function reloadManyArray(manyArray, internalModel, key, options) {
      return internalModel.reloadHasMany(key, options);
    };

    _proto.reloadBelongsTo = function reloadBelongsTo(belongsToProxy, internalModel, key, options) {
      return internalModel.reloadBelongsTo(key, options);
    };

    _proto._internalModelForResource = function _internalModelForResource(resource) {
      return internalModelFactoryFor(this).getByResource(resource);
    }
    /**
     * TODO Only needed temporarily for test support
     *
     * @internal
     */
    ;

    _proto._internalModelForId = function _internalModelForId(type, id, lid) {
      var resource = constructResource(type, id, lid);
      return internalModelFactoryFor(this).lookup(resource);
    };

    _proto.serializeRecord = function serializeRecord(record, options) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        var _identifier5 = recordIdentifierFor(record);

        var internalModel = internalModelFactoryFor(this).peek(_identifier5); // TODO we used to check if the record was destroyed here

        return internalModel.createSnapshot(options).serialize(options);
      } else {
        throw new Error('serializeRecord is only available when CUSTOM_MODEL_CLASS ff is on');
      }
    };

    _proto.saveRecord = function saveRecord(record, options) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        var _identifier6 = recordIdentifierFor(record);

        var internalModel = internalModelFactoryFor(this).peek(_identifier6); // TODO we used to check if the record was destroyed here
        // Casting can be removed once REQUEST_SERVICE ff is turned on
        // because a `Record` is provided there will always be a matching internalModel

        return internalModel.save(options).then(function () {
          return record;
        });
      } else {
        throw new Error('saveRecord is only available when CUSTOM_MODEL_CLASS ff is on');
      }
    };

    _proto.relationshipReferenceFor = function relationshipReferenceFor(identifier, key) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        var stableIdentifier = identifierCacheFor(this).getOrCreateRecordIdentifier(identifier);
        var internalModel = internalModelFactoryFor(this).peek(stableIdentifier); // TODO we used to check if the record was destroyed here

        return internalModel.referenceFor(null, key);
      } else {
        throw new Error('relationshipReferenceFor is only available when CUSTOM_MODEL_CLASS ff is on');
      }
    }
    /**
     * @internal
     */
    ;

    _proto._createRecordData = function _createRecordData(identifier) {
      return this.createRecordDataFor(identifier.type, identifier.id, identifier.lid, this._storeWrapper);
    }
    /**
     * Instantiation hook allowing applications or addons to configure the store
     * to utilize a custom RecordData implementation.
     *
     * @param modelName
     * @param id
     * @param clientId
     * @param storeWrapper
     */
    ;

    _proto.createRecordDataFor = function createRecordDataFor(modelName, id, clientId, storeWrapper) {
      if (canaryFeatures.IDENTIFIERS) {
        var _identifier7 = identifierCacheFor(this).getOrCreateRecordIdentifier({
          type: modelName,
          id: id,
          lid: clientId
        });

        return new RecordDataDefault(_identifier7, storeWrapper);
      } else {
        return new RecordDataDefault(modelName, id, clientId, storeWrapper);
      }
    }
    /**
     * @internal
     */
    ;

    _proto.__recordDataFor = function __recordDataFor(resource) {
      var identifier = identifierCacheFor(this).getOrCreateRecordIdentifier(resource);
      return this.recordDataFor(identifier, false);
    }
    /**
     * @internal
     */
    ;

    _proto.recordDataFor = function recordDataFor$1(identifier, isCreate) {
      var internalModel;

      if (isCreate === true) {
        internalModel = internalModelFactoryFor(this).build({
          type: identifier.type,
          id: null
        });
        internalModel.loadedData();
        internalModel.didCreateRecord();
      } else {
        internalModel = internalModelFactoryFor(this).lookup(identifier);
      }

      return recordDataFor(internalModel);
    }
    /**
      `normalize` converts a json payload into the normalized form that
      [push](Store/methods/push?anchor=push) expects.
       Example
       ```js
      socket.on('message', function(message) {
        let modelName = message.model;
        let data = message.data;
        store.push(store.normalize(modelName, data));
      });
      ```
       @method normalize
      @param {String} modelName The name of the model type for this payload
      @param {Object} payload
      @return {Object} The normalized payload
    */
    ;

    _proto.normalize = function normalize(modelName, payload) {
      var normalizedModelName = normalizeModelName(modelName);
      var serializer = this.serializerFor(normalizedModelName);
      var model = this.modelFor(normalizedModelName);
      return serializer.normalize(model, payload);
    };

    _proto.newClientId = function newClientId() {
      if (canaryFeatures.IDENTIFIERS) {
        throw new Error("Private API Removed");
      }

      return globalClientIdCounter++;
    } //Called by the state machine to notify the store that the record is ready to be interacted with
    ;

    _proto.recordWasLoaded = function recordWasLoaded(record) {

      this.recordArrayManager.recordWasLoaded(record);
    } // ...............
    // . DESTRUCTION .
    // ...............

    /**
     * TODO remove test usage
     *
     * @internal
     */
    ;

    _proto._internalModelsFor = function _internalModelsFor(modelName) {
      return internalModelFactoryFor(this).modelMapFor(modelName);
    } // ......................
    // . PER-TYPE ADAPTERS
    // ......................

    /**
      Returns an instance of the adapter for a given type. For
      example, `adapterFor('person')` will return an instance of
      `App.PersonAdapter`.
       If no `App.PersonAdapter` is found, this method will look
      for an `App.ApplicationAdapter` (the default adapter for
      your entire application).
       If no `App.ApplicationAdapter` is found, it will return
      the value of the `defaultAdapter`.
       @method adapterFor
      @public
      @param {String} modelName
      @return Adapter
    */
    ;

    _proto.adapterFor = function adapterFor(modelName) {
      var normalizedModelName = normalizeModelName(modelName);
      var _adapterCache = this._adapterCache;
      var adapter = _adapterCache[normalizedModelName];

      if (adapter) {
        return adapter;
      }

      var owner = Ember.getOwner(this);
      adapter = owner.lookup("adapter:" + normalizedModelName); // in production this is handled by the re-export

      if (adapter !== undefined) {
        Ember.set(adapter, 'store', this);
        _adapterCache[normalizedModelName] = adapter;
        return adapter;
      } // no adapter found for the specific model, fallback and check for application adapter


      adapter = _adapterCache.application || owner.lookup('adapter:application');

      if (adapter !== undefined) {
        Ember.set(adapter, 'store', this);
        _adapterCache[normalizedModelName] = adapter;
        _adapterCache.application = adapter;
        return adapter;
      } // no model specific adapter or application adapter, check for an `adapter`
      // property defined on the store


      var adapterName = this.adapter || '-json-api';
      adapter = adapterName ? _adapterCache[adapterName] || owner.lookup("adapter:" + adapterName) : undefined; // in production this is handled by the re-export

      if (adapter !== undefined) {
        Ember.set(adapter, 'store', this);
        _adapterCache[normalizedModelName] = adapter;
        _adapterCache[adapterName] = adapter;
        return adapter;
      } // final fallback, no model specific adapter, no application adapter, no
      // `adapter` property on store: use json-api adapter


      adapter = _adapterCache['-json-api'] || owner.lookup('adapter:-json-api');
      Ember.set(adapter, 'store', this);
      _adapterCache[normalizedModelName] = adapter;
      _adapterCache['-json-api'] = adapter;
      return adapter;
    } // ..............................
    // . RECORD CHANGE NOTIFICATION .
    // ..............................

    /**
      Returns an instance of the serializer for a given type. For
      example, `serializerFor('person')` will return an instance of
      `App.PersonSerializer`.
       If no `App.PersonSerializer` is found, this method will look
      for an `App.ApplicationSerializer` (the default serializer for
      your entire application).
       if no `App.ApplicationSerializer` is found, it will attempt
      to get the `defaultSerializer` from the `PersonAdapter`
      (`adapterFor('person')`).
       If a serializer cannot be found on the adapter, it will fall back
      to an instance of `JSONSerializer`.
       @method serializerFor
      @public
      @param {String} modelName the record to serialize
      @return {Serializer}
    */
    ;

    _proto.serializerFor = function serializerFor(modelName) {
      var normalizedModelName = normalizeModelName(modelName);
      var _serializerCache = this._serializerCache;
      var serializer = _serializerCache[normalizedModelName];

      if (serializer) {
        return serializer;
      }

      var owner = Ember.getOwner(this);
      serializer = owner.lookup("serializer:" + normalizedModelName); // in production this is handled by the re-export

      if (serializer !== undefined) {
        Ember.set(serializer, 'store', this);
        _serializerCache[normalizedModelName] = serializer;
        return serializer;
      } // no serializer found for the specific model, fallback and check for application serializer


      serializer = _serializerCache.application || owner.lookup('serializer:application');

      if (serializer !== undefined) {
        Ember.set(serializer, 'store', this);
        _serializerCache[normalizedModelName] = serializer;
        _serializerCache.application = serializer;
        return serializer;
      } // no model specific serializer or application serializer, check for the `defaultSerializer`
      // property defined on the adapter


      var adapter = this.adapterFor(modelName);
      var serializerName = Ember.get(adapter, 'defaultSerializer');
      serializer = serializerName ? _serializerCache[serializerName] || owner.lookup("serializer:" + serializerName) : undefined; // in production this is handled by the re-export

      if (serializer !== undefined) {
        Ember.set(serializer, 'store', this);
        _serializerCache[normalizedModelName] = serializer;
        _serializerCache[serializerName] = serializer;
        return serializer;
      } // final fallback, no model specific serializer, no application serializer, no
      // `serializer` property on store: use the convenience JSONSerializer


      serializer = _serializerCache['-default'] || owner.lookup('serializer:-default');
      Ember.set(serializer, 'store', this);
      _serializerCache[normalizedModelName] = serializer;
      _serializerCache['-default'] = serializer;
      return serializer;
    };

    _proto.willDestroy = function willDestroy() {
      _EmberService.prototype.willDestroy.call(this);

      this.recordArrayManager.destroy(); // Check if we need to null this out
      // this._adapterCache = null;
      // this._serializerCache = null;

      identifierCacheFor(this).destroy();
      this.unloadAll();
    };

    _proto._updateRelationshipState = function _updateRelationshipState(relationship) {
      var _this8 = this;

      if (this._updatedRelationships.push(relationship) !== 1) {
        return;
      }

      this._backburner.join(function () {
        _this8._backburner.schedule('syncRelationships', _this8, _this8._flushUpdatedRelationships);
      });
    };

    _proto._flushUpdatedRelationships = function _flushUpdatedRelationships() {
      var updated = this._updatedRelationships;

      for (var i = 0, l = updated.length; i < l; i++) {
        updated[i].flushCanonical();
      }

      updated.length = 0;
    };

    _proto._updateInternalModel = function _updateInternalModel(internalModel) {
      if (this._updatedInternalModels.push(internalModel) !== 1) {
        return;
      }

      emberRun$2.schedule('actions', this, this._flushUpdatedInternalModels);
    };

    _proto._flushUpdatedInternalModels = function _flushUpdatedInternalModels() {
      var updated = this._updatedInternalModels;

      for (var i = 0, l = updated.length; i < l; i++) {
        updated[i]._triggerDeferredTriggers();
      }

      updated.length = 0;
    };

    _createClass$c(CoreStore, [{
      key: "identifierCache",
      get: function get() {
        if (!canaryFeatures.IDENTIFIERS) {
          throw new Error("Store.identifierCache is unavailable in this build of EmberData");
        }

        return identifierCacheFor(this);
      }
    }]);

    return CoreStore;
  }(Ember.Service);

  Ember.defineProperty(CoreStore.prototype, 'defaultAdapter', Ember.computed('adapter', function () {
    var adapter = this.adapter || '-json-api';
    return this.adapterFor(adapter);
  }));

  function _commit(adapter, store, operation, snapshot) {
    var internalModel = snapshot._internalModel;
    var modelName = snapshot.modelName;
    var modelClass = store.modelFor(modelName);
    var promise = Ember.RSVP.Promise.resolve().then(function () {
      return adapter[operation](store, modelClass, snapshot);
    });
    var serializer = store.serializerFor(modelName);
    var label = "DS: Extract and notify about " + operation + " completion of " + internalModel;
    promise = guardDestroyedStore(promise, store, label);
    promise = _guard(promise, _bind(_objectIsAlive, internalModel));
    return promise.then(function (adapterPayload) {
      /*
      Note to future spelunkers hoping to optimize.
      We rely on this `run` to create a run loop if needed
      that `store._push` and `store.didSaveRecord` will both share.
       We use `join` because it is often the case that we
      have an outer run loop available still from the first
      call to `store._push`;
      */
      store._backburner.join(function () {
        var payload, data, sideloaded;

        if (adapterPayload) {
          payload = normalizeResponseHelper(serializer, store, modelClass, adapterPayload, snapshot.id, operation);

          if (payload.included) {
            sideloaded = payload.included;
          }

          data = payload.data;
        }

        store.didSaveRecord(internalModel, {
          data: data
        }, operation); // seems risky, but if the tests pass might be fine?

        if (sideloaded) {
          store._push({
            data: null,
            included: sideloaded
          });
        }
      });

      return internalModel;
    }, function (error$1) {
      if (error$1 instanceof error.InvalidError) {
        var parsedErrors;

        if (typeof serializer.extractErrors === 'function') {
          parsedErrors = serializer.extractErrors(store, modelClass, error$1, snapshot.id);
        } else {
          parsedErrors = errorsArrayToHash(error$1.errors);
        }

        store.recordWasInvalid(internalModel, parsedErrors, error$1);
      } else {
        store.recordWasError(internalModel, error$1);
      }

      throw error$1;
    }, label);
  }

  var DSModelSchemaDefinitionService =
  /*#__PURE__*/
  function () {
    function DSModelSchemaDefinitionService(store) {
      this.store = store;
      this._modelFactoryCache = Object.create(null);
      this._relationshipsDefCache = Object.create(null);
      this._attributesDefCache = Object.create(null);
    } // Following the existing RD implementation


    var _proto = DSModelSchemaDefinitionService.prototype;

    _proto.attributesDefinitionFor = function attributesDefinitionFor(identifier) {
      var modelName, attributes;

      if (typeof identifier === 'string') {
        modelName = identifier;
      } else {
        modelName = identifier.type;
      }

      attributes = this._attributesDefCache[modelName];

      if (attributes === undefined) {
        var modelClass = this.store.modelFor(modelName);
        var attributeMap = Ember.get(modelClass, 'attributes');
        attributes = Object.create(null);
        attributeMap.forEach(function (meta, name) {
          return attributes[name] = meta;
        });
        this._attributesDefCache[modelName] = attributes;
      }

      return attributes;
    } // Following the existing RD implementation
    ;

    _proto.relationshipsDefinitionFor = function relationshipsDefinitionFor(identifier) {
      var modelName, relationships;

      if (typeof identifier === 'string') {
        modelName = identifier;
      } else {
        modelName = identifier.type;
      }

      relationships = this._relationshipsDefCache[modelName];

      if (relationships === undefined) {
        var modelClass = this.store.modelFor(modelName);
        relationships = Ember.get(modelClass, 'relationshipsObject') || null;
        this._relationshipsDefCache[modelName] = relationships;
      }

      return relationships;
    };

    _proto.doesTypeExist = function doesTypeExist(modelName) {
      var normalizedModelName = normalizeModelName(modelName);
      var factory = getModelFactory(this.store, this.store._modelFactoryCache, normalizedModelName);
      return factory !== null;
    };

    return DSModelSchemaDefinitionService;
  }();
  /**
   *
   * @param store
   * @param cache modelFactoryCache
   * @param normalizedModelName already normalized modelName
   * @return {*}
   */

  function getModelFactory(store, cache, normalizedModelName) {
    var factory = cache[normalizedModelName];

    if (!factory) {
      factory = _lookupModelFactory(store, normalizedModelName);

      if (!factory) {
        //Support looking up mixins as base types for polymorphic relationships
        factory = _modelForMixin(store, normalizedModelName);
      }

      if (!factory) {
        // we don't cache misses in case someone wants to register a missing model
        return null;
      }

      var klass = factory.class; // assert(`'${inspect(klass)}' does not appear to be an ember-data model`, klass.isModel);
      // TODO: deprecate this

      if (klass.isModel) {
        var hasOwnModelNameSet = klass.modelName && Object.prototype.hasOwnProperty.call(klass, 'modelName');

        if (!hasOwnModelNameSet) {
          klass.modelName = normalizedModelName;
        }
      }

      cache[normalizedModelName] = factory;
    }

    return factory;
  }
  function _lookupModelFactory(store, normalizedModelName) {
    var owner = Ember.getOwner(store);
    return owner.factoryFor("model:" + normalizedModelName);
  }
  /*
      In case someone defined a relationship to a mixin, for example:
      ```
        let Comment = Model.extend({
          owner: belongsTo('commentable'. { polymorphic: true })
        });
        let Commentable = Ember.Mixin.create({
          comments: hasMany('comment')
        });
      ```
      we want to look up a Commentable class which has all the necessary
      relationship metadata. Thus, we look up the mixin and create a mock
      Model, so we can access the relationship CPs of the mixin (`comments`)
      in this case
    */

  function _modelForMixin(store, normalizedModelName) {
    var owner = Ember.getOwner(store);
    var MaybeMixin = owner.factoryFor("mixin:" + normalizedModelName);
    var mixin = MaybeMixin && MaybeMixin.class;

    if (mixin) {
      var ModelForMixin = Model.extend(mixin);
      ModelForMixin.reopenClass({
        __isMixin: true,
        __mixin: mixin
      }); //Cache the class as a model

      owner.register('model:' + normalizedModelName, ModelForMixin);
    }

    return _lookupModelFactory(store, normalizedModelName);
  }

  function notifyChanges(identifier, value, record, store) {
    if (value === 'attributes') {
      record.eachAttribute(function (key) {
        var currentValue = Ember.cacheFor(record, key);

        var internalModel = store._internalModelForResource(identifier);

        if (currentValue !== internalModel._recordData.getAttr(key)) {
          record.notifyPropertyChange(key);
        }
      });
    } else if (value === 'relationships') {
      record.eachRelationship(function (key, meta) {
        var internalModel = store._internalModelForResource(identifier);

        if (meta.kind === 'belongsTo') {
          record.notifyPropertyChange(key);
        } else if (meta.kind === 'hasMany') {
          if (meta.options.async) {
            record.notifyPropertyChange(key);
            internalModel.hasManyRemovalCheck(key);
          }

          if (internalModel._manyArrayCache[key]) {
            internalModel._manyArrayCache[key].retrieveLatest();
          }
        }
      });
    } else if (value === 'errors') {
      var internalModel = store._internalModelForResource(identifier); //TODO guard


      var errors = internalModel._recordData.getErrors(identifier);

      record.invalidErrorsChanged(errors);
    } else if (value === 'state') {
      record.notifyPropertyChange('isNew');
      record.notifyPropertyChange('isDeleted');
    } else if (value === 'identity') {
      record.notifyPropertyChange('id');
    }
  }

  function _inheritsLoose$7(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
  /**
    The store service contains all of the data for records loaded from the server.
    It is also responsible for creating instances of `Model` that wrap
    the individual data for a record, so that they can be bound to in your
    Handlebars templates.

    By default, applications will have a single `Store` service that is
    automatically created.

    The store can be customized by extending the service in the following manner:

    ```app/services/store.js
    import Store from '@ember-data/store';

    export default class MyStore extends Store {}
    ```

    You can retrieve models from the store in several ways. To retrieve a record
    for a specific id, use the `Store`'s `findRecord()` method:

    ```javascript
    store.findRecord('person', 123).then(function (person) {
    });
    ```

    By default, the store will talk to your backend using a standard
    REST mechanism. You can customize how the store talks to your
    backend by specifying a custom adapter:

    ```app/adapters/application.js
    import DS from 'ember-data';

    export default Adapter.extend({
    });
    ```

    You can learn more about writing a custom adapter by reading the `Adapter`
    documentation.

    ### Store createRecord() vs. push() vs. pushPayload()

    The store provides multiple ways to create new record objects. They have
    some subtle differences in their use which are detailed below:

    [createRecord](Store/methods/createRecord?anchor=createRecord) is used for creating new
    records on the client side. This will return a new record in the
    `created.uncommitted` state. In order to persist this record to the
    backend, you will need to call `record.save()`.

    [push](Store/methods/push?anchor=push) is used to notify Ember Data's store of new or
    updated records that exist in the backend. This will return a record
    in the `loaded.saved` state. The primary use-case for `store#push` is
    to notify Ember Data about record updates (full or partial) that happen
    outside of the normal adapter methods (for example
    [SSE](http://dev.w3.org/html5/eventsource/) or [Web
    Sockets](http://www.w3.org/TR/2009/WD-websockets-20091222/)).

    [pushPayload](Store/methods/pushPayload?anchor=pushPayload) is a convenience wrapper for
    `store#push` that will deserialize payloads if the
    Serializer implements a `pushPayload` method.

    Note: When creating a new record using any of the above methods
    Ember Data will update `RecordArray`s such as those returned by
    `store#peekAll()` or `store#findAll()`. This means any
    data bindings or computed properties that depend on the RecordArray
    will automatically be synced to include the new or updated record
    values.

    @class Store
    @main @ember-data/store
    @extends Ember.Service
  */

  var Store =
  /*#__PURE__*/
  function (_CoreStore) {
    _inheritsLoose$7(Store, _CoreStore);

    function Store() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _CoreStore.call.apply(_CoreStore, [this].concat(args)) || this;
      _this._modelFactoryCache = Object.create(null);
      _this._relationshipsDefCache = Object.create(null);
      _this._attributesDefCache = Object.create(null);
      return _this;
    }

    var _proto = Store.prototype;

    _proto.instantiateRecord = function instantiateRecord(identifier, createRecordArgs, recordDataFor, notificationManager) {
      var _this2 = this;

      var modelName = identifier.type;

      var internalModel = this._internalModelForResource(identifier);

      var createOptions = {
        store: this,
        _internalModel: internalModel,
        currentState: internalModel.currentState,
        container: null
      };
      Ember.assign(createOptions, createRecordArgs); // ensure that `getOwner(this)` works inside a model instance

      Ember.setOwner(createOptions, Ember.getOwner(this));
      delete createOptions.container;

      var record = this._modelFactoryFor(modelName).create(createOptions); //todo optimize


      notificationManager.subscribe(identifier, function (identifier, value) {
        return notifyChanges(identifier, value, record, _this2);
      });
      return record;
    };

    _proto.teardownRecord = function teardownRecord(record) {
      record.destroy();
    }
    /**
    Returns the model class for the particular `modelName`.
     The class of a model might be useful if you want to get a list of all the
    relationship names of the model, see
    [`relationshipNames`](/ember-data/release/classes/Model?anchor=relationshipNames)
    for example.
     @method modelFor
    @param {String} modelName
    @return {Model}
      */
    ;

    _proto.modelFor = function modelFor(modelName) {

      var maybeFactory = this._modelFactoryFor(modelName); // for factorFor factory/class split


      var klass = maybeFactory.class ? maybeFactory.class : maybeFactory;

      if (!klass.isModel) {
        return new ShimModelClass(this, modelName);
      } else {
        return klass;
      }
    };

    _proto._modelFactoryFor = function _modelFactoryFor(modelName) {
      var normalizedModelName = normalizeModelName(modelName);
      var factory = getModelFactory(this, this._modelFactoryCache, normalizedModelName);

      if (factory === null) {
        throw new Ember.Error("No model was found for '" + normalizedModelName + "'");
      }

      return factory;
    }
    /*
    Returns whether a ModelClass exists for a given modelName
    This exists for legacy support for the RESTSerializer,
    which due to how it must guess whether a key is a model
    must query for whether a match exists.
     We should investigate an RFC to make this public or removing
    this requirement.
     @private
    */
    ;

    _proto._hasModelFor = function _hasModelFor(modelName) {

      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        return this.getSchemaDefinitionService().doesTypeExist(modelName);
      } else {
        var normalizedModelName = normalizeModelName(modelName);
        var factory = getModelFactory(this, this._modelFactoryCache, normalizedModelName);
        return factory !== null;
      }
    };

    _proto._relationshipMetaFor = function _relationshipMetaFor(modelName, id, key) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        return this._relationshipsDefinitionFor(modelName)[key];
      } else {
        var modelClass = this.modelFor(modelName);
        var relationshipsByName = Ember.get(modelClass, 'relationshipsByName');
        return relationshipsByName.get(key);
      }
    };

    _proto._attributesDefinitionFor = function _attributesDefinitionFor(modelName, identifier) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (identifier) {
          return this.getSchemaDefinitionService().attributesDefinitionFor(identifier);
        } else {
          return this.getSchemaDefinitionService().attributesDefinitionFor(modelName);
        }
      } else {
        var attributes = this._attributesDefCache[modelName];

        if (attributes === undefined) {
          var modelClass = this.modelFor(modelName);
          var attributeMap = Ember.get(modelClass, 'attributes');
          attributes = Object.create(null);
          attributeMap.forEach(function (meta, name) {
            return attributes[name] = meta;
          });
          this._attributesDefCache[modelName] = attributes;
        }

        return attributes;
      }
    };

    _proto._relationshipsDefinitionFor = function _relationshipsDefinitionFor(modelName, identifier) {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (identifier) {
          return this.getSchemaDefinitionService().relationshipsDefinitionFor(identifier);
        } else {
          return this.getSchemaDefinitionService().relationshipsDefinitionFor(modelName);
        }
      } else {
        var relationships = this._relationshipsDefCache[modelName];

        if (relationships === undefined) {
          var modelClass = this.modelFor(modelName);
          relationships = Ember.get(modelClass, 'relationshipsObject') || null;
          this._relationshipsDefCache[modelName] = relationships;
        }

        return relationships;
      }
    };

    _proto.getSchemaDefinitionService = function getSchemaDefinitionService() {
      if (canaryFeatures.CUSTOM_MODEL_CLASS) {
        if (!this._schemaDefinitionService) {
          this._schemaDefinitionService = new DSModelSchemaDefinitionService(this);
        }

        return this._schemaDefinitionService;
      } else {
        throw 'schema service is only available when custom model class feature flag is on';
      }
    };

    return Store;
  }(CoreStore);

  exports.AdapterPopulatedRecordArray = AdapterPopulatedRecordArray;
  exports.Errors = Errors;
  exports.InternalModel = InternalModel;
  exports.ManyArray = ManyArray;
  exports.Model = Model;
  exports.OrderedSet = EmberDataOrderedSet;
  exports.PromiseArray = PromiseArray;
  exports.PromiseManyArray = PromiseManyArray;
  exports.PromiseObject = PromiseObject;
  exports.RecordArray = RecordArray;
  exports.RecordArrayManager = RecordArrayManager;
  exports.RecordData = RecordDataDefault;
  exports.Relationship = Relationship;
  exports.RootState = RootState$1;
  exports.Snapshot = Snapshot;
  exports.SnapshotRecordArray = SnapshotRecordArray;
  exports.Store = Store;
  exports._bind = _bind;
  exports._guard = _guard;
  exports._objectIsAlive = _objectIsAlive;
  exports.coerceId = coerceId;
  exports.diffArray = diffArray;
  exports.errorsArrayToHash = errorsArrayToHash;
  exports.errorsHashToArray = errorsHashToArray;
  exports.guardDestroyedStore = guardDestroyedStore;
  exports.identifierCacheFor = identifierCacheFor;
  exports.normalizeModelName = normalizeModelName;
  exports.recordDataFor = recordDataFor;
  exports.recordIdentifierFor = recordIdentifierFor;
  exports.relationshipStateFor = relationshipStateFor;
  exports.relationshipsFor = relationshipsFor;
  exports.setIdentifierForgetMethod = setIdentifierForgetMethod;
  exports.setIdentifierGenerationMethod = setIdentifierGenerationMethod;
  exports.setIdentifierResetMethod = setIdentifierResetMethod;
  exports.setIdentifierUpdateMethod = setIdentifierUpdateMethod;

  Object.defineProperty(exports, '__esModule', { value: true });

});
