define("@ember/-internals/runtime/lib/mixins/promise_proxy", ["exports", "@ember/-internals/metal", "@ember/error"], function (_exports, _metal, _error) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
    @module @ember/object
  */
  function tap(proxy, promise) {
    (0, _metal.setProperties)(proxy, {
      isFulfilled: false,
      isRejected: false
    });
    return promise.then(function (value) {
      if (!proxy.isDestroyed && !proxy.isDestroying) {
        (0, _metal.setProperties)(proxy, {
          content: value,
          isFulfilled: true
        });
      }

      return value;
    }, function (reason) {
      if (!proxy.isDestroyed && !proxy.isDestroying) {
        (0, _metal.setProperties)(proxy, {
          reason: reason,
          isRejected: true
        });
      }

      throw reason;
    }, 'Ember: PromiseProxy');
  }
  /**
    A low level mixin making ObjectProxy promise-aware.
  
    ```javascript
    import { resolve } from 'rsvp';
    import $ from 'jquery';
    import ObjectProxy from '@ember/object/proxy';
    import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
  
    let ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);
  
    let proxy = ObjectPromiseProxy.create({
      promise: resolve($.getJSON('/some/remote/data.json'))
    });
  
    proxy.then(function(json){
       // the json
    }, function(reason) {
       // the reason why you have no json
    });
    ```
  
    the proxy has bindable attributes which
    track the promises life cycle
  
    ```javascript
    proxy.get('isPending')   //=> true
    proxy.get('isSettled')  //=> false
    proxy.get('isRejected')  //=> false
    proxy.get('isFulfilled') //=> false
    ```
  
    When the $.getJSON completes, and the promise is fulfilled
    with json, the life cycle attributes will update accordingly.
    Note that $.getJSON doesn't return an ECMA specified promise,
    it is useful to wrap this with an `RSVP.resolve` so that it behaves
    as a spec compliant promise.
  
    ```javascript
    proxy.get('isPending')   //=> false
    proxy.get('isSettled')   //=> true
    proxy.get('isRejected')  //=> false
    proxy.get('isFulfilled') //=> true
    ```
  
    As the proxy is an ObjectProxy, and the json now its content,
    all the json properties will be available directly from the proxy.
  
    ```javascript
    // Assuming the following json:
    {
      firstName: 'Stefan',
      lastName: 'Penner'
    }
  
    // both properties will accessible on the proxy
    proxy.get('firstName') //=> 'Stefan'
    proxy.get('lastName')  //=> 'Penner'
    ```
  
    @class PromiseProxyMixin
    @public
  */


  var _default = _metal.Mixin.create({
    /**
      If the proxied promise is rejected this will contain the reason
      provided.
       @property reason
      @default null
      @public
    */
    reason: null,

    /**
      Once the proxied promise has settled this will become `false`.
       @property isPending
      @default true
      @public
    */
    isPending: (0, _metal.computed)('isSettled', function () {
      return !(0, _metal.get)(this, 'isSettled');
    }).readOnly(),

    /**
      Once the proxied promise has settled this will become `true`.
       @property isSettled
      @default false
      @public
    */
    isSettled: (0, _metal.computed)('isRejected', 'isFulfilled', function () {
      return (0, _metal.get)(this, 'isRejected') || (0, _metal.get)(this, 'isFulfilled');
    }).readOnly(),

    /**
      Will become `true` if the proxied promise is rejected.
       @property isRejected
      @default false
      @public
    */
    isRejected: false,

    /**
      Will become `true` if the proxied promise is fulfilled.
       @property isFulfilled
      @default false
      @public
    */
    isFulfilled: false,

    /**
      The promise whose fulfillment value is being proxied by this object.
       This property must be specified upon creation, and should not be
      changed once created.
       Example:
       ```javascript
      import ObjectProxy from '@ember/object/proxy';
      import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
       ObjectProxy.extend(PromiseProxyMixin).create({
        promise: <thenable>
      });
      ```
       @property promise
      @public
    */
    promise: (0, _metal.computed)({
      get: function get() {
        throw new _error.default("PromiseProxy's promise must be set");
      },
      set: function set(key, promise) {
        return tap(this, promise);
      }
    }),

    /**
      An alias to the proxied promise's `then`.
       See RSVP.Promise.then.
       @method then
      @param {Function} callback
      @return {RSVP.Promise}
      @public
    */
    then: promiseAlias('then'),

    /**
      An alias to the proxied promise's `catch`.
       See RSVP.Promise.catch.
       @method catch
      @param {Function} callback
      @return {RSVP.Promise}
      @since 1.3.0
      @public
    */
    catch: promiseAlias('catch'),

    /**
      An alias to the proxied promise's `finally`.
       See RSVP.Promise.finally.
       @method finally
      @param {Function} callback
      @return {RSVP.Promise}
      @since 1.3.0
      @public
    */
    finally: promiseAlias('finally')
  });

  _exports.default = _default;

  function promiseAlias(name) {
    return function () {
      var promise = (0, _metal.get)(this, 'promise');
      return promise[name].apply(promise, arguments);
    };
  }
});