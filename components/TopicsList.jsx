import { HiPencilAlt } from "react-icons/hi"
import RemoveBtn from "./RemoveBtn";
import Link from "next/link";
import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

const PAGE_SIZE = 5;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getTopics = async (query, page) => {
    await connectMongoDB();
    const filter = query
        ? { $or: [{ title: { $regex: escapeRegExp(query), $options: "i" } }, { description: { $regex: escapeRegExp(query), $options: "i" } }] }
        : {};
    const totalCount = await Topic.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const topics = await Topic.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean();
    return {
        topics: topics.map((t) => ({ ...t, _id: t._id.toString(), owner: t.owner ? t.owner.toString() : null })),
        totalPages,
        currentPage: safePage,
    };
}

export default async function TopicsList({ query = "", page = 1 }) {
    const session = await getServerSession(authOptions);
    let topics = [];
    let totalPages = 1;
    let currentPage = 1;
    try {
        const result = await getTopics(query, page);
        topics = result.topics;
        totalPages = result.totalPages;
        currentPage = result.currentPage;
    } catch (error) {
        console.error("Error loading topics", error);
    }

    return (
        <>
        <SearchBar initialQuery={query} />
        {topics.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No se encontraron topics.</p>
        ) : (
            topics.map((topic) => {
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
            })
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} query={query} />
        </>
    );
}
