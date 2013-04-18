var express = require('express')
	, path = require('path')
	, routes = require('./routes')
	, http = require('http')
	, server
	, io = require('socket.io')
	//, twitterAuth = require('twitter-oauth')({
    //    consumerKey: "Jv8YLLy2NJLnsfu5Rh5FOg", /* per appication - create a comsumer key here: https://dev.twitter.com/apps */
    //    domain: 'localhost:3000',
    // consumerSecret: "cCAxKXjo4LMdOUnN119PtZQ9DQvoW6pFgHeWn77Pf8", /* create a comsumer key here: https://dev.twitter.com/apps */
    //  loginCallback: "http://localhost:3000/twitter/sessions/callback",  /* internal */
   //completeCallback:  "http://localhost:3000/"  /* When oauth has finished - where should we take the user too */
	//})*/
	, ntwitter = require('ntwitter')
	, tweets;

var app = express();

var twit = new ntwitter({
  consumer_key: 'Jv8YLLy2NJLnsfu5Rh5FOg',
  consumer_secret: 'cCAxKXjo4LMdOUnN119PtZQ9DQvoW6pFgHeWn77Pf8',
  access_token_key: '19917414-hJfgA9A7grGoFI0EMX22tRBwwUrSDKCfkQlNbLU',
  access_token_secret: 'rIfskYuEQxY1aRVHwf03yIi1y9TG4ylacYXRKLdcOQ'
});

setupApp();

function setupApp(){
	app.configure(function(){
		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		app.use(express.favicon());
		app.use(express.static(path.join(__dirname, 'public')));
		app.use(express.logger('dev'));
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
	});

	app.use(app.router);
	setupRoutes();
	startServer();
}

function setupRoutes(){
	app.get('/', routes.index);
	/*app.get('/twitter/sessions/connect', twitterAuth.oauthConnect);
	app.get('/twitter/sessions/callback', twitterAuth.oauthCallback);
	app.get('/twitter/sessions/logout', twitterAuth.logout);*/

	app.get('*', function(req, res){
		console.log("Page not found: " + req.originalUrl);
		res.render('404');
	});
}

function addBattery(req, res, next){
	req.battery = battery;
	next();
}


function startServer(){
	server = http.createServer(app);
	io = io.listen(server);

	io.configure(function () { 
	  io.set("transports", ["xhr-polling"]); 
	  io.set("polling duration", 10); 
	});

	server.listen(app.get('port'), function(){
		console.log("Express server started.");
	});

	// get the namespaces going
	newsticker = io.of('/newsticker');
	var tweet = new Object();
	twit.stream('statuses/filter', { track: ['#nvdj', '#nvdj13', '#nvdj2013'] }, function(stream) {

		stream.on('data', function (data) {
			//console.log("This is the data we received from the Twitter stream:");
			//console.dir(data);
			//console.log("These are the entities:");
			//console.dir(data.entities);
			//console.log("These are the hashtags in the tweet:");
			//console.dir(data.entities.hashtags);
			//console.log("These are the url's in the tweet:");
			//console.dir(data.entities.urls);
			//console.log("These are the users mentioned in the tweet:");
			//console.dir(data.entities.user_mentions);
			tweet.created_at = data.created_at;
			tweet.id_str = data.id_str;
			tweet.text = data.text;
			tweet.user = new Object();
			tweet.user.name = data.user.name;
			tweet.user.screen_name = data.user.screen_name;
			tweet.user.profile_image_url = data.user.profile_image_url;
			tweet.user.profile_image_url_https = data.user.profile_image_url_https;
			tweet.entities = data.entities;
			console.log("This is the tweet we're sending to the news ticker:");
			console.dir(tweet);
			newsticker.emit('tweet', {value: tweet});
		});
	});
}