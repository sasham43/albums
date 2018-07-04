angular.module('AlbumApp', ['angularLoad'])
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
        },
        getToken: ()=>{
            return $http.get('/api/users/token')
        }
    }
})
.factory('AlbumFactory', function($http){
    return {
        updateAlbums: (user_id)=>{
            return $http.get(`/api/albums/update/${user_id}`);
        },
        getAlbums: (user_id)=>{
            return $http.get(`/api/albums/${user_id}`)
        }
    }
})
.controller('AlbumController', function($scope, orderByFilter, UserFactory, AlbumFactory, angularLoad){
    console.log('loaded');
    $scope.user = {};
    $scope.show_album_list = true;

    UserFactory.getUser().then((user)=>{
        console.log('user', user);
        $scope.user = user;
        AlbumFactory.updateAlbums(user.data.id).then((data)=>{
            console.log('albums', data);
        });

        AlbumFactory.getAlbums(user.data.id).then((data)=>{
            console.log('got albums', data);
            $scope.albums = data.data.map(a=>{
                a.images = orderByFilter(a.images, 'width', true)
                return a;
            });
        });
    }).catch((err)=>{
        console.log('failed to get user', err);
    })

    $scope.addTracks = function(){
        AlbumFactory.updateAlbums($scope.user.data.id).then((data)=>{
            console.log('albums', data);
        })
    };

    // init
    // window.onSpotifyWebPlaybackSDKReady = () => {};

    $scope.play = function(){
        UserFactory.getToken().then(resp=>{
            console.log('token', resp);
            window.onSpotifyWebPlaybackSDKReady = () => {
              const token = resp.data;
              const player = new Spotify.Player({
                name: 'Web Playback SDK Quick Start Player',
                getOAuthToken: cb => { cb(token); }
              });

              // Error handling
              player.addListener('initialization_error', ({ message }) => { console.error(message); });
              player.addListener('authentication_error', ({ message }) => { console.error(message); });
              player.addListener('account_error', ({ message }) => { console.error(message); });
              player.addListener('playback_error', ({ message }) => { console.error(message); });

              // Playback status updates
              player.addListener('player_state_changed', state => { console.log(state); });

              // Ready
              player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
              });

              // Not Ready
              player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
              });

              // Connect to the player!
              player.connect();
            };

            angularLoad.loadScript('https://sdk.scdn.co/spotify-player.js').then(function() {
            	// Script loaded succesfully.
            	// We can now start using the functions from someplugin.js
            }).catch(function(err) {
                // There was some error loading the script. Meh
                console.log('err', err);
            });

        }).catch(err=>{
            console.log(`err ${err}`);
        })
    }
})
