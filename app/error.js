"use client";

export default function Error({ error, reset }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-2">Algo salió mal</h2>
            <p className="text-slate-600 mb-6">
                Ocurrió un error inesperado al cargar esta página.
            </p>
            <button
                onClick={() => reset()}
                className="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-emerald-700 transition-colors"
            >
                Reintentar
            </button>
        </div>
    );
}
