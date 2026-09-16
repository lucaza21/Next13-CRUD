import mongoose from "mongoose";
import dns from "dns";
import logger from "@/libs/logger";

// Node's built-in DNS resolver (c-ares) can fail to read Windows' configured
// DNS servers, breaking the SRV lookup that `mongodb+srv://` needs.
// Forcing a public resolver works around it.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let isConnected = false;

const connectMongoDB = async () => {
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error({ err: error }, "Failed to connect to MongoDB");
        isConnected = false;
        throw error;
    }
}

export default connectMongoDB;
