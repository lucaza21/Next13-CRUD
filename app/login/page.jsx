"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import NextLink from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await signIn("credentials", { email, password, redirect: false });
            if (res?.error) {
                toast.error("Email o contraseña incorrectos");
            } else if (res?.ok) {
                toast.success("Sesión iniciada");
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error("Email o contraseña incorrectos");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-sm mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                />
                <input
                    className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    placeholder="Contraseña"
                    autoComplete="current-password"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 font-bold text-white py-3 px-6 rounded-lg shadow hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
                ¿No tienes cuenta?{" "}
                <NextLink href="/register" className="text-emerald-600 font-semibold hover:underline">
                    Regístrate
                </NextLink>
            </p>
        </div>
    );
}
