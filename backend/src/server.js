// Import the configured Express application
const app = require("./app");
const blockchainMapper = require("./services/blockchainMapper");

// Determine the port to run the server on.
// It will use the PORT from the .env file, or default to 3000 if it's not defined.
const PORT = process.env.PORT || 3000;

// Initialize blockchain mapper
async function initializeBlockchain() {
  try {
    await blockchainMapper.initialize();
  } catch (error) {
    console.log('Blockchain initialization failed, continuing in prototype mode');
  }
}

// Start the server and listen for connections on the specified port
app.listen(PORT, async () => {
  console.log(
    `Server is running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
  
  // Initialize blockchain mapper
  await initializeBlockchain();
});
