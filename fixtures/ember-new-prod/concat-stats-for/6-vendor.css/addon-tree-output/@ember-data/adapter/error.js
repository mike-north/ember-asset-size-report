define("@ember-data/adapter/error", ["exports", "@ember-data/store/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "errorsHashToArray", {
    enumerable: true,
    get: function get() {
      return _private.errorsHashToArray;
    }
  });
  Object.defineProperty(_exports, "errorsArrayToHash", {
    enumerable: true,
    get: function get() {
      return _private.errorsArrayToHash;
    }
  });
  _exports.ServerError = _exports.ConflictError = _exports.NotFoundError = _exports.ForbiddenError = _exports.UnauthorizedError = _exports.AbortError = _exports.TimeoutError = _exports.InvalidError = _exports.default = void 0;

  /**
    @module @ember-data/adapter
  */

  /**
    A `AdapterError` is used by an adapter to signal that an error occurred
    during a request to an external API. It indicates a generic error, and
    subclasses are used to indicate specific error states. The following
    subclasses are provided:
  
    - `InvalidError`
    - `TimeoutError`
    - `AbortError`
    - `UnauthorizedError`
    - `ForbiddenError`
    - `NotFoundError`
    - `ConflictError`
    - `ServerError`
  
    To create a custom error to signal a specific error state in communicating
    with an external API, extend the `AdapterError`. For example, if the
    external API exclusively used HTTP `503 Service Unavailable` to indicate
    it was closed for maintenance:
  
    ```app/adapters/maintenance-error.js
    import AdapterError from '@ember-data/adapter/error';
  
    export default AdapterError.extend({ message: "Down for maintenance." });
    ```
  
    This error would then be returned by an adapter's `handleResponse` method:
  
    ```app/adapters/application.js
    import JSONAPIAdapter from '@ember-data/adapter/json-api';
    import MaintenanceError from './maintenance-error';
  
    export default JSONAPIAdapter.extend({
      handleResponse(status) {
        if (503 === status) {
          return new MaintenanceError();
        }
  
        return this._super(...arguments);
      }
    });
    ```
  
    And can then be detected in an application and used to send the user to an
    `under-maintenance` route:
  
    ```app/routes/application.js
    import Route from '@ember/routing/route';
    import MaintenanceError from '../adapters/maintenance-error';
  
    export default Route.extend({
      actions: {
        error(error, transition) {
          if (error instanceof MaintenanceError) {
            this.transitionTo('under-maintenance');
            return;
          }
  
          // ...other error handling logic
        }
      }
    });
    ```
  
    @class AdapterError
  */
  function AdapterError(errors, message) {
    if (message === void 0) {
      message = 'Adapter operation failed';
    }

    this.isAdapterError = true;
    var error = Ember.Error.call(this, message); // in ember 3.8+ Error is a Native Error and we don't
    // gain these automatically from the EmberError.call

    if (error) {
      this.stack = error.stack;
      this.description = error.description;
      this.fileName = error.fileName;
      this.lineNumber = error.lineNumber;
      this.message = error.message;
      this.name = error.name;
      this.number = error.number;
      this.code = error.code;
    }

    this.errors = errors || [{
      title: 'Adapter Error',
      detail: message
    }];
  }

  var _default = AdapterError;
  _exports.default = _default;

  function extendFn(ErrorClass) {
    return function (_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          defaultMessage = _ref.message;

      return extend(ErrorClass, defaultMessage);
    };
  }

  function extend(ParentErrorClass, defaultMessage) {
    var ErrorClass = function ErrorClass(errors, message) {
      (false && !(Array.isArray(errors || [])) && Ember.assert('`AdapterError` expects json-api formatted errors array.', Array.isArray(errors || [])));
      ParentErrorClass.call(this, errors, message || defaultMessage);
    };

    ErrorClass.prototype = Object.create(ParentErrorClass.prototype);
    ErrorClass.extend = extendFn(ErrorClass);
    return ErrorClass;
  }

  AdapterError.prototype = Object.create(Ember.Error.prototype);
  AdapterError.extend = extendFn(AdapterError);
  /**
    A `InvalidError` is used by an adapter to signal the external API
    was unable to process a request because the content was not
    semantically correct or meaningful per the API. Usually, this means a
    record failed some form of server-side validation. When a promise
    from an adapter is rejected with a `InvalidError` the record will
    transition to the `invalid` state and the errors will be set to the
    `errors` property on the record.
  
    For Ember Data to correctly map errors to their corresponding
    properties on the model, Ember Data expects each error to be
    a valid JSON-API error object with a `source/pointer` that matches
    the property name. For example, if you had a Post model that
    looked like this.
  
    ```app/models/post.js
    import Model, { attr } from '@ember-data/model';
  
    export default Model.extend({
      title: attr('string'),
      content: attr('string')
    });
    ```
  
    To show an error from the server related to the `title` and
    `content` properties your adapter could return a promise that
    rejects with a `InvalidError` object that looks like this:
  
    ```app/adapters/post.js
    import RSVP from 'RSVP';
    import RESTAdapter from '@ember-data/adapter/rest';
    import { InvalidError } from '@ember-data/adapter/error';
  
    export default RESTAdapter.extend({
      updateRecord() {
        // Fictional adapter that always rejects
        return RSVP.reject(new InvalidError([
          {
            detail: 'Must be unique',
            source: { pointer: '/data/attributes/title' }
          },
          {
            detail: 'Must not be blank',
            source: { pointer: '/data/attributes/content'}
          }
        ]));
      }
    });
    ```
  
    Your backend may use different property names for your records the
    store will attempt to extract and normalize the errors using the
    serializer's `extractErrors` method before the errors get added to
    the model. As a result, it is safe for the `InvalidError` to
    wrap the error payload unaltered.
  
    @class InvalidError
    @extends AdapterError
  */

  var InvalidError = extend(AdapterError, 'The adapter rejected the commit because it was invalid');
  /**
    A `TimeoutError` is used by an adapter to signal that a request
    to the external API has timed out. I.e. no response was received from
    the external API within an allowed time period.
  
    An example use case would be to warn the user to check their internet
    connection if an adapter operation has timed out:
  
    ```app/routes/application.js
    import Route from '@ember/routing/route';
    import { TimeoutError } from '@ember-data/adapter/error';
  
    export default Route.extend({
      actions: {
        error(error, transition) {
          if (error instanceof TimeoutError) {
            // alert the user
            alert('Are you still connected to the internet?');
            return;
          }
  
          // ...other error handling logic
        }
      }
    });
    ```
  
    @class TimeoutError
    @extends AdapterError
  */

  _exports.InvalidError = InvalidError;
  var TimeoutError = extend(AdapterError, 'The adapter operation timed out');
  /**
    A `AbortError` is used by an adapter to signal that a request to
    the external API was aborted. For example, this can occur if the user
    navigates away from the current page after a request to the external API
    has been initiated but before a response has been received.
  
    @class AbortError
    @extends AdapterError
  */

  _exports.TimeoutError = TimeoutError;
  var AbortError = extend(AdapterError, 'The adapter operation was aborted');
  /**
    A `UnauthorizedError` equates to a HTTP `401 Unauthorized` response
    status. It is used by an adapter to signal that a request to the external
    API was rejected because authorization is required and has failed or has not
    yet been provided.
  
    An example use case would be to redirect the user to a login route if a
    request is unauthorized:
  
    ```app/routes/application.js
    import Route from '@ember/routing/route';
    import { UnauthorizedError } from '@ember-data/adapter/error';
  
    export default Route.extend({
      actions: {
        error(error, transition) {
          if (error instanceof UnauthorizedError) {
            // go to the sign in route
            this.transitionTo('login');
            return;
          }
  
          // ...other error handling logic
        }
      }
    });
    ```
  
    @class UnauthorizedError
    @extends AdapterError
  */

  _exports.AbortError = AbortError;
  var UnauthorizedError = extend(AdapterError, 'The adapter operation is unauthorized');
  /**
    A `ForbiddenError` equates to a HTTP `403 Forbidden` response status.
    It is used by an adapter to signal that a request to the external API was
    valid but the server is refusing to respond to it. If authorization was
    provided and is valid, then the authenticated user does not have the
    necessary permissions for the request.
  
    @class ForbiddenError
    @extends AdapterError
  */

  _exports.UnauthorizedError = UnauthorizedError;
  var ForbiddenError = extend(AdapterError, 'The adapter operation is forbidden');
  /**
    A `NotFoundError` equates to a HTTP `404 Not Found` response status.
    It is used by an adapter to signal that a request to the external API
    was rejected because the resource could not be found on the API.
  
    An example use case would be to detect if the user has entered a route
    for a specific model that does not exist. For example:
  
    ```app/routes/post.js
    import Route from '@ember/routing/route';
    import { NotFoundError } from '@ember-data/adapter/error';
  
    export default Route.extend({
      model(params) {
        return this.get('store').findRecord('post', params.post_id);
      },
  
      actions: {
        error(error, transition) {
          if (error instanceof NotFoundError) {
            // redirect to a list of all posts instead
            this.transitionTo('posts');
          } else {
            // otherwise let the error bubble
            return true;
          }
        }
      }
    });
    ```
  
    @class NotFoundError
    @extends AdapterError
  */

  _exports.ForbiddenError = ForbiddenError;
  var NotFoundError = extend(AdapterError, 'The adapter could not find the resource');
  /**
    A `ConflictError` equates to a HTTP `409 Conflict` response status.
    It is used by an adapter to indicate that the request could not be processed
    because of a conflict in the request. An example scenario would be when
    creating a record with a client-generated ID but that ID is already known
    to the external API.
  
    @class ConflictError
    @extends AdapterError
  */

  _exports.NotFoundError = NotFoundError;
  var ConflictError = extend(AdapterError, 'The adapter operation failed due to a conflict');
  /**
    A `ServerError` equates to a HTTP `500 Internal Server Error` response
    status. It is used by the adapter to indicate that a request has failed
    because of an error in the external API.
  
    @class ServerError
    @extends AdapterError
  */

  _exports.ConflictError = ConflictError;
  var ServerError = extend(AdapterError, 'The adapter operation failed due to a server error');
  _exports.ServerError = ServerError;
});