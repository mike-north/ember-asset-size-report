define("@glimmer/reference", ["exports", "ember-babel", "@glimmer/util"], function (_exports, _emberBabel, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.map = map;
  _exports.isModified = isModified;
  _exports.bump = bump;
  _exports.value = _value2;
  _exports.validate = validate;
  _exports.createTag = createTag;
  _exports.createUpdatableTag = createUpdatableTag;
  _exports.isConst = isConst;
  _exports.isConstTag = isConstTag;
  _exports.combineTagged = combineTagged;
  _exports.combineSlice = combineSlice;
  _exports.combine = combine;
  _exports.CURRENT_TAG = _exports.VOLATILE_TAG = _exports.CONSTANT_TAG = _exports.update = _exports.dirty = _exports.MonomorphicTagImpl = _exports.ALLOW_CYCLES = _exports.COMPUTE = _exports.VOLATILE = _exports.INITIAL = _exports.CONSTANT = _exports.IteratorSynchronizer = _exports.ReferenceIterator = _exports.IterationArtifacts = _exports.ListItem = _exports.ConstReference = _exports.ReferenceCache = _exports.CachedReference = void 0;
  var symbol = typeof Symbol !== 'undefined' ? Symbol : function (key) {
    return "__" + key + Math.floor(Math.random() * Date.now()) + "__";
  };
  var CONSTANT = 0;
  _exports.CONSTANT = CONSTANT;
  var INITIAL = 1;
  _exports.INITIAL = INITIAL;
  var VOLATILE = 9007199254740991; // MAX_INT

  _exports.VOLATILE = VOLATILE;
  var $REVISION = INITIAL;

  function bump() {
    $REVISION++;
  } //////////


  var COMPUTE = symbol('TAG_COMPUTE'); //////////

  /**
   * `value` receives a tag and returns an opaque Revision based on that tag. This
   * snapshot can then later be passed to `validate` with the same tag to
   * determine if the tag has changed at all since the time that `value` was
   * called.
   *
   * The current implementation returns the global revision count directly for
   * performance reasons. This is an implementation detail, and should not be
   * relied on directly by users of these APIs. Instead, Revisions should be
   * treated as if they are opaque/unknown, and should only be interacted with via
   * the `value`/`validate` API.
   *
   * @param tag
   */

  _exports.COMPUTE = COMPUTE;

  function _value2(_tag) {
    return $REVISION;
  }
  /**
   * `validate` receives a tag and a snapshot from a previous call to `value` with
   * the same tag, and determines if the tag is still valid compared to the
   * snapshot. If the tag's state has changed at all since then, `validate` will
   * return false, otherwise it will return true. This is used to determine if a
   * calculation related to the tags should be rerun.
   *
   * @param tag
   * @param snapshot
   */


  function validate(tag, snapshot) {
    return snapshot >= tag[COMPUTE]();
  }

  var TYPE = symbol('TAG_TYPE');
  var ALLOW_CYCLES;
  _exports.ALLOW_CYCLES = ALLOW_CYCLES;

  var MonomorphicTagImpl =
  /*#__PURE__*/
  function () {
    function MonomorphicTagImpl(type) {
      this.revision = INITIAL;
      this.lastChecked = INITIAL;
      this.lastValue = INITIAL;
      this.isUpdating = false;
      this.subtag = null;
      this.subtags = null;
      this[TYPE] = type;
    }

    var _proto = MonomorphicTagImpl.prototype;

    _proto[COMPUTE] = function () {
      var lastChecked = this.lastChecked;

      if (lastChecked !== $REVISION) {
        this.isUpdating = true;
        this.lastChecked = $REVISION;

        try {
          var subtags = this.subtags,
              subtag = this.subtag,
              revision = this.revision;

          if (subtag !== null) {
            revision = Math.max(revision, subtag[COMPUTE]());
          }

          if (subtags !== null) {
            for (var i = 0; i < subtags.length; i++) {
              var _value = subtags[i][COMPUTE]();

              revision = Math.max(_value, revision);
            }
          }

          this.lastValue = revision;
        } finally {
          this.isUpdating = false;
        }
      }

      if (this.isUpdating === true) {
        this.lastChecked = ++$REVISION;
      }

      return this.lastValue;
    };

    MonomorphicTagImpl.update = function update(_tag, subtag) {
      // TODO: TS 3.7 should allow us to do this via assertion
      var tag = _tag;

      if (subtag === CONSTANT_TAG) {
        tag.subtag = null;
      } else {
        tag.subtag = subtag; // subtag could be another type of tag, e.g. CURRENT_TAG or VOLATILE_TAG.
        // If so, lastChecked/lastValue will be undefined, result in these being
        // NaN. This is fine, it will force the system to recompute.

        tag.lastChecked = Math.min(tag.lastChecked, subtag.lastChecked);
        tag.lastValue = Math.max(tag.lastValue, subtag.lastValue);
      }
    };

    MonomorphicTagImpl.dirty = function dirty(tag) {
      tag.revision = ++$REVISION;
    };

    return MonomorphicTagImpl;
  }();

  _exports.MonomorphicTagImpl = MonomorphicTagImpl;
  var dirty = MonomorphicTagImpl.dirty;
  _exports.dirty = dirty;
  var update = MonomorphicTagImpl.update; //////////

  _exports.update = update;

  function createTag() {
    return new MonomorphicTagImpl(0
    /* Dirtyable */
    );
  }

  function createUpdatableTag() {
    return new MonomorphicTagImpl(1
    /* Updatable */
    );
  } //////////


  var CONSTANT_TAG = new MonomorphicTagImpl(3
  /* Constant */
  );
  _exports.CONSTANT_TAG = CONSTANT_TAG;

  function isConst(_ref) {
    var tag = _ref.tag;
    return tag === CONSTANT_TAG;
  }

  function isConstTag(tag) {
    return tag === CONSTANT_TAG;
  } //////////


  var VolatileTag =
  /*#__PURE__*/
  function () {
    function VolatileTag() {}

    var _proto2 = VolatileTag.prototype;

    _proto2[COMPUTE] = function () {
      return VOLATILE;
    };

    return VolatileTag;
  }();

  var VOLATILE_TAG = new VolatileTag(); //////////

  _exports.VOLATILE_TAG = VOLATILE_TAG;

  var CurrentTag =
  /*#__PURE__*/
  function () {
    function CurrentTag() {}

    var _proto3 = CurrentTag.prototype;

    _proto3[COMPUTE] = function () {
      return $REVISION;
    };

    return CurrentTag;
  }();

  var CURRENT_TAG = new CurrentTag(); //////////

  _exports.CURRENT_TAG = CURRENT_TAG;

  function combineTagged(tagged) {
    var optimized = [];

    for (var i = 0, l = tagged.length; i < l; i++) {
      var tag = tagged[i].tag;
      if (tag === CONSTANT_TAG) continue;
      optimized.push(tag);
    }

    return _combine(optimized);
  }

  function combineSlice(slice) {
    var optimized = [];
    var node = slice.head();

    while (node !== null) {
      var tag = node.tag;
      if (tag !== CONSTANT_TAG) optimized.push(tag);
      node = slice.nextNode(node);
    }

    return _combine(optimized);
  }

  function combine(tags) {
    var optimized = [];

    for (var i = 0, l = tags.length; i < l; i++) {
      var tag = tags[i];
      if (tag === CONSTANT_TAG) continue;
      optimized.push(tag);
    }

    return _combine(optimized);
  }

  function _combine(tags) {
    switch (tags.length) {
      case 0:
        return CONSTANT_TAG;

      case 1:
        return tags[0];

      default:
        var tag = new MonomorphicTagImpl(2
        /* Combinator */
        );
        tag.subtags = tags;
        return tag;
    }
  }

  var CachedReference =
  /*#__PURE__*/
  function () {
    function CachedReference() {
      this.lastRevision = null;
      this.lastValue = null;
    }

    var _proto4 = CachedReference.prototype;

    _proto4.value = function value() {
      var tag = this.tag,
          lastRevision = this.lastRevision,
          lastValue = this.lastValue;

      if (lastRevision === null || !validate(tag, lastRevision)) {
        lastValue = this.lastValue = this.compute();
        this.lastRevision = _value2(tag);
      }

      return lastValue;
    };

    _proto4.invalidate = function invalidate() {
      this.lastRevision = null;
    };

    return CachedReference;
  }();

  _exports.CachedReference = CachedReference;

  var MapperReference =
  /*#__PURE__*/
  function (_CachedReference) {
    (0, _emberBabel.inheritsLoose)(MapperReference, _CachedReference);

    function MapperReference(reference, mapper) {
      var _this;

      _this = _CachedReference.call(this) || this;
      _this.tag = reference.tag;
      _this.reference = reference;
      _this.mapper = mapper;
      return _this;
    }

    var _proto5 = MapperReference.prototype;

    _proto5.compute = function compute() {
      var reference = this.reference,
          mapper = this.mapper;
      return mapper(reference.value());
    };

    return MapperReference;
  }(CachedReference);

  function map(reference, mapper) {
    return new MapperReference(reference, mapper);
  } //////////


  var ReferenceCache =
  /*#__PURE__*/
  function () {
    function ReferenceCache(reference) {
      this.lastValue = null;
      this.lastRevision = null;
      this.initialized = false;
      this.tag = reference.tag;
      this.reference = reference;
    }

    var _proto6 = ReferenceCache.prototype;

    _proto6.peek = function peek() {
      if (!this.initialized) {
        return this.initialize();
      }

      return this.lastValue;
    };

    _proto6.revalidate = function revalidate() {
      if (!this.initialized) {
        return this.initialize();
      }

      var reference = this.reference,
          lastRevision = this.lastRevision;
      var tag = reference.tag;
      if (validate(tag, lastRevision)) return NOT_MODIFIED;
      this.lastRevision = _value2(tag);
      var lastValue = this.lastValue;
      var currentValue = reference.value();
      if (currentValue === lastValue) return NOT_MODIFIED;
      this.lastValue = currentValue;
      return currentValue;
    };

    _proto6.initialize = function initialize() {
      var reference = this.reference;
      var currentValue = this.lastValue = reference.value();
      this.lastRevision = _value2(reference.tag);
      this.initialized = true;
      return currentValue;
    };

    return ReferenceCache;
  }();

  _exports.ReferenceCache = ReferenceCache;
  var NOT_MODIFIED = 'adb3b78e-3d22-4e4b-877a-6317c2c5c145';

  function isModified(value$$1) {
    return value$$1 !== NOT_MODIFIED;
  }

  var ConstReference =
  /*#__PURE__*/
  function () {
    function ConstReference(inner) {
      this.inner = inner;
      this.tag = CONSTANT_TAG;
    }

    var _proto7 = ConstReference.prototype;

    _proto7.value = function value() {
      return this.inner;
    };

    return ConstReference;
  }();

  _exports.ConstReference = ConstReference;

  var ListItem =
  /*#__PURE__*/
  function (_ListNode) {
    (0, _emberBabel.inheritsLoose)(ListItem, _ListNode);

    function ListItem(iterable, result) {
      var _this2;

      _this2 = _ListNode.call(this, iterable.valueReferenceFor(result)) || this;
      _this2.retained = false;
      _this2.seen = false;
      _this2.key = result.key;
      _this2.iterable = iterable;
      _this2.memo = iterable.memoReferenceFor(result);
      return _this2;
    }

    var _proto8 = ListItem.prototype;

    _proto8.update = function update(item) {
      this.retained = true;
      this.iterable.updateValueReference(this.value, item);
      this.iterable.updateMemoReference(this.memo, item);
    };

    _proto8.shouldRemove = function shouldRemove() {
      return !this.retained;
    };

    _proto8.reset = function reset() {
      this.retained = false;
      this.seen = false;
    };

    return ListItem;
  }(_util.ListNode);

  _exports.ListItem = ListItem;

  var IterationArtifacts =
  /*#__PURE__*/
  function () {
    function IterationArtifacts(iterable) {
      this.iterator = null;
      this.map = (0, _util.dict)();
      this.list = new _util.LinkedList();
      this.tag = iterable.tag;
      this.iterable = iterable;
    }

    var _proto9 = IterationArtifacts.prototype;

    _proto9.isEmpty = function isEmpty() {
      var iterator = this.iterator = this.iterable.iterate();
      return iterator.isEmpty();
    };

    _proto9.iterate = function iterate() {
      var iterator;

      if (this.iterator === null) {
        iterator = this.iterable.iterate();
      } else {
        iterator = this.iterator;
      }

      this.iterator = null;
      return iterator;
    };

    _proto9.has = function has(key) {
      return !!this.map[key];
    };

    _proto9.get = function get(key) {
      return this.map[key];
    };

    _proto9.wasSeen = function wasSeen(key) {
      var node = this.map[key];
      return node !== undefined && node.seen;
    };

    _proto9.append = function append(item) {
      var map = this.map,
          list = this.list,
          iterable = this.iterable;
      var node = map[item.key] = new ListItem(iterable, item);
      list.append(node);
      return node;
    };

    _proto9.insertBefore = function insertBefore(item, reference) {
      var map = this.map,
          list = this.list,
          iterable = this.iterable;
      var node = map[item.key] = new ListItem(iterable, item);
      node.retained = true;
      list.insertBefore(node, reference);
      return node;
    };

    _proto9.move = function move(item, reference) {
      var list = this.list;
      item.retained = true;
      list.remove(item);
      list.insertBefore(item, reference);
    };

    _proto9.remove = function remove(item) {
      var list = this.list;
      list.remove(item);
      delete this.map[item.key];
    };

    _proto9.nextNode = function nextNode(item) {
      return this.list.nextNode(item);
    };

    _proto9.head = function head() {
      return this.list.head();
    };

    return IterationArtifacts;
  }();

  _exports.IterationArtifacts = IterationArtifacts;

  var ReferenceIterator =
  /*#__PURE__*/
  function () {
    // if anyone needs to construct this object with something other than
    // an iterable, let @wycats know.
    function ReferenceIterator(iterable) {
      this.iterator = null;
      var artifacts = new IterationArtifacts(iterable);
      this.artifacts = artifacts;
    }

    var _proto10 = ReferenceIterator.prototype;

    _proto10.next = function next() {
      var artifacts = this.artifacts;
      var iterator = this.iterator = this.iterator || artifacts.iterate();
      var item = iterator.next();
      if (item === null) return null;
      return artifacts.append(item);
    };

    return ReferenceIterator;
  }();

  _exports.ReferenceIterator = ReferenceIterator;
  var Phase;

  (function (Phase) {
    Phase[Phase["Append"] = 0] = "Append";
    Phase[Phase["Prune"] = 1] = "Prune";
    Phase[Phase["Done"] = 2] = "Done";
  })(Phase || (Phase = {}));

  var IteratorSynchronizer =
  /*#__PURE__*/
  function () {
    function IteratorSynchronizer(_ref2) {
      var target = _ref2.target,
          artifacts = _ref2.artifacts;
      this.target = target;
      this.artifacts = artifacts;
      this.iterator = artifacts.iterate();
      this.current = artifacts.head();
    }

    var _proto11 = IteratorSynchronizer.prototype;

    _proto11.sync = function sync() {
      var phase = Phase.Append;

      while (true) {
        switch (phase) {
          case Phase.Append:
            phase = this.nextAppend();
            break;

          case Phase.Prune:
            phase = this.nextPrune();
            break;

          case Phase.Done:
            this.nextDone();
            return;
        }
      }
    };

    _proto11.advanceToKey = function advanceToKey(key) {
      var current = this.current,
          artifacts = this.artifacts;
      var seek = current;

      while (seek !== null && seek.key !== key) {
        seek.seen = true;
        seek = artifacts.nextNode(seek);
      }

      if (seek !== null) {
        this.current = artifacts.nextNode(seek);
      }
    };

    _proto11.nextAppend = function nextAppend() {
      var iterator = this.iterator,
          current = this.current,
          artifacts = this.artifacts;
      var item = iterator.next();

      if (item === null) {
        return this.startPrune();
      }

      var key = item.key;

      if (current !== null && current.key === key) {
        this.nextRetain(item);
      } else if (artifacts.has(key)) {
        this.nextMove(item);
      } else {
        this.nextInsert(item);
      }

      return Phase.Append;
    };

    _proto11.nextRetain = function nextRetain(item) {
      var artifacts = this.artifacts,
          current = this.current;
      current = current;
      current.update(item);
      this.current = artifacts.nextNode(current);
      this.target.retain(item.key, current.value, current.memo);
    };

    _proto11.nextMove = function nextMove(item) {
      var current = this.current,
          artifacts = this.artifacts,
          target = this.target;
      var key = item.key;
      var found = artifacts.get(item.key);
      found.update(item);

      if (artifacts.wasSeen(item.key)) {
        artifacts.move(found, current);
        target.move(found.key, found.value, found.memo, current ? current.key : null);
      } else {
        this.advanceToKey(key);
      }
    };

    _proto11.nextInsert = function nextInsert(item) {
      var artifacts = this.artifacts,
          target = this.target,
          current = this.current;
      var node = artifacts.insertBefore(item, current);
      target.insert(node.key, node.value, node.memo, current ? current.key : null);
    };

    _proto11.startPrune = function startPrune() {
      this.current = this.artifacts.head();
      return Phase.Prune;
    };

    _proto11.nextPrune = function nextPrune() {
      var artifacts = this.artifacts,
          target = this.target,
          current = this.current;

      if (current === null) {
        return Phase.Done;
      }

      var node = current;
      this.current = artifacts.nextNode(node);

      if (node.shouldRemove()) {
        artifacts.remove(node);
        target.delete(node.key);
      } else {
        node.reset();
      }

      return Phase.Prune;
    };

    _proto11.nextDone = function nextDone() {
      this.target.done();
    };

    return IteratorSynchronizer;
  }();

  _exports.IteratorSynchronizer = IteratorSynchronizer;
});