export default function Loading() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin border-4 border-emerald-200 border-t-emerald-600 rounded-full w-10 h-10" />
            <span className="ml-4 text-slate-600 font-semibold">Cargando topics...</span>
        </div>
    );
}
