define("@ember/object/lib/computed/computed_macros", ["exports", "@ember/-internals/metal", "@ember/debug"], function (_exports, _metal, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.empty = empty;
  _exports.notEmpty = notEmpty;
  _exports.none = none;
  _exports.not = not;
  _exports.bool = bool;
  _exports.match = match;
  _exports.equal = equal;
  _exports.gt = gt;
  _exports.gte = gte;
  _exports.lt = lt;
  _exports.lte = lte;
  _exports.oneWay = oneWay;
  _exports.readOnly = readOnly;
  _exports.deprecatingAlias = deprecatingAlias;
  _exports.or = _exports.and = void 0;

  /**
  @module @ember/object
  */
  function expandPropertiesToArray(predicateName, properties) {
    var expandedProperties = [];

    function extractProperty(entry) {
      expandedProperties.push(entry);
    }

    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      (false && !(property.indexOf(' ') < 0) && (0, _debug.assert)("Dependent keys passed to computed." + predicateName + "() can't have spaces.", property.indexOf(' ') < 0));
      (0, _metal.expandProperties)(property, extractProperty);
    }

    return expandedProperties;
  }

  function generateComputedWithPredicate(name, predicate) {
    return function () {
      for (var _len = arguments.length, properties = new Array(_len), _key = 0; _key < _len; _key++) {
        properties[_key] = arguments[_key];
      }

      (false && !(!(0, _metal.isElementDescriptor)(properties)) && (0, _debug.assert)("You attempted to use @" + name + " as a decorator directly, but it requires at least one dependent key parameter", !(0, _metal.isElementDescriptor)(properties)));
      var dependentKeys = expandPropertiesToArray(name, properties);

      var computedFunc = _metal.computed.apply(void 0, dependentKeys.concat([function () {
        var lastIdx = dependentKeys.length - 1;

        for (var i = 0; i < lastIdx; i++) {
          var value = (0, _metal.get)(this, dependentKeys[i]);

          if (!predicate(value)) {
            return value;
          }
        }

        return (0, _metal.get)(this, dependentKeys[lastIdx]);
      }]));

      return computedFunc;
    };
  }
  /**
    A computed property macro that returns true if the value of the dependent
    property is null, an empty string, empty array, or empty function.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { empty } from '@ember/object/computed';
  
    class ToDoList {
      constructor(todos) {
        set(this, 'todos', todos);
      }
  
      @empty('todos') isDone;
    }
  
    let todoList = new ToDoList(
      ['Unit Test', 'Documentation', 'Release']
    );
  
    todoList.isDone; // false
    set(todoList, 'todos', []);
    todoList.isDone; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { empty } from '@ember/object/computed';
  
    let ToDoList = EmberObject.extend({
      isDone: empty('todos')
    });
  
    let todoList = ToDoList.create({
      todos: ['Unit Test', 'Documentation', 'Release']
    });
  
    todoList.isDone; // false
    set(todoList, 'todos', []);
    todoList.isDone; // true
    ```
  
    @since 1.6.0
    @method empty
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which returns true if the value
    of the dependent property is null, an empty string, empty array, or empty
    function and false if the underlying value is not empty.
  
    @public
  */


  function empty(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @empty as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey + ".length", function () {
      return (0, _metal.isEmpty)((0, _metal.get)(this, dependentKey));
    });
  }
  /**
    A computed property that returns true if the value of the dependent property
    is NOT null, an empty string, empty array, or empty function.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { notEmpty } from '@ember/object/computed';
  
    class Hamster {
      constructor(backpack) {
        set(this, 'backpack', backpack);
      }
  
      @notEmpty('backpack') hasStuff
    }
  
    let hamster = new Hamster(
      ['Food', 'Sleeping Bag', 'Tent']
    );
  
    hamster.hasStuff; // true
    set(hamster, 'backpack', []);
    hamster.hasStuff; // false
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { notEmpty } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      hasStuff: notEmpty('backpack')
    });
  
    let hamster = Hamster.create({
      backpack: ['Food', 'Sleeping Bag', 'Tent']
    });
  
    hamster.hasStuff; // true
    set(hamster, 'backpack', []);
    hamster.hasStuff; // false
    ```
  
    @method notEmpty
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which returns true if original
    value for property is not empty.
    @public
  */


  function notEmpty(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @notEmpty as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey + ".length", function () {
      return !(0, _metal.isEmpty)((0, _metal.get)(this, dependentKey));
    });
  }
  /**
    A computed property that returns true if the value of the dependent property
    is null or undefined. This avoids errors from JSLint complaining about use of
    ==, which can be technically confusing.
  
    ```javascript
    import { set } from '@ember/object';
    import { none } from '@ember/object/computed';
  
    class Hamster {
      @none('food') isHungry;
    }
  
    let hamster = new Hamster();
  
    hamster.isHungry; // true
  
    set(hamster, 'food', 'Banana');
    hamster.isHungry; // false
  
    set(hamster, 'food', null);
    hamster.isHungry; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { none } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      isHungry: none('food')
    });
  
    let hamster = Hamster.create();
  
    hamster.isHungry; // true
  
    set(hamster, 'food', 'Banana');
    hamster.isHungry; // false
  
    set(hamster, 'food', null);
    hamster.isHungry; // true
    ```
  
    @method none
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which returns true if original
    value for property is null or undefined.
    @public
  */


  function none(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @none as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return (0, _metal.isNone)((0, _metal.get)(this, dependentKey));
    });
  }
  /**
    A computed property that returns the inverse boolean value of the original
    value for the dependent property.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { not } from '@ember/object/computed';
  
    class User {
      loggedIn = false;
  
      @not('loggedIn') isAnonymous;
    }
  
    let user = new User();
  
    user.isAnonymous; // true
    set(user, 'loggedIn', true);
    user.isAnonymous; // false
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { not } from '@ember/object/computed';
  
    let User = EmberObject.extend({
      loggedIn: false,
  
      isAnonymous: not('loggedIn')
    });
  
    let user = User.create();
  
    user.isAnonymous; // true
    set(user, 'loggedIn', true);
    user.isAnonymous; // false
    ```
  
    @method not
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which returns inverse of the
    original value for property
    @public
  */


  function not(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @not as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return !(0, _metal.get)(this, dependentKey);
    });
  }
  /**
    A computed property that converts the provided dependent property into a
    boolean value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { bool } from '@ember/object/computed';
  
  
    class Hamster {
      @bool('numBananas') hasBananas
    }
  
    let hamster = new Hamster();
  
    hamster.hasBananas; // false
  
    set(hamster, 'numBananas', 0);
    hamster.hasBananas; // false
  
    set(hamster, 'numBananas', 1);
    hamster.hasBananas; // true
  
    set(hamster, 'numBananas', null);
    hamster.hasBananas; // false
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { bool } from '@ember/object/computed';
  
  
    let Hamster = EmberObject.extend({
      hasBananas: bool('numBananas')
    });
  
    let hamster = Hamster.create();
  
    hamster.hasBananas; // false
  
    set(hamster, 'numBananas', 0);
    hamster.hasBananas; // false
  
    set(hamster, 'numBananas', 1);
    hamster.hasBananas; // true
  
    set(hamster, 'numBananas', null);
    hamster.hasBananas; // false
    ```
  
    @method bool
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which converts to boolean the
    original value for property
    @public
  */


  function bool(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @bool as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return Boolean((0, _metal.get)(this, dependentKey));
    });
  }
  /**
    A computed property which matches the original value for the dependent
    property against a given RegExp, returning `true` if the value matches the
    RegExp and `false` if it does not.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { match } from '@ember/object/computed';
  
    class User {
      @match('email', /^.+@.+\..+$/) hasValidEmail;
    }
  
    let user = new User();
  
    user.hasValidEmail; // false
  
    set(user, 'email', '');
    user.hasValidEmail; // false
  
    set(user, 'email', 'ember_hamster@example.com');
    user.hasValidEmail; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { match } from '@ember/object/computed';
  
    let User = EmberObject.extend({
      hasValidEmail: match('email', /^.+@.+\..+$/)
    });
  
    let user = User.create();
  
    user.hasValidEmail; // false
  
    set(user, 'email', '');
    user.hasValidEmail; // false
  
    set(user, 'email', 'ember_hamster@example.com');
    user.hasValidEmail; // true
    ```
  
    @method match
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {RegExp} regexp
    @return {ComputedProperty} computed property which match the original value
    for property against a given RegExp
    @public
  */


  function match(dependentKey, regexp) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @match as a decorator directly, but it requires `dependentKey` and `regexp` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      var value = (0, _metal.get)(this, dependentKey);
      return regexp.test(value);
    });
  }
  /**
    A computed property that returns true if the provided dependent property is
    equal to the given value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { equal } from '@ember/object/computed';
  
    class Hamster {
      @equal('percentCarrotsEaten', 100) satisfied;
    }
  
    let hamster = new Hamster();
  
    hamster.satisfied; // false
  
    set(hamster, 'percentCarrotsEaten', 100);
    hamster.satisfied; // true
  
    set(hamster, 'percentCarrotsEaten', 50);
    hamster.satisfied; // false
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { equal } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      satisfied: equal('percentCarrotsEaten', 100)
    });
  
    let hamster = Hamster.create();
  
    hamster.satisfied; // false
  
    set(hamster, 'percentCarrotsEaten', 100);
    hamster.satisfied; // true
  
    set(hamster, 'percentCarrotsEaten', 50);
    hamster.satisfied; // false
    ```
  
    @method equal
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {String|Number|Object} value
    @return {ComputedProperty} computed property which returns true if the
    original value for property is equal to the given value.
    @public
  */


  function equal(dependentKey, value) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @equal as a decorator directly, but it requires `dependentKey` and `value` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return (0, _metal.get)(this, dependentKey) === value;
    });
  }
  /**
    A computed property that returns true if the provided dependent property is
    greater than the provided value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { gt } from '@ember/object/computed';
  
    class Hamster {
      @gt('numBananas', 10) hasTooManyBananas;
    }
  
    let hamster = new Hamster();
  
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 3);
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 11);
    hamster.hasTooManyBananas; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { gt } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      hasTooManyBananas: gt('numBananas', 10)
    });
  
    let hamster = Hamster.create();
  
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 3);
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 11);
    hamster.hasTooManyBananas; // true
    ```
  
    @method gt
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {Number} value
    @return {ComputedProperty} computed property which returns true if the
    original value for property is greater than given value.
    @public
  */


  function gt(dependentKey, value) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @gt as a decorator directly, but it requires `dependentKey` and `value` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return (0, _metal.get)(this, dependentKey) > value;
    });
  }
  /**
    A computed property that returns true if the provided dependent property is
    greater than or equal to the provided value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { gte } from '@ember/object/computed';
  
    class Hamster {
      @gte('numBananas', 10) hasTooManyBananas;
    }
  
    let hamster = new Hamster();
  
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 3);
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 10);
    hamster.hasTooManyBananas; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { gte } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      hasTooManyBananas: gte('numBananas', 10)
    });
  
    let hamster = Hamster.create();
  
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 3);
    hamster.hasTooManyBananas; // false
  
    set(hamster, 'numBananas', 10);
    hamster.hasTooManyBananas; // true
    ```
  
    @method gte
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {Number} value
    @return {ComputedProperty} computed property which returns true if the
    original value for property is greater or equal then given value.
    @public
  */


  function gte(dependentKey, value) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @gte as a decorator directly, but it requires `dependentKey` and `value` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return (0, _metal.get)(this, dependentKey) >= value;
    });
  }
  /**
    A computed property that returns true if the provided dependent property is
    less than the provided value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { lt } from '@ember/object/computed';
  
    class Hamster {
      @lt('numBananas', 3) needsMoreBananas;
    }
  
    let hamster = new Hamster();
  
    hamster.needsMoreBananas; // true
  
    set(hamster, 'numBananas', 3);
    hamster.needsMoreBananas; // false
  
    set(hamster, 'numBananas', 2);
    hamster.needsMoreBananas; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { lt } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      needsMoreBananas: lt('numBananas', 3)
    });
  
    let hamster = Hamster.create();
  
    hamster.needsMoreBananas; // true
  
    set(hamster, 'numBananas', 3);
    hamster.needsMoreBananas; // false
  
    set(hamster, 'numBananas', 2);
    hamster.needsMoreBananas; // true
    ```
  
    @method lt
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {Number} value
    @return {ComputedProperty} computed property which returns true if the
    original value for property is less then given value.
    @public
  */


  function lt(dependentKey, value) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @lt as a decorator directly, but it requires `dependentKey` and `value` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return (0, _metal.get)(this, dependentKey) < value;
    });
  }
  /**
    A computed property that returns true if the provided dependent property is
    less than or equal to the provided value.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { lte } from '@ember/object/computed';
  
    class Hamster {
      @lte('numBananas', 3) needsMoreBananas;
    }
  
    let hamster = new Hamster();
  
    hamster.needsMoreBananas; // true
  
    set(hamster, 'numBananas', 5);
    hamster.needsMoreBananas; // false
  
    set(hamster, 'numBananas', 3);
    hamster.needsMoreBananas; // true
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { lte } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      needsMoreBananas: lte('numBananas', 3)
    });
  
    let hamster = Hamster.create();
  
    hamster.needsMoreBananas; // true
  
    set(hamster, 'numBananas', 5);
    hamster.needsMoreBananas; // false
  
    set(hamster, 'numBananas', 3);
    hamster.needsMoreBananas; // true
    ```
  
    @method lte
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {Number} value
    @return {ComputedProperty} computed property which returns true if the
    original value for property is less or equal than given value.
    @public
  */


  function lte(dependentKey, value) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @lte as a decorator directly, but it requires `dependentKey` and `value` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, function () {
      return (0, _metal.get)(this, dependentKey) <= value;
    });
  }
  /**
    A computed property that performs a logical `and` on the original values for
    the provided dependent properties.
  
    You may pass in more than two properties and even use property brace
    expansion.  The computed property will return the first falsy value or last
    truthy value just like JavaScript's `&&` operator.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { and } from '@ember/object/computed';
  
    class Hamster {
      @and('hasTent', 'hasBackpack') readyForCamp;
      @and('hasWalkingStick', 'hasBackpack') readyForHike;
    }
  
    let tomster = new Hamster();
  
    tomster.readyForCamp; // false
  
    set(tomster, 'hasTent', true);
    tomster.readyForCamp; // false
  
    set(tomster, 'hasBackpack', true);
    tomster.readyForCamp; // true
  
    set(tomster, 'hasBackpack', 'Yes');
    tomster.readyForCamp; // 'Yes'
  
    set(tomster, 'hasWalkingStick', null);
    tomster.readyForHike; // null
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { and } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      readyForCamp: and('hasTent', 'hasBackpack'),
      readyForHike: and('hasWalkingStick', 'hasBackpack')
    });
  
    let tomster = Hamster.create();
  
    tomster.readyForCamp; // false
  
    set(tomster, 'hasTent', true);
    tomster.readyForCamp; // false
  
    set(tomster, 'hasBackpack', true);
    tomster.readyForCamp; // true
  
    set(tomster, 'hasBackpack', 'Yes');
    tomster.readyForCamp; // 'Yes'
  
    set(tomster, 'hasWalkingStick', null);
    tomster.readyForHike; // null
    ```
  
    @method and
    @static
    @for @ember/object/computed
    @param {String} dependentKey*
    @return {ComputedProperty} computed property which performs a logical `and` on
    the values of all the original values for properties.
    @public
  */


  var and = generateComputedWithPredicate('and', function (value) {
    return value;
  });
  /**
    A computed property which performs a logical `or` on the original values for
    the provided dependent properties.
  
    You may pass in more than two properties and even use property brace
    expansion.  The computed property will return the first truthy value or last
    falsy value just like JavaScript's `||` operator.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { or } from '@ember/object/computed';
  
    class Hamster {
      @or('hasJacket', 'hasUmbrella') readyForRain;
      @or('hasSunscreen', 'hasUmbrella') readyForBeach;
    }
  
    let tomster = new Hamster();
  
    tomster.readyForRain; // undefined
  
    set(tomster, 'hasUmbrella', true);
    tomster.readyForRain; // true
  
    set(tomster, 'hasJacket', 'Yes');
    tomster.readyForRain; // 'Yes'
  
    set(tomster, 'hasSunscreen', 'Check');
    tomster.readyForBeach; // 'Check'
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { or } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      readyForRain: or('hasJacket', 'hasUmbrella'),
      readyForBeach: or('hasSunscreen', 'hasUmbrella')
    });
  
    let tomster = Hamster.create();
  
    tomster.readyForRain; // undefined
  
    set(tomster, 'hasUmbrella', true);
    tomster.readyForRain; // true
  
    set(tomster, 'hasJacket', 'Yes');
    tomster.readyForRain; // 'Yes'
  
    set(tomster, 'hasSunscreen', 'Check');
    tomster.readyForBeach; // 'Check'
    ```
  
    @method or
    @static
    @for @ember/object/computed
    @param {String} dependentKey*
    @return {ComputedProperty} computed property which performs a logical `or` on
    the values of all the original values for properties.
    @public
  */

  _exports.and = and;
  var or = generateComputedWithPredicate('or', function (value) {
    return !value;
  });
  /**
    Creates a new property that is an alias for another property on an object.
    Calls to `get` or `set` this property behave as though they were called on the
    original property.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { alias } from '@ember/object/computed';
  
    class Person {
      name = 'Alex Matchneer';
  
      @alias('name') nomen;
    }
  
    let alex = new Person();
  
    alex.nomen; // 'Alex Matchneer'
    alex.name;  // 'Alex Matchneer'
  
    set(alex, 'nomen', '@machty');
    alex.name;  // '@machty'
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { alias } from '@ember/object/computed';
  
    let Person = EmberObject.extend({
      name: 'Alex Matchneer',
  
      nomen: alias('name')
    });
  
    let alex = Person.create();
  
    alex.nomen; // 'Alex Matchneer'
    alex.name;  // 'Alex Matchneer'
  
    set(alex, 'nomen', '@machty');
    alex.name;  // '@machty'
    ```
  
    @method alias
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which creates an alias to the
    original value for property.
    @public
  */

  /**
    Where `computed.alias` aliases `get` and `set`, and allows for bidirectional
    data flow, `computed.oneWay` only provides an aliased `get`. The `set` will
    not mutate the upstream property, rather causes the current property to become
    the value set. This causes the downstream property to permanently diverge from
    the upstream property.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { oneWay }from '@ember/object/computed';
  
    class User {
      constructor(firstName, lastName) {
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
  
      @oneWay('firstName') nickName;
    }
  
    let teddy = new User('Teddy', 'Zeenny');
  
    teddy.nickName; // 'Teddy'
  
    set(teddy, 'nickName', 'TeddyBear');
    teddy.firstName; // 'Teddy'
    teddy.nickName; // 'TeddyBear'
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { oneWay } from '@ember/object/computed';
  
    let User = EmberObject.extend({
      firstName: null,
      lastName: null,
  
      nickName: oneWay('firstName')
    });
  
    let teddy = User.create({
      firstName: 'Teddy',
      lastName: 'Zeenny'
    });
  
    teddy.nickName; // 'Teddy'
  
    set(teddy, 'nickName', 'TeddyBear'); // 'TeddyBear'
    teddy.firstName; // 'Teddy'
    teddy.nickName; // 'TeddyBear'
    ```
  
    @method oneWay
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which creates a one way computed
    property to the original value for property.
    @public
  */

  _exports.or = or;

  function oneWay(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @oneWay as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.alias)(dependentKey).oneWay();
  }
  /**
    This is a more semantically meaningful alias of `computed.oneWay`, whose name
    is somewhat ambiguous as to which direction the data flows.
  
    @method reads
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which creates a one way computed
      property to the original value for property.
    @public
   */

  /**
    Where `computed.oneWay` provides oneWay bindings, `computed.readOnly` provides
    a readOnly one way binding. Very often when using `computed.oneWay` one does
    not also want changes to propagate back up, as they will replace the value.
  
    This prevents the reverse flow, and also throws an exception when it occurs.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { readOnly } from '@ember/object/computed';
  
    class User {
      constructor(firstName, lastName) {
        set(this, 'firstName', firstName);
        set(this, 'lastName', lastName);
      }
  
      @readOnly('firstName') nickName;
    });
  
    let teddy = new User('Teddy', 'Zeenny');
  
    teddy.nickName; // 'Teddy'
  
    set(teddy, 'nickName', 'TeddyBear'); // throws Exception
    // throw new EmberError('Cannot Set: nickName on: <User:ember27288>' );`
  
    teddy.firstName; // 'Teddy'
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { readOnly } from '@ember/object/computed';
  
    let User = EmberObject.extend({
      firstName: null,
      lastName: null,
  
      nickName: readOnly('firstName')
    });
  
    let teddy = User.create({
      firstName: 'Teddy',
      lastName:  'Zeenny'
    });
  
    teddy.nickName; // 'Teddy'
  
    set(teddy, 'nickName', 'TeddyBear'); // throws Exception
    // throw new EmberError('Cannot Set: nickName on: <User:ember27288>' );`
  
    teddy.firstName; // 'Teddy'
    ```
  
    @method readOnly
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @return {ComputedProperty} computed property which creates a one way computed
    property to the original value for property.
    @since 1.5.0
    @public
  */


  function readOnly(dependentKey) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @readOnly as a decorator directly, but it requires a `dependentKey` parameter', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.alias)(dependentKey).readOnly();
  }
  /**
    Creates a new property that is an alias for another property on an object.
    Calls to `get` or `set` this property behave as though they were called on the
    original property, but also print a deprecation warning.
  
    Example:
  
    ```javascript
    import { set } from '@ember/object';
    import { deprecatingAlias } from '@ember/object/computed';
  
    class Hamster {
      @deprecatingAlias('cavendishCount', {
        id: 'hamster.deprecate-banana',
        until: '3.0.0'
      })
      bananaCount;
    }
  
    let hamster = new Hamster();
  
    set(hamster, 'bananaCount', 5); // Prints a deprecation warning.
    hamster.cavendishCount; // 5
    ```
  
    Classic Class Example:
  
    ```javascript
    import EmberObject, { set } from '@ember/object';
    import { deprecatingAlias } from '@ember/object/computed';
  
    let Hamster = EmberObject.extend({
      bananaCount: deprecatingAlias('cavendishCount', {
        id: 'hamster.deprecate-banana',
        until: '3.0.0'
      })
    });
  
    let hamster = Hamster.create();
  
    set(hamster, 'bananaCount', 5); // Prints a deprecation warning.
    hamster.cavendishCount; // 5
    ```
  
    @method deprecatingAlias
    @static
    @for @ember/object/computed
    @param {String} dependentKey
    @param {Object} options Options for `deprecate`.
    @return {ComputedProperty} computed property which creates an alias with a
    deprecation to the original value for property.
    @since 1.7.0
    @public
  */


  function deprecatingAlias(dependentKey, options) {
    (false && !(!(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))) && (0, _debug.assert)('You attempted to use @deprecatingAlias as a decorator directly, but it requires `dependentKey` and `options` parameters', !(0, _metal.isElementDescriptor)(Array.prototype.slice.call(arguments))));
    return (0, _metal.computed)(dependentKey, {
      get: function get(key) {
        (false && !(false) && (0, _debug.deprecate)("Usage of `" + key + "` is deprecated, use `" + dependentKey + "` instead.", false, options));
        return (0, _metal.get)(this, dependentKey);
      },
      set: function set(key, value) {
        (false && !(false) && (0, _debug.deprecate)("Usage of `" + key + "` is deprecated, use `" + dependentKey + "` instead.", false, options));
        (0, _metal.set)(this, dependentKey, value);
        return value;
      }
    });
  }
});