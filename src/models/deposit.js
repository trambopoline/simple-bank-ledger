export default {
	validationModel: {
		createdAt: "required|date",
		amount: "required|number|above:0"
	},
	sanitizationModel: {
		amount: "trim"
	}
};
