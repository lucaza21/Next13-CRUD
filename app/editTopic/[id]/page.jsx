import { notFound } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import TopicForm from "@/components/TopicForm";

const getTopicById = async (id) => {
    await connectMongoDB();
    try {
        const topic = await Topic.findById(id).lean();
        return topic;
    } catch (error) {
        if (error.name === "CastError") {
            return null;
        }
        throw error;
    }
}

export default async function EditTopic({ params }) {
    const { id } = params;
    const topic = await getTopicById(id);

    if (!topic) {
        notFound();
    }

    const { title, description } = topic;

    return (
        <div>
            <TopicForm mode="edit" id={id} initialTitle={title} initialDescription={description} />
        </div>
    );
}
