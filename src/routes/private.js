import transactionController from "../controllers/transactions";
import userController from "../controllers/users";
import errors from "restify-errors";

export default function(server, auth) {
	server.post("/login", auth, (req, res, next) => {
		// console.log(req.user);
		return userController.logIn(res, next, req.user);
	});

	/**
	 * POST
	 */
	server.post("/transactions/withdrawals", auth, async (req, res, next) => {
		if (!req.is("application/json")) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'")
			);
		}
		const data = req.body || {};
		return transactionController.withdraw(res, next, data);
	});

	/**
	 * POST
	 */
	server.post("/transactions/deposits", auth, async (req, res, next) => {
		if (!req.is("application/json")) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'")
			);
		}
		const data = req.body || {};
		return transactionController.deposit(res, next, data);
	});

	/**
	 * LIST
	 */
	server.get("/transactions", auth, (req, res, next) => {
		return transactionController.getAll(req, res, next);
	});
}
