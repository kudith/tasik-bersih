/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        EMAIL_USER:'admin@kalangsaripride.social',
        EMAIL_PASS:'@dtyi8JUL12003'
, // Ensure this is the correct API key
    },
    images: {
        remotePatterns: [
            {
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/emails',
                destination: 'http://localhost:3000/api/emails', // Ensure this points to your local API route
            },
        ]
    },
};

export default nextConfig;