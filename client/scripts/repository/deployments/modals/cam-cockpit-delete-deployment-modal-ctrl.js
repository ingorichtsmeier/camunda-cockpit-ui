/* global define: false, require: false */
define([
  'angular'
], function(
  angular
) {
  'use strict';

  return [
    '$scope',
    '$q',
    'camAPI',
    'Notifications',
    'deploymentsListData',
    'deployment',
  function(
    $scope,
    $q,
    camAPI,
    Notifications,
    deploymentsListData,
    deployment
  ) {

    var Deployment = camAPI.resource('deployment');
    var ProcessInstance = camAPI.resource('process-instance');
    var CaseInstance = camAPI.resource('case-instance');

    var deploymentData = deploymentsListData.newChild($scope);

    var options = $scope.options = {
      cascade: false,
      skipCustomListeners: true
    };

    $scope.deployment = deployment;
    $scope.status;


    // provide /////////////////////////////////////////////////////////

    deploymentData.provide('processInstanceCount', function() {
      var deferred = $q.defer();

      ProcessInstance.count({
        deploymentId: deployment.id
      }, function(err, res) {

        if (err) {
          // reject error but do not handle the error
          return deferred.reject(err);
        }

        deferred.resolve(res.count);

      });

      return deferred.promise;
    });

    deploymentData.provide('caseInstanceCount', function() {
      var deferred = $q.defer();

      CaseInstance.count({
        deploymentId: deployment.id
      }, function(err, res) {

        if (err) {
          // reject error but do not handle the error
          // it can happen that the case engine is disabled,
          // so that an error should be received. In that
          // case it should still be possible to delete
          // the deployment.
          return deferred.reject(err);
        }

        deferred.resolve(res.count);

      });

      return deferred.promise;
    });


    // observe /////////////////////////////////////////////////////////

    $scope.processInstanceCountState = deploymentData.observe('processInstanceCount', function(count) {
      $scope.processInstanceCount = count;
    });

    $scope.caseInstanceCountState = deploymentData.observe('caseInstanceCount', function(count) {
      $scope.caseInstanceCount = count;
    });

    // delete deployment ///////////////////////////////////////////////

    $scope.countsLoaded = function() {
      return ($scope.processInstanceCountState && ($scope.processInstanceCountState.$loaded || $scope.processInstanceCountState.$error))
          && ($scope.caseInstanceCountState && ($scope.caseInstanceCountState.$loaded || $scope.caseInstanceCountState.$error));
    };

    var hasInstances = $scope.hasInstances = function() {
      return $scope.processInstanceCount > 0 || $scope.caseInstanceCount > 0;
    };

    $scope.canDeleteDeployment = function() {
      return !options.cascade && hasInstances() ? false : true;
    };

    $scope.getInfoSnippet = function() {
      var info = [ 'There are' ];

      if ($scope.processInstanceCount > 0) {
        info.push($scope.processInstanceCount);
        info.push('running process');
        $scope.processInstanceCount > 1 ? info.push('instances') : info.push('instance');
      }

      if ($scope.processInstanceCount > 0 && $scope.caseInstanceCount > 0) {
        info.push('and');
      }

      if ($scope.caseInstanceCount > 0) {
        info.push($scope.caseInstanceCount);
        info.push('open case');
        $scope.caseInstanceCount > 1 ? info.push('instances') : info.push('instance');
      }

      info.push('which belong to this deployment.')
      info = info.join(' ');

      return info;
    }

    $scope.deleteDeployment = function() {
      $scope.status = 'PERFORM_DELETE';

      Deployment.delete(deployment.id, options, function(err) {

        $scope.status = null;

        if (err) {
          return Notifications.addError({
            status: 'Finished',
            message: 'Could not delete deployment: ' + err.message,
            exclusive: true
          });
        }

        $scope.$close();

      });
    };

  }];

});
