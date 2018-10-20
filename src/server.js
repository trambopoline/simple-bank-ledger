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

const server = restify.createServer({
	formatters: {
		"application/json": function(req, res, body) {
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

// Configure the Basic strategy for use by Passport.
//
// The Basic strategy requires a `verify` function which receives the
// credentials (`username` and `password`) contained in the request.  The
// function must verify that the password is correct and then invoke `cb` with
// a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
	new BasicStrategy(function(username, password, done) {
		try {
			let user = users.getOne(username);
			if (!user) {
				return done(null, false);
			}
			if (user.password != password) {
				return done(null, false);
			}
			return done(null, user);
		} catch (err) {
			if (err) {
				return done(err);
			}
		}
	})
);

publicRoutes(server);

// Put all public endpoints above this
server.use(passport.authenticate("basic", { session: false }));

privateRoutes(server);

server.listen(config.port, function() {
	console.log("%s listening at %s", server.name, server.url);
});
