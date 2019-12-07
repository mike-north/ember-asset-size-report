define("@ember/-internals/runtime/lib/system/core_object", ["exports", "ember-babel", "@ember/-internals/container", "@ember/-internals/owner", "@ember/polyfills", "@ember/-internals/utils", "@ember/runloop", "@ember/-internals/meta", "@ember/-internals/metal", "@ember/-internals/runtime/lib/mixins/action_handler", "@ember/debug"], function (_exports, _emberBabel, _container, _owner, _polyfills, _utils, _runloop, _meta2, _metal, _action_handler, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setFrameworkClass = setFrameworkClass;
  _exports.default = void 0;

  /**
    @module @ember/object
  */
  var _reopen = _metal.Mixin.prototype.reopen;
  var wasApplied = new _polyfills._WeakSet();
  var factoryMap = new WeakMap();
  var prototypeMixinMap = new WeakMap();
  var initCalled = false
  /* DEBUG */
  ? new _polyfills._WeakSet() : undefined; // only used in debug builds to enable the proxy trap

  var PASSED_FROM_CREATE = false
  /* DEBUG */
  ? (0, _utils.symbol)('PASSED_FROM_CREATE') : undefined;
  var FRAMEWORK_CLASSES = (0, _utils.symbol)('FRAMEWORK_CLASS');

  function setFrameworkClass(klass) {
    klass[FRAMEWORK_CLASSES] = true;
  }

  function initialize(obj, properties) {
    var m = (0, _meta2.meta)(obj);

    if (properties !== undefined) {
      (false && !(typeof properties === 'object' && properties !== null) && (0, _debug.assert)('EmberObject.create only accepts objects.', typeof properties === 'object' && properties !== null));
      (false && !(!(properties instanceof _metal.Mixin)) && (0, _debug.assert)('EmberObject.create no longer supports mixing in other ' + 'definitions, use .extend & .create separately instead.', !(properties instanceof _metal.Mixin)));
      var concatenatedProperties = obj.concatenatedProperties;
      var mergedProperties = obj.mergedProperties;
      var hasConcatenatedProps = concatenatedProperties !== undefined && concatenatedProperties.length > 0;
      var hasMergedProps = mergedProperties !== undefined && mergedProperties.length > 0;
      var keyNames = Object.keys(properties);

      for (var i = 0; i < keyNames.length; i++) {
        var keyName = keyNames[i];
        var value = properties[keyName];
        (false && !(!(0, _metal.isClassicDecorator)(value)) && (0, _debug.assert)('EmberObject.create no longer supports defining computed ' + 'properties. Define computed properties using extend() or reopen() ' + 'before calling create().', !(0, _metal.isClassicDecorator)(value)));
        (false && !(!(typeof value === 'function' && value.toString().indexOf('._super') !== -1)) && (0, _debug.assert)('EmberObject.create no longer supports defining methods that call _super.', !(typeof value === 'function' && value.toString().indexOf('._super') !== -1)));
        (false && !(!(keyName === 'actions' && _action_handler.default.detect(obj))) && (0, _debug.assert)('`actions` must be provided at extend time, not at create time, ' + 'when Ember.ActionHandler is used (i.e. views, controllers & routes).', !(keyName === 'actions' && _action_handler.default.detect(obj))));
        var possibleDesc = (0, _metal.descriptorForProperty)(obj, keyName, m);
        var isDescriptor = possibleDesc !== undefined;

        if (!isDescriptor) {
          var baseValue = obj[keyName];

          if (hasConcatenatedProps && concatenatedProperties.indexOf(keyName) > -1) {
            if (baseValue) {
              value = (0, _utils.makeArray)(baseValue).concat(value);
            } else {
              value = (0, _utils.makeArray)(value);
            }
          }

          if (hasMergedProps && mergedProperties.indexOf(keyName) > -1) {
            value = (0, _polyfills.assign)({}, baseValue, value);
          }
        }

        if (isDescriptor) {
          possibleDesc.set(obj, keyName, value);
        } else if (typeof obj.setUnknownProperty === 'function' && !(keyName in obj)) {
          obj.setUnknownProperty(keyName, value);
        } else {
          if (false
          /* DEBUG */
          ) {
            (0, _metal.defineProperty)(obj, keyName, null, value, m); // setup mandatory setter
          } else {
            obj[keyName] = value;
          }
        }
      }
    } // using DEBUG here to avoid the extraneous variable when not needed


    if (false
    /* DEBUG */
    ) {
      initCalled.add(obj);
    }

    obj.init(properties);
    m.unsetInitializing();

    if (true
    /* EMBER_METAL_TRACKED_PROPERTIES */
    ) {
        var observerEvents = m.observerEvents();

        if (observerEvents !== undefined) {
          for (var _i = 0; _i < observerEvents.length; _i++) {
            (0, _metal.activateObserver)(obj, observerEvents[_i].event, observerEvents[_i].sync);
          }
        }
      } else {
      // re-enable chains
      (0, _metal.finishChains)(m);
    }

    (0, _metal.sendEvent)(obj, 'init', undefined, undefined, undefined, m);
  }
  /**
    `CoreObject` is the base class for all Ember constructs. It establishes a
    class system based on Ember's Mixin system, and provides the basis for the
    Ember Object Model. `CoreObject` should generally not be used directly,
    instead you should use `EmberObject`.
  
    ## Usage
  
    You can define a class by extending from `CoreObject` using the `extend`
    method:
  
    ```js
    const Person = CoreObject.extend({
      name: 'Tomster',
    });
    ```
  
    For detailed usage, see the [Object Model](https://guides.emberjs.com/release/object-model/)
    section of the guides.
  
    ## Usage with Native Classes
  
    Native JavaScript `class` syntax can be used to extend from any `CoreObject`
    based class:
  
    ```js
    class Person extends CoreObject {
      init() {
        super.init(...arguments);
        this.name = 'Tomster';
      }
    }
    ```
  
    Some notes about `class` usage:
  
    * `new` syntax is not currently supported with classes that extend from
      `EmberObject` or `CoreObject`. You must continue to use the `create` method
      when making new instances of classes, even if they are defined using native
      class syntax. If you want to use `new` syntax, consider creating classes
      which do _not_ extend from `EmberObject` or `CoreObject`. Ember features,
      such as computed properties and decorators, will still work with base-less
      classes.
    * Instead of using `this._super()`, you must use standard `super` syntax in
      native classes. See the [MDN docs on classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Super_class_calls_with_super)
      for more details.
    * Native classes support using [constructors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Constructor)
      to set up newly-created instances. Ember uses these to, among other things,
      support features that need to retrieve other entities by name, like Service
      injection and `getOwner`. To ensure your custom instance setup logic takes
      place after this important work is done, avoid using the `constructor` in
      favor of `init`.
    * Properties passed to `create` will be available on the instance by the time
      `init` runs, so any code that requires these values should work at that
      time.
    * Using native classes, and switching back to the old Ember Object model is
      fully supported.
  
    @class CoreObject
    @public
  */


  var CoreObject =
  /*#__PURE__*/
  function () {
    CoreObject._initFactory = function _initFactory(factory) {
      factoryMap.set(this, factory);
    };

    function CoreObject(passedFromCreate) {
      // pluck off factory
      var initFactory = factoryMap.get(this.constructor);

      if (initFactory !== undefined) {
        factoryMap.delete(this.constructor);

        _container.FACTORY_FOR.set(this, initFactory);
      } // prepare prototype...


      this.constructor.proto();
      var self = this;

      if (false
      /* DEBUG */
      && _utils.HAS_NATIVE_PROXY && typeof self.unknownProperty === 'function') {
        var messageFor = function messageFor(obj, property) {
          return "You attempted to access the `" + String(property) + "` property (of " + obj + ").\n" + "Since Ember 3.1, this is usually fine as you no longer need to use `.get()`\n" + "to access computed properties. However, in this case, the object in question\n" + "is a special kind of Ember object (a proxy). Therefore, it is still necessary\n" + ("to use `.get('" + String(property) + "')` in this case.\n\n") + "If you encountered this error because of third-party code that you don't control,\n" + "there is more information at https://github.com/emberjs/ember.js/issues/16148, and\n" + "you can help us improve this error message by telling us more about what happened in\n" + "this situation.";
        };
        /* globals Proxy Reflect */


        self = new Proxy(this, {
          get: function get(target, property, receiver) {
            if (property === _metal.PROXY_CONTENT) {
              return target;
            } else if ( // init called will be set on the proxy, not the target, so get with the receiver
            !initCalled.has(receiver) || typeof property === 'symbol' || (0, _utils.isInternalSymbol)(property) || property === 'toJSON' || property === 'toString' || property === 'toStringExtension' || property === 'didDefineProperty' || property === 'willWatchProperty' || property === 'didUnwatchProperty' || property === 'didAddListener' || property === 'didRemoveListener' || property === 'isDescriptor' || property === '_onLookup' || property in target) {
              return Reflect.get(target, property, receiver);
            }

            var value = target.unknownProperty.call(receiver, property);

            if (typeof value !== 'function') {
              (false && !(value === undefined || value === null) && (0, _debug.assert)(messageFor(receiver, property), value === undefined || value === null));
            }
          }
        });

        _container.FACTORY_FOR.set(self, initFactory);
      } // disable chains


      var m = (0, _meta2.meta)(self);
      m.setInitializing();
      (false && !(function () {
        if (passedFromCreate === PASSED_FROM_CREATE) {
          return true;
        }

        if (initFactory === undefined) {
          return false;
        }

        if (passedFromCreate === initFactory.owner) {
          return true;
        }

        return false;
      }()) && (0, _debug.assert)("An EmberObject based class, " + this.constructor + ", was not instantiated correctly. You may have either used `new` instead of `.create()`, or not passed arguments to your call to super in the constructor: `super(...arguments)`. If you are trying to use `new`, consider using native classes without extending from EmberObject.", function () {
        if (passedFromCreate === PASSED_FROM_CREATE) {
          return true;
        }

        if (initFactory === undefined) {
          return false;
        }

        if (passedFromCreate === initFactory.owner) {
          return true;
        }

        return false;
      }())); // only return when in debug builds and `self` is the proxy created above

      if (false
      /* DEBUG */
      && self !== this) {
        return self;
      }
    }

    var _proto = CoreObject.prototype;

    _proto.reopen = function reopen() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (0, _metal.applyMixin)(this, args);
      return this;
    }
    /**
      An overridable method called when objects are instantiated. By default,
      does nothing unless it is overridden during class definition.
       Example:
       ```javascript
      import EmberObject from '@ember/object';
       const Person = EmberObject.extend({
        init() {
          alert(`Name is ${this.get('name')}`);
        }
      });
       let steve = Person.create({
        name: 'Steve'
      });
       // alerts 'Name is Steve'.
      ```
       NOTE: If you do override `init` for a framework class like `Ember.View`,
      be sure to call `this._super(...arguments)` in your
      `init` declaration! If you don't, Ember may not have an opportunity to
      do important setup work, and you'll see strange behavior in your
      application.
       @method init
      @public
    */
    ;

    _proto.init = function init() {}
    /**
      Defines the properties that will be concatenated from the superclass
      (instead of overridden).
       By default, when you extend an Ember class a property defined in
      the subclass overrides a property with the same name that is defined
      in the superclass. However, there are some cases where it is preferable
      to build up a property's value by combining the superclass' property
      value with the subclass' value. An example of this in use within Ember
      is the `classNames` property of `Ember.View`.
       Here is some sample code showing the difference between a concatenated
      property and a normal one:
       ```javascript
      import EmberObject from '@ember/object';
       const Bar = EmberObject.extend({
        // Configure which properties to concatenate
        concatenatedProperties: ['concatenatedProperty'],
         someNonConcatenatedProperty: ['bar'],
        concatenatedProperty: ['bar']
      });
       const FooBar = Bar.extend({
        someNonConcatenatedProperty: ['foo'],
        concatenatedProperty: ['foo']
      });
       let fooBar = FooBar.create();
      fooBar.get('someNonConcatenatedProperty'); // ['foo']
      fooBar.get('concatenatedProperty'); // ['bar', 'foo']
      ```
       This behavior extends to object creation as well. Continuing the
      above example:
       ```javascript
      let fooBar = FooBar.create({
        someNonConcatenatedProperty: ['baz'],
        concatenatedProperty: ['baz']
      })
      fooBar.get('someNonConcatenatedProperty'); // ['baz']
      fooBar.get('concatenatedProperty'); // ['bar', 'foo', 'baz']
      ```
       Adding a single property that is not an array will just add it in the array:
       ```javascript
      let fooBar = FooBar.create({
        concatenatedProperty: 'baz'
      })
      view.get('concatenatedProperty'); // ['bar', 'foo', 'baz']
      ```
       Using the `concatenatedProperties` property, we can tell Ember to mix the
      content of the properties.
       In `Component` the `classNames`, `classNameBindings` and
      `attributeBindings` properties are concatenated.
       This feature is available for you to use throughout the Ember object model,
      although typical app developers are likely to use it infrequently. Since
      it changes expectations about behavior of properties, you should properly
      document its usage in each individual concatenated property (to not
      mislead your users to think they can override the property in a subclass).
       @property concatenatedProperties
      @type Array
      @default null
      @public
    */

    /**
      Defines the properties that will be merged from the superclass
      (instead of overridden).
       By default, when you extend an Ember class a property defined in
      the subclass overrides a property with the same name that is defined
      in the superclass. However, there are some cases where it is preferable
      to build up a property's value by merging the superclass property value
      with the subclass property's value. An example of this in use within Ember
      is the `queryParams` property of routes.
       Here is some sample code showing the difference between a merged
      property and a normal one:
       ```javascript
      import EmberObject from '@ember/object';
       const Bar = EmberObject.extend({
        // Configure which properties are to be merged
        mergedProperties: ['mergedProperty'],
         someNonMergedProperty: {
          nonMerged: 'superclass value of nonMerged'
        },
        mergedProperty: {
          page: { replace: false },
          limit: { replace: true }
        }
      });
       const FooBar = Bar.extend({
        someNonMergedProperty: {
          completelyNonMerged: 'subclass value of nonMerged'
        },
        mergedProperty: {
          limit: { replace: false }
        }
      });
       let fooBar = FooBar.create();
       fooBar.get('someNonMergedProperty');
      // => { completelyNonMerged: 'subclass value of nonMerged' }
      //
      // Note the entire object, including the nonMerged property of
      // the superclass object, has been replaced
       fooBar.get('mergedProperty');
      // => {
      //   page: {replace: false},
      //   limit: {replace: false}
      // }
      //
      // Note the page remains from the superclass, and the
      // `limit` property's value of `false` has been merged from
      // the subclass.
      ```
       This behavior is not available during object `create` calls. It is only
      available at `extend` time.
       In `Route` the `queryParams` property is merged.
       This feature is available for you to use throughout the Ember object model,
      although typical app developers are likely to use it infrequently. Since
      it changes expectations about behavior of properties, you should properly
      document its usage in each individual merged property (to not
      mislead your users to think they can override the property in a subclass).
       @property mergedProperties
      @type Array
      @default null
      @public
    */

    /**
      Destroyed object property flag.
       if this property is `true` the observers and bindings were already
      removed by the effect of calling the `destroy()` method.
       @property isDestroyed
      @default false
      @public
    */
    ;

    /**
      Destroys an object by setting the `isDestroyed` flag and removing its
      metadata, which effectively destroys observers and bindings.
       If you try to set a property on a destroyed object, an exception will be
      raised.
       Note that destruction is scheduled for the end of the run loop and does not
      happen immediately.  It will set an isDestroying flag immediately.
       @method destroy
      @return {EmberObject} receiver
      @public
    */
    _proto.destroy = function destroy() {
      var m = (0, _meta2.peekMeta)(this);

      if (m.isSourceDestroying()) {
        return;
      }

      m.setSourceDestroying();
      (0, _runloop.schedule)('actions', this, this.willDestroy);
      (0, _runloop.schedule)('destroy', this, this._scheduledDestroy, m);
      return this;
    }
    /**
      Override to implement teardown.
       @method willDestroy
      @public
    */
    ;

    _proto.willDestroy = function willDestroy() {}
    /**
      Invoked by the run loop to actually destroy the object. This is
      scheduled for execution by the `destroy` method.
       @private
      @method _scheduledDestroy
    */
    ;

    _proto._scheduledDestroy = function _scheduledDestroy(m) {
      if (m.isSourceDestroyed()) {
        return;
      }

      (0, _meta2.deleteMeta)(this);
      m.setSourceDestroyed();
    }
    /**
      Returns a string representation which attempts to provide more information
      than Javascript's `toString` typically does, in a generic way for all Ember
      objects.
       ```javascript
      import EmberObject from '@ember/object';
       const Person = EmberObject.extend();
      person = Person.create();
      person.toString(); //=> "<Person:ember1024>"
      ```
       If the object's class is not defined on an Ember namespace, it will
      indicate it is a subclass of the registered superclass:
       ```javascript
      const Student = Person.extend();
      let student = Student.create();
      student.toString(); //=> "<(subclass of Person):ember1025>"
      ```
       If the method `toStringExtension` is defined, its return value will be
      included in the output.
       ```javascript
      const Teacher = Person.extend({
        toStringExtension() {
          return this.get('fullName');
        }
      });
      teacher = Teacher.create();
      teacher.toString(); //=> "<Teacher:ember1026:Tom Dale>"
      ```
       @method toString
      @return {String} string representation
      @public
    */
    ;

    _proto.toString = function toString() {
      var hasToStringExtension = typeof this.toStringExtension === 'function';
      var extension = hasToStringExtension ? ":" + this.toStringExtension() : '';
      var ret = "<" + ((0, _utils.getName)(this) || _container.FACTORY_FOR.get(this) || this.constructor.toString()) + ":" + (0, _utils.guidFor)(this) + extension + ">";
      return ret;
    }
    /**
      Creates a new subclass.
       ```javascript
      import EmberObject from '@ember/object';
       const Person = EmberObject.extend({
        say(thing) {
          alert(thing);
         }
      });
      ```
       This defines a new subclass of EmberObject: `Person`. It contains one method: `say()`.
       You can also create a subclass from any existing class by calling its `extend()` method.
      For example, you might want to create a subclass of Ember's built-in `Component` class:
       ```javascript
      import Component from '@ember/component';
       const PersonComponent = Component.extend({
        tagName: 'li',
        classNameBindings: ['isAdministrator']
      });
      ```
       When defining a subclass, you can override methods but still access the
      implementation of your parent class by calling the special `_super()` method:
       ```javascript
      import EmberObject from '@ember/object';
       const Person = EmberObject.extend({
        say(thing) {
          let name = this.get('name');
          alert(`${name} says: ${thing}`);
        }
      });
       const Soldier = Person.extend({
        say(thing) {
          this._super(`${thing}, sir!`);
        },
        march(numberOfHours) {
          alert(`${this.get('name')} marches for ${numberOfHours} hours.`);
        }
      });
       let yehuda = Soldier.create({
        name: 'Yehuda Katz'
      });
       yehuda.say('Yes');  // alerts "Yehuda Katz says: Yes, sir!"
      ```
       The `create()` on line #17 creates an *instance* of the `Soldier` class.
      The `extend()` on line #8 creates a *subclass* of `Person`. Any instance
      of the `Person` class will *not* have the `march()` method.
       You can also pass `Mixin` classes to add additional properties to the subclass.
       ```javascript
      import EmberObject from '@ember/object';
      import Mixin from '@ember/object/mixin';
       const Person = EmberObject.extend({
        say(thing) {
          alert(`${this.get('name')} says: ${thing}`);
        }
      });
       const SingingMixin = Mixin.create({
        sing(thing) {
          alert(`${this.get('name')} sings: la la la ${thing}`);
        }
      });
       const BroadwayStar = Person.extend(SingingMixin, {
        dance() {
          alert(`${this.get('name')} dances: tap tap tap tap `);
        }
      });
      ```
       The `BroadwayStar` class contains three methods: `say()`, `sing()`, and `dance()`.
       @method extend
      @static
      @for @ember/object
      @param {Mixin} [mixins]* One or more Mixin classes
      @param {Object} [arguments]* Object containing values to use within the new class
      @public
    */
    ;

    CoreObject.extend = function extend() {
      var Class =
      /*#__PURE__*/
      function (_this) {
        (0, _emberBabel.inheritsLoose)(Class, _this);

        function Class() {
          return _this.apply(this, arguments) || this;
        }

        return Class;
      }(this);

      _reopen.apply(Class.PrototypeMixin, arguments);

      return Class;
    }
    /**
      Creates an instance of a class. Accepts either no arguments, or an object
      containing values to initialize the newly instantiated object with.
       ```javascript
      import EmberObject from '@ember/object';
       const Person = EmberObject.extend({
        helloWorld() {
          alert(`Hi, my name is ${this.get('name')}`);
        }
      });
       let tom = Person.create({
        name: 'Tom Dale'
      });
       tom.helloWorld(); // alerts "Hi, my name is Tom Dale".
      ```
       `create` will call the `init` function if defined during
      `AnyObject.extend`
       If no arguments are passed to `create`, it will not set values to the new
      instance during initialization:
       ```javascript
      let noName = Person.create();
      noName.helloWorld(); // alerts undefined
      ```
       NOTE: For performance reasons, you cannot declare methods or computed
      properties during `create`. You should instead declare methods and computed
      properties when using `extend`.
       @method create
      @for @ember/object
      @static
      @param [arguments]*
      @public
    */
    ;

    CoreObject.create = function create(props, extra) {
      var C = this;
      var instance;

      if (this[FRAMEWORK_CLASSES]) {
        var initFactory = factoryMap.get(this);
        var owner;

        if (initFactory !== undefined) {
          owner = initFactory.owner;
        } else if (props !== undefined) {
          owner = (0, _owner.getOwner)(props);
        }

        if (owner === undefined) {
          // fallback to passing the special PASSED_FROM_CREATE symbol
          // to avoid an error when folks call things like Controller.extend().create()
          // we should do a subsequent deprecation pass to ensure this isn't allowed
          owner = PASSED_FROM_CREATE;
        }

        instance = new C(owner);
      } else {
        instance = false
        /* DEBUG */
        ? new C(PASSED_FROM_CREATE) : new C();
      }

      if (extra === undefined) {
        initialize(instance, props);
      } else {
        initialize(instance, flattenProps.apply(this, arguments));
      }

      return instance;
    }
    /**
      Augments a constructor's prototype with additional
      properties and functions:
       ```javascript
      import EmberObject from '@ember/object';
       const MyObject = EmberObject.extend({
        name: 'an object'
      });
       o = MyObject.create();
      o.get('name'); // 'an object'
       MyObject.reopen({
        say(msg) {
          console.log(msg);
        }
      });
       o2 = MyObject.create();
      o2.say('hello'); // logs "hello"
       o.say('goodbye'); // logs "goodbye"
      ```
       To add functions and properties to the constructor itself,
      see `reopenClass`
       @method reopen
      @for @ember/object
      @static
      @public
    */
    ;

    CoreObject.reopen = function reopen() {
      this.willReopen();

      _reopen.apply(this.PrototypeMixin, arguments);

      return this;
    };

    CoreObject.willReopen = function willReopen() {
      var p = this.prototype;

      if (wasApplied.has(p)) {
        wasApplied.delete(p); // If the base mixin already exists and was applied, create a new mixin to
        // make sure that it gets properly applied. Reusing the same mixin after
        // the first `proto` call will cause it to get skipped.

        if (prototypeMixinMap.has(this)) {
          prototypeMixinMap.set(this, _metal.Mixin.create(this.PrototypeMixin));
        }
      }
    }
    /**
      Augments a constructor's own properties and functions:
       ```javascript
      import EmberObject from '@ember/object';
       const MyObject = EmberObject.extend({
        name: 'an object'
      });
       MyObject.reopenClass({
        canBuild: false
      });
       MyObject.canBuild; // false
      o = MyObject.create();
      ```
       In other words, this creates static properties and functions for the class.
      These are only available on the class and not on any instance of that class.
       ```javascript
      import EmberObject from '@ember/object';
       const Person = EmberObject.extend({
        name: '',
        sayHello() {
          alert(`Hello. My name is ${this.get('name')}`);
        }
      });
       Person.reopenClass({
        species: 'Homo sapiens',
         createPerson(name) {
          return Person.create({ name });
        }
      });
       let tom = Person.create({
        name: 'Tom Dale'
      });
      let yehuda = Person.createPerson('Yehuda Katz');
       tom.sayHello(); // "Hello. My name is Tom Dale"
      yehuda.sayHello(); // "Hello. My name is Yehuda Katz"
      alert(Person.species); // "Homo sapiens"
      ```
       Note that `species` and `createPerson` are *not* valid on the `tom` and `yehuda`
      variables. They are only valid on `Person`.
       To add functions and properties to instances of
      a constructor by extending the constructor's prototype
      see `reopen`
       @method reopenClass
      @for @ember/object
      @static
      @public
    */
    ;

    CoreObject.reopenClass = function reopenClass() {
      (0, _metal.applyMixin)(this, arguments);
      return this;
    };

    CoreObject.detect = function detect(obj) {
      if ('function' !== typeof obj) {
        return false;
      }

      while (obj) {
        if (obj === this) {
          return true;
        }

        obj = obj.superclass;
      }

      return false;
    };

    CoreObject.detectInstance = function detectInstance(obj) {
      return obj instanceof this;
    }
    /**
      In some cases, you may want to annotate computed properties with additional
      metadata about how they function or what values they operate on. For
      example, computed property functions may close over variables that are then
      no longer available for introspection.
       You can pass a hash of these values to a computed property like this:
       ```javascript
      import { computed } from '@ember/object';
       person: computed(function() {
        let personId = this.get('personId');
        return Person.create({ id: personId });
      }).meta({ type: Person })
      ```
       Once you've done this, you can retrieve the values saved to the computed
      property from your class like this:
       ```javascript
      MyClass.metaForProperty('person');
      ```
       This will return the original hash that was passed to `meta()`.
       @static
      @method metaForProperty
      @param key {String} property name
      @private
    */
    ;

    CoreObject.metaForProperty = function metaForProperty(key) {
      var proto = this.proto(); // ensure prototype is initialized

      var possibleDesc = (0, _metal.descriptorForProperty)(proto, key);
      (false && !(possibleDesc !== undefined) && (0, _debug.assert)("metaForProperty() could not find a computed property with key '" + key + "'.", possibleDesc !== undefined));
      return possibleDesc._meta || {};
    }
    /**
      Iterate over each computed property for the class, passing its name
      and any associated metadata (see `metaForProperty`) to the callback.
       @static
      @method eachComputedProperty
      @param {Function} callback
      @param {Object} binding
      @private
    */
    ;

    CoreObject.eachComputedProperty = function eachComputedProperty(callback, binding) {
      if (binding === void 0) {
        binding = this;
      }

      this.proto(); // ensure prototype is initialized

      var empty = {};
      (0, _meta2.meta)(this.prototype).forEachDescriptors(function (name, descriptor) {
        if (descriptor.enumerable) {
          var _meta = descriptor._meta || empty;

          callback.call(binding, name, _meta);
        }
      });
    };

    CoreObject.proto = function proto() {
      var p = this.prototype;

      if (!wasApplied.has(p)) {
        wasApplied.add(p);
        var parent = this.superclass;

        if (parent) {
          parent.proto();
        } // If the prototype mixin exists, apply it. In the case of native classes,
        // it will not exist (unless the class has been reopened).


        if (prototypeMixinMap.has(this)) {
          this.PrototypeMixin.apply(p);
        }
      }

      return p;
    };

    (0, _emberBabel.createClass)(CoreObject, [{
      key: "isDestroyed",
      get: function get() {
        return (0, _meta2.peekMeta)(this).isSourceDestroyed();
      },
      set: function set(value) {
        (false && !(false) && (0, _debug.assert)("You cannot set `" + this + ".isDestroyed` directly, please use `.destroy()`.", false));
      }
      /**
        Destruction scheduled flag. The `destroy()` method has been called.
         The object stays intact until the end of the run loop at which point
        the `isDestroyed` flag is set.
         @property isDestroying
        @default false
        @public
      */

    }, {
      key: "isDestroying",
      get: function get() {
        return (0, _meta2.peekMeta)(this).isSourceDestroying();
      },
      set: function set(value) {
        (false && !(false) && (0, _debug.assert)("You cannot set `" + this + ".isDestroying` directly, please use `.destroy()`.", false));
      }
    }], [{
      key: "PrototypeMixin",
      get: function get() {
        var prototypeMixin = prototypeMixinMap.get(this);

        if (prototypeMixin === undefined) {
          prototypeMixin = _metal.Mixin.create();
          prototypeMixin.ownerConstructor = this;
          prototypeMixinMap.set(this, prototypeMixin);
        }

        return prototypeMixin;
      }
    }, {
      key: "superclass",
      get: function get() {
        var c = Object.getPrototypeOf(this);
        return c !== Function.prototype ? c : undefined;
      }
    }]);
    return CoreObject;
  }();

  CoreObject.toString = _metal.classToString;
  (0, _utils.setName)(CoreObject, 'Ember.CoreObject');
  CoreObject.isClass = true;
  CoreObject.isMethod = false;

  function flattenProps() {
    var concatenatedProperties = this.concatenatedProperties,
        mergedProperties = this.mergedProperties;
    var hasConcatenatedProps = concatenatedProperties !== undefined && concatenatedProperties.length > 0;
    var hasMergedProps = mergedProperties !== undefined && mergedProperties.length > 0;
    var initProperties = {};

    for (var i = 0; i < arguments.length; i++) {
      var properties = i < 0 || arguments.length <= i ? undefined : arguments[i];
      (false && !(!(properties instanceof _metal.Mixin)) && (0, _debug.assert)('EmberObject.create no longer supports mixing in other ' + 'definitions, use .extend & .create separately instead.', !(properties instanceof _metal.Mixin)));
      var keyNames = Object.keys(properties);

      for (var j = 0, k = keyNames.length; j < k; j++) {
        var keyName = keyNames[j];
        var value = properties[keyName];

        if (hasConcatenatedProps && concatenatedProperties.indexOf(keyName) > -1) {
          var baseValue = initProperties[keyName];

          if (baseValue) {
            value = (0, _utils.makeArray)(baseValue).concat(value);
          } else {
            value = (0, _utils.makeArray)(value);
          }
        }

        if (hasMergedProps && mergedProperties.indexOf(keyName) > -1) {
          var _baseValue = initProperties[keyName];
          value = (0, _polyfills.assign)({}, _baseValue, value);
        }

        initProperties[keyName] = value;
      }
    }

    return initProperties;
  }

  if (false
  /* DEBUG */
  ) {
    /**
      Provides lookup-time type validation for injected properties.
       @private
      @method _onLookup
    */
    CoreObject._onLookup = function injectedPropertyAssertion(debugContainerKey) {
      var _debugContainerKey$sp = debugContainerKey.split(':'),
          type = _debugContainerKey$sp[0];

      var proto = this.proto();

      for (var key in proto) {
        var desc = (0, _metal.descriptorForProperty)(proto, key);

        if (desc && _metal.DEBUG_INJECTION_FUNCTIONS.has(desc._getter)) {
          (false && !(type === 'controller' || _metal.DEBUG_INJECTION_FUNCTIONS.get(desc._getter).type !== 'controller') && (0, _debug.assert)("Defining `" + key + "` as an injected controller property on a non-controller (`" + debugContainerKey + "`) is not allowed.", type === 'controller' || _metal.DEBUG_INJECTION_FUNCTIONS.get(desc._getter).type !== 'controller'));
        }
      }
    };
    /**
      Returns a hash of property names and container names that injected
      properties will lookup on the container lazily.
       @method _lazyInjections
      @return {Object} Hash of all lazy injected property keys to container names
      @private
    */


    CoreObject._lazyInjections = function () {
      var injections = {};
      var proto = this.proto();
      var key;
      var desc;

      for (key in proto) {
        desc = (0, _metal.descriptorForProperty)(proto, key);

        if (desc && _metal.DEBUG_INJECTION_FUNCTIONS.has(desc._getter)) {
          var _DEBUG_INJECTION_FUNC = _metal.DEBUG_INJECTION_FUNCTIONS.get(desc._getter),
              namespace = _DEBUG_INJECTION_FUNC.namespace,
              source = _DEBUG_INJECTION_FUNC.source,
              type = _DEBUG_INJECTION_FUNC.type,
              name = _DEBUG_INJECTION_FUNC.name;

          injections[key] = {
            namespace: namespace,
            source: source,
            specifier: type + ":" + (name || key)
          };
        }
      }

      return injections;
    };
  }

  var _default = CoreObject;
  _exports.default = _default;
});