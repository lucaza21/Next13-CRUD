const fs = require("fs");
const path = require("path");
const { processEnv } = require("@next/env");

const credentialsPath = path.join(__dirname, "atlas-credentials.env");
if (fs.existsSync(credentialsPath)) {
    processEnv([
        {
            path: "atlas-credentials.env",
            contents: fs.readFileSync(credentialsPath, "utf8"),
        },
    ], __dirname);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
}

module.exports = nextConfig
