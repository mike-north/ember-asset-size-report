define('@ember-data/serializer/-private', ['exports'], function (exports) { 'use strict';

  /**
    @module @ember-data/serializer
  */

  /**
    ## Using Embedded Records

    `EmbeddedRecordsMixin` supports serializing embedded records.

    To set up embedded records, include the mixin when extending a serializer,
    then define and configure embedded (model) relationships.

    Note that embedded records will serialize with the serializer for their model instead of the serializer in which they are defined.

    Below is an example of a per-type serializer (`post` type).

    ```app/serializers/post.js
    import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

    export default RESTSerializer.extend(EmbeddedRecordsMixin, {
      attrs: {
        author: { embedded: 'always' },
        comments: { serialize: 'ids' }
      }
    });
    ```
    Note that this use of `{ embedded: 'always' }` is unrelated to
    the `{ embedded: 'always' }` that is defined as an option on `attr` as part of
    defining a model while working with the `ActiveModelSerializer`.  Nevertheless,
    using `{ embedded: 'always' }` as an option to `attr` is not a valid way to set up
    embedded records.

    The `attrs` option for a resource `{ embedded: 'always' }` is shorthand for:

    ```js
    {
      serialize: 'records',
      deserialize: 'records'
    }
    ```

    ### Configuring Attrs

    A resource's `attrs` option may be set to use `ids`, `records` or false for the
    `serialize`  and `deserialize` settings.

    The `attrs` property can be set on the `ApplicationSerializer` or a per-type
    serializer.

    In the case where embedded JSON is expected while extracting a payload (reading)
    the setting is `deserialize: 'records'`, there is no need to use `ids` when
    extracting as that is the default behaviour without this mixin if you are using
    the vanilla `EmbeddedRecordsMixin`. Likewise, to embed JSON in the payload while
    serializing `serialize: 'records'` is the setting to use. There is an option of
    not embedding JSON in the serialized payload by using `serialize: 'ids'`. If you
    do not want the relationship sent at all, you can use `serialize: false`.


    ### EmbeddedRecordsMixin defaults
    If you do not overwrite `attrs` for a specific relationship, the `EmbeddedRecordsMixin`
    will behave in the following way:

    BelongsTo: `{ serialize: 'id', deserialize: 'id' }`
    HasMany:   `{ serialize: false, deserialize: 'ids' }`

    ### Model Relationships

    Embedded records must have a model defined to be extracted and serialized. Note that
    when defining any relationships on your model such as `belongsTo` and `hasMany`, you
    should not both specify `async: true` and also indicate through the serializer's
    `attrs` attribute that the related model should be embedded for deserialization.
    If a model is declared embedded for deserialization (`embedded: 'always'` or `deserialize: 'records'`),
    then do not use `async: true`.

    To successfully extract and serialize embedded records the model relationships
    must be set up correctly. See the
    [defining relationships](https://guides.emberjs.com/current/models/relationships)
    section of the **Defining Models** guide page.

    Records without an `id` property are not considered embedded records, model
    instances must have an `id` property to be used with Ember Data.

    ### Example JSON payloads, Models and Serializers

    **When customizing a serializer it is important to grok what the customizations
    are. Please read the docs for the methods this mixin provides, in case you need
    to modify it to fit your specific needs.**

    For example, review the docs for each method of this mixin:
    * [normalize](/ember-data/release/classes/EmbeddedRecordsMixin/methods/normalize?anchor=normalize)
    * [serializeBelongsTo](/ember-data/release/classes/EmbeddedRecordsMixin/methods/serializeBelongsTo?anchor=serializeBelongsTo)
    * [serializeHasMany](/ember-data/release/classes/EmbeddedRecordsMixin/methods/serializeHasMany?anchor=serializeHasMany)

    @class EmbeddedRecordsMixin
  */
  var embeddedRecordsMixin = Ember.Mixin.create({
    /**
      Normalize the record and recursively normalize/extract all the embedded records
      while pushing them into the store as they are encountered
       A payload with an attr configured for embedded records needs to be extracted:
       ```js
      {
        "post": {
          "id": "1"
          "title": "Rails is omakase",
          "comments": [{
            "id": "1",
            "body": "Rails is unagi"
          }, {
            "id": "2",
            "body": "Omakase O_o"
          }]
        }
      }
      ```
     @method normalize
     @param {Model} typeClass
     @param {Object} hash to be normalized
     @param {String} prop the hash has been referenced by
     @return {Object} the normalized hash
    **/
    normalize: function normalize(typeClass, hash, prop) {
      var normalizedHash = this._super(typeClass, hash, prop);

      return this._extractEmbeddedRecords(this, this.store, typeClass, normalizedHash);
    },
    keyForRelationship: function keyForRelationship(key, typeClass, method) {
      if (method === 'serialize' && this.hasSerializeRecordsOption(key) || method === 'deserialize' && this.hasDeserializeRecordsOption(key)) {
        return this.keyForAttribute(key, method);
      } else {
        return this._super(key, typeClass, method) || key;
      }
    },

    /**
      Serialize `belongsTo` relationship when it is configured as an embedded object.
       This example of an author model belongs to a post model:
       ```js
      import Model, { attr, belongsTo } from '@ember-data/model';
       Post = Model.extend({
        title:    attr('string'),
        body:     attr('string'),
        author:   belongsTo('author')
      });
       Author = Model.extend({
        name:     attr('string'),
        post:     belongsTo('post')
      });
      ```
       Use a custom (type) serializer for the post model to configure embedded author
       ```app/serializers/post.js
      import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
       export default RESTSerializer.extend(EmbeddedRecordsMixin, {
        attrs: {
          author: { embedded: 'always' }
        }
      })
      ```
       A payload with an attribute configured for embedded records can serialize
      the records together under the root attribute's payload:
       ```js
      {
        "post": {
          "id": "1"
          "title": "Rails is omakase",
          "author": {
            "id": "2"
            "name": "dhh"
          }
        }
      }
      ```
       @method serializeBelongsTo
      @param {Snapshot} snapshot
      @param {Object} json
      @param {Object} relationship
    */
    serializeBelongsTo: function serializeBelongsTo(snapshot, json, relationship) {
      var attr = relationship.key;

      if (this.noSerializeOptionSpecified(attr)) {
        this._super(snapshot, json, relationship);

        return;
      }

      var includeIds = this.hasSerializeIdsOption(attr);
      var includeRecords = this.hasSerializeRecordsOption(attr);
      var embeddedSnapshot = snapshot.belongsTo(attr);

      if (includeIds) {
        var serializedKey = this._getMappedKey(relationship.key, snapshot.type);

        if (serializedKey === relationship.key && this.keyForRelationship) {
          serializedKey = this.keyForRelationship(relationship.key, relationship.kind, 'serialize');
        }

        if (!embeddedSnapshot) {
          json[serializedKey] = null;
        } else {
          json[serializedKey] = embeddedSnapshot.id;

          if (relationship.options.polymorphic) {
            this.serializePolymorphicType(snapshot, json, relationship);
          }
        }
      } else if (includeRecords) {
        this._serializeEmbeddedBelongsTo(snapshot, json, relationship);
      }
    },
    _serializeEmbeddedBelongsTo: function _serializeEmbeddedBelongsTo(snapshot, json, relationship) {
      var embeddedSnapshot = snapshot.belongsTo(relationship.key);

      var serializedKey = this._getMappedKey(relationship.key, snapshot.type);

      if (serializedKey === relationship.key && this.keyForRelationship) {
        serializedKey = this.keyForRelationship(relationship.key, relationship.kind, 'serialize');
      }

      if (!embeddedSnapshot) {
        json[serializedKey] = null;
      } else {
        json[serializedKey] = embeddedSnapshot.serialize({
          includeId: true
        });
        this.removeEmbeddedForeignKey(snapshot, embeddedSnapshot, relationship, json[serializedKey]);

        if (relationship.options.polymorphic) {
          this.serializePolymorphicType(snapshot, json, relationship);
        }
      }
    },

    /**
      Serializes `hasMany` relationships when it is configured as embedded objects.
       This example of a post model has many comments:
       ```js
      import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
       Post = Model.extend({
        title:    attr('string'),
        body:     attr('string'),
        comments: hasMany('comment')
      });
       Comment = Model.extend({
        body:     attr('string'),
        post:     belongsTo('post')
      });
      ```
       Use a custom (type) serializer for the post model to configure embedded comments
       ```app/serializers/post.js
      import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
       export default RESTSerializer.extend(EmbeddedRecordsMixin, {
        attrs: {
          comments: { embedded: 'always' }
        }
      })
      ```
       A payload with an attribute configured for embedded records can serialize
      the records together under the root attribute's payload:
       ```js
      {
        "post": {
          "id": "1"
          "title": "Rails is omakase",
          "body": "I want this for my ORM, I want that for my template language..."
          "comments": [{
            "id": "1",
            "body": "Rails is unagi"
          }, {
            "id": "2",
            "body": "Omakase O_o"
          }]
        }
      }
      ```
       The attrs options object can use more specific instruction for extracting and
      serializing. When serializing, an option to embed `ids`, `ids-and-types` or `records` can be set.
      When extracting the only option is `records`.
       So `{ embedded: 'always' }` is shorthand for:
      `{ serialize: 'records', deserialize: 'records' }`
       To embed the `ids` for a related object (using a hasMany relationship):
       ```app/serializers/post.js
      import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
       export default RESTSerializer.extend(EmbeddedRecordsMixin, {
        attrs: {
          comments: { serialize: 'ids', deserialize: 'records' }
        }
      })
      ```
       ```js
      {
        "post": {
          "id": "1"
          "title": "Rails is omakase",
          "body": "I want this for my ORM, I want that for my template language..."
          "comments": ["1", "2"]
        }
      }
      ```
       To embed the relationship as a collection of objects with `id` and `type` keys, set
      `ids-and-types` for the related object.
       This is particularly useful for polymorphic relationships where records don't share
      the same table and the `id` is not enough information.
       For example having a user that has many pets:
       ```js
      User = Model.extend({
        name: attr('string'),
        pets: hasMany('pet', { polymorphic: true })
      });
       Pet = Model.extend({
        name: attr('string'),
      });
       Cat = Pet.extend({
        // ...
      });
       Parrot = Pet.extend({
        // ...
      });
      ```
       ```app/serializers/user.js
      import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
       export default RESTSerializer.extend(EmbeddedRecordsMixin, {
        attrs: {
          pets: { serialize: 'ids-and-types', deserialize: 'records' }
        }
      });
      ```
       ```js
      {
        "user": {
          "id": "1"
          "name": "Bertin Osborne",
          "pets": [
            { "id": "1", "type": "Cat" },
            { "id": "1", "type": "Parrot"}
          ]
        }
      }
      ```
       @method serializeHasMany
      @param {Snapshot} snapshot
      @param {Object} json
      @param {Object} relationship
    */
    serializeHasMany: function serializeHasMany(snapshot, json, relationship) {
      var attr = relationship.key;

      if (this.noSerializeOptionSpecified(attr)) {
        this._super(snapshot, json, relationship);

        return;
      }

      if (this.hasSerializeIdsOption(attr)) {
        var serializedKey = this._getMappedKey(relationship.key, snapshot.type);

        if (serializedKey === relationship.key && this.keyForRelationship) {
          serializedKey = this.keyForRelationship(relationship.key, relationship.kind, 'serialize');
        }

        json[serializedKey] = snapshot.hasMany(attr, {
          ids: true
        });
      } else if (this.hasSerializeRecordsOption(attr)) {
        this._serializeEmbeddedHasMany(snapshot, json, relationship);
      } else {
        if (this.hasSerializeIdsAndTypesOption(attr)) {
          this._serializeHasManyAsIdsAndTypes(snapshot, json, relationship);
        }
      }
    },

    /*
      Serializes a hasMany relationship as an array of objects containing only `id` and `type`
      keys.
      This has its use case on polymorphic hasMany relationships where the server is not storing
      all records in the same table using STI, and therefore the `id` is not enough information
       TODO: Make the default in Ember-data 3.0??
    */
    _serializeHasManyAsIdsAndTypes: function _serializeHasManyAsIdsAndTypes(snapshot, json, relationship) {
      var serializedKey = this.keyForAttribute(relationship.key, 'serialize');
      var hasMany = snapshot.hasMany(relationship.key);
      json[serializedKey] = Ember.A(hasMany).map(function (recordSnapshot) {
        //
        // I'm sure I'm being utterly naive here. Propably id is a configurate property and
        // type too, and the modelName has to be normalized somehow.
        //
        return {
          id: recordSnapshot.id,
          type: recordSnapshot.modelName
        };
      });
    },
    _serializeEmbeddedHasMany: function _serializeEmbeddedHasMany(snapshot, json, relationship) {
      var serializedKey = this._getMappedKey(relationship.key, snapshot.type);

      if (serializedKey === relationship.key && this.keyForRelationship) {
        serializedKey = this.keyForRelationship(relationship.key, relationship.kind, 'serialize');
      }
      json[serializedKey] = this._generateSerializedHasMany(snapshot, relationship);
    },

    /*
      Returns an array of embedded records serialized to JSON
    */
    _generateSerializedHasMany: function _generateSerializedHasMany(snapshot, relationship) {
      var hasMany = snapshot.hasMany(relationship.key);
      var manyArray = Ember.A(hasMany);
      var ret = new Array(manyArray.length);

      for (var i = 0; i < manyArray.length; i++) {
        var embeddedSnapshot = manyArray[i];
        var embeddedJson = embeddedSnapshot.serialize({
          includeId: true
        });
        this.removeEmbeddedForeignKey(snapshot, embeddedSnapshot, relationship, embeddedJson);
        ret[i] = embeddedJson;
      }

      return ret;
    },

    /**
      When serializing an embedded record, modify the property (in the `JSON` payload)
      that refers to the parent record (foreign key for the relationship).
       Serializing a `belongsTo` relationship removes the property that refers to the
      parent record
       Serializing a `hasMany` relationship does not remove the property that refers to
      the parent record.
       @method removeEmbeddedForeignKey
      @param {Snapshot} snapshot
      @param {Snapshot} embeddedSnapshot
      @param {Object} relationship
      @param {Object} json
    */
    removeEmbeddedForeignKey: function removeEmbeddedForeignKey(snapshot, embeddedSnapshot, relationship, json) {
      if (relationship.kind === 'belongsTo') {
        var parentRecord = snapshot.type.inverseFor(relationship.key, this.store);

        if (parentRecord) {
          var name = parentRecord.name;
          var embeddedSerializer = this.store.serializerFor(embeddedSnapshot.modelName);
          var parentKey = embeddedSerializer.keyForRelationship(name, parentRecord.kind, 'deserialize');

          if (parentKey) {
            delete json[parentKey];
          }
        }
      }
      /*else if (relationship.kind === 'hasMany') {
      return;
      }*/

    },
    // checks config for attrs option to embedded (always) - serialize and deserialize
    hasEmbeddedAlwaysOption: function hasEmbeddedAlwaysOption(attr) {
      var option = this.attrsOption(attr);
      return option && option.embedded === 'always';
    },
    // checks config for attrs option to serialize ids
    hasSerializeRecordsOption: function hasSerializeRecordsOption(attr) {
      var alwaysEmbed = this.hasEmbeddedAlwaysOption(attr);
      var option = this.attrsOption(attr);
      return alwaysEmbed || option && option.serialize === 'records';
    },
    // checks config for attrs option to serialize records
    hasSerializeIdsOption: function hasSerializeIdsOption(attr) {
      var option = this.attrsOption(attr);
      return option && (option.serialize === 'ids' || option.serialize === 'id');
    },
    // checks config for attrs option to serialize records as objects containing id and types
    hasSerializeIdsAndTypesOption: function hasSerializeIdsAndTypesOption(attr) {
      var option = this.attrsOption(attr);
      return option && (option.serialize === 'ids-and-types' || option.serialize === 'id-and-type');
    },
    // checks config for attrs option to serialize records
    noSerializeOptionSpecified: function noSerializeOptionSpecified(attr) {
      var option = this.attrsOption(attr);
      return !(option && (option.serialize || option.embedded));
    },
    // checks config for attrs option to deserialize records
    // a defined option object for a resource is treated the same as
    // `deserialize: 'records'`
    hasDeserializeRecordsOption: function hasDeserializeRecordsOption(attr) {
      var alwaysEmbed = this.hasEmbeddedAlwaysOption(attr);
      var option = this.attrsOption(attr);
      return alwaysEmbed || option && option.deserialize === 'records';
    },
    attrsOption: function attrsOption(attr) {
      var attrs = this.get('attrs');
      return attrs && (attrs[Ember.String.camelize(attr)] || attrs[attr]);
    },

    /**
     @method _extractEmbeddedRecords
     @private
    */
    _extractEmbeddedRecords: function _extractEmbeddedRecords(serializer, store, typeClass, partial) {
      var _this = this;

      typeClass.eachRelationship(function (key, relationship) {
        if (serializer.hasDeserializeRecordsOption(key)) {
          if (relationship.kind === 'hasMany') {
            _this._extractEmbeddedHasMany(store, key, partial, relationship);
          }

          if (relationship.kind === 'belongsTo') {
            _this._extractEmbeddedBelongsTo(store, key, partial, relationship);
          }
        }
      });
      return partial;
    },

    /**
     @method _extractEmbeddedHasMany
     @private
    */
    _extractEmbeddedHasMany: function _extractEmbeddedHasMany(store, key, hash, relationshipMeta) {
      var relationshipHash = Ember.get(hash, "data.relationships." + key + ".data");

      if (!relationshipHash) {
        return;
      }

      var hasMany = new Array(relationshipHash.length);

      for (var i = 0; i < relationshipHash.length; i++) {
        var item = relationshipHash[i];

        var _this$_normalizeEmbed = this._normalizeEmbeddedRelationship(store, relationshipMeta, item),
            data = _this$_normalizeEmbed.data,
            included = _this$_normalizeEmbed.included;

        hash.included = hash.included || [];
        hash.included.push(data);

        if (included) {
          var _hash$included;

          (_hash$included = hash.included).push.apply(_hash$included, included);
        }

        hasMany[i] = {
          id: data.id,
          type: data.type
        };
      }

      var relationship = {
        data: hasMany
      };
      Ember.set(hash, "data.relationships." + key, relationship);
    },

    /**
     @method _extractEmbeddedBelongsTo
     @private
    */
    _extractEmbeddedBelongsTo: function _extractEmbeddedBelongsTo(store, key, hash, relationshipMeta) {
      var relationshipHash = Ember.get(hash, "data.relationships." + key + ".data");

      if (!relationshipHash) {
        return;
      }

      var _this$_normalizeEmbed2 = this._normalizeEmbeddedRelationship(store, relationshipMeta, relationshipHash),
          data = _this$_normalizeEmbed2.data,
          included = _this$_normalizeEmbed2.included;

      hash.included = hash.included || [];
      hash.included.push(data);

      if (included) {
        var _hash$included2;

        (_hash$included2 = hash.included).push.apply(_hash$included2, included);
      }

      var belongsTo = {
        id: data.id,
        type: data.type
      };
      var relationship = {
        data: belongsTo
      };
      Ember.set(hash, "data.relationships." + key, relationship);
    },

    /**
     @method _normalizeEmbeddedRelationship
     @private
    */
    _normalizeEmbeddedRelationship: function _normalizeEmbeddedRelationship(store, relationshipMeta, relationshipHash) {
      var modelName = relationshipMeta.type;

      if (relationshipMeta.options.polymorphic) {
        modelName = relationshipHash.type;
      }

      var modelClass = store.modelFor(modelName);
      var serializer = store.serializerFor(modelName);
      return serializer.normalize(modelClass, relationshipHash, null);
    },
    isEmbeddedRecordsMixin: true
  });

  /**
    @module @ember-data/serializer
  */

  /*
    Check if the passed model has a `type` attribute or a relationship named `type`.

    @method modelHasAttributeOrRelationshipNamedType
    @param modelClass
   */
  function modelHasAttributeOrRelationshipNamedType(modelClass) {
    return Ember.get(modelClass, 'attributes').has('type') || Ember.get(modelClass, 'relationshipsByName').has('type');
  }

  /**
    @module @ember-data/serializer
  */

  /**
    The `Transform` class is used to serialize and deserialize model
    attributes when they are saved or loaded from an
    adapter. Subclassing `Transform` is useful for creating custom
    attributes. All subclasses of `Transform` must implement a
    `serialize` and a `deserialize` method.

    Example

    ```app/transforms/temperature.js
    import Transform from '@ember-data/serializer/transform';

    // Converts centigrade in the JSON to fahrenheit in the app
    export default Transform.extend({
      deserialize(serialized, options) {
        return (serialized *  1.8) + 32;
      },

      serialize(deserialized, options) {
        return (deserialized - 32) / 1.8;
      }
    });
    ```

    Usage

    ```app/models/requirement.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      name: attr('string'),
      temperature: attr('temperature')
    });
    ```

    The options passed into the `attr` function when the attribute is
    declared on the model is also available in the transform.

    ```app/models/post.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      title: attr('string'),
      markdown: attr('markdown', {
        markdown: {
          gfm: false,
          sanitize: true
        }
      })
    });
    ```

    ```app/transforms/markdown.js
    import Transform from '@ember-data/serializer/transform';

    export default Transform.extend({
      serialize(deserialized, options) {
        return deserialized.raw;
      },

      deserialize(serialized, options) {
        var markdownOptions = options.markdown || {};

        return marked(serialized, markdownOptions);
      }
    });
    ```

    @class Transform
   */
  var Transform = Ember.Object.extend({
    /**
      When given a deserialized value from a record attribute this
      method must return the serialized value.
       Example
       ```javascript
      import { isEmpty } from '@ember/utils';
       serialize(deserialized, options) {
        return isEmpty(deserialized) ? null : Number(deserialized);
      }
      ```
       @method serialize
      @param deserialized The deserialized value
      @param options hash of options passed to `attr`
      @return The serialized value
    */
    serialize: null,

    /**
      When given a serialized value from a JSON object this method must
      return the deserialized value for the record attribute.
       Example
       ```javascript
      deserialize(serialized, options) {
        return empty(serialized) ? null : Number(serialized);
      }
      ```
       @method deserialize
      @param serialized The serialized value
      @param options hash of options passed to `attr`
      @return The deserialized value
    */
    deserialize: null
  });

  /**
    @module @ember-data/serializer
  */

  /**
    The `BooleanTransform` class is used to serialize and deserialize
    boolean attributes on Ember Data record objects. This transform is
    used when `boolean` is passed as the type parameter to the
    [attr](/ember-data/release/functions/@ember-data%2Fmodel/attr) function.

    Usage

    ```app/models/user.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      isAdmin: attr('boolean'),
      name: attr('string'),
      email: attr('string')
    });
    ```

    By default, the boolean transform only allows for values of `true` or
    `false`. You can opt into allowing `null` values for
    boolean attributes via `attr('boolean', { allowNull: true })`

    ```app/models/user.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      email: attr('string'),
      username: attr('string'),
      wantsWeeklyEmail: attr('boolean', { allowNull: true })
    });
    ```

    @class BooleanTransform
    @extends Transform
   */

  var boolean = Transform.extend({
    deserialize: function deserialize(serialized, options) {
      if (Ember.isNone(serialized) && options.allowNull === true) {
        return null;
      }

      var type = typeof serialized;

      if (type === 'boolean') {
        return serialized;
      } else if (type === 'string') {
        return /^(true|t|1)$/i.test(serialized);
      } else if (type === 'number') {
        return serialized === 1;
      } else {
        return false;
      }
    },
    serialize: function serialize(deserialized, options) {
      if (Ember.isNone(deserialized) && options.allowNull === true) {
        return null;
      }

      return Boolean(deserialized);
    }
  });

  /**
    @module @ember-data/serializer
  */

  /**
   The `DateTransform` class is used to serialize and deserialize
   date attributes on Ember Data record objects. This transform is used
   when `date` is passed as the type parameter to the
   [attr](/ember-data/release/functions/@ember-data%2Fmodel/attr) function. It uses the [`ISO 8601`](https://en.wikipedia.org/wiki/ISO_8601)
   standard.

   ```app/models/score.js
   import Model, { attr, belongsTo } from '@ember-data/model';

   export default Model.extend({
      value: attr('number'),
      player: belongsTo('player'),
      date: attr('date')
    });
   ```

   @class DateTransform
   @extends Transform
   */

  var date = Transform.extend({
    deserialize: function deserialize(serialized) {
      var type = typeof serialized;

      if (type === 'string') {
        var offset = serialized.indexOf('+');

        if (offset !== -1 && serialized.length - 5 === offset) {
          offset += 3;
          return new Date(serialized.slice(0, offset) + ':' + serialized.slice(offset));
        }

        return new Date(serialized);
      } else if (type === 'number') {
        return new Date(serialized);
      } else if (serialized === null || serialized === undefined) {
        // if the value is null return null
        // if the value is not present in the data return undefined
        return serialized;
      } else {
        return null;
      }
    },
    serialize: function serialize(date) {
      if (date instanceof Date && !isNaN(date)) {
        return date.toISOString();
      } else {
        return null;
      }
    }
  });

  /**
    @module @ember-data/serializer
  */

  function isNumber(value) {
    return value === value && value !== Infinity && value !== -Infinity;
  }
  /**
    The `NumberTransform` class is used to serialize and deserialize
    numeric attributes on Ember Data record objects. This transform is
    used when `number` is passed as the type parameter to the
    [attr](/ember-data/release/functions/@ember-data%2Fmodel/attr) function.

    Usage

    ```app/models/score.js
    import Model, { attr, belongsTo } from '@ember-data/model';

    export default Model.extend({
      value: attr('number'),
      player: belongsTo('player'),
      date: attr('date')
    });
    ```

    @class NumberTransform
    @extends Transform
   */


  var number = Transform.extend({
    deserialize: function deserialize(serialized) {
      var transformed;

      if (serialized === '' || serialized === null || serialized === undefined) {
        return null;
      } else {
        transformed = Number(serialized);
        return isNumber(transformed) ? transformed : null;
      }
    },
    serialize: function serialize(deserialized) {
      var transformed;

      if (deserialized === '' || deserialized === null || deserialized === undefined) {
        return null;
      } else {
        transformed = Number(deserialized);
        return isNumber(transformed) ? transformed : null;
      }
    }
  });

  /**
    @module @ember-data/serializer
  */

  /**
    The `StringTransform` class is used to serialize and deserialize
    string attributes on Ember Data record objects. This transform is
    used when `string` is passed as the type parameter to the
    [attr](/ember-data/release/functions/@ember-data%2Fmodel/attr) function.

    Usage

    ```app/models/user.js
    import Model, { attr, belongsTo } from '@ember-data/model';

    export default Model.extend({
      isAdmin: attr('boolean'),
      name: attr('string'),
      email: attr('string')
    });
    ```

    @class StringTransform
    @extends Transform
   */

  var string = Transform.extend({
    deserialize: function deserialize(serialized) {
      return Ember.isNone(serialized) ? null : String(serialized);
    },
    serialize: function serialize(deserialized) {
      return Ember.isNone(deserialized) ? null : String(deserialized);
    }
  });

  exports.BooleanTransform = boolean;
  exports.DateTransform = date;
  exports.EmbeddedRecordsMixin = embeddedRecordsMixin;
  exports.NumberTransform = number;
  exports.StringTransform = string;
  exports.Transform = Transform;
  exports.modelHasAttributeOrRelationshipNamedType = modelHasAttributeOrRelationshipNamedType;

  Object.defineProperty(exports, '__esModule', { value: true });

});
