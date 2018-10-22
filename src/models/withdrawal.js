export default {
	validationModel: {
		createdAt: "required|date",
		value: "required|number|above:0"
	},
	sanitizationModel: {
		value: "trim"
	}
};
