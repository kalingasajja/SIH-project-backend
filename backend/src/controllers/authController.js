// Import the bcryptjs library for password hashing
const bcrypt = require("bcryptjs");
// Import the JWT generation function
const { generateToken } = require("../auth/jwt");
// Key management removed for initial implementation
// const { generateUserKeys } = require("../utils/keyManager");
const { users, pendingRegistrations, farmers, manufacturers, testers, regulators } = require("../data/store");

/**
 * Step 1: Initial user registration (email, password, role)
 * Creates a pending registration and returns JWT token
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const initialRegister = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Email, password, and role are required." 
      });
    }

    // Validate role (customers don't need accounts)
    const validRoles = ['farmer', 'manufacturer', 'tester', 'regulator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role. Must be one of: " + validRoles.join(', ') + ". Customers can scan QR codes without registration." 
      });
    }

    // Check if user already exists
    const userExists = users.find((user) => user.email === email);
    const pendingExists = pendingRegistrations.find((user) => user.email === email);
    
    if (userExists || pendingExists) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists." 
      });
    }

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate temporary user ID
    const tempUserId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a pending registration object
    const pendingUser = {
      tempUserId,
      email,
      password: hashedPassword,
      role,
      registrationStep: 1,
      isComplete: false,
      createdAt: new Date().toISOString()
    };

    // Add to pending registrations
    pendingRegistrations.push(pendingUser);

    // Create JWT payload for incomplete registration
    const payload = {
      id: tempUserId,
      email: email,
      role: role,
      registrationStep: 1,
      isComplete: false
    };

    // Generate the token
    const token = generateToken(payload);

    console.log("Initial registration completed:", tempUserId);
    res.status(201).json({ 
      success: true,
      message: "Initial registration successful! Please complete your profile.",
      token: token,
      registrationStep: 1,
      nextStep: "Complete role-specific registration",
      role: role
    });
  } catch (error) {
    console.error("Initial Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during initial registration.",
      error: error.message,
    });
  }
};

/**
 * Step 2: Complete role-specific registration
 * Validates and stores role-specific details, moves user to complete status
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const completeRegistration = async (req, res) => {
  try {
    const tempUserId = req.user.id; // From JWT token
    const role = req.user.role;
    const roleSpecificData = req.body;

    // Find pending registration
    const pendingUserIndex = pendingRegistrations.findIndex(user => user.tempUserId === tempUserId);
    if (pendingUserIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Pending registration not found. Please start registration again." 
      });
    }

    const pendingUser = pendingRegistrations[pendingUserIndex];

    // Validate role-specific data based on role
    const validationResult = validateRoleSpecificData(role, roleSpecificData);
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role-specific data",
        errors: validationResult.errors
      });
    }

    // Generate final user ID
    const finalUserId = `${role.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create complete user object
    const completeUser = {
      id: finalUserId,
      email: pendingUser.email,
      password: pendingUser.password,
      role: role,
      ...roleSpecificData,
      registrationStep: 2,
      isComplete: true,
      isVerified: false, // Needs verification
      createdAt: new Date().toISOString(),
      verifiedAt: null,
      // Keys removed in initial implementation
    };

    // Also add to role-specific in-memory stores for controllers
    if (role === 'farmer') {
      farmers.push({
        farmerId: finalUserId,
        farmerName: roleSpecificData.farmerName,
        contactInfo: roleSpecificData.contactInfo,
        licenseNumber: roleSpecificData.licenseNumber,
        farmLocation: roleSpecificData.farmLocation,
        role: 'farmer'
      });
    } else if (role === 'manufacturer') {
      manufacturers.push({
        manufacturerId: finalUserId,
        companyName: roleSpecificData.companyName,
        gmpLicense: roleSpecificData.gmpLicense,
        facilityLocation: roleSpecificData.facilityLocation,
        role: 'manufacturer'
      });
    } else if (role === 'tester') {
      testers.push({
        testerId: finalUserId,
        labName: roleSpecificData.labName,
        nablAccreditation: roleSpecificData.nablAccreditation,
        labLocation: roleSpecificData.labLocation,
        role: 'tester'
      });
    } else if (role === 'regulator') {
      regulators.push({
        regulatorId: finalUserId,
        regulatorName: roleSpecificData.regulatorName,
        department: roleSpecificData.department,
        jurisdiction: roleSpecificData.jurisdiction,
        authorityLevel: roleSpecificData.authorityLevel || 'STATE',
        role: 'regulator'
      });
    }

    // Move from pending to complete users
    users.push(completeUser);
    pendingRegistrations.splice(pendingUserIndex, 1);

    // Create new JWT payload for complete registration
    const payload = {
      id: finalUserId,
      email: completeUser.email,
      role: role,
      registrationStep: 2,
      isComplete: true,
      isVerified: false
    };

    // Generate new token
    const token = generateToken(payload);

    console.log("Registration completed:", finalUserId);
    res.status(201).json({ 
      success: true,
      message: "Registration completed successfully! Your account is pending verification.",
      token: token,
      registrationStep: 2,
      isComplete: true,
      isVerified: false,
      userId: finalUserId,
      nextStep: "Account verification pending"
    });
  } catch (error) {
    console.error("Complete Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration completion.",
      error: error.message,
    });
  }
};

/**
 * Validate role-specific registration data
 * @param {string} role - User role
 * @param {object} data - Role-specific data
 * @returns {object} Validation result
 */
const validateRoleSpecificData = (role, data) => {
  const errors = [];

  switch (role) {
    case 'farmer':
      if (!data.farmerName) errors.push("Farmer name is required");
      if (!data.contactInfo) errors.push("Contact info is required");
      if (!data.licenseNumber) errors.push("License number is required");
      if (!data.farmLocation) errors.push("Farm location is required");
      break;
    
    case 'manufacturer':
      if (!data.companyName) errors.push("Company name is required");
      if (!data.gmpLicense) errors.push("GMP license is required");
      if (!data.facilityLocation) errors.push("Facility location is required");
      break;
    
    case 'tester':
      if (!data.labName) errors.push("Lab name is required");
      if (!data.nablAccreditation) errors.push("NABL accreditation is required");
      if (!data.labLocation) errors.push("Lab location is required");
      break;
    
    // Customer registration removed - customers don't need accounts
    
    case 'regulator':
      if (!data.regulatorName) errors.push("Regulator name is required");
      if (!data.department) errors.push("Department is required");
      if (!data.jurisdiction) errors.push("Jurisdiction is required");
      break;
    
    default:
      errors.push("Invalid role");
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Handles user login.
 * Checks credentials and returns a JWT if they are valid.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required." 
      });
    }

    // Find the user by email in our in-memory store (check both pending and complete users)
    let user = users.find((user) => user.email === email);
    let isPending = false;
    
    if (!user) {
      // Check pending registrations
      const pendingUser = pendingRegistrations.find((user) => user.email === email);
      if (pendingUser) {
        user = pendingUser;
        isPending = true;
      } else {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials." 
        });
      }
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials." 
      });
    }

    // Handle pending registrations
    if (isPending) {
      // Create JWT payload for pending registration
      const payload = {
        id: user.tempUserId,
        email: user.email,
        role: user.role,
        registrationStep: 1,
        isComplete: false,
        isVerified: false
      };

      const token = generateToken(payload);

      return res.status(200).json({
        success: true,
        message: "Login successful! Please complete your registration.",
        token: token,
        user: {
          id: user.tempUserId,
          email: user.email,
          role: user.role,
          registrationStep: 1,
          isComplete: false,
          isVerified: false
        },
        nextStep: "Complete role-specific registration"
      });
    }

    // Check if registration is complete for existing users
    if (!user.isComplete) {
      return res.status(400).json({ 
        success: false,
        message: "Registration incomplete. Please complete your profile.",
        registrationStep: user.registrationStep,
        nextStep: "Complete role-specific registration"
      });
    }

    // If credentials are correct, create a payload for the JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      registrationStep: user.registrationStep,
      isComplete: user.isComplete,
      isVerified: user.isVerified
    };

    // Generate the token
    const token = generateToken(payload);

    // Send the token back to the client
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isComplete: user.isComplete,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login.", 
      error: error.message 
    });
  }
};

/**
 * Verify user account (Admin/Regulator function)
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { verificationStatus, verificationNotes } = req.body;

    // Find the user
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    const user = users[userIndex];

    // Update verification status
    users[userIndex] = {
      ...user,
      isVerified: verificationStatus === 'approved',
      verificationStatus: verificationStatus, // 'pending', 'approved', 'rejected'
      verificationNotes: verificationNotes || null,
      verifiedAt: verificationStatus === 'approved' ? new Date().toISOString() : null,
      verifiedBy: req.user.id // Admin/Regulator who verified
    };

    console.log(`User ${userId} verification status updated to: ${verificationStatus}`);

    res.status(200).json({ 
      success: true,
      message: `User verification status updated to: ${verificationStatus}`,
      user: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        role: users[userIndex].role,
        isVerified: users[userIndex].isVerified,
        verificationStatus: users[userIndex].verificationStatus
      }
    });
  } catch (error) {
    console.error("User Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during user verification.",
      error: error.message,
    });
  }
};

/**
 * Get pending verifications (Admin/Regulator function)
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const getPendingVerifications = async (req, res) => {
  try {
    // Get users pending verification
    const pendingUsers = users.filter(user => 
      user.isComplete && !user.isVerified && user.verificationStatus !== 'rejected'
    );

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = pendingUsers.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Pending verifications retrieved successfully",
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: page,
          totalUsers: pendingUsers.length,
          totalPages: Math.ceil(pendingUsers.length / limit),
          hasNextPage: endIndex < pendingUsers.length,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Get Pending Verifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving pending verifications.",
      error: error.message,
    });
  }
};

/**
 * Get user registration status
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const getRegistrationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user exists in complete users
    const user = users.find(u => u.id === userId);
    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          registrationStep: user.registrationStep,
          isComplete: user.isComplete,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus || 'pending',
          role: user.role,
          email: user.email
        }
      });
    }

    // Check if user exists in pending registrations
    const pendingUser = pendingRegistrations.find(u => u.tempUserId === userId);
    if (pendingUser) {
      return res.status(200).json({
        success: true,
        data: {
          registrationStep: pendingUser.registrationStep,
          isComplete: false,
          isVerified: false,
          verificationStatus: 'incomplete',
          role: pendingUser.role,
          email: pendingUser.email
        }
      });
    }

    res.status(404).json({
      success: false,
      message: "User not found"
    });
  } catch (error) {
    console.error("Get Registration Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving registration status.",
      error: error.message,
    });
  }
};

module.exports = {
  initialRegister,
  completeRegistration,
  login,
  verifyUser,
  getPendingVerifications,
  getRegistrationStatus,
  validateRoleSpecificData
};
