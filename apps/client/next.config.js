/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
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
=======
	transpilePackages: ["@tandem/ui-kit"],
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
};

module.exports = nextConfig;
