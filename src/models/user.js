export default {
	validationModel: {
		username:"required|string",
		password: "required|min:6|max:30",
		email:"email"
	},
	sanitizationModel: {
		username: "trim",
		password: "trim",
		email:"trim"
	}
};
