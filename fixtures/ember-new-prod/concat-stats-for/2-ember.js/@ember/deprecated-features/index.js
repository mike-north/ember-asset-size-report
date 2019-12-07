define("@ember/deprecated-features/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.MOUSE_ENTER_LEAVE_MOVE_EVENTS = _exports.FUNCTION_PROTOTYPE_EXTENSIONS = _exports.APP_CTRL_ROUTER_PROPS = _exports.ALIAS_METHOD = _exports.JQUERY_INTEGRATION = _exports.COMPONENT_MANAGER_STRING_LOOKUP = _exports.ROUTER_EVENTS = _exports.MERGE = _exports.LOGGER = _exports.EMBER_EXTEND_PROTOTYPES = _exports.SEND_ACTION = void 0;

  /* eslint-disable no-implicit-coercion */
  // These versions should be the version that the deprecation was _introduced_,
  // not the version that the feature will be removed.
  var SEND_ACTION = !!'3.4.0';
  _exports.SEND_ACTION = SEND_ACTION;
  var EMBER_EXTEND_PROTOTYPES = !!'3.2.0-beta.5';
  _exports.EMBER_EXTEND_PROTOTYPES = EMBER_EXTEND_PROTOTYPES;
  var LOGGER = !!'3.2.0-beta.1';
  _exports.LOGGER = LOGGER;
  var MERGE = !!'3.6.0-beta.1';
  _exports.MERGE = MERGE;
  var ROUTER_EVENTS = !!'4.0.0';
  _exports.ROUTER_EVENTS = ROUTER_EVENTS;
  var COMPONENT_MANAGER_STRING_LOOKUP = !!'3.8.0';
  _exports.COMPONENT_MANAGER_STRING_LOOKUP = COMPONENT_MANAGER_STRING_LOOKUP;
  var JQUERY_INTEGRATION = !!'3.9.0';
  _exports.JQUERY_INTEGRATION = JQUERY_INTEGRATION;
  var ALIAS_METHOD = !!'3.9.0';
  _exports.ALIAS_METHOD = ALIAS_METHOD;
  var APP_CTRL_ROUTER_PROPS = !!'3.10.0-beta.1';
  _exports.APP_CTRL_ROUTER_PROPS = APP_CTRL_ROUTER_PROPS;
  var FUNCTION_PROTOTYPE_EXTENSIONS = !!'3.11.0-beta.1';
  _exports.FUNCTION_PROTOTYPE_EXTENSIONS = FUNCTION_PROTOTYPE_EXTENSIONS;
  var MOUSE_ENTER_LEAVE_MOVE_EVENTS = !!'3.13.0-beta.1';
  _exports.MOUSE_ENTER_LEAVE_MOVE_EVENTS = MOUSE_ENTER_LEAVE_MOVE_EVENTS;
});