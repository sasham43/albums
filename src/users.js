const express = require('express');
var router = express.Router();

router.get('/', (req, res, next)=>{
    req.spotify.getMe()
      .then(function(data) {
        console.log('Some information about the authenticated user', data.body);
        res.send(data);
      }, function(err) {
        console.log('Something went wrong!', err);
        next(err);
      });
});


module.exports = router;
