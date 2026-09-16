import { notFound } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import EditTopicForm from "@/components/EditTopicForm";

const getTopicById = async (id) => {
    await connectMongoDB();
    const topic = await Topic.findById(id).lean();
    return topic;
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
            <EditTopicForm id={id} title={title} description={description} />
        </div>
    );
}
