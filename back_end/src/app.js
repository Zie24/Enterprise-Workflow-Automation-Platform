const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/request");
const taskRoutes = require("./routes/task");
const notificationRoutes = require("./routes/notification");
const teamRoutes = require("./routes/teams");
const otpRoutes = require("./routes/otp");
const settingsRoutes = require("./routes/settings");
const path = require("path");
const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// No-cache لـ /requests فقط
app.use("/requests", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/requests", requestRoutes);
app.use("/tasks", taskRoutes);
app.use("/notifications", notificationRoutes);
app.use("/settings", settingsRoutes);

app.use("/teams", teamRoutes);
app.use("/otp", otpRoutes);
app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
);

app.get("/", (req, res) => {
  res.send("Enterprise Workflow Automation API");
});

module.exports = app;