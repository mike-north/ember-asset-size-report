define("@ember/-internals/routing/lib/services/router", ["exports", "ember-babel", "@ember/-internals/runtime", "@ember/debug", "@ember/object/computed", "@ember/service", "@ember/-internals/routing/lib/utils"], function (_exports, _emberBabel, _runtime, _debug, _computed, _service, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var freezeRouteInfo;

  if (false
  /* DEBUG */
  ) {
    freezeRouteInfo = function freezeRouteInfo(transition) {
      if (transition.from !== null && !Object.isFrozen(transition.from)) {
        Object.freeze(transition.from);
      }

      if (transition.to !== null && !Object.isFrozen(transition.to)) {
        Object.freeze(transition.to);
      }
    };
  }

  function cleanURL(url, rootURL) {
    if (rootURL === '/') {
      return url;
    }

    return url.substr(rootURL.length, url.length);
  }
  /**
     The Router service is the public API that provides access to the router.
  
     The immediate benefit of the Router service is that you can inject it into components,
     giving them a friendly way to initiate transitions and ask questions about the current
     global router state.
  
     In this example, the Router service is injected into a component to initiate a transition
     to a dedicated route:
  
     ```app/components/example.js
     import Component from '@glimmer/component';
     import { action } from '@ember/object';
     import { inject as service } from '@ember/service';
  
     export default class ExampleComponent extends Component {
       @service router;
  
       @action
       next() {
         this.router.transitionTo('other.route');
       }
     }
     ```
  
     Like any service, it can also be injected into helpers, routes, etc.
  
     @public
     @extends Service
     @class RouterService
   */


  var RouterService =
  /*#__PURE__*/
  function (_Service) {
    (0, _emberBabel.inheritsLoose)(RouterService, _Service);

    function RouterService() {
      return _Service.apply(this, arguments) || this;
    }

    var _proto = RouterService.prototype;

    _proto.init = function init() {
      var _this = this;

      _Service.prototype.init.apply(this, arguments);

      this._router.on('routeWillChange', function (transition) {
        if (false
        /* DEBUG */
        ) {
          freezeRouteInfo(transition);
        }

        _this.trigger('routeWillChange', transition);
      });

      this._router.on('routeDidChange', function (transition) {
        if (false
        /* DEBUG */
        ) {
          freezeRouteInfo(transition);
        }

        _this.trigger('routeDidChange', transition);
      });
    }
    /**
       Transition the application into another route. The route may
       be either a single route or route path:
          See [transitionTo](/ember/release/classes/Route/methods/transitionTo?anchor=transitionTo) for more info.
          Calling `transitionTo` from the Router service will cause default query parameter values to be included in the URL.
       This behavior is different from calling `transitionTo` on a route or `transitionToRoute` on a controller.
       See the [Router Service RFC](https://github.com/emberjs/rfcs/blob/master/text/0095-router-service.md#query-parameter-semantics) for more info.
          In the following example we use the Router service to navigate to a route with a
       specific model from a Component.
          ```javascript
       import Component from '@glimmer/component';
       import { action } from '@ember/object';
       import { inject as service } from '@ember/service';
          export default class extends Component {
         @service router;
            @action
         goToComments(post) {
           this.router.transitionTo('comments', post);
         }
       }
       ```
          @method transitionTo
       @param {String} routeNameOrUrl the name of the route or a URL
       @param {...Object} models the model(s) or identifier(s) to be used while
         transitioning to the route.
       @param {Object} [options] optional hash with a queryParams property
         containing a mapping of query parameters
       @return {Transition} the transition object associated with this
         attempted transition
       @public
     */
    ;

    _proto.transitionTo = function transitionTo() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if ((0, _utils.resemblesURL)(args[0])) {
        return this._router._doURLTransition('transitionTo', args[0]);
      }

      var _extractRouteArgs = (0, _utils.extractRouteArgs)(args),
          routeName = _extractRouteArgs.routeName,
          models = _extractRouteArgs.models,
          queryParams = _extractRouteArgs.queryParams;

      var transition = this._router._doTransition(routeName, models, queryParams, true);

      transition['_keepDefaultQueryParamValues'] = true;
      return transition;
    }
    /**
       Transition into another route while replacing the current URL, if possible.
       The route may be either a single route or route path:
          See [replaceWith](/ember/release/classes/Route/methods/replaceWith?anchor=replaceWith) for more info.
          Calling `replaceWith` from the Router service will cause default query parameter values to be included in the URL.
       This behavior is different from calling `replaceWith` on a route.
       See the [Router Service RFC](https://github.com/emberjs/rfcs/blob/master/text/0095-router-service.md#query-parameter-semantics) for more info.
          Usage example:
          ```app/routes/application.js
       import Route from '@ember/routing/route';
          export default class extends Route {
         beforeModel() {
           if (!authorized()){
             this.replaceWith('unauthorized');
           }
         }
       });
       ```
          @method replaceWith
       @param {String} routeNameOrUrl the name of the route or a URL
       @param {...Object} models the model(s) or identifier(s) to be used while
         transitioning to the route.
       @param {Object} [options] optional hash with a queryParams property
         containing a mapping of query parameters
       @return {Transition} the transition object associated with this
         attempted transition
       @public
     */
    ;

    _proto.replaceWith = function replaceWith()
    /* routeNameOrUrl, ...models, options */
    {
      return this.transitionTo.apply(this, arguments).method('replace');
    }
    /**
      Generate a URL based on the supplied route name and optionally a model. The
      URL is returned as a string that can be used for any purpose.
         In this example, the URL for the `author.books` route for a given author
      is copied to the clipboard.
         ```app/templates/application.hbs
      <CopyLink @author={{hash id="tomster" name="Tomster"}} />
      ```
         ```app/components/copy-link.js
      import Component from '@glimmer/component';
      import { inject as service } from '@ember/service';
      import { action } from '@ember/object';
         export default class CopyLinkComponent extends Component {
        @service router;
        @service clipboard;
           @action
        copyBooksURL() {
          if (this.author) {
            const url = this.router.urlFor('author.books', this.args.author);
            this.clipboard.set(url);
            // Clipboard now has /author/tomster/books
          }
        }
      }
      ```
         Just like with `transitionTo` and `replaceWith`, `urlFor` can also handle
      query parameters.
         ```app/templates/application.hbs
      <CopyLink @author={{hash id="tomster" name="Tomster"}} />
      ```
         ```app/components/copy-link.js
      import Component from '@glimmer/component';
      import { inject as service } from '@ember/service';
      import { action } from '@ember/object';
         export default class CopyLinkComponent extends Component {
        @service router;
        @service clipboard;
           @action
        copyOnlyEmberBooksURL() {
          if (this.author) {
            const url = this.router.urlFor('author.books', this.author, {
              queryParams: { filter: 'emberjs' }
            });
            this.clipboard.set(url);
            // Clipboard now has /author/tomster/books?filter=emberjs
          }
        }
      }
      ```
          @method urlFor
       @param {String} routeName the name of the route
       @param {...Object} models the model(s) or identifier(s) to be used while
         transitioning to the route.
       @param {Object} [options] optional hash with a queryParams property
         containing a mapping of query parameters
       @return {String} the string representing the generated URL
       @public
     */
    ;

    _proto.urlFor = function urlFor(routeName) {
      var _this$_router;

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      return (_this$_router = this._router).generate.apply(_this$_router, [routeName].concat(args));
    }
    /**
       Determines whether a route is active.
          @method isActive
       @param {String} routeName the name of the route
       @param {...Object} models the model(s) or identifier(s) to be used while
         transitioning to the route.
       @param {Object} [options] optional hash with a queryParams property
         containing a mapping of query parameters
       @return {boolean} true if the provided routeName/models/queryParams are active
       @public
     */
    ;

    _proto.isActive = function isActive() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var _extractRouteArgs2 = (0, _utils.extractRouteArgs)(args),
          routeName = _extractRouteArgs2.routeName,
          models = _extractRouteArgs2.models,
          queryParams = _extractRouteArgs2.queryParams;

      var routerMicrolib = this._router._routerMicrolib;

      if (!routerMicrolib.isActiveIntent(routeName, models)) {
        return false;
      }

      var hasQueryParams = Object.keys(queryParams).length > 0;

      if (hasQueryParams) {
        this._router._prepareQueryParams(routeName, models, queryParams, true
        /* fromRouterService */
        );

        return (0, _utils.shallowEqual)(queryParams, routerMicrolib.state.queryParams);
      }

      return true;
    }
    /**
       Takes a string URL and returns a `RouteInfo` for the leafmost route represented
       by the URL. Returns `null` if the URL is not recognized. This method expects to
       receive the actual URL as seen by the browser including the app's `rootURL`.
          See [RouteInfo](/ember/release/classes/RouteInfo) for more info.
          In the following example `recognize` is used to verify if a path belongs to our
       application before transitioning to it.
          ```
       import Component from '@ember/component';
       import { inject as service } from '@ember/service';
          export default class extends Component {
         @service router;
         path = '/';
            click() {
           if (this.router.recognize(this.path)) {
             this.router.transitionTo(this.path);
           }
         }
       }
       ```
           @method recognize
        @param {String} url
        @public
      */
    ;

    _proto.recognize = function recognize(url) {
      (false && !(url.indexOf(this.rootURL) === 0) && (0, _debug.assert)("You must pass a url that begins with the application's rootURL \"" + this.rootURL + "\"", url.indexOf(this.rootURL) === 0));
      var internalURL = cleanURL(url, this.rootURL);
      return this._router._routerMicrolib.recognize(internalURL);
    }
    /**
      Takes a string URL and returns a promise that resolves to a
      `RouteInfoWithAttributes` for the leafmost route represented by the URL.
      The promise rejects if the URL is not recognized or an unhandled exception
      is encountered. This method expects to receive the actual URL as seen by
      the browser including the app's `rootURL`.
           @method recognizeAndLoad
        @param {String} url
        @public
     */
    ;

    _proto.recognizeAndLoad = function recognizeAndLoad(url) {
      (false && !(url.indexOf(this.rootURL) === 0) && (0, _debug.assert)("You must pass a url that begins with the application's rootURL \"" + this.rootURL + "\"", url.indexOf(this.rootURL) === 0));
      var internalURL = cleanURL(url, this.rootURL);
      return this._router._routerMicrolib.recognizeAndLoad(internalURL);
    };

    return RouterService;
  }(_service.default);

  _exports.default = RouterService;
  RouterService.reopen(_runtime.Evented, {
    /**
       Name of the current route.
          This property represents the logical name of the route,
       which is comma separated.
       For the following router:
          ```app/router.js
       Router.map(function() {
         this.route('about');
         this.route('blog', function () {
           this.route('post', { path: ':post_id' });
         });
       });
       ```
          It will return:
          * `index` when you visit `/`
       * `about` when you visit `/about`
       * `blog.index` when you visit `/blog`
       * `blog.post` when you visit `/blog/some-post-id`
          @property currentRouteName
       @type String
       @public
     */
    currentRouteName: (0, _computed.readOnly)('_router.currentRouteName'),

    /**
       Current URL for the application.
         This property represents the URL path for this route.
      For the following router:
          ```app/router.js
       Router.map(function() {
         this.route('about');
         this.route('blog', function () {
           this.route('post', { path: ':post_id' });
         });
       });
       ```
          It will return:
          * `/` when you visit `/`
       * `/about` when you visit `/about`
       * `/blog` when you visit `/blog`
       * `/blog/some-post-id` when you visit `/blog/some-post-id`
          @property currentURL
       @type String
       @public
     */
    currentURL: (0, _computed.readOnly)('_router.currentURL'),

    /**
      The `location` property returns what implementation of the `location` API
      your application is using, which determines what type of URL is being used.
         See [Location](/ember/release/classes/Location) for more information.
         To force a particular `location` API implementation to be used in your
      application you can set a location type on your `config/environment`.
      For example, to set the `history` type:
         ```config/environment.js
      'use strict';
         module.exports = function(environment) {
        let ENV = {
          modulePrefix: 'router-service',
          environment,
          rootURL: '/',
          locationType: 'history',
          ...
        }
      }
      ```
         The following location types are available by default:
      `auto`, `hash`, `history`, `none`.
         See [HashLocation](/ember/release/classes/HashLocation).
      See [HistoryLocation](/ember/release/classes/HistoryLocation).
      See [NoneLocation](/ember/release/classes/NoneLocation).
      See [AutoLocation](/ember/release/classes/AutoLocation).
         @property location
      @default 'hash'
      @see {Location}
      @public
    */
    location: (0, _computed.readOnly)('_router.location'),

    /**
      The `rootURL` property represents the URL of the root of
      the application, '/' by default.
      This prefix is assumed on all routes defined on this app.
         If you change the `rootURL` in your environment configuration
      like so:
         ```config/environment.js
      'use strict';
         module.exports = function(environment) {
        let ENV = {
          modulePrefix: 'router-service',
          environment,
          rootURL: '/my-root',
        …
        }
      ]
      ```
         This property will return `/my-root`.
         @property rootURL
      @default '/'
      @public
    */
    rootURL: (0, _computed.readOnly)('_router.rootURL'),

    /**
      The `currentRoute` property contains metadata about the current leaf route.
      It returns a `RouteInfo` object that has information like the route name,
      params, query params and more.
         See [RouteInfo](/ember/release/classes/RouteInfo) for more info.
         This property is guaranteed to change whenever a route transition
      happens (even when that transition only changes parameters
      and doesn't change the active route).
         Usage example:
      ```app/components/header.js
        import Component from '@glimmer/component';
        import { inject as service } from '@ember/service';
        import { notEmpty } from '@ember/object/computed';
           export default class extends Component {
          @service router;
             @notEmpty('router.currentRoute.child') isChildRoute;
        });
      ```
          @property currentRoute
       @type RouteInfo
       @public
     */
    currentRoute: (0, _computed.readOnly)('_router.currentRoute')
  });
});