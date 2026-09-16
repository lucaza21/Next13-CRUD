const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { loadEnvConfig } = require("@next/env");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
loadEnvConfig(path.join(__dirname, ".."));

async function main() {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    if (!email || !newPassword) {
        console.error("Uso: node scripts/reset-password.js <email> <nueva-password>");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.collection("users").updateOne(
        { email: email.toLowerCase() },
        { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
        console.error(`No se encontró ningún usuario con email ${email}`);
    } else {
        console.log(`Password actualizada para ${email}`);
    }

    await mongoose.disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
