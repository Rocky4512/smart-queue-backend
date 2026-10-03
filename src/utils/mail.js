import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOtpEmail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Reset Your Password',
        html: ` 
            <!DOCTYPE html>
            <html> 
            <head>
                <meta charset="UTF-8"> 
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title> 
            </head>
            
            <body style=" 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
                font-family: Arial, Helvetica, sans-serif; 
                "> 
                
                <div style=" 
                    max-width: 600px; 
                    margin: 40px auto; 
                    background-color: #ffffff; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
                "> 

                    <!-- Header --> 
                    <div style=" 
                        background-color: #111827; 
                        padding: 25px; 
                        text-align: center; 
                    "> 
                    
                    <h1 style=" 
                        margin: 0; 
                        color: #ffffff; 
                        font-size: 28px; 
                    ">
                        Smart Queue 
                    </h1> 
                    
                    <p style=" 
                        margin: 8px 0 0; 
                        color: #d1d5db; 
                        font-size: 14px; 
                    "> 
                        Secure Account Verification 
                    </p> 
                </div> 

                    <!-- Content -->
                    <div style="padding: 35px 30px;">
                    
                        <h2 style=" 
                            margin-top: 0;
                            color: #111827;
                            font-size: 22px; 
                        "> 
                            Reset Your Password 
                        </h2> 
                        
                        <p style=" 
                            color: #4b5563;
                            font-size: 15px;
                            line-height: 1.6; 
                        "> 
                            We received a request to reset your password. Use the OTP below to continue. 
                        </p> 
                        
                        <!-- OTP Box --> 
                        <div style=" 
                            margin: 30px 0; 
                            text-align: center; 
                        "> 
                        <p style=" 
                            margin-bottom: 10px; 
                            color: #6b7280; 
                            font-size: 13px; 
                            text-transform: uppercase; 
                            letter-spacing: 1px; 
                        "> 
                            Your OTP 
                        </p> 
                        <div style=" 
                            display: inline-block; 
                            background-color: #f3f4f6; 
                            border: 2px dashed #9ca3af; 
                            border-radius: 10px; 
                            padding: 18px 35px; 
                        "> 
                            <span style=" 
                            font-size: 32px; 
                            font-weight: bold; 
                            letter-spacing: 8px; 
                            color: #111827; "> 
                                ${otp} 
                            </span> 
                        </div> 
                    </div> 

                    <p style=" 
                        color: #4b5563; 
                        font-size: 14px; 
                        line-height: 1.6; 
                    "> 
                        This OTP is valid for <strong>10 minutes</strong>. 
                        Please do not share this code with anyone. 
                    </p> 
                    
                    <div style="
                        margin-top: 25px; 
                        padding: 15px; 
                        background-color: #fff7ed; 
                        border-left: 4px solid #f97316; 
                        border-radius: 5px; 
                    "> 
                        <p style=" 
                            margin: 0; 
                            color: #9a3412; 
                            font-size: 13px; 
                        "> 
                            If you did not request a password reset, 
                            you can safely ignore this email. 
                        </p>
                    </div> 
                    
                </div> 
                
                <!-- Footer --> 
                <div style=" 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    text-align: center; 
                    border-top: 1px solid #e5e7eb; 
                "> 
                <p style=" 
                    margin: 0; 
                    color: #9ca3af; 
                    font-size: 12px; 
                "> 
                    © 2026 Smart Queue. All rights reserved. 
                </p> 
                
                <p style=" margin: 8px 0 0; 
                    color: #9ca3af; 
                    font-size: 12px; 
                "> 
                    This is an automated email. Please do not reply. 
                </p> 
                </div> 
                
            </div> 
            
        </body> 
    </html> `
    });
}


export const sendQueueTokenEmail = async (to, name, tokenNumber, serviceName) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Your Smart Queue Token",
        html: `
            <!DOCTYPE html>
            <html>
            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                ">

                    <div style="
                        background-color: #111827;
                        padding: 25px;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: white;
                        ">
                            Smart Queue
                        </h1>

                        <p style="color: #d1d5db;">
                            Queue Token Confirmation
                        </p>
                    </div>

                    <div style="padding: 35px 30px;">

                        <h2>Hello ${name},</h2>

                        <p style="
                            color: #4b5563;
                            font-size: 15px;
                        ">
                            You have successfully joined the queue.
                        </p>

                        <div style="
                            margin: 30px 0;
                            text-align: center;
                        ">

                            <p style="color: #6b7280;">
                                YOUR TOKEN
                            </p>

                            <div style="
                                display: inline-block;
                                background-color: #f3f4f6;
                                border: 2px dashed #9ca3af;
                                border-radius: 10px;
                                padding: 18px 35px;
                            ">
                                <span style="
                                    font-size: 32px;
                                    font-weight: bold;
                                    letter-spacing: 5px;
                                    color: #111827;
                                ">
                                    ${tokenNumber}
                                </span>
                            </div>

                        </div>

                        <p>
                            <strong>Service:</strong> ${serviceName}
                        </p>

                        <p>
                            <strong>Status:</strong> WAITING
                        </p>

                        <p style="
                            color: #4b5563;
                            font-size: 14px;
                        ">
                            Please wait for your turn. We will notify you
                            when your token is being served.
                        </p>

                    </div>

                    <div style="
                        background-color: #f9fafb;
                        padding: 20px;
                        text-align: center;
                    ">
                        <p style="
                            margin: 0;
                            color: #9ca3af;
                            font-size: 12px;
                        ">
                            © 2026 Smart Queue
                        </p>
                    </div>

                </div>

            </body>
            </html>
        `
    });
};


export const sendServingEmail = async (
    email,
    name,
    tokenNumber,
    serviceName
) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Turn Has Arrived - Smart Queue",
        html: `
            <!DOCTYPE html>
            <html>
            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                ">

                    <div style="
                        background-color: #111827;
                        padding: 25px;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: white;
                        ">
                            Smart Queue
                        </h1>

                        <p style="color: #d1d5db;">
                            Your Turn Has Arrived
                        </p>
                    </div>

                    <div style="padding: 35px 30px;">

                        <h2>Hello ${name},</h2>

                        <p style="
                            color: #4b5563;
                            font-size: 16px;
                        ">
                            Your turn has arrived!
                        </p>

                        <div style="
                            margin: 30px 0;
                            text-align: center;
                        ">

                            <div style="
                                display: inline-block;
                                background-color: #f3f4f6;
                                border: 2px solid #111827;
                                border-radius: 10px;
                                padding: 18px 35px;
                            ">
                                <span style="
                                    font-size: 32px;
                                    font-weight: bold;
                                    letter-spacing: 5px;
                                    color: #111827;
                                ">
                                    ${tokenNumber}
                                </span>
                            </div>

                        </div>

                        <p>
                            <strong>Service:</strong> ${serviceName}
                        </p>

                        <p>
                            <strong>Status:</strong> SERVING
                        </p>

                        <p style="
                            color: #4b5563;
                            font-size: 15px;
                        ">
                            Please proceed to the service counter.
                        </p>

                    </div>

                    <div style="
                        background-color: #f9fafb;
                        padding: 20px;
                        text-align: center;
                    ">
                        <p style="
                            margin: 0;
                            color: #9ca3af;
                            font-size: 12px;
                        ">
                            © 2026 Smart Queue
                        </p>
                    </div>

                </div>

            </body>
            </html>
        `
    });
};
