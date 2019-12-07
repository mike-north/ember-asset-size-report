define('ember-fetch/ajax', ['exports', 'fetch'], function (exports, _fetch) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = ajax;
    function ajax(input, init) {
        return (0, _fetch.default)(input, init).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw response;
        });
    }
});