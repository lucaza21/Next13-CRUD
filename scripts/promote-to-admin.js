const fs = require("fs");
const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const { processEnv } = require("@next/env");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const projectRoot = path.join(__dirname, "..");
const credentialsPath = path.join(projectRoot, "atlas-credentials.env");

if (fs.existsSync(credentialsPath)) {
    processEnv(
        [{ path: "atlas-credentials.env", contents: fs.readFileSync(credentialsPath, "utf8") }],
        projectRoot
    );
}

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Uso: node scripts/promote-to-admin.js <email>");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const result = await db.collection("users").updateOne(
        { email: email.toLowerCase() },
        { $set: { role: "admin" } }
    );

    if (result.matchedCount === 0) {
        console.error(`No se encontró ningún usuario con email ${email}`);
    } else {
        console.log(`Usuario ${email} promovido a admin (modificado: ${result.modifiedCount === 1})`);
    }

    await mongoose.disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
