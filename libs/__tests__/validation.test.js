import { describe, it, expect } from "vitest";
import { topicSchema, authSchema } from "@/libs/validation";

describe("topicSchema", () => {
    it("acepta un objeto válido", () => {
        const result = topicSchema.safeParse({
            title: "Mi título",
            description: "Mi descripción",
        });
        expect(result.success).toBe(true);
    });

    it("rechaza si falta title", () => {
        const result = topicSchema.safeParse({
            description: "Mi descripción",
        });
        expect(result.success).toBe(false);
    });

    it("rechaza si falta description", () => {
        const result = topicSchema.safeParse({
            title: "Mi título",
        });
        expect(result.success).toBe(false);
    });

    it("rechaza si title es un string vacío o solo espacios", () => {
        expect(topicSchema.safeParse({ title: "", description: "desc" }).success).toBe(false);
        expect(topicSchema.safeParse({ title: "   ", description: "desc" }).success).toBe(false);
    });

    it("rechaza si title supera 100 caracteres", () => {
        const result = topicSchema.safeParse({
            title: "a".repeat(101),
            description: "desc",
        });
        expect(result.success).toBe(false);
    });

    it("rechaza si description supera 500 caracteres", () => {
        const result = topicSchema.safeParse({
            title: "Mi título",
            description: "a".repeat(501),
        });
        expect(result.success).toBe(false);
    });

    it("hace trim de title y description", () => {
        const result = topicSchema.safeParse({
            title: "  Mi título  ",
            description: "  desc  ",
        });
        expect(result.success).toBe(true);
        expect(result.data.title).toBe("Mi título");
    });
});

describe("authSchema", () => {
    it("acepta credenciales válidas", () => {
        const result = authSchema.safeParse({
            email: "test@example.com",
            password: "password123",
        });
        expect(result.success).toBe(true);
    });

    it("rechaza un email inválido", () => {
        const result = authSchema.safeParse({
            email: "no-es-un-email",
            password: "password123",
        });
        expect(result.success).toBe(false);
    });

    it("rechaza una password de menos de 8 caracteres", () => {
        const result = authSchema.safeParse({
            email: "test@example.com",
            password: "1234567",
        });
        expect(result.success).toBe(false);
    });

    it("normaliza el email a minúsculas", () => {
        const result = authSchema.safeParse({
            email: "TEST@EXAMPLE.COM",
            password: "password123",
        });
        expect(result.success).toBe(true);
        expect(result.data.email).toBe("test@example.com");
    });
});
