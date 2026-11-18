const express    = require("express");
const http       = require("http");
const socketio   = require("socket.io");
const cors       = require("cors");
const dotenv     = require("dotenv");
const path       = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB    = require("./config/db");
const chatSocket   = require("./sockets/chat.socket");

const authRoutes        = require("./routes/auth.routes");
const attendanceRoutes  = require("./routes/attendance.routes");
const notesRoutes       = require("./routes/notes.routes");
const sessionRoutes     = require("./routes/session.routes");
const marketplaceRoutes = require("./routes/marketplace.routes");
const teacherRoutes     = require("./routes/teacher.routes");

connectDB();

const app    = express();
const server = http.createServer(app);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const io = socketio(server, {
  cors: { origin: frontendUrl, methods: ["GET","POST"] }
});
chatSocket(io);

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",        authRoutes);
app.use("/api/attendance",  attendanceRoutes);
app.use("/api/notes",       notesRoutes);
app.use("/api/sessions",    sessionRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/teachers",    teacherRoutes);

app.get("/", (req, res) => res.json({ message: "Learning Hub API running" }));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
