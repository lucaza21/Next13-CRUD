"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TopicForm({ mode, id, initialTitle = "", initialDescription = "" }) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(mode === "add" ? "/api/topics" : `/api/topics/${id}`, {
                method: mode === "add" ? "POST" : "PUT",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ title, description })
            });

            if (res.ok) {
                toast.success(mode === "add" ? "Topic creado correctamente" : "Topic actualizado correctamente");
                router.refresh();
                router.push("/");
            } else {
                const err = await res.json().catch(() => null);
                if (err && err.errors) {
                    const messages = Object.values(err.errors).flat().join("\n");
                    toast.error(messages || "Datos inválidos");
                } else if (err && err.message) {
                    toast.error(err.message);
                } else {
                    toast.error(mode === "add" ? "Failed to create topic" : "Failed to update topic");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(mode === "add" ? "Failed to create topic" : "Failed to update topic");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
                className="border border-slate-500 px-8 py-2"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Topic Title"
            />
            <input
                className="border border-slate-500 px-8 py-2"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                type="text"
                placeholder="Topic Description"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 font-bold text-white py-3 px-6 w-fit disabled:opacity-50"
            >
                {isSubmitting ? "Guardando..." : mode === "add" ? "Create Topic" : "Update Topic"}
            </button>
        </form>
    );
}
