import userController from "../controllers/users";
import errors from "restify-errors";

export default function(server) {
	/**
	 * POST
	 */
	server.post("/users", async (req, res, next) => {
		if (!req.is("application/json")) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'")
			);
		}
		let data = req.body || {};
		return userController.create(res, next, data);
	});
	
	/**
	 * POST
	 */
	server.post("/login", (req, res, next) => {

		let data = req.body || {};
		return userController.logIn( res, next, data, req.params.username, req.params.password);
	});
}
