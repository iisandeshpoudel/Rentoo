const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      // Log for debugging
      console.log('CheckRole middleware:', {
        userRole: req.user.role,
        requiredRoles: roles,
        user: req.user
      });

      if (!req.user || !req.user.role) {
        return res.status(403).json({ error: 'Role not found in token' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Access denied',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }

      next();
    } catch (err) {
      console.error('CheckRole middleware error:', err);
      res.status(500).json({ error: 'Role check failed' });
    }
  };
};

module.exports = checkRole; 