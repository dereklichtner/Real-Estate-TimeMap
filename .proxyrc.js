const path = require("path");

module.exports = function (app) {
	app.use((req, res, next) => {
		const ext = path.extname(req.url);
		if (ext === ".json" || ext === ".geojson") {
			res.setHeader("Content-Type", "application/geo+json");
		}
		next();
	});
        // other proxied requests 
        // app.use(createProxyMiddleware('/api/*', {...}))
}