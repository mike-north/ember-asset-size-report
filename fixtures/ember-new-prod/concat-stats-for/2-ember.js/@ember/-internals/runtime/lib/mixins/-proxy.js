define("@ember/-internals/runtime/lib/mixins/-proxy", ["exports", "@ember/-internals/meta", "@ember/-internals/metal", "@ember/-internals/utils", "@ember/debug", "@glimmer/reference"], function (_exports, _meta, _metal, _utils, _debug, _reference) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.contentFor = contentFor;
  _exports.default = void 0;

  var _Mixin$create;

  function contentFor(proxy, m) {
    var content = (0, _metal.get)(proxy, 'content');
    var tag = (m === undefined ? (0, _meta.meta)(proxy) : m).readableTag();

    if (tag !== undefined) {
      (0, _reference.update)(tag, (0, _metal.tagFor)(content));
    }

    return content;
  }
  /**
    `Ember.ProxyMixin` forwards all properties not defined by the proxy itself
    to a proxied `content` object.  See ObjectProxy for more details.
  
    @class ProxyMixin
    @namespace Ember
    @private
  */


  var _default = _metal.Mixin.create((_Mixin$create = {
    /**
      The object whose properties will be forwarded.
       @property content
      @type {unknown}
      @default null
      @public
    */
    content: null,
    init: function init() {
      this._super.apply(this, arguments);

      (0, _utils.setProxy)(this);
      var m = (0, _meta.meta)(this);
      m.writableTag();
    },
    willDestroy: function willDestroy() {
      this.set('content', null);

      this._super.apply(this, arguments);
    },
    isTruthy: (0, _metal.computed)('content', function () {
      return Boolean((0, _metal.get)(this, 'content'));
    }),
    willWatchProperty: function willWatchProperty(key) {
      if (!true
      /* EMBER_METAL_TRACKED_PROPERTIES */
      ) {
          var contentKey = "content." + key;
          (0, _metal.addObserver)(this, contentKey, null, '_contentPropertyDidChange');
        }
    },
    didUnwatchProperty: function didUnwatchProperty(key) {
      if (!true
      /* EMBER_METAL_TRACKED_PROPERTIES */
      ) {
          var contentKey = "content." + key;
          (0, _metal.removeObserver)(this, contentKey, null, '_contentPropertyDidChange');
        }
    },
    _contentPropertyDidChange: function _contentPropertyDidChange(content, contentKey) {
      var key = contentKey.slice(8); // remove "content."

      if (key in this) {
        return;
      } // if shadowed in proxy


      (0, _metal.notifyPropertyChange)(this, key);
    }
  }, _Mixin$create[_metal.UNKNOWN_PROPERTY_TAG] = function (key) {
    return (0, _reference.combine)((0, _metal.getChainTagsForKey)(this, "content." + key));
  }, _Mixin$create.unknownProperty = function unknownProperty(key) {
    var content = contentFor(this);

    if (content) {
      return (0, _metal.get)(content, key);
    }
  }, _Mixin$create.setUnknownProperty = function setUnknownProperty(key, value) {
    var m = (0, _meta.meta)(this);

    if (m.isInitializing() || m.isPrototypeMeta(this)) {
      // if marked as prototype or object is initializing then just
      // defineProperty rather than delegate
      (0, _metal.defineProperty)(this, key, null, value);
      return value;
    }

    var content = contentFor(this, m);
    (false && !(content) && (0, _debug.assert)("Cannot delegate set('" + key + "', " + value + ") to the 'content' property of object proxy " + this + ": its 'content' is undefined.", content));
    return (0, _metal.set)(content, key, value);
  }, _Mixin$create));

  _exports.default = _default;
});