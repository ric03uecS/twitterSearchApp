var Mongo = require('mongodb');
var Twit = require('twit');

var Db = Mongo.Db;
var Server = Mongo.Server;
var MongoClient = Mongo.MongoClient;

var address = process.env.DB_PORT_27017_TCP_ADDR || $OPENSHIFT_MONGODB_DB_HOST || "localhost";
var port = process.env.DB_PORT_27017_TCP_PORT || $OPENSHIFT_MONGODB_DB_PORT || "27017";
var database = process.env.DB_DATABASE || "nodejs" ||"Twitter"; 
var mydata;
var request;
var documents;
var response;
var collections;
var query;

var server = new Server(address, port, {auto_reconnect: true});
var db = new Db(database, server);
var T = new Twit({
    consumer_key:         'eLj2prHXewBXqC3FRwiMCKKmZ'
  , consumer_secret:      'wqRMghbYOzNEPWHxY5KNRfoW8RE0bp8IuIbnqyyJ671nEbbOk1'
  , access_token:         '169437820-Uv7366lduAbJBnsi3fSVsOukucYIqCPXIOsrrqhi'
  , access_token_secret:  'XZZcuEuXAzf2j00EBjfr9Tlghwy3q00XzZHaf50YJ1mKN'
});


open_db = db.open(function(err, db){
	if (err) {
		console.log("Error Opening the db" + err);
	} else {
		collections = db.collection("Tweets");
	}
});

write_db = function(err, db){
		for(i=0; i<mydata.length; i++){
			collections.insert({
				Name: mydata[i].user.name,
				Tweets: mydata[i].text,
				Date: mydata[i].created_at,
				Location: mydata[i].user.location		
			});
		}	
	}

homepage = function (req, res){
	res.render('homepage', {foo: "Twitter Search Page"});
}

get_data = function (err, data, response){
	if (err){
		console.log("Error Fetching data from twitter" + err);
	} else {
		mydata = data.statuses;
		console.log(this);
		this.render("tweets/Twitter", {tweets: mydata, requesting:query  });
		MongoClient.connect("mongodb://" + address + ":" + port + "/" + database, write_db); 
	}
}

get_tweets = function (req, res){
	query = req.query.search;
	//res.redirect('/');
	//console.log(res);
	//var responses = {response: res, request: req};
	var display_data = get_data.bind(res);
	T.get('search/tweets', { q: query + '+'  + 'since:2011-11-11'}, display_data );
}

read = function(err, db){
	if(err){
		console.log("Cannot open database connection" + err);
	}
	else {
		//var collection = db.collection("chandra");
		//var temp = this;
		var PARSE_JSON = parse_json.bind(this);
		collections.find().toArray(PARSE_JSON);
	}
} 

parse_json = function(err, document){
	if(err){
		console.log("cant find the reqd collection" + err);
	}
	else if(document){
		this.render('display/db_tweets', { tweets: document, requesting: query });
	}
}

display_tweets = function(req, res){
//	console.log(request);
	var read_db = read.bind(res);
	MongoClient.connect("mongodb://" + address + ":" + port + "/" + database,read_db);
	
	
}












exports.homepage=homepage;
exports.get_tweets=get_tweets;
exports.display_tweets = display_tweets;
