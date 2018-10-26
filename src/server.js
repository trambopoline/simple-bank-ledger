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

passport.use(
	new BasicStrategy(function(username, password, done) {
		return done(null, users.authenticate(username, password));
	})
);

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

privateRoutes(server, passport.authenticate("basic", { session: false }));

server.listen(config.port, function() {
	console.log("%s listening at %s", server.name, server.url);
});
