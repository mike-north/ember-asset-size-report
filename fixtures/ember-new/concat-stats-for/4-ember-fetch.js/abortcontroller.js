(function () {
  'use strict';

  class Emitter {
    constructor() {
      Object.defineProperty(this, 'listeners', { value: {}, writable: true, configurable: true });
    }
    addEventListener(type, callback) {
      if (!(type in this.listeners)) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(callback);
    }
    removeEventListener(type, callback) {
      if (!(type in this.listeners)) {
        return;
      }
      const stack = this.listeners[type];
      for (let i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return;
        }
      }
    }
    dispatchEvent(event) {
      if (!(event.type in this.listeners)) {
        return;
      }
      const debounce = callback => {
        setTimeout(() => callback.call(this, event));
      };
      const stack = this.listeners[event.type];
      for (let i = 0, l = stack.length; i < l; i++) {
        debounce(stack[i]);
      }
      return !event.defaultPrevented;
    }
  }

  class AbortSignal extends Emitter {
    constructor() {
      super();
      // Some versions of babel does not transpile super() correctly for IE <= 10, if the parent
      // constructor has failed to run, then "this.listeners" will still be undefined and then we call
      // the parent constructor directly instead as a workaround. For general details, see babel bug:
      // https://github.com/babel/babel/issues/3041
      // This hack was added as a fix for the issue described here:
      // https://github.com/Financial-Times/polyfill-library/pull/59#issuecomment-477558042
      if (!this.listeners) {
        Emitter.call(this);
      }

      // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
      // we want Object.keys(new AbortController().signal) to be [] for compat with the native impl
      Object.defineProperty(this, 'aborted', { value: false, writable: true, configurable: true });
      Object.defineProperty(this, 'onabort', { value: null, writable: true, configurable: true });
    }
    toString() {
      return '[object AbortSignal]';
    }
    dispatchEvent(event) {
      if (event.type === 'abort') {
        this.aborted = true;
        if (typeof this.onabort === 'function') {
          this.onabort.call(this, event);
        }
      }

      super.dispatchEvent(event);
    }
  }

  class AbortController {
    constructor() {
      // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
      // we want Object.keys(new AbortController()) to be [] for compat with the native impl
      Object.defineProperty(this, 'signal', { value: new AbortSignal(), writable: true, configurable: true });
    }
    abort() {
      let event;
      try {
        event = new Event('abort');
      } catch (e) {
        if (typeof document !== 'undefined') {
          if (!document.createEvent) {
            // For Internet Explorer 8:
            event = document.createEventObject();
            event.type = 'abort';
          } else {
            // For Internet Explorer 11:
            event = document.createEvent('Event');
            event.initEvent('abort', false, false);
          }
        } else {
          // Fallback where document isn't available:
          event = {
            type: 'abort',
            bubbles: false,
            cancelable: false
          };
        }
      }
      this.signal.dispatchEvent(event);
    }
    toString() {
      return '[object AbortController]';
    }
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    // These are necessary to make sure that we get correct output for:
    // Object.prototype.toString.call(new AbortController())
    AbortController.prototype[Symbol.toStringTag] = 'AbortController';
    AbortSignal.prototype[Symbol.toStringTag] = 'AbortSignal';
  }

  function polyfillNeeded(self) {
    if (self.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
      console.log('__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill');
      return true;
    }

    // Note that the "unfetch" minimal fetch polyfill defines fetch() without
    // defining window.Request, and this polyfill need to work on top of unfetch
    // so the below feature detection needs the !self.AbortController part.
    // The Request.prototype check is also needed because Safari versions 11.1.2
    // up to and including 12.1.x has a window.AbortController present but still
    // does NOT correctly implement abortable fetch:
    // https://bugs.webkit.org/show_bug.cgi?id=174980#c2
    return (typeof(self.Request) === 'function' && !self.Request.prototype.hasOwnProperty('signal')) || !self.AbortController;
  }

  (function(self) {

    if (!polyfillNeeded(self)) {
      return;
    }

    self.AbortController = AbortController;
    self.AbortSignal = AbortSignal;

  })(typeof self !== 'undefined' ? self : global);

}());
