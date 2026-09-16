import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { title, description } = await request.json();
        if (!title || !description) {
            return NextResponse.json(
                { message: "title y description son requeridos" },
                { status: 400 }
            );
        }
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
