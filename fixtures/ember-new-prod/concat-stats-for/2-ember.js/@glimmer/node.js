define("@glimmer/node", ["exports", "ember-babel", "@glimmer/runtime"], function (_exports, _emberBabel, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.serializeBuilder = serializeBuilder;
  _exports.NodeDOMTreeConstruction = void 0;

  var NodeDOMTreeConstruction =
  /*#__PURE__*/
  function (_DOMTreeConstruction) {
    (0, _emberBabel.inheritsLoose)(NodeDOMTreeConstruction, _DOMTreeConstruction);

    function NodeDOMTreeConstruction(doc) {
      return _DOMTreeConstruction.call(this, doc) || this;
    } // override to prevent usage of `this.document` until after the constructor


    var _proto = NodeDOMTreeConstruction.prototype;

    _proto.setupUselessElement = function setupUselessElement() {} // override to avoid SVG detection/work when in node (this is not needed in SSR)
    ;

    _proto.createElement = function createElement(tag) {
      return this.document.createElement(tag);
    } // override to avoid namespace shenanigans when in node (this is not needed in SSR)
    ;

    _proto.setAttribute = function setAttribute(element, name, value) {
      element.setAttribute(name, value);
    };

    return NodeDOMTreeConstruction;
  }(_runtime.DOMTreeConstruction);

  _exports.NodeDOMTreeConstruction = NodeDOMTreeConstruction;
  var TEXT_NODE = 3;

  function currentNode(cursor) {
    var element = cursor.element,
        nextSibling = cursor.nextSibling;

    if (nextSibling === null) {
      return element.lastChild;
    } else {
      return nextSibling.previousSibling;
    }
  }

  var SerializeBuilder =
  /*#__PURE__*/
  function (_NewElementBuilder) {
    (0, _emberBabel.inheritsLoose)(SerializeBuilder, _NewElementBuilder);

    function SerializeBuilder() {
      var _this;

      _this = _NewElementBuilder.apply(this, arguments) || this;
      _this.serializeBlockDepth = 0;
      return _this;
    }

    var _proto2 = SerializeBuilder.prototype;

    _proto2.__openBlock = function __openBlock() {
      var tagName = this.element.tagName;

      if (tagName !== 'TITLE' && tagName !== 'SCRIPT' && tagName !== 'STYLE') {
        var depth = this.serializeBlockDepth++;

        this.__appendComment("%+b:" + depth + "%");
      }

      _NewElementBuilder.prototype.__openBlock.call(this);
    };

    _proto2.__closeBlock = function __closeBlock() {
      var tagName = this.element.tagName;

      _NewElementBuilder.prototype.__closeBlock.call(this);

      if (tagName !== 'TITLE' && tagName !== 'SCRIPT' && tagName !== 'STYLE') {
        var depth = --this.serializeBlockDepth;

        this.__appendComment("%-b:" + depth + "%");
      }
    };

    _proto2.__appendHTML = function __appendHTML(html) {
      var tagName = this.element.tagName;

      if (tagName === 'TITLE' || tagName === 'SCRIPT' || tagName === 'STYLE') {
        return _NewElementBuilder.prototype.__appendHTML.call(this, html);
      } // Do we need to run the html tokenizer here?


      var first = this.__appendComment('%glmr%');

      if (tagName === 'TABLE') {
        var openIndex = html.indexOf('<');

        if (openIndex > -1) {
          var tr = html.slice(openIndex + 1, openIndex + 3);

          if (tr === 'tr') {
            html = "<tbody>" + html + "</tbody>";
          }
        }
      }

      if (html === '') {
        this.__appendComment('% %');
      } else {
        _NewElementBuilder.prototype.__appendHTML.call(this, html);
      }

      var last = this.__appendComment('%glmr%');

      return new _runtime.ConcreteBounds(this.element, first, last);
    };

    _proto2.__appendText = function __appendText(string) {
      var tagName = this.element.tagName;
      var current = currentNode(this);

      if (tagName === 'TITLE' || tagName === 'SCRIPT' || tagName === 'STYLE') {
        return _NewElementBuilder.prototype.__appendText.call(this, string);
      } else if (string === '') {
        return this.__appendComment('% %');
      } else if (current && current.nodeType === TEXT_NODE) {
        this.__appendComment('%|%');
      }

      return _NewElementBuilder.prototype.__appendText.call(this, string);
    };

    _proto2.closeElement = function closeElement() {
      if (this.element['needsExtraClose'] === true) {
        this.element['needsExtraClose'] = false;

        _NewElementBuilder.prototype.closeElement.call(this);
      }

      return _NewElementBuilder.prototype.closeElement.call(this);
    };

    _proto2.openElement = function openElement(tag) {
      if (tag === 'tr') {
        if (this.element.tagName !== 'TBODY' && this.element.tagName !== 'THEAD' && this.element.tagName !== 'TFOOT') {
          this.openElement('tbody'); // This prevents the closeBlock comment from being re-parented
          // under the auto inserted tbody. Rehydration builder needs to
          // account for the insertion since it is injected here and not
          // really in the template.

          this.constructing['needsExtraClose'] = true;
          this.flushElement(null);
        }
      }

      return _NewElementBuilder.prototype.openElement.call(this, tag);
    };

    _proto2.pushRemoteElement = function pushRemoteElement(element, cursorId, nextSibling) {
      if (nextSibling === void 0) {
        nextSibling = null;
      }

      var dom = this.dom;
      var script = dom.createElement('script');
      script.setAttribute('glmr', cursorId);
      dom.insertBefore(element, script, nextSibling);

      _NewElementBuilder.prototype.pushRemoteElement.call(this, element, cursorId, nextSibling);
    };

    return SerializeBuilder;
  }(_runtime.NewElementBuilder);

  function serializeBuilder(env, cursor) {
    return SerializeBuilder.forInitialRender(env, cursor);
  }
});