import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },  
    password: {
        type: String,
        required: true  
    },
    
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
            type: String,
            enum: ["CUSTOMER", "STAFF", "ADMIN"],
            default: "CUSTOMER"
        },
    resetOtp: {
        type: String,
        default: null
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, {    
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;