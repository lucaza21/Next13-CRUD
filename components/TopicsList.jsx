import { HiPencilAlt } from "react-icons/hi"
import RemoveBtn from "./RemoveBtn";
import Link from "next/link";
import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";

const getTopics = async () => {
    await connectMongoDB();
    const topics = await Topic.find().lean();
    return topics.map((t) => ({ ...t, _id: t._id.toString() }));
}

export default async function TopicsList() {
    let topics = [];
    try {
        topics = await getTopics();
    } catch (error) {
        console.error("Error loading topics", error);
    }

    return (
        <>
        {topics.map((topic) => (
            <div key={topic._id} className="p-4 border border-slate-300 my-3 flex justify-between gap-5 items-start">
            <div>
                <h2 className="font-bold text-2xl">{topic.title}</h2>
                <div>{topic.description}</div>
            </div>
            <div className="flex gap-2">
                <RemoveBtn id={topic._id}/>
                <Link href={`/editTopic/${topic._id}`}>
                    <HiPencilAlt size={24} />
                </Link>
            </div>
        </div>
        ))}
        </>
    );
}
