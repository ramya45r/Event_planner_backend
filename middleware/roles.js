export const permit = (...allowedRoles) => (req, res, next) => {
    console.log(req.user,'user');
    
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (allowedRoles.includes(req.user.role)) return next();
  return res.status(403).json({ message: "Forbidden" });
};
