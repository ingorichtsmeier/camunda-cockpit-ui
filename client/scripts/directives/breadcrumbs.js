/* global require: false */
/* jshint unused: false */
define([
  'angular',
  'text!./breadcrumbs.html'
],
function(angular, template) {
  'use strict';

  return ['$location', 'routeUtil', function ($location, routeUtil) {
    return {
      scope: {
        divider: '@'
      },

      restrict: 'A',

      template: template,

      link: function(scope) {
        // event triggered by the breadcrumbs service when the breadcrumbs are alterated
        scope.$on('page.breadcrumbs.changed', function(ev, breadcrumbs) {
          scope.breadcrumbs = breadcrumbs;
        });

        scope.getHref = function (crumb) {
          return routeUtil.redirectTo(crumb.href, $location.search(), crumb.keepSearchParams);
        };

      },

      controller: [
        '$scope',
        'page',
      function(
        $scope,
        page
      ) {
        // initialize the $scope breadcrumbs from the service
        $scope.breadcrumbs = page.breadcrumbsGet();
      }]
    };
  }];

});
