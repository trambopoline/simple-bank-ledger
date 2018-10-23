import transactionController from "../controllers/transactions";
import errors from "restify-errors";

export default function(server) {
	/**
	 * POST
	 */
	server.post("/transactions", async (req, res, next) => {
		if (!req.is("application/json")) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'")
			);
		}
		let data = req.body || {};
		return transactionController.create(res, data);
	});

	/**
	 * LIST
	 */
	server.get("/transactions", (req, res, next) => {
		return transactionController.getAll(req, res, next);
	});

	/**
	 * GET
	 */
	server.get("/transactions/:transaction_id", (req, res, next) => {
		return transactionController.getOne(req.params.transaction_id);
	});
}
