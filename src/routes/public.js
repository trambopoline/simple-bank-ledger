import userController from "../controllers/users";
import errors from "restify-errors";

export default function(server) {

	// server.get("/public",  (req, res, next) => {
	// 	res.send("HEEY")
	// })

	/**
	 * POST
	 */
	server.post("/users", async (req, res, next) => {
		if (!req.is("application/json")) {
			return next(
				new errors.InvalidContentError("Expects 'application/json'")
			);
		}
		console.log("Creating user...");
		let data = req.body || {};
		return userController.create(res, next, data);
	});

}
