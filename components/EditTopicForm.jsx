"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditTipicForm({ id, title, description }) {
    const [newTitle, setNewtitle] = useState(title);
    const [newDescription, setNewDescription] = useState(description);

    const router = useRouter();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/api/topics/${id}`, {
                method:"PUT",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ newTitle, newDescription })
            });

            if(res.ok) {
                router.refresh();
                router.push("/");
            } else {
                throw new Error("Failed to edit topic");
            }
        } catch (error) {
            
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
            className="border border-slate-500 px-8 py-2"
            onChange={(e) => setNewtitle(e.target.value)}
            value={newTitle}
            type="text"
            placeholder="Topic Title"
        />
        <input 
            className="border border-slate-500 px-8 py-2"
            onChange={(e) => setNewDescription(e.target.value)}
            value={newDescription}
            type="text"
            placeholder="Topic Description"
        />
        <button type="submit" className="bg-green-600 font-bold text-white py-3 px-6 w-fit">
            Update Topic
        </button>
    </form>
    );
}