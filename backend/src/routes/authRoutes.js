const express = require("express");
const router = express.Router();

// Import the controller functions
const { 
  initialRegister, 
  completeRegistration, 
  login, 
  verifyUser, 
  getPendingVerifications, 
  getRegistrationStatus 
} = require("../controllers/authController");

// Import the authentication middleware
const authMiddleware = require("../auth/middleware/authMiddleware");

// @route   POST api/auth/register
// @desc    Step 1: Initial user registration (email, password, role)
// @access  Public
router.post("/register", initialRegister);

// @route   POST api/auth/complete-registration
// @desc    Step 2: Complete role-specific registration
// @access  Private (requires JWT from step 1)
router.post("/complete-registration", authMiddleware, completeRegistration);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", login);

// @route   GET api/auth/registration-status
// @desc    Get user registration status
// @access  Private
router.get("/registration-status", authMiddleware, getRegistrationStatus);

// @route   GET api/auth/pending-verifications
// @desc    Get users pending verification (Admin/Regulator only)
// @access  Private (Admin/Regulator only)
router.get("/pending-verifications", authMiddleware, getPendingVerifications);

// @route   PUT api/auth/verify-user/:userId
// @desc    Verify user account (Admin/Regulator only)
// @access  Private (Admin/Regulator only)
router.put("/verify-user/:userId", authMiddleware, verifyUser);

// @route   GET api/auth/profile
// @desc    Get user profile data (a protected route)
// @access  Private
router.get("/profile", authMiddleware, (req, res) => {
  // Because authMiddleware was successful, the user's data is attached to req.user
  // We can now send it back as a confirmation.
  res.status(200).json({
    success: true,
    message: "You have accessed a protected route!",
    user: req.user, // req.user was set by the authMiddleware
  });
});

module.exports = router;
