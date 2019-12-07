define("@ember/-internals/metal/index", ["exports", "ember-babel", "@ember/polyfills", "@ember/-internals/meta", "@ember/-internals/utils", "@ember/debug", "@ember/runloop", "@glimmer/reference", "@ember/-internals/environment", "@ember/error", "ember/version", "@ember/deprecated-features", "@ember/-internals/owner"], function (_exports, _emberBabel, _polyfills, _meta2, _utils, _debug, _runloop, _reference, _environment, _error, _version, _deprecatedFeatures, _owner) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.computed = computed;
  _exports.isComputed = isComputed;
  _exports.getCacheFor = getCacheFor;
  _exports.getCachedValueFor = getCachedValueFor;
  _exports.peekCacheFor = peekCacheFor;
  _exports.alias = alias;
  _exports.deprecateProperty = deprecateProperty;
  _exports._getPath = _getPath;
  _exports.get = _get2;
  _exports.getWithDefault = getWithDefault;
  _exports.set = _set2;
  _exports.trySet = trySet;
  _exports.objectAt = objectAt;
  _exports.replace = replace;
  _exports.replaceInNativeArray = replaceInNativeArray;
  _exports.addArrayObserver = addArrayObserver;
  _exports.removeArrayObserver = removeArrayObserver;
  _exports.arrayContentWillChange = arrayContentWillChange;
  _exports.arrayContentDidChange = arrayContentDidChange;
  _exports.eachProxyFor = eachProxyFor;
  _exports.eachProxyArrayWillChange = eachProxyArrayWillChange;
  _exports.eachProxyArrayDidChange = eachProxyArrayDidChange;
  _exports.addListener = addListener;
  _exports.hasListeners = hasListeners;
  _exports.on = on;
  _exports.removeListener = removeListener;
  _exports.sendEvent = sendEvent;
  _exports.isNone = isNone;
  _exports.isEmpty = isEmpty;
  _exports.isBlank = isBlank;
  _exports.isPresent = isPresent;
  _exports.beginPropertyChanges = beginPropertyChanges;
  _exports.changeProperties = changeProperties;
  _exports.endPropertyChanges = endPropertyChanges;
  _exports.notifyPropertyChange = notifyPropertyChange;
  _exports.overrideChains = overrideChains;
  _exports.defineProperty = defineProperty;
  _exports.isElementDescriptor = isElementDescriptor;
  _exports.nativeDescDecorator = nativeDescDecorator;
  _exports.descriptorForDecorator = descriptorForDecorator;
  _exports.descriptorForProperty = descriptorForProperty;
  _exports.isClassicDecorator = isClassicDecorator;
  _exports.setClassicDecorator = setClassicDecorator;
  _exports.watchKey = watchKey;
  _exports.unwatchKey = unwatchKey;
  _exports.finishChains = finishChains;
  _exports.removeChainWatcher = removeChainWatcher;
  _exports.getChainTagsForKey = getChainTagsForKey;
  _exports.watchPath = watchPath;
  _exports.unwatchPath = unwatchPath;
  _exports.isWatching = isWatching;
  _exports.unwatch = unwatch;
  _exports.watch = watch;
  _exports.watcherCount = watcherCount;
  _exports.getProperties = getProperties;
  _exports.setProperties = setProperties;
  _exports.expandProperties = expandProperties;
  _exports.addObserver = addObserver;
  _exports.activateObserver = activateObserver;
  _exports.removeObserver = removeObserver;
  _exports.flushAsyncObservers = flushAsyncObservers;
  _exports.mixin = mixin;
  _exports.observer = observer;
  _exports.applyMixin = applyMixin;
  _exports.inject = inject;
  _exports.tagForProperty = tagForProperty;
  _exports.tagFor = tagFor;
  _exports.markObjectAsDirty = markObjectAsDirty;
  _exports.consume = consume;
  _exports.tracked = tracked;
  _exports.track = track;
  _exports.untrack = untrack;
  _exports.isTracking = isTracking;
  _exports.addNamespace = addNamespace;
  _exports.classToString = classToString;
  _exports.findNamespace = findNamespace;
  _exports.findNamespaces = findNamespaces;
  _exports.processNamespace = processNamespace;
  _exports.processAllNamespaces = processAllNamespaces;
  _exports.removeNamespace = removeNamespace;
  _exports.isNamespaceSearchDisabled = isSearchDisabled;
  _exports.setNamespaceSearchDisabled = setSearchDisabled;
  _exports.NAMESPACES_BY_ID = _exports.NAMESPACES = _exports.Tracker = _exports.assertNotRendered = _exports.didRender = _exports.runInTransaction = _exports.UNKNOWN_PROPERTY_TAG = _exports.DEBUG_INJECTION_FUNCTIONS = _exports.aliasMethod = _exports.Mixin = _exports.Libraries = _exports.libraries = _exports.ARGS_PROXY_TAGS = _exports.ChainNode = _exports.PROPERTY_DID_CHANGE = _exports.PROXY_CONTENT = _exports.ComputedProperty = _exports._globalsComputed = void 0;
  var COMPUTED_PROPERTY_CACHED_VALUES = new WeakMap();
  var COMPUTED_PROPERTY_LAST_REVISION = new WeakMap();

  function getCacheFor(obj) {
    var cache = COMPUTED_PROPERTY_CACHED_VALUES.get(obj);

    if (cache === undefined) {
      cache = new Map();
      COMPUTED_PROPERTY_CACHED_VALUES.set(obj, cache);
    }

    return cache;
  }
  /**
    Returns the cached value for a property, if one exists.
    This can be useful for peeking at the value of a computed
    property that is generated lazily, without accidentally causing
    it to be created.
  
    @method cacheFor
    @static
    @for @ember/object/internals
    @param {Object} obj the object whose property you want to check
    @param {String} key the name of the property whose cached value you want
      to return
    @return {Object} the cached value
    @public
  */


  function getCachedValueFor(obj, key) {
    var cache = COMPUTED_PROPERTY_CACHED_VALUES.get(obj);

    if (cache !== undefined) {
      return cache.get(key);
    }
  }

  var setLastRevisionFor;
  var getLastRevisionFor;
  {
    setLastRevisionFor = function setLastRevisionFor(obj, key, revision) {
      var cache = COMPUTED_PROPERTY_LAST_REVISION.get(obj);

      if (cache === undefined) {
        cache = new Map();
        COMPUTED_PROPERTY_LAST_REVISION.set(obj, cache);
      }

      cache.set(key, revision);
    };

    getLastRevisionFor = function getLastRevisionFor(obj, key) {
      var cache = COMPUTED_PROPERTY_LAST_REVISION.get(obj);

      if (cache === undefined) {
        return 0;
      } else {
        var revision = cache.get(key);
        return revision === undefined ? 0 : revision;
      }
    };
  }

  function peekCacheFor(obj) {
    return COMPUTED_PROPERTY_CACHED_VALUES.get(obj);
  }

  var EACH_PROXIES = new WeakMap();

  function eachProxyArrayWillChange(array, idx, removedCnt, addedCnt) {
    var eachProxy = EACH_PROXIES.get(array);

    if (eachProxy !== undefined) {
      eachProxy.arrayWillChange(array, idx, removedCnt, addedCnt);
    }
  }

  function eachProxyArrayDidChange(array, idx, removedCnt, addedCnt) {
    var eachProxy = EACH_PROXIES.get(array);

    if (eachProxy !== undefined) {
      eachProxy.arrayDidChange(array, idx, removedCnt, addedCnt);
    }
  }
  /**
  @module @ember/object
  */

  /*
    The event system uses a series of nested hashes to store listeners on an
    object. When a listener is registered, or when an event arrives, these
    hashes are consulted to determine which target and action pair to invoke.
  
    The hashes are stored in the object's meta hash, and look like this:
  
        // Object's meta hash
        {
          listeners: {       // variable name: `listenerSet`
            "foo:change": [ // variable name: `actions`
              target, method, once
            ]
          }
        }
  
  */

  /**
    Add an event listener
  
    @method addListener
    @static
    @for @ember/object/events
    @param obj
    @param {String} eventName
    @param {Object|Function} target A target object or a function
    @param {Function|String} method A function or the name of a function to be called on `target`
    @param {Boolean} once A flag whether a function should only be called once
    @public
  */


  function addListener(obj, eventName, target, method, once, sync) {
    if (sync === void 0) {
      sync = true;
    }

    (false && !(Boolean(obj) && Boolean(eventName)) && (0, _debug.assert)('You must pass at least an object and event name to addListener', Boolean(obj) && Boolean(eventName)));

    if (!method && 'function' === typeof target) {
      method = target;
      target = null;
    }

    (0, _meta2.meta)(obj).addToListeners(eventName, target, method, once === true, sync);
  }
  /**
    Remove an event listener
  
    Arguments should match those passed to `addListener`.
  
    @method removeListener
    @static
    @for @ember/object/events
    @param obj
    @param {String} eventName
    @param {Object|Function} target A target object or a function
    @param {Function|String} method A function or the name of a function to be called on `target`
    @public
  */


  function removeListener(obj, eventName, targetOrFunction, functionOrName) {
    (false && !(Boolean(obj) && Boolean(eventName) && (typeof targetOrFunction === 'function' || typeof targetOrFunction === 'object' && Boolean(functionOrName))) && (0, _debug.assert)('You must pass at least an object, event name, and method or target and method/method name to removeListener', Boolean(obj) && Boolean(eventName) && (typeof targetOrFunction === 'function' || typeof targetOrFunction === 'object' && Boolean(functionOrName))));
    var target, method;

    if (typeof targetOrFunction === 'object') {
      target = targetOrFunction;
      method = functionOrName;
    } else {
      target = null;
      method = targetOrFunction;
    }

    var m = (0, _meta2.meta)(obj);
    m.removeFromListeners(eventName, target, method);
  }
  /**
    Send an event. The execution of suspended listeners
    is skipped, and once listeners are removed. A listener without
    a target is executed on the passed object. If an array of actions
    is not passed, the actions stored on the passed object are invoked.
  
    @method sendEvent
    @static
    @for @ember/object/events
    @param obj
    @param {String} eventName
    @param {Array} params Optional parameters for each listener.
    @return {Boolean} if the event was delivered to one or more actions
    @public
  */


  function sendEvent(obj, eventName, params, actions, _meta) {
    if (actions === undefined) {
      var meta$$1 = _meta === undefined ? (0, _meta2.peekMeta)(obj) : _meta;
      actions = typeof meta$$1 === 'object' && meta$$1 !== null ? meta$$1.matchingListeners(eventName) : undefined;
    }

    if (actions === undefined || actions.length === 0) {
      return false;
    }

    for (var i = actions.length - 3; i >= 0; i -= 3) {
      // looping in reverse for once listeners
      var target = actions[i];
      var method = actions[i + 1];
      var once = actions[i + 2];

      if (!method) {
        continue;
      }

      if (once) {
        removeListener(obj, eventName, target, method);
      }

      if (!target) {
        target = obj;
      }

      if ('string' === typeof method) {
        method = target[method];
      }

      method.apply(target, params);
    }

    return true;
  }
  /**
    @private
    @method hasListeners
    @static
    @for @ember/object/events
    @param obj
    @param {String} eventName
    @return {Boolean} if `obj` has listeners for event `eventName`
  */


  function hasListeners(obj, eventName) {
    var meta$$1 = (0, _meta2.peekMeta)(obj);

    if (meta$$1 === null) {
      return false;
    }

    var matched = meta$$1.matchingListeners(eventName);
    return matched !== undefined && matched.length > 0;
  }
  /**
    Define a property as a function that should be executed when
    a specified event or events are triggered.
  
    ``` javascript
    import EmberObject from '@ember/object';
    import { on } from '@ember/object/evented';
    import { sendEvent } from '@ember/object/events';
  
    let Job = EmberObject.extend({
      logCompleted: on('completed', function() {
        console.log('Job completed!');
      })
    });
  
    let job = Job.create();
  
    sendEvent(job, 'completed'); // Logs 'Job completed!'
   ```
  
    @method on
    @static
    @for @ember/object/evented
    @param {String} eventNames*
    @param {Function} func
    @return {Function} the listener function, passed as last argument to on(...)
    @public
  */


  function on() {
    for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var func = args.pop();
    var events = args;
    (false && !(typeof func === 'function') && (0, _debug.assert)('on expects function as last argument', typeof func === 'function'));
    (false && !(events.length > 0 && events.every(function (p) {
      return typeof p === 'string' && p.length > 0;
    })) && (0, _debug.assert)('on called without valid event names', events.length > 0 && events.every(function (p) {
      return typeof p === 'string' && p.length > 0;
    })));
    (0, _utils.setListeners)(func, events);
    return func;
  }

  var AFTER_OBSERVERS = ':change';

  function changeEvent(keyName) {
    return keyName + AFTER_OBSERVERS;
  }

  var DECORATOR_DESCRIPTOR_MAP = new WeakMap();
  /**
    Returns the CP descriptor assocaited with `obj` and `keyName`, if any.
  
    @method descriptorForProperty
    @param {Object} obj the object to check
    @param {String} keyName the key to check
    @return {Descriptor}
    @private
  */

  function descriptorForProperty(obj, keyName, _meta) {
    (false && !(obj !== null) && (0, _debug.assert)('Cannot call `descriptorForProperty` on null', obj !== null));
    (false && !(obj !== undefined) && (0, _debug.assert)('Cannot call `descriptorForProperty` on undefined', obj !== undefined));
    (false && !(typeof obj === 'object' || typeof obj === 'function') && (0, _debug.assert)("Cannot call `descriptorForProperty` on " + typeof obj, typeof obj === 'object' || typeof obj === 'function'));
    var meta$$1 = _meta === undefined ? (0, _meta2.peekMeta)(obj) : _meta;

    if (meta$$1 !== null) {
      return meta$$1.peekDescriptors(keyName);
    }
  }

  function descriptorForDecorator(dec) {
    return DECORATOR_DESCRIPTOR_MAP.get(dec);
  }
  /**
    Check whether a value is a decorator
  
    @method isClassicDecorator
    @param {any} possibleDesc the value to check
    @return {boolean}
    @private
  */


  function isClassicDecorator(dec) {
    return dec !== null && dec !== undefined && DECORATOR_DESCRIPTOR_MAP.has(dec);
  }
  /**
    Set a value as a decorator
  
    @method setClassicDecorator
    @param {function} decorator the value to mark as a decorator
    @private
  */


  function setClassicDecorator(dec, value$$1) {
    if (value$$1 === void 0) {
      value$$1 = true;
    }

    DECORATOR_DESCRIPTOR_MAP.set(dec, value$$1);
  }

  var firstDotIndexCache = new _utils.Cache(1000, function (key) {
    return key.indexOf('.');
  });

  function isPath(path) {
    return typeof path === 'string' && firstDotIndexCache.get(path) !== -1;
  }
  /**
  @module @ember/object
  */
  // DEFINING PROPERTIES API
  //


  function MANDATORY_SETTER_FUNCTION(name) {
    function SETTER_FUNCTION(value$$1) {
      var m = (0, _meta2.peekMeta)(this);

      if (m.isInitializing() || m.isPrototypeMeta(this)) {
        m.writeValues(name, value$$1);
      } else {
        (false && !(false) && (0, _debug.assert)("You must use set() to set the `" + name + "` property (of " + this + ") to `" + value$$1 + "`.", false));
      }
    }

    return (0, _polyfills.assign)(SETTER_FUNCTION, {
      isMandatorySetter: true
    });
  }

  function DEFAULT_GETTER_FUNCTION(name) {
    return function GETTER_FUNCTION() {
      var meta$$1 = (0, _meta2.peekMeta)(this);

      if (meta$$1 !== null) {
        return meta$$1.peekValues(name);
      }
    };
  }

  function INHERITING_GETTER_FUNCTION(name) {
    function IGETTER_FUNCTION() {
      var meta$$1 = (0, _meta2.peekMeta)(this);
      var val;

      if (meta$$1 !== null) {
        val = meta$$1.readInheritedValue(name);

        if (val === undefined) {
          var proto = Object.getPrototypeOf(this);
          val = proto === null ? undefined : proto[name];
        } else {
          val = val === _meta2.UNDEFINED ? undefined : val;
        }
      }

      return val;
    }

    return (0, _polyfills.assign)(IGETTER_FUNCTION, {
      isInheritingGetter: true
    });
  }
  /**
    NOTE: This is a low-level method used by other parts of the API. You almost
    never want to call this method directly. Instead you should use
    `mixin()` to define new properties.
  
    Defines a property on an object. This method works much like the ES5
    `Object.defineProperty()` method except that it can also accept computed
    properties and other special descriptors.
  
    Normally this method takes only three parameters. However if you pass an
    instance of `Descriptor` as the third param then you can pass an
    optional value as the fourth parameter. This is often more efficient than
    creating new descriptor hashes for each property.
  
    ## Examples
  
    ```javascript
    import { defineProperty, computed } from '@ember/object';
  
    // ES5 compatible mode
    defineProperty(contact, 'firstName', {
      writable: true,
      configurable: false,
      enumerable: true,
      value: 'Charles'
    });
  
    // define a simple property
    defineProperty(contact, 'lastName', undefined, 'Jolley');
  
    // define a computed property
    defineProperty(contact, 'fullName', computed('firstName', 'lastName', function() {
      return this.firstName+' '+this.lastName;
    }));
    ```
  
    @public
    @method defineProperty
    @static
    @for @ember/object
    @param {Object} obj the object to define this property on. This may be a prototype.
    @param {String} keyName the name of the property
    @param {Descriptor} [desc] an instance of `Descriptor` (typically a
      computed property) or an ES5 descriptor.
      You must provide this or `data` but not both.
    @param {*} [data] something other than a descriptor, that will
      become the explicit value of this property.
  */


  function defineProperty(obj, keyName, desc, data, meta$$1) {
    if (meta$$1 === undefined) {
      meta$$1 = (0, _meta2.meta)(obj);
    }

    var watching = meta$$1.peekWatching(keyName) > 0;
    var previousDesc = descriptorForProperty(obj, keyName, meta$$1);
    var wasDescriptor = previousDesc !== undefined;

    if (wasDescriptor) {
      previousDesc.teardown(obj, keyName, meta$$1);
    } // used to track if the the property being defined be enumerable


    var enumerable = true; // Ember.NativeArray is a normal Ember.Mixin that we mix into `Array.prototype` when prototype extensions are enabled
    // mutating a native object prototype like this should _not_ result in enumerable properties being added (or we have significant
    // issues with things like deep equality checks from test frameworks, or things like jQuery.extend(true, [], [])).
    //
    // this is a hack, and we should stop mutating the array prototype by default 😫

    if (obj === Array.prototype) {
      enumerable = false;
    }

    var value$$1;

    if (isClassicDecorator(desc)) {
      var propertyDesc;

      if (false
      /* DEBUG */
      ) {
        propertyDesc = desc(obj, keyName, undefined, meta$$1, true);
      } else {
        propertyDesc = desc(obj, keyName, undefined, meta$$1);
      }

      Object.defineProperty(obj, keyName, propertyDesc); // pass the decorator function forward for backwards compat

      value$$1 = desc;
    } else if (desc === undefined || desc === null) {
      value$$1 = data;

      if (false
      /* DEBUG */
      && watching) {
        meta$$1.writeValues(keyName, data);
        var defaultDescriptor = {
          configurable: true,
          enumerable: enumerable,
          set: MANDATORY_SETTER_FUNCTION(keyName),
          get: DEFAULT_GETTER_FUNCTION(keyName)
        };
        Object.defineProperty(obj, keyName, defaultDescriptor);
      } else if (wasDescriptor || enumerable === false) {
        Object.defineProperty(obj, keyName, {
          configurable: true,
          enumerable: enumerable,
          writable: true,
          value: value$$1
        });
      } else {
        if (true
        /* EMBER_METAL_TRACKED_PROPERTIES */
        && false
        /* DEBUG */
        ) {
          (0, _utils.setWithMandatorySetter)(obj, keyName, data);
        } else {
          obj[keyName] = data;
        }
      }
    } else {
      value$$1 = desc; // fallback to ES5

      Object.defineProperty(obj, keyName, desc);
    } // if key is being watched, override chains that
    // were initialized with the prototype


    {
      if (!meta$$1.isPrototypeMeta(obj)) {
        revalidateObservers(obj);
      }
    } // The `value` passed to the `didDefineProperty` hook is
    // either the descriptor or data, whichever was passed.

    if (typeof obj.didDefineProperty === 'function') {
      obj.didDefineProperty(obj, keyName, value$$1);
    }
  }

  var handleMandatorySetter;

  function watchKey(obj, keyName, _meta) {
    var meta$$1 = _meta === undefined ? (0, _meta2.meta)(obj) : _meta;
    var count = meta$$1.peekWatching(keyName);
    meta$$1.writeWatching(keyName, count + 1);

    if (count === 0) {
      // activate watching first time
      var possibleDesc = descriptorForProperty(obj, keyName, meta$$1);

      if (possibleDesc !== undefined && possibleDesc.willWatch !== undefined) {
        possibleDesc.willWatch(obj, keyName, meta$$1);
      }

      if (false
      /* DEBUG */
      ) {
        // NOTE: this is dropped for prod + minified builds
        handleMandatorySetter(meta$$1, obj, keyName);
      }
    }
  }

  if (false
  /* DEBUG */
  ) {
    var _hasOwnProperty = function _hasOwnProperty(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    };

    var _propertyIsEnumerable = function _propertyIsEnumerable(obj, key) {
      return Object.prototype.propertyIsEnumerable.call(obj, key);
    }; // Future traveler, although this code looks scary. It merely exists in
    // development to aid in development asertions. Production builds of
    // ember strip this entire block out


    handleMandatorySetter = function handleMandatorySetter(m, obj, keyName) {
      var descriptor = (0, _utils.lookupDescriptor)(obj, keyName);
      var hasDescriptor = descriptor !== null;
      var possibleDesc = hasDescriptor && descriptor.value;

      if (isClassicDecorator(possibleDesc)) {
        return;
      }

      var configurable = hasDescriptor ? descriptor.configurable : true;
      var isWritable = hasDescriptor ? descriptor.writable : true;
      var hasValue = hasDescriptor ? 'value' in descriptor : true; // this x in Y deopts, so keeping it in this function is better;

      if (configurable && isWritable && hasValue && keyName in obj) {
        var desc = {
          configurable: true,
          set: MANDATORY_SETTER_FUNCTION(keyName),
          enumerable: _propertyIsEnumerable(obj, keyName),
          get: undefined
        };

        if (_hasOwnProperty(obj, keyName)) {
          m.writeValues(keyName, obj[keyName]);
          desc.get = DEFAULT_GETTER_FUNCTION(keyName);
        } else {
          desc.get = INHERITING_GETTER_FUNCTION(keyName);
        }

        Object.defineProperty(obj, keyName, desc);
      }
    };
  }

  function unwatchKey(obj, keyName, _meta) {
    var meta$$1 = _meta === undefined ? (0, _meta2.peekMeta)(obj) : _meta; // do nothing of this object has already been destroyed

    if (meta$$1 === null || meta$$1.isSourceDestroyed()) {
      return;
    }

    var count = meta$$1.peekWatching(keyName);

    if (count === 1) {
      meta$$1.writeWatching(keyName, 0);
      var possibleDesc = descriptorForProperty(obj, keyName, meta$$1);
      var isDescriptor = possibleDesc !== undefined;

      if (isDescriptor && possibleDesc.didUnwatch !== undefined) {
        possibleDesc.didUnwatch(obj, keyName, meta$$1);
      }

      if (typeof obj.didUnwatchProperty === 'function') {
        obj.didUnwatchProperty(keyName);
      }

      if (false
      /* DEBUG */
      ) {
        // It is true, the following code looks quite WAT. But have no fear, It
        // exists purely to improve development ergonomics and is removed from
        // ember.min.js and ember.prod.js builds.
        //
        // Some further context: Once a property is watched by ember, bypassing `set`
        // for mutation, will bypass observation. This code exists to assert when
        // that occurs, and attempt to provide more helpful feedback. The alternative
        // is tricky to debug partially observable properties.
        if (!isDescriptor && keyName in obj) {
          var maybeMandatoryDescriptor = (0, _utils.lookupDescriptor)(obj, keyName);

          if (maybeMandatoryDescriptor && maybeMandatoryDescriptor.set && maybeMandatoryDescriptor.set.isMandatorySetter) {
            if (maybeMandatoryDescriptor.get && maybeMandatoryDescriptor.get.isInheritingGetter) {
              var possibleValue = meta$$1.readInheritedValue(keyName);

              if (possibleValue === undefined) {
                delete obj[keyName];
                return;
              }
            }

            Object.defineProperty(obj, keyName, {
              configurable: true,
              enumerable: Object.prototype.propertyIsEnumerable.call(obj, keyName),
              writable: true,
              value: meta$$1.peekValues(keyName)
            });
            meta$$1.deleteFromValues(keyName);
          }
        }
      }
    } else if (count > 1) {
      meta$$1.writeWatching(keyName, count - 1);
    }
  }

  function eachProxyFor(array) {
    var eachProxy = EACH_PROXIES.get(array);

    if (eachProxy === undefined) {
      eachProxy = new EachProxy(array);
      EACH_PROXIES.set(array, eachProxy);
    }

    return eachProxy;
  }

  var EachProxy =
  /*#__PURE__*/
  function () {
    function EachProxy(content) {
      this._content = content;
      this._keys = undefined;
      (0, _meta2.meta)(this);
    } // ..........................................................
    // ARRAY CHANGES
    // Invokes whenever the content array itself changes.


    var _proto = EachProxy.prototype;

    _proto.arrayWillChange = function arrayWillChange(content, idx, removedCnt
    /*, addedCnt */
    ) {
      // eslint-disable-line no-unused-vars
      var keys = this._keys;

      if (!keys) {
        return;
      }

      var lim = removedCnt > 0 ? idx + removedCnt : -1;

      if (lim > 0) {
        for (var key in keys) {
          removeObserverForContentKey(content, key, this, idx, lim);
        }
      }
    };

    _proto.arrayDidChange = function arrayDidChange(content, idx, _removedCnt, addedCnt) {
      var keys = this._keys;

      if (!keys) {
        return;
      }

      var lim = addedCnt > 0 ? idx + addedCnt : -1;
      var meta$$1 = (0, _meta2.peekMeta)(this);

      for (var key in keys) {
        if (lim > 0) {
          addObserverForContentKey(content, key, this, idx, lim);
        }

        notifyPropertyChange(this, key, meta$$1);
      }
    } // ..........................................................
    // LISTEN FOR NEW OBSERVERS AND OTHER EVENT LISTENERS
    // Start monitoring keys based on who is listening...
    ;

    _proto.willWatchProperty = function willWatchProperty(property) {
      this.beginObservingContentKey(property);
    };

    _proto.didUnwatchProperty = function didUnwatchProperty(property) {
      this.stopObservingContentKey(property);
    } // ..........................................................
    // CONTENT KEY OBSERVING
    // Actual watch keys on the source content.
    ;

    _proto.beginObservingContentKey = function beginObservingContentKey(keyName) {
      var keys = this._keys;

      if (keys === undefined) {
        keys = this._keys = Object.create(null);
      }

      if (!keys[keyName]) {
        keys[keyName] = 1;
        var content = this._content;
        var len = content.length;
        addObserverForContentKey(content, keyName, this, 0, len);
      } else {
        keys[keyName]++;
      }
    };

    _proto.stopObservingContentKey = function stopObservingContentKey(keyName) {
      var keys = this._keys;

      if (keys !== undefined && keys[keyName] > 0 && --keys[keyName] <= 0) {
        var content = this._content;
        var len = content.length;
        removeObserverForContentKey(content, keyName, this, 0, len);
      }
    };

    _proto.contentKeyDidChange = function contentKeyDidChange(_obj, keyName) {
      notifyPropertyChange(this, keyName);
    };

    return EachProxy;
  }();

  function addObserverForContentKey(content, keyName, proxy, idx, loc) {
    while (--loc >= idx) {
      var item = objectAt(content, loc);

      if (item) {
        (false && !(typeof item === 'object') && (0, _debug.assert)("When using @each to observe the array `" + content.toString() + "`, the array must return an object", typeof item === 'object'));
        addObserver(item, keyName, proxy, 'contentKeyDidChange');
      }
    }
  }

  function removeObserverForContentKey(content, keyName, proxy, idx, loc) {
    while (--loc >= idx) {
      var item = objectAt(content, loc);

      if (item) {
        removeObserver(item, keyName, proxy, 'contentKeyDidChange');
      }
    }
  }

  var UNKNOWN_PROPERTY_TAG = (0, _utils.symbol)('UNKNOWN_PROPERTY_TAG');
  _exports.UNKNOWN_PROPERTY_TAG = UNKNOWN_PROPERTY_TAG;

  function tagForProperty(object, propertyKey, _meta) {
    var objectType = typeof object;

    if (objectType !== 'function' && (objectType !== 'object' || object === null)) {
      return _reference.CONSTANT_TAG;
    }

    var meta$$1 = _meta === undefined ? (0, _meta2.meta)(object) : _meta;
    {
      if (!(propertyKey in object) && typeof object[UNKNOWN_PROPERTY_TAG] === 'function') {
        return object[UNKNOWN_PROPERTY_TAG](propertyKey);
      }
    }
    var tags = meta$$1.writableTags();
    var tag = tags[propertyKey];

    if (tag) {
      return tag;
    }

    {
      var newTag = (0, _reference.createUpdatableTag)();

      if (false
      /* DEBUG */
      ) {
        {
          (0, _utils.setupMandatorySetter)(object, propertyKey);
        }
        newTag._propertyKey = propertyKey;
      }

      return tags[propertyKey] = newTag;
    }
  }

  function tagFor(object, _meta) {
    if (typeof object === 'object' && object !== null) {
      var meta$$1 = _meta === undefined ? (0, _meta2.meta)(object) : _meta;

      if (!meta$$1.isMetaDestroyed()) {
        return meta$$1.writableTag();
      }
    }

    return _reference.CONSTANT_TAG;
  }

  function markObjectAsDirty(obj, propertyKey, _meta) {
    var meta$$1 = _meta === undefined ? (0, _meta2.meta)(obj) : _meta;
    var objectTag = meta$$1.readableTag();

    if (objectTag !== undefined) {
      (0, _reference.dirty)(objectTag);
    }

    var tags = meta$$1.readableTags();
    var propertyTag = tags !== undefined ? tags[propertyKey] : undefined;

    if (propertyTag !== undefined) {
      (0, _reference.dirty)(propertyTag);
    }

    if (objectTag !== undefined || propertyTag !== undefined) {
      ensureRunloop();
    }
  }

  function ensureRunloop() {
    _runloop.backburner.ensureInstance();
  }

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
  } // ..........................................................
  // DEPENDENT KEYS
  //


  function addDependentKeys(desc, obj, keyName, meta$$1) {
    // the descriptor has a list of dependent keys, so
    // add all of its dependent keys.
    var depKeys = desc._dependentKeys;

    if (depKeys === null || depKeys === undefined) {
      return;
    }

    for (var idx = 0; idx < depKeys.length; idx++) {
      var depKey = depKeys[idx]; // Increment the number of times depKey depends on keyName.

      meta$$1.writeDeps(depKey, keyName, meta$$1.peekDeps(depKey, keyName) + 1); // Watch the depKey

      watch(obj, depKey, meta$$1);
    }
  }

  function removeDependentKeys(desc, obj, keyName, meta$$1) {
    // the descriptor has a list of dependent keys, so
    // remove all of its dependent keys.
    var depKeys = desc._dependentKeys;

    if (depKeys === null || depKeys === undefined) {
      return;
    }

    for (var idx = 0; idx < depKeys.length; idx++) {
      var depKey = depKeys[idx]; // Decrement the number of times depKey depends on keyName.

      meta$$1.writeDeps(depKey, keyName, meta$$1.peekDeps(depKey, keyName) - 1); // Unwatch the depKey

      unwatch(obj, depKey, meta$$1);
    }
  }

  function nativeDescDecorator(propertyDesc) {
    var decorator = function decorator() {
      return propertyDesc;
    };

    setClassicDecorator(decorator);
    return decorator;
  }
  /**
    Objects of this type can implement an interface to respond to requests to
    get and set. The default implementation handles simple properties.
  
    @class Descriptor
    @private
  */


  var ComputedDescriptor =
  /*#__PURE__*/
  function () {
    function ComputedDescriptor() {
      this.enumerable = true;
      this.configurable = true;
      this._dependentKeys = undefined;
      this._meta = undefined;
    }

    var _proto2 = ComputedDescriptor.prototype;

    _proto2.setup = function setup(_obj, keyName, _propertyDesc, meta$$1) {
      meta$$1.writeDescriptors(keyName, this);
    };

    _proto2.teardown = function teardown(_obj, keyName, meta$$1) {
      meta$$1.removeDescriptors(keyName);
    };

    return ComputedDescriptor;
  }();

  function DESCRIPTOR_GETTER_FUNCTION(name, descriptor) {
    return function CPGETTER_FUNCTION() {
      return descriptor.get(this, name);
    };
  }

  function DESCRIPTOR_SETTER_FUNCTION(name, descriptor) {
    var func = function CPSETTER_FUNCTION(value$$1) {
      return descriptor.set(this, name, value$$1);
    };

    CP_SETTER_FUNCS.add(func);
    return func;
  }

  var CP_SETTER_FUNCS = new _polyfills._WeakSet();

  function makeComputedDecorator(desc, DecoratorClass) {
    var decorator = function COMPUTED_DECORATOR(target, key, propertyDesc, maybeMeta, isClassicDecorator$$1) {
      (false && !(isClassicDecorator$$1 || !propertyDesc || !propertyDesc.get || propertyDesc.get.toString().indexOf('CPGETTER_FUNCTION') === -1) && (0, _debug.assert)("Only one computed property decorator can be applied to a class field or accessor, but '" + key + "' was decorated twice. You may have added the decorator to both a getter and setter, which is unecessary.", isClassicDecorator$$1 || !propertyDesc || !propertyDesc.get || propertyDesc.get.toString().indexOf('CPGETTER_FUNCTION') === -1));
      var meta$$1 = arguments.length === 3 ? (0, _meta2.meta)(target) : maybeMeta;
      desc.setup(target, key, propertyDesc, meta$$1);
      var computedDesc = {
        enumerable: desc.enumerable,
        configurable: desc.configurable,
        get: DESCRIPTOR_GETTER_FUNCTION(key, desc)
      };
      {
        computedDesc.set = DESCRIPTOR_SETTER_FUNCTION(key, desc);
      }
      return computedDesc;
    };

    setClassicDecorator(decorator, desc);
    Object.setPrototypeOf(decorator, DecoratorClass.prototype);
    return decorator;
  }
  /**
    An object that that tracks @tracked properties that were consumed.
  
    @private
  */


  var Tracker =
  /*#__PURE__*/
  function () {
    function Tracker() {
      this.tags = new Set();
      this.last = null;
    }

    var _proto3 = Tracker.prototype;

    _proto3.add = function add(tag) {
      this.tags.add(tag);
      this.last = tag;
    };

    _proto3.combine = function combine() {
      if (this.tags.size === 0) {
        return _reference.CONSTANT_TAG;
      } else if (this.tags.size === 1) {
        return this.last;
      } else {
        var tags = [];
        this.tags.forEach(function (tag) {
          return tags.push(tag);
        });
        return (0, _reference.combine)(tags);
      }
    };

    (0, _emberBabel.createClass)(Tracker, [{
      key: "size",
      get: function get() {
        return this.tags.size;
      }
    }]);
    return Tracker;
  }();

  _exports.Tracker = Tracker;

  function tracked() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
      args[_key3] = arguments[_key3];
    }

    (false && !(!(isElementDescriptor(args.slice(0, 3)) && args.length === 5 && args[4] === true)) && (0, _debug.assert)("@tracked can only be used directly as a native decorator. If you're using tracked in classic classes, add parenthesis to call it like a function: tracked()", !(isElementDescriptor(args.slice(0, 3)) && args.length === 5 && args[4] === true)));

    if (!isElementDescriptor(args)) {
      var propertyDesc = args[0];
      (false && !(args.length === 0 || typeof propertyDesc === 'object' && propertyDesc !== null) && (0, _debug.assert)("tracked() may only receive an options object containing 'value' or 'initializer', received " + propertyDesc, args.length === 0 || typeof propertyDesc === 'object' && propertyDesc !== null));

      if (false
      /* DEBUG */
      && propertyDesc) {
        var keys = Object.keys(propertyDesc);
        (false && !(keys.length <= 1 && (keys[0] === undefined || keys[0] === 'value' || keys[0] === 'initializer')) && (0, _debug.assert)("The options object passed to tracked() may only contain a 'value' or 'initializer' property, not both. Received: [" + keys + "]", keys.length <= 1 && (keys[0] === undefined || keys[0] === 'value' || keys[0] === 'initializer')));
        (false && !(!('initializer' in propertyDesc) || typeof propertyDesc.initializer === 'function') && (0, _debug.assert)("The initializer passed to tracked must be a function. Received " + propertyDesc.initializer, !('initializer' in propertyDesc) || typeof propertyDesc.initializer === 'function'));
      }

      var initializer = propertyDesc ? propertyDesc.initializer : undefined;
      var value$$1 = propertyDesc ? propertyDesc.value : undefined;

      var decorator = function decorator(target, key, _desc, _meta, isClassicDecorator$$1) {
        (false && !(isClassicDecorator$$1) && (0, _debug.assert)("You attempted to set a default value for " + key + " with the @tracked({ value: 'default' }) syntax. You can only use this syntax with classic classes. For native classes, you can use class initializers: @tracked field = 'default';", isClassicDecorator$$1));
        var fieldDesc = {
          initializer: initializer || function () {
            return value$$1;
          }
        };
        return descriptorForField([target, key, fieldDesc]);
      };

      setClassicDecorator(decorator);
      return decorator;
    }

    return descriptorForField(args);
  }

  if (false
  /* DEBUG */
  ) {
    // Normally this isn't a classic decorator, but we want to throw a helpful
    // error in development so we need it to treat it like one
    setClassicDecorator(tracked);
  }

  function descriptorForField(_ref) {
    var _target = _ref[0],
        key = _ref[1],
        desc = _ref[2];
    (false && !(!desc || !desc.value && !desc.get && !desc.set) && (0, _debug.assert)("You attempted to use @tracked on " + key + ", but that element is not a class field. @tracked is only usable on class fields. Native getters and setters will autotrack add any tracked fields they encounter, so there is no need mark getters and setters with @tracked.", !desc || !desc.value && !desc.get && !desc.set));
    var initializer = desc ? desc.initializer : undefined;
    var values = new WeakMap();
    var hasInitializer = typeof initializer === 'function';
    return {
      enumerable: true,
      configurable: true,
      get: function get() {
        var propertyTag = tagForProperty(this, key);
        if (CURRENT_TRACKER) CURRENT_TRACKER.add(propertyTag);
        var value$$1; // If the field has never been initialized, we should initialize it

        if (hasInitializer && !values.has(this)) {
          value$$1 = initializer.call(this);
          values.set(this, value$$1);
        } else {
          value$$1 = values.get(this);
        } // Add the tag of the returned value if it is an array, since arrays
        // should always cause updates if they are consumed and then changed


        if (Array.isArray(value$$1) || (0, _utils.isEmberArray)(value$$1)) {
          (0, _reference.update)(propertyTag, tagForProperty(value$$1, '[]'));
        }

        return value$$1;
      },
      set: function set(newValue) {
        markObjectAsDirty(this, key);
        values.set(this, newValue);

        if (propertyDidChange !== null) {
          propertyDidChange();
        }
      }
    };
  }
  /**
    @private
  
    Whenever a tracked computed property is entered, the current tracker is
    saved off and a new tracker is replaced.
  
    Any tracked properties consumed are added to the current tracker.
  
    When a tracked computed property is exited, the tracker's tags are
    combined and added to the parent tracker.
  
    The consequence is that each tracked computed property has a tag
    that corresponds to the tracked properties consumed inside of
    itself, including child tracked computed properties.
  */


  var CURRENT_TRACKER = null;

  function track(callback) {
    var parent = CURRENT_TRACKER;
    var current = new Tracker();
    CURRENT_TRACKER = current;

    try {
      callback();
    } finally {
      CURRENT_TRACKER = parent;
    }

    return current.combine();
  }

  function consume(tag) {
    if (CURRENT_TRACKER !== null) {
      CURRENT_TRACKER.add(tag);
    }
  }

  function isTracking() {
    return CURRENT_TRACKER !== null;
  }

  function untrack(callback) {
    var parent = CURRENT_TRACKER;
    CURRENT_TRACKER = null;

    try {
      callback();
    } finally {
      CURRENT_TRACKER = parent;
    }
  }

  var propertyDidChange = null;
  /**
  @module @ember/object
  */

  var PROXY_CONTENT = (0, _utils.symbol)('PROXY_CONTENT');
  _exports.PROXY_CONTENT = PROXY_CONTENT;
  var getPossibleMandatoryProxyValue;

  if (false
  /* DEBUG */
  && _utils.HAS_NATIVE_PROXY) {
    getPossibleMandatoryProxyValue = function getPossibleMandatoryProxyValue(obj, keyName) {
      var content = obj[PROXY_CONTENT];

      if (content === undefined) {
        return obj[keyName];
      } else {
        /* global Reflect */
        return Reflect.get(content, keyName, obj);
      }
    };
  } // ..........................................................
  // GET AND SET
  //
  // If we are on a platform that supports accessors we can use those.
  // Otherwise simulate accessors by looking up the property directly on the
  // object.

  /**
    Gets the value of a property on an object. If the property is computed,
    the function will be invoked. If the property is not defined but the
    object implements the `unknownProperty` method then that will be invoked.
  
    ```javascript
    import { get } from '@ember/object';
    get(obj, "name");
    ```
  
    If you plan to run on IE8 and older browsers then you should use this
    method anytime you want to retrieve a property on an object that you don't
    know for sure is private. (Properties beginning with an underscore '_'
    are considered private.)
  
    On all newer browsers, you only need to use this method to retrieve
    properties if the property might not be defined on the object and you want
    to respect the `unknownProperty` handler. Otherwise you can ignore this
    method.
  
    Note that if the object itself is `undefined`, this method will throw
    an error.
  
    @method get
    @for @ember/object
    @static
    @param {Object} obj The object to retrieve from.
    @param {String} keyName The property key to retrieve
    @return {Object} the property value or `null`.
    @public
  */


  function _get2(obj, keyName) {
    (false && !(arguments.length === 2) && (0, _debug.assert)("Get must be called with two arguments; an object and a property key", arguments.length === 2));
    (false && !(obj !== undefined && obj !== null) && (0, _debug.assert)("Cannot call get with '" + keyName + "' on an undefined object.", obj !== undefined && obj !== null));
    (false && !(typeof keyName === 'string' || typeof keyName === 'number' && !isNaN(keyName)) && (0, _debug.assert)("The key provided to get must be a string or number, you passed " + keyName, typeof keyName === 'string' || typeof keyName === 'number' && !isNaN(keyName)));
    (false && !(typeof keyName !== 'string' || keyName.lastIndexOf('this.', 0) !== 0) && (0, _debug.assert)("'this' in paths is not supported", typeof keyName !== 'string' || keyName.lastIndexOf('this.', 0) !== 0));
    var type = typeof obj;
    var isObject = type === 'object';
    var isFunction = type === 'function';
    var isObjectLike = isObject || isFunction;

    if (isPath(keyName)) {
      return isObjectLike ? _getPath(obj, keyName) : undefined;
    }

    var value$$1;

    if (isObjectLike) {
      var tracking = isTracking();
      {
        if (tracking) {
          consume(tagForProperty(obj, keyName));
        }
      }

      if (false
      /* DEBUG */
      && _utils.HAS_NATIVE_PROXY) {
        value$$1 = getPossibleMandatoryProxyValue(obj, keyName);
      } else {
        value$$1 = obj[keyName];
      } // Add the tag of the returned value if it is an array, since arrays
      // should always cause updates if they are consumed and then changed


      if (true
      /* EMBER_METAL_TRACKED_PROPERTIES */
      && tracking && (Array.isArray(value$$1) || (0, _utils.isEmberArray)(value$$1))) {
        consume(tagForProperty(value$$1, '[]'));
      }
    } else {
      value$$1 = obj[keyName];
    }

    if (value$$1 === undefined) {
      if (isObject && !(keyName in obj) && typeof obj.unknownProperty === 'function') {
        return obj.unknownProperty(keyName);
      }
    }

    return value$$1;
  }

  function _getPath(root, path) {
    var obj = root;
    var parts = typeof path === 'string' ? path.split('.') : path;

    for (var i = 0; i < parts.length; i++) {
      if (obj === undefined || obj === null || obj.isDestroyed) {
        return undefined;
      }

      obj = _get2(obj, parts[i]);
    }

    return obj;
  }
  /**
    Retrieves the value of a property from an Object, or a default value in the
    case that the property returns `undefined`.
  
    ```javascript
    import { getWithDefault } from '@ember/object';
    getWithDefault(person, 'lastName', 'Doe');
    ```
  
    @method getWithDefault
    @for @ember/object
    @static
    @param {Object} obj The object to retrieve from.
    @param {String} keyName The name of the property to retrieve
    @param {Object} defaultValue The value to return if the property value is undefined
    @return {Object} The property value or the defaultValue.
    @public
  */


  function getWithDefault(root, key, defaultValue) {
    var value$$1 = _get2(root, key);

    if (value$$1 === undefined) {
      return defaultValue;
    }

    return value$$1;
  }

  function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  function isVolatile(obj, keyName, meta$$1) {
    var desc = descriptorForProperty(obj, keyName, meta$$1);
    return !(desc !== undefined && desc._volatile === false);
  }

  var ChainWatchers =
  /*#__PURE__*/
  function () {
    function ChainWatchers() {
      // chain nodes that reference a key in this obj by key
      // we only create ChainWatchers when we are going to add them
      // so create this upfront
      this.chains = Object.create(null);
    }

    var _proto4 = ChainWatchers.prototype;

    _proto4.add = function add(key, node) {
      var nodes = this.chains[key];

      if (nodes === undefined) {
        this.chains[key] = [node];
      } else {
        nodes.push(node);
      }
    };

    _proto4.remove = function remove(key, node) {
      var nodes = this.chains[key];

      if (nodes !== undefined) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === node) {
            nodes.splice(i, 1);
            break;
          }
        }
      }
    };

    _proto4.has = function has(key, node) {
      var nodes = this.chains[key];

      if (nodes !== undefined) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === node) {
            return true;
          }
        }
      }

      return false;
    };

    _proto4.revalidateAll = function revalidateAll() {
      for (var key in this.chains) {
        this.notify(key, true, undefined);
      }
    };

    _proto4.revalidate = function revalidate(key) {
      this.notify(key, true, undefined);
    } // key: the string key that is part of a path changed
    // revalidate: boolean; the chains that are watching this value should revalidate
    // callback: function that will be called with the object and path that
    //           will be/are invalidated by this key change, depending on
    //           whether the revalidate flag is passed
    ;

    _proto4.notify = function notify(key, revalidate, callback) {
      var nodes = this.chains[key];

      if (nodes === undefined || nodes.length === 0) {
        return;
      }

      var affected = undefined;

      if (callback !== undefined) {
        affected = [];
      }

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].notify(revalidate, affected);
      }

      if (callback === undefined) {
        return;
      } // we gather callbacks so we don't notify them during revalidation


      for (var _i = 0; _i < affected.length; _i += 2) {
        var obj = affected[_i];
        var path = affected[_i + 1];
        callback(obj, path);
      }
    };

    return ChainWatchers;
  }();

  function makeChainWatcher() {
    return new ChainWatchers();
  }

  function makeChainNode(obj) {
    return new ChainNode(null, null, obj);
  }

  function addChainWatcher(obj, keyName, node) {
    var m = (0, _meta2.meta)(obj);
    m.writableChainWatchers(makeChainWatcher).add(keyName, node);
    watchKey(obj, keyName, m);
  }

  function removeChainWatcher(obj, keyName, node, _meta) {
    if (!isObject(obj)) {
      return;
    }

    var meta$$1 = _meta === undefined ? (0, _meta2.peekMeta)(obj) : _meta;

    if (meta$$1 === null || meta$$1.isSourceDestroying() || meta$$1.isMetaDestroyed() || meta$$1.readableChainWatchers() === undefined) {
      return;
    } // make meta writable


    meta$$1 = (0, _meta2.meta)(obj);
    meta$$1.readableChainWatchers().remove(keyName, node);
    unwatchKey(obj, keyName, meta$$1);
  }

  var NODE_STACK = [];

  function destroyRoot(root) {
    pushChildren(root);

    while (NODE_STACK.length > 0) {
      var node = NODE_STACK.pop();
      pushChildren(node);
      destroyOne(node);
    }
  }

  function destroyOne(node) {
    if (node.isWatching) {
      removeChainWatcher(node.object, node.key, node);
      node.isWatching = false;
    }
  }

  function pushChildren(node) {
    var nodes = node.chains;

    if (nodes !== undefined) {
      for (var key in nodes) {
        if (nodes[key] !== undefined) {
          NODE_STACK.push(nodes[key]);
        }
      }
    }
  } // A ChainNode watches a single key on an object. If you provide a starting
  // value for the key then the node won't actually watch it. For a root node
  // pass null for parent and key and object for value.


  var ChainNode =
  /*#__PURE__*/
  function () {
    function ChainNode(parent, key, value$$1) {
      this.paths = undefined;
      this.isWatching = false;
      this.chains = undefined;
      this.object = undefined;
      this.count = 0;
      this.parent = parent;
      this.key = key;
      this.content = value$$1; // It is false for the root of a chain (because we have no parent)

      var isWatching = this.isWatching = parent !== null;

      if (isWatching) {
        var parentValue = parent.value();

        if (isObject(parentValue)) {
          this.object = parentValue;
          addChainWatcher(parentValue, key, this);
        }
      }
    }

    var _proto5 = ChainNode.prototype;

    _proto5.value = function value() {
      if (this.content === undefined && this.isWatching) {
        var obj = this.parent.value();
        this.content = lazyGet(obj, this.key);
      }

      return this.content;
    };

    _proto5.destroy = function destroy() {
      // check if root
      if (this.parent === null) {
        destroyRoot(this);
      } else {
        destroyOne(this);
      }
    } // copies a top level object only
    ;

    _proto5.copyTo = function copyTo(target) {
      var paths = this.paths;

      if (paths !== undefined) {
        var path;

        for (path in paths) {
          if (paths[path] > 0) {
            target.add(path);
          }
        }
      }
    } // called on the root node of a chain to setup watchers on the specified
    // path.
    ;

    _proto5.add = function add(path) {
      var paths = this.paths || (this.paths = {});
      paths[path] = (paths[path] || 0) + 1;
      var tails = path.split('.');
      this.chain(tails.shift(), tails);
    } // called on the root node of a chain to teardown watcher on the specified
    // path
    ;

    _proto5.remove = function remove(path) {
      var paths = this.paths;

      if (paths === undefined) {
        return;
      }

      if (paths[path] > 0) {
        paths[path]--;
      }

      var tails = path.split('.');
      this.unchain(tails.shift(), tails);
    };

    _proto5.chain = function chain(key, tails) {
      var chains = this.chains;

      if (chains === undefined) {
        chains = this.chains = Object.create(null);
      }

      var node = chains[key];

      if (node === undefined) {
        node = chains[key] = new ChainNode(this, key, undefined);
      }

      node.count++; // count chains...
      // chain rest of path if there is one

      if (tails.length > 0) {
        node.chain(tails.shift(), tails);
      }
    };

    _proto5.unchain = function unchain(key, tails) {
      var chains = this.chains;
      var node = chains[key]; // unchain rest of path first...

      if (tails.length > 0) {
        node.unchain(tails.shift(), tails);
      } // delete node if needed.


      node.count--;

      if (node.count <= 0) {
        chains[node.key] = undefined;
        node.destroy();
      }
    };

    _proto5.notify = function notify(revalidate, affected) {
      if (revalidate && this.isWatching) {
        var parentValue = this.parent.value();

        if (parentValue !== this.object) {
          removeChainWatcher(this.object, this.key, this);

          if (isObject(parentValue)) {
            this.object = parentValue;
            addChainWatcher(parentValue, this.key, this);
          } else {
            this.object = undefined;
          }
        }

        this.content = undefined;
      } // then notify chains...


      var chains = this.chains;

      if (chains !== undefined) {
        var node;

        for (var key in chains) {
          node = chains[key];

          if (node !== undefined) {
            node.notify(revalidate, affected);
          }
        }
      }

      if (affected !== undefined && this.parent !== null) {
        this.parent.populateAffected(this.key, 1, affected);
      }
    };

    _proto5.populateAffected = function populateAffected(path, depth, affected) {
      if (this.key) {
        path = this.key + "." + path;
      }

      if (this.parent !== null) {
        this.parent.populateAffected(path, depth + 1, affected);
      } else if (depth > 1) {
        affected.push(this.value(), path);
      }
    };

    return ChainNode;
  }();

  _exports.ChainNode = ChainNode;

  function lazyGet(obj, key) {
    if (!isObject(obj)) {
      return;
    }

    var meta$$1 = (0, _meta2.peekMeta)(obj); // check if object meant only to be a prototype

    if (meta$$1 !== null && meta$$1.proto === obj) {
      return;
    } // Use `get` if the return value is an EachProxy or an uncacheable value.


    if (key === '@each') {
      return eachProxyFor(obj);
    } else if (isVolatile(obj, key, meta$$1)) {
      return _get2(obj, key); // Otherwise attempt to get the cached value of the computed property
    } else {
      return getCachedValueFor(obj, key);
    }
  }

  function finishChains(meta$$1) {
    // finish any current chains node watchers that reference obj
    var chainWatchers = meta$$1.readableChainWatchers();

    if (chainWatchers !== undefined) {
      chainWatchers.revalidateAll();
    } // ensure that if we have inherited any chains they have been
    // copied onto our own meta.


    if (meta$$1.readableChains() !== undefined) {
      meta$$1.writableChains(makeChainNode);
    }
  }

  function watchPath(obj, keyPath, meta$$1) {
    var m = meta$$1 === undefined ? (0, _meta2.meta)(obj) : meta$$1;
    var counter = m.peekWatching(keyPath);
    m.writeWatching(keyPath, counter + 1);

    if (counter === 0) {
      // activate watching first time
      m.writableChains(makeChainNode).add(keyPath);
    }
  }

  function unwatchPath(obj, keyPath, meta$$1) {
    var m = meta$$1 === undefined ? (0, _meta2.peekMeta)(obj) : meta$$1;

    if (m === null) {
      return;
    }

    var counter = m.peekWatching(keyPath);

    if (counter > 0) {
      m.writeWatching(keyPath, counter - 1);

      if (counter === 1) {
        m.writableChains(makeChainNode).remove(keyPath);
      }
    }
  }
  /**
  @module ember
  */

  /**
    Starts watching a property on an object. Whenever the property changes,
    invokes `Ember.notifyPropertyChange`. This is the primitive used by observers
    and dependent keys; usually you will never call this method directly but instead
    use higher level methods like `addObserver()`.
  
    @private
    @method watch
    @for Ember
    @param obj
    @param {String} keyPath
    @param {Object} meta
  */


  function watch(obj, keyPath, meta$$1) {
    if (isPath(keyPath)) {
      watchPath(obj, keyPath, meta$$1);
    } else {
      watchKey(obj, keyPath, meta$$1);
    }
  }

  function isWatching(obj, key) {
    return watcherCount(obj, key) > 0;
  }

  function watcherCount(obj, key) {
    var meta$$1 = (0, _meta2.peekMeta)(obj);
    return meta$$1 !== null && meta$$1.peekWatching(key) || 0;
  }
  /**
    Stops watching a property on an object. Usually you will never call this method directly but instead
    use higher level methods like `removeObserver()`.
  
    @private
    @method unwatch
    @for Ember
    @param obj
    @param {String} keyPath
    @param {Object} meta
  */


  function unwatch(obj, keyPath, meta$$1) {
    if (isPath(keyPath)) {
      unwatchPath(obj, keyPath, meta$$1);
    } else {
      unwatchKey(obj, keyPath, meta$$1);
    }
  }

  var SYNC_DEFAULT = !_environment.ENV._DEFAULT_ASYNC_OBSERVERS;
  var SYNC_OBSERVERS = new Map();
  var ASYNC_OBSERVERS = new Map();
  /**
  @module @ember/object
  */

  /**
    @method addObserver
    @static
    @for @ember/object/observers
    @param obj
    @param {String} path
    @param {Object|Function} target
    @param {Function|String} [method]
    @public
  */

  function addObserver(obj, path, target, method, sync) {
    if (sync === void 0) {
      sync = SYNC_DEFAULT;
    }

    var eventName = changeEvent(path);
    addListener(obj, eventName, target, method, false, sync);
    {
      var meta$$1 = (0, _meta2.peekMeta)(obj);

      if (meta$$1 === null || !(meta$$1.isPrototypeMeta(obj) || meta$$1.isInitializing())) {
        activateObserver(obj, eventName, sync);
      }
    }
  }
  /**
    @method removeObserver
    @static
    @for @ember/object/observers
    @param obj
    @param {String} path
    @param {Object|Function} target
    @param {Function|String} [method]
    @public
  */


  function removeObserver(obj, path, target, method, sync) {
    if (sync === void 0) {
      sync = SYNC_DEFAULT;
    }

    var eventName = changeEvent(path);
    {
      var meta$$1 = (0, _meta2.peekMeta)(obj);

      if (meta$$1 === null || !(meta$$1.isPrototypeMeta(obj) || meta$$1.isInitializing())) {
        deactivateObserver(obj, eventName, sync);
      }
    }
    removeListener(obj, eventName, target, method);
  }

  function getOrCreateActiveObserversFor(target, sync) {
    var observerMap = sync === true ? SYNC_OBSERVERS : ASYNC_OBSERVERS;

    if (!observerMap.has(target)) {
      observerMap.set(target, new Map());
    }

    return observerMap.get(target);
  }

  function activateObserver(target, eventName, sync) {
    if (sync === void 0) {
      sync = false;
    }

    var activeObservers = getOrCreateActiveObserversFor(target, sync);

    if (activeObservers.has(eventName)) {
      activeObservers.get(eventName).count++;
    } else {
      var _eventName$split = eventName.split(':'),
          path = _eventName$split[0];

      var tag = (0, _reference.combine)(getChainTagsForKey(target, path));
      activeObservers.set(eventName, {
        count: 1,
        path: path,
        tag: tag,
        lastRevision: (0, _reference.value)(tag),
        suspended: false
      });
    }
  }

  function deactivateObserver(target, eventName, sync) {
    if (sync === void 0) {
      sync = false;
    }

    var observerMap = sync === true ? SYNC_OBSERVERS : ASYNC_OBSERVERS;
    var activeObservers = observerMap.get(target);

    if (activeObservers !== undefined) {
      var _observer = activeObservers.get(eventName);

      _observer.count--;

      if (_observer.count === 0) {
        activeObservers.delete(eventName);

        if (activeObservers.size === 0) {
          observerMap.delete(target);
        }
      }
    }
  }
  /**
   * Primarily used for cases where we are redefining a class, e.g. mixins/reopen
   * being applied later. Revalidates all the observers, resetting their tags.
   *
   * @private
   * @param target
   */


  function revalidateObservers(target) {
    if (ASYNC_OBSERVERS.has(target)) {
      ASYNC_OBSERVERS.get(target).forEach(function (observer) {
        observer.tag = (0, _reference.combine)(getChainTagsForKey(target, observer.path));
        observer.lastRevision = (0, _reference.value)(observer.tag);
      });
    }

    if (SYNC_OBSERVERS.has(target)) {
      SYNC_OBSERVERS.get(target).forEach(function (observer) {
        observer.tag = (0, _reference.combine)(getChainTagsForKey(target, observer.path));
        observer.lastRevision = (0, _reference.value)(observer.tag);
      });
    }
  }

  var lastKnownRevision = 0;

  function flushAsyncObservers(shouldSchedule) {
    if (shouldSchedule === void 0) {
      shouldSchedule = true;
    }

    if (lastKnownRevision === (0, _reference.value)(_reference.CURRENT_TAG)) {
      return;
    }

    lastKnownRevision = (0, _reference.value)(_reference.CURRENT_TAG);
    ASYNC_OBSERVERS.forEach(function (activeObservers, target) {
      var meta$$1 = (0, _meta2.peekMeta)(target);

      if (meta$$1 && (meta$$1.isSourceDestroying() || meta$$1.isMetaDestroyed())) {
        ASYNC_OBSERVERS.delete(target);
        return;
      }

      activeObservers.forEach(function (observer, eventName) {
        if (!(0, _reference.validate)(observer.tag, observer.lastRevision)) {
          var sendObserver = function sendObserver() {
            try {
              sendEvent(target, eventName, [target, observer.path]);
            } finally {
              observer.tag = (0, _reference.combine)(getChainTagsForKey(target, observer.path));
              observer.lastRevision = (0, _reference.value)(observer.tag);
            }
          };

          if (shouldSchedule) {
            (0, _runloop.schedule)('actions', sendObserver);
          } else {
            sendObserver();
          }
        }
      });
    });
  }

  function flushSyncObservers() {
    // When flushing synchronous observers, we know that something has changed (we
    // only do this during a notifyPropertyChange), so there's no reason to check
    // a global revision.
    SYNC_OBSERVERS.forEach(function (activeObservers, target) {
      var meta$$1 = (0, _meta2.peekMeta)(target);

      if (meta$$1 && (meta$$1.isSourceDestroying() || meta$$1.isMetaDestroyed())) {
        SYNC_OBSERVERS.delete(target);
        return;
      }

      activeObservers.forEach(function (observer, eventName) {
        if (!observer.suspended && !(0, _reference.validate)(observer.tag, observer.lastRevision)) {
          try {
            observer.suspended = true;
            sendEvent(target, eventName, [target, observer.path]);
          } finally {
            observer.tag = (0, _reference.combine)(getChainTagsForKey(target, observer.path));
            observer.lastRevision = (0, _reference.value)(observer.tag);
            observer.suspended = false;
          }
        }
      });
    });
  }

  function setObserverSuspended(target, property, suspended) {
    var activeObservers = SYNC_OBSERVERS.get(target);

    if (!activeObservers) {
      return;
    }

    var observer = activeObservers.get(changeEvent(property));

    if (observer) {
      observer.suspended = suspended;
    }
  }

  var runInTransaction;
  _exports.runInTransaction = runInTransaction;
  var didRender;
  _exports.didRender = didRender;
  var assertNotRendered; // detect-backtracking-rerender by default is debug build only

  _exports.assertNotRendered = assertNotRendered;

  if (false
  /* DEBUG */
  ) {
    // there are 2 states
    // DEBUG
    // tracks lastRef and lastRenderedIn per rendered object and key during a transaction
    // release everything via normal weakmap semantics by just derefencing the weakmap
    // RELEASE
    // tracks transactionId per rendered object and key during a transaction
    // release everything via normal weakmap semantics by just derefencing the weakmap
    var TransactionRunner =
    /*#__PURE__*/
    function () {
      function TransactionRunner() {
        this.transactionId = 0;
        this.inTransaction = false;
        this.shouldReflush = false;
        this.weakMap = new WeakMap();

        if (false
        /* DEBUG */
        ) {
          // track templates
          this.debugStack = undefined;
        }
      }

      var _proto6 = TransactionRunner.prototype;

      _proto6.runInTransaction = function runInTransaction(context$$1, methodName) {
        this.before(context$$1);

        try {
          context$$1[methodName]();
        } finally {
          this.after();
        }

        return this.shouldReflush;
      };

      _proto6.didRender = function didRender(object, key, reference) {
        if (!this.inTransaction) {
          return;
        }

        if (false
        /* DEBUG */
        ) {
          this.setKey(object, key, {
            lastRef: reference,
            lastRenderedIn: this.debugStack.peek()
          });
        } else {
          this.setKey(object, key, this.transactionId);
        }
      };

      _proto6.assertNotRendered = function assertNotRendered(object, key) {
        if (!this.inTransaction) {
          return;
        }

        if (this.hasRendered(object, key)) {
          if (false
          /* DEBUG */
          ) {
            var _this$getKey = this.getKey(object, key),
                lastRef = _this$getKey.lastRef,
                lastRenderedIn = _this$getKey.lastRenderedIn;

            var currentlyIn = this.debugStack.peek();
            var label = '';

            if (lastRef && typeof lastRef.debug === 'function') {
              label = "as `" + lastRef.debug() + "` in " + lastRenderedIn;
            } else {
              label = "in " + lastRenderedIn;
            }

            (false && !(false) && (0, _debug.assert)("You modified `" + object + "` twice in a single render. It was first rendered " + label + " and then modified later in " + currentlyIn + ". This was unreliable and slow in Ember 1.x and is no longer supported. See https://github.com/emberjs/ember.js/issues/13948 for more details.", false));
          }

          this.shouldReflush = true;
        }
      };

      _proto6.hasRendered = function hasRendered(object, key) {
        if (!this.inTransaction) {
          return false;
        }

        if (false
        /* DEBUG */
        ) {
          return this.getKey(object, key) !== undefined;
        }

        return this.getKey(object, key) === this.transactionId;
      };

      _proto6.before = function before(context$$1) {
        this.inTransaction = true;
        this.shouldReflush = false;

        if (false
        /* DEBUG */
        ) {
          this.debugStack = context$$1.env.debugStack;
        }
      };

      _proto6.after = function after() {
        this.transactionId++;
        this.inTransaction = false;

        if (false
        /* DEBUG */
        ) {
          this.debugStack = undefined;
        }

        this.clearObjectMap();
      };

      _proto6.createMap = function createMap(object) {
        var map = Object.create(null);
        this.weakMap.set(object, map);
        return map;
      };

      _proto6.getOrCreateMap = function getOrCreateMap(object) {
        var map = this.weakMap.get(object);

        if (map === undefined) {
          map = this.createMap(object);
        }

        return map;
      };

      _proto6.setKey = function setKey(object, key, value$$1) {
        var map = this.getOrCreateMap(object);
        map[key] = value$$1;
      };

      _proto6.getKey = function getKey(object, key) {
        var map = this.weakMap.get(object);

        if (map !== undefined) {
          return map[key];
        }
      };

      _proto6.clearObjectMap = function clearObjectMap() {
        this.weakMap = new WeakMap();
      };

      return TransactionRunner;
    }();

    var runner = new TransactionRunner();

    _exports.runInTransaction = runInTransaction = function runInTransaction() {
      return runner.runInTransaction.apply(runner, arguments);
    };

    _exports.didRender = didRender = function didRender() {
      return runner.didRender.apply(runner, arguments);
    };

    _exports.assertNotRendered = assertNotRendered = function assertNotRendered() {
      return runner.assertNotRendered.apply(runner, arguments);
    };
  } else {
    // in production do nothing to detect reflushes
    _exports.runInTransaction = runInTransaction = function runInTransaction(context$$1, methodName) {
      context$$1[methodName]();
      return false;
    };
  }
  /**
   @module ember
   @private
   */


  var PROPERTY_DID_CHANGE = (0, _utils.symbol)('PROPERTY_DID_CHANGE');
  _exports.PROPERTY_DID_CHANGE = PROPERTY_DID_CHANGE;
  var deferred = 0;
  /**
    This function is called just after an object property has changed.
    It will notify any observers and clear caches among other things.
  
    Normally you will not need to call this method directly but if for some
    reason you can't directly watch a property you can invoke this method
    manually.
  
    @method notifyPropertyChange
    @for @ember/object
    @param {Object} obj The object with the property that will change
    @param {String} keyName The property key (or path) that will change.
    @param {Meta} meta The objects meta.
    @return {void}
    @since 3.1.0
    @public
  */

  function notifyPropertyChange(obj, keyName, _meta) {
    var meta$$1 = _meta === undefined ? (0, _meta2.peekMeta)(obj) : _meta;

    if (meta$$1 !== null && (meta$$1.isInitializing() || meta$$1.isPrototypeMeta(obj))) {
      return;
    }

    if (meta$$1 !== null) {
      markObjectAsDirty(obj, keyName, meta$$1);
    }

    if (true
    /* EMBER_METAL_TRACKED_PROPERTIES */
    && deferred <= 0) {
      flushSyncObservers();
    }

    if (PROPERTY_DID_CHANGE in obj) {
      obj[PROPERTY_DID_CHANGE](keyName);
    }

    if (false
    /* DEBUG */
    ) {
      assertNotRendered(obj, keyName);
    }
  }

  function overrideChains(_obj, keyName, meta$$1) {
    var chainWatchers = meta$$1.readableChainWatchers();

    if (chainWatchers !== undefined) {
      chainWatchers.revalidate(keyName);
    }
  }
  /**
    @method beginPropertyChanges
    @chainable
    @private
  */


  function beginPropertyChanges() {
    deferred++;
  }
  /**
    @method endPropertyChanges
    @private
  */


  function endPropertyChanges() {
    deferred--;

    if (deferred <= 0) {
      {
        flushSyncObservers();
      }
    }
  }
  /**
    Make a series of property changes together in an
    exception-safe way.
  
    ```javascript
    Ember.changeProperties(function() {
      obj1.set('foo', mayBlowUpWhenSet);
      obj2.set('bar', baz);
    });
    ```
  
    @method changeProperties
    @param {Function} callback
    @private
  */


  function changeProperties(callback) {
    beginPropertyChanges();

    try {
      callback();
    } finally {
      endPropertyChanges();
    }
  }

  function arrayContentWillChange(array, startIdx, removeAmt, addAmt) {
    // if no args are passed assume everything changes
    if (startIdx === undefined) {
      startIdx = 0;
      removeAmt = addAmt = -1;
    } else {
      if (removeAmt === undefined) {
        removeAmt = -1;
      }

      if (addAmt === undefined) {
        addAmt = -1;
      }
    }

    sendEvent(array, '@array:before', [array, startIdx, removeAmt, addAmt]);
    return array;
  }

  function arrayContentDidChange(array, startIdx, removeAmt, addAmt) {
    // if no args are passed assume everything changes
    if (startIdx === undefined) {
      startIdx = 0;
      removeAmt = addAmt = -1;
    } else {
      if (removeAmt === undefined) {
        removeAmt = -1;
      }

      if (addAmt === undefined) {
        addAmt = -1;
      }
    }

    var meta$$1 = (0, _meta2.peekMeta)(array);

    if (addAmt < 0 || removeAmt < 0 || addAmt - removeAmt !== 0) {
      notifyPropertyChange(array, 'length', meta$$1);
    }

    notifyPropertyChange(array, '[]', meta$$1);
    sendEvent(array, '@array:change', [array, startIdx, removeAmt, addAmt]);
    var cache = peekCacheFor(array);

    if (cache !== undefined) {
      var length = array.length;
      var addedAmount = addAmt === -1 ? 0 : addAmt;
      var removedAmount = removeAmt === -1 ? 0 : removeAmt;
      var delta = addedAmount - removedAmount;
      var previousLength = length - delta;
      var normalStartIdx = startIdx < 0 ? previousLength + startIdx : startIdx;

      if (cache.has('firstObject') && normalStartIdx === 0) {
        notifyPropertyChange(array, 'firstObject', meta$$1);
      }

      if (cache.has('lastObject')) {
        var previousLastIndex = previousLength - 1;
        var lastAffectedIndex = normalStartIdx + removedAmount;

        if (previousLastIndex < lastAffectedIndex) {
          notifyPropertyChange(array, 'lastObject', meta$$1);
        }
      }
    }

    return array;
  }

  var EMPTY_ARRAY = Object.freeze([]);

  function objectAt(array, index) {
    if (Array.isArray(array)) {
      return array[index];
    } else {
      return array.objectAt(index);
    }
  }

  function replace(array, start, deleteCount, items) {
    if (items === void 0) {
      items = EMPTY_ARRAY;
    }

    if (Array.isArray(array)) {
      replaceInNativeArray(array, start, deleteCount, items);
    } else {
      array.replace(start, deleteCount, items);
    }
  }

  var CHUNK_SIZE = 60000; // To avoid overflowing the stack, we splice up to CHUNK_SIZE items at a time.
  // See https://code.google.com/p/chromium/issues/detail?id=56588 for more details.

  function replaceInNativeArray(array, start, deleteCount, items) {
    arrayContentWillChange(array, start, deleteCount, items.length);

    if (items.length <= CHUNK_SIZE) {
      array.splice.apply(array, [start, deleteCount].concat(items));
    } else {
      array.splice(start, deleteCount);

      for (var i = 0; i < items.length; i += CHUNK_SIZE) {
        var chunk = items.slice(i, i + CHUNK_SIZE);
        array.splice.apply(array, [start + i, 0].concat(chunk));
      }
    }

    arrayContentDidChange(array, start, deleteCount, items.length);
  }

  function arrayObserversHelper(obj, target, opts, operation, notify) {
    var willChange = opts && opts.willChange || 'arrayWillChange';
    var didChange = opts && opts.didChange || 'arrayDidChange';

    var hasObservers = _get2(obj, 'hasArrayObservers');

    operation(obj, '@array:before', target, willChange);
    operation(obj, '@array:change', target, didChange);

    if (hasObservers === notify) {
      notifyPropertyChange(obj, 'hasArrayObservers');
    }

    return obj;
  }

  function addArrayObserver(array, target, opts) {
    return arrayObserversHelper(array, target, opts, addListener, false);
  }

  function removeArrayObserver(array, target, opts) {
    return arrayObserversHelper(array, target, opts, removeListener, true);
  }

  var ARGS_PROXY_TAGS = new WeakMap();
  _exports.ARGS_PROXY_TAGS = ARGS_PROXY_TAGS;

  function finishLazyChains(obj, key, value$$1) {
    var meta$$1 = (0, _meta2.peekMeta)(obj);
    var lazyTags = meta$$1 !== null ? meta$$1.readableLazyChainsFor(key) : undefined;

    if (lazyTags === undefined) {
      return;
    }

    if (value$$1 === null || typeof value$$1 !== 'object' && typeof value$$1 !== 'function') {
      for (var path in lazyTags) {
        delete lazyTags[path];
      }

      return;
    }

    for (var _path in lazyTags) {
      var tag = lazyTags[_path];
      (0, _reference.update)(tag, (0, _reference.combine)(getChainTagsForKey(value$$1, _path)));
      delete lazyTags[_path];
    }
  }

  function getChainTagsForKeys(obj, keys) {
    var chainTags = [];

    for (var i = 0; i < keys.length; i++) {
      chainTags.push.apply(chainTags, getChainTagsForKey(obj, keys[i]));
    }

    return chainTags;
  }

  function getChainTagsForKey(obj, path) {
    var chainTags = [];
    var current = obj;
    var pathLength = path.length;
    var segmentEnd = -1; // prevent closures

    var segment, descriptor; // eslint-disable-next-line no-constant-condition

    while (true) {
      var currentType = typeof current;

      if (current === null || currentType !== 'object' && currentType !== 'function') {
        // we've hit the end of the chain for now, break out
        break;
      }

      var lastSegmentEnd = segmentEnd + 1;
      segmentEnd = path.indexOf('.', lastSegmentEnd);

      if (segmentEnd === -1) {
        segmentEnd = pathLength;
      }

      segment = path.slice(lastSegmentEnd, segmentEnd); // If the segment is an @each, we can process it and then break

      if (segment === '@each' && segmentEnd !== pathLength) {
        lastSegmentEnd = segmentEnd + 1;
        segmentEnd = path.indexOf('.', lastSegmentEnd); // There should be exactly one segment after an `@each` (i.e. `@each.foo`, not `@each.foo.bar`)

        (false && !(segmentEnd === -1) && (0, _debug.deprecate)("When using @each in a dependent-key or an observer, " + "you can only chain one property level deep after " + ("the @each. That is, `" + path.slice(0, segmentEnd) + "` ") + ("is allowed but `" + path + "` (which is what you passed) ") + "is not.\n\n" + "This was never supported. Currently, the extra segments " + ("are silently ignored, i.e. `" + path + "` behaves exactly ") + ("the same as `" + path.slice(0, segmentEnd) + "`. ") + "In the future, this will throw an error.\n\n" + "If the current behavior is acceptable for your use case, " + "please remove the extraneous segments by changing your " + ("key to `" + path.slice(0, segmentEnd) + "`. ") + "Otherwise, please create an intermediary computed property " + "or switch to using tracked properties.", segmentEnd === -1, {
          until: '3.17.0',
          id: 'ember-metal.computed-deep-each'
        }));
        var arrLength = current.length;

        if (typeof arrLength !== 'number' || // TODO: should the second test be `isEmberArray` instead?
        !(Array.isArray(current) || 'objectAt' in current)) {
          // If the current object isn't an array, there's nothing else to do,
          // we don't watch individual properties. Break out of the loop.
          break;
        } else if (arrLength === 0) {
          // Fast path for empty arrays
          chainTags.push(tagForProperty(current, '[]'));
          break;
        }

        if (segmentEnd === -1) {
          segment = path.slice(lastSegmentEnd);
        } else {
          // Deprecated, remove once we turn the deprecation into an assertion
          segment = path.slice(lastSegmentEnd, segmentEnd);
        } // Push the tags for each item's property


        for (var i = 0; i < arrLength; i++) {
          var item = objectAt(current, i);

          if (item) {
            (false && !(typeof item === 'object') && (0, _debug.assert)("When using @each to observe the array `" + current.toString() + "`, the items in the array must be objects", typeof item === 'object'));
            chainTags.push(tagForProperty(item, segment));
          }
        } // Push the tag for the array length itself


        chainTags.push(tagForProperty(current, '[]'));
        break;
      } // If the segment is linking to an args proxy, we need to manually access
      // the tags for the args, since they are direct references and don't have a
      // tagForProperty. We then continue chaining like normal after it, since
      // you could chain off an arg if it were an object, for instance.


      if (segment === 'args' && ARGS_PROXY_TAGS.has(current.args)) {
        (false && !(segmentEnd !== pathLength) && (0, _debug.assert)("When watching the 'args' on a GlimmerComponent, you must watch a value on the args. You cannot watch the object itself, as it never changes.", segmentEnd !== pathLength));
        lastSegmentEnd = segmentEnd + 1;
        segmentEnd = path.indexOf('.', lastSegmentEnd);

        if (segmentEnd === -1) {
          segmentEnd = pathLength;
        }

        segment = path.slice(lastSegmentEnd, segmentEnd);
        var namedArgs = ARGS_PROXY_TAGS.get(current.args);
        var ref = namedArgs.get(segment);
        chainTags.push(ref.tag); // We still need to break if we're at the end of the path.

        if (segmentEnd === pathLength) {
          break;
        } // Otherwise, set the current value and then continue to the next segment


        current = ref.value();
        continue;
      } // TODO: Assert that current[segment] isn't an undecorated, non-MANDATORY_SETTER/dependentKeyCompat getter


      var propertyTag = tagForProperty(current, segment);
      descriptor = descriptorForProperty(current, segment);
      chainTags.push(propertyTag); // If the key was an alias, we should always get the next value in order to
      // bootstrap the alias. This is because aliases, unlike other CPs, should
      // always be in sync with the aliased value.

      if (descriptor !== undefined && typeof descriptor.altKey === 'string') {
        current = current[segment]; // We still need to break if we're at the end of the path.

        if (segmentEnd === pathLength) {
          break;
        } // Otherwise, continue to process the next segment


        continue;
      } // If we're at the end of the path, processing the last segment, and it's
      // not an alias, we should _not_ get the last value, since we already have
      // its tag. There's no reason to access it and do more work.


      if (segmentEnd === pathLength) {
        break;
      }

      if (descriptor === undefined) {
        // If the descriptor is undefined, then its a normal property, so we should
        // lookup the value to chain off of like normal.
        if (!(segment in current) && typeof current.unknownProperty === 'function') {
          current = current.unknownProperty(segment);
        } else {
          current = current[segment];
        }
      } else {
        // If the descriptor is defined, then its a normal CP (not an alias, which
        // would have been handled earlier). We get the last revision to check if
        // the CP is still valid, and if so we use the cached value. If not, then
        // we create a lazy chain lookup, and the next time the CP is caluculated,
        // it will update that lazy chain.
        var lastRevision = getLastRevisionFor(current, segment);

        if ((0, _reference.validate)(propertyTag, lastRevision)) {
          current = peekCacheFor(current).get(segment);
        } else {
          var lazyChains = (0, _meta2.meta)(current).writableLazyChainsFor(segment);
          var rest = path.substr(segmentEnd + 1);
          var placeholderTag = lazyChains[rest];

          if (placeholderTag === undefined) {
            placeholderTag = lazyChains[rest] = (0, _reference.createUpdatableTag)();
          }

          chainTags.push(placeholderTag);
          break;
        }
      }
    }

    return chainTags;
  }
  /**
  @module @ember/object
  */


  var END_WITH_EACH_REGEX = /\.@each$/;
  /**
    Expands `pattern`, invoking `callback` for each expansion.
  
    The only pattern supported is brace-expansion, anything else will be passed
    once to `callback` directly.
  
    Example
  
    ```js
    import { expandProperties } from '@ember/object/computed';
  
    function echo(arg){ console.log(arg); }
  
    expandProperties('foo.bar', echo);              //=> 'foo.bar'
    expandProperties('{foo,bar}', echo);            //=> 'foo', 'bar'
    expandProperties('foo.{bar,baz}', echo);        //=> 'foo.bar', 'foo.baz'
    expandProperties('{foo,bar}.baz', echo);        //=> 'foo.baz', 'bar.baz'
    expandProperties('foo.{bar,baz}.[]', echo)      //=> 'foo.bar.[]', 'foo.baz.[]'
    expandProperties('{foo,bar}.{spam,eggs}', echo) //=> 'foo.spam', 'foo.eggs', 'bar.spam', 'bar.eggs'
    expandProperties('{foo}.bar.{baz}')             //=> 'foo.bar.baz'
    ```
  
    @method expandProperties
    @static
    @for @ember/object/computed
    @public
    @param {String} pattern The property pattern to expand.
    @param {Function} callback The callback to invoke.  It is invoked once per
    expansion, and is passed the expansion.
  */

  function expandProperties(pattern, callback) {
    (false && !(typeof pattern === 'string') && (0, _debug.assert)("A computed property key must be a string, you passed " + typeof pattern + " " + pattern, typeof pattern === 'string'));
    (false && !(pattern.indexOf(' ') === -1) && (0, _debug.assert)('Brace expanded properties cannot contain spaces, e.g. "user.{firstName, lastName}" should be "user.{firstName,lastName}"', pattern.indexOf(' ') === -1)); // regex to look for double open, double close, or unclosed braces

    (false && !(pattern.match(/\{[^}{]*\{|\}[^}{]*\}|\{[^}]*$/g) === null) && (0, _debug.assert)("Brace expanded properties have to be balanced and cannot be nested, pattern: " + pattern, pattern.match(/\{[^}{]*\{|\}[^}{]*\}|\{[^}]*$/g) === null));
    var start = pattern.indexOf('{');

    if (start < 0) {
      callback(pattern.replace(END_WITH_EACH_REGEX, '.[]'));
    } else {
      dive('', pattern, start, callback);
    }
  }

  function dive(prefix, pattern, start, callback) {
    var end = pattern.indexOf('}'),
        i = 0,
        newStart,
        arrayLength;
    var tempArr = pattern.substring(start + 1, end).split(',');
    var after = pattern.substring(end + 1);
    prefix = prefix + pattern.substring(0, start);
    arrayLength = tempArr.length;

    while (i < arrayLength) {
      newStart = after.indexOf('{');

      if (newStart < 0) {
        callback((prefix + tempArr[i++] + after).replace(END_WITH_EACH_REGEX, '.[]'));
      } else {
        dive(prefix + tempArr[i++], after, newStart, callback);
      }
    }
  }
  /**
   @module @ember/object
  */

  /**
    Sets the value of a property on an object, respecting computed properties
    and notifying observers and other listeners of the change.
    If the specified property is not defined on the object and the object
    implements the `setUnknownProperty` method, then instead of setting the
    value of the property on the object, its `setUnknownProperty` handler
    will be invoked with the two parameters `keyName` and `value`.
  
    ```javascript
    import { set } from '@ember/object';
    set(obj, "name", value);
    ```
  
    @method set
    @static
    @for @ember/object
    @param {Object} obj The object to modify.
    @param {String} keyName The property key to set
    @param {Object} value The value to set
    @return {Object} the passed value.
    @public
  */


  function _set2(obj, keyName, value$$1, tolerant) {
    (false && !(arguments.length === 3 || arguments.length === 4) && (0, _debug.assert)("Set must be called with three or four arguments; an object, a property key, a value and tolerant true/false", arguments.length === 3 || arguments.length === 4));
    (false && !(obj && typeof obj === 'object' || typeof obj === 'function') && (0, _debug.assert)("Cannot call set with '" + keyName + "' on an undefined object.", obj && typeof obj === 'object' || typeof obj === 'function'));
    (false && !(typeof keyName === 'string' || typeof keyName === 'number' && !isNaN(keyName)) && (0, _debug.assert)("The key provided to set must be a string or number, you passed " + keyName, typeof keyName === 'string' || typeof keyName === 'number' && !isNaN(keyName)));
    (false && !(typeof keyName !== 'string' || keyName.lastIndexOf('this.', 0) !== 0) && (0, _debug.assert)("'this' in paths is not supported", typeof keyName !== 'string' || keyName.lastIndexOf('this.', 0) !== 0));

    if (obj.isDestroyed) {
      (false && !(tolerant) && (0, _debug.assert)("calling set on destroyed object: " + (0, _utils.toString)(obj) + "." + keyName + " = " + (0, _utils.toString)(value$$1), tolerant));
      return;
    }

    if (isPath(keyName)) {
      return setPath(obj, keyName, value$$1, tolerant);
    }

    var meta$$1 = (0, _meta2.peekMeta)(obj);
    {
      var descriptor = (0, _utils.lookupDescriptor)(obj, keyName);
      var setter = descriptor === null ? undefined : descriptor.set;

      if (setter !== undefined && CP_SETTER_FUNCS.has(setter)) {
        obj[keyName] = value$$1;
        return value$$1;
      }
    }
    var currentValue;

    if (false
    /* DEBUG */
    && _utils.HAS_NATIVE_PROXY) {
      currentValue = getPossibleMandatoryProxyValue(obj, keyName);
    } else {
      currentValue = obj[keyName];
    }

    if (currentValue === undefined && 'object' === typeof obj && !(keyName in obj) && typeof obj.setUnknownProperty === 'function') {
      /* unknown property */
      obj.setUnknownProperty(keyName, value$$1);
    } else {
      if (false
      /* DEBUG */
      ) {
        {
          (0, _utils.setWithMandatorySetter)(obj, keyName, value$$1);
        }
      } else {
        obj[keyName] = value$$1;
      }

      if (currentValue !== value$$1) {
        notifyPropertyChange(obj, keyName, meta$$1);
      }
    }

    return value$$1;
  }

  function setPath(root, path, value$$1, tolerant) {
    var parts = path.split('.');
    var keyName = parts.pop();
    (false && !(keyName.trim().length > 0) && (0, _debug.assert)('Property set failed: You passed an empty path', keyName.trim().length > 0));

    var newRoot = _getPath(root, parts);

    if (newRoot !== null && newRoot !== undefined) {
      return _set2(newRoot, keyName, value$$1);
    } else if (!tolerant) {
      throw new _error.default("Property set failed: object in path \"" + parts.join('.') + "\" could not be found.");
    }
  }
  /**
    Error-tolerant form of `set`. Will not blow up if any part of the
    chain is `undefined`, `null`, or destroyed.
  
    This is primarily used when syncing bindings, which may try to update after
    an object has been destroyed.
  
    ```javascript
    import { trySet } from '@ember/object';
  
    let obj = { name: "Zoey" };
    trySet(obj, "contacts.twitter", "@emberjs");
    ```
  
    @method trySet
    @static
    @for @ember/object
    @param {Object} root The object to modify.
    @param {String} path The property path to set
    @param {Object} value The value to set
    @public
  */


  function trySet(root, path, value$$1) {
    return _set2(root, path, value$$1, true);
  }
  /**
  @module @ember/object
  */


  var DEEP_EACH_REGEX = /\.@each\.[^.]+\./;

  function noop() {}
  /**
    `@computed` is a decorator that turns a JavaScript getter and setter into a
    computed property, which is a _cached, trackable value_. By default the getter
    will only be called once and the result will be cached. You can specify
    various properties that your computed property depends on. This will force the
    cached result to be cleared if the dependencies are modified, and lazily recomputed the next time something asks for it.
  
    In the following example we decorate a getter - `fullName` -  by calling
    `computed` with the property dependencies (`firstName` and `lastName`) as
    arguments. The `fullName` getter will be called once (regardless of how many
    times it is accessed) as long as its dependencies do not change. Once
    `firstName` or `lastName` are updated any future calls to `fullName` will
    incorporate the new values, and any watchers of the value such as templates
    will be updated:
  
    ```javascript
    import { computed, set } from '@ember/object';
  
    class Person {
      constructor(firstName, lastName) {
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
  
      @computed('firstName', 'lastName')
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    });
  
    let tom = new Person('Tom', 'Dale');
  
    tom.fullName; // 'Tom Dale'
    ```
  
    You can also provide a setter, which will be used when updating the computed
    property. Ember's `set` function must be used to update the property
    since it will also notify observers of the property:
  
    ```javascript
    import { computed, set } from '@ember/object';
  
    class Person {
      constructor(firstName, lastName) {
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
  
      @computed('firstName', 'lastName')
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
  
      set fullName(value) {
        let [firstName, lastName] = value.split(' ');
  
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
    });
  
    let person = new Person();
  
    set(person, 'fullName', 'Peter Wagenet');
    person.firstName; // 'Peter'
    person.lastName;  // 'Wagenet'
    ```
  
    You can also pass a getter function or object with `get` and `set` functions
    as the last argument to the computed decorator. This allows you to define
    computed property _macros_:
  
    ```js
    import { computed } from '@ember/object';
  
    function join(...keys) {
      return computed(...keys, function() {
        return keys.map(key => this[key]).join(' ');
      });
    }
  
    class Person {
      @join('firstName', 'lastName')
      fullName;
    }
    ```
  
    Note that when defined this way, getters and setters receive the _key_ of the
    property they are decorating as the first argument. Setters receive the value
    they are setting to as the second argument instead. Additionally, setters must
    _return_ the value that should be cached:
  
    ```javascript
    import { computed, set } from '@ember/object';
  
    function fullNameMacro(firstNameKey, lastNameKey) {
      return computed(firstNameKey, lastNameKey, {
        get() {
          return `${this[firstNameKey]} ${this[lastNameKey]}`;
        }
  
        set(key, value) {
          let [firstName, lastName] = value.split(' ');
  
          set(this, firstNameKey, firstName);
          set(this, lastNameKey, lastName);
  
          return value;
        }
      });
    }
  
    class Person {
      constructor(firstName, lastName) {
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
  
      @fullNameMacro fullName;
    });
  
    let person = new Person();
  
    set(person, 'fullName', 'Peter Wagenet');
    person.firstName; // 'Peter'
    person.lastName;  // 'Wagenet'
    ```
  
    Computed properties can also be used in classic classes. To do this, we
    provide the getter and setter as the last argument like we would for a macro,
    and we assign it to a property on the class definition. This is an _anonymous_
    computed macro:
  
    ```javascript
    import EmberObject, { computed, set } from '@ember/object';
  
    let Person = EmberObject.extend({
      // these will be supplied by `create`
      firstName: null,
      lastName: null,
  
      fullName: computed('firstName', 'lastName', {
        get() {
          return `${this.firstName} ${this.lastName}`;
        }
  
        set(key, value) {
          let [firstName, lastName] = value.split(' ');
  
          set(this, 'firstName', firstName);
          set(this, 'lastName', lastName);
  
          return value;
        }
      })
    });
  
    let tom = Person.create({
      firstName: 'Tom',
      lastName: 'Dale'
    });
  
    tom.get('fullName') // 'Tom Dale'
    ```
  
    You can overwrite computed property without setters with a normal property (no
    longer computed) that won't change if dependencies change. You can also mark
    computed property as `.readOnly()` and block all attempts to set it.
  
    ```javascript
    import { computed, set } from '@ember/object';
  
    class Person {
      constructor(firstName, lastName) {
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
  
      @computed('firstName', 'lastName').readOnly()
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    });
  
    let person = new Person();
    person.set('fullName', 'Peter Wagenet'); // Uncaught Error: Cannot set read-only property "fullName" on object: <(...):emberXXX>
    ```
  
    Additional resources:
    - [Decorators RFC](https://github.com/emberjs/rfcs/blob/master/text/0408-decorators.md)
    - [New CP syntax RFC](https://github.com/emberjs/rfcs/blob/master/text/0011-improved-cp-syntax.md)
    - [New computed syntax explained in "Ember 1.12 released" ](https://emberjs.com/blog/2015/05/13/ember-1-12-released.html#toc_new-computed-syntax)
  
    @class ComputedProperty
    @public
  */


  var ComputedProperty =
  /*#__PURE__*/
  function (_ComputedDescriptor) {
    (0, _emberBabel.inheritsLoose)(ComputedProperty, _ComputedDescriptor);

    function ComputedProperty(args) {
      var _this;

      _this = _ComputedDescriptor.call(this) || this;
      _this._volatile = false;
      _this._readOnly = false;
      _this._suspended = undefined;
      _this._hasConfig = false;
      _this._getter = undefined;
      _this._setter = undefined;
      var maybeConfig = args[args.length - 1];

      if (typeof maybeConfig === 'function' || maybeConfig !== null && typeof maybeConfig === 'object') {
        _this._hasConfig = true;
        var config = args.pop();

        if (typeof config === 'function') {
          (false && !(!isClassicDecorator(config)) && (0, _debug.assert)("You attempted to pass a computed property instance to computed(). Computed property instances are decorator functions, and cannot be passed to computed() because they cannot be turned into decorators twice", !isClassicDecorator(config)));
          _this._getter = config;
        } else {
          var objectConfig = config;
          (false && !(typeof objectConfig === 'object' && !Array.isArray(objectConfig)) && (0, _debug.assert)('computed expects a function or an object as last argument.', typeof objectConfig === 'object' && !Array.isArray(objectConfig)));
          (false && !(Object.keys(objectConfig).every(function (key) {
            return key === 'get' || key === 'set';
          })) && (0, _debug.assert)('Config object passed to computed can only contain `get` and `set` keys.', Object.keys(objectConfig).every(function (key) {
            return key === 'get' || key === 'set';
          })));
          (false && !(Boolean(objectConfig.get) || Boolean(objectConfig.set)) && (0, _debug.assert)('Computed properties must receive a getter or a setter, you passed none.', Boolean(objectConfig.get) || Boolean(objectConfig.set)));
          _this._getter = objectConfig.get || noop;
          _this._setter = objectConfig.set;
        }
      }

      if (args.length > 0) {
        var _this2;

        (_this2 = _this)._property.apply(_this2, args);
      }

      return _this;
    }

    var _proto7 = ComputedProperty.prototype;

    _proto7.setup = function setup(obj, keyName, propertyDesc, meta$$1) {
      _ComputedDescriptor.prototype.setup.call(this, obj, keyName, propertyDesc, meta$$1);

      (false && !(!(propertyDesc && typeof propertyDesc.value === 'function')) && (0, _debug.assert)("@computed can only be used on accessors or fields, attempted to use it with " + keyName + " but that was a method. Try converting it to a getter (e.g. `get " + keyName + "() {}`)", !(propertyDesc && typeof propertyDesc.value === 'function')));
      (false && !(!propertyDesc || !propertyDesc.initializer) && (0, _debug.assert)("@computed can only be used on empty fields. " + keyName + " has an initial value (e.g. `" + keyName + " = someValue`)", !propertyDesc || !propertyDesc.initializer));
      (false && !(!(this._hasConfig && propertyDesc && (typeof propertyDesc.get === 'function' || typeof propertyDesc.set === 'function'))) && (0, _debug.assert)("Attempted to apply a computed property that already has a getter/setter to a " + keyName + ", but it is a method or an accessor. If you passed @computed a function or getter/setter (e.g. `@computed({ get() { ... } })`), then it must be applied to a field", !(this._hasConfig && propertyDesc && (typeof propertyDesc.get === 'function' || typeof propertyDesc.set === 'function'))));

      if (this._hasConfig === false) {
        (false && !(propertyDesc && (typeof propertyDesc.get === 'function' || typeof propertyDesc.set === 'function')) && (0, _debug.assert)("Attempted to use @computed on " + keyName + ", but it did not have a getter or a setter. You must either pass a get a function or getter/setter to @computed directly (e.g. `@computed({ get() { ... } })`) or apply @computed directly to a getter/setter", propertyDesc && (typeof propertyDesc.get === 'function' || typeof propertyDesc.set === 'function')));
        var _get = propertyDesc.get,
            set$$1 = propertyDesc.set;

        if (_get !== undefined) {
          this._getter = _get;
        }

        if (set$$1 !== undefined) {
          this._setter = function setterWrapper(_key, value$$1) {
            var ret = set$$1.call(this, value$$1);

            if (_get !== undefined) {
              return typeof ret === 'undefined' ? _get.call(this) : ret;
            }

            return ret;
          };
        }
      }
    }
    /**
      Call on a computed property to set it into non-cached mode. When in this
      mode the computed property will not automatically cache the return value.
      It also does not automatically fire any change events. You must manually notify
      any changes if you want to observe this property.
      Dependency keys have no effect on volatile properties as they are for cache
      invalidation and notification when cached value is invalidated.
      ```javascript
      import EmberObject, { computed } from '@ember/object';
      let outsideService = EmberObject.extend({
        value: computed(function() {
          return OutsideService.getValue();
        }).volatile()
      }).create();
      ```
      @method volatile
      @return {ComputedProperty} this
      @chainable
      @public
    */
    ;

    _proto7.volatile = function volatile() {
      (false && !(false) && (0, _debug.deprecate)('Setting a computed property as volatile has been deprecated. Instead, consider using a native getter with native class syntax.', false, {
        id: 'computed-property.volatile',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_computed-property-volatile'
      }));
      this._volatile = true;
    }
    /**
      Call on a computed property to set it into read-only mode. When in this
      mode the computed property will throw an error when set.
      ```javascript
      import EmberObject, { computed } from '@ember/object';
      let Person = EmberObject.extend({
        guid: computed(function() {
          return 'guid-guid-guid';
        }).readOnly()
      });
      let person = Person.create();
      person.set('guid', 'new-guid'); // will throw an exception
      ```
      @method readOnly
      @return {ComputedProperty} this
      @chainable
      @public
    */
    ;

    _proto7.readOnly = function readOnly() {
      this._readOnly = true;
      (false && !(!(this._readOnly && this._setter && this._setter !== this._getter)) && (0, _debug.assert)('Computed properties that define a setter using the new syntax cannot be read-only', !(this._readOnly && this._setter && this._setter !== this._getter)));
    }
    /**
      Sets the dependent keys on this computed property. Pass any number of
      arguments containing key paths that this computed property depends on.
      ```javascript
      import EmberObject, { computed } from '@ember/object';
      let President = EmberObject.extend({
        fullName: computed('firstName', 'lastName', function() {
          return this.get('firstName') + ' ' + this.get('lastName');
          // Tell Ember that this computed property depends on firstName
          // and lastName
        })
      });
      let president = President.create({
        firstName: 'Barack',
        lastName: 'Obama'
      });
      president.get('fullName'); // 'Barack Obama'
      ```
      @method property
      @param {String} path* zero or more property paths
      @return {ComputedProperty} this
      @chainable
      @public
    */
    ;

    _proto7.property = function property() {
      (false && !(false) && (0, _debug.deprecate)('Setting dependency keys using the `.property()` modifier has been deprecated. Pass the dependency keys directly to computed as arguments instead. If you are using `.property()` on a computed property macro, consider refactoring your macro to receive additional dependent keys in its initial declaration.', false, {
        id: 'computed-property.property',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_computed-property-property'
      }));

      this._property.apply(this, arguments);
    };

    _proto7._property = function _property() {
      var args = [];

      function addArg(property) {
        (false && (0, _debug.warn)("Dependent keys containing @each only work one level deep. " + ("You used the key \"" + property + "\" which is invalid. ") + "Please create an intermediary computed property.", DEEP_EACH_REGEX.test(property) === false, {
          id: 'ember-metal.computed-deep-each'
        }));
        args.push(property);
      }

      for (var i = 0; i < arguments.length; i++) {
        expandProperties(i < 0 || arguments.length <= i ? undefined : arguments[i], addArg);
      }

      this._dependentKeys = args;
    }
    /**
      In some cases, you may want to annotate computed properties with additional
      metadata about how they function or what values they operate on. For example,
      computed property functions may close over variables that are then no longer
      available for introspection.
      You can pass a hash of these values to a computed property like this:
      ```
      import { computed } from '@ember/object';
      import Person from 'my-app/utils/person';
      person: computed(function() {
        let personId = this.get('personId');
        return Person.create({ id: personId });
      }).meta({ type: Person })
      ```
      The hash that you pass to the `meta()` function will be saved on the
      computed property descriptor under the `_meta` key. Ember runtime
      exposes a public API for retrieving these values from classes,
      via the `metaForProperty()` function.
      @method meta
      @param {Object} meta
      @chainable
      @public
    */
    // invalidate cache when CP key changes
    ;

    _proto7.didChange = function didChange(obj, keyName) {
      // _suspended is set via a CP.set to ensure we don't clear
      // the cached value set by the setter
      if (this._volatile || this._suspended === obj) {
        return;
      } // don't create objects just to invalidate


      var meta$$1 = (0, _meta2.peekMeta)(obj);

      if (meta$$1 === null || meta$$1.source !== obj) {
        return;
      }

      var cache = peekCacheFor(obj);

      if (cache !== undefined && cache.delete(keyName)) {
        removeDependentKeys(this, obj, keyName, meta$$1);
      }
    };

    _proto7.get = function get(obj, keyName) {
      var _this3 = this;

      if (this._volatile) {
        return this._getter.call(obj, keyName);
      }

      var cache = getCacheFor(obj);
      {
        var propertyTag = tagForProperty(obj, keyName);
        var ret;

        if (cache.has(keyName) && (0, _reference.validate)(propertyTag, getLastRevisionFor(obj, keyName))) {
          ret = cache.get(keyName);
        } else {
          // For backwards compatibility, we only throw if the CP has any dependencies. CPs without dependencies
          // should be allowed, even after the object has been destroyed, which is why we check _dependentKeys.
          (false && !(this._dependentKeys === undefined || !(0, _meta2.meta)(obj).isMetaDestroyed()) && (0, _debug.assert)("Attempted to access the computed " + obj + "." + keyName + " on a destroyed object, which is not allowed", this._dependentKeys === undefined || !(0, _meta2.meta)(obj).isMetaDestroyed()));
          var upstreamTag = undefined;

          if (this._auto === true) {
            upstreamTag = track(function () {
              ret = _this3._getter.call(obj, keyName);
            });
          } else {
            // Create a tracker that absorbs any trackable actions inside the CP
            untrack(function () {
              ret = _this3._getter.call(obj, keyName);
            });
          }

          if (this._dependentKeys !== undefined) {
            var tag = (0, _reference.combine)(getChainTagsForKeys(obj, this._dependentKeys));
            upstreamTag = upstreamTag === undefined ? tag : (0, _reference.combine)([upstreamTag, tag]);
          }

          if (upstreamTag !== undefined) {
            (0, _reference.update)(propertyTag, upstreamTag);
          }

          setLastRevisionFor(obj, keyName, (0, _reference.value)(propertyTag));
          cache.set(keyName, ret);
          finishLazyChains(obj, keyName, ret);
        }

        consume(propertyTag); // Add the tag of the returned value if it is an array, since arrays
        // should always cause updates if they are consumed and then changed

        if (Array.isArray(ret) || (0, _utils.isEmberArray)(ret)) {
          consume(tagForProperty(ret, '[]'));
        }

        return ret;
      }
    };

    _proto7.set = function set(obj, keyName, value$$1) {
      if (this._readOnly) {
        this._throwReadOnlyError(obj, keyName);
      }

      if (!this._setter) {
        return this.clobberSet(obj, keyName, value$$1);
      }

      if (this._volatile) {
        return this.volatileSet(obj, keyName, value$$1);
      }

      {
        var ret;

        try {
          beginPropertyChanges();
          ret = this._set(obj, keyName, value$$1);
          finishLazyChains(obj, keyName, ret);
          var propertyTag = tagForProperty(obj, keyName);

          if (this._dependentKeys !== undefined) {
            (0, _reference.update)(propertyTag, (0, _reference.combine)(getChainTagsForKeys(obj, this._dependentKeys)));
          }

          setLastRevisionFor(obj, keyName, (0, _reference.value)(propertyTag));
        } finally {
          endPropertyChanges();
        }

        return ret;
      }
    };

    _proto7._throwReadOnlyError = function _throwReadOnlyError(obj, keyName) {
      throw new _error.default("Cannot set read-only property \"" + keyName + "\" on object: " + (0, _utils.inspect)(obj));
    };

    _proto7.clobberSet = function clobberSet(obj, keyName, value$$1) {
      (false && !(false) && (0, _debug.deprecate)("The " + (0, _utils.toString)(obj) + "#" + keyName + " computed property was just overriden. This removes the computed property and replaces it with a plain value, and has been deprecated. If you want this behavior, consider defining a setter which does it manually.", false, {
        id: 'computed-property.override',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_computed-property-override'
      }));
      var cachedValue = getCachedValueFor(obj, keyName);
      defineProperty(obj, keyName, null, cachedValue);

      _set2(obj, keyName, value$$1);

      return value$$1;
    };

    _proto7.volatileSet = function volatileSet(obj, keyName, value$$1) {
      return this._setter.call(obj, keyName, value$$1);
    };

    _proto7.setWithSuspend = function setWithSuspend(obj, keyName, value$$1) {
      var oldSuspended = this._suspended;
      this._suspended = obj;

      try {
        return this._set(obj, keyName, value$$1);
      } finally {
        this._suspended = oldSuspended;
      }
    };

    _proto7._set = function _set(obj, keyName, value$$1) {
      var cache = getCacheFor(obj);
      var hadCachedValue = cache.has(keyName);
      var cachedValue = cache.get(keyName);
      var ret;
      {
        setObserverSuspended(obj, keyName, true);

        try {
          ret = this._setter.call(obj, keyName, value$$1, cachedValue);
        } finally {
          setObserverSuspended(obj, keyName, false);
        }
      } // allows setter to return the same value that is cached already

      if (hadCachedValue && cachedValue === ret) {
        return ret;
      }

      var meta$$1 = (0, _meta2.meta)(obj);
      cache.set(keyName, ret);
      notifyPropertyChange(obj, keyName, meta$$1);
      return ret;
    }
    /* called before property is overridden */
    ;

    _proto7.teardown = function teardown(obj, keyName, meta$$1) {
      if (!this._volatile) {
        var cache = peekCacheFor(obj);

        if (cache !== undefined && cache.delete(keyName)) {
          removeDependentKeys(this, obj, keyName, meta$$1);
        }
      }

      _ComputedDescriptor.prototype.teardown.call(this, obj, keyName, meta$$1);
    };

    return ComputedProperty;
  }(ComputedDescriptor);

  _exports.ComputedProperty = ComputedProperty;
  {
    ComputedProperty.prototype.auto = function () {
      this._auto = true;
    };
  } // TODO: This class can be svelted once `meta` has been deprecated

  var ComputedDecoratorImpl =
  /*#__PURE__*/
  function (_Function) {
    (0, _emberBabel.inheritsLoose)(ComputedDecoratorImpl, _Function);

    function ComputedDecoratorImpl() {
      return _Function.apply(this, arguments) || this;
    }

    var _proto8 = ComputedDecoratorImpl.prototype;

    _proto8.readOnly = function readOnly() {
      descriptorForDecorator(this).readOnly();
      return this;
    };

    _proto8.volatile = function volatile() {
      descriptorForDecorator(this).volatile();
      return this;
    };

    _proto8.property = function property() {
      var _descriptorForDecorat;

      (_descriptorForDecorat = descriptorForDecorator(this)).property.apply(_descriptorForDecorat, arguments);

      return this;
    };

    _proto8.meta = function meta(meta$$1) {
      var prop = descriptorForDecorator(this);

      if (arguments.length === 0) {
        return prop._meta || {};
      } else {
        prop._meta = meta$$1;
        return this;
      }
    } // TODO: Remove this when we can provide alternatives in the ecosystem to
    // addons such as ember-macro-helpers that use it.
    ;

    (0, _emberBabel.createClass)(ComputedDecoratorImpl, [{
      key: "_getter",
      get: function get() {
        return descriptorForDecorator(this)._getter;
      } // TODO: Refactor this, this is an internal API only

    }, {
      key: "enumerable",
      set: function set(value$$1) {
        descriptorForDecorator(this).enumerable = value$$1;
      }
    }]);
    return ComputedDecoratorImpl;
  }((0, _emberBabel.wrapNativeSuper)(Function));

  function computed() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
      args[_key4] = arguments[_key4];
    }

    (false && !(!(isElementDescriptor(args.slice(0, 3)) && args.length === 5 && args[4] === true)) && (0, _debug.assert)("@computed can only be used directly as a native decorator. If you're using tracked in classic classes, add parenthesis to call it like a function: computed()", !(isElementDescriptor(args.slice(0, 3)) && args.length === 5 && args[4] === true)));

    if (isElementDescriptor(args)) {
      var decorator = makeComputedDecorator(new ComputedProperty([]), ComputedDecoratorImpl);
      return decorator(args[0], args[1], args[2]);
    }

    return makeComputedDecorator(new ComputedProperty(args), ComputedDecoratorImpl);
  }
  /**
    Allows checking if a given property on an object is a computed property. For the most part,
    this doesn't matter (you would normally just access the property directly and use its value),
    but for some tooling specific scenarios (e.g. the ember-inspector) it is important to
    differentiate if a property is a computed property or a "normal" property.
  
    This will work on either a class's prototype or an instance itself.
  
    @static
    @method isComputed
    @for @ember/debug
    @private
   */


  function isComputed(obj, key) {
    return Boolean(descriptorForProperty(obj, key));
  }

  var _globalsComputed = computed.bind(null);

  _exports._globalsComputed = _globalsComputed;
  var CONSUMED = Object.freeze({});

  function alias(altKey) {
    (false && !(!isElementDescriptor(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @alias as a decorator directly, but it requires a `altKey` parameter', !isElementDescriptor(Array.prototype.slice.call(arguments))));
    return makeComputedDecorator(new AliasedProperty(altKey), AliasDecoratorImpl);
  } // TODO: This class can be svelted once `meta` has been deprecated


  var AliasDecoratorImpl =
  /*#__PURE__*/
  function (_Function2) {
    (0, _emberBabel.inheritsLoose)(AliasDecoratorImpl, _Function2);

    function AliasDecoratorImpl() {
      return _Function2.apply(this, arguments) || this;
    }

    var _proto9 = AliasDecoratorImpl.prototype;

    _proto9.readOnly = function readOnly() {
      descriptorForDecorator(this).readOnly();
      return this;
    };

    _proto9.oneWay = function oneWay() {
      descriptorForDecorator(this).oneWay();
      return this;
    };

    _proto9.meta = function meta(meta$$1) {
      var prop = descriptorForDecorator(this);

      if (arguments.length === 0) {
        return prop._meta || {};
      } else {
        prop._meta = meta$$1;
      }
    };

    return AliasDecoratorImpl;
  }((0, _emberBabel.wrapNativeSuper)(Function));

  var AliasedProperty =
  /*#__PURE__*/
  function (_ComputedDescriptor2) {
    (0, _emberBabel.inheritsLoose)(AliasedProperty, _ComputedDescriptor2);

    function AliasedProperty(altKey) {
      var _this4;

      _this4 = _ComputedDescriptor2.call(this) || this;
      _this4.altKey = altKey;
      return _this4;
    }

    var _proto10 = AliasedProperty.prototype;

    _proto10.setup = function setup(obj, keyName, propertyDesc, meta$$1) {
      (false && !(this.altKey !== keyName) && (0, _debug.assert)("Setting alias '" + keyName + "' on self", this.altKey !== keyName));

      _ComputedDescriptor2.prototype.setup.call(this, obj, keyName, propertyDesc, meta$$1);
    };

    _proto10.teardown = function teardown(obj, keyName, meta$$1) {
      _ComputedDescriptor2.prototype.teardown.call(this, obj, keyName, meta$$1);
    };

    _proto10.willWatch = function willWatch(obj, keyName, meta$$1) {};

    _proto10.get = function get(obj, keyName) {
      var _this5 = this;

      var ret;
      {
        var propertyTag = tagForProperty(obj, keyName); // We don't use the tag since CPs are not automatic, we just want to avoid
        // anything tracking while we get the altKey

        untrack(function () {
          ret = _get2(obj, _this5.altKey);
        });
        var lastRevision = getLastRevisionFor(obj, keyName);

        if (!(0, _reference.validate)(propertyTag, lastRevision)) {
          (0, _reference.update)(propertyTag, (0, _reference.combine)(getChainTagsForKey(obj, this.altKey)));
          setLastRevisionFor(obj, keyName, (0, _reference.value)(propertyTag));
          finishLazyChains(obj, keyName, ret);
        }

        consume(propertyTag);
      }
      return ret;
    };

    _proto10.unconsume = function unconsume(obj, keyName, meta$$1) {
      var wasConsumed = getCachedValueFor(obj, keyName) === CONSUMED;

      if (wasConsumed || meta$$1.peekWatching(keyName) > 0) {
        removeDependentKeys(this, obj, keyName, meta$$1);
      }

      if (wasConsumed) {
        getCacheFor(obj).delete(keyName);
      }
    };

    _proto10.consume = function consume(obj, keyName, meta$$1) {
      var cache = getCacheFor(obj);

      if (cache.get(keyName) !== CONSUMED) {
        cache.set(keyName, CONSUMED);
        addDependentKeys(this, obj, keyName, meta$$1);
      }
    };

    _proto10.set = function set(obj, _keyName, value$$1) {
      return _set2(obj, this.altKey, value$$1);
    };

    _proto10.readOnly = function readOnly() {
      this.set = AliasedProperty_readOnlySet;
    };

    _proto10.oneWay = function oneWay() {
      this.set = AliasedProperty_oneWaySet;
    };

    return AliasedProperty;
  }(ComputedDescriptor);

  function AliasedProperty_readOnlySet(obj, keyName) {
    // eslint-disable-line no-unused-vars
    throw new _error.default("Cannot set read-only property '" + keyName + "' on object: " + (0, _utils.inspect)(obj));
  }

  function AliasedProperty_oneWaySet(obj, keyName, value$$1) {
    defineProperty(obj, keyName, null);
    return _set2(obj, keyName, value$$1);
  }
  /**
  @module ember
  */

  /**
    Used internally to allow changing properties in a backwards compatible way, and print a helpful
    deprecation warning.
  
    @method deprecateProperty
    @param {Object} object The object to add the deprecated property to.
    @param {String} deprecatedKey The property to add (and print deprecation warnings upon accessing).
    @param {String} newKey The property that will be aliased.
    @private
    @since 1.7.0
  */


  function deprecateProperty(object, deprecatedKey, newKey, options) {
    function _deprecate() {
      (false && !(false) && (0, _debug.deprecate)("Usage of `" + deprecatedKey + "` is deprecated, use `" + newKey + "` instead.", false, options));
    }

    Object.defineProperty(object, deprecatedKey, {
      configurable: true,
      enumerable: false,
      set: function set(value$$1) {
        _deprecate();

        _set2(this, newKey, value$$1);
      },
      get: function get() {
        _deprecate();

        return _get2(this, newKey);
      }
    });
  }
  /**
   @module @ember/utils
  */

  /**
    Returns true if the passed value is null or undefined. This avoids errors
    from JSLint complaining about use of ==, which can be technically
    confusing.
  
    ```javascript
    isNone();              // true
    isNone(null);          // true
    isNone(undefined);     // true
    isNone('');            // false
    isNone([]);            // false
    isNone(function() {}); // false
    ```
  
    @method isNone
    @static
    @for @ember/utils
    @param {Object} obj Value to test
    @return {Boolean}
    @public
  */


  function isNone(obj) {
    return obj === null || obj === undefined;
  }
  /**
   @module @ember/utils
  */

  /**
    Verifies that a value is `null` or `undefined`, an empty string, or an empty
    array.
  
    Constrains the rules on `isNone` by returning true for empty strings and
    empty arrays.
  
    If the value is an object with a `size` property of type number, it is used
    to check emptiness.
  
    ```javascript
    isEmpty();                 // true
    isEmpty(null);             // true
    isEmpty(undefined);        // true
    isEmpty('');               // true
    isEmpty([]);               // true
    isEmpty({ size: 0});       // true
    isEmpty({});               // false
    isEmpty('Adam Hawkins');   // false
    isEmpty([0,1,2]);          // false
    isEmpty('\n\t');           // false
    isEmpty('  ');             // false
    isEmpty({ size: 1 })       // false
    isEmpty({ size: () => 0 }) // false
    ```
  
    @method isEmpty
    @static
    @for @ember/utils
    @param {Object} obj Value to test
    @return {Boolean}
    @public
  */


  function isEmpty(obj) {
    var none = obj === null || obj === undefined;

    if (none) {
      return none;
    }

    if (typeof obj.size === 'number') {
      return !obj.size;
    }

    var objectType = typeof obj;

    if (objectType === 'object') {
      var size = _get2(obj, 'size');

      if (typeof size === 'number') {
        return !size;
      }
    }

    if (typeof obj.length === 'number' && objectType !== 'function') {
      return !obj.length;
    }

    if (objectType === 'object') {
      var length = _get2(obj, 'length');

      if (typeof length === 'number') {
        return !length;
      }
    }

    return false;
  }
  /**
   @module @ember/utils
  */

  /**
    A value is blank if it is empty or a whitespace string.
  
    ```javascript
    import { isBlank } from '@ember/utils';
  
    isBlank();                // true
    isBlank(null);            // true
    isBlank(undefined);       // true
    isBlank('');              // true
    isBlank([]);              // true
    isBlank('\n\t');          // true
    isBlank('  ');            // true
    isBlank({});              // false
    isBlank('\n\t Hello');    // false
    isBlank('Hello world');   // false
    isBlank([1,2,3]);         // false
    ```
  
    @method isBlank
    @static
    @for @ember/utils
    @param {Object} obj Value to test
    @return {Boolean}
    @since 1.5.0
    @public
  */


  function isBlank(obj) {
    return isEmpty(obj) || typeof obj === 'string' && /\S/.test(obj) === false;
  }
  /**
   @module @ember/utils
  */

  /**
    A value is present if it not `isBlank`.
  
    ```javascript
    isPresent();                // false
    isPresent(null);            // false
    isPresent(undefined);       // false
    isPresent('');              // false
    isPresent('  ');            // false
    isPresent('\n\t');          // false
    isPresent([]);              // false
    isPresent({ length: 0 });   // false
    isPresent(false);           // true
    isPresent(true);            // true
    isPresent('string');        // true
    isPresent(0);               // true
    isPresent(function() {});   // true
    isPresent({});              // true
    isPresent('\n\t Hello');    // true
    isPresent([1, 2, 3]);       // true
    ```
  
    @method isPresent
    @static
    @for @ember/utils
    @param {Object} obj Value to test
    @return {Boolean}
    @since 1.8.0
    @public
  */


  function isPresent(obj) {
    return !isBlank(obj);
  }
  /**
   @module ember
  */

  /**
    Helper class that allows you to register your library with Ember.
  
    Singleton created at `Ember.libraries`.
  
    @class Libraries
    @constructor
    @private
  */


  var Libraries =
  /*#__PURE__*/
  function () {
    function Libraries() {
      this._registry = [];
      this._coreLibIndex = 0;
    }

    var _proto11 = Libraries.prototype;

    _proto11._getLibraryByName = function _getLibraryByName(name) {
      var libs = this._registry;
      var count = libs.length;

      for (var i = 0; i < count; i++) {
        if (libs[i].name === name) {
          return libs[i];
        }
      }

      return undefined;
    };

    _proto11.register = function register(name, version, isCoreLibrary) {
      var index = this._registry.length;

      if (!this._getLibraryByName(name)) {
        if (isCoreLibrary) {
          index = this._coreLibIndex++;
        }

        this._registry.splice(index, 0, {
          name: name,
          version: version
        });
      } else {
        (false && (0, _debug.warn)("Library \"" + name + "\" is already registered with Ember.", false, {
          id: 'ember-metal.libraries-register'
        }));
      }
    };

    _proto11.registerCoreLibrary = function registerCoreLibrary(name, version) {
      this.register(name, version, true);
    };

    _proto11.deRegister = function deRegister(name) {
      var lib = this._getLibraryByName(name);

      var index;

      if (lib) {
        index = this._registry.indexOf(lib);

        this._registry.splice(index, 1);
      }
    };

    return Libraries;
  }();

  _exports.Libraries = Libraries;

  if (false
  /* DEBUG */
  ) {
    Libraries.prototype.logVersions = function () {
      var libs = this._registry;
      var nameLengths = libs.map(function (item) {
        return _get2(item, 'name.length');
      });
      var maxNameLength = Math.max.apply(null, nameLengths);
      (0, _debug.debug)('-------------------------------');

      for (var i = 0; i < libs.length; i++) {
        var lib = libs[i];
        var spaces = new Array(maxNameLength - lib.name.length + 1).join(' ');
        (0, _debug.debug)([lib.name, spaces, ' : ', lib.version].join(''));
      }

      (0, _debug.debug)('-------------------------------');
    };
  }

  var LIBRARIES = new Libraries();
  _exports.libraries = LIBRARIES;
  LIBRARIES.registerCoreLibrary('Ember', _version.default);
  /**
   @module @ember/object
  */

  /**
    To get multiple properties at once, call `getProperties`
    with an object followed by a list of strings or an array:
  
    ```javascript
    import { getProperties } from '@ember/object';
  
    getProperties(record, 'firstName', 'lastName', 'zipCode');
    // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
    ```
  
    is equivalent to:
  
    ```javascript
    import { getProperties } from '@ember/object';
  
    getProperties(record, ['firstName', 'lastName', 'zipCode']);
    // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
    ```
  
    @method getProperties
    @static
    @for @ember/object
    @param {Object} obj
    @param {String...|Array} list of keys to get
    @return {Object}
    @public
  */

  function getProperties(obj, keys) {
    var ret = {};
    var propertyNames = arguments;
    var i = 1;

    if (arguments.length === 2 && Array.isArray(keys)) {
      i = 0;
      propertyNames = arguments[1];
    }

    for (; i < propertyNames.length; i++) {
      ret[propertyNames[i]] = _get2(obj, propertyNames[i]);
    }

    return ret;
  }
  /**
   @module @ember/object
  */

  /**
    Set a list of properties on an object. These properties are set inside
    a single `beginPropertyChanges` and `endPropertyChanges` batch, so
    observers will be buffered.
  
    ```javascript
    import EmberObject from '@ember/object';
    let anObject = EmberObject.create();
  
    anObject.setProperties({
      firstName: 'Stanley',
      lastName: 'Stuart',
      age: 21
    });
    ```
  
    @method setProperties
    @static
    @for @ember/object
    @param obj
    @param {Object} properties
    @return properties
    @public
  */


  function setProperties(obj, properties) {
    if (properties === null || typeof properties !== 'object') {
      return properties;
    }

    changeProperties(function () {
      var props = Object.keys(properties);
      var propertyName;

      for (var i = 0; i < props.length; i++) {
        propertyName = props[i];

        _set2(obj, propertyName, properties[propertyName]);
      }
    });
    return properties;
  } // move into its own package
  // it is needed by Mixin for classToString
  // maybe move it into environment


  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var searchDisabled = false;
  var flags = {
    _set: 0,
    _unprocessedNamespaces: false,

    get unprocessedNamespaces() {
      return this._unprocessedNamespaces;
    },

    set unprocessedNamespaces(v) {
      this._set++;
      this._unprocessedNamespaces = v;
    }

  };
  var unprocessedMixins = false;
  var NAMESPACES = [];
  _exports.NAMESPACES = NAMESPACES;
  var NAMESPACES_BY_ID = Object.create(null);
  _exports.NAMESPACES_BY_ID = NAMESPACES_BY_ID;

  function addNamespace(namespace) {
    flags.unprocessedNamespaces = true;
    NAMESPACES.push(namespace);
  }

  function removeNamespace(namespace) {
    var name = (0, _utils.getName)(namespace);
    delete NAMESPACES_BY_ID[name];
    NAMESPACES.splice(NAMESPACES.indexOf(namespace), 1);

    if (name in _environment.context.lookup && namespace === _environment.context.lookup[name]) {
      _environment.context.lookup[name] = undefined;
    }
  }

  function findNamespaces() {
    if (!flags.unprocessedNamespaces) {
      return;
    }

    var lookup = _environment.context.lookup;
    var keys = Object.keys(lookup);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]; // Only process entities that start with uppercase A-Z

      if (!isUppercase(key.charCodeAt(0))) {
        continue;
      }

      var obj = tryIsNamespace(lookup, key);

      if (obj) {
        (0, _utils.setName)(obj, key);
      }
    }
  }

  function findNamespace(name) {
    if (!searchDisabled) {
      processAllNamespaces();
    }

    return NAMESPACES_BY_ID[name];
  }

  function processNamespace(namespace) {
    _processNamespace([namespace.toString()], namespace, new Set());
  }

  function processAllNamespaces() {
    var unprocessedNamespaces = flags.unprocessedNamespaces;

    if (unprocessedNamespaces) {
      findNamespaces();
      flags.unprocessedNamespaces = false;
    }

    if (unprocessedNamespaces || unprocessedMixins) {
      var namespaces = NAMESPACES;

      for (var i = 0; i < namespaces.length; i++) {
        processNamespace(namespaces[i]);
      }

      unprocessedMixins = false;
    }
  }

  function classToString() {
    var name = (0, _utils.getName)(this);

    if (name !== void 0) {
      return name;
    }

    name = calculateToString(this);
    (0, _utils.setName)(this, name);
    return name;
  }

  function isSearchDisabled() {
    return searchDisabled;
  }

  function setSearchDisabled(flag) {
    searchDisabled = Boolean(flag);
  }

  function setUnprocessedMixins() {
    unprocessedMixins = true;
  }

  function _processNamespace(paths, root, seen) {
    var idx = paths.length;
    var id = paths.join('.');
    NAMESPACES_BY_ID[id] = root;
    (0, _utils.setName)(root, id); // Loop over all of the keys in the namespace, looking for classes

    for (var key in root) {
      if (!hasOwnProperty.call(root, key)) {
        continue;
      }

      var obj = root[key]; // If we are processing the `Ember` namespace, for example, the
      // `paths` will start with `["Ember"]`. Every iteration through
      // the loop will update the **second** element of this list with
      // the key, so processing `Ember.View` will make the Array
      // `['Ember', 'View']`.

      paths[idx] = key; // If we have found an unprocessed class

      if (obj && obj.toString === classToString && (0, _utils.getName)(obj) === void 0) {
        // Replace the class' `toString` with the dot-separated path
        (0, _utils.setName)(obj, paths.join('.')); // Support nested namespaces
      } else if (obj && obj.isNamespace) {
        // Skip aliased namespaces
        if (seen.has(obj)) {
          continue;
        }

        seen.add(obj); // Process the child namespace

        _processNamespace(paths, obj, seen);
      }
    }

    paths.length = idx; // cut out last item
  }

  function isUppercase(code) {
    return code >= 65 && code <= 90 // A
    ; // Z
  }

  function tryIsNamespace(lookup, prop) {
    try {
      var obj = lookup[prop];
      return (obj !== null && typeof obj === 'object' || typeof obj === 'function') && obj.isNamespace && obj;
    } catch (e) {// continue
    }
  }

  function calculateToString(target) {
    var str;

    if (!searchDisabled) {
      processAllNamespaces();
      str = (0, _utils.getName)(target);

      if (str !== void 0) {
        return str;
      }

      var superclass = target;

      do {
        superclass = Object.getPrototypeOf(superclass);

        if (superclass === Function.prototype || superclass === Object.prototype) {
          break;
        }

        str = (0, _utils.getName)(target);

        if (str !== void 0) {
          str = "(subclass of " + str + ")";
          break;
        }
      } while (str === void 0);
    }

    return str || '(unknown)';
  }
  /**
  @module @ember/object
  */


  var a_concat = Array.prototype.concat;
  var isArray = Array.isArray;

  function isMethod(obj) {
    return 'function' === typeof obj && obj.isMethod !== false && obj !== Boolean && obj !== Object && obj !== Number && obj !== Array && obj !== Date && obj !== String;
  }

  function isAccessor(desc) {
    return typeof desc.get === 'function' || typeof desc.set === 'function';
  }

  function extractAccessors(properties) {
    if (properties !== undefined) {
      var descriptors = (0, _utils.getOwnPropertyDescriptors)(properties);
      var keys = Object.keys(descriptors);
      var hasAccessors = keys.some(function (key) {
        return isAccessor(descriptors[key]);
      });

      if (hasAccessors) {
        var extracted = {};
        keys.forEach(function (key) {
          var descriptor = descriptors[key];

          if (isAccessor(descriptor)) {
            extracted[key] = nativeDescDecorator(descriptor);
          } else {
            extracted[key] = properties[key];
          }
        });
        return extracted;
      }
    }

    return properties;
  }

  var CONTINUE = {};

  function mixinProperties(mixinsMeta, mixin) {
    if (mixin instanceof Mixin) {
      if (mixinsMeta.hasMixin(mixin)) {
        return CONTINUE;
      }

      mixinsMeta.addMixin(mixin);
      return mixin.properties;
    } else {
      return mixin; // apply anonymous mixin properties
    }
  }

  function concatenatedMixinProperties(concatProp, props, values, base) {
    // reset before adding each new mixin to pickup concats from previous
    var concats = values[concatProp] || base[concatProp];

    if (props[concatProp]) {
      concats = concats ? a_concat.call(concats, props[concatProp]) : props[concatProp];
    }

    return concats;
  }

  function giveDecoratorSuper(meta$$1, key, decorator, values, descs, base) {
    var property = descriptorForDecorator(decorator);
    var superProperty;

    if (!(property instanceof ComputedProperty) || property._getter === undefined) {
      return decorator;
    } // Computed properties override methods, and do not call super to them


    if (values[key] === undefined) {
      // Find the original descriptor in a parent mixin
      superProperty = descriptorForDecorator(descs[key]);
    } // If we didn't find the original descriptor in a parent mixin, find
    // it on the original object.


    if (!superProperty) {
      superProperty = descriptorForProperty(base, key, meta$$1);
    }

    if (superProperty === undefined || !(superProperty instanceof ComputedProperty)) {
      return decorator;
    }

    var get = (0, _utils.wrap)(property._getter, superProperty._getter);
    var set;

    if (superProperty._setter) {
      if (property._setter) {
        set = (0, _utils.wrap)(property._setter, superProperty._setter);
      } else {
        // If the super property has a setter, we default to using it no matter what.
        // This is clearly very broken and weird, but it's what was here so we have
        // to keep it until the next major at least.
        //
        // TODO: Add a deprecation here.
        set = superProperty._setter;
      }
    } else {
      set = property._setter;
    } // only create a new CP if we must


    if (get !== property._getter || set !== property._setter) {
      // Since multiple mixins may inherit from the same parent, we need
      // to clone the computed property so that other mixins do not receive
      // the wrapped version.
      var newProperty = Object.create(property);
      newProperty._getter = get;
      newProperty._setter = set;
      return makeComputedDecorator(newProperty, ComputedProperty);
    }

    return decorator;
  }

  function giveMethodSuper(obj, key, method, values, descs) {
    // Methods overwrite computed properties, and do not call super to them.
    if (descs[key] !== undefined) {
      return method;
    } // Find the original method in a parent mixin


    var superMethod = values[key]; // If we didn't find the original value in a parent mixin, find it in
    // the original object

    if (superMethod === undefined && descriptorForProperty(obj, key) === undefined) {
      superMethod = obj[key];
    } // Only wrap the new method if the original method was a function


    if (typeof superMethod === 'function') {
      return (0, _utils.wrap)(method, superMethod);
    }

    return method;
  }

  function applyConcatenatedProperties(obj, key, value$$1, values) {
    var baseValue = values[key] || obj[key];
    var ret = (0, _utils.makeArray)(baseValue).concat((0, _utils.makeArray)(value$$1));

    if (false
    /* DEBUG */
    ) {
      // it is possible to use concatenatedProperties with strings (which cannot be frozen)
      // only freeze objects...
      if (typeof ret === 'object' && ret !== null) {
        // prevent mutating `concatenatedProperties` array after it is applied
        Object.freeze(ret);
      }
    }

    return ret;
  }

  function applyMergedProperties(obj, key, value$$1, values) {
    var baseValue = values[key] || obj[key];
    (false && !(!isArray(value$$1)) && (0, _debug.assert)("You passed in `" + JSON.stringify(value$$1) + "` as the value for `" + key + "` but `" + key + "` cannot be an Array", !isArray(value$$1)));

    if (!baseValue) {
      return value$$1;
    }

    var newBase = (0, _polyfills.assign)({}, baseValue);
    var hasFunction = false;

    for (var prop in value$$1) {
      if (!value$$1.hasOwnProperty(prop)) {
        continue;
      }

      var propValue = value$$1[prop];

      if (isMethod(propValue)) {
        // TODO: support for Computed Properties, etc?
        hasFunction = true;
        newBase[prop] = giveMethodSuper(obj, prop, propValue, baseValue, {});
      } else {
        newBase[prop] = propValue;
      }
    }

    if (hasFunction) {
      newBase._super = _utils.ROOT;
    }

    return newBase;
  }

  function addNormalizedProperty(base, key, value$$1, meta$$1, descs, values, concats, mergings) {
    if (isClassicDecorator(value$$1)) {
      // Wrap descriptor function to implement _super() if needed
      descs[key] = giveDecoratorSuper(meta$$1, key, value$$1, values, descs, base);
      values[key] = undefined;
    } else {
      if (concats && concats.indexOf(key) >= 0 || key === 'concatenatedProperties' || key === 'mergedProperties') {
        value$$1 = applyConcatenatedProperties(base, key, value$$1, values);
      } else if (mergings && mergings.indexOf(key) > -1) {
        value$$1 = applyMergedProperties(base, key, value$$1, values);
      } else if (isMethod(value$$1)) {
        value$$1 = giveMethodSuper(base, key, value$$1, values, descs);
      }

      descs[key] = undefined;
      values[key] = value$$1;
    }
  }

  function mergeMixins(mixins, meta$$1, descs, values, base, keys) {
    var currentMixin, props, key, concats, mergings;

    function removeKeys(keyName) {
      delete descs[keyName];
      delete values[keyName];
    }

    for (var i = 0; i < mixins.length; i++) {
      currentMixin = mixins[i];
      (false && !(typeof currentMixin === 'object' && currentMixin !== null && Object.prototype.toString.call(currentMixin) !== '[object Array]') && (0, _debug.assert)("Expected hash or Mixin instance, got " + Object.prototype.toString.call(currentMixin), typeof currentMixin === 'object' && currentMixin !== null && Object.prototype.toString.call(currentMixin) !== '[object Array]'));
      props = mixinProperties(meta$$1, currentMixin);

      if (props === CONTINUE) {
        continue;
      }

      if (props) {
        // remove willMergeMixin after 3.4 as it was used for _actions
        if (base.willMergeMixin) {
          base.willMergeMixin(props);
        }

        concats = concatenatedMixinProperties('concatenatedProperties', props, values, base);
        mergings = concatenatedMixinProperties('mergedProperties', props, values, base);

        for (key in props) {
          if (!props.hasOwnProperty(key)) {
            continue;
          }

          keys.push(key);
          addNormalizedProperty(base, key, props[key], meta$$1, descs, values, concats, mergings);
        } // manually copy toString() because some JS engines do not enumerate it


        if (props.hasOwnProperty('toString')) {
          base.toString = props.toString;
        }
      } else if (currentMixin.mixins) {
        mergeMixins(currentMixin.mixins, meta$$1, descs, values, base, keys);

        if (currentMixin._without) {
          currentMixin._without.forEach(removeKeys);
        }
      }
    }
  }

  var followMethodAlias;

  if (_deprecatedFeatures.ALIAS_METHOD) {
    followMethodAlias = function followMethodAlias(obj, alias, descs, values) {
      var altKey = alias.methodName;
      var possibleDesc;
      var desc = descs[altKey];
      var value$$1 = values[altKey];

      if (desc !== undefined || value$$1 !== undefined) {// do nothing
      } else if ((possibleDesc = descriptorForProperty(obj, altKey)) !== undefined) {
        desc = possibleDesc;
        value$$1 = undefined;
      } else {
        desc = undefined;
        value$$1 = obj[altKey];
      }

      return {
        desc: desc,
        value: value$$1
      };
    };
  }

  function updateObserversAndListeners(obj, key, fn, add) {
    var observers = (0, _utils.getObservers)(fn);
    var listeners = (0, _utils.getListeners)(fn);

    if (observers !== undefined) {
      var updateObserver = add ? addObserver : removeObserver;

      for (var i = 0; i < observers.paths.length; i++) {
        updateObserver(obj, observers.paths[i], null, key, observers.sync);
      }
    }

    if (listeners !== undefined) {
      var updateListener = add ? addListener : removeListener;

      for (var _i2 = 0; _i2 < listeners.length; _i2++) {
        updateListener(obj, listeners[_i2], null, key);
      }
    }
  }

  function replaceObserversAndListeners(obj, key, prev, next) {
    if (typeof prev === 'function') {
      updateObserversAndListeners(obj, key, prev, false);
    }

    if (typeof next === 'function') {
      updateObserversAndListeners(obj, key, next, true);
    }
  }

  function applyMixin(obj, mixins) {
    var descs = {};
    var values = {};
    var meta$$1 = (0, _meta2.meta)(obj);
    var keys = [];
    var key, value$$1, desc;
    obj._super = _utils.ROOT; // Go through all mixins and hashes passed in, and:
    //
    // * Handle concatenated properties
    // * Handle merged properties
    // * Set up _super wrapping if necessary
    // * Set up computed property descriptors
    // * Copying `toString` in broken browsers

    mergeMixins(mixins, meta$$1, descs, values, obj, keys);

    for (var i = 0; i < keys.length; i++) {
      key = keys[i];

      if (key === 'constructor' || !values.hasOwnProperty(key)) {
        continue;
      }

      desc = descs[key];
      value$$1 = values[key];

      if (_deprecatedFeatures.ALIAS_METHOD) {
        while (value$$1 && value$$1 instanceof AliasImpl) {
          var followed = followMethodAlias(obj, value$$1, descs, values);
          desc = followed.desc;
          value$$1 = followed.value;
        }
      }

      if (desc === undefined && value$$1 === undefined) {
        continue;
      }

      if (descriptorForProperty(obj, key) !== undefined) {
        replaceObserversAndListeners(obj, key, null, value$$1);
      } else {
        replaceObserversAndListeners(obj, key, obj[key], value$$1);
      }

      defineProperty(obj, key, desc, value$$1, meta$$1);
    }

    return obj;
  }
  /**
    @method mixin
    @param obj
    @param mixins*
    @return obj
    @private
  */


  function mixin(obj) {
    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key5 = 1; _key5 < _len4; _key5++) {
      args[_key5 - 1] = arguments[_key5];
    }

    applyMixin(obj, args);
    return obj;
  }
  /**
    The `Mixin` class allows you to create mixins, whose properties can be
    added to other classes. For instance,
  
    ```javascript
    import Mixin from '@ember/object/mixin';
  
    const EditableMixin = Mixin.create({
      edit() {
        console.log('starting to edit');
        this.set('isEditing', true);
      },
      isEditing: false
    });
    ```
  
    ```javascript
    import EmberObject from '@ember/object';
    import EditableMixin from '../mixins/editable';
  
    // Mix mixins into classes by passing them as the first arguments to
    // `.extend.`
    const Comment = EmberObject.extend(EditableMixin, {
      post: null
    });
  
    let comment = Comment.create({
      post: somePost
    });
  
    comment.edit(); // outputs 'starting to edit'
    ```
  
    Note that Mixins are created with `Mixin.create`, not
    `Mixin.extend`.
  
    Note that mixins extend a constructor's prototype so arrays and object literals
    defined as properties will be shared amongst objects that implement the mixin.
    If you want to define a property in a mixin that is not shared, you can define
    it either as a computed property or have it be created on initialization of the object.
  
    ```javascript
    // filters array will be shared amongst any object implementing mixin
    import Mixin from '@ember/object/mixin';
    import { A } from '@ember/array';
  
    const FilterableMixin = Mixin.create({
      filters: A()
    });
    ```
  
    ```javascript
    import Mixin from '@ember/object/mixin';
    import { A } from '@ember/array';
    import { computed } from '@ember/object';
  
    // filters will be a separate array for every object implementing the mixin
    const FilterableMixin = Mixin.create({
      filters: computed(function() {
        return A();
      })
    });
    ```
  
    ```javascript
    import Mixin from '@ember/object/mixin';
    import { A } from '@ember/array';
  
    // filters will be created as a separate array during the object's initialization
    const Filterable = Mixin.create({
      filters: null,
  
      init() {
        this._super(...arguments);
        this.set("filters", A());
      }
    });
    ```
  
    @class Mixin
    @public
  */


  var Mixin =
  /*#__PURE__*/
  function () {
    function Mixin(mixins, properties) {
      this.properties = extractAccessors(properties);
      this.mixins = buildMixinsArray(mixins);
      this.ownerConstructor = undefined;
      this._without = undefined;

      if (false
      /* DEBUG */
      ) {
        /*
          In debug builds, we seal mixins to help avoid performance pitfalls.
                 In IE11 there is a quirk that prevents sealed objects from being added
          to a WeakMap. Unfortunately, the mixin system currently relies on
          weak maps in `guidFor`, so we need to prime the guid cache weak map.
        */
        (0, _utils.guidFor)(this);
        Object.seal(this);
      }
    }
    /**
      @method create
      @for @ember/object/mixin
      @static
      @param arguments*
      @public
    */


    Mixin.create = function create() {
      // ES6TODO: this relies on a global state?
      setUnprocessedMixins();
      var M = this;

      for (var _len5 = arguments.length, args = new Array(_len5), _key6 = 0; _key6 < _len5; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return new M(args, undefined);
    } // returns the mixins currently applied to the specified object
    // TODO: Make `mixin`
    ;

    Mixin.mixins = function mixins(obj) {
      var meta$$1 = (0, _meta2.peekMeta)(obj);
      var ret = [];

      if (meta$$1 === null) {
        return ret;
      }

      meta$$1.forEachMixins(function (currentMixin) {
        // skip primitive mixins since these are always anonymous
        if (!currentMixin.properties) {
          ret.push(currentMixin);
        }
      });
      return ret;
    }
    /**
      @method reopen
      @param arguments*
      @private
    */
    ;

    var _proto12 = Mixin.prototype;

    _proto12.reopen = function reopen() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key7 = 0; _key7 < _len6; _key7++) {
        args[_key7] = arguments[_key7];
      }

      if (args.length === 0) {
        return;
      }

      if (this.properties) {
        var currentMixin = new Mixin(undefined, this.properties);
        this.properties = undefined;
        this.mixins = [currentMixin];
      } else if (!this.mixins) {
        this.mixins = [];
      }

      this.mixins = this.mixins.concat(buildMixinsArray(args));
      return this;
    }
    /**
      @method apply
      @param obj
      @return applied object
      @private
    */
    ;

    _proto12.apply = function apply(obj) {
      return applyMixin(obj, [this]);
    };

    _proto12.applyPartial = function applyPartial(obj) {
      return applyMixin(obj, [this]);
    }
    /**
      @method detect
      @param obj
      @return {Boolean}
      @private
    */
    ;

    _proto12.detect = function detect(obj) {
      if (typeof obj !== 'object' || obj === null) {
        return false;
      }

      if (obj instanceof Mixin) {
        return _detect(obj, this);
      }

      var meta$$1 = (0, _meta2.peekMeta)(obj);

      if (meta$$1 === null) {
        return false;
      }

      return meta$$1.hasMixin(this);
    };

    _proto12.without = function without() {
      var ret = new Mixin([this]);

      for (var _len7 = arguments.length, args = new Array(_len7), _key8 = 0; _key8 < _len7; _key8++) {
        args[_key8] = arguments[_key8];
      }

      ret._without = args;
      return ret;
    };

    _proto12.keys = function keys() {
      return _keys(this);
    };

    _proto12.toString = function toString() {
      return '(unknown mixin)';
    };

    return Mixin;
  }();

  _exports.Mixin = Mixin;

  function buildMixinsArray(mixins) {
    var length = mixins && mixins.length || 0;
    var m = undefined;

    if (length > 0) {
      m = new Array(length);

      for (var i = 0; i < length; i++) {
        var x = mixins[i];
        (false && !(typeof x === 'object' && x !== null && Object.prototype.toString.call(x) !== '[object Array]') && (0, _debug.assert)("Expected hash or Mixin instance, got " + Object.prototype.toString.call(x), typeof x === 'object' && x !== null && Object.prototype.toString.call(x) !== '[object Array]'));

        if (x instanceof Mixin) {
          m[i] = x;
        } else {
          m[i] = new Mixin(undefined, x);
        }
      }
    }

    return m;
  }

  Mixin.prototype.toString = classToString;

  if (false
  /* DEBUG */
  ) {
    Object.seal(Mixin.prototype);
  }

  function _detect(curMixin, targetMixin, seen) {
    if (seen === void 0) {
      seen = new Set();
    }

    if (seen.has(curMixin)) {
      return false;
    }

    seen.add(curMixin);

    if (curMixin === targetMixin) {
      return true;
    }

    var mixins = curMixin.mixins;

    if (mixins) {
      return mixins.some(function (mixin) {
        return _detect(mixin, targetMixin, seen);
      });
    }

    return false;
  }

  function _keys(mixin, ret, seen) {
    if (ret === void 0) {
      ret = new Set();
    }

    if (seen === void 0) {
      seen = new Set();
    }

    if (seen.has(mixin)) {
      return;
    }

    seen.add(mixin);

    if (mixin.properties) {
      var props = Object.keys(mixin.properties);

      for (var i = 0; i < props.length; i++) {
        ret.add(props[i]);
      }
    } else if (mixin.mixins) {
      mixin.mixins.forEach(function (x) {
        return _keys(x, ret, seen);
      });
    }

    return ret;
  }

  var AliasImpl;

  if (_deprecatedFeatures.ALIAS_METHOD) {
    AliasImpl = function AliasImpl(methodName) {
      this.methodName = methodName;
    };
  }
  /**
    Makes a method available via an additional name.
  
    ```app/utils/person.js
    import EmberObject, {
      aliasMethod
    } from '@ember/object';
  
    export default EmberObject.extend({
      name() {
        return 'Tomhuda Katzdale';
      },
      moniker: aliasMethod('name')
    });
    ```
  
    ```javascript
    let goodGuy = Person.create();
  
    goodGuy.name();    // 'Tomhuda Katzdale'
    goodGuy.moniker(); // 'Tomhuda Katzdale'
    ```
  
    @method aliasMethod
    @static
    @deprecated Use a shared utility method instead
    @for @ember/object
    @param {String} methodName name of the method to alias
    @public
  */


  var aliasMethod;
  _exports.aliasMethod = aliasMethod;

  if (_deprecatedFeatures.ALIAS_METHOD) {
    _exports.aliasMethod = aliasMethod = function aliasMethod(methodName) {
      (false && !(false) && (0, _debug.deprecate)("You attempted to alias '" + methodName + ", but aliasMethod has been deprecated. Consider extracting the method into a shared utility function.", false, {
        id: 'object.alias-method',
        until: '4.0.0',
        url: 'https://emberjs.com/deprecations/v3.x#toc_object-alias-method'
      }));
      return new AliasImpl(methodName);
    };
  }

  function observer() {
    for (var _len8 = arguments.length, args = new Array(_len8), _key9 = 0; _key9 < _len8; _key9++) {
      args[_key9] = arguments[_key9];
    }

    var funcOrDef = args.pop();
    (false && !(typeof funcOrDef === 'function' || typeof funcOrDef === 'object' && funcOrDef !== null) && (0, _debug.assert)('observer must be provided a function or an observer definition', typeof funcOrDef === 'function' || typeof funcOrDef === 'object' && funcOrDef !== null));
    var func, dependentKeys, sync;

    if (typeof funcOrDef === 'function') {
      func = funcOrDef;
      dependentKeys = args;
      sync = !_environment.ENV._DEFAULT_ASYNC_OBSERVERS;
    } else {
      func = funcOrDef.fn;
      dependentKeys = funcOrDef.dependentKeys;
      sync = funcOrDef.sync;
    }

    (false && !(typeof func === 'function') && (0, _debug.assert)('observer called without a function', typeof func === 'function'));
    (false && !(Array.isArray(dependentKeys) && dependentKeys.length > 0 && dependentKeys.every(function (p) {
      return typeof p === 'string' && Boolean(p.length);
    })) && (0, _debug.assert)('observer called without valid path', Array.isArray(dependentKeys) && dependentKeys.length > 0 && dependentKeys.every(function (p) {
      return typeof p === 'string' && Boolean(p.length);
    })));
    (false && !(typeof sync === 'boolean') && (0, _debug.assert)('observer called without sync', typeof sync === 'boolean'));
    var paths = [];

    var addWatchedProperty = function addWatchedProperty(path) {
      return paths.push(path);
    };

    for (var i = 0; i < dependentKeys.length; ++i) {
      expandProperties(dependentKeys[i], addWatchedProperty);
    }

    (0, _utils.setObservers)(func, {
      paths: paths,
      sync: sync
    });
    return func;
  }

  var DEBUG_INJECTION_FUNCTIONS;
  _exports.DEBUG_INJECTION_FUNCTIONS = DEBUG_INJECTION_FUNCTIONS;

  if (false
  /* DEBUG */
  ) {
    _exports.DEBUG_INJECTION_FUNCTIONS = DEBUG_INJECTION_FUNCTIONS = new WeakMap();
  }

  function inject(type) {
    (false && !(typeof type === 'string') && (0, _debug.assert)('a string type must be provided to inject', typeof type === 'string'));

    for (var _len9 = arguments.length, args = new Array(_len9 > 1 ? _len9 - 1 : 0), _key10 = 1; _key10 < _len9; _key10++) {
      args[_key10 - 1] = arguments[_key10];
    }

    var calledAsDecorator = isElementDescriptor(args);
    var source, namespace;
    var name = calledAsDecorator ? undefined : args[0];
    var options = calledAsDecorator ? undefined : args[1];

    var getInjection = function getInjection(propertyName) {
      var owner = (0, _owner.getOwner)(this) || this.container; // fallback to `container` for backwards compat

      (false && !(Boolean(owner)) && (0, _debug.assert)("Attempting to lookup an injected property on an object without a container, ensure that the object was instantiated via a container.", Boolean(owner)));
      return owner.lookup(type + ":" + (name || propertyName), {
        source: source,
        namespace: namespace
      });
    };

    if (false
    /* DEBUG */
    ) {
      DEBUG_INJECTION_FUNCTIONS.set(getInjection, {
        namespace: namespace,
        source: source,
        type: type,
        name: name
      });
    }

    var decorator = computed({
      get: getInjection,
      set: function set(keyName, value$$1) {
        defineProperty(this, keyName, null, value$$1);
      }
    });

    if (calledAsDecorator) {
      return decorator(args[0], args[1], args[2]);
    } else {
      return decorator;
    }
  }
});