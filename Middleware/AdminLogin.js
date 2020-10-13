exports.AdminLogin = (req, res, next) => {
    if (!req.session.AdminLoggedIn) {
      return res.redirect("/admin-login");
    }
  
    next();
};
exports.GlobalLogin = (req, res, next) => {
    if (!req.session.GlobalLoggedIn) {
      return res.redirect("/login");
    }
  
    next();
  };  
  
