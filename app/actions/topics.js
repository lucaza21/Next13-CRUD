"use server";

import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { topicSchema } from "@/libs/validation";
import { revalidatePath } from "next/cache";

export async function createTopic(data) {
    const result = topicSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: "Datos inválidos", errors: result.error.flatten().fieldErrors };
    }
    try {
        await connectMongoDB();
        await Topic.create(result.data);
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to create topic" };
    }
    revalidatePath("/");
    return { success: true, message: "Topic creado correctamente" };
}

export async function updateTopic(id, data) {
    const result = topicSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: "Datos inválidos", errors: result.error.flatten().fieldErrors };
    }
    try {
        await connectMongoDB();
        const updated = await Topic.findByIdAndUpdate(id, result.data, { runValidators: true });
        if (!updated) {
            return { success: false, message: "Topic not found" };
        }
    } catch (error) {
        console.error(error);
        if (error.name === "CastError") {
            return { success: false, message: "Invalid topic id" };
        }
        return { success: false, message: "Failed to update topic" };
    }
    revalidatePath("/");
    return { success: true, message: "Topic actualizado correctamente" };
}

export async function deleteTopic(id) {
    try {
        await connectMongoDB();
        const deleted = await Topic.findByIdAndDelete(id);
        if (!deleted) {
            return { success: false, message: "Topic not found" };
        }
    } catch (error) {
        console.error(error);
        if (error.name === "CastError") {
            return { success: false, message: "Invalid topic id" };
        }
        return { success: false, message: "Failed to delete topic" };
    }
    revalidatePath("/");
    return { success: true, message: "Topic eliminado correctamente" };
}