(function () {
  'use strict';

  function exists(options, message) {
      if (typeof options === 'string') {
          message = options;
          options = undefined;
      }
      var elements = this.findElements(this.target);
      var expectedCount = options ? options.count : null;
      if (expectedCount === null) {
          var result = elements.length > 0;
          var expected = format(this.target);
          var actual = result ? expected : format(this.target, 0);
          if (!message) {
              message = expected;
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      }
      else if (typeof expectedCount === 'number') {
          var result = elements.length === expectedCount;
          var actual = format(this.target, elements.length);
          var expected = format(this.target, expectedCount);
          if (!message) {
              message = expected;
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      }
      else {
          throw new TypeError("Unexpected Parameter: " + expectedCount);
      }
  }
  function format(selector, num) {
      if (num === undefined || num === null) {
          return "Element " + selector + " exists";
      }
      else if (num === 0) {
          return "Element " + selector + " does not exist";
      }
      else if (num === 1) {
          return "Element " + selector + " exists once";
      }
      else if (num === 2) {
          return "Element " + selector + " exists twice";
      }
      else {
          return "Element " + selector + " exists " + num + " times";
      }
  }

  // imported from https://github.com/nathanboktae/chai-dom
  function elementToString(el) {
      var desc;
      if (el instanceof NodeList) {
          if (el.length === 0) {
              return 'empty NodeList';
          }
          desc = Array.prototype.slice
              .call(el, 0, 5)
              .map(elementToString)
              .join(', ');
          return el.length > 5 ? desc + "... (+" + (el.length - 5) + " more)" : desc;
      }
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
          return String(el);
      }
      desc = el.tagName.toLowerCase();
      if (el.id) {
          desc += "#" + el.id;
      }
      if (el.className && !(el.className instanceof SVGAnimatedString)) {
          desc += "." + String(el.className).replace(/\s+/g, '.');
      }
      Array.prototype.forEach.call(el.attributes, function (attr) {
          if (attr.name !== 'class' && attr.name !== 'id') {
              desc += "[" + attr.name + (attr.value ? "=\"" + attr.value + "\"]" : ']');
          }
      });
      return desc;
  }

  function focused(message) {
      var element = this.findTargetElement();
      if (!element)
          return;
      var result = document.activeElement === element;
      var actual = elementToString(document.activeElement);
      var expected = elementToString(this.target);
      if (!message) {
          message = "Element " + expected + " is focused";
      }
      this.pushResult({ result: result, actual: actual, expected: expected, message: message });
  }

  function notFocused(message) {
      var element = this.findTargetElement();
      if (!element)
          return;
      var result = document.activeElement !== element;
      if (!message) {
          message = "Element " + this.targetDescription + " is not focused";
      }
      this.pushResult({ result: result, message: message });
  }

  function checked(message) {
      var element = this.findTargetElement();
      if (!element)
          return;
      var isChecked = element.checked === true;
      var isNotChecked = element.checked === false;
      var result = isChecked;
      var hasCheckedProp = isChecked || isNotChecked;
      if (!hasCheckedProp) {
          var ariaChecked = element.getAttribute('aria-checked');
          if (ariaChecked !== null) {
              result = ariaChecked === 'true';
          }
      }
      var actual = result ? 'checked' : 'not checked';
      var expected = 'checked';
      if (!message) {
          message = "Element " + elementToString(this.target) + " is checked";
      }
      this.pushResult({ result: result, actual: actual, expected: expected, message: message });
  }

  function notChecked(message) {
      var element = this.findTargetElement();
      if (!element)
          return;
      var isChecked = element.checked === true;
      var isNotChecked = element.checked === false;
      var result = !isChecked;
      var hasCheckedProp = isChecked || isNotChecked;
      if (!hasCheckedProp) {
          var ariaChecked = element.getAttribute('aria-checked');
          if (ariaChecked !== null) {
              result = ariaChecked !== 'true';
          }
      }
      var actual = result ? 'not checked' : 'checked';
      var expected = 'not checked';
      if (!message) {
          message = "Element " + elementToString(this.target) + " is not checked";
      }
      this.pushResult({ result: result, actual: actual, expected: expected, message: message });
  }

  function required(message) {
      var element = this.findTargetElement();
      if (!element)
          return;
      if (!(element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement)) {
          throw new TypeError("Unexpected Element Type: " + element.toString());
      }
      var result = element.required === true;
      var actual = result ? 'required' : 'not required';
      var expected = 'required';
      if (!message) {
          message = "Element " + elementToString(this.target) + " is required";
      }
      this.pushResult({ result: result, actual: actual, expected: expected, message: message });
  }

  function notRequired(message) {
      var element = this.findTargetElement();
      if (!element)
          return;
      if (!(element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement)) {
          throw new TypeError("Unexpected Element Type: " + element.toString());
      }
      var result = element.required === false;
      var actual = !result ? 'required' : 'not required';
      var expected = 'not required';
      if (!message) {
          message = "Element " + elementToString(this.target) + " is not required";
      }
      this.pushResult({ result: result, actual: actual, expected: expected, message: message });
  }

  // Visible logic based on jQuery's
  // https://github.com/jquery/jquery/blob/4a2bcc27f9c3ee24b3effac0fbe1285d1ee23cc5/src/css/hiddenVisibleSelectors.js#L11-L13
  function visible(el) {
      if (el === null)
          return false;
      if (el.offsetWidth === 0 || el.offsetHeight === 0)
          return false;
      var clientRects = el.getClientRects();
      if (clientRects.length === 0)
          return false;
      for (var i = 0; i < clientRects.length; i++) {
          var rect = clientRects[i];
          if (rect.width !== 0 && rect.height !== 0)
              return true;
      }
      return false;
  }

  function isVisible(options, message) {
      if (typeof options === 'string') {
          message = options;
          options = undefined;
      }
      var elements = this.findElements(this.target).filter(visible);
      var expectedCount = options ? options.count : null;
      if (expectedCount === null) {
          var result = elements.length > 0;
          var expected = format$1(this.target);
          var actual = result ? expected : format$1(this.target, 0);
          if (!message) {
              message = expected;
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      }
      else if (typeof expectedCount === 'number') {
          var result = elements.length === expectedCount;
          var actual = format$1(this.target, elements.length);
          var expected = format$1(this.target, expectedCount);
          if (!message) {
              message = expected;
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      }
      else {
          throw new TypeError("Unexpected Parameter: " + expectedCount);
      }
  }
  function format$1(selector, num) {
      if (num === undefined || num === null) {
          return "Element " + selector + " is visible";
      }
      else if (num === 0) {
          return "Element " + selector + " is not visible";
      }
      else if (num === 1) {
          return "Element " + selector + " is visible once";
      }
      else if (num === 2) {
          return "Element " + selector + " is visible twice";
      }
      else {
          return "Element " + selector + " is visible " + num + " times";
      }
  }

  function isDisabled(message, options) {
      if (options === void 0) { options = {}; }
      var inverted = options.inverted;
      var element = this.findTargetElement();
      if (!element)
          return;
      if (!(element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLButtonElement ||
          element instanceof HTMLOptGroupElement ||
          element instanceof HTMLOptionElement ||
          element instanceof HTMLFieldSetElement)) {
          throw new TypeError("Unexpected Element Type: " + element.toString());
      }
      var result = element.disabled === !inverted;
      var actual = element.disabled === false
          ? "Element " + this.targetDescription + " is not disabled"
          : "Element " + this.targetDescription + " is disabled";
      var expected = inverted
          ? "Element " + this.targetDescription + " is not disabled"
          : "Element " + this.targetDescription + " is disabled";
      if (!message) {
          message = expected;
      }
      this.pushResult({ result: result, actual: actual, expected: expected, message: message });
  }

  function matchesSelector(elements, compareSelector) {
      var failures = elements.filter(function (it) { return !it.matches(compareSelector); });
      return failures.length;
  }

  function collapseWhitespace(string) {
      return string
          .replace(/[\t\r\n]/g, ' ')
          .replace(/ +/g, ' ')
          .replace(/^ /, '')
          .replace(/ $/, '');
  }

  /**
   * This function can be used to convert a NodeList to a regular array.
   * We should be using `Array.from()` for this, but IE11 doesn't support that :(
   *
   * @private
   */
  function toArray(list) {
      return Array.prototype.slice.call(list);
  }

  var DOMAssertions = /** @class */ (function () {
      function DOMAssertions(target, rootElement, testContext) {
          this.target = target;
          this.rootElement = rootElement;
          this.testContext = testContext;
      }
      /**
       * Assert an {@link HTMLElement} (or multiple) matching the `selector` exists.
       *
       * @param {object?} options
       * @param {number?} options.count
       * @param {string?} message
       *
       * @example
       * assert.dom('#title').exists();
       * assert.dom('.choice').exists({ count: 4 });
       *
       * @see {@link #doesNotExist}
       */
      DOMAssertions.prototype.exists = function (options, message) {
          exists.call(this, options, message);
      };
      /**
       * Assert an {@link HTMLElement} matching the `selector` does not exists.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('.should-not-exist').doesNotExist();
       *
       * @see {@link #exists}
       */
      DOMAssertions.prototype.doesNotExist = function (message) {
          exists.call(this, { count: 0 }, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is currently checked.
       *
       * Note: This also supports `aria-checked="true/false"`.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input.active').isChecked();
       *
       * @see {@link #isNotChecked}
       */
      DOMAssertions.prototype.isChecked = function (message) {
          checked.call(this, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is currently unchecked.
       *
       * Note: This also supports `aria-checked="true/false"`.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input.active').isNotChecked();
       *
       * @see {@link #isChecked}
       */
      DOMAssertions.prototype.isNotChecked = function (message) {
          notChecked.call(this, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is currently focused.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input.email').isFocused();
       *
       * @see {@link #isNotFocused}
       */
      DOMAssertions.prototype.isFocused = function (message) {
          focused.call(this, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is not currently focused.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input[type="password"]').isNotFocused();
       *
       * @see {@link #isFocused}
       */
      DOMAssertions.prototype.isNotFocused = function (message) {
          notFocused.call(this, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is currently required.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input[type="text"]').isRequired();
       *
       * @see {@link #isNotRequired}
       */
      DOMAssertions.prototype.isRequired = function (message) {
          required.call(this, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is currently not required.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input[type="text"]').isNotRequired();
       *
       * @see {@link #isRequired}
       */
      DOMAssertions.prototype.isNotRequired = function (message) {
          notRequired.call(this, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` exists and is visible.
       *
       * Visibility is determined by asserting that:
       *
       * - the element's offsetWidth and offsetHeight are non-zero
       * - any of the element's DOMRect objects have a non-zero size
       *
       * Additionally, visibility in this case means that the element is visible on the page,
       * but not necessarily in the viewport.
       *
       * @param {object?} options
       * @param {number?} options.count
       * @param {string?} message
       *
       * @example
       * assert.dom('#title').isVisible();
       * assert.dom('.choice').isVisible({ count: 4 });
       *
       * @see {@link #isNotVisible}
       */
      DOMAssertions.prototype.isVisible = function (options, message) {
          isVisible.call(this, options, message);
      };
      /**
       * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` does not exist or is not visible on the page.
       *
       * Visibility is determined by asserting that:
       *
       * - the element's offsetWidth or offsetHeight are zero
       * - all of the element's DOMRect objects have a size of zero
       *
       * Additionally, visibility in this case means that the element is visible on the page,
       * but not necessarily in the viewport.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('.foo').isNotVisible();
       *
       * @see {@link #isVisible}
       */
      DOMAssertions.prototype.isNotVisible = function (message) {
          isVisible.call(this, { count: 0 }, message);
      };
      /**
       * Assert that the {@link HTMLElement} has an attribute with the provided `name`
       * and optionally checks if the attribute `value` matches the provided text
       * or regular expression.
       *
       * @param {string} name
       * @param {string|RegExp|object?} value
       * @param {string?} message
       *
       * @example
       * assert.dom('input.password-input').hasAttribute('type', 'password');
       *
       * @see {@link #doesNotHaveAttribute}
       */
      DOMAssertions.prototype.hasAttribute = function (name, value, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          if (arguments.length === 1) {
              value = { any: true };
          }
          var actualValue = element.getAttribute(name);
          if (value instanceof RegExp) {
              var result = value.test(actualValue);
              var expected = "Element " + this.targetDescription + " has attribute \"" + name + "\" with value matching " + value;
              var actual = actualValue === null
                  ? "Element " + this.targetDescription + " does not have attribute \"" + name + "\""
                  : "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(actualValue);
              if (!message) {
                  message = expected;
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
          else if (value.any === true) {
              var result = actualValue !== null;
              var expected = "Element " + this.targetDescription + " has attribute \"" + name + "\"";
              var actual = result
                  ? expected
                  : "Element " + this.targetDescription + " does not have attribute \"" + name + "\"";
              if (!message) {
                  message = expected;
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
          else {
              var result = value === actualValue;
              var expected = "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(value);
              var actual = actualValue === null
                  ? "Element " + this.targetDescription + " does not have attribute \"" + name + "\""
                  : "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(actualValue);
              if (!message) {
                  message = expected;
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * Assert that the {@link HTMLElement} has no attribute with the provided `name`.
       *
       * **Aliases:** `hasNoAttribute`, `lacksAttribute`
       *
       * @param {string} name
       * @param {string?} message
       *
       * @example
       * assert.dom('input.username').hasNoAttribute('disabled');
       *
       * @see {@link #hasAttribute}
       */
      DOMAssertions.prototype.doesNotHaveAttribute = function (name, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          var result = !element.hasAttribute(name);
          var expected = "Element " + this.targetDescription + " does not have attribute \"" + name + "\"";
          var actual = expected;
          if (!result) {
              var value = element.getAttribute(name);
              actual = "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(value);
          }
          if (!message) {
              message = expected;
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      };
      DOMAssertions.prototype.hasNoAttribute = function (name, message) {
          this.doesNotHaveAttribute(name, message);
      };
      DOMAssertions.prototype.lacksAttribute = function (name, message) {
          this.doesNotHaveAttribute(name, message);
      };
      /**
       *  Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is disabled.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('.foo').isDisabled();
       *
       * @see {@link #isNotDisabled}
       */
      DOMAssertions.prototype.isDisabled = function (message) {
          isDisabled.call(this, message);
      };
      /**
       *  Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
       * `selector` is not disabled.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('.foo').isNotDisabled();
       *
       * @see {@link #isDisabled}
       */
      DOMAssertions.prototype.isNotDisabled = function (message) {
          isDisabled.call(this, message, { inverted: true });
      };
      /**
       * Assert that the {@link HTMLElement} has the `expected` CSS class using
       * [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
       *
       * `expected` can also be a regular expression, and the assertion will return
       * true if any of the element's CSS classes match.
       *
       * @param {string|RegExp} expected
       * @param {string?} message
       *
       * @example
       * assert.dom('input[type="password"]').hasClass('secret-password-input');
       *
       * @example
       * assert.dom('input[type="password"]').hasClass(/.*password-input/);
       *
       * @see {@link #doesNotHaveClass}
       */
      DOMAssertions.prototype.hasClass = function (expected, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          var actual = element.classList.toString();
          if (expected instanceof RegExp) {
              var classNames = Array.prototype.slice.call(element.classList);
              var result = classNames.some(function (className) {
                  return expected.test(className);
              });
              if (!message) {
                  message = "Element " + this.targetDescription + " has CSS class matching " + expected;
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
          else {
              var result = element.classList.contains(expected);
              if (!message) {
                  message = "Element " + this.targetDescription + " has CSS class \"" + expected + "\"";
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * Assert that the {@link HTMLElement} does not have the `expected` CSS class using
       * [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
       *
       * `expected` can also be a regular expression, and the assertion will return
       * true if none of the element's CSS classes match.
       *
       * **Aliases:** `hasNoClass`, `lacksClass`
       *
       * @param {string|RegExp} expected
       * @param {string?} message
       *
       * @example
       * assert.dom('input[type="password"]').doesNotHaveClass('username-input');
       *
       * @example
       * assert.dom('input[type="password"]').doesNotHaveClass(/username-.*-input/);
       *
       * @see {@link #hasClass}
       */
      DOMAssertions.prototype.doesNotHaveClass = function (expected, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          var actual = element.classList.toString();
          if (expected instanceof RegExp) {
              var classNames = Array.prototype.slice.call(element.classList);
              var result = classNames.every(function (className) {
                  return !expected.test(className);
              });
              if (!message) {
                  message = "Element " + this.targetDescription + " does not have CSS class matching " + expected;
              }
              this.pushResult({ result: result, actual: actual, expected: "not: " + expected, message: message });
          }
          else {
              var result = !element.classList.contains(expected);
              if (!message) {
                  message = "Element " + this.targetDescription + " does not have CSS class \"" + expected + "\"";
              }
              this.pushResult({ result: result, actual: actual, expected: "not: " + expected, message: message });
          }
      };
      DOMAssertions.prototype.hasNoClass = function (expected, message) {
          this.doesNotHaveClass(expected, message);
      };
      DOMAssertions.prototype.lacksClass = function (expected, message) {
          this.doesNotHaveClass(expected, message);
      };
      /**
       * Assert that the [HTMLElement][] has the `expected` style declarations using
       * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
       *
       * @name hasStyle
       * @param {object} expected
       * @param {string?} message
       *
       * @example
       * assert.dom('.progress-bar').hasStyle({
       *   opacity: 1,
       *   display: 'block'
       * });
       *
       * @see {@link #hasClass}
       */
      DOMAssertions.prototype.hasStyle = function (expected, message) {
          this.hasPseudoElementStyle(null, expected, message);
      };
      /**
       * Assert that the pseudo element for `selector` of the [HTMLElement][] has the `expected` style declarations using
       * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
       *
       * @name hasPseudoElementStyle
       * @param {string} selector
       * @param {object} expected
       * @param {string?} message
       *
       * @example
       * assert.dom('.progress-bar').hasPseudoElementStyle(':after', {
       *   content: '";"',
       * });
       *
       * @see {@link #hasClass}
       */
      DOMAssertions.prototype.hasPseudoElementStyle = function (selector, expected, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          var computedStyle = window.getComputedStyle(element, selector);
          var expectedProperties = Object.keys(expected);
          var result = expectedProperties.every(function (property) { return computedStyle[property] === expected[property]; });
          var actual = {};
          expectedProperties.forEach(function (property) { return (actual[property] = computedStyle[property]); });
          if (!message) {
              var normalizedSelector = selector ? selector.replace(/^:{0,2}/, '::') : '';
              message = "Element " + this.targetDescription + normalizedSelector + " has style \"" + JSON.stringify(expected) + "\"";
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      };
      /**
       * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
       * matching the `selector` matches the `expected` text, using the
       * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
       * attribute and stripping/collapsing whitespace.
       *
       * `expected` can also be a regular expression.
       *
       * > Note: This assertion will collapse whitespace if the type you pass in is a string.
       * > If you are testing specifically for whitespace integrity, pass your expected text
       * > in as a RegEx pattern.
       *
       * **Aliases:** `matchesText`
       *
       * @param {string|RegExp} expected
       * @param {string?} message
       *
       * @example
       * // <h2 id="title">
       * //   Welcome to <b>QUnit</b>
       * // </h2>
       *
       * assert.dom('#title').hasText('Welcome to QUnit');
       *
       * @example
       * assert.dom('.foo').hasText(/[12]\d{3}/);
       *
       * @see {@link #includesText}
       */
      DOMAssertions.prototype.hasText = function (expected, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          if (expected instanceof RegExp) {
              var result = expected.test(element.textContent);
              var actual = element.textContent;
              if (!message) {
                  message = "Element " + this.targetDescription + " has text matching " + expected;
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
          else if (expected.any === true) {
              var result = Boolean(element.textContent);
              var expected_1 = "Element " + this.targetDescription + " has a text";
              var actual = result ? expected_1 : "Element " + this.targetDescription + " has no text";
              if (!message) {
                  message = expected_1;
              }
              this.pushResult({ result: result, actual: actual, expected: expected_1, message: message });
          }
          else if (typeof expected === 'string') {
              expected = collapseWhitespace(expected);
              var actual = collapseWhitespace(element.textContent);
              var result = actual === expected;
              if (!message) {
                  message = "Element " + this.targetDescription + " has text \"" + expected + "\"";
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
          else {
              throw new TypeError("You must pass a string or Regular Expression to \"hasText\". You passed " + expected + ".");
          }
      };
      DOMAssertions.prototype.matchesText = function (expected, message) {
          this.hasText(expected, message);
      };
      /**
       * Assert that the `textContent` property of an {@link HTMLElement} is not empty.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('button.share').hasAnyText();
       *
       * @see {@link #hasText}
       */
      DOMAssertions.prototype.hasAnyText = function (message) {
          this.hasText({ any: true }, message);
      };
      /**
       * Assert that the `textContent` property of an {@link HTMLElement} is empty.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('div').hasNoText();
       *
       * @see {@link #hasNoText}
       */
      DOMAssertions.prototype.hasNoText = function (message) {
          this.hasText('', message);
      };
      /**
       * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
       * matching the `selector` contains the given `text`, using the
       * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
       * attribute.
       *
       * > Note: This assertion will collapse whitespace in `textContent` before searching.
       * > If you would like to assert on a string that *should* contain line breaks, tabs,
       * > more than one space in a row, or starting/ending whitespace, use the {@link #hasText}
       * > selector and pass your expected text in as a RegEx pattern.
       *
       * **Aliases:** `containsText`, `hasTextContaining`
       *
       * @param {string} text
       * @param {string?} message
       *
       * @example
       * assert.dom('#title').includesText('Welcome');
       *
       * @see {@link #hasText}
       */
      DOMAssertions.prototype.includesText = function (text, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          var collapsedText = collapseWhitespace(element.textContent);
          var result = collapsedText.indexOf(text) !== -1;
          var actual = collapsedText;
          var expected = text;
          if (!message) {
              message = "Element " + this.targetDescription + " has text containing \"" + text + "\"";
          }
          if (!result && text !== collapseWhitespace(text)) {
              console.warn('The `.includesText()`, `.containsText()`, and `.hasTextContaining()` assertions collapse whitespace. The text you are checking for contains whitespace that may have made your test fail incorrectly. Try the `.hasText()` assertion passing in your expected text as a RegExp pattern. Your text:\n' +
                  text);
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      };
      DOMAssertions.prototype.containsText = function (expected, message) {
          this.includesText(expected, message);
      };
      DOMAssertions.prototype.hasTextContaining = function (expected, message) {
          this.includesText(expected, message);
      };
      /**
       * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
       * matching the `selector` does not include the given `text`, using the
       * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
       * attribute.
       *
       * **Aliases:** `doesNotContainText`, `doesNotHaveTextContaining`
       *
       * @param {string} text
       * @param {string?} message
       *
       * @example
       * assert.dom('#title').doesNotIncludeText('Welcome');
       */
      DOMAssertions.prototype.doesNotIncludeText = function (text, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          var collapsedText = collapseWhitespace(element.textContent);
          var result = collapsedText.indexOf(text) === -1;
          var expected = "Element " + this.targetDescription + " does not include text \"" + text + "\"";
          var actual = expected;
          if (!result) {
              actual = "Element " + this.targetDescription + " includes text \"" + text + "\"";
          }
          if (!message) {
              message = expected;
          }
          this.pushResult({ result: result, actual: actual, expected: expected, message: message });
      };
      DOMAssertions.prototype.doesNotContainText = function (unexpected, message) {
          this.doesNotIncludeText(unexpected, message);
      };
      DOMAssertions.prototype.doesNotHaveTextContaining = function (unexpected, message) {
          this.doesNotIncludeText(unexpected, message);
      };
      /**
       * Assert that the `value` property of an {@link HTMLInputElement} matches
       * the `expected` text or regular expression.
       *
       * If no `expected` value is provided, the assertion will fail if the
       * `value` is an empty string.
       *
       * @param {string|RegExp|object?} expected
       * @param {string?} message
       *
       * @example
       * assert.dom('input.username').hasValue('HSimpson');
    
       * @see {@link #hasAnyValue}
       * @see {@link #hasNoValue}
       */
      DOMAssertions.prototype.hasValue = function (expected, message) {
          var element = this.findTargetElement();
          if (!element)
              return;
          if (arguments.length === 0) {
              expected = { any: true };
          }
          var value = element.value;
          if (expected instanceof RegExp) {
              var result = expected.test(value);
              var actual = value;
              if (!message) {
                  message = "Element " + this.targetDescription + " has value matching " + expected;
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
          else if (expected.any === true) {
              var result = Boolean(value);
              var expected_2 = "Element " + this.targetDescription + " has a value";
              var actual = result ? expected_2 : "Element " + this.targetDescription + " has no value";
              if (!message) {
                  message = expected_2;
              }
              this.pushResult({ result: result, actual: actual, expected: expected_2, message: message });
          }
          else {
              var actual = value;
              var result = actual === expected;
              if (!message) {
                  message = "Element " + this.targetDescription + " has value \"" + expected + "\"";
              }
              this.pushResult({ result: result, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * Assert that the `value` property of an {@link HTMLInputElement} is not empty.
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input.username').hasAnyValue();
       *
       * @see {@link #hasValue}
       * @see {@link #hasNoValue}
       */
      DOMAssertions.prototype.hasAnyValue = function (message) {
          this.hasValue({ any: true }, message);
      };
      /**
       * Assert that the `value` property of an {@link HTMLInputElement} is empty.
       *
       * **Aliases:** `lacksValue`
       *
       * @param {string?} message
       *
       * @example
       * assert.dom('input.username').hasNoValue();
       *
       * @see {@link #hasValue}
       * @see {@link #hasAnyValue}
       */
      DOMAssertions.prototype.hasNoValue = function (message) {
          this.hasValue('', message);
      };
      DOMAssertions.prototype.lacksValue = function (message) {
          this.hasNoValue(message);
      };
      /**
       * Assert that the target selector selects only Elements that are also selected by
       * compareSelector.
       *
       * @param {string} compareSelector
       * @param {string?} message
       *
       * @example
       * assert.dom('p.red').matchesSelector('div.wrapper p:last-child')
       */
      DOMAssertions.prototype.matchesSelector = function (compareSelector, message) {
          var targetElements = this.target instanceof Element ? [this.target] : this.findElements();
          var targets = targetElements.length;
          var matchFailures = matchesSelector(targetElements, compareSelector);
          var singleElement = targets === 1;
          var selectedByPart = this.target instanceof Element ? 'passed' : "selected by " + this.target;
          var actual;
          var expected;
          if (matchFailures === 0) {
              // no failures matching.
              if (!message) {
                  message = singleElement
                      ? "The element " + selectedByPart + " also matches the selector " + compareSelector + "."
                      : targets + " elements, selected by " + this.target + ", also match the selector " + compareSelector + ".";
              }
              actual = expected = message;
              this.pushResult({ result: true, actual: actual, expected: expected, message: message });
          }
          else {
              var difference = targets - matchFailures;
              // there were failures when matching.
              if (!message) {
                  message = singleElement
                      ? "The element " + selectedByPart + " did not also match the selector " + compareSelector + "."
                      : matchFailures + " out of " + targets + " elements selected by " + this.target + " did not also match the selector " + compareSelector + ".";
              }
              actual = singleElement ? message : difference + " elements matched " + compareSelector + ".";
              expected = singleElement
                  ? "The element should have matched " + compareSelector + "."
                  : targets + " elements should have matched " + compareSelector + ".";
              this.pushResult({ result: false, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * Assert that the target selector selects only Elements that are not also selected by
       * compareSelector.
       *
       * @param {string} compareSelector
       * @param {string?} message
       *
       * @example
       * assert.dom('input').doesNotMatchSelector('input[disabled]')
       */
      DOMAssertions.prototype.doesNotMatchSelector = function (compareSelector, message) {
          var targetElements = this.target instanceof Element ? [this.target] : this.findElements();
          var targets = targetElements.length;
          var matchFailures = matchesSelector(targetElements, compareSelector);
          var singleElement = targets === 1;
          var selectedByPart = this.target instanceof Element ? 'passed' : "selected by " + this.target;
          var actual;
          var expected;
          if (matchFailures === targets) {
              // the assertion is successful because no element matched the other selector.
              if (!message) {
                  message = singleElement
                      ? "The element " + selectedByPart + " did not also match the selector " + compareSelector + "."
                      : targets + " elements, selected by " + this.target + ", did not also match the selector " + compareSelector + ".";
              }
              actual = expected = message;
              this.pushResult({ result: true, actual: actual, expected: expected, message: message });
          }
          else {
              var difference = targets - matchFailures;
              // the assertion fails because at least one element matched the other selector.
              if (!message) {
                  message = singleElement
                      ? "The element " + selectedByPart + " must not also match the selector " + compareSelector + "."
                      : difference + " elements out of " + targets + ", selected by " + this.target + ", must not also match the selector " + compareSelector + ".";
              }
              actual = singleElement
                  ? "The element " + selectedByPart + " matched " + compareSelector + "."
                  : matchFailures + " elements did not match " + compareSelector + ".";
              expected = singleElement
                  ? message
                  : targets + " elements should not have matched " + compareSelector + ".";
              this.pushResult({ result: false, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * Assert that the tagName of the {@link HTMLElement} or an {@link HTMLElement}
       * matching the `selector` matches the `expected` tagName, using the
       * [`tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
       * property of the {@link HTMLElement}.
       *
       * @param {string} expected
       * @param {string?} message
       *
       * @example
       * // <h1 id="title">
       * //   Title
       * // </h1>
       *
       * assert.dom('#title').hasTagName('h1');
       */
      DOMAssertions.prototype.hasTagName = function (tagName, message) {
          var element = this.findTargetElement();
          var actual;
          var expected;
          if (!element)
              return;
          if (typeof tagName !== 'string') {
              throw new TypeError("You must pass a string to \"hasTagName\". You passed " + tagName + ".");
          }
          actual = element.tagName.toLowerCase();
          expected = tagName.toLowerCase();
          if (actual === expected) {
              if (!message) {
                  message = "Element " + this.targetDescription + " has tagName " + expected;
              }
              this.pushResult({ result: true, actual: actual, expected: expected, message: message });
          }
          else {
              if (!message) {
                  message = "Element " + this.targetDescription + " does not have tagName " + expected;
              }
              this.pushResult({ result: false, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * Assert that the tagName of the {@link HTMLElement} or an {@link HTMLElement}
       * matching the `selector` does not match the `expected` tagName, using the
       * [`tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
       * property of the {@link HTMLElement}.
       *
       * @param {string} expected
       * @param {string?} message
       *
       * @example
       * // <section id="block">
       * //   Title
       * // </section>
       *
       * assert.dom('section#block').doesNotHaveTagName('div');
       */
      DOMAssertions.prototype.doesNotHaveTagName = function (tagName, message) {
          var element = this.findTargetElement();
          var actual;
          var expected;
          if (!element)
              return;
          if (typeof tagName !== 'string') {
              throw new TypeError("You must pass a string to \"doesNotHaveTagName\". You passed " + tagName + ".");
          }
          actual = element.tagName.toLowerCase();
          expected = tagName.toLowerCase();
          if (actual !== expected) {
              if (!message) {
                  message = "Element " + this.targetDescription + " does not have tagName " + expected;
              }
              this.pushResult({ result: true, actual: actual, expected: expected, message: message });
          }
          else {
              if (!message) {
                  message = "Element " + this.targetDescription + " has tagName " + expected;
              }
              this.pushResult({ result: false, actual: actual, expected: expected, message: message });
          }
      };
      /**
       * @private
       */
      DOMAssertions.prototype.pushResult = function (result) {
          this.testContext.pushResult(result);
      };
      /**
       * Finds a valid HTMLElement from target, or pushes a failing assertion if a valid
       * element is not found.
       * @private
       * @returns (HTMLElement|null) a valid HTMLElement, or null
       */
      DOMAssertions.prototype.findTargetElement = function () {
          var el = this.findElement();
          if (el === null) {
              var message = "Element " + (this.target || '<unknown>') + " should exist";
              this.pushResult({ message: message, result: false });
              return null;
          }
          return el;
      };
      /**
       * Finds a valid HTMLElement from target
       * @private
       * @returns (HTMLElement|null) a valid HTMLElement, or null
       * @throws TypeError will be thrown if target is an unrecognized type
       */
      DOMAssertions.prototype.findElement = function () {
          if (this.target === null) {
              return null;
          }
          else if (typeof this.target === 'string') {
              return this.rootElement.querySelector(this.target);
          }
          else if (this.target instanceof Element) {
              return this.target;
          }
          else {
              throw new TypeError("Unexpected Parameter: " + this.target);
          }
      };
      /**
       * Finds a collection of HTMLElement instances from target using querySelectorAll
       * @private
       * @returns (HTMLElement[]) an array of HTMLElement instances
       * @throws TypeError will be thrown if target is an unrecognized type
       */
      DOMAssertions.prototype.findElements = function () {
          if (this.target === null) {
              return [];
          }
          else if (typeof this.target === 'string') {
              return toArray(this.rootElement.querySelectorAll(this.target));
          }
          else {
              throw new TypeError("Unexpected Parameter: " + this.target);
          }
      };
      Object.defineProperty(DOMAssertions.prototype, "targetDescription", {
          /**
           * @private
           */
          get: function () {
              return elementToString(this.target);
          },
          enumerable: true,
          configurable: true
      });
      return DOMAssertions;
  }());

  /* global QUnit */
  QUnit.assert.dom = function (target, rootElement) {
      rootElement = rootElement || this.dom.rootElement || document;
      return new DOMAssertions(target || rootElement, rootElement, this);
  };

}());
//# sourceMappingURL=qunit-dom.js.map
