export default {
	name: 'API',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 8080,
	base_url: process.env.BASE_URL || 'http://localhost:3000',
};