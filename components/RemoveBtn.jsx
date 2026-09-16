"use client"

import { HiOutlineTrash } from "react-icons/hi"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteTopic } from "@/app/actions/topics";

export default function RemoveBtn({ id }) {

    const router = useRouter();

    const performDelete = async () => {
        try {
            const result = await deleteTopic(id);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete topic");
        }
    }

    const removeTopic = () => {
        toast.custom((t) => (
            <div className="bg-white shadow-md rounded-md border border-slate-200 p-4">
                <p className="mb-2">¿Seguro que quieres eliminar este topic?</p>
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
        <button onClick={removeTopic} className="text-red-400">
            <HiOutlineTrash size={24}/>
        </button>
    );
}
