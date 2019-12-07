define("@ember/-internals/views/lib/system/lookup_partial", ["exports", "@ember/debug", "@ember/error"], function (_exports, _debug, _error) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = lookupPartial;
  _exports.hasPartial = hasPartial;

  function parseUnderscoredName(templateName) {
    var nameParts = templateName.split('/');
    var lastPart = nameParts[nameParts.length - 1];
    nameParts[nameParts.length - 1] = "_" + lastPart;
    return nameParts.join('/');
  }

  function lookupPartial(templateName, owner) {
    if (templateName == null) {
      return;
    }

    var template = templateFor(owner, parseUnderscoredName(templateName), templateName);
    (false && !(Boolean(template)) && (0, _debug.assert)("Unable to find partial with name \"" + templateName + "\"", Boolean(template)));
    return template;
  }

  function hasPartial(name, owner) {
    if (!owner) {
      throw new _error.default('Container was not found when looking up a views template. ' + 'This is most likely due to manually instantiating an Ember.View. ' + 'See: http://git.io/EKPpnA');
    }

    return owner.hasRegistration("template:" + parseUnderscoredName(name)) || owner.hasRegistration("template:" + name);
  }

  function templateFor(owner, underscored, name) {
    if (!name) {
      return;
    }

    (false && !(name.indexOf('.') === -1) && (0, _debug.assert)("templateNames are not allowed to contain periods: " + name, name.indexOf('.') === -1));

    if (!owner) {
      throw new _error.default('Container was not found when looking up a views template. ' + 'This is most likely due to manually instantiating an Ember.View. ' + 'See: http://git.io/EKPpnA');
    }

    return owner.lookup("template:" + underscored) || owner.lookup("template:" + name);
  }
});