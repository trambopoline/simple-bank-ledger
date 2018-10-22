import errors from "restify-errors";
import indicative from "indicative";
import NodeCache from "node-cache";
import userSchema from "../models/user";
const userCache = new NodeCache({errorOnMissing: true});

/**
 * Populate a few dummy users
 */
userCache.set("jack", {
	password: "secret",
	email: "jack@example.com"
});

export default {
	/**
	 * Create a user
	 * @param {*} data
	 */
	async create(res, next, data) {
		try {
			let sanitizationResults = await indicative.sanitize(
				data,
				userSchema.sanitizationModel
			);

			let validationResults = await indicative.validateAll(
				sanitizationResults,
				userSchema.validationModel
			);
			try {
				userCache.set(validationResults.username, validationResults);
				console.log("Successfully set");
				res.status(201);
				res.send(validationResults);
				return next();
			} catch (error) {
				return next(new errors.InternalServerError(error));
			}
		} catch (errs) {
			let errorString = ``;
			errs.forEach(err => {
				errorString += `${err.message}\n`;
			});
			return next(new errors.UnprocessableEntityError(errorString));
		}
	},

	/**
	 * Get all users
	 */
	getAll( res, next) {
		try {
			let keys = userCache.keys();
			let results = [];
			for (const key of keys) {
				results.push(userCache.get(key));
			}
			res.status(200);
			res.send(results);
			return next();
		} catch (err) {
			console.log(err);
			return next(new errors.InternalServerError());
		}
	},

	authenticate( username, password, done )
	{
		try {
			let user = userCache.get(username);
			if (user.password != password) {
				console.error(`Incorrect password '${password}'`);
				return done(null, false);
			}
			return done(null, user);
		} catch (err) {
			if (err) {
				console.error(`Can't find user '${username}'`);
				return done(null, false);
			}
		}
	},

	/**
	 * GET
	 */
	getOne(username) {
		return userCache.get(username)
	}
};
