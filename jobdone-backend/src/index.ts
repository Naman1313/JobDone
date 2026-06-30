import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import morgan from "morgan";

// Config & Database
import "./config/firebase";
import connectDB from "./config/database";

// Routes
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import profileRoutes from "./routes/profileRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import postRoutes from "./routes/postRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import chatRoutes from "./routes/chatRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import emergencyRoutes from "./routes/emergencyRoutes";
import Message from "./models/Message";
import Conversation from "./models/Conversation";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/workers", profileRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/conversations", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/emergency", emergencyRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// Socket.io Events
io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
    });

    socket.on("send_message", async (data) => {
        const { conversationId, senderId, content } = data;
        
        try {
            const message = await Message.create({
                conversationId,
                senderId,
                content
            });

            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: content
            });

            io.to(conversationId).emit("receive_message", message);
        } catch (err) {
            console.error("Error saving message", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
