"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get("q") || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (value.trim()) {
            params.set("q", value.trim());
        }
        params.set("page", "1");
        router.push(`/?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400 bg-white"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Buscar por título o descripción..."
            />
            <button
                type="submit"
                className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-emerald-700 transition-colors"
            >
                Buscar
            </button>
        </form>
    );
}
