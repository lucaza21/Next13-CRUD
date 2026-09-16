import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Página no encontrada</h2>
            <p className="text-slate-600 mb-6">El recurso que buscas no existe o fue eliminado.</p>
            <Link
                href="/"
                className="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-emerald-700 transition-colors"
            >
                Volver al inicio
            </Link>
        </div>
    );
}
