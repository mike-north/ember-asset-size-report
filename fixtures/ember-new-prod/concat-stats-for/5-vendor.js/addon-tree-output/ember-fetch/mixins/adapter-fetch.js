define('ember-fetch/mixins/adapter-fetch', ['exports', 'fetch', 'ember-fetch/utils/mung-options-for-fetch', 'ember-fetch/utils/determine-body-promise'], function (exports, _fetch, _mungOptionsForFetch, _determineBodyPromise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.headersToObject = headersToObject;

    /**
     * Helper function to create a plain object from the response's Headers.
     * Consumed by the adapter's `handleResponse`.
     */
    function headersToObject(headers) {
        var headersObject = {};
        if (headers) {
            headers.forEach(function (value, key) {
                return headersObject[key] = value;
            });
        }
        return headersObject;
    }
    exports.default = Ember.Mixin.create({
        headers: undefined,
        init: function init() {
            this._super.apply(this, arguments);
            (false && !(false) && Ember.deprecate('FetchAdapter is deprecated, it is no longer required for ember-data>=3.9.2', false, {
                id: 'deprecate-fetch-ember-data-support',
                until: '7.0.0'
            }));
        },

        /**
         * @override
         */
        ajaxOptions: function ajaxOptions(url, type, options) {
            var hash = options || {};
            hash.url = url;
            hash.type = type;
            // Add headers set on the Adapter
            var adapterHeaders = Ember.get(this, 'headers');
            if (adapterHeaders) {
                hash.headers = Ember.assign(hash.headers || {}, adapterHeaders);
            }
            var mungedOptions = (0, _mungOptionsForFetch.default)(hash);
            // Mimics the default behavior in Ember Data's `ajaxOptions`, namely to set the
            // 'Content-Type' header to application/json if it is not a GET request and it has a body.
            if (mungedOptions.method !== 'GET' && mungedOptions.body && (mungedOptions.headers === undefined || !(mungedOptions.headers['Content-Type'] || mungedOptions.headers['content-type']))) {
                mungedOptions.headers = mungedOptions.headers || {};
                mungedOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
            }
            return mungedOptions;
        },

        /**
         * @override
         */
        ajax: function ajax(url, type, options) {
            var _this = this;

            var requestData = {
                url: url,
                method: type
            };
            var hash = this.ajaxOptions(url, type, options);
            return this._ajaxRequest(hash)
            // @ts-ignore
            .catch(function (error, response, requestData) {
                throw _this.ajaxError(_this, response, null, requestData, error);
            }).then(function (response) {
                return Ember.RSVP.hash({
                    response: response,
                    payload: (0, _determineBodyPromise.default)(response, requestData)
                });
            }).then(function (_ref) {
                var response = _ref.response,
                    payload = _ref.payload;

                if (response.ok) {
                    return _this.ajaxSuccess(_this, response, payload, requestData);
                } else {
                    throw _this.ajaxError(_this, response, payload, requestData);
                }
            });
        },

        /**
         * Overrides the `_ajaxRequest` method to use `fetch` instead of jQuery.ajax
         * @override
         */
        _ajaxRequest: function _ajaxRequest(options) {
            return this._fetchRequest(options.url, options);
        },

        /**
         * A hook into where `fetch` is called.
         * Useful if you want to override this behavior, for example to multiplex requests.
         */
        _fetchRequest: function _fetchRequest(url, options) {
            return (0, _fetch.default)(url, options);
        },

        /**
         * @override
         */
        ajaxSuccess: function ajaxSuccess(adapter, response, payload, requestData) {
            var returnResponse = adapter.handleResponse(response.status, headersToObject(response.headers),
            // TODO: DS.RESTAdapter annotates payload: {}
            // @ts-ignore
            payload, requestData);
            // TODO: DS.RESTAdapter annotates response: {}
            // @ts-ignore
            if (returnResponse && returnResponse.isAdapterError) {
                return Ember.RSVP.reject(returnResponse);
            } else {
                return returnResponse;
            }
        },

        /**
         * Allows for the error to be selected from either the
         * response object, or the response data.
         */
        parseFetchResponseForError: function parseFetchResponseForError(response, payload) {
            return payload || response.statusText;
        },

        /**
         * @override
         */
        ajaxError: function ajaxError(adapter, response, payload, requestData, error) {
            if (error) {
                return error;
            } else {
                var parsedResponse = adapter.parseFetchResponseForError(response, payload);
                return adapter.handleResponse(response.status, headersToObject(response.headers),
                // TODO: parseErrorResponse is DS.RESTAdapter private API
                // @ts-ignore
                adapter.parseErrorResponse(parsedResponse) || payload, requestData);
            }
        }
    });
});