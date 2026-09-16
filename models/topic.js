import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);

export default Topic;
