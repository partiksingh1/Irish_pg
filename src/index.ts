import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute";
import listRouter from "./routes/properties";
import InquiryRouter from "./routes/inquiries";
import FavoriteRouter from "./routes/favourite";
import ChatRouter from "./routes/chat";
import http from "http"; // Import http to create a custom server
import socketIo from "socket.io"; // If you're using socket.io

dotenv.config();

const app = express();
const port = 3000;

// Create an HTTP server from Express app
const server = http.createServer(app);

// Initialize socket.io with the HTTP server
const io = new socketIo.Server(server, {
  cors: {
    origin: "*", // Allow all origins (you can limit this for production)
    methods: ["GET", "POST"],
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("a user connected");

  // Example: Listen for a custom event
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // You can emit messages or handle other events here
  socket.emit("welcome", { message: "Welcome to the WebSocket server!" });
});

// Middleware
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Routes
app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the Express server with WebSockets!");
});

app.use("/api/v1", userRoute);
app.use("/api/v1", listRouter);
app.use("/api/v1", InquiryRouter);
app.use("/api/v1", FavoriteRouter);
app.use("/api/v1", ChatRouter);

// Start the server (this now starts both HTTP and WebSocket)
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
