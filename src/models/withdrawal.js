export default {
	validationModel: {
		createdAt: "required|date",
		amount: "required|number|under:0"
	},
	sanitizationModel: {
		amount: "trim"
	}
};
