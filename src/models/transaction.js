export default {
	validationModel: {
		createdAt: "date",
		value: "required|number"
	},
	sanitizationModel: {
		createdAt: "trim",
		value: "trim"
	}
};
