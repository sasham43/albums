const express = require('express');
var router = express.Router();


router.get('/update/:user_id', (req, res, next)=>{
    // req.spotify.getMySavedAlbums({
    //     limit : 50,
    //     offset: 0
    // })
    // .then(function(data) {
    //     // Output items
    //     console.log('albums', data.body);
    //     res.send(data.body);
    // }, function(err) {
    //     console.log('Something went wrong!', err);
    //     next(err);
    // });
    saveAlbums(0, req.spotify, req.db, req.params.user_id)
    res.send({
        message: 'started'
    })
})

router.get('/', (req, res, next)=>{

});

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


module.exports = router;
