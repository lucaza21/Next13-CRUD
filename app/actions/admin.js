"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import Topic from "@/models/topic";
import { revalidatePath } from "next/cache";
import logger from "@/libs/logger";

export async function deleteUser(userId) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
        return { success: false, message: "No autorizado" };
    }
    if (userId === session.user.id) {
        return { success: false, message: "No puedes eliminar tu propia cuenta" };
    }
    try {
        await connectMongoDB();
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return { success: false, message: "Usuario no encontrado" };
        }
        await Topic.deleteMany({ owner: userId });
    } catch (error) {
        logger.error({ err: error }, "Failed to delete user");
        return { success: false, message: "Failed to delete user" };
    }
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: "Usuario eliminado correctamente" };
}

export async function getAllUsers() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
        return [];
    }
    try {
        await connectMongoDB();
        const users = await User.find().select("-password").lean();
        return users.map((u) => ({ ...u, _id: u._id.toString() }));
    } catch (error) {
        logger.error({ err: error }, "Failed to get all users");
        return [];
    }
}
