const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
loadEnvConfig(path.join(__dirname, ".."));

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Uso: node scripts/assign-owner-to-legacy-topics.js <email-del-admin>");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) {
        console.error(`No se encontró ningún usuario con email ${email}`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const result = await db.collection("topics").updateMany(
        { owner: { $exists: false } },
        { $set: { owner: user._id } }
    );

    console.log(`Topics actualizados: ${result.modifiedCount}`);
    await mongoose.disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
