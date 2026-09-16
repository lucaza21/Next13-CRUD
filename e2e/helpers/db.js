const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { loadEnvConfig } = require("@next/env");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
loadEnvConfig(path.join(__dirname, "..", ".."));

async function connect() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
}

async function disconnect() {
    await mongoose.disconnect();
}

async function createTestUser({ email, password, role }) {
    if (!email.startsWith("pwtest_")) {
        throw new Error("createTestUser: el email debe empezar con el prefijo pwtest_ (red de seguridad de limpieza)");
    }
    const hash = await bcrypt.hash(password, 10);
    const res = await mongoose.connection.db.collection("users").insertOne({
        email: email.toLowerCase(),
        password: hash,
        role: role || "user",
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return res.insertedId.toString();
}

async function cleanupTestData() {
    const users = await mongoose.connection.db.collection("users").deleteMany({ email: { $regex: /^pwtest_/ } });
    const topics = await mongoose.connection.db.collection("topics").deleteMany({ title: { $regex: /^\[PW-TEST\]/ } });
    console.log(`cleanupTestData: ${users.deletedCount} usuarios y ${topics.deletedCount} topics de prueba borrados`);
}

module.exports = { connect, disconnect, createTestUser, cleanupTestData };
