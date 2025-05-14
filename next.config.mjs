/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        EMAIL_USER:'admin@kalangsaripride.social',
        EMAIL_PASS:'@dtyi8JUL12003'
    },
    images: {
        remotePatterns: [
            {
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    webpack: (config) => {
        // Tell webpack to ignore all Node.js specific modules when in browser
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            "fs/promises": false,
            path: false,
            net: false,
            tls: false,
            crypto: false,
            os: false,
            buffer: false,
            events: false,
            stream: false,
            http: false,
            https: false,
            zlib: false,
            util: false,
            url: false,
            querystring: false,
            assert: false,
        };
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/api/emails',
                destination: 'http://localhost:3000/api/emails',
            },
        ]
    },
};

export default nextConfig;