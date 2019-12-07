define("ember-babel", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.wrapNativeSuper = wrapNativeSuper;
  _exports.classCallCheck = classCallCheck;
  _exports.inheritsLoose = inheritsLoose;
  _exports.taggedTemplateLiteralLoose = taggedTemplateLiteralLoose;
  _exports.createClass = createClass;
  _exports.assertThisInitialized = assertThisInitialized;
  _exports.possibleConstructorReturn = possibleConstructorReturn;
  _exports.objectDestructuringEmpty = objectDestructuringEmpty;
  var setPrototypeOf = Object.setPrototypeOf;
  var nativeWrapperCache = new Map(); // Super minimal version of Babel's wrapNativeSuper. We only use this for
  // extending Function, for ComputedDecoratorImpl and AliasDecoratorImpl. We know
  // we will never directly create an instance of these classes so no need to
  // include `construct` code or other helpers.

  function wrapNativeSuper(Class) {
    if (nativeWrapperCache.has(Class)) {
      return nativeWrapperCache.get(Class);
    }

    function Wrapper() {}

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    nativeWrapperCache.set(Class, Wrapper);
    return setPrototypeOf(Wrapper, Class);
  }

  function classCallCheck(instance, Constructor) {
    if (false
    /* DEBUG */
    ) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
      }
    }
  }
  /*
    Overrides default `inheritsLoose` to _also_ call `Object.setPrototypeOf`.
    This is needed so that we can use `loose` option with the
    `@babel/plugin-transform-classes` (because we want simple assignment to the
    prototype whereever possible) but also keep our constructor based prototypal
    inheritance working properly
  */


  function inheritsLoose(subClass, superClass) {
    if (false
    /* DEBUG */
    ) {
      if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function');
      }
    }

    subClass.prototype = Object.create(superClass === null ? null : superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });

    if (superClass !== null) {
      setPrototypeOf(subClass, superClass);
    }
  }

  function taggedTemplateLiteralLoose(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    strings.raw = raw;
    return strings;
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  /*
    Differs from default implementation by avoiding boolean coercion of
    `protoProps` and `staticProps`.
  */


  function createClass(Constructor, protoProps, staticProps) {
    if (protoProps !== null && protoProps !== undefined) {
      _defineProperties(Constructor.prototype, protoProps);
    }

    if (staticProps !== null && staticProps !== undefined) {
      _defineProperties(Constructor, staticProps);
    }

    return Constructor;
  }

  function assertThisInitialized(self) {
    if (false
    /* DEBUG */
    && self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }
  /*
    Adds `DEBUG` guard to error being thrown, and avoids boolean coercion of `call`.
  */


  function possibleConstructorReturn(self, call) {
    if (typeof call === 'object' && call !== null || typeof call === 'function') {
      return call;
    }

    return assertThisInitialized(self);
  }

  function objectDestructuringEmpty(obj) {
    if (false
    /* DEBUG */
    && (obj === null || obj === undefined)) {
      throw new TypeError('Cannot destructure undefined');
    }
  }
});