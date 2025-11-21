/** @type {import('next').NextConfig} */
const nextConfig = {
	turbopack: {},
	// Still let Next transpile the workspace package
	transpilePackages: ["@tandem/ui-kit"],
	webpack: (config) => {
		// During local development, point @tandem/ui-kit to its src entry
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@tandem/ui-kit": require("path").resolve(
				__dirname,
				"../..",
				"packages/ui-kit/src"
			),
		};
		return config;
	},
};

module.exports = nextConfig;
