require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import routes
const authRoutes = require("./routes/auth.routes");
const credentialRoutes = require("./routes/credential.routes");
const verificationRoutes = require("./routes/verification.routes");
const aiRoutes = require("./routes/ai.routes");
const chatbotRoutes = require("./routes/chatbot.routes");
const institutionRoutes = require("./routes/institution.routes");
const studentRoutes = require("./routes/student.routes");
const employerRoutes = require("./routes/employer.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Yogyata API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/employers", employerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Yogyata Backend running on port ${PORT}`);
});
