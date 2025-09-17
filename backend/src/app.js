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
const compatRoutes = require("./routes/compatRoutes");


// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON requests
// This is crucial for getting data from req.body
app.use(express.json());

// CORS configuration with explicit allowed origins for security
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://localhost:5000',
    'https://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.RAILWAY_STATIC_URL,
    process.env.HEROKU_APP_NAME && `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

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
app.use("/api", compatRoutes);

// Export the app module to be used by server.js
module.exports = app;
