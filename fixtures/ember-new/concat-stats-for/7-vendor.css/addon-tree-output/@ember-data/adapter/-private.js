define('@ember-data/adapter/-private', ['exports', 'require', 'ember-inflector'], function (exports, require, emberInflector) { 'use strict';

  var require__default = 'default' in require ? require['default'] : require;

  var newline = /\r?\n/;
  function parseResponseHeaders(headersString) {
    var headers = Object.create(null);

    if (!headersString) {
      return headers;
    }

    var headerPairs = headersString.split(newline);

    for (var i = 0; i < headerPairs.length; i++) {
      var header = headerPairs[i];
      var j = 0;
      var foundSep = false;

      for (; j < header.length; j++) {
        if (header.charCodeAt(j) === 58
        /* ':' */
        ) {
            foundSep = true;
            break;
          }
      }

      if (foundSep === false) {
        continue;
      }

      var field = header.substring(0, j).trim();
      var value = header.substring(j + 1, header.length).trim();

      if (value) {
        var lowerCasedField = field.toLowerCase();
        headers[lowerCasedField] = value;
        headers[field] = value;
      }
    }

    return headers;
  }

  /*
   * Function that always attempts to parse the response as json, and if an error is thrown,
   * returns `undefined` if the response is successful and has a status code of 204 (No Content),
   * or 205 (Reset Content) or if the request method was 'HEAD', and the plain payload otherwise.
   */
  function determineBodyPromise(response, requestData) {
    return response.text().then(function (payload) {
      var ret = payload;

      try {
        ret = JSON.parse(payload);
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          throw error;
        }

        var status = response.status;

        if (response.ok && (status === 204 || status === 205 || requestData.method === 'HEAD')) {
          ret = undefined;
        } else {
          {
            var message = `The server returned an empty string for ${requestData.method} ${requestData.url}, which cannot be parsed into a valid JSON. Return either null or {}.`;

            if (payload === '') {
              ( Ember.warn(message, true, {
                id: 'ds.adapter.returned-empty-string-as-JSON'
              }));
              throw error;
            }
          } // eslint-disable-next-line no-console


          console.warn('This response was unable to be parsed as json.', payload);
        }
      }

      return ret;
    });
  }

  var RBRACKET = /\[\]$/;

  function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }
  /*
   * Helper function that turns the data/body of a request into a query param string.
   * This is directly copied from jQuery.param.
   */


  function serializeQueryParams(queryParamsObject) {
    var s = [];

    function buildParams(prefix, obj) {
      var i, len, key;

      if (prefix) {
        if (Array.isArray(obj)) {
          for (i = 0, len = obj.length; i < len; i++) {
            if (RBRACKET.test(prefix)) {
              add(s, prefix, obj[i]);
            } else {
              buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i]);
            }
          }
        } else if (isPlainObject(obj)) {
          for (key in obj) {
            buildParams(prefix + '[' + key + ']', obj[key]);
          }
        } else {
          add(s, prefix, obj);
        }
      } else if (Array.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          add(s, obj[i].name, obj[i].value);
        }
      } else {
        for (key in obj) {
          buildParams(key, obj[key]);
        }
      }

      return s;
    }

    return buildParams('', queryParamsObject).join('&').replace(/%20/g, '+');
  }
  /*
   * Part of the `serializeQueryParams` helper function.
   */

  function add(s, k, v) {
    // Strip out keys with undefined value and replace null values with
    // empty strings (mimics jQuery.ajax)
    if (v === undefined) {
      return;
    } else if (v === null) {
      v = '';
    }

    v = typeof v === 'function' ? v() : v;
    s[s.length] = `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
  }

  var _fetch = null;
  function getFetchFunction() {
    if (_fetch !== null) {
      return _fetch();
    }

    if (require.has('fetch')) {
      // use `fetch` module by default, this is commonly provided by ember-fetch
      var fetchFn = require__default('fetch').default;

      _fetch = () => fetchFn;
    } else if (typeof fetch === 'function') {
      // fallback to using global fetch
      _fetch = () => fetch;
    } else {
      throw new Error('cannot find the `fetch` module or the `fetch` global. Did you mean to install the `ember-fetch` addon?');
    }

    return _fetch();
  }

  /**
    @module @ember-data/adapter
  */

  /**
    ## Using BuildURLMixin

    To use URL building, include the mixin when extending an adapter, and call `buildURL` where needed.
    The default behaviour is designed for RESTAdapter.

    ### Example

    ```javascript
    import Adapter, { BuildURLMixin } from '@ember-data/adapter';

    export default Adapter.extend(BuildURLMixin, {
      findRecord: function(store, type, id, snapshot) {
        var url = this.buildURL(type.modelName, id, snapshot, 'findRecord');
        return this.ajax(url, 'GET');
      }
    });
    ```

    ### Attributes

    The `host` and `namespace` attributes will be used if defined, and are optional.

    @class BuildURLMixin
  */

  var buildUrlMixin = Ember.Mixin.create({
    /**
      Builds a URL for a given type and optional ID.
       By default, it pluralizes the type's name (for example, 'post'
      becomes 'posts' and 'person' becomes 'people'). To override the
      pluralization see [pathForType](BuildUrlMixin/methods/pathForType?anchor=pathForType).
       If an ID is specified, it adds the ID to the path generated
      for the type, separated by a `/`.
       When called by `RESTAdapter.findMany()` the `id` and `snapshot` parameters
      will be arrays of ids and snapshots.
       @method buildURL
      @param {String} modelName
      @param {(String|Array|Object)} id single id or array of ids or query
      @param {(Snapshot|SnapshotRecordArray)} snapshot single snapshot or array of snapshots
      @param {String} requestType
      @param {Object} query object of query parameters to send for query requests.
      @return {String} url
    */
    buildURL(modelName, id, snapshot, requestType, query) {
      switch (requestType) {
        case 'findRecord':
          return this.urlForFindRecord(id, modelName, snapshot);

        case 'findAll':
          return this.urlForFindAll(modelName, snapshot);

        case 'query':
          return this.urlForQuery(query, modelName);

        case 'queryRecord':
          return this.urlForQueryRecord(query, modelName);

        case 'findMany':
          return this.urlForFindMany(id, modelName, snapshot);

        case 'findHasMany':
          return this.urlForFindHasMany(id, modelName, snapshot);

        case 'findBelongsTo':
          return this.urlForFindBelongsTo(id, modelName, snapshot);

        case 'createRecord':
          return this.urlForCreateRecord(modelName, snapshot);

        case 'updateRecord':
          return this.urlForUpdateRecord(id, modelName, snapshot);

        case 'deleteRecord':
          return this.urlForDeleteRecord(id, modelName, snapshot);

        default:
          return this._buildURL(modelName, id);
      }
    },

    /**
      @method _buildURL
      @private
      @param {String} modelName
      @param {String} id
      @return {String} url
    */
    _buildURL(modelName, id) {
      var path;
      var url = [];
      var host = Ember.get(this, 'host');
      var prefix = this.urlPrefix();

      if (modelName) {
        path = this.pathForType(modelName);

        if (path) {
          url.push(path);
        }
      }

      if (id) {
        url.push(encodeURIComponent(id));
      }

      if (prefix) {
        url.unshift(prefix);
      }

      url = url.join('/');

      if (!host && url && url.charAt(0) !== '/') {
        url = '/' + url;
      }

      return url;
    },

    /**
     Builds a URL for a `store.findRecord(type, id)` call.
      Example:
      ```app/adapters/user.js
     import JSONAPIAdapter from '@ember-data/adapter/json-api';
      export default JSONAPIAdapter.extend({
       urlForFindRecord(id, modelName, snapshot) {
         let baseUrl = this.buildURL(modelName, id, snapshot);
         return `${baseUrl}/users/${snapshot.adapterOptions.user_id}/playlists/${id}`;
       }
     });
     ```
      @method urlForFindRecord
     @param {String} id
     @param {String} modelName
     @param {Snapshot} snapshot
     @return {String} url
      */
    urlForFindRecord(id, modelName, snapshot) {
      return this._buildURL(modelName, id);
    },

    /**
     Builds a URL for a `store.findAll(type)` call.
      Example:
      ```app/adapters/comment.js
     import JSONAPIAdapter from '@ember-data/adapter/json-api';
      export default JSONAPIAdapter.extend({
       urlForFindAll(modelName, snapshot) {
         return 'data/comments.json';
       }
     });
     ```
      @method urlForFindAll
     @param {String} modelName
     @param {SnapshotRecordArray} snapshot
     @return {String} url
     */
    urlForFindAll(modelName, snapshot) {
      return this._buildURL(modelName);
    },

    /**
     Builds a URL for a `store.query(type, query)` call.
      Example:
      ```app/adapters/application.js
     import RESTAdapter from '@ember-data/adapter/rest';
      export default RESTAdapter.extend({
       host: 'https://api.github.com',
       urlForQuery (query, modelName) {
         switch(modelName) {
           case 'repo':
             return `https://api.github.com/orgs/${query.orgId}/repos`;
           default:
             return this._super(...arguments);
         }
       }
     });
     ```
      @method urlForQuery
     @param {Object} query
     @param {String} modelName
     @return {String} url
     */
    urlForQuery(query, modelName) {
      return this._buildURL(modelName);
    },

    /**
     Builds a URL for a `store.queryRecord(type, query)` call.
      Example:
      ```app/adapters/application.js
     import RESTAdapter from '@ember-data/adapter/rest';
      export default RESTAdapter.extend({
       urlForQueryRecord({ slug }, modelName) {
         let baseUrl = this.buildURL();
         return `${baseUrl}/${encodeURIComponent(slug)}`;
       }
     });
     ```
      @method urlForQueryRecord
     @param {Object} query
     @param {String} modelName
     @return {String} url
     */
    urlForQueryRecord(query, modelName) {
      return this._buildURL(modelName);
    },

    /**
     Builds a URL for coalescing multiple `store.findRecord(type, id)`
     records into 1 request when the adapter's `coalesceFindRequests`
     property is `true`.
      Example:
      ```app/adapters/application.js
     import RESTAdapter from '@ember-data/adapter/rest';
      export default RESTAdapter.extend({
       urlForFindMany(ids, modelName) {
         let baseUrl = this.buildURL();
         return `${baseUrl}/coalesce`;
       }
     });
     ```
      @method urlForFindMany
     @param {Array} ids
     @param {String} modelName
     @param {Array} snapshots
     @return {String} url
     */
    urlForFindMany(ids, modelName, snapshots) {
      return this._buildURL(modelName);
    },

    /**
     Builds a URL for fetching an async `hasMany` relationship when a URL
     is not provided by the server.
      Example:
      ```app/adapters/application.js
     import JSONAPIAdapter from '@ember-data/adapter/json-api';
      export default JSONAPIAdapter.extend({
       urlForFindHasMany(id, modelName, snapshot) {
         let baseUrl = this.buildURL(modelName, id);
         return `${baseUrl}/relationships`;
       }
     });
     ```
      @method urlForFindHasMany
     @param {String} id
     @param {String} modelName
     @param {Snapshot} snapshot
     @return {String} url
     */
    urlForFindHasMany(id, modelName, snapshot) {
      return this._buildURL(modelName, id);
    },

    /**
     Builds a URL for fetching an async `belongsTo` relationship when a url
     is not provided by the server.
      Example:
      ```app/adapters/application.js
     import JSONAPIAdapter from '@ember-data/adapter/json-api';
      export default JSONAPIAdapter.extend({
       urlForFindBelongsTo(id, modelName, snapshot) {
         let baseUrl = this.buildURL(modelName, id);
         return `${baseUrl}/relationships`;
       }
     });
     ```
      @method urlForFindBelongsTo
     @param {String} id
     @param {String} modelName
     @param {Snapshot} snapshot
     @return {String} url
     */
    urlForFindBelongsTo(id, modelName, snapshot) {
      return this._buildURL(modelName, id);
    },

    /**
     Builds a URL for a `record.save()` call when the record was created
     locally using `store.createRecord()`.
      Example:
      ```app/adapters/application.js
     import RESTAdapter from '@ember-data/adapter/rest';
      export default RESTAdapter.extend({
       urlForCreateRecord(modelName, snapshot) {
         return this._super(...arguments) + '/new';
       }
     });
     ```
      @method urlForCreateRecord
     @param {String} modelName
     @param {Snapshot} snapshot
     @return {String} url
     */
    urlForCreateRecord(modelName, snapshot) {
      return this._buildURL(modelName);
    },

    /**
     Builds a URL for a `record.save()` call when the record has been updated locally.
      Example:
      ```app/adapters/application.js
     import RESTAdapter from '@ember-data/adapter/rest';
      export default RESTAdapter.extend({
       urlForUpdateRecord(id, modelName, snapshot) {
         return `/${id}/feed?access_token=${snapshot.adapterOptions.token}`;
       }
     });
     ```
      @method urlForUpdateRecord
     @param {String} id
     @param {String} modelName
     @param {Snapshot} snapshot
     @return {String} url
     */
    urlForUpdateRecord(id, modelName, snapshot) {
      return this._buildURL(modelName, id);
    },

    /**
     Builds a URL for a `record.save()` call when the record has been deleted locally.
      Example:
      ```app/adapters/application.js
     import RESTAdapter from '@ember-data/adapter/rest';
      export default RESTAdapter.extend({
       urlForDeleteRecord(id, modelName, snapshot) {
         return this._super(...arguments) + '/destroy';
       }
     });
     ```
      @method urlForDeleteRecord
     @param {String} id
     @param {String} modelName
     @param {Snapshot} snapshot
     @return {String} url
     */
    urlForDeleteRecord(id, modelName, snapshot) {
      return this._buildURL(modelName, id);
    },

    /**
      @method urlPrefix
      @private
      @param {String} path
      @param {String} parentURL
      @return {String} urlPrefix
    */
    urlPrefix(path, parentURL) {
      var host = Ember.get(this, 'host');
      var namespace = Ember.get(this, 'namespace');

      if (!host || host === '/') {
        host = '';
      }

      if (path) {
        // Protocol relative url
        if (/^\/\//.test(path) || /http(s)?:\/\//.test(path)) {
          // Do nothing, the full host is already included.
          return path; // Absolute path
        } else if (path.charAt(0) === '/') {
          return `${host}${path}`; // Relative path
        } else {
          return `${parentURL}/${path}`;
        }
      } // No path provided


      var url = [];

      if (host) {
        url.push(host);
      }

      if (namespace) {
        url.push(namespace);
      }

      return url.join('/');
    },

    /**
      Determines the pathname for a given type.
       By default, it pluralizes the type's name (for example,
      'post' becomes 'posts' and 'person' becomes 'people').
       ### Pathname customization
       For example, if you have an object `LineItem` with an
      endpoint of `/line_items/`.
       ```app/adapters/application.js
      import RESTAdapter from '@ember-data/adapter/rest';
      import { decamelize } from '@ember/string';
      import { pluralize } from 'ember-inflector';
       export default RESTAdapter.extend({
        pathForType: function(modelName) {
          var decamelized = decamelize(modelName);
          return pluralize(decamelized);
        }
      });
      ```
       @method pathForType
      @param {String} modelName
      @return {String} path
    **/
    pathForType(modelName) {
      var camelized = Ember.String.camelize(modelName);
      return emberInflector.pluralize(camelized);
    }

  });

  function serializeIntoHash(store, modelClass, snapshot, options = {
    includeId: true
  }) {
    var serializer = store.serializerFor(modelClass.modelName);

    if (typeof serializer.serializeIntoHash === 'function') {
      var data = {};
      serializer.serializeIntoHash(data, modelClass, snapshot, options);
      return data;
    }

    return serializer.serialize(snapshot, options);
  }

  exports.BuildURLMixin = buildUrlMixin;
  exports.determineBodyPromise = determineBodyPromise;
  exports.fetch = getFetchFunction;
  exports.parseResponseHeaders = parseResponseHeaders;
  exports.serializeIntoHash = serializeIntoHash;
  exports.serializeQueryParams = serializeQueryParams;

  Object.defineProperty(exports, '__esModule', { value: true });

});
