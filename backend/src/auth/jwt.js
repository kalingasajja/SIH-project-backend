// Import the jsonwebtoken library
const jwt = require("jsonwebtoken");
// Import dotenv to use environment variables
require("dotenv").config();

/**
 * Generates a JSON Web Token (JWT).
 * @param {object} payload - The payload to include in the token (e.g., user ID, role).
 * @returns {string} - The generated JWT.
 */
const generateToken = (payload) => {
  // Sign the token with the payload and the secret key from the .env file
  // The token will expire in 1 hour ('1h')
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Verifies a JSON Web Token (JWT).
 * @param {string} token - The JWT to verify.
 * @returns {object|null} - The decoded payload if the token is valid, otherwise null.
 */
const verifyToken = (token) => {
  try {
    // Verify the token using the same secret key
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // If verification fails (e.g., token is invalid or expired), return null
    console.error("Invalid token:", error.message);
    return null;
  }
};

// Export the functions to be used in other parts of the application
module.exports = {
  generateToken,
  verifyToken,
};
