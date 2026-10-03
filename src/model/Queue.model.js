import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
    {
        tokenNumber: {
            type: String,
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        status: {
            type: String,
            enum: [
                "WAITING",
                "SERVING",
                "COMPLETED",
                "CANCELLED",
                "SKIPPED"
            ],
            default: "WAITING"
        },

        priority: {
            type: String,
            enum: ["NORMAL", "HIGH"],
            default: "NORMAL"
        },

        queueDate: {
            type: String,
            required: true
        },

        calledAt: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;