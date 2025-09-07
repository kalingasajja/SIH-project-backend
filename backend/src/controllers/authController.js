// Import the bcryptjs library for password hashing
const bcrypt = require("bcryptjs");
// Import the JWT generation function
const { generateToken } = require("../auth/jwt");

// In-memory user store for demonstration purposes.
// In a real application, you would use a database.
const users = [];

/**
 * Handles user registration.
 * Hashes the user's password and "saves" them to our in-memory store.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Check if user already exists
    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object
    const newUser = {
      id: users.length + 1, // Simple ID generation
      username,
      password: hashedPassword,
      role: role || "customer", // Default role to 'customer' if not provided
    };

    // Add the new user to our in-memory array
    users.push(newUser);

    console.log("User registered:", newUser);
    res
      .status(201)
      .json({ message: "User registered successfully!", userId: newUser.id });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

/**
 * Handles user login.
 * Checks credentials and returns a JWT if they are valid.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Find the user by username in our in-memory store
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // If credentials are correct, create a payload for the JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // Generate the token
    const token = generateToken(payload);

    // Send the token back to the client
    res.status(200).json({
      message: "Login successful!",
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
