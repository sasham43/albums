const express = require('express');
var router = express.Router();
const q = require('q');
const _ = require('underscore');

router.put('/play/:device_id', (req, res, next)=>{
    req.spotify.transferMyPlayback({
        play: true,
        deviceIds: [req.params.device_id]
    }, (err, resp)=>{
        if(err)
            return next(err);

        console.log('transfer resp', resp);

        res.send(resp);
    })
})

router.put('/track/:device_id/:track', (req, res, next)=>{
    req.spotify.play({
        device_id: req.params.device_id,
        uris: [req.params.track]
    }, (err, resp)=>{
        if(err)
            return next(err);

        console.log('play resp', resp);

        res.send(resp);
    });
});

router.put('/album/:device_id/:album', (req, res, next)=>{
    console.log('play album', req.params.album);
    req.spotify.play({
        device_id: req.params.device_id,
        context_uri: [req.params.album]
    }, (err, resp)=>{
        if(err)
            return next(err);


        console.log('play resp', resp);

        res.send(resp);
    });
});


module.exports = router;
