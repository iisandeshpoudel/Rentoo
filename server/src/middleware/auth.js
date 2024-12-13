const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Get the token part after "Bearer "
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      role: decoded.role
    };
    
    // Log for debugging
    console.log('Auth middleware - decoded token:', {
      userId: decoded.userId,
      role: decoded.role
    });

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;
