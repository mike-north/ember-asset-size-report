define("@ember/application/globals-resolver", ["exports", "ember-babel", "@ember/-internals/utils", "@ember/-internals/metal", "@ember/debug", "@ember/string", "@ember/-internals/runtime", "@ember/application/lib/validate-type", "@ember/-internals/glimmer"], function (_exports, _emberBabel, _utils, _metal, _debug, _string, _runtime, _validateType, _glimmer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
  @module @ember/application
  */

  /**
    The DefaultResolver defines the default lookup rules to resolve
    container lookups before consulting the container for registered
    items:
  
    * templates are looked up on `Ember.TEMPLATES`
    * other names are looked up on the application after converting
      the name. For example, `controller:post` looks up
      `App.PostController` by default.
    * there are some nuances (see examples below)
  
    ### How Resolving Works
  
    The container calls this object's `resolve` method with the
    `fullName` argument.
  
    It first parses the fullName into an object using `parseName`.
  
    Then it checks for the presence of a type-specific instance
    method of the form `resolve[Type]` and calls it if it exists.
    For example if it was resolving 'template:post', it would call
    the `resolveTemplate` method.
  
    Its last resort is to call the `resolveOther` method.
  
    The methods of this object are designed to be easy to override
    in a subclass. For example, you could enhance how a template
    is resolved like so:
  
    ```app/app.js
    import Application from '@ember/application';
    import GlobalsResolver from '@ember/application/globals-resolver';
  
    App = Application.create({
      Resolver: GlobalsResolver.extend({
        resolveTemplate(parsedName) {
          let resolvedTemplate = this._super(parsedName);
          if (resolvedTemplate) { return resolvedTemplate; }
  
          return Ember.TEMPLATES['not_found'];
        }
      })
    });
    ```
  
    Some examples of how names are resolved:
  
    ```text
    'template:post'           //=> Ember.TEMPLATES['post']
    'template:posts/byline'   //=> Ember.TEMPLATES['posts/byline']
    'template:posts.byline'   //=> Ember.TEMPLATES['posts/byline']
    'template:blogPost'       //=> Ember.TEMPLATES['blog-post']
    'controller:post'         //=> App.PostController
    'controller:posts.index'  //=> App.PostsIndexController
    'controller:blog/post'    //=> Blog.PostController
    'controller:basic'        //=> Controller
    'route:post'              //=> App.PostRoute
    'route:posts.index'       //=> App.PostsIndexRoute
    'route:blog/post'         //=> Blog.PostRoute
    'route:basic'             //=> Route
    'foo:post'                //=> App.PostFoo
    'model:post'              //=> App.Post
    ```
  
    @class GlobalsResolver
    @extends EmberObject
    @public
  */
  var DefaultResolver =
  /*#__PURE__*/
  function (_EmberObject) {
    (0, _emberBabel.inheritsLoose)(DefaultResolver, _EmberObject);

    function DefaultResolver() {
      return _EmberObject.apply(this, arguments) || this;
    }

    DefaultResolver.create = function create(props) {
      // DO NOT REMOVE even though this doesn't do anything
      // This is required for a FireFox 60+ JIT bug with our tests.
      // without it, create(props) in our tests would lose props on a deopt.
      return _EmberObject.create.call(this, props);
    }
    /**
      This will be set to the Application instance when it is
      created.
       @property namespace
      @public
    */
    ;

    var _proto = DefaultResolver.prototype;

    _proto.init = function init() {
      this._parseNameCache = (0, _utils.dictionary)(null);
    };

    _proto.normalize = function normalize(fullName) {
      var _fullName$split = fullName.split(':'),
          type = _fullName$split[0],
          name = _fullName$split[1];

      (false && !(fullName.split(':').length === 2) && (0, _debug.assert)('Tried to normalize a container name without a colon (:) in it. ' + 'You probably tried to lookup a name that did not contain a type, ' + 'a colon, and a name. A proper lookup name would be `view:post`.', fullName.split(':').length === 2));

      if (type !== 'template') {
        var result = name.replace(/(\.|_|-)./g, function (m) {
          return m.charAt(1).toUpperCase();
        });
        return type + ":" + result;
      } else {
        return fullName;
      }
    }
    /**
      This method is called via the container's resolver method.
      It parses the provided `fullName` and then looks up and
      returns the appropriate template or class.
       @method resolve
      @param {String} fullName the lookup string
      @return {Object} the resolved factory
      @public
    */
    ;

    _proto.resolve = function resolve(fullName) {
      var parsedName = this.parseName(fullName);
      var resolveMethodName = parsedName.resolveMethodName;
      var resolved;

      if (this[resolveMethodName]) {
        resolved = this[resolveMethodName](parsedName);
      }

      resolved = resolved || this.resolveOther(parsedName);

      if (false
      /* DEBUG */
      ) {
        if (parsedName.root && parsedName.root.LOG_RESOLVER) {
          this._logLookup(resolved, parsedName);
        }
      }

      if (resolved) {
        (0, _validateType.default)(resolved, parsedName);
      }

      return resolved;
    }
    /**
      Convert the string name of the form 'type:name' to
      a Javascript object with the parsed aspects of the name
      broken out.
       @param {String} fullName the lookup string
      @method parseName
      @protected
    */
    ;

    _proto.parseName = function parseName(fullName) {
      return this._parseNameCache[fullName] || (this._parseNameCache[fullName] = this._parseName(fullName));
    };

    _proto._parseName = function _parseName(fullName) {
      var _fullName$split2 = fullName.split(':'),
          type = _fullName$split2[0],
          fullNameWithoutType = _fullName$split2[1];

      var name = fullNameWithoutType;
      var namespace = (0, _metal.get)(this, 'namespace');
      var root = namespace;
      var lastSlashIndex = name.lastIndexOf('/');
      var dirname = lastSlashIndex !== -1 ? name.slice(0, lastSlashIndex) : null;

      if (type !== 'template' && lastSlashIndex !== -1) {
        var parts = name.split('/');
        name = parts[parts.length - 1];
        var namespaceName = (0, _string.capitalize)(parts.slice(0, -1).join('.'));
        root = (0, _metal.findNamespace)(namespaceName);
        (false && !(root) && (0, _debug.assert)("You are looking for a " + name + " " + type + " in the " + namespaceName + " namespace, but the namespace could not be found", root));
      }

      var resolveMethodName = fullNameWithoutType === 'main' ? 'Main' : (0, _string.classify)(type);

      if (!(name && type)) {
        throw new TypeError("Invalid fullName: `" + fullName + "`, must be of the form `type:name` ");
      }

      return {
        fullName: fullName,
        type: type,
        fullNameWithoutType: fullNameWithoutType,
        dirname: dirname,
        name: name,
        root: root,
        resolveMethodName: "resolve" + resolveMethodName
      };
    }
    /**
      Returns a human-readable description for a fullName. Used by the
      Application namespace in assertions to describe the
      precise name of the class that Ember is looking for, rather than
      container keys.
       @param {String} fullName the lookup string
      @method lookupDescription
      @protected
    */
    ;

    _proto.lookupDescription = function lookupDescription(fullName) {
      var parsedName = this.parseName(fullName);
      var description;

      if (parsedName.type === 'template') {
        return "template at " + parsedName.fullNameWithoutType.replace(/\./g, '/');
      }

      description = parsedName.root + "." + (0, _string.classify)(parsedName.name).replace(/\./g, '');

      if (parsedName.type !== 'model') {
        description += (0, _string.classify)(parsedName.type);
      }

      return description;
    };

    _proto.makeToString = function makeToString(factory) {
      return factory.toString();
    }
    /**
      Given a parseName object (output from `parseName`), apply
      the conventions expected by `Router`
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method useRouterNaming
      @protected
    */
    ;

    _proto.useRouterNaming = function useRouterNaming(parsedName) {
      if (parsedName.name === 'basic') {
        parsedName.name = '';
      } else {
        parsedName.name = parsedName.name.replace(/\./g, '_');
      }
    }
    /**
      Look up the template in Ember.TEMPLATES
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveTemplate
      @protected
    */
    ;

    _proto.resolveTemplate = function resolveTemplate(parsedName) {
      var templateName = parsedName.fullNameWithoutType.replace(/\./g, '/');
      return (0, _glimmer.getTemplate)(templateName) || (0, _glimmer.getTemplate)((0, _string.decamelize)(templateName));
    }
    /**
      Lookup the view using `resolveOther`
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveView
      @protected
    */
    ;

    _proto.resolveView = function resolveView(parsedName) {
      this.useRouterNaming(parsedName);
      return this.resolveOther(parsedName);
    }
    /**
      Lookup the controller using `resolveOther`
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveController
      @protected
    */
    ;

    _proto.resolveController = function resolveController(parsedName) {
      this.useRouterNaming(parsedName);
      return this.resolveOther(parsedName);
    }
    /**
      Lookup the route using `resolveOther`
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveRoute
      @protected
    */
    ;

    _proto.resolveRoute = function resolveRoute(parsedName) {
      this.useRouterNaming(parsedName);
      return this.resolveOther(parsedName);
    }
    /**
      Lookup the model on the Application namespace
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveModel
      @protected
    */
    ;

    _proto.resolveModel = function resolveModel(parsedName) {
      var className = (0, _string.classify)(parsedName.name);
      var factory = (0, _metal.get)(parsedName.root, className);
      return factory;
    }
    /**
      Look up the specified object (from parsedName) on the appropriate
      namespace (usually on the Application)
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveHelper
      @protected
    */
    ;

    _proto.resolveHelper = function resolveHelper(parsedName) {
      return this.resolveOther(parsedName);
    }
    /**
      Look up the specified object (from parsedName) on the appropriate
      namespace (usually on the Application)
       @param {Object} parsedName a parseName object with the parsed
        fullName lookup string
      @method resolveOther
      @protected
    */
    ;

    _proto.resolveOther = function resolveOther(parsedName) {
      var className = (0, _string.classify)(parsedName.name) + (0, _string.classify)(parsedName.type);
      var factory = (0, _metal.get)(parsedName.root, className);
      return factory;
    };

    _proto.resolveMain = function resolveMain(parsedName) {
      var className = (0, _string.classify)(parsedName.type);
      return (0, _metal.get)(parsedName.root, className);
    }
    /**
      Used to iterate all items of a given type.
       @method knownForType
      @param {String} type the type to search for
      @private
    */
    ;

    _proto.knownForType = function knownForType(type) {
      var namespace = (0, _metal.get)(this, 'namespace');
      var suffix = (0, _string.classify)(type);
      var typeRegexp = new RegExp(suffix + "$");
      var known = (0, _utils.dictionary)(null);
      var knownKeys = Object.keys(namespace);

      for (var index = 0; index < knownKeys.length; index++) {
        var name = knownKeys[index];

        if (typeRegexp.test(name)) {
          var containerName = this.translateToContainerFullname(type, name);
          known[containerName] = true;
        }
      }

      return known;
    }
    /**
      Converts provided name from the backing namespace into a container lookup name.
       Examples:
       * App.FooBarHelper -> helper:foo-bar
      * App.THelper -> helper:t
       @method translateToContainerFullname
      @param {String} type
      @param {String} name
      @private
    */
    ;

    _proto.translateToContainerFullname = function translateToContainerFullname(type, name) {
      var suffix = (0, _string.classify)(type);
      var namePrefix = name.slice(0, suffix.length * -1);
      var dasherizedName = (0, _string.dasherize)(namePrefix);
      return type + ":" + dasherizedName;
    };

    return DefaultResolver;
  }(_runtime.Object);

  var _default = DefaultResolver;
  _exports.default = _default;

  if (false
  /* DEBUG */
  ) {
    /**
        @method _logLookup
        @param {Boolean} found
        @param {Object} parsedName
        @private
      */
    DefaultResolver.prototype._logLookup = function (found, parsedName) {
      var symbol = found ? '[✓]' : '[ ]';
      var padding;

      if (parsedName.fullName.length > 60) {
        padding = '.';
      } else {
        padding = new Array(60 - parsedName.fullName.length).join('.');
      }

      (0, _debug.info)(symbol, parsedName.fullName, padding, this.lookupDescription(parsedName.fullName));
    };
  }
});