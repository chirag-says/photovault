/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features for better performance
    experimental: {
        // Server Actions are enabled by default in Next.js 14
    },

    // ESLint configuration - allow warnings during build
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Image optimization configuration
    images: {
        // Disable default image optimization (we use Sharp)
        unoptimized: false,
        // Configure remote patterns for Supabase storage
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
                pathname: '/storage/v1/object/**',
            },
        ],
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // Webpack configuration for Sharp
    webpack: (config) => {
        // Handle Sharp for Node.js environment
        config.externals = [...(config.externals || []), 'sharp'];
        return config;
    },
};

export default nextConfig;
