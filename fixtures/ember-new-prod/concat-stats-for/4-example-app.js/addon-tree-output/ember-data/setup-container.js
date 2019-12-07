define("ember-data/setup-container", ["exports", "ember-data/-private", "@ember-data/store"], function (_exports, _private, _store) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = setupContainer;

  function initializeStore(application) {
    // we can just use registerOptionsForType when we no longer
    // support (deprecated) versions of @ember/test-helpers
    // We're issuing a "private-api" deprecation for users of the
    // deprecated @ember/test-helpers versions, but will keep
    // this for as long as until 4.0 as needed
    if (false
    /* DEBUG */
    && !application.registerOptionsForType) {
      (false && !(false) && Ember.deprecate("Deprecated test syntax usage detected!\n\n\t" + "This test relies on a deprecated test setup that is no longer supported by EmberData." + " To resolve this you will need to be on a recent version of @ember/test-helpers" + " AND your tests must use `setApplication()` instead of `setResolver()` and" + " `module()` with `setup*Test()`instead of `moduleFor*()`.", false, {
        id: 'ember-data:legacy-test-helper-support',
        until: '3.17'
      }));
      application.optionsForType('serializer', {
        singleton: false
      });
      application.optionsForType('adapter', {
        singleton: false
      });

      if (!application.has('service:store')) {
        application.register('service:store', _store.default);
      }

      return;
    }

    application.registerOptionsForType('serializer', {
      singleton: false
    });
    application.registerOptionsForType('adapter', {
      singleton: false
    });

    if (!application.hasRegistration('service:store')) {
      application.register('service:store', _store.default);
    }
  }

  function initializeDataAdapter(application) {
    application.register('data-adapter:main', _private.DebugAdapter);
  }

  function initializeStoreInjections(application) {
    var inject = application.inject || application.injection;
    inject.call(application, 'controller', 'store', 'service:store');
    inject.call(application, 'route', 'store', 'service:store');
    inject.call(application, 'data-adapter', 'store', 'service:store');
  }

  function setupContainer(application) {
    initializeDataAdapter(application);
    initializeStoreInjections(application);
    initializeStore(application);
  }
});