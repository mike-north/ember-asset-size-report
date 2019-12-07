define('ember-fetch/types', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.isPlainObject = isPlainObject;
    function isPlainObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
});