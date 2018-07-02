require("dotenv").config();
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config').get();

var root = require('./root');
var albums = require('./albums');
var users = require('./users');
var Spotify = require('spotify-web-api-node');
var fs = require('fs');

var scopes = ['streaming', 'user-read-private', 'user-read-email', 'user-library-read', 'user-top-read', 'user-read-recently-played', 'user-read-currently-playing', 'user-modify-playback-state', 'user-read-playback-state'],
    redirectUri = 'http://localhost:3009/callback',
    clientId = process.env.SPOTIFY_ID,
    clientSecret = process.env.SPOTIFY_SECRET,
    state = 'albums';

    // console.log('s', process.env, process.env.SPOTIFY_SECRET);

var spotify = new Spotify({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
});

var dbconn = require('./db');
dbconn('album-db');

var app = express();

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));
app.use(bodyParser.json({
  limit: '50mb'
}));

// require('./auth.js')(app, config);

var listenPort = process.env.PORT || 3009;

app.use('/api',function(req, res, next){
  console.log('get url', req.url)
  dbconn('album-db', req.url).then(function(db){
    req.db = db;
    next();
  });
});
app.get('/callback', function(req, res, next){
    console.log('query', req.query);
    spotify.authorizationCodeGrant(req.query.code)
    .then(function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);
      refresh_token = data.body['refresh_token'];

      // Set the access token on the API object to use it in later calls
      spotify.setAccessToken(data.body['access_token']);
      spotify.setRefreshToken(data.body['refresh_token']);

      fs.writeFile('token.txt', refresh_token)
      // getTracks();
    }, function(err) {
      console.log('Something went wrong callback!', err);
    });
    // get the things
    res.sendFile(__dirname + '/root/public/albums.html');
});
app.get('/auth', function(req, res, next){
    var authorizeURL = spotify.createAuthorizeURL(scopes, state);

    console.log(authorizeURL);

    res.send(authorizeURL);
});

app.use('/api', (req, res, next)=>{
    req.spotify = spotify;
    // console.log('spotify', spotify, req.spotify);
    next();
});

app.use('/api/users',users);
app.use('/api/albums',albums);
app.use('/', root);

app.use(function(err, req, res, next){
  console.log('error:', err);
  res.status(err.statusCode || 500).json(err);
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/root/public/index.html');
});

app.listen(listenPort, function(){
  console.log('server listening on port', listenPort + '...');
});
