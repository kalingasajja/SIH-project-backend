// Load environment variables from the .env file
require("dotenv").config();

const express = require("express");

// Import your route handlers
const authRoutes = require("./routes/authRoutes");
const roleMiddleware = require("./auth/middleware/roleMiddleware");
const farmerRoutes = require("./routes/farmerRoutes");


// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON requests
// This is crucial for getting data from req.body
app.use(express.json());

// Define a simple root route for testing if the server is up
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Use the authentication routes
// All routes defined in authRoutes.js will be prefixed with /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);

// Export the app module to be used by server.js
module.exports = app;
