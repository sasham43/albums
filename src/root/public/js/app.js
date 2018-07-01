angular.module('AlbumApp', [])
.config(function($locationProvider){
    $locationProvider.html5Mode({
      enabled: true,
      rewriteLinks: 'internal-link'
      // requireBase: false
    });

    // $routeProvider
    //   .when('/', {
    //     controller: 'GalleryController',
    //     templateUrl: '/partials/gallery.html'
    //   })
    //   .when('/rate', {
    //     controller: 'RateController',
    //     templateUrl: '/partials/rate.html'
    //   })
})
.factory('UserFactory', function($http){
    return {
        getUser: ()=>{
            return $http.get('/api/users')
        }
    }
})
.controller('AlbumController', function($scope, UserFactory){
    console.log('loaded');

    UserFactory.getUser().then((data)=>{
        console.log('user', data);
    }).catch((err)=>{
        console.log('failed to get user', err);
    })
})
