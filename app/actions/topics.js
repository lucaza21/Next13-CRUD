"use server";

import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { topicSchema } from "@/libs/validation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import logger from "@/libs/logger";

export async function createTopic(data) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, message: "Debes iniciar sesión para crear un topic" };
    }
    const result = topicSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: "Datos inválidos", errors: result.error.flatten().fieldErrors };
    }
    try {
        await connectMongoDB();
        await Topic.create({ ...result.data, owner: session.user.id });
    } catch (error) {
        logger.error({ err: error }, "Failed to create topic");
        return { success: false, message: "Failed to create topic" };
    }
    revalidatePath("/");
    return { success: true, message: "Topic creado correctamente" };
}

export async function updateTopic(id, data) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, message: "Debes iniciar sesión" };
    }
    const result = topicSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: "Datos inválidos", errors: result.error.flatten().fieldErrors };
    }
    try {
        await connectMongoDB();
        const topic = await Topic.findById(id);
        if (!topic) {
            return { success: false, message: "Topic not found" };
        }
        const isOwner = topic.owner?.toString() === session.user.id;
        const isAdmin = session.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return { success: false, message: "No tienes permiso para editar este topic" };
        }
        await Topic.findByIdAndUpdate(id, result.data, { runValidators: true });
    } catch (error) {
        logger.error({ err: error }, "Failed to update topic");
        if (error.name === "CastError") {
            return { success: false, message: "Invalid topic id" };
        }
        return { success: false, message: "Failed to update topic" };
    }
    revalidatePath("/");
    return { success: true, message: "Topic actualizado correctamente" };
}

export async function deleteTopic(id) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, message: "Debes iniciar sesión" };
    }
    try {
        await connectMongoDB();
        const topic = await Topic.findById(id);
        if (!topic) {
            return { success: false, message: "Topic not found" };
        }
        const isOwner = topic.owner?.toString() === session.user.id;
        const isAdmin = session.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return { success: false, message: "No tienes permiso para eliminar este topic" };
        }
        await Topic.findByIdAndDelete(id);
    } catch (error) {
        logger.error({ err: error }, "Failed to delete topic");
        if (error.name === "CastError") {
            return { success: false, message: "Invalid topic id" };
        }
        return { success: false, message: "Failed to delete topic" };
    }
    revalidatePath("/");
    return { success: true, message: "Topic eliminado correctamente" };
}
