"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createTopic, updateTopic } from "@/app/actions/topics";

export default function TopicForm({ mode, id, initialTitle = "", initialDescription = "" }) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = mode === "add"
                ? await createTopic({ title, description })
                : await updateTopic(id, { title, description });

            if (result.success) {
                toast.success(result.message);
                router.push("/");
            } else if (result.errors) {
                const messages = Object.values(result.errors).flat().join("\n");
                toast.error(messages || "Datos inválidos");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(mode === "add" ? "Failed to create topic" : "Failed to update topic");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-6 rounded-xl shadow-md">
            <input
                className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Topic Title"
            />
            <input
                className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                type="text"
                placeholder="Topic Description"
            />
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 font-bold text-white py-3 px-6 rounded-lg shadow hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                    {isSubmitting ? "Guardando..." : mode === "add" ? "Create Topic" : "Update Topic"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="border border-slate-400 text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}