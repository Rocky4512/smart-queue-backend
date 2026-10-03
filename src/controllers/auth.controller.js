import User from "../model/User.model.js";
import gentoken from "../utils/token.js";
import bcrypt from "bcrypt";
import {sendOtpEmail} from "../utils/mail.js";


export const signUp = async (req, res) => {
    try {
        const { name, email, password, mobile, role } = req.body;
        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        if(password.length<6){
            return res.status(400).json({
                message:"Password must be atlest of 6 digits",
            })
        }

        if(mobile.length<10){
            return res.status(400).json({
                message:"Mobile number must be of 10 digits",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            role,
            mobile
        })

        const token = await gentoken(user._id)

        res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        res.status(201).json({
            message: "User created successfully",
            user,
            token
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }  
} 

export const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;   
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: "user does not exist" });
        }

        const isMatch = await bcrypt.compare(password,existingUser.password);

        if(!isMatch){
            return res.status(400).json({ message: "Incorrect Password" });
        }

        const token = await gentoken(existingUser._id)

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        return res.status(200).json({   
            message: "Login successful",
            user: existingUser,
            token
        });
    }   catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Send OTP error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email }); 
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        user.isOtpVerified = true;
        user.resetOtp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Verify OTP error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isOtpVerified) {
            return res.status(400).json({ message: "OTP not verified" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    }catch (error) {
        console.error("Reset Password error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};



