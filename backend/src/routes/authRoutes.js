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

// @route   GET api/auth/debug
// @desc    Debug endpoint to see current system state
// @access  Public (for debugging)
router.get("/debug", (req, res) => {
  const { users, pendingRegistrations, farmers, manufacturers, testers, regulators } = require("../data/store");
  
  res.status(200).json({
    success: true,
    message: "Debug information",
    data: {
      totalUsers: users.length,
      pendingRegistrations: pendingRegistrations.length,
      farmers: farmers.length,
      manufacturers: manufacturers.length,
      testers: testers.length,
      regulators: regulators.length,
      users: users.map(u => ({ id: u.id, email: u.email, role: u.role, isComplete: u.isComplete })),
      pending: pendingRegistrations.map(p => ({ tempUserId: p.tempUserId, email: p.email, role: p.role }))
    }
  });
});

// @route   GET api/auth/debug-compat
// @desc    Debug endpoint to see compatibility events
// @access  Public (for debugging)
router.get("/debug-compat", (req, res) => {
  const compatController = require("../controllers/compatController");
  
  res.status(200).json({
    success: true,
    message: "Compatibility events debug information",
    data: {
      // This will show the compatStore from the controller
      note: "Check server console for detailed logs of received events"
    }
  });
});

module.exports = router;
