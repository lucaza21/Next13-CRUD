"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 350;

export default function SearchBar({ initialQuery = "" }) {
    const router = useRouter();
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    const runSearch = (searchValue) => {
        const params = new URLSearchParams();
        if (searchValue.trim()) {
            params.set("q", searchValue.trim());
        }
        params.set("page", "1");
        router.push(`/?${params.toString()}`);
    };

    const handleChange = (e) => {
        const nextValue = e.target.value;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(nextValue), DEBOUNCE_MS);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearTimeout(debounceRef.current);
        runSearch(inputRef.current?.value || "");
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input
                ref={inputRef}
                key={initialQuery}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400 bg-white"
                type="text"
                defaultValue={initialQuery}
                onChange={handleChange}
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
