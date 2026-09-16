"use server";

import bcrypt from "bcryptjs";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { authSchema } from "@/libs/validation";
import logger from "@/libs/logger";

export async function registerUser(data) {
    const result = authSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: "Datos inválidos", errors: result.error.flatten().fieldErrors };
    }
    const { email, password } = result.data;
    try {
        await connectMongoDB();
        const existing = await User.findOne({ email });
        if (existing) {
            return { success: false, message: "Ya existe una cuenta con ese email" };
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const role = adminEmail && email === adminEmail ? "admin" : "user";
        await User.create({ email, password: hashedPassword, role });
        return { success: true, message: "Cuenta creada correctamente" };
    } catch (error) {
        logger.error({ err: error }, "Failed to register");
        return { success: false, message: "Failed to register" };
    }
}
