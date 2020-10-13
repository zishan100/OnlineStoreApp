module.exports = (req, res, next) => {
  if (!req.session.GlobalLoggedIn) {
    return res.redirect("/login");
  }

  next();
};
