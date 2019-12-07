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
        let headersObject = {};
        if (headers) {
            headers.forEach((value, key) => headersObject[key] = value);
        }
        return headersObject;
    }
    exports.default = Ember.Mixin.create({
        headers: undefined,
        init() {
            this._super(...arguments);
            (true && !(false) && Ember.deprecate('FetchAdapter is deprecated, it is no longer required for ember-data>=3.9.2', false, {
                id: 'deprecate-fetch-ember-data-support',
                until: '7.0.0'
            }));
        },
        /**
         * @override
         */
        ajaxOptions(url, type, options) {
            let hash = options || {};
            hash.url = url;
            hash.type = type;
            // Add headers set on the Adapter
            let adapterHeaders = Ember.get(this, 'headers');
            if (adapterHeaders) {
                hash.headers = Ember.assign(hash.headers || {}, adapterHeaders);
            }
            const mungedOptions = (0, _mungOptionsForFetch.default)(hash);
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
        ajax(url, type, options) {
            const requestData = {
                url,
                method: type
            };
            const hash = this.ajaxOptions(url, type, options);
            return this._ajaxRequest(hash)
            // @ts-ignore
            .catch((error, response, requestData) => {
                throw this.ajaxError(this, response, null, requestData, error);
            }).then(response => {
                return Ember.RSVP.hash({
                    response,
                    payload: (0, _determineBodyPromise.default)(response, requestData)
                });
            }).then(({ response, payload }) => {
                if (response.ok) {
                    return this.ajaxSuccess(this, response, payload, requestData);
                } else {
                    throw this.ajaxError(this, response, payload, requestData);
                }
            });
        },
        /**
         * Overrides the `_ajaxRequest` method to use `fetch` instead of jQuery.ajax
         * @override
         */
        _ajaxRequest(options) {
            return this._fetchRequest(options.url, options);
        },
        /**
         * A hook into where `fetch` is called.
         * Useful if you want to override this behavior, for example to multiplex requests.
         */
        _fetchRequest(url, options) {
            return (0, _fetch.default)(url, options);
        },
        /**
         * @override
         */
        ajaxSuccess(adapter, response, payload, requestData) {
            const returnResponse = adapter.handleResponse(response.status, headersToObject(response.headers),
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
        parseFetchResponseForError(response, payload) {
            return payload || response.statusText;
        },
        /**
         * @override
         */
        ajaxError(adapter, response, payload, requestData, error) {
            if (error) {
                return error;
            } else {
                const parsedResponse = adapter.parseFetchResponseForError(response, payload);
                return adapter.handleResponse(response.status, headersToObject(response.headers),
                // TODO: parseErrorResponse is DS.RESTAdapter private API
                // @ts-ignore
                adapter.parseErrorResponse(parsedResponse) || payload, requestData);
            }
        }
    });
});