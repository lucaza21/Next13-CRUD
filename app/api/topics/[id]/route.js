import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { newTitle: title, newDescription: description } = await request.json();
        await connectMongoDB();
        const updated = await Topic.findByIdAndUpdate(
            id,
            { title, description },
            { runValidators: true }
        );
        if (!updated) {
            return NextResponse.json(
                { message: "Topic not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ message: "Topic Updated" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to update topic" },
            { status: 500 }
        );
    }
}

export async function GET(request, { params }) {
    try {
        const { id } = params;
        await connectMongoDB();
        const topic = await Topic.findOne({ _id: id });
        if (!topic) {
            return NextResponse.json(
                { message: "Topic not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ topic }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to retrieve topic" },
            { status: 500 }
        );
    }
}
