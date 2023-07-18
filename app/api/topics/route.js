import connectMongoDB from "@/libs/mongodb";
import Topic from "@/models/topic";
import { NextResponse } from "next/server";

export async function POST(request) {
    const {title, description} = await request.json()
    await connectMongoDB();
    await Topic.create({ title, description });
    console.log("Topic Created")
    return NextResponse.json({ message: "Topic Created" }, { status:201 });
}

export async function GET() {
    await connectMongoDB();
    const topics = await Topic.find();
    console.log("Topics Retrieved")
    return NextResponse.json({ topics })
}

export async function DELETE(request) {
    const id = request.nextUrl.searchParams.get("id");
    await connectMongoDB();
    await Topic.findByIdAndDelete(id);
    console.log("Topic Deleted")
    return NextResponse.json({ message: "Topic Deleted" }, { status:200 });
}