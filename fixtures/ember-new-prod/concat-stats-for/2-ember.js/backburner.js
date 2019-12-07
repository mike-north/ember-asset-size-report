define("backburner", ["exports", "ember-babel"], function (_exports, _emberBabel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.buildPlatform = buildPlatform;
  _exports.default = void 0;
  var SET_TIMEOUT = setTimeout;

  var NOOP = function NOOP() {};

  function buildNext(flush) {
    // Using "promises first" here to:
    //
    // 1) Ensure more consistent experience on browsers that
    //    have differently queued microtasks (separate queues for
    //    MutationObserver vs Promises).
    // 2) Ensure better debugging experiences (it shows up in Chrome
    //    call stack as "Promise.then (async)") which is more consistent
    //    with user expectations
    //
    // When Promise is unavailable use MutationObserver (mostly so that we
    // still get microtasks on IE11), and when neither MutationObserver and
    // Promise are present use a plain old setTimeout.
    if (typeof Promise === 'function') {
      var autorunPromise = Promise.resolve();
      return function () {
        return autorunPromise.then(flush);
      };
    } else if (typeof MutationObserver === 'function') {
      var iterations = 0;
      var observer = new MutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, {
        characterData: true
      });
      return function () {
        iterations = ++iterations % 2;
        node.data = '' + iterations;
        return iterations;
      };
    } else {
      return function () {
        return SET_TIMEOUT(flush, 0);
      };
    }
  }

  function buildPlatform(flush) {
    var clearNext = NOOP;
    return {
      setTimeout: function (_setTimeout) {
        function setTimeout(_x, _x2) {
          return _setTimeout.apply(this, arguments);
        }

        setTimeout.toString = function () {
          return _setTimeout.toString();
        };

        return setTimeout;
      }(function (fn, ms) {
        return setTimeout(fn, ms);
      }),
      clearTimeout: function (_clearTimeout) {
        function clearTimeout(_x3) {
          return _clearTimeout.apply(this, arguments);
        }

        clearTimeout.toString = function () {
          return _clearTimeout.toString();
        };

        return clearTimeout;
      }(function (timerId) {
        return clearTimeout(timerId);
      }),
      now: function now() {
        return Date.now();
      },
      next: buildNext(flush),
      clearNext: clearNext
    };
  }

  var NUMBER = /\d+/;
  var TIMERS_OFFSET = 6;

  function isCoercableNumber(suspect) {
    var type = typeof suspect;
    return type === 'number' && suspect === suspect || type === 'string' && NUMBER.test(suspect);
  }

  function getOnError(options) {
    return options.onError || options.onErrorTarget && options.onErrorTarget[options.onErrorMethod];
  }

  function findItem(target, method, collection) {
    var index = -1;

    for (var i = 0, l = collection.length; i < l; i += 4) {
      if (collection[i] === target && collection[i + 1] === method) {
        index = i;
        break;
      }
    }

    return index;
  }

  function findTimerItem(target, method, collection) {
    var index = -1;

    for (var i = 2, l = collection.length; i < l; i += 6) {
      if (collection[i] === target && collection[i + 1] === method) {
        index = i - 2;
        break;
      }
    }

    return index;
  }

  function getQueueItems(items, queueItemLength, queueItemPositionOffset) {
    if (queueItemPositionOffset === void 0) {
      queueItemPositionOffset = 0;
    }

    var queueItems = [];

    for (var i = 0; i < items.length; i += queueItemLength) {
      var maybeError = items[i + 3
      /* stack */
      + queueItemPositionOffset];
      var queueItem = {
        target: items[i + 0
        /* target */
        + queueItemPositionOffset],
        method: items[i + 1
        /* method */
        + queueItemPositionOffset],
        args: items[i + 2
        /* args */
        + queueItemPositionOffset],
        stack: maybeError !== undefined && 'stack' in maybeError ? maybeError.stack : ''
      };
      queueItems.push(queueItem);
    }

    return queueItems;
  }

  function binarySearch(time, timers) {
    var start = 0;
    var end = timers.length - TIMERS_OFFSET;
    var middle;
    var l;

    while (start < end) {
      // since timers is an array of pairs 'l' will always
      // be an integer
      l = (end - start) / TIMERS_OFFSET; // compensate for the index in case even number
      // of pairs inside timers

      middle = start + l - l % TIMERS_OFFSET;

      if (time >= timers[middle]) {
        start = middle + TIMERS_OFFSET;
      } else {
        end = middle;
      }
    }

    return time >= timers[start] ? start + TIMERS_OFFSET : start;
  }

  var QUEUE_ITEM_LENGTH = 4;

  var Queue =
  /*#__PURE__*/
  function () {
    function Queue(name, options, globalOptions) {
      if (options === void 0) {
        options = {};
      }

      if (globalOptions === void 0) {
        globalOptions = {};
      }

      this._queueBeingFlushed = [];
      this.targetQueues = new Map();
      this.index = 0;
      this._queue = [];
      this.name = name;
      this.options = options;
      this.globalOptions = globalOptions;
    }

    var _proto = Queue.prototype;

    _proto.stackFor = function stackFor(index) {
      if (index < this._queue.length) {
        var entry = this._queue[index * 3 + QUEUE_ITEM_LENGTH];

        if (entry) {
          return entry.stack;
        } else {
          return null;
        }
      }
    };

    _proto.flush = function flush(sync) {
      var _this$options = this.options,
          before = _this$options.before,
          after = _this$options.after;
      var target;
      var method;
      var args;
      var errorRecordedForStack;
      this.targetQueues.clear();

      if (this._queueBeingFlushed.length === 0) {
        this._queueBeingFlushed = this._queue;
        this._queue = [];
      }

      if (before !== undefined) {
        before();
      }

      var invoke;
      var queueItems = this._queueBeingFlushed;

      if (queueItems.length > 0) {
        var onError = getOnError(this.globalOptions);
        invoke = onError ? this.invokeWithOnError : this.invoke;

        for (var i = this.index; i < queueItems.length; i += QUEUE_ITEM_LENGTH) {
          this.index += QUEUE_ITEM_LENGTH;
          method = queueItems[i + 1]; // method could have been nullified / canceled during flush

          if (method !== null) {
            //
            //    ** Attention intrepid developer **
            //
            //    To find out the stack of this task when it was scheduled onto
            //    the run loop, add the following to your app.js:
            //
            //    Ember.run.backburner.DEBUG = true; // NOTE: This slows your app, don't leave it on in production.
            //
            //    Once that is in place, when you are at a breakpoint and navigate
            //    here in the stack explorer, you can look at `errorRecordedForStack.stack`,
            //    which will be the captured stack when this job was scheduled.
            //
            //    One possible long-term solution is the following Chrome issue:
            //       https://bugs.chromium.org/p/chromium/issues/detail?id=332624
            //
            target = queueItems[i];
            args = queueItems[i + 2];
            errorRecordedForStack = queueItems[i + 3]; // Debugging assistance

            invoke(target, method, args, onError, errorRecordedForStack);
          }

          if (this.index !== this._queueBeingFlushed.length && this.globalOptions.mustYield && this.globalOptions.mustYield()) {
            return 1
            /* Pause */
            ;
          }
        }
      }

      if (after !== undefined) {
        after();
      }

      this._queueBeingFlushed.length = 0;
      this.index = 0;

      if (sync !== false && this._queue.length > 0) {
        // check if new items have been added
        this.flush(true);
      }
    };

    _proto.hasWork = function hasWork() {
      return this._queueBeingFlushed.length > 0 || this._queue.length > 0;
    };

    _proto.cancel = function cancel(_ref) {
      var target = _ref.target,
          method = _ref.method;
      var queue = this._queue;
      var targetQueueMap = this.targetQueues.get(target);

      if (targetQueueMap !== undefined) {
        targetQueueMap.delete(method);
      }

      var index = findItem(target, method, queue);

      if (index > -1) {
        queue.splice(index, QUEUE_ITEM_LENGTH);
        return true;
      } // if not found in current queue
      // could be in the queue that is being flushed


      queue = this._queueBeingFlushed;
      index = findItem(target, method, queue);

      if (index > -1) {
        queue[index + 1] = null;
        return true;
      }

      return false;
    };

    _proto.push = function push(target, method, args, stack) {
      this._queue.push(target, method, args, stack);

      return {
        queue: this,
        target: target,
        method: method
      };
    };

    _proto.pushUnique = function pushUnique(target, method, args, stack) {
      var localQueueMap = this.targetQueues.get(target);

      if (localQueueMap === undefined) {
        localQueueMap = new Map();
        this.targetQueues.set(target, localQueueMap);
      }

      var index = localQueueMap.get(method);

      if (index === undefined) {
        var queueIndex = this._queue.push(target, method, args, stack) - QUEUE_ITEM_LENGTH;
        localQueueMap.set(method, queueIndex);
      } else {
        var queue = this._queue;
        queue[index + 2] = args; // replace args

        queue[index + 3] = stack; // replace stack
      }

      return {
        queue: this,
        target: target,
        method: method
      };
    };

    _proto._getDebugInfo = function _getDebugInfo(debugEnabled) {
      if (debugEnabled) {
        var debugInfo = getQueueItems(this._queue, QUEUE_ITEM_LENGTH);
        return debugInfo;
      }

      return undefined;
    };

    _proto.invoke = function invoke(target, method, args
    /*, onError, errorRecordedForStack */
    ) {
      if (args === undefined) {
        method.call(target);
      } else {
        method.apply(target, args);
      }
    };

    _proto.invokeWithOnError = function invokeWithOnError(target, method, args, onError, errorRecordedForStack) {
      try {
        if (args === undefined) {
          method.call(target);
        } else {
          method.apply(target, args);
        }
      } catch (error) {
        onError(error, errorRecordedForStack);
      }
    };

    return Queue;
  }();

  var DeferredActionQueues =
  /*#__PURE__*/
  function () {
    function DeferredActionQueues(queueNames, options) {
      if (queueNames === void 0) {
        queueNames = [];
      }

      this.queues = {};
      this.queueNameIndex = 0;
      this.queueNames = queueNames;
      queueNames.reduce(function (queues, queueName) {
        queues[queueName] = new Queue(queueName, options[queueName], options);
        return queues;
      }, this.queues);
    }
    /**
     * @method schedule
     * @param {String} queueName
     * @param {Any} target
     * @param {Any} method
     * @param {Any} args
     * @param {Boolean} onceFlag
     * @param {Any} stack
     * @return queue
     */


    var _proto2 = DeferredActionQueues.prototype;

    _proto2.schedule = function schedule(queueName, target, method, args, onceFlag, stack) {
      var queues = this.queues;
      var queue = queues[queueName];

      if (queue === undefined) {
        throw new Error("You attempted to schedule an action in a queue (" + queueName + ") that doesn't exist");
      }

      if (method === undefined || method === null) {
        throw new Error("You attempted to schedule an action in a queue (" + queueName + ") for a method that doesn't exist");
      }

      this.queueNameIndex = 0;

      if (onceFlag) {
        return queue.pushUnique(target, method, args, stack);
      } else {
        return queue.push(target, method, args, stack);
      }
    }
    /**
     * DeferredActionQueues.flush() calls Queue.flush()
     *
     * @method flush
     * @param {Boolean} fromAutorun
     */
    ;

    _proto2.flush = function flush(fromAutorun) {
      if (fromAutorun === void 0) {
        fromAutorun = false;
      }

      var queue;
      var queueName;
      var numberOfQueues = this.queueNames.length;

      while (this.queueNameIndex < numberOfQueues) {
        queueName = this.queueNames[this.queueNameIndex];
        queue = this.queues[queueName];

        if (queue.hasWork() === false) {
          this.queueNameIndex++;

          if (fromAutorun && this.queueNameIndex < numberOfQueues) {
            return 1
            /* Pause */
            ;
          }
        } else {
          if (queue.flush(false
          /* async */
          ) === 1
          /* Pause */
          ) {
              return 1
              /* Pause */
              ;
            }
        }
      }
    }
    /**
     * Returns debug information for the current queues.
     *
     * @method _getDebugInfo
     * @param {Boolean} debugEnabled
     * @returns {IDebugInfo | undefined}
     */
    ;

    _proto2._getDebugInfo = function _getDebugInfo(debugEnabled) {
      if (debugEnabled) {
        var debugInfo = {};
        var queue;
        var queueName;
        var numberOfQueues = this.queueNames.length;
        var i = 0;

        while (i < numberOfQueues) {
          queueName = this.queueNames[i];
          queue = this.queues[queueName];
          debugInfo[queueName] = queue._getDebugInfo(debugEnabled);
          i++;
        }

        return debugInfo;
      }

      return;
    };

    return DeferredActionQueues;
  }();

  function iteratorDrain(fn) {
    var iterator = fn();
    var result = iterator.next();

    while (result.done === false) {
      result.value();
      result = iterator.next();
    }
  }

  var noop = function noop() {};

  var DISABLE_SCHEDULE = Object.freeze([]);

  function parseArgs() {
    var length = arguments.length;
    var args;
    var method;
    var target;

    if (length === 0) {} else if (length === 1) {
      target = null;
      method = arguments[0];
    } else {
      var argsIndex = 2;
      var methodOrTarget = arguments[0];
      var methodOrArgs = arguments[1];
      var type = typeof methodOrArgs;

      if (type === 'function') {
        target = methodOrTarget;
        method = methodOrArgs;
      } else if (methodOrTarget !== null && type === 'string' && methodOrArgs in methodOrTarget) {
        target = methodOrTarget;
        method = target[methodOrArgs];
      } else if (typeof methodOrTarget === 'function') {
        argsIndex = 1;
        target = null;
        method = methodOrTarget;
      }

      if (length > argsIndex) {
        var len = length - argsIndex;
        args = new Array(len);

        for (var i = 0; i < len; i++) {
          args[i] = arguments[i + argsIndex];
        }
      }
    }

    return [target, method, args];
  }

  function parseTimerArgs() {
    var _parseArgs = parseArgs.apply(void 0, arguments),
        target = _parseArgs[0],
        method = _parseArgs[1],
        args = _parseArgs[2];

    var wait = 0;
    var length = args !== undefined ? args.length : 0;

    if (length > 0) {
      var last = args[length - 1];

      if (isCoercableNumber(last)) {
        wait = parseInt(args.pop(), 10);
      }
    }

    return [target, method, args, wait];
  }

  function parseDebounceArgs() {
    var target;
    var method;
    var isImmediate;
    var args;
    var wait;

    if (arguments.length === 2) {
      method = arguments[0];
      wait = arguments[1];
      target = null;
    } else {
      var _parseArgs2 = parseArgs.apply(void 0, arguments);

      target = _parseArgs2[0];
      method = _parseArgs2[1];
      args = _parseArgs2[2];

      if (args === undefined) {
        wait = 0;
      } else {
        wait = args.pop();

        if (!isCoercableNumber(wait)) {
          isImmediate = wait === true;
          wait = args.pop();
        }
      }
    }

    wait = parseInt(wait, 10);
    return [target, method, args, wait, isImmediate];
  }

  var UUID = 0;
  var beginCount = 0;
  var endCount = 0;
  var beginEventCount = 0;
  var endEventCount = 0;
  var runCount = 0;
  var joinCount = 0;
  var deferCount = 0;
  var scheduleCount = 0;
  var scheduleIterableCount = 0;
  var deferOnceCount = 0;
  var scheduleOnceCount = 0;
  var setTimeoutCount = 0;
  var laterCount = 0;
  var throttleCount = 0;
  var debounceCount = 0;
  var cancelTimersCount = 0;
  var cancelCount = 0;
  var autorunsCreatedCount = 0;
  var autorunsCompletedCount = 0;
  var deferredActionQueuesCreatedCount = 0;
  var nestedDeferredActionQueuesCreated = 0;

  var Backburner =
  /*#__PURE__*/
  function () {
    function Backburner(queueNames, options) {
      var _this = this;

      this.DEBUG = false;
      this.currentInstance = null;
      this.instanceStack = [];
      this._eventCallbacks = {
        end: [],
        begin: []
      };
      this._timerTimeoutId = null;
      this._timers = [];
      this._autorun = false;
      this._autorunStack = null;
      this.queueNames = queueNames;
      this.options = options || {};

      if (typeof this.options.defaultQueue === 'string') {
        this._defaultQueue = this.options.defaultQueue;
      } else {
        this._defaultQueue = this.queueNames[0];
      }

      this._onBegin = this.options.onBegin || noop;
      this._onEnd = this.options.onEnd || noop;
      this._boundRunExpiredTimers = this._runExpiredTimers.bind(this);

      this._boundAutorunEnd = function () {
        autorunsCompletedCount++; // if the autorun was already flushed, do nothing

        if (_this._autorun === false) {
          return;
        }

        _this._autorun = false;
        _this._autorunStack = null;

        _this._end(true
        /* fromAutorun */
        );
      };

      var builder = this.options._buildPlatform || buildPlatform;
      this._platform = builder(this._boundAutorunEnd);
    }

    var _proto3 = Backburner.prototype;

    /*
      @method begin
      @return instantiated class DeferredActionQueues
    */
    _proto3.begin = function begin() {
      beginCount++;
      var options = this.options;
      var previousInstance = this.currentInstance;
      var current;

      if (this._autorun !== false) {
        current = previousInstance;

        this._cancelAutorun();
      } else {
        if (previousInstance !== null) {
          nestedDeferredActionQueuesCreated++;
          this.instanceStack.push(previousInstance);
        }

        deferredActionQueuesCreatedCount++;
        current = this.currentInstance = new DeferredActionQueues(this.queueNames, options);
        beginEventCount++;

        this._trigger('begin', current, previousInstance);
      }

      this._onBegin(current, previousInstance);

      return current;
    };

    _proto3.end = function end() {
      endCount++;

      this._end(false);
    };

    _proto3.on = function on(eventName, callback) {
      if (typeof callback !== 'function') {
        throw new TypeError("Callback must be a function");
      }

      var callbacks = this._eventCallbacks[eventName];

      if (callbacks !== undefined) {
        callbacks.push(callback);
      } else {
        throw new TypeError("Cannot on() event " + eventName + " because it does not exist");
      }
    };

    _proto3.off = function off(eventName, callback) {
      var callbacks = this._eventCallbacks[eventName];

      if (!eventName || callbacks === undefined) {
        throw new TypeError("Cannot off() event " + eventName + " because it does not exist");
      }

      var callbackFound = false;

      if (callback) {
        for (var i = 0; i < callbacks.length; i++) {
          if (callbacks[i] === callback) {
            callbackFound = true;
            callbacks.splice(i, 1);
            i--;
          }
        }
      }

      if (!callbackFound) {
        throw new TypeError("Cannot off() callback that does not exist");
      }
    };

    _proto3.run = function run() {
      runCount++;

      var _parseArgs3 = parseArgs.apply(void 0, arguments),
          target = _parseArgs3[0],
          method = _parseArgs3[1],
          args = _parseArgs3[2];

      return this._run(target, method, args);
    };

    _proto3.join = function join() {
      joinCount++;

      var _parseArgs4 = parseArgs.apply(void 0, arguments),
          target = _parseArgs4[0],
          method = _parseArgs4[1],
          args = _parseArgs4[2];

      return this._join(target, method, args);
    }
    /**
     * @deprecated please use schedule instead.
     */
    ;

    _proto3.defer = function defer(queueName, target, method) {
      deferCount++;

      for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        args[_key - 3] = arguments[_key];
      }

      return this.schedule.apply(this, [queueName, target, method].concat(args));
    };

    _proto3.schedule = function schedule(queueName) {
      scheduleCount++;

      for (var _len2 = arguments.length, _args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        _args[_key2 - 1] = arguments[_key2];
      }

      var _parseArgs5 = parseArgs.apply(void 0, _args),
          target = _parseArgs5[0],
          method = _parseArgs5[1],
          args = _parseArgs5[2];

      var stack = this.DEBUG ? new Error() : undefined;
      return this._ensureInstance().schedule(queueName, target, method, args, false, stack);
    }
    /*
      Defer the passed iterable of functions to run inside the specified queue.
         @method scheduleIterable
      @param {String} queueName
      @param {Iterable} an iterable of functions to execute
      @return method result
    */
    ;

    _proto3.scheduleIterable = function scheduleIterable(queueName, iterable) {
      scheduleIterableCount++;
      var stack = this.DEBUG ? new Error() : undefined;
      return this._ensureInstance().schedule(queueName, null, iteratorDrain, [iterable], false, stack);
    }
    /**
     * @deprecated please use scheduleOnce instead.
     */
    ;

    _proto3.deferOnce = function deferOnce(queueName, target, method) {
      deferOnceCount++;

      for (var _len3 = arguments.length, args = new Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
        args[_key3 - 3] = arguments[_key3];
      }

      return this.scheduleOnce.apply(this, [queueName, target, method].concat(args));
    };

    _proto3.scheduleOnce = function scheduleOnce(queueName) {
      scheduleOnceCount++;

      for (var _len4 = arguments.length, _args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        _args[_key4 - 1] = arguments[_key4];
      }

      var _parseArgs6 = parseArgs.apply(void 0, _args),
          target = _parseArgs6[0],
          method = _parseArgs6[1],
          args = _parseArgs6[2];

      var stack = this.DEBUG ? new Error() : undefined;
      return this._ensureInstance().schedule(queueName, target, method, args, true, stack);
    };

    _proto3.setTimeout = function setTimeout() {
      setTimeoutCount++;
      return this.later.apply(this, arguments);
    };

    _proto3.later = function later() {
      laterCount++;

      var _parseTimerArgs = parseTimerArgs.apply(void 0, arguments),
          target = _parseTimerArgs[0],
          method = _parseTimerArgs[1],
          args = _parseTimerArgs[2],
          wait = _parseTimerArgs[3];

      return this._later(target, method, args, wait);
    };

    _proto3.throttle = function throttle() {
      throttleCount++;

      var _parseDebounceArgs = parseDebounceArgs.apply(void 0, arguments),
          target = _parseDebounceArgs[0],
          method = _parseDebounceArgs[1],
          args = _parseDebounceArgs[2],
          wait = _parseDebounceArgs[3],
          _parseDebounceArgs$ = _parseDebounceArgs[4],
          isImmediate = _parseDebounceArgs$ === void 0 ? true : _parseDebounceArgs$;

      var index = findTimerItem(target, method, this._timers);
      var timerId;

      if (index === -1) {
        timerId = this._later(target, method, isImmediate ? DISABLE_SCHEDULE : args, wait);

        if (isImmediate) {
          this._join(target, method, args);
        }
      } else {
        timerId = this._timers[index + 1];
        var argIndex = index + 4;

        if (this._timers[argIndex] !== DISABLE_SCHEDULE) {
          this._timers[argIndex] = args;
        }
      }

      return timerId;
    };

    _proto3.debounce = function debounce() {
      debounceCount++;

      var _parseDebounceArgs2 = parseDebounceArgs.apply(void 0, arguments),
          target = _parseDebounceArgs2[0],
          method = _parseDebounceArgs2[1],
          args = _parseDebounceArgs2[2],
          wait = _parseDebounceArgs2[3],
          _parseDebounceArgs2$ = _parseDebounceArgs2[4],
          isImmediate = _parseDebounceArgs2$ === void 0 ? false : _parseDebounceArgs2$;

      var _timers = this._timers;
      var index = findTimerItem(target, method, _timers);
      var timerId;

      if (index === -1) {
        timerId = this._later(target, method, isImmediate ? DISABLE_SCHEDULE : args, wait);

        if (isImmediate) {
          this._join(target, method, args);
        }
      } else {
        var executeAt = this._platform.now() + wait;
        var argIndex = index + 4;

        if (_timers[argIndex] === DISABLE_SCHEDULE) {
          args = DISABLE_SCHEDULE;
        }

        timerId = _timers[index + 1];
        var i = binarySearch(executeAt, _timers);

        if (index + TIMERS_OFFSET === i) {
          _timers[index] = executeAt;
          _timers[argIndex] = args;
        } else {
          var stack = this._timers[index + 5];

          this._timers.splice(i, 0, executeAt, timerId, target, method, args, stack);

          this._timers.splice(index, TIMERS_OFFSET);
        }

        if (index === 0) {
          this._reinstallTimerTimeout();
        }
      }

      return timerId;
    };

    _proto3.cancelTimers = function cancelTimers() {
      cancelTimersCount++;

      this._clearTimerTimeout();

      this._timers = [];

      this._cancelAutorun();
    };

    _proto3.hasTimers = function hasTimers() {
      return this._timers.length > 0 || this._autorun;
    };

    _proto3.cancel = function cancel(timer) {
      cancelCount++;

      if (timer === null || timer === undefined) {
        return false;
      }

      var timerType = typeof timer;

      if (timerType === 'number') {
        // we're cancelling a setTimeout or throttle or debounce
        return this._cancelLaterTimer(timer);
      } else if (timerType === 'object' && timer.queue && timer.method) {
        // we're cancelling a deferOnce
        return timer.queue.cancel(timer);
      }

      return false;
    };

    _proto3.ensureInstance = function ensureInstance() {
      this._ensureInstance();
    }
    /**
     * Returns debug information related to the current instance of Backburner
     *
     * @method getDebugInfo
     * @returns {Object | undefined} Will return and Object containing debug information if
     * the DEBUG flag is set to true on the current instance of Backburner, else undefined.
     */
    ;

    _proto3.getDebugInfo = function getDebugInfo() {
      var _this2 = this;

      if (this.DEBUG) {
        return {
          autorun: this._autorunStack,
          counters: this.counters,
          timers: getQueueItems(this._timers, TIMERS_OFFSET, 2),
          instanceStack: [this.currentInstance].concat(this.instanceStack).map(function (deferredActionQueue) {
            return deferredActionQueue && deferredActionQueue._getDebugInfo(_this2.DEBUG);
          })
        };
      }

      return undefined;
    };

    _proto3._end = function _end(fromAutorun) {
      var currentInstance = this.currentInstance;
      var nextInstance = null;

      if (currentInstance === null) {
        throw new Error("end called without begin");
      } // Prevent double-finally bug in Safari 6.0.2 and iOS 6
      // This bug appears to be resolved in Safari 6.0.5 and iOS 7


      var finallyAlreadyCalled = false;
      var result;

      try {
        result = currentInstance.flush(fromAutorun);
      } finally {
        if (!finallyAlreadyCalled) {
          finallyAlreadyCalled = true;

          if (result === 1
          /* Pause */
          ) {
              var plannedNextQueue = this.queueNames[currentInstance.queueNameIndex];

              this._scheduleAutorun(plannedNextQueue);
            } else {
            this.currentInstance = null;

            if (this.instanceStack.length > 0) {
              nextInstance = this.instanceStack.pop();
              this.currentInstance = nextInstance;
            }

            this._trigger('end', currentInstance, nextInstance);

            this._onEnd(currentInstance, nextInstance);
          }
        }
      }
    };

    _proto3._join = function _join(target, method, args) {
      if (this.currentInstance === null) {
        return this._run(target, method, args);
      }

      if (target === undefined && args === undefined) {
        return method();
      } else {
        return method.apply(target, args);
      }
    };

    _proto3._run = function _run(target, method, args) {
      var onError = getOnError(this.options);
      this.begin();

      if (onError) {
        try {
          return method.apply(target, args);
        } catch (error) {
          onError(error);
        } finally {
          this.end();
        }
      } else {
        try {
          return method.apply(target, args);
        } finally {
          this.end();
        }
      }
    };

    _proto3._cancelAutorun = function _cancelAutorun() {
      if (this._autorun) {
        this._platform.clearNext();

        this._autorun = false;
        this._autorunStack = null;
      }
    };

    _proto3._later = function _later(target, method, args, wait) {
      var stack = this.DEBUG ? new Error() : undefined;
      var executeAt = this._platform.now() + wait;
      var id = UUID++;

      if (this._timers.length === 0) {
        this._timers.push(executeAt, id, target, method, args, stack);

        this._installTimerTimeout();
      } else {
        // find position to insert
        var i = binarySearch(executeAt, this._timers);

        this._timers.splice(i, 0, executeAt, id, target, method, args, stack); // always reinstall since it could be out of sync


        this._reinstallTimerTimeout();
      }

      return id;
    };

    _proto3._cancelLaterTimer = function _cancelLaterTimer(timer) {
      for (var i = 1; i < this._timers.length; i += TIMERS_OFFSET) {
        if (this._timers[i] === timer) {
          this._timers.splice(i - 1, TIMERS_OFFSET);

          if (i === 1) {
            this._reinstallTimerTimeout();
          }

          return true;
        }
      }

      return false;
    }
    /**
     Trigger an event. Supports up to two arguments. Designed around
     triggering transition events from one run loop instance to the
     next, which requires an argument for the  instance and then
     an argument for the next instance.
        @private
     @method _trigger
     @param {String} eventName
     @param {any} arg1
     @param {any} arg2
     */
    ;

    _proto3._trigger = function _trigger(eventName, arg1, arg2) {
      var callbacks = this._eventCallbacks[eventName];

      if (callbacks !== undefined) {
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i](arg1, arg2);
        }
      }
    };

    _proto3._runExpiredTimers = function _runExpiredTimers() {
      this._timerTimeoutId = null;

      if (this._timers.length > 0) {
        this.begin();

        this._scheduleExpiredTimers();

        this.end();
      }
    };

    _proto3._scheduleExpiredTimers = function _scheduleExpiredTimers() {
      var timers = this._timers;
      var i = 0;
      var l = timers.length;
      var defaultQueue = this._defaultQueue;

      var n = this._platform.now();

      for (; i < l; i += TIMERS_OFFSET) {
        var executeAt = timers[i];

        if (executeAt > n) {
          break;
        }

        var args = timers[i + 4];

        if (args !== DISABLE_SCHEDULE) {
          var target = timers[i + 2];
          var method = timers[i + 3];
          var stack = timers[i + 5];
          this.currentInstance.schedule(defaultQueue, target, method, args, false, stack);
        }
      }

      timers.splice(0, i);

      this._installTimerTimeout();
    };

    _proto3._reinstallTimerTimeout = function _reinstallTimerTimeout() {
      this._clearTimerTimeout();

      this._installTimerTimeout();
    };

    _proto3._clearTimerTimeout = function _clearTimerTimeout() {
      if (this._timerTimeoutId === null) {
        return;
      }

      this._platform.clearTimeout(this._timerTimeoutId);

      this._timerTimeoutId = null;
    };

    _proto3._installTimerTimeout = function _installTimerTimeout() {
      if (this._timers.length === 0) {
        return;
      }

      var minExpiresAt = this._timers[0];

      var n = this._platform.now();

      var wait = Math.max(0, minExpiresAt - n);
      this._timerTimeoutId = this._platform.setTimeout(this._boundRunExpiredTimers, wait);
    };

    _proto3._ensureInstance = function _ensureInstance() {
      var currentInstance = this.currentInstance;

      if (currentInstance === null) {
        this._autorunStack = this.DEBUG ? new Error() : undefined;
        currentInstance = this.begin();

        this._scheduleAutorun(this.queueNames[0]);
      }

      return currentInstance;
    };

    _proto3._scheduleAutorun = function _scheduleAutorun(plannedNextQueue) {
      autorunsCreatedCount++;
      var next = this._platform.next;
      var flush = this.options.flush;

      if (flush) {
        flush(plannedNextQueue, next);
      } else {
        next();
      }

      this._autorun = true;
    };

    (0, _emberBabel.createClass)(Backburner, [{
      key: "counters",
      get: function get() {
        return {
          begin: beginCount,
          end: endCount,
          events: {
            begin: beginEventCount,
            end: endEventCount
          },
          autoruns: {
            created: autorunsCreatedCount,
            completed: autorunsCompletedCount
          },
          run: runCount,
          join: joinCount,
          defer: deferCount,
          schedule: scheduleCount,
          scheduleIterable: scheduleIterableCount,
          deferOnce: deferOnceCount,
          scheduleOnce: scheduleOnceCount,
          setTimeout: setTimeoutCount,
          later: laterCount,
          throttle: throttleCount,
          debounce: debounceCount,
          cancelTimers: cancelTimersCount,
          cancel: cancelCount,
          loops: {
            total: deferredActionQueuesCreatedCount,
            nested: nestedDeferredActionQueuesCreated
          }
        };
      }
    }, {
      key: "defaultQueue",
      get: function get() {
        return this._defaultQueue;
      }
    }]);
    return Backburner;
  }();

  Backburner.Queue = Queue;
  Backburner.buildPlatform = buildPlatform;
  Backburner.buildNext = buildNext;
  var _default = Backburner;
  _exports.default = _default;
});