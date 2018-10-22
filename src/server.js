import config from "./config";
import restify from "restify";
import restifyErrors from "restify-errors";
import passport from "passport-restify";
import privateRoutes from "./routes/private";
import publicRoutes from "./routes/public";
import users from "./controllers/users";


/* 
* Configure authorization and configuration
*/
const BasicStrategy = require("passport-http").BasicStrategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';

// Configure the Basic strategy for use by Passport.
//
// The Basic strategy requires a `verify` function which receives the
// credentials (`username` and `password`) contained in the request.  The
// function must verify that the password is correct and then invoke `cb` with
// a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
	new BasicStrategy(function(username, password, done) {
		return done(null, users.authenticate(username, password));
	})
);
// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
// 	// console.log("payload: ", jwt_payload);
// 	// return done(null, true);
// 	return done( null, users.authenticate(username, password, done) )
//     // User.findOne({id: jwt_payload.sub}, function(err, user) {
//     //     if (err) {
//     //         return done(err, false);
//     //     }
//     //     if (user) {
//     //         return done(null, user);
//     //     } else {
//     //         return done(null, false);
//     //         // or you could create a new account
//     //     }
//     // });
// }));

/* 
* Set up the server
*/
const server = restify.createServer({
	formatters: {
		"application/json": function(req, res, body) {
			if(body.message){
				return JSON.stringify({ meta: res.meta, error: body });
			}
			return JSON.stringify({ meta: res.meta, data: body });
		}
	},
	name: config.name,
	version: config.version
});

server.pre(restify.plugins.pre.userAgentConnection());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.jsonp());

publicRoutes(server);

// Any routes after here will require user authentication
server.use(passport.authenticate("basic", { session: false })); 
// server.use(passport.authenticate("jwt", { session: false })); 

privateRoutes(server);

server.listen(config.port, function() {
	console.log("%s listening at %s", server.name, server.url);
});
