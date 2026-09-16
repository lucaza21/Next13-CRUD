import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-3 shadow-md rounded-b-xl">
            <Link className="text-white font-extrabold text-xl tracking-wide" href={"/"}> LACZ </Link>
            <Link
                className="bg-emerald-500 px-4 py-2 rounded-lg font-semibold text-white shadow hover:bg-emerald-400 active:bg-emerald-600 transition-colors"
                href={"/addTopic"}
            >
                Add Topic
            </Link>
        </nav>
    );
}
