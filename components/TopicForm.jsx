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
