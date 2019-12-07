define("@ember/engine/lib/engine-parent", ["exports", "@ember/-internals/utils"], function (_exports, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getEngineParent = getEngineParent;
  _exports.setEngineParent = setEngineParent;

  /**
  @module @ember/engine
  */
  var ENGINE_PARENT = (0, _utils.symbol)('ENGINE_PARENT');
  /**
    `getEngineParent` retrieves an engine instance's parent instance.
  
    @method getEngineParent
    @param {EngineInstance} engine An engine instance.
    @return {EngineInstance} The parent engine instance.
    @for @ember/engine
    @static
    @private
  */

  function getEngineParent(engine) {
    return engine[ENGINE_PARENT];
  }
  /**
    `setEngineParent` sets an engine instance's parent instance.
  
    @method setEngineParent
    @param {EngineInstance} engine An engine instance.
    @param {EngineInstance} parent The parent engine instance.
    @private
  */


  function setEngineParent(engine, parent) {
    engine[ENGINE_PARENT] = parent;
  }
});