'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('2048App', [
  'ngRoute', 'underscore',
  'main.controllers', 'main.directives', 'main.services',
  'test.controllers', 'test.directives', 'test.services'
]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'app/main-page/main-page.html',
    controller: 'MainCtrl',
    resolve: {
      prevScore: function(Html5LocalStorageTest) {
        if(Html5LocalStorageTest()) {
          return localStorage.getItem("prev")
        }
      },
      maxScore: function(Html5LocalStorageTest) {

        if(Html5LocalStorageTest()) {
          return localStorage.getItem("max")
        }
      }
    }
  }).when('/test', {
    templateUrl: 'app/test/test-page.html',
    controller: 'TestCtrl',
    resolve: {
      prevScore: function(Html5LocalStorageTest) {
        if(Html5LocalStorageTest()) {
          return localStorage.getItem("prev")
        }
      },
      maxScore: function(Html5LocalStorageTest) {

        if(Html5LocalStorageTest()) {
          return localStorage.getItem("max")
        }
      }
    }
  }).otherwise('/')
}]);
