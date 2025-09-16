// Load environment variables from the .env file
require("dotenv").config();

const express = require("express");

// Import your route handlers
const authRoutes = require("./routes/authRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const manufacturerRoutes = require("./routes/manufacturerRoutes");
const testerRoutes = require("./routes/testerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const regulatorRoutes = require("./routes/regulatorRoutes");
const custodyRoutes = require("./routes/custodyRoutes");


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
app.use("/api/manufacturer", manufacturerRoutes);
app.use("/api/tester", testerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/regulator", regulatorRoutes);
app.use("/api/custody", custodyRoutes);

// Export the app module to be used by server.js
module.exports = app;
