'use strict';

/**
 * Service responsible for handling view based authorization
 * @name permission.permAuthorization
 *
 * @param $q {Object} Angular promise implementation
 */
function permAuthorization($q) {
  'ngInject';

  this.authorize = authorize;

  /**
   * Handles authorization based on provided permissions map
   * @methodOf permission.permAuthorization
   *
   * @param map {permission.PermissionMap} Map of permission names
   *
   * @returns {promise} $q.promise object
   */
  function authorize(map) {
    return authorizePermissionMap(map);
  }

  /**
   * Checks authorization for simple view based access
   * @methodOf permission.permAuthorization
   * @private
   *
   * @param map {permission.PermissionMap} Access rights map
   *
   * @returns {promise} $q.promise object
   */
  function authorizePermissionMap(map) {
    var deferred = $q.defer();

    resolveExceptPrivilegeMap(deferred, map);

    return deferred.promise;
  }

  /**
   * Resolves flat set of "except" privileges
   * @methodOf permission.permAuthorization
   * @private
   *
   * @param deferred {Object} Promise defer
   * @param map {permission.PermissionMap} Access rights map
   *
   * @returns {Promise} $q.promise object
   */
  function resolveExceptPrivilegeMap(deferred, map) {
    var exceptPromises = map.resolvePropertyValidity(map.except);

    $q.any(exceptPromises)
      .then(function (rejectedPermissions) {
        deferred.reject(rejectedPermissions);
      })
      .catch(function () {
        resolveOnlyPermissionMap(deferred, map);
      });
  }

  /**
   * Resolves flat set of "only" privileges
   * @methodOf permission.permAuthorization
   * @private
   *
   * @param deferred {Object} Promise defer
   * @param map {permission.PermissionMap} Access rights map
   */
  function resolveOnlyPermissionMap(deferred, map) {
    if (!map.only.length) {
      deferred.resolve();
      return;
    }

    var onlyPromises = map.resolvePropertyValidity(map.only);
    $q.any(onlyPromises)
      .then(function (resolvedPermissions) {
        deferred.resolve(resolvedPermissions);
      })
      .catch(function (rejectedPermission) {
        deferred.reject(rejectedPermission);
      });
  }
}

angular
  .module('permission')
  .service('permAuthorization', permAuthorization);
