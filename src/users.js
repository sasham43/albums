const express = require('express');
var router = express.Router();

router.get('/token', (req, res, next)=>{
    var token = req.spotify.getAccessToken();

    res.send(token);
})

router.get('/', (req, res, next)=>{
    req.spotify.getMe()
      .then(function(data) {
        console.log('Some information about the authenticated user', data.body);
        req.db.users.find({
            spotify_user_id: data.body.id
        }).then((results)=>{
            console.log('user', results);
            var new_user = {
                display_name: data.body.display_name,
                image: data.body.images[0].url,
                uri: data.body.uri,
                spotify_user_id: data.body.id
            };
            if(results.length > 0){
                new_user.id = results[0].id;
            }

            req.db.users.save(new_user).then((results)=>{
                res.send(results);
            }).catch(next);

            // res.send(user);
        }).catch(next);

        // res.send(data);
      }, function(err) {
        console.log('Something went wrong!', err);
        next(err);
      });
});


module.exports = router;
