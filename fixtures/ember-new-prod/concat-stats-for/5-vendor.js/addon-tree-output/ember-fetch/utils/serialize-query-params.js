define('ember-fetch/utils/serialize-query-params', ['exports', 'ember-fetch/types'], function (exports, _types) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.serializeQueryParams = serializeQueryParams;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var RBRACKET = /\[\]$/;
    /**
     * Helper function that turns the data/body of a request into a query param string.
     * This is directly copied from jQuery.param.
     */
    function serializeQueryParams(queryParamsObject) {
        var s = [];
        function buildParams(prefix, obj) {
            var i, len, key;
            if (prefix) {
                if (Array.isArray(obj)) {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (RBRACKET.test(prefix)) {
                            add(s, prefix, obj[i]);
                        } else {
                            buildParams(prefix + '[' + (_typeof(obj[i]) === 'object' ? i : '') + ']', obj[i]);
                        }
                    }
                } else if ((0, _types.isPlainObject)(obj)) {
                    for (key in obj) {
                        buildParams(prefix + '[' + key + ']', obj[key]);
                    }
                } else {
                    add(s, prefix, obj);
                }
            } else if (Array.isArray(obj)) {
                for (i = 0, len = obj.length; i < len; i++) {
                    add(s, obj[i].name, obj[i].value);
                }
            } else {
                for (key in obj) {
                    buildParams(key, obj[key]);
                }
            }
            return s;
        }
        return buildParams('', queryParamsObject).join('&').replace(/%20/g, '+');
    }
    /**
     * Part of the `serializeQueryParams` helper function.
     */
    function add(s, k, v) {
        // Strip out keys with undefined value and replace null values with
        // empty strings (mimics jQuery.ajax)
        if (v === undefined) {
            return;
        } else if (v === null) {
            v = '';
        }
        v = typeof v === 'function' ? v() : v;
        s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }
    exports.default = serializeQueryParams;
});