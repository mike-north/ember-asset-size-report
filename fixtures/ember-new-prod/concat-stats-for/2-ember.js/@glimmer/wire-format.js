define("@glimmer/wire-format", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.is = is;
  _exports.isAttribute = isAttribute;
  _exports.isArgument = isArgument;
  _exports.isMaybeLocal = _exports.isGet = _exports.isFlushElement = _exports.Ops = void 0;
  var Opcodes;
  _exports.Ops = Opcodes;

  (function (Opcodes) {
    // Statements
    Opcodes[Opcodes["Text"] = 0] = "Text";
    Opcodes[Opcodes["Append"] = 1] = "Append";
    Opcodes[Opcodes["Comment"] = 2] = "Comment";
    Opcodes[Opcodes["Modifier"] = 3] = "Modifier";
    Opcodes[Opcodes["Block"] = 4] = "Block";
    Opcodes[Opcodes["Component"] = 5] = "Component";
    Opcodes[Opcodes["DynamicComponent"] = 6] = "DynamicComponent";
    Opcodes[Opcodes["OpenElement"] = 7] = "OpenElement";
    Opcodes[Opcodes["FlushElement"] = 8] = "FlushElement";
    Opcodes[Opcodes["CloseElement"] = 9] = "CloseElement";
    Opcodes[Opcodes["StaticAttr"] = 10] = "StaticAttr";
    Opcodes[Opcodes["DynamicAttr"] = 11] = "DynamicAttr";
    Opcodes[Opcodes["ComponentAttr"] = 12] = "ComponentAttr";
    Opcodes[Opcodes["AttrSplat"] = 13] = "AttrSplat";
    Opcodes[Opcodes["Yield"] = 14] = "Yield";
    Opcodes[Opcodes["Partial"] = 15] = "Partial";
    Opcodes[Opcodes["DynamicArg"] = 16] = "DynamicArg";
    Opcodes[Opcodes["StaticArg"] = 17] = "StaticArg";
    Opcodes[Opcodes["TrustingAttr"] = 18] = "TrustingAttr";
    Opcodes[Opcodes["TrustingComponentAttr"] = 19] = "TrustingComponentAttr";
    Opcodes[Opcodes["Debugger"] = 20] = "Debugger";
    Opcodes[Opcodes["ClientSideStatement"] = 21] = "ClientSideStatement"; // Expressions

    Opcodes[Opcodes["Unknown"] = 22] = "Unknown";
    Opcodes[Opcodes["Get"] = 23] = "Get";
    Opcodes[Opcodes["MaybeLocal"] = 24] = "MaybeLocal";
    Opcodes[Opcodes["HasBlock"] = 25] = "HasBlock";
    Opcodes[Opcodes["HasBlockParams"] = 26] = "HasBlockParams";
    Opcodes[Opcodes["Undefined"] = 27] = "Undefined";
    Opcodes[Opcodes["Helper"] = 28] = "Helper";
    Opcodes[Opcodes["Concat"] = 29] = "Concat";
    Opcodes[Opcodes["ClientSideExpression"] = 30] = "ClientSideExpression";
  })(Opcodes || (_exports.Ops = Opcodes = {}));

  function is(variant) {
    return function (value) {
      return Array.isArray(value) && value[0] === variant;
    };
  } // Statements


  var isFlushElement = is(Opcodes.FlushElement);
  _exports.isFlushElement = isFlushElement;

  function isAttribute(val) {
    return val[0] === Opcodes.StaticAttr || val[0] === Opcodes.DynamicAttr || val[0] === Opcodes.ComponentAttr || val[0] === Opcodes.TrustingAttr || val[0] === Opcodes.TrustingComponentAttr || val[0] === Opcodes.AttrSplat || val[0] === Opcodes.Modifier;
  }

  function isArgument(val) {
    return val[0] === Opcodes.StaticArg || val[0] === Opcodes.DynamicArg;
  } // Expressions


  var isGet = is(Opcodes.Get);
  _exports.isGet = isGet;
  var isMaybeLocal = is(Opcodes.MaybeLocal);
  _exports.isMaybeLocal = isMaybeLocal;
});