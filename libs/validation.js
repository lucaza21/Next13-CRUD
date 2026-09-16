import { z } from "zod";

export const topicSchema = z.object({
    title: z.string().trim().min(1, "El título es requerido").max(100, "El título no puede superar 100 caracteres"),
    description: z.string().trim().min(1, "La descripción es requerida").max(500, "La descripción no puede superar 500 caracteres"),
});
