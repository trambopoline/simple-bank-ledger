export default {
	validationModel: {
		createdAt: "required|date",
		value: "required|number"
	},
	sanitizationModel: {
		createdAt: "trim",
		value: "trim"
	}
};
