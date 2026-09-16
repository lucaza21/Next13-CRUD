import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/app/actions/admin";
import RemoveUserBtn from "@/components/RemoveUserBtn";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }
    const users = await getAllUsers();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>
            {users.map((user) => (
                <div key={user._id} className="my-3 flex items-center justify-between gap-5 rounded-xl bg-white/80 p-4 shadow-md backdrop-blur">
                    <div>
                        <div className="font-semibold text-slate-800">{user.email}</div>
                        <div className="text-sm text-slate-500">{user.role}</div>
                    </div>
                    <RemoveUserBtn userId={user._id} currentUserId={session.user.id} />
                </div>
            ))}
        </div>
    );
}
