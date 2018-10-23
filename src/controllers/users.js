import errors from "restify-errors";
import indicative from "indicative";
import NodeCache from "node-cache";
import userSchema from "../models/user";
const userCache = new NodeCache({ errorOnMissing: true });

/**
 * Populate a few dummy users
 */
userCache.set("jack", {
	username: "jack",
	password: "secret",
	email: "jack@example.com"
});

export default {
	/**
	 * Create a user
	 * @param {*} userData
	 */
	async create(res, next, userData) {
		try {
			let cleanUserData = await indicative.sanitize(
				userData,
				userSchema.sanitizationModel
			);

			// See if username is taken
			try {
				console.log("Check for user already existing", cleanUserData);
				userCache.get(cleanUserData.username);
				return next(
					new errors.UnprocessableEntityError(
						"That username is taken"
					)
				);
				// return
			} catch (e) {}

			let validatedUserData = await indicative.validateAll(
				cleanUserData,
				userSchema.validationModel
			);
			try {
				userCache.set(validatedUserData.username, validatedUserData);
				console.log("Successfully set");
				res.status(201);
				res.send(validatedUserData);
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
	getAll(res, next) {
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

	/**
	 * @returns User if found and password verified, false otherwise
	 * @param {string} username
	 * @param {string} password
	 */
	authenticate(username, password) {
		try {
			let user = userCache.get(username);
			if (user.password != password) {
				console.error(`Incorrect password '${password}'`);
				return false;
			}
			return user;
		} catch (err) {
			if (err) {
				console.error(`Can't find user '${username}'`);
				return false;
			}
		}
	},

	/**
	 * "log in" a user. This just returns a user object.
	 */
	logIn(res, next, user) {
		// this.authenticate( username, password, ( error, user ) => {
		// 	console.log(error, user);
		// } )
		// console.log(username, password);
		res.send({ user });
		return next();
	}
};
