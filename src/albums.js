const express = require('express');
var router = express.Router();
const q = require('q');
const _ = require('underscore');

router.get('/update/:user_id', (req, res, next)=>{
    updateAlbums(req.spotify, req.db, req.params.user_id)
    res.send({
        message: 'started'
    })
})

router.get('/:user_id', (req, res, next)=>{
    req.db.vw_album_tracks_images.find({
        user_id: req.params.user_id
    }).then((resp)=>{
        res.send(resp);
    }).catch((err)=>{
        next(err);
    })
})

router.get('/', (req, res, next)=>{

});

function updateImages(spotify, db, user_id) {
    db.get_albums_with_images([user_id]).then(resp=>{
        var to_update = resp.filter(a=>{
            return a.images[0] === null;
        });

        to_update.forEach((a, i)=>{
            if(i < 50){
                spotify.getAlbum(a.spotify_album_id).then((resp)=>{
                    // console.log('got album', a.id, resp.body.tracks.items);
                    var images = resp.body.images.map(i=>{

                        // console.log('typeof', typeof t.uri, typeof a.id, typeof t.name, typeof t.track_number);
                        return {
                            url: i.url,
                            album_id: a.id,
                            width: i.width,
                            height: i.height
                        }
                    });

                    db.images.insert(images).then(resp=>{
                        console.log('inserted images', resp);
                    }).catch((err)=>{
                        console.log('failed at inserting images', err);
                    });
                })
            }

        })
    })
}

function updateTracks(spotify, db, user_id) {
    db.get_albums_with_tracks([user_id]).then((resp)=>{
        console.log('album tracks', resp);
        var to_update = resp.filter((a)=>{
            return a.tracks[0] === null;
        });

        to_update.forEach((a, i)=>{
            if(i < 50){
                spotify.getAlbum(a.spotify_album_id).then((resp)=>{
                    // console.log('got album', a.id, resp.body.tracks.items);
                    var tracks = resp.body.tracks.items.map((t)=>{

                        // console.log('typeof', typeof t.uri, typeof a.id, typeof t.name, typeof t.track_number);
                        return {
                            uri: t.uri,
                            album_id: a.id,
                            name: t.name,
                            track_number: t.track_number
                        }
                    });

                    db.tracks.insert(tracks).then((resp)=>{
                        console.log('inserted tracks', resp);
                    }).catch((err)=>{
                        console.log('failed at inserting tracks', err);
                    });
                })
            }

        })
    })
}

function collectAlbumIDs(spotify, offset, albums, cb){
    spotify.getMySavedAlbums({
        limit: 50,
        offset: offset
    }).then((data)=>{
        data.body.items.map((a)=>{
            albums.push(a.album.id);
        });

        if(data.body.total == albums.length){
            cb(albums)
        } else {
            var new_offset = data.body.offset + 50;
            collectAlbumIDs(spotify, new_offset, albums, cb);
        }
    })
}

function updateAlbums(spotify, db, user_id) {
    collectAlbumIDs(spotify, 0, [], (results)=>{
        var spotify_albums = results;
        db.get_album_ids([user_id]).then((resp)=>{
            var db_albums = resp.map((a)=>{
                return a.spotify_album_id;
            });

            var same = db_albums.equals(spotify_albums);
            if(same){
                console.log('same albums');
            } else {
                console.log('different albums');
                var new_albums = spotify_albums.filter((sa)=>{
                    return !_.contains(db_albums, sa);
                });
                console.log('new albums', new_albums);
                new_albums.forEach((album)=>{
                    spotify.getAlbum(album).then((data)=>{
                        db.albums.save({
                            user_id: user_id,
                            artist: data.body.artists[0].name,
                            album_name: data.body.name,
                            href: data.body.href,
                            uri: data.body.uri,
                            spotify_album_id: data.body.id
                        })
                    })
                })

                var removed_albums = db_albums.filter((da)=>{
                    return !_.contains(spotify_albums, da);
                });
                console.log('removed albums', removed_albums);
                removed_albums.forEach((album)=>{
                    db.albums.destroy({
                        spotify_album_id: album
                    });
                });

            }
            // updateTracks(spotify, db, user_id);
            // updateImages(spotify, db, user_id);

        })
    })
}

function saveAlbums(offset, spotify, db, user_id) {
    spotify.getMySavedAlbums({
        limit : 50,
        offset: offset
    })
    .then(function(data) {
        var albums = data.body.items.map((a)=>{
            console.log('a', a);
            return {
                user_id: user_id,
                artist: a.album.artists[0].name,
                album_name: a.album.name,
                href: a.album.href,
                uri: a.album.uri,
                spotify_album_id: a.album.id
            }
        });
        db.albums.insert(albums).then((resp)=>{
            console.log('saved albums', resp);
            var new_offset = data.body.offset + 50;
            saveAlbums(new_offset, spotify, db, user_id);
        }).catch((err)=>{
            console.log('error saving albums:', err);
        });

    }, function(err) {
        console.log('Something went wrong!', err);
        next(err);
    });
}

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


module.exports = router;
