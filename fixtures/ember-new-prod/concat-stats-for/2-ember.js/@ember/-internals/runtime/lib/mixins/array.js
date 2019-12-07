define("@ember/-internals/runtime/lib/mixins/array", ["exports", "@ember/-internals/metal", "@ember/-internals/utils", "@ember/debug", "@ember/-internals/runtime/lib/mixins/enumerable", "@ember/-internals/runtime/lib/compare", "@ember/-internals/environment", "@ember/-internals/runtime/lib/mixins/observable", "@ember/-internals/runtime/lib/mixins/mutable_enumerable", "@ember/-internals/runtime/lib/type-of"], function (_exports, _metal, _utils, _debug, _enumerable, _compare, _environment, _observable, _mutable_enumerable, _typeOf) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.uniqBy = _uniqBy;
  _exports.removeAt = _removeAt;
  _exports.isArray = isArray;
  _exports.default = _exports.MutableArray = _exports.NativeArray = _exports.A = void 0;

  var _Mixin$create, _NativeArray;

  var EMPTY_ARRAY = Object.freeze([]);

  var identityFunction = function identityFunction(item) {
    return item;
  };

  function _uniqBy(array, key) {
    if (key === void 0) {
      key = identityFunction;
    }

    (false && !(isArray(array)) && (0, _debug.assert)("first argument passed to `uniqBy` should be array", isArray(array)));

    var ret = _A2();

    var seen = new Set();
    var getter = typeof key === 'function' ? key : function (item) {
      return (0, _metal.get)(item, key);
    };
    array.forEach(function (item) {
      var val = getter(item);

      if (!seen.has(val)) {
        seen.add(val);
        ret.push(item);
      }
    });
    return ret;
  }

  function iter(key, value) {
    var valueProvided = arguments.length === 2;
    return valueProvided ? function (item) {
      return value === (0, _metal.get)(item, key);
    } : function (item) {
      return Boolean((0, _metal.get)(item, key));
    };
  }

  function findIndex(array, predicate, startAt) {
    var len = array.length;

    for (var index = startAt; index < len; index++) {
      var item = (0, _metal.objectAt)(array, index);

      if (predicate(item, index, array)) {
        return index;
      }
    }

    return -1;
  }

  function _find(array, callback, target) {
    var predicate = callback.bind(target);
    var index = findIndex(array, predicate, 0);
    return index === -1 ? undefined : (0, _metal.objectAt)(array, index);
  }

  function _any(array, callback, target) {
    var predicate = callback.bind(target);
    return findIndex(array, predicate, 0) !== -1;
  }

  function _every(array, callback, target) {
    var cb = callback.bind(target);

    var predicate = function predicate(item, index, array) {
      return !cb(item, index, array);
    };

    return findIndex(array, predicate, 0) === -1;
  }

  function _indexOf(array, val, startAt, withNaNCheck) {
    if (startAt === void 0) {
      startAt = 0;
    }

    var len = array.length;

    if (startAt < 0) {
      startAt += len;
    } // SameValueZero comparison (NaN !== NaN)


    var predicate = withNaNCheck && val !== val ? function (item) {
      return item !== item;
    } : function (item) {
      return item === val;
    };
    return findIndex(array, predicate, startAt);
  }

  function _removeAt(array, index, len) {
    if (len === void 0) {
      len = 1;
    }

    (false && !(index > -1 && index < array.length) && (0, _debug.assert)("`removeAt` index provided is out of range", index > -1 && index < array.length));
    (0, _metal.replace)(array, index, len, EMPTY_ARRAY);
    return array;
  }

  function _insertAt(array, index, item) {
    (false && !(index > -1 && index <= array.length) && (0, _debug.assert)("`insertAt` index provided is out of range", index > -1 && index <= array.length));
    (0, _metal.replace)(array, index, 0, [item]);
    return item;
  }
  /**
    Returns true if the passed object is an array or Array-like.
  
    Objects are considered Array-like if any of the following are true:
  
      - the object is a native Array
      - the object has an objectAt property
      - the object is an Object, and has a length property
  
    Unlike `typeOf` this method returns true even if the passed object is
    not formally an array but appears to be array-like (i.e. implements `Array`)
  
    ```javascript
    import { isArray } from '@ember/array';
    import ArrayProxy from '@ember/array/proxy';
  
    isArray();                                      // false
    isArray([]);                                    // true
    isArray(ArrayProxy.create({ content: [] }));    // true
    ```
  
    @method isArray
    @static
    @for @ember/array
    @param {Object} obj The object to test
    @return {Boolean} true if the passed object is an array or Array-like
    @public
  */


  function isArray(_obj) {
    var obj = _obj;

    if (false
    /* DEBUG */
    && _utils.HAS_NATIVE_PROXY && typeof _obj === 'object' && _obj !== null) {
      var possibleProxyContent = _obj[_metal.PROXY_CONTENT];

      if (possibleProxyContent !== undefined) {
        obj = possibleProxyContent;
      }
    }

    if (!obj || obj.setInterval) {
      return false;
    }

    if (Array.isArray(obj) || ArrayMixin.detect(obj)) {
      return true;
    }

    var type = (0, _typeOf.typeOf)(obj);

    if ('array' === type) {
      return true;
    }

    var length = obj.length;

    if (typeof length === 'number' && length === length && 'object' === type) {
      return true;
    }

    return false;
  }
  /*
    This allows us to define computed properties that are not enumerable.
    The primary reason this is important is that when `NativeArray` is
    applied to `Array.prototype` we need to ensure that we do not add _any_
    new enumerable properties.
  */


  function nonEnumerableComputed() {
    var property = _metal.computed.apply(void 0, arguments);

    property.enumerable = false;
    return property;
  }

  function mapBy(key) {
    return this.map(function (next) {
      return (0, _metal.get)(next, key);
    });
  } // ..........................................................
  // ARRAY
  //

  /**
    This mixin implements Observer-friendly Array-like behavior. It is not a
    concrete implementation, but it can be used up by other classes that want
    to appear like arrays.
  
    For example, ArrayProxy is a concrete class that can be instantiated to
    implement array-like behavior. This class uses the Array Mixin by way of
    the MutableArray mixin, which allows observable changes to be made to the
    underlying array.
  
    This mixin defines methods specifically for collections that provide
    index-ordered access to their contents. When you are designing code that
    needs to accept any kind of Array-like object, you should use these methods
    instead of Array primitives because these will properly notify observers of
    changes to the array.
  
    Although these methods are efficient, they do add a layer of indirection to
    your application so it is a good idea to use them only when you need the
    flexibility of using both true JavaScript arrays and "virtual" arrays such
    as controllers and collections.
  
    You can use the methods defined in this module to access and modify array
    contents in an observable-friendly way. You can also be notified whenever
    the membership of an array changes by using `.observes('myArray.[]')`.
  
    To support `EmberArray` in your own class, you must override two
    primitives to use it: `length()` and `objectAt()`.
  
    @class EmberArray
    @uses Enumerable
    @since Ember 0.9.0
    @public
  */


  var ArrayMixin = _metal.Mixin.create(_enumerable.default, (_Mixin$create = {}, _Mixin$create[_utils.EMBER_ARRAY] = true, _Mixin$create.objectsAt = function objectsAt(indexes) {
    var _this = this;

    return indexes.map(function (idx) {
      return (0, _metal.objectAt)(_this, idx);
    });
  }, _Mixin$create['[]'] = nonEnumerableComputed({
    get: function get() {
      return this;
    },
    set: function set(key, value) {
      this.replace(0, this.length, value);
      return this;
    }
  }), _Mixin$create.firstObject = nonEnumerableComputed(function () {
    return (0, _metal.objectAt)(this, 0);
  }).readOnly(), _Mixin$create.lastObject = nonEnumerableComputed(function () {
    return (0, _metal.objectAt)(this, this.length - 1);
  }).readOnly(), _Mixin$create.slice = function slice(beginIndex, endIndex) {
    if (beginIndex === void 0) {
      beginIndex = 0;
    }

    var ret = _A2();

    var length = this.length;

    if (beginIndex < 0) {
      beginIndex = length + beginIndex;
    }

    if (endIndex === undefined || endIndex > length) {
      endIndex = length;
    } else if (endIndex < 0) {
      endIndex = length + endIndex;
    }

    while (beginIndex < endIndex) {
      ret[ret.length] = (0, _metal.objectAt)(this, beginIndex++);
    }

    return ret;
  }, _Mixin$create.indexOf = function indexOf(object, startAt) {
    return _indexOf(this, object, startAt, false);
  }, _Mixin$create.lastIndexOf = function lastIndexOf(object, startAt) {
    var len = this.length;

    if (startAt === undefined || startAt >= len) {
      startAt = len - 1;
    }

    if (startAt < 0) {
      startAt += len;
    }

    for (var idx = startAt; idx >= 0; idx--) {
      if ((0, _metal.objectAt)(this, idx) === object) {
        return idx;
      }
    }

    return -1;
  }, _Mixin$create.addArrayObserver = function addArrayObserver(target, opts) {
    return (0, _metal.addArrayObserver)(this, target, opts);
  }, _Mixin$create.removeArrayObserver = function removeArrayObserver(target, opts) {
    return (0, _metal.removeArrayObserver)(this, target, opts);
  }, _Mixin$create.hasArrayObservers = nonEnumerableComputed(function () {
    return (0, _metal.hasListeners)(this, '@array:change') || (0, _metal.hasListeners)(this, '@array:before');
  }), _Mixin$create.arrayContentWillChange = function arrayContentWillChange(startIdx, removeAmt, addAmt) {
    return (0, _metal.arrayContentWillChange)(this, startIdx, removeAmt, addAmt);
  }, _Mixin$create.arrayContentDidChange = function arrayContentDidChange(startIdx, removeAmt, addAmt) {
    return (0, _metal.arrayContentDidChange)(this, startIdx, removeAmt, addAmt);
  }, _Mixin$create.forEach = function forEach(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`forEach` expects a function as first argument.', typeof callback === 'function'));
    var length = this.length;

    for (var index = 0; index < length; index++) {
      var item = this.objectAt(index);
      callback.call(target, item, index, this);
    }

    return this;
  }, _Mixin$create.getEach = mapBy, _Mixin$create.setEach = function setEach(key, value) {
    return this.forEach(function (item) {
      return (0, _metal.set)(item, key, value);
    });
  }, _Mixin$create.map = function map(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`map` expects a function as first argument.', typeof callback === 'function'));

    var ret = _A2();

    this.forEach(function (x, idx, i) {
      return ret[idx] = callback.call(target, x, idx, i);
    });
    return ret;
  }, _Mixin$create.mapBy = mapBy, _Mixin$create.filter = function filter(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`filter` expects a function as first argument.', typeof callback === 'function'));

    var ret = _A2();

    this.forEach(function (x, idx, i) {
      if (callback.call(target, x, idx, i)) {
        ret.push(x);
      }
    });
    return ret;
  }, _Mixin$create.reject = function reject(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`reject` expects a function as first argument.', typeof callback === 'function'));
    return this.filter(function () {
      return !callback.apply(target, arguments);
    });
  }, _Mixin$create.filterBy = function filterBy() {
    return this.filter(iter.apply(void 0, arguments));
  }, _Mixin$create.rejectBy = function rejectBy() {
    return this.reject(iter.apply(void 0, arguments));
  }, _Mixin$create.find = function find(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`find` expects a function as first argument.', typeof callback === 'function'));
    return _find(this, callback, target);
  }, _Mixin$create.findBy = function findBy() {
    return _find(this, iter.apply(void 0, arguments));
  }, _Mixin$create.every = function every(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`every` expects a function as first argument.', typeof callback === 'function'));
    return _every(this, callback, target);
  }, _Mixin$create.isEvery = function isEvery() {
    return _every(this, iter.apply(void 0, arguments));
  }, _Mixin$create.any = function any(callback, target) {
    if (target === void 0) {
      target = null;
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('`any` expects a function as first argument.', typeof callback === 'function'));
    return _any(this, callback, target);
  }, _Mixin$create.isAny = function isAny() {
    return _any(this, iter.apply(void 0, arguments));
  }, _Mixin$create.reduce = function reduce(callback, initialValue) {
    (false && !(typeof callback === 'function') && (0, _debug.assert)('`reduce` expects a function as first argument.', typeof callback === 'function'));
    var ret = initialValue;
    this.forEach(function (item, i) {
      ret = callback(ret, item, i, this);
    }, this);
    return ret;
  }, _Mixin$create.invoke = function invoke(methodName) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var ret = _A2();

    this.forEach(function (item) {
      return ret.push((0, _utils.tryInvoke)(item, methodName, args));
    });
    return ret;
  }, _Mixin$create.toArray = function toArray() {
    return this.map(function (item) {
      return item;
    });
  }, _Mixin$create.compact = function compact() {
    return this.filter(function (value) {
      return value != null;
    });
  }, _Mixin$create.includes = function includes(object, startAt) {
    return _indexOf(this, object, startAt, true) !== -1;
  }, _Mixin$create.sortBy = function sortBy() {
    var sortKeys = arguments;
    return this.toArray().sort(function (a, b) {
      for (var i = 0; i < sortKeys.length; i++) {
        var key = sortKeys[i];
        var propA = (0, _metal.get)(a, key);
        var propB = (0, _metal.get)(b, key); // return 1 or -1 else continue to the next sortKey

        var compareValue = (0, _compare.default)(propA, propB);

        if (compareValue) {
          return compareValue;
        }
      }

      return 0;
    });
  }, _Mixin$create.uniq = function uniq() {
    return _uniqBy(this);
  }, _Mixin$create.uniqBy = function uniqBy(key) {
    return _uniqBy(this, key);
  }, _Mixin$create.without = function without(value) {
    if (!this.includes(value)) {
      return this; // nothing to do
    } // SameValueZero comparison (NaN !== NaN)


    var predicate = value === value ? function (item) {
      return item !== value;
    } : function (item) {
      return item === item;
    };
    return this.filter(predicate);
  }, _Mixin$create));
  /**
    This mixin defines the API for modifying array-like objects. These methods
    can be applied only to a collection that keeps its items in an ordered set.
    It builds upon the Array mixin and adds methods to modify the array.
    One concrete implementations of this class include ArrayProxy.
  
    It is important to use the methods in this class to modify arrays so that
    changes are observable. This allows the binding system in Ember to function
    correctly.
  
  
    Note that an Array can change even if it does not implement this mixin.
    For example, one might implement a SparseArray that cannot be directly
    modified, but if its underlying enumerable changes, it will change also.
  
    @class MutableArray
    @uses EmberArray
    @uses MutableEnumerable
    @public
  */


  var MutableArray = _metal.Mixin.create(ArrayMixin, _mutable_enumerable.default, {
    /**
      __Required.__ You must implement this method to apply this mixin.
       This is one of the primitives you must implement to support `Array`.
      You should replace amt objects started at idx with the objects in the
      passed array. You should also call `this.arrayContentDidChange()`
       Note that this method is expected to validate the type(s) of objects that it expects.
       @method replace
      @param {Number} idx Starting index in the array to replace. If
        idx >= length, then append to the end of the array.
      @param {Number} amt Number of elements that should be removed from
        the array, starting at *idx*.
      @param {EmberArray} objects An array of zero or more objects that should be
        inserted into the array at *idx*
      @public
    */

    /**
      Remove all elements from the array. This is useful if you
      want to reuse an existing array without having to recreate it.
       ```javascript
      let colors = ['red', 'green', 'blue'];
       colors.length;  // 3
      colors.clear(); // []
      colors.length;  // 0
      ```
       @method clear
      @return {Array} An empty Array.
      @public
    */
    clear: function clear() {
      var len = this.length;

      if (len === 0) {
        return this;
      }

      this.replace(0, len, EMPTY_ARRAY);
      return this;
    },

    /**
      This will use the primitive `replace()` method to insert an object at the
      specified index.
       ```javascript
      let colors = ['red', 'green', 'blue'];
       colors.insertAt(2, 'yellow');  // ['red', 'green', 'yellow', 'blue']
      colors.insertAt(5, 'orange');  // Error: Index out of range
      ```
       @method insertAt
      @param {Number} idx index of insert the object at.
      @param {Object} object object to insert
      @return {EmberArray} receiver
      @public
    */
    insertAt: function insertAt(idx, object) {
      _insertAt(this, idx, object);

      return this;
    },

    /**
      Remove an object at the specified index using the `replace()` primitive
      method. You can pass either a single index, or a start and a length.
       If you pass a start and length that is beyond the
      length this method will throw an assertion.
       ```javascript
      let colors = ['red', 'green', 'blue', 'yellow', 'orange'];
       colors.removeAt(0);     // ['green', 'blue', 'yellow', 'orange']
      colors.removeAt(2, 2);  // ['green', 'blue']
      colors.removeAt(4, 2);  // Error: Index out of range
      ```
       @method removeAt
      @param {Number} start index, start of range
      @param {Number} len length of passing range
      @return {EmberArray} receiver
      @public
    */
    removeAt: function removeAt(start, len) {
      return _removeAt(this, start, len);
    },

    /**
      Push the object onto the end of the array. Works just like `push()` but it
      is KVO-compliant.
       ```javascript
      let colors = ['red', 'green'];
       colors.pushObject('black');     // ['red', 'green', 'black']
      colors.pushObject(['yellow']);  // ['red', 'green', ['yellow']]
      ```
       @method pushObject
      @param {*} obj object to push
      @return object same object passed as a param
      @public
    */
    pushObject: function pushObject(obj) {
      return _insertAt(this, this.length, obj);
    },

    /**
      Add the objects in the passed array to the end of the array. Defers
      notifying observers of the change until all objects are added.
       ```javascript
      let colors = ['red'];
       colors.pushObjects(['yellow', 'orange']);  // ['red', 'yellow', 'orange']
      ```
       @method pushObjects
      @param {EmberArray} objects the objects to add
      @return {EmberArray} receiver
      @public
    */
    pushObjects: function pushObjects(objects) {
      this.replace(this.length, 0, objects);
      return this;
    },

    /**
      Pop object from array or nil if none are left. Works just like `pop()` but
      it is KVO-compliant.
       ```javascript
      let colors = ['red', 'green', 'blue'];
       colors.popObject();   // 'blue'
      console.log(colors);  // ['red', 'green']
      ```
       @method popObject
      @return object
      @public
    */
    popObject: function popObject() {
      var len = this.length;

      if (len === 0) {
        return null;
      }

      var ret = (0, _metal.objectAt)(this, len - 1);
      this.removeAt(len - 1, 1);
      return ret;
    },

    /**
      Shift an object from start of array or nil if none are left. Works just
      like `shift()` but it is KVO-compliant.
       ```javascript
      let colors = ['red', 'green', 'blue'];
       colors.shiftObject();  // 'red'
      console.log(colors);   // ['green', 'blue']
      ```
       @method shiftObject
      @return object
      @public
    */
    shiftObject: function shiftObject() {
      if (this.length === 0) {
        return null;
      }

      var ret = (0, _metal.objectAt)(this, 0);
      this.removeAt(0);
      return ret;
    },

    /**
      Unshift an object to start of array. Works just like `unshift()` but it is
      KVO-compliant.
       ```javascript
      let colors = ['red'];
       colors.unshiftObject('yellow');    // ['yellow', 'red']
      colors.unshiftObject(['black']);   // [['black'], 'yellow', 'red']
      ```
       @method unshiftObject
      @param {*} obj object to unshift
      @return object same object passed as a param
      @public
    */
    unshiftObject: function unshiftObject(obj) {
      return _insertAt(this, 0, obj);
    },

    /**
      Adds the named objects to the beginning of the array. Defers notifying
      observers until all objects have been added.
       ```javascript
      let colors = ['red'];
       colors.unshiftObjects(['black', 'white']);   // ['black', 'white', 'red']
      colors.unshiftObjects('yellow'); // Type Error: 'undefined' is not a function
      ```
       @method unshiftObjects
      @param {Enumberable} objects the objects to add
      @return {EmberArray} receiver
      @public
    */
    unshiftObjects: function unshiftObjects(objects) {
      this.replace(0, 0, objects);
      return this;
    },

    /**
      Reverse objects in the array. Works just like `reverse()` but it is
      KVO-compliant.
       @method reverseObjects
      @return {EmberArray} receiver
       @public
    */
    reverseObjects: function reverseObjects() {
      var len = this.length;

      if (len === 0) {
        return this;
      }

      var objects = this.toArray().reverse();
      this.replace(0, len, objects);
      return this;
    },

    /**
      Replace all the receiver's content with content of the argument.
      If argument is an empty array receiver will be cleared.
       ```javascript
      let colors = ['red', 'green', 'blue'];
       colors.setObjects(['black', 'white']);  // ['black', 'white']
      colors.setObjects([]);                  // []
      ```
       @method setObjects
      @param {EmberArray} objects array whose content will be used for replacing
          the content of the receiver
      @return {EmberArray} receiver with the new content
      @public
    */
    setObjects: function setObjects(objects) {
      if (objects.length === 0) {
        return this.clear();
      }

      var len = this.length;
      this.replace(0, len, objects);
      return this;
    },

    /**
      Remove all occurrences of an object in the array.
       ```javascript
      let cities = ['Chicago', 'Berlin', 'Lima', 'Chicago'];
       cities.removeObject('Chicago');  // ['Berlin', 'Lima']
      cities.removeObject('Lima');     // ['Berlin']
      cities.removeObject('Tokyo')     // ['Berlin']
      ```
       @method removeObject
      @param {*} obj object to remove
      @return {EmberArray} receiver
      @public
    */
    removeObject: function removeObject(obj) {
      var loc = this.length || 0;

      while (--loc >= 0) {
        var curObject = (0, _metal.objectAt)(this, loc);

        if (curObject === obj) {
          this.removeAt(loc);
        }
      }

      return this;
    },

    /**
      Removes each object in the passed array from the receiver.
       @method removeObjects
      @param {EmberArray} objects the objects to remove
      @return {EmberArray} receiver
      @public
    */
    removeObjects: function removeObjects(objects) {
      (0, _metal.beginPropertyChanges)();

      for (var i = objects.length - 1; i >= 0; i--) {
        this.removeObject(objects[i]);
      }

      (0, _metal.endPropertyChanges)();
      return this;
    },

    /**
      Push the object onto the end of the array if it is not already
      present in the array.
       ```javascript
      let cities = ['Chicago', 'Berlin'];
       cities.addObject('Lima');    // ['Chicago', 'Berlin', 'Lima']
      cities.addObject('Berlin');  // ['Chicago', 'Berlin', 'Lima']
      ```
       @method addObject
      @param {*} obj object to add, if not already present
      @return {EmberArray} receiver
      @public
    */
    addObject: function addObject(obj) {
      var included = this.includes(obj);

      if (!included) {
        this.pushObject(obj);
      }

      return this;
    },

    /**
      Adds each object in the passed array to the receiver.
       @method addObjects
      @param {EmberArray} objects the objects to add.
      @return {EmberArray} receiver
      @public
    */
    addObjects: function addObjects(objects) {
      var _this2 = this;

      (0, _metal.beginPropertyChanges)();
      objects.forEach(function (obj) {
        return _this2.addObject(obj);
      });
      (0, _metal.endPropertyChanges)();
      return this;
    }
  });
  /**
    Creates an `Ember.NativeArray` from an Array-like object.
    Does not modify the original object's contents. `A()` is not needed if
    `EmberENV.EXTEND_PROTOTYPES` is `true` (the default value). However,
    it is recommended that you use `A()` when creating addons for
    ember or when you can not guarantee that `EmberENV.EXTEND_PROTOTYPES`
    will be `true`.
  
    Example
  
    ```app/components/my-component.js
    import Component from '@ember/component';
    import { A } from '@ember/array';
  
    export default Component.extend({
      tagName: 'ul',
      classNames: ['pagination'],
  
      init() {
        this._super(...arguments);
  
        if (!this.get('content')) {
          this.set('content', A());
          this.set('otherContent', A([1,2,3]));
        }
      }
    });
    ```
  
    @method A
    @static
    @for @ember/array
    @return {Ember.NativeArray}
    @public
  */
  // Add Ember.Array to Array.prototype. Remove methods with native
  // implementations and supply some more optimized versions of generic methods
  // because they are so common.

  /**
  @module ember
  */

  /**
    The NativeArray mixin contains the properties needed to make the native
    Array support MutableArray and all of its dependent APIs. Unless you
    have `EmberENV.EXTEND_PROTOTYPES` or `EmberENV.EXTEND_PROTOTYPES.Array` set to
    false, this will be applied automatically. Otherwise you can apply the mixin
    at anytime by calling `Ember.NativeArray.apply(Array.prototype)`.
  
    @class Ember.NativeArray
    @uses MutableArray
    @uses Observable
    @public
  */


  _exports.MutableArray = MutableArray;

  var NativeArray = _metal.Mixin.create(MutableArray, _observable.default, {
    objectAt: function objectAt(idx) {
      return this[idx];
    },
    // primitive for array support.
    replace: function replace(start, deleteCount, items) {
      if (items === void 0) {
        items = EMPTY_ARRAY;
      }

      (false && !(Array.isArray(items)) && (0, _debug.assert)('The third argument to replace needs to be an array.', Array.isArray(items)));
      (0, _metal.replaceInNativeArray)(this, start, deleteCount, items);
      return this;
    }
  }); // Remove any methods implemented natively so we don't override them


  _exports.NativeArray = NativeArray;
  var ignore = ['length'];
  NativeArray.keys().forEach(function (methodName) {
    if (Array.prototype[methodName]) {
      ignore.push(methodName);
    }
  });
  _exports.NativeArray = NativeArray = (_NativeArray = NativeArray).without.apply(_NativeArray, ignore);

  var _A2;

  _exports.A = _A2;

  if (_environment.ENV.EXTEND_PROTOTYPES.Array) {
    NativeArray.apply(Array.prototype);

    _exports.A = _A2 = function A(arr) {
      (false && !(!(this instanceof _A2)) && (0, _debug.assert)('You cannot create an Ember Array with `new A()`, please update to calling A as a function: `A()`', !(this instanceof _A2)));
      return arr || [];
    };
  } else {
    _exports.A = _A2 = function _A(arr) {
      (false && !(!(this instanceof _A2)) && (0, _debug.assert)('You cannot create an Ember Array with `new A()`, please update to calling A as a function: `A()`', !(this instanceof _A2)));

      if (!arr) {
        arr = [];
      }

      return ArrayMixin.detect(arr) ? arr : NativeArray.apply(arr);
    };
  }

  var _default = ArrayMixin;
  _exports.default = _default;
});