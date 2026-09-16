"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import NextLink from "next/link";
import toast from "react-hot-toast";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await registerUser({ email, password });
            if (result.success) {
                toast.success(result.message);
                await signIn("credentials", { email, password, redirect: false });
                router.push("/");
                router.refresh();
            } else if (result.errors) {
                const messages = Object.values(result.errors).flat().join("\n");
                toast.error(messages || "Datos inválidos");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to register");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-sm mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Crear cuenta</h1>
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
                    autoComplete="new-password"
                />
                <input
                    className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow placeholder:text-slate-400"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    type="password"
                    placeholder="Confirmar contraseña"
                    autoComplete="new-password"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 font-bold text-white py-3 px-6 rounded-lg shadow hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creando cuenta..." : "Registrarse"}
                </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
                ¿Ya tienes cuenta?{" "}
                <NextLink href="/login" className="text-emerald-600 font-semibold hover:underline">
                    Inicia sesión
                </NextLink>
            </p>
        </div>
    );
}
