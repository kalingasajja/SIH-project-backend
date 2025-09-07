// Import the configured Express application
const app = require("./app");

// Determine the port to run the server on.
// It will use the PORT from the .env file, or default to 5000 if it's not defined.
const PORT = process.env.PORT || 5000;

// Start the server and listen for connections on the specified port
app.listen(PORT, () => {
  console.log(
    `Server is running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
