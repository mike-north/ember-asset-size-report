define("@ember/-internals/views/lib/system/utils", ["exports", "@ember/-internals/owner", "@ember/-internals/utils", "@ember/debug"], function (_exports, _owner, _utils, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isSimpleClick = isSimpleClick;
  _exports.constructStyleDeprecationMessage = constructStyleDeprecationMessage;
  _exports.getRootViews = getRootViews;
  _exports.getViewId = getViewId;
  _exports.getElementView = getElementView;
  _exports.getViewElement = getViewElement;
  _exports.setElementView = setElementView;
  _exports.setViewElement = setViewElement;
  _exports.clearElementView = clearElementView;
  _exports.clearViewElement = clearViewElement;
  _exports.getChildViews = getChildViews;
  _exports.initChildViews = initChildViews;
  _exports.addChildView = addChildView;
  _exports.collectChildViews = collectChildViews;
  _exports.getViewBounds = getViewBounds;
  _exports.getViewRange = getViewRange;
  _exports.getViewClientRects = getViewClientRects;
  _exports.getViewBoundingClientRect = getViewBoundingClientRect;
  _exports.matches = matches;
  _exports.contains = contains;
  _exports.elMatches = void 0;

  /* globals Element */

  /**
  @module ember
  */
  function isSimpleClick(event) {
    var modifier = event.shiftKey || event.metaKey || event.altKey || event.ctrlKey;
    var secondaryClick = event.which > 1; // IE9 may return undefined

    return !modifier && !secondaryClick;
  }

  function constructStyleDeprecationMessage(affectedStyle) {
    return '' + 'Binding style attributes may introduce cross-site scripting vulnerabilities; ' + 'please ensure that values being bound are properly escaped. For more information, ' + 'including how to disable this warning, see ' + 'https://emberjs.com/deprecations/v1.x/#toc_binding-style-attributes. ' + 'Style affected: "' + affectedStyle + '"';
  }
  /**
    @private
    @method getRootViews
    @param {Object} owner
  */


  function getRootViews(owner) {
    var registry = owner.lookup('-view-registry:main');
    var rootViews = [];
    Object.keys(registry).forEach(function (id) {
      var view = registry[id];

      if (view.parentView === null) {
        rootViews.push(view);
      }
    });
    return rootViews;
  }
  /**
    @private
    @method getViewId
    @param {Ember.View} view
   */


  function getViewId(view) {
    if (view.tagName !== '' && view.elementId) {
      return view.elementId;
    } else {
      return (0, _utils.guidFor)(view);
    }
  }

  var ELEMENT_VIEW = new WeakMap();
  var VIEW_ELEMENT = new WeakMap();

  function getElementView(element) {
    return ELEMENT_VIEW.get(element) || null;
  }
  /**
    @private
    @method getViewElement
    @param {Ember.View} view
   */


  function getViewElement(view) {
    return VIEW_ELEMENT.get(view) || null;
  }

  function setElementView(element, view) {
    ELEMENT_VIEW.set(element, view);
  }

  function setViewElement(view, element) {
    VIEW_ELEMENT.set(view, element);
  } // These are not needed for GC, but for correctness. We want to be able to
  // null-out these links while the objects are still live. Specifically, in
  // this case, we want to prevent access to the element (and vice verse) during
  // destruction.


  function clearElementView(element) {
    ELEMENT_VIEW.delete(element);
  }

  function clearViewElement(view) {
    VIEW_ELEMENT.delete(view);
  }

  var CHILD_VIEW_IDS = new WeakMap();
  /**
    @private
    @method getChildViews
    @param {Ember.View} view
  */

  function getChildViews(view) {
    var owner = (0, _owner.getOwner)(view);
    var registry = owner.lookup('-view-registry:main');
    return collectChildViews(view, registry);
  }

  function initChildViews(view) {
    var childViews = new Set();
    CHILD_VIEW_IDS.set(view, childViews);
    return childViews;
  }

  function addChildView(parent, child) {
    var childViews = CHILD_VIEW_IDS.get(parent);

    if (childViews === undefined) {
      childViews = initChildViews(parent);
    }

    childViews.add(getViewId(child));
  }

  function collectChildViews(view, registry) {
    var views = [];
    var childViews = CHILD_VIEW_IDS.get(view);

    if (childViews !== undefined) {
      childViews.forEach(function (id) {
        var view = registry[id];

        if (view && !view.isDestroying && !view.isDestroyed) {
          views.push(view);
        }
      });
    }

    return views;
  }
  /**
    @private
    @method getViewBounds
    @param {Ember.View} view
  */


  function getViewBounds(view) {
    return view.renderer.getBounds(view);
  }
  /**
    @private
    @method getViewRange
    @param {Ember.View} view
  */


  function getViewRange(view) {
    var bounds = getViewBounds(view);
    var range = document.createRange();
    range.setStartBefore(bounds.firstNode);
    range.setEndAfter(bounds.lastNode);
    return range;
  }
  /**
    `getViewClientRects` provides information about the position of the border
    box edges of a view relative to the viewport.
  
    It is only intended to be used by development tools like the Ember Inspector
    and may not work on older browsers.
  
    @private
    @method getViewClientRects
    @param {Ember.View} view
  */


  function getViewClientRects(view) {
    var range = getViewRange(view);
    return range.getClientRects();
  }
  /**
    `getViewBoundingClientRect` provides information about the position of the
    bounding border box edges of a view relative to the viewport.
  
    It is only intended to be used by development tools like the Ember Inspector
    and may not work on older browsers.
  
    @private
    @method getViewBoundingClientRect
    @param {Ember.View} view
  */


  function getViewBoundingClientRect(view) {
    var range = getViewRange(view);
    return range.getBoundingClientRect();
  }
  /**
    Determines if the element matches the specified selector.
  
    @private
    @method matches
    @param {DOMElement} el
    @param {String} selector
  */


  var elMatches = typeof Element !== 'undefined' ? Element.prototype.matches || Element.prototype['matchesSelector'] || Element.prototype['mozMatchesSelector'] || Element.prototype['msMatchesSelector'] || Element.prototype['oMatchesSelector'] || Element.prototype['webkitMatchesSelector'] : undefined;
  _exports.elMatches = elMatches;

  function matches(el, selector) {
    (false && !(elMatches !== undefined) && (0, _debug.assert)('cannot call `matches` in fastboot mode', elMatches !== undefined));
    return elMatches.call(el, selector);
  }

  function contains(a, b) {
    if (a.contains !== undefined) {
      return a.contains(b);
    }

    var current = b.parentNode;

    while (current && (current = current.parentNode)) {
      if (current === a) {
        return true;
      }
    }

    return false;
  }
});