import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname:
                    "img-service-cdn-h2avfjg4bcb8a0gw.australiaeast-01.azurewebsites.net",
            },
        ],
    },
    // Tắt ESLint trong build để tránh lỗi
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Force Next.js to treat this app folder as the tracing root
    outputFileTracingRoot: path.join(__dirname),
    // Ensure webpack resolves modules from this project folder
    webpack: (config) => {
        config.resolve = config.resolve || {};
        config.resolve.modules = [
            ...(config.resolve.modules || []),
            path.resolve(__dirname, "node_modules"),
        ];
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            "react-slide-rule": path.resolve(
                __dirname,
                "node_modules/react-slide-rule",
            ),
        };
        return config;
    },
};

export default nextConfig;
