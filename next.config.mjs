/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                port: '',
                pathname: '/uc**', // Atur path sesuai kebutuhan
            },
        ],
    },
};

export default nextConfig;
