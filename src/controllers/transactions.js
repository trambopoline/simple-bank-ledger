import errors from "restify-errors";
import indicative from "indicative";
import NodeCache from "node-cache";
import transactionSchema from "../models/transaction";
import withdrawalSchema from "../models/withdrawal";
import depositSchema from "../models/deposit";

// Initialize the cache
const transactionCache = new NodeCache();
transactionCache.set('balance', 0);

export default {

	withdraw(res, next, data) {
		create(res, next, data, withdrawalSchema)
	},

	deposit(res, next, data) {
		create(res, next, data, depositSchema)
	},

	/**
	 * Get all transactions for a user
	 */
	getAll(req, res, next) {
		try {
			res.meta = res.meta || {};
			let keys = transactionCache.keys();
			let results = [];
			for (const key of keys) {
				const value = transactionCache.get(key)
				if (key == 'balance') {
					res.meta.balance = value;
					continue;
				}
				results.push(value);
			}
			// res.meta ? res.meta.numberOfTransactions = results.length : { numberOfTransactions: results.length };
			res.meta.numberOfTransactions = results.length;
			res.status(200);
			res.send(results);
			return next();
		} catch (err) {
			console.log(err);
			return next(new errors.InternalServerError());
		}
	},

};
/**
 * Create a transaction
 * @param {*} data
 */
async function create(res, next, data, schema = transactionSchema) {
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

		// Ensure the user can't overdraw
		try {
			let oldBalance = transactionCache.get('balance');
			let newBalance = parseInt(oldBalance, 10) + parseInt(validationResults.amount, 10);

			if (newBalance < 0) {
				return next(new errors.BadRequestError("Insufficient funds"));
			}
			transactionCache.set('balance', newBalance);
			console.log("new balance: ", newBalance);
		} catch (error) {
			console.error(error);
			return next(new errors.InternalServerError());
		}

		try {
			const crypto = require("crypto");
			const id = crypto.randomBytes(16).toString("hex");
			transactionCache.set(id, validationResults);
			res.status(201);
			res.send(validationResults);
			return next();
		} catch (error) {
			console.error(error);
			return next(new errors.InternalServerError());
		}
	} catch (errs) {
		let errorString = ``;
		errs.forEach(err => {
			errorString += `${err.message}\n`;
		});
		return next(new errors.UnprocessableEntityError(errorString));
	}
};