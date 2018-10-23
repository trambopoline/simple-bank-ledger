import errors from "restify-errors";
import indicative from "indicative";
import NodeCache from "node-cache";
import transactionSchema from "../models/transaction";
const transactionCache = new NodeCache();

/**
 * Populate a few dummy keys
 */
transactionCache.set("testkey1", "test value 1");

export default {
	/**
	 * Create a transaction
	 * @param {*} data
	 */
	async create(res, data) {
		try {
			let sanitizationResults = await indicative.sanitize(
				data,
				transactionSchema.sanitizationModel
			);

			let validationResults = await indicative.validateAll(
				sanitizationResults,
				transactionSchema.validationModel
			);
			try {
				transactionCache.set("1", validationResults);
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
	 * Get all transactions for a user
	 */
	getAll(req, res, next) {
		try {
			let keys = transactionCache.keys();
			let results = [];
			for (const key of keys) {
				results.push(transactionCache.get(key));
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
	 * GET
	 */
	getOne(id) {
		return next();
	}
};
