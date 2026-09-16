"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 350;

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get("q") || "");
    const debounceRef = useRef(null);

    const runSearch = (searchValue) => {
        const params = new URLSearchParams();
        if (searchValue.trim()) {
            params.set("q", searchValue.trim());
        }
        params.set("page", "1");
        router.push(`/?${params.toString()}`);
    };

    // Mantiene el input sincronizado con la URL real (ej. tras una
    // navegación por historial, o si el componente se remonta a mitad de
    // una transición de Next), en vez de confiar solo en el estado inicial.
    useEffect(() => {
        setValue(searchParams.get("q") || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        if (value === currentQ) return;
        // Un campo vacío no dispara búsqueda automática: hay que enviar el
        // formulario explícitamente para volver a traer todos los items.
        if (value.trim() === "") return;

        debounceRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleSubmit = (e) => {
        e.preventDefault();
        clearTimeout(debounceRef.current);
        runSearch(value);
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
