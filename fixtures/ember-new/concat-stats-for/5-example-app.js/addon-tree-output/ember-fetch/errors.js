define('ember-fetch/errors', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isUnauthorizedResponse = isUnauthorizedResponse;
  exports.isForbiddenResponse = isForbiddenResponse;
  exports.isInvalidResponse = isInvalidResponse;
  exports.isBadRequestResponse = isBadRequestResponse;
  exports.isNotFoundResponse = isNotFoundResponse;
  exports.isGoneResponse = isGoneResponse;
  exports.isAbortError = isAbortError;
  exports.isConflictResponse = isConflictResponse;
  exports.isServerErrorResponse = isServerErrorResponse;
  /**
   * Checks if the given response represents an unauthorized request error
   */
  function isUnauthorizedResponse(response) {
    return response.status === 401;
  }
  /**
   * Checks if the given response represents a forbidden request error
   */
  function isForbiddenResponse(response) {
    return response.status === 403;
  }
  /**
   * Checks if the given response represents an invalid request error
   */
  function isInvalidResponse(response) {
    return response.status === 422;
  }
  /**
   * Checks if the given response represents a bad request error
   */
  function isBadRequestResponse(response) {
    return response.status === 400;
  }
  /**
   * Checks if the given response represents a "not found" error
   */
  function isNotFoundResponse(response) {
    return response.status === 404;
  }
  /**
   * Checks if the given response represents a "gone" error
   */
  function isGoneResponse(response) {
    return response.status === 410;
  }
  /**
   * Checks if the given error is an "abort" error
   */
  function isAbortError(error) {
    return error.name == 'AbortError';
  }
  /**
   * Checks if the given response represents a conflict error
   */
  function isConflictResponse(response) {
    return response.status === 409;
  }
  /**
   * Checks if the given response represents a server error
   */
  function isServerErrorResponse(response) {
    return response.status >= 500 && response.status < 600;
  }
});