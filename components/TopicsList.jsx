import { HiPencilAlt } from "react-icons/hi"
import RemoveBtn from "./RemoveBtn";
import Link from "next/link";
import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

const getTopics = async () => {
    await connectMongoDB();
    const topics = await Topic.find().lean();
    return topics.map((t) => ({ ...t, _id: t._id.toString(), owner: t.owner ? t.owner.toString() : null }));
}

export default async function TopicsList() {
    const session = await getServerSession(authOptions);
    let topics = [];
    try {
        topics = await getTopics();
    } catch (error) {
        console.error("Error loading topics", error);
    }

    return (
        <>
        {topics.map((topic) => {
            const canManage = session?.user && (session.user.role === "admin" || topic.owner === session.user.id);
            return (
            <div key={topic._id} className="my-3 flex items-start justify-between gap-5 rounded-xl bg-white/80 p-4 shadow-md backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{topic.title}</h2>
                <div className="text-slate-600">{topic.description}</div>
            </div>
            {canManage && (
            <div className="flex gap-2">
                <RemoveBtn id={topic._id}/>
                <Link
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                    href={`/editTopic/${topic._id}`}
                >
                    <HiPencilAlt size={24} />
                </Link>
            </div>
            )}
        </div>
            );
        })}
        </>
    );
}
