define("@ember/object/lib/computed/reduce_computed_macros", ["exports", "@ember/debug", "@ember/-internals/metal", "@ember/-internals/runtime"], function (_exports, _debug, _metal, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.sum = sum;
  _exports.max = max;
  _exports.min = min;
  _exports.map = map;
  _exports.mapBy = mapBy;
  _exports.filter = filter;
  _exports.filterBy = filterBy;
  _exports.uniq = uniq;
  _exports.uniqBy = uniqBy;
  _exports.intersect = intersect;
  _exports.setDiff = setDiff;
  _exports.collect = collect;
  _exports.sort = sort;
  _exports.union = void 0;

  /**
  @module @ember/object
  */
  function reduceMacro(dependentKey, callback, initialValue, name) {
    (false && !(!/[\[\]\{\}]/g.test(dependentKey)) && (0, _debug.assert)("Dependent key passed to `computed." + name + "` shouldn't contain brace expanding pattern.", !/[\[\]\{\}]/g.test(dependentKey)));
    return (0, _metal.computed)(dependentKey + ".[]", function () {
      var arr = (0, _metal.get)(this, dependentKey);

      if (arr === null || typeof arr !== 'object') {
        return initialValue;
      }

      return arr.reduce(callback, initialValue, this);
    }).readOnly();
  }

  function arrayMacro(dependentKey, additionalDependentKeys, callback) {
    // This is a bit ugly
    var propertyName;

    if (/@each/.test(dependentKey)) {
      propertyName = dependentKey.replace(/\.@each.*$/, '');
    } else {
      propertyName = dependentKey;
      dependentKey += '.[]';
    }

    return _metal.computed.apply(void 0, [dependentKey].concat(additionalDependentKeys, [function () {
      var value = (0, _metal.get)(this, propertyName);

      if ((0, _runtime.isArray)(value)) {
        return (0, _runtime.A)(callback.call(this, value));
      } else {
        return (0, _runtime.A)();
      }
    }])).readOnly();
  }

  function multiArrayMacro(_dependentKeys, callback, name) {
    (false && !(_dependentKeys.every(function (dependentKey) {
      return !/[\[\]\{\}]/g.test(dependentKey);
    })) && (0, _debug.assert)("Dependent keys passed to `computed." + name + "` shouldn't contain brace expanding pattern.", _dependentKeys.every(function (dependentKey) {
      return !/[\[\]\{\}]/g.test(dependentKey);
    })));

    var dependentKeys = _dependentKeys.map(function (key) {
      return key + ".[]";
    });

    return _metal.computed.apply(void 0, dependentKeys.concat([function () {
      return (0, _runtime.A)(callback.call(this, _dependentKeys));
    }])).readOnly();
  }
  /**
    A computed property that returns the sum of the values in the dependent array.
  
    Example:
  
    ```javascript
    import { sum } from '@ember/object/computed';
  
    class Invoice {
      lineItems = [1.00, 2.50, 9.99];
  
      @sum('lineItems') total;
    }
  
    let invoice = new Invoice();
  
    invoice.total; // 13.49
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { sum } from '@ember/object/computed';
  
    let Invoice = EmberObject.extend({
      lineItems: [1.00, 2.50, 9.99],
  
      total: sum('lineItems')
    })
  
    let invoice = Invoice.create();
  
    invoice.total; // 13.49
    ```
  
    @method sum
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @return {ComputedProperty} computes the sum of all values in the
    dependentKey's array
    @since 1.4.0
    @public
  */


  function sum(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @sum as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return reduceMacro(dependentKey, function (sum, item) {
      return sum + item;
    }, 0, 'sum');
  }
  /**
    A computed property that calculates the maximum value in the dependent array.
    This will return `-Infinity` when the dependent array is empty.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { mapBy, max } from '@ember/object/computed';
  
    class Person {
      children = [];
  
      @mapBy('children', 'age') childAges;
      @max('childAges') maxChildAge;
    }
  
    let lordByron = new Person();
  
    lordByron.maxChildAge; // -Infinity
  
    set(lordByron, 'children', [
      {
        name: 'Augusta Ada Byron',
        age: 7
      }
    ]);
    lordByron.maxChildAge; // 7
  
    set(lordByron, 'children', [
      ...lordByron.children,
      {
        name: 'Allegra Byron',
        age: 5
      }, {
        name: 'Elizabeth Medora Leigh',
        age: 8
      }
    ]);
    lordByron.maxChildAge; // 8
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { mapBy, max } from '@ember/object/computed';
  
    let Person = EmberObject.extend({
      childAges: mapBy('children', 'age'),
      maxChildAge: max('childAges')
    });
  
    let lordByron = Person.create({ children: [] });
  
    lordByron.maxChildAge; // -Infinity
  
    set(lordByron, 'children', [
      {
        name: 'Augusta Ada Byron',
        age: 7
      }
    ]);
    lordByron.maxChildAge; // 7
  
    set(lordByron, 'children', [
      ...lordByron.children,
      {
        name: 'Allegra Byron',
        age: 5
      }, {
        name: 'Elizabeth Medora Leigh',
        age: 8
      }
    ]);
    lordByron.maxChildAge; // 8
    ```
  
    If the types of the arguments are not numbers, they will be converted to
    numbers and the type of the return value will always be `Number`. For example,
    the max of a list of Date objects will be the highest timestamp as a `Number`.
    This behavior is consistent with `Math.max`.
  
    @method max
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @return {ComputedProperty} computes the largest value in the dependentKey's
    array
    @public
  */


  function max(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @max as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return reduceMacro(dependentKey, function (max, item) {
      return Math.max(max, item);
    }, -Infinity, 'max');
  }
  /**
    A computed property that calculates the minimum value in the dependent array.
    This will return `Infinity` when the dependent array is empty.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { mapBy, min } from '@ember/object/computed';
  
    class Person {
      children = [];
  
      @mapBy('children', 'age') childAges;
      @min('childAges') minChildAge;
    }
  
    let lordByron = Person.create({ children: [] });
  
    lordByron.minChildAge; // Infinity
  
    set(lordByron, 'children', [
      {
        name: 'Augusta Ada Byron',
        age: 7
      }
    ]);
    lordByron.minChildAge; // 7
  
    set(lordByron, 'children', [
      ...lordByron.children,
      {
        name: 'Allegra Byron',
        age: 5
      }, {
        name: 'Elizabeth Medora Leigh',
        age: 8
      }
    ]);
    lordByron.minChildAge; // 5
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { mapBy, min } from '@ember/object/computed';
  
    let Person = EmberObject.extend({
      childAges: mapBy('children', 'age'),
      minChildAge: min('childAges')
    });
  
    let lordByron = Person.create({ children: [] });
  
    lordByron.minChildAge; // Infinity
  
    set(lordByron, 'children', [
      {
        name: 'Augusta Ada Byron',
        age: 7
      }
    ]);
    lordByron.minChildAge; // 7
  
    set(lordByron, 'children', [
      ...lordByron.children,
      {
        name: 'Allegra Byron',
        age: 5
      }, {
        name: 'Elizabeth Medora Leigh',
        age: 8
      }
    ]);
    lordByron.minChildAge; // 5
    ```
  
    If the types of the arguments are not numbers, they will be converted to
    numbers and the type of the return value will always be `Number`. For example,
    the min of a list of Date objects will be the lowest timestamp as a `Number`.
    This behavior is consistent with `Math.min`.
  
    @method min
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @return {ComputedProperty} computes the smallest value in the dependentKey's array
    @public
  */


  function min(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @min as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return reduceMacro(dependentKey, function (min, item) {
      return Math.min(min, item);
    }, Infinity, 'min');
  }
  /**
    Returns an array mapped via the callback
  
    The callback method you provide should have the following signature:
    - `item` is the current item in the iteration.
    - `index` is the integer index of the current item in the iteration.
  
    ```javascript
    function mapCallback(item, index);
    ```
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { map } from '@ember/object/computed';
  
    class Hamster {
      constructor(chores) {
        set(this, 'chores', chores);
      }
  
      @map('chores', function(chore, index) {
        return `${chore.toUpperCase()}!`;
      })
      excitingChores;
    });
  
    let hamster = new Hamster(['clean', 'write more unit tests']);
  
    hamster.excitingChores; // ['CLEAN!', 'WRITE MORE UNIT TESTS!']
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { map } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      excitingChores: map('chores', function(chore, index) {
        return `${chore.toUpperCase()}!`;
      })
    });
  
    let hamster = Hamster.create({
      chores: ['clean', 'write more unit tests']
    });
  
    hamster.excitingChores; // ['CLEAN!', 'WRITE MORE UNIT TESTS!']
    ```
  
    You can optionally pass an array of additional dependent keys as the second
    parameter to the macro, if your map function relies on any external values:
  
    ```javascript
    import { set } from '@ember/object';
    import { map } from '@ember/object/computed';
  
    class Hamster {
      shouldUpperCase = false;
  
      constructor(chores) {
        set(this, 'chores', chores);
      }
  
      @map('chores', ['shouldUpperCase'], function(chore, index) {
        if (this.shouldUpperCase) {
          return `${chore.toUpperCase()}!`;
        } else {
          return `${chore}!`;
        }
      })
      excitingChores;
    }
  
    let hamster = new Hamster(['clean', 'write more unit tests']);
  
    hamster.excitingChores; // ['clean!', 'write more unit tests!']
  
    set(hamster, 'shouldUpperCase', true);
    hamster.excitingChores; // ['CLEAN!', 'WRITE MORE UNIT TESTS!']
    ```
  
    @method map
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @param {Array} [additionalDependentKeys] optional array of additional
    dependent keys
    @param {Function} callback
    @return {ComputedProperty} an array mapped via the callback
    @public
  */


  function map(dependentKey, additionalDependentKeys, callback) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @map as a decorator directly, but it requires atleast `dependentKey` and `callback` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));

    if (callback === undefined && typeof additionalDependentKeys === 'function') {
      callback = additionalDependentKeys;
      additionalDependentKeys = [];
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('The final parameter provided to map must be a callback function', typeof callback === 'function'));
    (false && !(Array.isArray(additionalDependentKeys)) && (0, _debug.assert)('The second parameter provided to map must either be the callback or an array of additional dependent keys', Array.isArray(additionalDependentKeys)));
    return arrayMacro(dependentKey, additionalDependentKeys, function (value) {
      return value.map(callback, this);
    });
  }
  /**
    Returns an array mapped to the specified key.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { mapBy } from '@ember/object/computed';
  
    class Person {
      children = [];
  
      @mapBy('children', 'age') childAges;
    }
  
    let lordByron = new Person();
  
    lordByron.childAges; // []
  
    set(lordByron, 'children', [
      {
        name: 'Augusta Ada Byron',
        age: 7
      }
    ]);
    lordByron.childAges; // [7]
  
    set(lordByron, 'children', [
      ...lordByron.children,
      {
        name: 'Allegra Byron',
        age: 5
      }, {
        name: 'Elizabeth Medora Leigh',
        age: 8
      }
    ]);
    lordByron.childAges; // [7, 5, 8]
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { mapBy } from '@ember/object/computed';
  
    let Person = EmberObject.extend({
      childAges: mapBy('children', 'age')
    });
  
    let lordByron = Person.create({ children: [] });
  
    lordByron.childAges; // []
  
    set(lordByron, 'children', [
      {
        name: 'Augusta Ada Byron',
        age: 7
      }
    ]);
    lordByron.childAges; // [7]
  
    set(lordByron, 'children', [
      ...lordByron.children,
      {
        name: 'Allegra Byron',
        age: 5
      }, {
        name: 'Elizabeth Medora Leigh',
        age: 8
      }
    ]);
    lordByron.childAges; // [7, 5, 8]
    ```
  
    @method mapBy
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @param {String} propertyKey
    @return {ComputedProperty} an array mapped to the specified key
    @public
  */


  function mapBy(dependentKey, propertyKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @mapBy as a decorator directly, but it requires `dependentKey` and `propertyKey` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    (false && !(typeof propertyKey === 'string') && (0, _debug.assert)('`computed.mapBy` expects a property string for its second argument, ' + 'perhaps you meant to use "map"', typeof propertyKey === 'string'));
    (false && !(!/[\[\]\{\}]/g.test(dependentKey)) && (0, _debug.assert)("Dependent key passed to `computed.mapBy` shouldn't contain brace expanding pattern.", !/[\[\]\{\}]/g.test(dependentKey)));
    return map(dependentKey + ".@each." + propertyKey, function (item) {
      return (0, _metal.get)(item, propertyKey);
    });
  }
  /**
    Filters the array by the callback.
  
    The callback method you provide should have the following signature:
    - `item` is the current item in the iteration.
    - `index` is the integer index of the current item in the iteration.
    - `array` is the dependant array itself.
  
    ```javascript
    function filterCallback(item, index, array);
    ```
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { filter } from '@ember/object/computed';
  
    class Hamster {
      constructor(chores) {
        set(this, 'chores', chores);
      }
  
      @filter('chores', function(chore, index, array) {
        return !chore.done;
      })
      remainingChores;
    }
  
    let hamster = Hamster.create([
      { name: 'cook', done: true },
      { name: 'clean', done: true },
      { name: 'write more unit tests', done: false }
    ]);
  
    hamster.remainingChores; // [{name: 'write more unit tests', done: false}]
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { filter } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      remainingChores: filter('chores', function(chore, index, array) {
        return !chore.done;
      })
    });
  
    let hamster = Hamster.create({
      chores: [
        { name: 'cook', done: true },
        { name: 'clean', done: true },
        { name: 'write more unit tests', done: false }
      ]
    });
  
    hamster.remainingChores; // [{name: 'write more unit tests', done: false}]
    ```
  
    You can also use `@each.property` in your dependent key, the callback will
    still use the underlying array:
  
    ```javascript
    import { set } from '@ember/object';
    import { filter } from '@ember/object/computed';
  
    class Hamster {
      constructor(chores) {
        set(this, 'chores', chores);
      }
  
      @filter('chores.@each.done', function(chore, index, array) {
        return !chore.done;
      })
      remainingChores;
    }
  
    let hamster = new Hamster([
      { name: 'cook', done: true },
      { name: 'clean', done: true },
      { name: 'write more unit tests', done: false }
    ]);
    hamster.remainingChores; // [{name: 'write more unit tests', done: false}]
  
    set(hamster.chores[2], 'done', true);
    hamster.remainingChores; // []
    ```
  
    Finally, you can optionally pass an array of additional dependent keys as the
    second parameter to the macro, if your filter function relies on any external
    values:
  
    ```javascript
    import { filter } from '@ember/object/computed';
  
    class Hamster {
      constructor(chores) {
        set(this, 'chores', chores);
      }
  
      doneKey = 'finished';
  
      @filter('chores', ['doneKey'], function(chore, index, array) {
        return !chore[this.doneKey];
      })
      remainingChores;
    }
  
    let hamster = new Hamster([
      { name: 'cook', finished: true },
      { name: 'clean', finished: true },
      { name: 'write more unit tests', finished: false }
    ]);
  
    hamster.remainingChores; // [{name: 'write more unit tests', finished: false}]
    ```
  
    @method filter
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @param {Array} [additionalDependentKeys] optional array of additional dependent keys
    @param {Function} callback
    @return {ComputedProperty} the filtered array
    @public
  */


  function filter(dependentKey, additionalDependentKeys, callback) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @filter as a decorator directly, but it requires atleast `dependentKey` and `callback` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));

    if (callback === undefined && typeof additionalDependentKeys === 'function') {
      callback = additionalDependentKeys;
      additionalDependentKeys = [];
    }

    (false && !(typeof callback === 'function') && (0, _debug.assert)('The final parameter provided to filter must be a callback function', typeof callback === 'function'));
    (false && !(Array.isArray(additionalDependentKeys)) && (0, _debug.assert)('The second parameter provided to filter must either be the callback or an array of additional dependent keys', Array.isArray(additionalDependentKeys)));
    return arrayMacro(dependentKey, additionalDependentKeys, function (value) {
      return value.filter(callback, this);
    });
  }
  /**
    Filters the array by the property and value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { filterBy } from '@ember/object/computed';
  
    class Hamster {
      constructor(chores) {
        set(this, 'chores', chores);
      }
  
      @filterBy('chores', 'done', false) remainingChores;
    }
  
    let hamster = new Hamster([
      { name: 'cook', done: true },
      { name: 'clean', done: true },
      { name: 'write more unit tests', done: false }
    ]);
  
    hamster.remainingChores; // [{ name: 'write more unit tests', done: false }]
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { filterBy } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      remainingChores: filterBy('chores', 'done', false)
    });
  
    let hamster = Hamster.create({
      chores: [
        { name: 'cook', done: true },
        { name: 'clean', done: true },
        { name: 'write more unit tests', done: false }
      ]
    });
  
    hamster.remainingChores; // [{ name: 'write more unit tests', done: false }]
    ```
  
    @method filterBy
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @param {String} propertyKey
    @param {*} value
    @return {ComputedProperty} the filtered array
    @public
  */


  function filterBy(dependentKey, propertyKey, value) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @filterBy as a decorator directly, but it requires atleast `dependentKey` and `propertyKey` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    (false && !(!/[\[\]\{\}]/g.test(dependentKey)) && (0, _debug.assert)("Dependent key passed to `computed.filterBy` shouldn't contain brace expanding pattern.", !/[\[\]\{\}]/g.test(dependentKey)));
    var callback;

    if (arguments.length === 2) {
      callback = function callback(item) {
        return (0, _metal.get)(item, propertyKey);
      };
    } else {
      callback = function callback(item) {
        return (0, _metal.get)(item, propertyKey) === value;
      };
    }

    return filter(dependentKey + ".@each." + propertyKey, callback);
  }
  /**
    A computed property which returns a new array with all the unique elements
    from one or more dependent arrays.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { uniq } from '@ember/object/computed';
  
    class Hamster {
      constructor(fruits) {
        set(this, 'fruits', fruits);
      }
  
      @uniq('fruits') uniqueFruits;
    }
  
    let hamster = new Hamster([
      'banana',
      'grape',
      'kale',
      'banana'
    ]);
  
    hamster.uniqueFruits; // ['banana', 'grape', 'kale']
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { uniq } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      uniqueFruits: uniq('fruits')
    });
  
    let hamster = Hamster.create({
      fruits: [
        'banana',
        'grape',
        'kale',
        'banana'
      ]
    });
  
    hamster.uniqueFruits; // ['banana', 'grape', 'kale']
    ```
  
    @method uniq
    @for @ember/object/computed
    @static
    @param {String} propertyKey*
    @return {ComputedProperty} computes a new array with all the
    unique elements from the dependent array
    @public
  */


  function uniq() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @uniq/@union as a decorator directly, but it requires atleast one dependent key parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return multiArrayMacro(args, function (dependentKeys) {
      var _this = this;

      var uniq = (0, _runtime.A)();
      var seen = new Set();
      dependentKeys.forEach(function (dependentKey) {
        var value = (0, _metal.get)(_this, dependentKey);

        if ((0, _runtime.isArray)(value)) {
          value.forEach(function (item) {
            if (!seen.has(item)) {
              seen.add(item);
              uniq.push(item);
            }
          });
        }
      });
      return uniq;
    }, 'uniq');
  }
  /**
    A computed property which returns a new array with all the unique elements
    from an array, with uniqueness determined by specific key.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { uniqBy } from '@ember/object/computed';
  
    class Hamster {
      constructor(fruits) {
        set(this, 'fruits', fruits);
      }
  
      @uniqBy('fruits', 'id') uniqueFruits;
    }
  
    let hamster = new Hamster([
      { id: 1, 'banana' },
      { id: 2, 'grape' },
      { id: 3, 'peach' },
      { id: 1, 'banana' }
    ]);
  
    hamster.uniqueFruits; // [ { id: 1, 'banana' }, { id: 2, 'grape' }, { id: 3, 'peach' }]
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { uniqBy } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      uniqueFruits: uniqBy('fruits', 'id')
    });
  
    let hamster = Hamster.create({
      fruits: [
        { id: 1, 'banana' },
        { id: 2, 'grape' },
        { id: 3, 'peach' },
        { id: 1, 'banana' }
      ]
    });
  
    hamster.uniqueFruits; // [ { id: 1, 'banana' }, { id: 2, 'grape' }, { id: 3, 'peach' }]
    ```
  
    @method uniqBy
    @for @ember/object/computed
    @static
    @param {String} dependentKey
    @param {String} propertyKey
    @return {ComputedProperty} computes a new array with all the
    unique elements from the dependent array
    @public
  */


  function uniqBy(dependentKey, propertyKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @uniqBy as a decorator directly, but it requires `dependentKey` and `propertyKey` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    (false && !(!/[\[\]\{\}]/g.test(dependentKey)) && (0, _debug.assert)("Dependent key passed to `computed.uniqBy` shouldn't contain brace expanding pattern.", !/[\[\]\{\}]/g.test(dependentKey)));
    return (0, _metal.computed)(dependentKey + ".[]", function () {
      var list = (0, _metal.get)(this, dependentKey);
      return (0, _runtime.isArray)(list) ? (0, _runtime.uniqBy)(list, propertyKey) : (0, _runtime.A)();
    }).readOnly();
  }
  /**
    A computed property which returns a new array with all the unique elements
    from one or more dependent arrays.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { union } from '@ember/object/computed';
  
    class Hamster {
      constructor(fruits, vegetables) {
        set(this, 'fruits', fruits);
        set(this, 'vegetables', vegetables);
      }
  
      @union('fruits', 'vegetables') ediblePlants;
    });
  
    let hamster = new, Hamster(
      [
        'banana',
        'grape',
        'kale',
        'banana',
        'tomato'
      ],
      [
        'tomato',
        'carrot',
        'lettuce'
      ]
    );
  
    hamster.uniqueFruits; // ['banana', 'grape', 'kale', 'tomato', 'carrot', 'lettuce']
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { union } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      uniqueFruits: union('fruits', 'vegetables')
    });
  
    let hamster = Hamster.create({
      fruits: [
        'banana',
        'grape',
        'kale',
        'banana',
        'tomato'
      ],
      vegetables: [
        'tomato',
        'carrot',
        'lettuce'
      ]
    });
  
    hamster.uniqueFruits; // ['banana', 'grape', 'kale', 'tomato', 'carrot', 'lettuce']
    ```
  
    @method union
    @for @ember/object/computed
    @static
    @param {String} propertyKey*
    @return {ComputedProperty} computes a new array with all the unique elements
    from one or more dependent arrays.
    @public
  */


  var union = uniq;
  /**
    A computed property which returns a new array with all the elements
    two or more dependent arrays have in common.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { intersect } from '@ember/object/computed';
  
    class FriendGroups {
      constructor(adaFriends, charlesFriends) {
        set(this, 'adaFriends', adaFriends);
        set(this, 'charlesFriends', charlesFriends);
      }
  
      @intersect('adaFriends', 'charlesFriends') friendsInCommon;
    }
  
    let groups = new FriendGroups(
      ['Charles Babbage', 'John Hobhouse', 'William King', 'Mary Somerville'],
      ['William King', 'Mary Somerville', 'Ada Lovelace', 'George Peacock']
    );
  
    groups.friendsInCommon; // ['William King', 'Mary Somerville']
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { intersect } from '@ember/object/computed';
  
    let FriendGroups = EmberObject.extend({
      friendsInCommon: intersect('adaFriends', 'charlesFriends')
    });
  
    let groups = FriendGroups.create({
      adaFriends: ['Charles Babbage', 'John Hobhouse', 'William King', 'Mary Somerville'],
      charlesFriends: ['William King', 'Mary Somerville', 'Ada Lovelace', 'George Peacock']
    });
  
    groups.friendsInCommon; // ['William King', 'Mary Somerville']
    ```
  
    @method intersect
    @for @ember/object/computed
    @static
    @param {String} propertyKey*
    @return {ComputedProperty} computes a new array with all the duplicated
    elements from the dependent arrays
    @public
  */

  _exports.union = union;

  function intersect() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @intersect as a decorator directly, but it requires atleast one dependent key parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return multiArrayMacro(args, function (dependentKeys) {
      var _this2 = this;

      var arrays = dependentKeys.map(function (dependentKey) {
        var array = (0, _metal.get)(_this2, dependentKey);
        return (0, _runtime.isArray)(array) ? array : [];
      });
      var results = arrays.pop().filter(function (candidate) {
        for (var i = 0; i < arrays.length; i++) {
          var found = false;
          var array = arrays[i];

          for (var j = 0; j < array.length; j++) {
            if (array[j] === candidate) {
              found = true;
              break;
            }
          }

          if (found === false) {
            return false;
          }
        }

        return true;
      });
      return (0, _runtime.A)(results);
    }, 'intersect');
  }
  /**
    A computed property which returns a new array with all the properties from the
    first dependent array that are not in the second dependent array.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { setDiff } from '@ember/object/computed';
  
    class Hamster {
      constructor(likes, fruits) {
        set(this, 'likes', likes);
        set(this, 'fruits', fruits);
      }
  
      @setDiff('likes', 'fruits') wants;
    }
  
    let hamster = new Hamster(
      [
        'banana',
        'grape',
        'kale'
      ],
      [
        'grape',
        'kale',
      ]
    );
  
    hamster.wants; // ['banana']
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { setDiff } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      wants: setDiff('likes', 'fruits')
    });
  
    let hamster = Hamster.create({
      likes: [
        'banana',
        'grape',
        'kale'
      ],
      fruits: [
        'grape',
        'kale',
      ]
    });
  
    hamster.wants; // ['banana']
    ```
  
    @method setDiff
    @for @ember/object/computed
    @static
    @param {String} setAProperty
    @param {String} setBProperty
    @return {ComputedProperty} computes a new array with all the items from the
    first dependent array that are not in the second dependent array
    @public
  */


  function setDiff(setAProperty, setBProperty) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @setDiff as a decorator directly, but it requires atleast one dependent key parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    (false && !(arguments.length === 2) && (0, _debug.assert)('`computed.setDiff` requires exactly two dependent arrays.', arguments.length === 2));
    (false && !(!/[\[\]\{\}]/g.test(setAProperty) && !/[\[\]\{\}]/g.test(setBProperty)) && (0, _debug.assert)("Dependent keys passed to `computed.setDiff` shouldn't contain brace expanding pattern.", !/[\[\]\{\}]/g.test(setAProperty) && !/[\[\]\{\}]/g.test(setBProperty)));
    return (0, _metal.computed)(setAProperty + ".[]", setBProperty + ".[]", function () {
      var setA = this.get(setAProperty);
      var setB = this.get(setBProperty);

      if (!(0, _runtime.isArray)(setA)) {
        return (0, _runtime.A)();
      }

      if (!(0, _runtime.isArray)(setB)) {
        return (0, _runtime.A)(setA);
      }

      return setA.filter(function (x) {
        return setB.indexOf(x) === -1;
      });
    }).readOnly();
  }
  /**
    A computed property that returns the array of values for the provided
    dependent properties.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { collect } from '@ember/object/computed';
  
    class Hamster {
      @collect('hat', 'shirt') clothes;
    }
  
    let hamster = new Hamster();
  
    hamster.clothes; // [null, null]
  
    set(hamster, 'hat', 'Camp Hat');
    set(hamster, 'shirt', 'Camp Shirt');
    hamster.clothes; // ['Camp Hat', 'Camp Shirt']
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { collect } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      clothes: collect('hat', 'shirt')
    });
  
    let hamster = Hamster.create();
  
    hamster.clothes; // [null, null]
  
    set(hamster, 'hat', 'Camp Hat');
    set(hamster, 'shirt', 'Camp Shirt');
    hamster.clothes; // ['Camp Hat', 'Camp Shirt']
    ```
  
    @method collect
    @for @ember/object/computed
    @static
    @param {String} dependentKey*
    @return {ComputedProperty} computed property which maps values of all passed
    in properties to an array.
    @public
  */


  function collect() {
    for (var _len3 = arguments.length, dependentKeys = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      dependentKeys[_key3] = arguments[_key3];
    }

    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @collect as a decorator directly, but it requires atleast one dependent key parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return multiArrayMacro(dependentKeys, function () {
      var _this3 = this;

      var res = dependentKeys.map(function (key) {
        var val = (0, _metal.get)(_this3, key);
        return val === undefined ? null : val;
      });
      return (0, _runtime.A)(res);
    }, 'collect');
  }
  /**
    A computed property which returns a new array with all the properties from the
    first dependent array sorted based on a property or sort function. The sort
    macro can be used in two different ways:
  
    1. By providing a sort callback function
    2. By providing an array of keys to sort the array
  
    In the first form, the callback method you provide should have the following
    signature:
  
    ```javascript
    function sortCallback(itemA, itemB);
    ```
  
    - `itemA` the first item to compare.
    - `itemB` the second item to compare.
  
    This function should return negative number (e.g. `-1`) when `itemA` should
    come before `itemB`. It should return positive number (e.g. `1`) when `itemA`
    should come after `itemB`. If the `itemA` and `itemB` are equal this function
    should return `0`.
  
    Therefore, if this function is comparing some numeric values, simple `itemA -
    itemB` or `itemA.get( 'foo' ) - itemB.get( 'foo' )` can be used instead of
    series of `if`.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { sort } from '@ember/object/computed';
  
    class ToDoList {
      constructor(todos) {
        set(this, 'todos', todos);
      }
  
      // using a custom sort function
      @sort('todos', function(a, b){
        if (a.priority > b.priority) {
          return 1;
        } else if (a.priority < b.priority) {
          return -1;
        }
  
        return 0;
      })
      priorityTodos;
    }
  
    let todoList = new ToDoList([
      { name: 'Unit Test', priority: 2 },
      { name: 'Documentation', priority: 3 },
      { name: 'Release', priority: 1 }
    ]);
  
    todoList.priorityTodos; // [{ name:'Release', priority:1 }, { name:'Unit Test', priority:2 }, { name:'Documentation', priority:3 }]
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject from '@ember/object';
    import { sort } from '@ember/object/computed';
  
    let ToDoList = EmberObject.extend({
      // using a custom sort function
      priorityTodos: sort('todos', function(a, b){
        if (a.priority > b.priority) {
          return 1;
        } else if (a.priority < b.priority) {
          return -1;
        }
  
        return 0;
      })
    });
  
    let todoList = ToDoList.create({
      todos: [
        { name: 'Unit Test', priority: 2 },
        { name: 'Documentation', priority: 3 },
        { name: 'Release', priority: 1 }
      ]
    });
  
    todoList.priorityTodos; // [{ name:'Release', priority:1 }, { name:'Unit Test', priority:2 }, { name:'Documentation', priority:3 }]
    ```
  
    You can also optionally pass an array of additional dependent keys as the
    second parameter, if your sort function is dependent on additional values that
    could changes:
  
    ```js
    import EmberObject, { set } from '@ember/object';
    import { sort } from '@ember/object/computed';
  
    class ToDoList {
      sortKey = 'priority';
  
      constructor(todos) {
        set(this, 'todos', todos);
      }
  
      // using a custom sort function
      @sort('todos', ['sortKey'], function(a, b){
        if (a[this.sortKey] > b[this.sortKey]) {
          return 1;
        } else if (a[this.sortKey] < b[this.sortKey]) {
          return -1;
        }
  
        return 0;
      })
      sortedTodos;
    });
  
    let todoList = new ToDoList([
      { name: 'Unit Test', priority: 2 },
      { name: 'Documentation', priority: 3 },
      { name: 'Release', priority: 1 }
    ]);
  
    todoList.priorityTodos; // [{ name:'Release', priority:1 }, { name:'Unit Test', priority:2 }, { name:'Documentation', priority:3 }]
    ```
  
    In the second form, you should provide the key of the array of sort values as
    the second parameter:
  
    ```javascript
    import { set } from '@ember/object';
    import { sort } from '@ember/object/computed';
  
    class ToDoList {
      constructor(todos) {
        set(this, 'todos', todos);
      }
  
      // using standard ascending sort
      todosSorting = ['name'];
      @sort('todos', 'todosSorting') sortedTodos;
  
      // using descending sort
      todosSortingDesc = ['name:desc'];
      @sort('todos', 'todosSortingDesc') sortedTodosDesc;
    }
  
    let todoList = new ToDoList([
      { name: 'Unit Test', priority: 2 },
      { name: 'Documentation', priority: 3 },
      { name: 'Release', priority: 1 }
    ]);
  
    todoList.sortedTodos; // [{ name:'Documentation', priority:3 }, { name:'Release', priority:1 }, { name:'Unit Test', priority:2 }]
    todoList.sortedTodosDesc; // [{ name:'Unit Test', priority:2 }, { name:'Release', priority:1 }, { name:'Documentation', priority:3 }]
    ```
  
    @method sort
    @for @ember/object/computed
    @static
    @param {String} itemsKey
    @param {Array} [additionalDependentKeys] optional array of additional
    dependent keys
    @param {String or Function} sortDefinition a dependent key to an array of sort
    properties (add `:desc` to the arrays sort properties to sort descending) or a
    function to use when sorting
    @return {ComputedProperty} computes a new sorted array based on the sort
    property array or callback function
    @public
  */


  function sort(itemsKey, additionalDependentKeys, sortDefinition) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @sort as a decorator directly, but it requires atleast an `itemsKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));

    if (false
    /* DEBUG */
    ) {
      var argumentsValid = false;

      if (arguments.length === 2) {
        argumentsValid = typeof itemsKey === 'string' && (typeof additionalDependentKeys === 'string' || typeof additionalDependentKeys === 'function');
      }

      if (arguments.length === 3) {
        argumentsValid = typeof itemsKey === 'string' && Array.isArray(additionalDependentKeys) && typeof sortDefinition === 'function';
      }

      (false && !(argumentsValid) && (0, _debug.assert)('`computed.sort` can either be used with an array of sort properties or with a sort function. If used with an array of sort properties, it must receive exactly two arguments: the key of the array to sort, and the key of the array of sort properties. If used with a sort function, it may recieve up to three arguments: the key of the array to sort, an optional additional array of dependent keys for the computed property, and the sort function.', argumentsValid));
    }

    if (sortDefinition === undefined && !Array.isArray(additionalDependentKeys)) {
      sortDefinition = additionalDependentKeys;
      additionalDependentKeys = [];
    }

    if (typeof sortDefinition === 'function') {
      return customSort(itemsKey, additionalDependentKeys, sortDefinition);
    } else {
      return propertySort(itemsKey, sortDefinition);
    }
  }

  function customSort(itemsKey, additionalDependentKeys, comparator) {
    return arrayMacro(itemsKey, additionalDependentKeys, function (value) {
      var _this4 = this;

      return value.slice().sort(function (x, y) {
        return comparator.call(_this4, x, y);
      });
    });
  } // This one needs to dynamically set up and tear down observers on the itemsKey
  // depending on the sortProperties


  function propertySort(itemsKey, sortPropertiesKey) {
    var activeObserversMap = new WeakMap();
    var sortPropertyDidChangeMap = new WeakMap();

    if (true
    /* EMBER_METAL_TRACKED_PROPERTIES */
    ) {
        var cp = (0, _metal.computed)(itemsKey + ".[]", sortPropertiesKey + ".[]", function (key) {
          var sortProperties = (0, _metal.get)(this, sortPropertiesKey);
          (false && !((0, _runtime.isArray)(sortProperties) && sortProperties.every(function (s) {
            return typeof s === 'string';
          })) && (0, _debug.assert)("The sort definition for '" + key + "' on " + this + " must be a function or an array of strings", (0, _runtime.isArray)(sortProperties) && sortProperties.every(function (s) {
            return typeof s === 'string';
          })));
          var itemsKeyIsAtThis = itemsKey === '@this';
          var normalizedSortProperties = normalizeSortProperties(sortProperties);
          var items = itemsKeyIsAtThis ? this : (0, _metal.get)(this, itemsKey);

          if (!(0, _runtime.isArray)(items)) {
            return (0, _runtime.A)();
          }

          if (normalizedSortProperties.length === 0) {
            return (0, _runtime.A)(items.slice());
          } else {
            return sortByNormalizedSortProperties(items, normalizedSortProperties);
          }
        }).readOnly();
        (0, _metal.descriptorForDecorator)(cp).auto();
        return cp;
      } else {
      return (0, _metal.computed)(sortPropertiesKey + ".[]", function (key) {
        var _this5 = this;

        var sortProperties = (0, _metal.get)(this, sortPropertiesKey);
        (false && !((0, _runtime.isArray)(sortProperties) && sortProperties.every(function (s) {
          return typeof s === 'string';
        })) && (0, _debug.assert)("The sort definition for '" + key + "' on " + this + " must be a function or an array of strings", (0, _runtime.isArray)(sortProperties) && sortProperties.every(function (s) {
          return typeof s === 'string';
        }))); // Add/remove property observers as required.

        var activeObservers = activeObserversMap.get(this);

        if (!sortPropertyDidChangeMap.has(this)) {
          sortPropertyDidChangeMap.set(this, function () {
            (0, _metal.notifyPropertyChange)(this, key);
          });
        }

        var sortPropertyDidChange = sortPropertyDidChangeMap.get(this);

        if (activeObservers !== undefined) {
          activeObservers.forEach(function (path) {
            return (0, _metal.removeObserver)(_this5, path, sortPropertyDidChange);
          });
        }

        var itemsKeyIsAtThis = itemsKey === '@this';
        var normalizedSortProperties = normalizeSortProperties(sortProperties);

        if (normalizedSortProperties.length === 0) {
          var path = itemsKeyIsAtThis ? "[]" : itemsKey + ".[]";
          (0, _metal.addObserver)(this, path, sortPropertyDidChange);
          activeObservers = [path];
        } else {
          activeObservers = normalizedSortProperties.map(function (_ref) {
            var prop = _ref[0];
            var path = itemsKeyIsAtThis ? "@each." + prop : itemsKey + ".@each." + prop;
            (0, _metal.addObserver)(_this5, path, sortPropertyDidChange);
            return path;
          });
        }

        activeObserversMap.set(this, activeObservers);
        var items = itemsKeyIsAtThis ? this : (0, _metal.get)(this, itemsKey);

        if (!(0, _runtime.isArray)(items)) {
          return (0, _runtime.A)();
        }

        if (normalizedSortProperties.length === 0) {
          return (0, _runtime.A)(items.slice());
        } else {
          return sortByNormalizedSortProperties(items, normalizedSortProperties);
        }
      }).readOnly();
    }
  }

  function normalizeSortProperties(sortProperties) {
    return sortProperties.map(function (p) {
      var _p$split = p.split(':'),
          prop = _p$split[0],
          direction = _p$split[1];

      direction = direction || 'asc';
      return [prop, direction];
    });
  }

  function sortByNormalizedSortProperties(items, normalizedSortProperties) {
    return (0, _runtime.A)(items.slice().sort(function (itemA, itemB) {
      for (var i = 0; i < normalizedSortProperties.length; i++) {
        var _normalizedSortProper = normalizedSortProperties[i],
            prop = _normalizedSortProper[0],
            direction = _normalizedSortProper[1];
        var result = (0, _runtime.compare)((0, _metal.get)(itemA, prop), (0, _metal.get)(itemB, prop));

        if (result !== 0) {
          return direction === 'desc' ? -1 * result : result;
        }
      }

      return 0;
    }));
  }
});