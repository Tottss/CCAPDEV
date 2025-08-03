function requireAuth(req, res, next) {
  if (!req.session.user) {
    return req.session.destroy(() => {
      res.redirect('/login');
    });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return req.session.destroy(() => {
        res.redirect('/login');
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
