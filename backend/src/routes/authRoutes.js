const express = require("express");
const router = express.Router();

// Import the controller functions
const { register, login } = require("../controllers/authController");

// Import the authentication middleware
const authMiddleware = require("../auth/middleware/authMiddleware");

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", login);

// @route   GET api/auth/profile
// @desc    Get user profile data (a protected route)
// @access  Private
router.get("/profile", authMiddleware, (req, res) => {
  // Because authMiddleware was successful, the user's data is attached to req.user
  // We can now send it back as a confirmation.
  res.status(200).json({
    message: "You have accessed a protected route!",
    user: req.user, // req.user was set by the authMiddleware
  });
});

module.exports = router;
