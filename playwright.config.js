import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    timeout: 30000,
    fullyParallel: false,
    workers: 1,
    reporter: "list",
    use: {
        baseURL: "http://localhost:3100",
        headless: true,
    },
    webServer: {
        command: "npm run dev -- -p 3100",
        url: "http://localhost:3100",
        reuseExistingServer: true,
        timeout: 60000,
    },
});
