import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        prefix: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        averageServiceTime: {
            type: Number,
            required: true,
            default: 5
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;