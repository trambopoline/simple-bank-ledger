import errors from "restify-errors";
import indicative from "indicative";
import NodeCache from "node-cache";
import transactionSchema from "../models/transaction";
import withdrawalSchema from "../models/withdrawal";
const transactionCache = new NodeCache();

export default {
	/**
	 * Create a transaction
	 * @param {*} data
	 */
	async create(res, next, data, schema = transactionSchema) {
		try {
			let sanitizationResults = await indicative.sanitize(
				data,
				schema.sanitizationModel
			);

			// Insert the createdAt date+time ( this overwrites the user value, if set )
			sanitizationResults.createdAt = Date.now();

			console.log(sanitizationResults);
			let validationResults = await indicative.validateAll(
				sanitizationResults,
				schema.validationModel
			);
			try {
				const crypto = require("crypto");
				const id = crypto.randomBytes(16).toString("hex");
				transactionCache.set(id, validationResults);
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

	withdraw(res, next, data) {
		this.create(res, next, data, withdrawalSchema)
	},

	deposit(res, next, data) {


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
			// res.meta ? res.meta.numberOfTransactions = results.length : { numberOfTransactions: results.length };
			res.meta =   { numberOfTransactions: results.length };
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
