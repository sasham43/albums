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
.factory('PlayerFactory', function($http){
    return {
        setTrack: (options)=>{
            return $http.put(`/api/player/track/${options.device_id}/${options.track}`);
        },
        setAlbum: (options)=>{
            return $http.put(`/api/player/album/${options.device_id}/${options.album}`);
        },
        play: (options)=>{
            return $http.put(`/api/player/play/${options.device_id}`);
        }
    }
})
.controller('AlbumController', function($scope, $q, orderByFilter, UserFactory, AlbumFactory, PlayerFactory, angularLoad){
    console.log('loaded');
    $scope.user = {};
    $scope.player_initialized = false;
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
    $scope.initPlayer = function(){
        var d = $q.defer();

        if(!$scope.player_initialized){
            UserFactory.getToken().then(resp=>{
                console.log('token', resp);
                window.onSpotifyWebPlaybackSDKReady = () => {
                  const token = resp.data;
                  $scope.player = new Spotify.Player({
                    name: 'simplify',
                    getOAuthToken: cb => { cb(token); }
                  });

                  // Error handling
                  $scope.player.addListener('initialization_error', ({ message }) => { console.error(message); });
                  $scope.player.addListener('authentication_error', ({ message }) => { console.error(message); });
                  $scope.player.addListener('account_error', ({ message }) => { console.error(message); });
                  $scope.player.addListener('playback_error', ({ message }) => { console.error(message); });

                  // Playback status updates
                  $scope.player.addListener('player_state_changed', state => { console.log(state); });

                  // Ready
                  $scope.player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    $scope.device_id = device_id;
                    $scope.player_initialized = true;
                    d.resolve();
                  });

                  // Not Ready
                  $scope.player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                  });

                  // Connect to the player!
                  $scope.player.connect();
                };

                angularLoad.loadScript('https://sdk.scdn.co/spotify-player.js').then(function() {
                	// Script loaded succesfully.
                	// We can now start using the functions from someplugin.js
                }).catch(function(err) {
                    // There was some error loading the script. Meh
                    console.log('err', err);
                    d.reject(err);
                });

            }).catch(err=>{
                console.log(`err ${err}`);
                d.reject(err);
            })
        } else {
            d.resolve();
        }

        return d.promise;
    };

    $scope.selectAlbum = function(album){
        $scope.initPlayer().then(function(){
            $scope.selected_album = album;
            $scope.show_selected_album = true;
            $scope.show_album_list = false;
        })
    };

    $scope.back = function(){
        $scope.show_selected_album = false;
        $scope.show_album_list = true;
    };

    $scope.play = function(){
        // $scope.player.togglePlay().then(() => {
        //   console.log('Toggled playback!');
        // });
        PlayerFactory.play({
            device_id: $scope.device_id
        }).then(resp=>{
            console.log('play', resp);
        }).catch(err=>{
            console.log('err', err);
        })
    }

    $scope.setAlbum = function(){
        PlayerFactory.setTrack({
            track: $scope.selected_album.tracks[0].uri,
            device_id: $scope.device_id
        }).then(resp=>{
            console.log('set album', resp);
        }).catch(err=>{
            console.log('err', err);
        })
        // PlayerFactory.setAlbum($scope.selected_album.uri).then(resp=>{
        //     console.log('set album', resp);
        //     player.togglePlay().then(() => {
        //       console.log('Toggled playback!');
        //     });
        // }).catch(err=>{
        //     console.log('err', err);
        // })
    }
})
