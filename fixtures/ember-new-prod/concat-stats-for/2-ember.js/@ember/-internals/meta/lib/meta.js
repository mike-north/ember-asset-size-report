define("@ember/-internals/meta/lib/meta", ["exports", "ember-babel", "@ember/-internals/utils", "@ember/debug", "@glimmer/reference"], function (_exports, _emberBabel, _utils, _debug, _reference) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setMeta = setMeta;
  _exports.peekMeta = peekMeta;
  _exports.deleteMeta = deleteMeta;
  _exports.counters = _exports.meta = _exports.Meta = _exports.UNDEFINED = void 0;
  var objectPrototype = Object.prototype;
  var counters;
  _exports.counters = counters;

  if (false
  /* DEBUG */
  ) {
    _exports.counters = counters = {
      peekCalls: 0,
      peekPrototypeWalks: 0,
      setCalls: 0,
      deleteCalls: 0,
      metaCalls: 0,
      metaInstantiated: 0,
      matchingListenersCalls: 0,
      observerEventsCalls: 0,
      addToListenersCalls: 0,
      removeFromListenersCalls: 0,
      removeAllListenersCalls: 0,
      listenersInherited: 0,
      listenersFlattened: 0,
      parentListenersUsed: 0,
      flattenedListenersCalls: 0,
      reopensAfterFlatten: 0,
      readableLazyChainsCalls: 0,
      writableLazyChainsCalls: 0
    };
  }
  /**
  @module ember
  */


  var UNDEFINED = (0, _utils.symbol)('undefined');
  _exports.UNDEFINED = UNDEFINED;
  var currentListenerVersion = 1;

  var Meta =
  /*#__PURE__*/
  function () {
    function Meta(obj) {
      this._listenersVersion = 1;
      this._inheritedEnd = -1;
      this._flattenedVersion = 0;

      if (false
      /* DEBUG */
      ) {
        counters.metaInstantiated++;
        this._values = undefined;
      }

      this._parent = undefined;
      this._descriptors = undefined;
      this._watching = undefined;
      this._mixins = undefined;
      this._deps = undefined;
      this._chainWatchers = undefined;
      this._chains = undefined;
      this._tag = undefined;
      this._tags = undefined; // initial value for all flags right now is false
      // see FLAGS const for detailed list of flags used

      this._flags = 0
      /* NONE */
      ; // used only internally

      this.source = obj;
      this.proto = obj.constructor === undefined ? undefined : obj.constructor.prototype;
      this._listeners = undefined;
    }

    var _proto = Meta.prototype;

    _proto.setInitializing = function setInitializing() {
      this._flags |= 8
      /* INITIALIZING */
      ;
    };

    _proto.unsetInitializing = function unsetInitializing() {
      this._flags ^= 8
      /* INITIALIZING */
      ;
    };

    _proto.isInitializing = function isInitializing() {
      return this._hasFlag(8
      /* INITIALIZING */
      );
    };

    _proto.isPrototypeMeta = function isPrototypeMeta(obj) {
      return this.proto === this.source && this.source === obj;
    };

    _proto.destroy = function destroy() {
      if (this.isMetaDestroyed()) {
        return;
      }

      this.setMetaDestroyed(); // remove chainWatchers to remove circular references that would prevent GC

      var chains = this.readableChains();

      if (chains !== undefined) {
        chains.destroy();
      }
    };

    _proto.isSourceDestroying = function isSourceDestroying() {
      return this._hasFlag(1
      /* SOURCE_DESTROYING */
      );
    };

    _proto.setSourceDestroying = function setSourceDestroying() {
      this._flags |= 1
      /* SOURCE_DESTROYING */
      ;
    };

    _proto.isSourceDestroyed = function isSourceDestroyed() {
      return this._hasFlag(2
      /* SOURCE_DESTROYED */
      );
    };

    _proto.setSourceDestroyed = function setSourceDestroyed() {
      this._flags |= 2
      /* SOURCE_DESTROYED */
      ;
    };

    _proto.isMetaDestroyed = function isMetaDestroyed() {
      return this._hasFlag(4
      /* META_DESTROYED */
      );
    };

    _proto.setMetaDestroyed = function setMetaDestroyed() {
      this._flags |= 4
      /* META_DESTROYED */
      ;
    };

    _proto._hasFlag = function _hasFlag(flag) {
      return (this._flags & flag) === flag;
    };

    _proto._getOrCreateOwnMap = function _getOrCreateOwnMap(key) {
      return this[key] || (this[key] = Object.create(null));
    };

    _proto._getOrCreateOwnSet = function _getOrCreateOwnSet(key) {
      return this[key] || (this[key] = new Set());
    };

    _proto._findInherited1 = function _findInherited1(key) {
      var pointer = this;

      while (pointer !== null) {
        var map = pointer[key];

        if (map !== undefined) {
          return map;
        }

        pointer = pointer.parent;
      }
    };

    _proto._findInherited2 = function _findInherited2(key, subkey) {
      var pointer = this;

      while (pointer !== null) {
        var map = pointer[key];

        if (map !== undefined) {
          var value = map[subkey];

          if (value !== undefined) {
            return value;
          }
        }

        pointer = pointer.parent;
      }
    };

    _proto._findInherited3 = function _findInherited3(key, subkey, subsubkey) {
      var pointer = this;

      while (pointer !== null) {
        var map = pointer[key];

        if (map !== undefined) {
          var submap = map[subkey];

          if (submap !== undefined) {
            var value = submap[subsubkey];

            if (value !== undefined) {
              return value;
            }
          }
        }

        pointer = pointer.parent;
      }
    };

    _proto._findInheritedMap = function _findInheritedMap(key, subkey) {
      var pointer = this;

      while (pointer !== null) {
        var map = pointer[key];

        if (map !== undefined) {
          var value = map.get(subkey);

          if (value !== undefined) {
            return value;
          }
        }

        pointer = pointer.parent;
      }
    };

    _proto._hasInInheritedSet = function _hasInInheritedSet(key, value) {
      var pointer = this;

      while (pointer !== null) {
        var set = pointer[key];

        if (set !== undefined && set.has(value)) {
          return true;
        }

        pointer = pointer.parent;
      }

      return false;
    } // Implements a member that provides a lazily created map of maps,
    // with inheritance at both levels.
    ;

    _proto.writeDeps = function writeDeps(subkey, itemkey, count) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot modify dependent keys for `" + itemkey + "` on `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));

      var outerMap = this._getOrCreateOwnMap('_deps');

      var innerMap = outerMap[subkey];

      if (innerMap === undefined) {
        innerMap = outerMap[subkey] = Object.create(null);
      }

      innerMap[itemkey] = count;
    };

    _proto.peekDeps = function peekDeps(subkey, itemkey) {
      var val = this._findInherited3('_deps', subkey, itemkey);

      return val === undefined ? 0 : val;
    };

    _proto.hasDeps = function hasDeps(subkey) {
      var val = this._findInherited2('_deps', subkey);

      return val !== undefined;
    };

    _proto.forEachInDeps = function forEachInDeps(subkey, fn) {
      var pointer = this;
      var seen;

      while (pointer !== null) {
        var map = pointer._deps;

        if (map !== undefined) {
          var innerMap = map[subkey];

          if (innerMap !== undefined) {
            seen = seen === undefined ? new Set() : seen;

            for (var innerKey in innerMap) {
              if (!seen.has(innerKey)) {
                seen.add(innerKey);

                if (innerMap[innerKey] > 0) {
                  fn(innerKey);
                }
              }
            }
          }
        }

        pointer = pointer.parent;
      }
    };

    _proto.writableTags = function writableTags() {
      return this._getOrCreateOwnMap('_tags');
    };

    _proto.readableTags = function readableTags() {
      return this._tags;
    };

    _proto.writableTag = function writableTag() {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot create a new tag for `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));
      var ret = this._tag;

      if (ret === undefined) {
        ret = this._tag = (0, _reference.createUpdatableTag)();
      }

      return ret;
    };

    _proto.readableTag = function readableTag() {
      return this._tag;
    };

    _proto.writableLazyChainsFor = function writableLazyChainsFor(key) {
      if (false
      /* DEBUG */
      ) {
        counters.writableLazyChainsCalls++;
      }

      var lazyChains = this._getOrCreateOwnMap('_lazyChains');

      if (!(key in lazyChains)) {
        lazyChains[key] = Object.create(null);
      }

      return lazyChains[key];
    };

    _proto.readableLazyChainsFor = function readableLazyChainsFor(key) {
      if (false
      /* DEBUG */
      ) {
        counters.readableLazyChainsCalls++;
      }

      var lazyChains = this._lazyChains;

      if (lazyChains !== undefined) {
        return lazyChains[key];
      }

      return undefined;
    };

    _proto.writableChainWatchers = function writableChainWatchers(create) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot create a new chain watcher for `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));
      var ret = this._chainWatchers;

      if (ret === undefined) {
        ret = this._chainWatchers = create(this.source);
      }

      return ret;
    };

    _proto.readableChainWatchers = function readableChainWatchers() {
      return this._chainWatchers;
    };

    _proto.writableChains = function writableChains(create) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot create a new chains for `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));
      var ret = this._chains;

      if (ret === undefined) {
        this._chains = ret = create(this.source);
        var parent = this.parent;

        if (parent !== null) {
          var parentChains = parent.writableChains(create);
          parentChains.copyTo(ret);
        }
      }

      return ret;
    };

    _proto.readableChains = function readableChains() {
      return this._findInherited1('_chains');
    };

    _proto.writeWatching = function writeWatching(subkey, value) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot update watchers for `" + subkey + "` on `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));

      var map = this._getOrCreateOwnMap('_watching');

      map[subkey] = value;
    };

    _proto.peekWatching = function peekWatching(subkey) {
      var count = this._findInherited2('_watching', subkey);

      return count === undefined ? 0 : count;
    };

    _proto.addMixin = function addMixin(mixin) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot add mixins of `" + (0, _utils.toString)(mixin) + "` on `" + (0, _utils.toString)(this.source) + "` call addMixin after it has been destroyed." : '', !this.isMetaDestroyed()));

      var set = this._getOrCreateOwnSet('_mixins');

      set.add(mixin);
    };

    _proto.hasMixin = function hasMixin(mixin) {
      return this._hasInInheritedSet('_mixins', mixin);
    };

    _proto.forEachMixins = function forEachMixins(fn) {
      var pointer = this;
      var seen;

      while (pointer !== null) {
        var set = pointer._mixins;

        if (set !== undefined) {
          seen = seen === undefined ? new Set() : seen; // TODO cleanup typing here

          set.forEach(function (mixin) {
            if (!seen.has(mixin)) {
              seen.add(mixin);
              fn(mixin);
            }
          });
        }

        pointer = pointer.parent;
      }
    };

    _proto.writeDescriptors = function writeDescriptors(subkey, value) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot update descriptors for `" + subkey + "` on `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));
      var map = this._descriptors || (this._descriptors = new Map());
      map.set(subkey, value);
    };

    _proto.peekDescriptors = function peekDescriptors(subkey) {
      var possibleDesc = this._findInheritedMap('_descriptors', subkey);

      return possibleDesc === UNDEFINED ? undefined : possibleDesc;
    };

    _proto.removeDescriptors = function removeDescriptors(subkey) {
      this.writeDescriptors(subkey, UNDEFINED);
    };

    _proto.forEachDescriptors = function forEachDescriptors(fn) {
      var pointer = this;
      var seen;

      while (pointer !== null) {
        var map = pointer._descriptors;

        if (map !== undefined) {
          seen = seen === undefined ? new Set() : seen;
          map.forEach(function (value, key) {
            if (!seen.has(key)) {
              seen.add(key);

              if (value !== UNDEFINED) {
                fn(key, value);
              }
            }
          });
        }

        pointer = pointer.parent;
      }
    };

    _proto.addToListeners = function addToListeners(eventName, target, method, once, sync) {
      if (false
      /* DEBUG */
      ) {
        counters.addToListenersCalls++;
      }

      this.pushListener(eventName, target, method, once ? 1
      /* ONCE */
      : 0
      /* ADD */
      , sync);
    };

    _proto.removeFromListeners = function removeFromListeners(eventName, target, method) {
      if (false
      /* DEBUG */
      ) {
        counters.removeFromListenersCalls++;
      }

      this.pushListener(eventName, target, method, 2
      /* REMOVE */
      );
    };

    _proto.pushListener = function pushListener(event, target, method, kind, sync) {
      if (sync === void 0) {
        sync = false;
      }

      var listeners = this.writableListeners();
      var i = indexOfListener(listeners, event, target, method); // remove if found listener was inherited

      if (i !== -1 && i < this._inheritedEnd) {
        listeners.splice(i, 1);
        this._inheritedEnd--;
        i = -1;
      } // if not found, push. Note that we must always push if a listener is not
      // found, even in the case of a function listener remove, because we may be
      // attempting to add or remove listeners _before_ flattening has occured.


      if (i === -1) {
        (false && !(!(this.isPrototypeMeta(this.source) && typeof method === 'function')) && (0, _debug.assert)('You cannot add function listeners to prototypes. Convert the listener to a string listener, or add it to the instance instead.', !(this.isPrototypeMeta(this.source) && typeof method === 'function')));
        (false && !(!(!this.isPrototypeMeta(this.source) && typeof method === 'function' && kind === 2
        /* REMOVE */
        )) && (0, _debug.assert)('You attempted to remove a function listener which did not exist on the instance, which means you may have attempted to remove it before it was added.', !(!this.isPrototypeMeta(this.source) && typeof method === 'function' && kind === 2)));
        listeners.push({
          event: event,
          target: target,
          method: method,
          kind: kind,
          sync: sync
        });
      } else {
        var listener = listeners[i]; // If the listener is our own listener and we are trying to remove it, we
        // want to splice it out entirely so we don't hold onto a reference.

        if (kind === 2
        /* REMOVE */
        && listener.kind !== 2
        /* REMOVE */
        ) {
            listeners.splice(i, 1);
          } else {
          (false && !(!(listener.kind === 0
          /* ADD */
          && kind === 0
          /* ADD */
          && listener.sync !== sync)) && (0, _debug.assert)("You attempted to add an observer for the same method on '" + event.split(':')[0] + "' twice to " + target + " as both sync and async. Observers must be either sync or async, they cannot be both. This is likely a mistake, you should either remove the code that added the observer a second time, or update it to always be sync or async. The method was " + method + ".", !(listener.kind === 0 && kind === 0 && listener.sync !== sync))); // update own listener

          listener.kind = kind;
          listener.sync = sync;
        }
      }
    };

    _proto.writableListeners = function writableListeners() {
      // Check if we need to invalidate and reflatten. We need to do this if we
      // have already flattened (flattened version is the current version) and
      // we are either writing to a prototype meta OR we have never inherited, and
      // may have cached the parent's listeners.
      if (this._flattenedVersion === currentListenerVersion && (this.source === this.proto || this._inheritedEnd === -1)) {
        if (false
        /* DEBUG */
        ) {
          counters.reopensAfterFlatten++;
        }

        currentListenerVersion++;
      } // Inherited end has not been set, then we have never created our own
      // listeners, but may have cached the parent's


      if (this._inheritedEnd === -1) {
        this._inheritedEnd = 0;
        this._listeners = [];
      }

      return this._listeners;
    }
    /**
      Flattening is based on a global revision counter. If the revision has
      bumped it means that somewhere in a class inheritance chain something has
      changed, so we need to reflatten everything. This can only happen if:
         1. A meta has been flattened (listener has been called)
      2. The meta is a prototype meta with children who have inherited its
         listeners
      3. A new listener is subsequently added to the meta (e.g. via `.reopen()`)
         This is a very rare occurence, so while the counter is global it shouldn't
      be updated very often in practice.
    */
    ;

    _proto.flattenedListeners = function flattenedListeners() {
      if (false
      /* DEBUG */
      ) {
        counters.flattenedListenersCalls++;
      }

      if (this._flattenedVersion < currentListenerVersion) {
        if (false
        /* DEBUG */
        ) {
          counters.listenersFlattened++;
        }

        var parent = this.parent;

        if (parent !== null) {
          // compute
          var parentListeners = parent.flattenedListeners();

          if (parentListeners !== undefined) {
            if (this._listeners === undefined) {
              // If this instance doesn't have any of its own listeners (writableListeners
              // has never been called) then we don't need to do any flattening, return
              // the parent's listeners instead.
              if (false
              /* DEBUG */
              ) {
                counters.parentListenersUsed++;
              }

              this._listeners = parentListeners;
            } else {
              var listeners = this._listeners;

              if (this._inheritedEnd > 0) {
                listeners.splice(0, this._inheritedEnd);
                this._inheritedEnd = 0;
              }

              for (var i = 0; i < parentListeners.length; i++) {
                var listener = parentListeners[i];
                var index = indexOfListener(listeners, listener.event, listener.target, listener.method);

                if (index === -1) {
                  if (false
                  /* DEBUG */
                  ) {
                    counters.listenersInherited++;
                  }

                  listeners.unshift(listener);
                  this._inheritedEnd++;
                }
              }
            }
          }
        }

        this._flattenedVersion = currentListenerVersion;
      }

      return this._listeners;
    };

    _proto.matchingListeners = function matchingListeners(eventName) {
      var listeners = this.flattenedListeners();
      var result;

      if (false
      /* DEBUG */
      ) {
        counters.matchingListenersCalls++;
      }

      if (listeners !== undefined) {
        for (var index = 0; index < listeners.length; index++) {
          var listener = listeners[index]; // REMOVE listeners are placeholders that tell us not to
          // inherit, so they never match. Only ADD and ONCE can match.

          if (listener.event === eventName && (listener.kind === 0
          /* ADD */
          || listener.kind === 1
          /* ONCE */
          )) {
            if (result === undefined) {
              // we create this array only after we've found a listener that
              // matches to avoid allocations when no matches are found.
              result = [];
            }

            result.push(listener.target, listener.method, listener.kind === 1
            /* ONCE */
            );
          }
        }
      }

      return result;
    };

    _proto.observerEvents = function observerEvents() {
      var listeners = this.flattenedListeners();
      var result;

      if (false
      /* DEBUG */
      ) {
        counters.observerEventsCalls++;
      }

      if (listeners !== undefined) {
        for (var index = 0; index < listeners.length; index++) {
          var listener = listeners[index]; // REMOVE listeners are placeholders that tell us not to
          // inherit, so they never match. Only ADD and ONCE can match.

          if ((listener.kind === 0
          /* ADD */
          || listener.kind === 1
          /* ONCE */
          ) && listener.event.indexOf(':change') !== -1) {
            if (result === undefined) {
              // we create this array only after we've found a listener that
              // matches to avoid allocations when no matches are found.
              result = [];
            }

            result.push(listener);
          }
        }
      }

      return result;
    };

    (0, _emberBabel.createClass)(Meta, [{
      key: "parent",
      get: function get() {
        var parent = this._parent;

        if (parent === undefined) {
          var proto = getPrototypeOf(this.source);
          this._parent = parent = proto === null || proto === objectPrototype ? null : meta(proto);
        }

        return parent;
      }
    }]);
    return Meta;
  }();

  _exports.Meta = Meta;

  if (false
  /* DEBUG */
  ) {
    Meta.prototype.writeValues = function (subkey, value) {
      (false && !(!this.isMetaDestroyed()) && (0, _debug.assert)(this.isMetaDestroyed() ? "Cannot set the value of `" + subkey + "` on `" + (0, _utils.toString)(this.source) + "` after it has been destroyed." : '', !this.isMetaDestroyed()));

      var map = this._getOrCreateOwnMap('_values');

      map[subkey] = value === undefined ? UNDEFINED : value;
    };

    Meta.prototype.peekValues = function (key) {
      var val = this._findInherited2('_values', key);

      return val === UNDEFINED ? undefined : val;
    };

    Meta.prototype.deleteFromValues = function (key) {
      delete this._getOrCreateOwnMap('_values')[key];
    };

    Meta.prototype.readInheritedValue = function (key) {
      return this._findInherited2('_values', key);
    };

    Meta.prototype.writeValue = function (obj, key, value) {
      var descriptor = (0, _utils.lookupDescriptor)(obj, key);
      var isMandatorySetter = descriptor !== null && descriptor.set && descriptor.set.isMandatorySetter;

      if (isMandatorySetter) {
        this.writeValues(key, value);
      } else {
        obj[key] = value;
      }
    };
  }

  var getPrototypeOf = Object.getPrototypeOf;
  var metaStore = new WeakMap();

  function setMeta(obj, meta) {
    (false && !(obj !== null) && (0, _debug.assert)('Cannot call `setMeta` on null', obj !== null));
    (false && !(obj !== undefined) && (0, _debug.assert)('Cannot call `setMeta` on undefined', obj !== undefined));
    (false && !(typeof obj === 'object' || typeof obj === 'function') && (0, _debug.assert)("Cannot call `setMeta` on " + typeof obj, typeof obj === 'object' || typeof obj === 'function'));

    if (false
    /* DEBUG */
    ) {
      counters.setCalls++;
    }

    metaStore.set(obj, meta);
  }

  function peekMeta(obj) {
    (false && !(obj !== null) && (0, _debug.assert)('Cannot call `peekMeta` on null', obj !== null));
    (false && !(obj !== undefined) && (0, _debug.assert)('Cannot call `peekMeta` on undefined', obj !== undefined));
    (false && !(typeof obj === 'object' || typeof obj === 'function') && (0, _debug.assert)("Cannot call `peekMeta` on " + typeof obj, typeof obj === 'object' || typeof obj === 'function'));

    if (false
    /* DEBUG */
    ) {
      counters.peekCalls++;
    }

    var meta = metaStore.get(obj);

    if (meta !== undefined) {
      return meta;
    }

    var pointer = getPrototypeOf(obj);

    while (pointer !== null) {
      if (false
      /* DEBUG */
      ) {
        counters.peekPrototypeWalks++;
      }

      meta = metaStore.get(pointer);

      if (meta !== undefined) {
        if (meta.proto !== pointer) {
          // The meta was a prototype meta which was not marked as initializing.
          // This can happen when a prototype chain was created manually via
          // Object.create() and the source object does not have a constructor.
          meta.proto = pointer;
        }

        return meta;
      }

      pointer = getPrototypeOf(pointer);
    }

    return null;
  }
  /**
    Tears down the meta on an object so that it can be garbage collected.
    Multiple calls will have no effect.
  
    @method deleteMeta
    @for Ember
    @param {Object} obj  the object to destroy
    @return {void}
    @private
  */


  function deleteMeta(obj) {
    (false && !(obj !== null) && (0, _debug.assert)('Cannot call `deleteMeta` on null', obj !== null));
    (false && !(obj !== undefined) && (0, _debug.assert)('Cannot call `deleteMeta` on undefined', obj !== undefined));
    (false && !(typeof obj === 'object' || typeof obj === 'function') && (0, _debug.assert)("Cannot call `deleteMeta` on " + typeof obj, typeof obj === 'object' || typeof obj === 'function'));

    if (false
    /* DEBUG */
    ) {
      counters.deleteCalls++;
    }

    var meta = peekMeta(obj);

    if (meta !== null) {
      meta.destroy();
    }
  }
  /**
    Retrieves the meta hash for an object. If `writable` is true ensures the
    hash is writable for this object as well.
  
    The meta object contains information about computed property descriptors as
    well as any watched properties and other information. You generally will
    not access this information directly but instead work with higher level
    methods that manipulate this hash indirectly.
  
    @method meta
    @for Ember
    @private
  
    @param {Object} obj The object to retrieve meta for
    @param {Boolean} [writable=true] Pass `false` if you do not intend to modify
      the meta hash, allowing the method to avoid making an unnecessary copy.
    @return {Object} the meta hash for an object
  */


  var meta = function meta(obj) {
    (false && !(obj !== null) && (0, _debug.assert)('Cannot call `meta` on null', obj !== null));
    (false && !(obj !== undefined) && (0, _debug.assert)('Cannot call `meta` on undefined', obj !== undefined));
    (false && !(typeof obj === 'object' || typeof obj === 'function') && (0, _debug.assert)("Cannot call `meta` on " + typeof obj, typeof obj === 'object' || typeof obj === 'function'));

    if (false
    /* DEBUG */
    ) {
      counters.metaCalls++;
    }

    var maybeMeta = peekMeta(obj); // remove this code, in-favor of explicit parent

    if (maybeMeta !== null && maybeMeta.source === obj) {
      return maybeMeta;
    }

    var newMeta = new Meta(obj);
    setMeta(obj, newMeta);
    return newMeta;
  };

  _exports.meta = meta;

  if (false
  /* DEBUG */
  ) {
    meta._counters = counters;
  }

  function indexOfListener(listeners, event, target, method) {
    for (var i = listeners.length - 1; i >= 0; i--) {
      var listener = listeners[i];

      if (listener.event === event && listener.target === target && listener.method === method) {
        return i;
      }
    }

    return -1;
  }
});