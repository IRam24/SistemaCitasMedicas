// middleware/authMiddleware.js

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'No autenticado' });
  }
};

module.exports = { isAuthenticated };