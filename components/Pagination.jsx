import Link from "next/link";

export default function Pagination({ currentPage, totalPages, query = "" }) {
    if (totalPages <= 1) return null;

    const buildHref = (targetPage) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("page", String(targetPage));
        return `/?${params.toString()}`;
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-6">
            {currentPage <= 1 ? (
                <span className="rounded-lg border border-slate-300 px-4 py-2 text-slate-400 pointer-events-none opacity-40">Anterior</span>
            ) : (
                <Link
                    href={buildHref(currentPage - 1)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    Anterior
                </Link>
            )}
            <span className="text-slate-600">Página {currentPage} de {totalPages}</span>
            {currentPage >= totalPages ? (
                <span className="rounded-lg border border-slate-300 px-4 py-2 text-slate-400 pointer-events-none opacity-40">Siguiente</span>
            ) : (
                <Link
                    href={buildHref(currentPage + 1)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    Siguiente
                </Link>
            )}
        </div>
    );
}
