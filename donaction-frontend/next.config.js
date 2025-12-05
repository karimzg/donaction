const config = require('./src/config/config.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	basePath: config.base_path !== '/' ? config.base_path : '',
	trailingSlash: config.site.trailing_slash,
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'ik.imagekit.io',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.kcak11.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	deviceSizes: [480, 768],
	imageSizes: [480, 1220],
	experimental: {
		// serverActions: true,
		bodySizeLimit: '20mb',
	},
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});
// const allowedOrigins = ['http://localhost'];

module.exports = withBundleAnalyzer({
	...nextConfig,
	// async headers() {
	// 	return [
	// 		{
	// 			// Match all API routes
	// 			source: '/api/:path*',
	// 			headers: [
	// 				{
	// 					key: 'Access-Control-Allow-Origin',
	// 					value: '*', // Change '*' to your specific domain if needed
	// 				},
	// 				{
	// 					key: 'Access-Control-Allow-Methods',
	// 					value: 'GET, POST',
	// 				},
	// 				{
	// 					key: 'Access-Control-Allow-Headers',
	// 					value: 'Content-Type, Authorization',
	// 				},
	// 			],
	// 		},
	// 	];
	// },
	// async rewrites() {
	// 	return [
	// 		{
	// 			source: '/api/:path*',
	// 			destination: '/api/:path*',
	// 			has: [
	// 				{
	// 					type: 'host',
	// 					value: `(${allowedOrigins.join('|')})`,
	// 				},
	// 			],
	// 		},
	// 	];
	// },
	productionBrowserSourceMaps: true,
	output: 'standalone',
});
