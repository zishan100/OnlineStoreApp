exports.getError = (req, res, next) => {
  return res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticate: req.session.LoggedIn,
    isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn
  });
  // res.status(404).send("<h1>Page Not Found!</h1>");
};
exports.get500 = (req, res, next) => {
 return res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticate: req.session.LoggedIn,
    isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn
  });
  // res.status(404).send("<h1>Page Not Found!</h1>");
};
