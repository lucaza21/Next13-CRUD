"use client"

import { HiOutlineTrash } from "react-icons/hi"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RemoveBtn({ id }) {

    const router = useRouter();

    const deleteTopic = async () => {
        try {
            const res = await fetch(`/api/topics?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Topic eliminado correctamente");
                router.refresh();
            } else {
                throw new Error("Failed to delete topic");
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
                        onClick={() => { toast.dismiss(t.id); deleteTopic(); }}
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
