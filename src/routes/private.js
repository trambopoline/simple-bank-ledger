import transactionController from "../controllers/transactions";
import userController from "../controllers/users";
import errors from "restify-errors";

export default function(server) {
	/**
	 * POST
	 */
	server.post("/login", (req, res, next) => {
		// console.log(req.user);
		return userController.logIn(res, next, req.user);
	});

	/**
	 * POST
	 */
	server.post("/transactions", async (req, res, next) => {
		if (!req.is("application/json")) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'")
			);
		}
		const data = req.body || {};
		return transactionController.create(res, next, data);
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
