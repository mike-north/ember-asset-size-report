define('@ember-data/model/-private', ['exports', '@ember-data/store/-private', '@ember-data/canary-features', '@ember-data/store'], function (exports, Private, canaryFeatures, store) { 'use strict';

  function isElementDescriptor(args) {
    var maybeTarget = args[0],
        maybeKey = args[1],
        maybeDesc = args[2];
    return (// Ensure we have the right number of args
      args.length === 3 && ( // Make sure the target is a class or object (prototype)
      typeof maybeTarget === 'function' || typeof maybeTarget === 'object' && maybeTarget !== null) && // Make sure the key is a string
      typeof maybeKey === 'string' && ( // Make sure the descriptor is the right shape
      typeof maybeDesc === 'object' && maybeDesc !== null && 'enumerable' in maybeDesc && 'configurable' in maybeDesc || // TS compatibility
      maybeDesc === undefined)
    );
  }
  function computedMacroWithOptionalParams(fn) {
    {
      return function () {
        for (var _len = arguments.length, maybeDesc = new Array(_len), _key = 0; _key < _len; _key++) {
          maybeDesc[_key] = arguments[_key];
        }

        return isElementDescriptor(maybeDesc) ? fn().apply(void 0, maybeDesc) : fn.apply(void 0, maybeDesc);
      };
    }
  }

  /**
    @module @ember-data/model
  */

  function getDefaultValue(record, options, key) {
    if (typeof options.defaultValue === 'function') {
      return options.defaultValue.apply(null, arguments);
    } else {
      var defaultValue = options.defaultValue;
      return defaultValue;
    }
  }

  function hasValue(internalModel, key) {
    return Private.recordDataFor(internalModel).hasAttr(key);
  }
  /**
    `attr` defines an attribute on a [Model](/ember-data/release/classes/Model).
    By default, attributes are passed through as-is, however you can specify an
    optional type to have the value automatically transformed.
    Ember Data ships with four basic transform types: `string`, `number`,
    `boolean` and `date`. You can define your own transforms by subclassing
    [Transform](/ember-data/release/classes/Transform).

    Note that you cannot use `attr` to define an attribute of `id`.

    `attr` takes an optional hash as a second parameter, currently
    supported options are:

    - `defaultValue`: Pass a string or a function to be called to set the attribute
    to a default value if none is supplied.

    Example

    ```app/models/user.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      username: attr('string'),
      email: attr('string'),
      verified: attr('boolean', { defaultValue: false })
    });
    ```

    Default value can also be a function. This is useful it you want to return
    a new object for each attribute.

    ```app/models/user.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      username: attr('string'),
      email: attr('string'),
      settings: attr({
        defaultValue() {
          return {};
        }
      })
    });
    ```

    The `options` hash is passed as second argument to a transforms'
    `serialize` and `deserialize` method. This allows to configure a
    transformation and adapt the corresponding value, based on the config:

    ```app/models/post.js
    import Model, { attr } from '@ember-data/model';

    export default Model.extend({
      text: attr('text', {
        uppercase: true
      })
    });
    ```

    ```app/transforms/text.js
    import Transform from '@ember-data/serializer/transform';

    export default Transform.extend({
      serialize(value, options) {
        if (options.uppercase) {
          return value.toUpperCase();
        }

        return value;
      },

      deserialize(value) {
        return value;
      }
    })
    ```

    @method attr
    @public
    @static
    @for @ember-data/model
    @param {String|Object} type the attribute type
    @param {Object} options a hash of options
    @return {Attribute}
  */


  function attr(type, options) {
    if (typeof type === 'object') {
      options = type;
      type = undefined;
    } else {
      options = options || {};
    }

    var meta = {
      type: type,
      isAttribute: true,
      kind: 'attribute',
      options: options
    };
    return Ember.computed({
      get: function get(key) {

        var internalModel = this._internalModel;

        if (hasValue(internalModel, key)) {
          return internalModel.getAttributeValue(key);
        } else {
          return getDefaultValue(this, options, key);
        }
      },
      set: function set(key, value) {

        if (canaryFeatures.RECORD_DATA_ERRORS) {
          var oldValue = this._internalModel._recordData.getAttr(key);

          if (oldValue !== value) {
            var errors = this.get('errors');

            if (errors.get(key)) {
              errors.remove(key);
            }

            this._markInvalidRequestAsClean();
          }
        }

        return this._internalModel.setDirtyAttribute(key, value);
      }
    }).meta(meta);
  }

  var attr$1 = computedMacroWithOptionalParams(attr);

  /**
    @module @ember-data/model
  */

  /**
    `belongsTo` is used to define One-To-One and One-To-Many
    relationships on a [Model](/ember-data/release/classes/Model).


    `belongsTo` takes an optional hash as a second parameter, currently
    supported options are:

    - `async`: A boolean value used to explicitly declare this to be an async relationship. The default is true.
    - `inverse`: A string used to identify the inverse property on a
      related model in a One-To-Many relationship. See [Explicit Inverses](#explicit-inverses)

    #### One-To-One
    To declare a one-to-one relationship between two models, use
    `belongsTo`:

    ```app/models/user.js
    import Model, { belongsTo } from '@ember-data/model';

    export default Model.extend({
      profile: belongsTo('profile')
    });
    ```

    ```app/models/profile.js
    import Model, { belongsTo } from '@ember-data/model';

    export default Model.extend({
      user: belongsTo('user')
    });
    ```

    #### One-To-Many
    To declare a one-to-many relationship between two models, use
    `belongsTo` in combination with `hasMany`, like this:

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

    You can avoid passing a string as the first parameter. In that case Ember Data
    will infer the type from the key name.

    ```app/models/comment.js
    import Model, { belongsTo } from '@ember-data/model';

    export default Model.extend({
      post: belongsTo()
    });
    ```

    will lookup for a Post type.

    #### Sync relationships

    Ember Data resolves sync relationships with the related resources
    available in its local store, hence it is expected these resources
    to be loaded before or along-side the primary resource.

    ```app/models/comment.js
    import Model, { belongsTo } from '@ember-data/model';

    export default Model.extend({
      post: belongsTo('post', {
        async: false
      })
    });
    ```

    In contrast to async relationship, accessing a sync relationship
    will always return the record (Model instance) for the existing
    local resource, or null. But it will error on access when
    a related resource is known to exist and it has not been loaded.

    ```
    let post = comment.get('post');

    ```

    @method belongsTo
    @public
    @static
    @for @ember-data/model
    @param {String} modelName (optional) type of the relationship
    @param {Object} options (optional) a hash of options
    @return {Ember.computed} relationship
  */

  function belongsTo(modelName, options) {
    var opts, userEnteredModelName;

    if (typeof modelName === 'object') {
      opts = modelName;
      userEnteredModelName = undefined;
    } else {
      opts = options;
      userEnteredModelName = modelName;
    }

    if (typeof userEnteredModelName === 'string') {
      userEnteredModelName = store.normalizeModelName(userEnteredModelName);
    }
    opts = opts || {};
    var meta = {
      type: userEnteredModelName,
      isRelationship: true,
      options: opts,
      kind: 'belongsTo',
      name: 'Belongs To',
      key: null
    };
    return Ember.computed({
      get: function get(key) {

        return this._internalModel.getBelongsTo(key);
      },
      set: function set(key, value) {

        this._internalModel.setDirtyBelongsTo(key, value);

        return this._internalModel.getBelongsTo(key);
      }
    }).meta(meta);
  }

  var belongsTo$1 = computedMacroWithOptionalParams(belongsTo);

  /**
    `hasMany` is used to define One-To-Many and Many-To-Many
    relationships on a [Model](/ember-data/release/classes/Model).

    `hasMany` takes an optional hash as a second parameter, currently
    supported options are:

    - `async`: A boolean value used to explicitly declare this to be an async relationship. The default is true.
    - `inverse`: A string used to identify the inverse property on a related model.

    #### One-To-Many
    To declare a one-to-many relationship between two models, use
    `belongsTo` in combination with `hasMany`, like this:

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

    #### Many-To-Many
    To declare a many-to-many relationship between two models, use
    `hasMany`:

    ```app/models/post.js
    import Model, { hasMany } from '@ember-data/model';

    export default Model.extend({
      tags: hasMany('tag')
    });
    ```

    ```app/models/tag.js
    import Model, { hasMany } from '@ember-data/model';

    export default Model.extend({
      posts: hasMany('post')
    });
    ```

    You can avoid passing a string as the first parameter. In that case Ember Data
    will infer the type from the singularized key name.

    ```app/models/post.js
    import Model, { hasMany } from '@ember-data/model';

    export default Model.extend({
      tags: hasMany()
    });
    ```

    will lookup for a Tag type.

    #### Explicit Inverses

    Ember Data will do its best to discover which relationships map to
    one another. In the one-to-many code above, for example, Ember Data
    can figure out that changing the `comments` relationship should update
    the `post` relationship on the inverse because post is the only
    relationship to that model.

    However, sometimes you may have multiple `belongsTo`/`hasMany` for the
    same type. You can specify which property on the related model is
    the inverse using `hasMany`'s `inverse` option:

    ```app/models/comment.js
    import Model, { belongsTo } from '@ember-data/model';

    export default Model.extend({
      onePost: belongsTo('post'),
      twoPost: belongsTo('post'),
      redPost: belongsTo('post'),
      bluePost: belongsTo('post')
    });
    ```

    ```app/models/post.js
    import Model, { hasMany } from '@ember-data/model';

    export default Model.extend({
      comments: hasMany('comment', {
        inverse: 'redPost'
      })
    });
    ```

    You can also specify an inverse on a `belongsTo`, which works how
    you'd expect.

    #### Sync relationships

    Ember Data resolves sync relationships with the related resources
    available in its local store, hence it is expected these resources
    to be loaded before or along-side the primary resource.

    ```app/models/post.js
    import Model, { hasMany } from '@ember-data/model';

    export default Model.extend({
      comments: hasMany('comment', {
        async: false
      })
    });
    ```

    In contrast to async relationship, accessing a sync relationship
    will always return a [ManyArray](/ember-data/release/classes/ManyArray) instance
    containing the existing local resources. But it will error on access
    when any of the known related resources have not been loaded.

    ```
    post.get('comments').forEach((comment) => {

    });

    ```

    If you are using `links` with sync relationships, you have to use
    `ref.reload` to fetch the resources.

    @method hasMany
    @public
    @static
    @for @ember-data/model
    @param {String} type (optional) type of the relationship
    @param {Object} options (optional) a hash of options
    @return {Ember.computed} relationship
  */

  function hasMany(type, options) {
    if (typeof type === 'object') {
      options = type;
      type = undefined;
    }
    options = options || {};

    if (typeof type === 'string') {
      type = store.normalizeModelName(type);
    } // Metadata about relationships is stored on the meta of
    // the relationship. This is used for introspection and
    // serialization. Note that `key` is populated lazily
    // the first time the CP is called.


    var meta = {
      type: type,
      options: options,
      isRelationship: true,
      kind: 'hasMany',
      name: 'Has Many',
      key: null
    };
    return Ember.computed({
      get: function get(key) {

        return this._internalModel.getHasMany(key);
      },
      set: function set(key, records) {

        var internalModel = this._internalModel;
        internalModel.setDirtyHasMany(key, records);
        return internalModel.getHasMany(key);
      }
    }).meta(meta);
  }

  var hasMany$1 = computedMacroWithOptionalParams(hasMany);

  exports.attr = attr$1;
  exports.belongsTo = belongsTo$1;
  exports.hasMany = hasMany$1;

  Object.defineProperty(exports, '__esModule', { value: true });

});
