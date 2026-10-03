import express from "express";
import cookieParser from "cookie-parser";  
import cors from "cors";
import serviceRoutes from "./routes/service.routes.js";
import authRoutes from "./routes/auth.routes.js";
import queueRoutes from "./routes/queue.routes.js";


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get("/", (req, res) => {
    res.json({
        message: "Smart Queue Management System API is running"
    });
});

app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);

export default app;
