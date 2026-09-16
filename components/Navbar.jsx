"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-3 shadow-md rounded-b-xl">
            <Link className="text-white font-extrabold text-xl tracking-wide" href={"/"}> LACZ </Link>
            <div className="flex items-center gap-3">
                {status === "loading" ? null : session ? (
                    <>
                        <span className="text-slate-300 text-sm">{session.user.email}</span>
                        {session.user.role === "admin" && (
                            <Link
                                className="border border-amber-400 text-amber-300 px-4 py-2 rounded-lg font-semibold shadow hover:bg-amber-400/10 transition-colors"
                                href={"/admin"}
                            >
                                Admin
                            </Link>
                        )}
                        <Link
                            className="bg-emerald-500 px-4 py-2 rounded-lg font-semibold text-white shadow hover:bg-emerald-400 active:bg-emerald-600 transition-colors"
                            href={"/addTopic"}
                        >
                            Add Topic
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="border border-slate-400 text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            className="border border-slate-400 text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                            href={"/login"}
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            className="bg-emerald-500 px-4 py-2 rounded-lg font-semibold text-white shadow hover:bg-emerald-400 active:bg-emerald-600 transition-colors"
                            href={"/register"}
                        >
                            Registrarse
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
