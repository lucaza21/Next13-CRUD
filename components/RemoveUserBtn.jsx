"use client"

import { HiOutlineTrash } from "react-icons/hi"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteUser } from "@/app/actions/admin";

export default function RemoveUserBtn({ userId, currentUserId }) {

    const router = useRouter();

    if (userId === currentUserId) {
        return null;
    }

    const performDelete = async () => {
        try {
            const result = await deleteUser(userId);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        }
    }

    const removeUser = () => {
        toast.custom((t) => (
            <div className="bg-white shadow-md rounded-md border border-slate-200 p-4">
                <p className="mb-2">¿Seguro que quieres eliminar este usuario?</p>
                <div className="flex gap-2 justify-end">
                    <button
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => { toast.dismiss(t.id); performDelete(); }}
                    >
                        Eliminar
                    </button>
                    <button
                        className="bg-gray-300 px-3 py-1 rounded"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    }
    return (
        <button onClick={removeUser} className="text-red-400">
            <HiOutlineTrash size={24}/>
        </button>
    );
}
