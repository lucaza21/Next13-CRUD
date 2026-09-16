import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { NextResponse } from "next/server";
import { topicSchema } from "@/libs/validation";

export async function POST(request) {
    try {
        const body = await request.json();
        const result = topicSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const { title, description } = result.data;
        await connectMongoDB();
        await Topic.create({ title, description });
        return NextResponse.json({ message: "Topic Created" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to create topic" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectMongoDB();
        const topics = await Topic.find();
        return NextResponse.json({ topics });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to retrieve topics" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const id = request.nextUrl.searchParams.get("id");
        await connectMongoDB();
        await Topic.findByIdAndDelete(id);
        return NextResponse.json({ message: "Topic Deleted" }, { status: 200 });
    } catch (error) {
        console.error(error);
        if (error.name === "CastError") {
            return NextResponse.json(
                { message: "Invalid topic id" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Failed to delete topic" },
            { status: 500 }
        );
    }
}
