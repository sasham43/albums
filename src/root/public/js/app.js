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
.factory('AlbumFactory', function($http){
    return {
        updateAlbums: (user_id)=>{
            return $http.get(`/api/albums/update/${user_id}`);
        }
    }
})
.controller('AlbumController', function($scope, UserFactory, AlbumFactory){
    console.log('loaded');

    UserFactory.getUser().then((user)=>{
        console.log('user', user);
        AlbumFactory.updateAlbums(user.data.id).then((data)=>{
            console.log('albums', data);
        })
    }).catch((err)=>{
        console.log('failed to get user', err);
    })
})
