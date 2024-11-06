/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '1337',
                pathname: '/uploads/**', // Atur path sesuai kebutuhan
            },
        ],
    },
};

export default nextConfig;
