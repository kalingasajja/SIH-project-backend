// Import the JWT verification function we created earlier
const { verifyToken } = require("../jwt");

/**
 * Middleware to authenticate requests using a JWT.
 * It checks for a token in the 'Authorization' header.
 * If the token is valid, it attaches the decoded payload to the request object.
 * If the token is missing or invalid, it sends a 401 Unauthorized or 403 Forbidden response.
 */
const authMiddleware = (req, res, next) => {
  // Get the 'Authorization' header from the incoming request
  const authHeader = req.headers["authorization"];

  // The header format is "Bearer <token>". We split it to get just the token.
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided in the header, send a 401 Unauthorized error
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Verify the token
  const decoded = verifyToken(token);

  // If the token is invalid (verifyToken returns null), send a 403 Forbidden error
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  // If the token is valid, attach the decoded payload to the request object as 'req.user'
  // This makes the user's information (e.g., ID, role) available to subsequent route handlers
  req.user = decoded;

  // Call next() to pass control to the next middleware or route handler in the chain
  next();
};

module.exports = authMiddleware;
