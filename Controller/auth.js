const User = require("../Modals/user");
const AdminUser = require('../Modals/adminUser');
const bcryptjs = require("bcryptjs");
/* Using NodeMailer to Send Mail from Server */

const { validationResult } = require("express-validator/check");
const crypto = require("crypto");
const fs = require('../Middleware/file');


exports.GetLogin = (req, res, next) => {
  if (!req.session.GlobalLoggedIn) {
    let alertmsg = req.flash("error");

    return res.render("Authen/login", {
      pageTitle: "Login",
      path: "/login",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: alertmsg[0],
      userinput: {
        email: "",
        password: "",
      },
    });
  } else {
    res.redirect("/");
  }
};

exports.PostLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg;
    return res.status(422).render("Authen/login", {
      pageTitle: "Login Page",
      path: "/login",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: msg,
      userinput: {
        email: email,
        password: password,
      },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      bcryptjs
        .compare(password, user.password)
        .then((DoMatch) => {
          if (DoMatch) {
            req.session.GlobalLoggedIn = true;
            req.session.LoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid User Password!");
          return res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("Error Message", err);
    });

 
};

exports.PostLogout = (req, res, next) => {
  req.session.destroy();
  // req.csrfToken();
  res.redirect("/");
};

exports.GetSignup = (req, res, next) => {
  if (!req.session.LoggedIn) {
    let alertmsg = req.flash("error");

    res.render("Authen/signup", {
      pageTitle: "SignUp Page",
      path: "/signup",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: alertmsg[0],
      userinput: {
        email: "",
        password: "",
        ConformPassword: "",
      },
      Validation: [],
    });
  } else {
    res.redirect("/");
  }
};

exports.PostSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(req. body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg;

    return res.status(422).render("Authen/signup", {
      pageTitle: "SignUp Page",
      path: "/signup",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: msg,
      userinput: {
        email: email,
        password: password,
        ConformPassword: req.body.ConformPassword,
      },
      Validation: errors.array(),
    });
  }

  bcryptjs
    .hash(password, 12)
    .then((encryptedpassword) => {
      const users = new User({
        username: {
          first: req.body.first,
          last: req.body.last,
        },
        email: email,
        password: encryptedpassword,
        cart: {
          item: [],
        },
      });
      return users.save();
    })
    .then((result) => {
      res.redirect("/login");
      
     })
    .catch((err) => {
      console.log("Error in Email Sent!", err);
    });
};
/* get reset method=>get*/

/* post reset Method */


/* get new-password method */


/* post request of new-password method */

/*GetProfile Page=>/profile */
exports.getprofile = (req, res, next) => {
  if (req.session.LoggedIn) {
    let alertmsg = req.flash("error");
    // console.log("Profile User",req.session.user);
     User.findById(req.session.user._id)
      .then((user) => {
        // console.log(user);
       return res.render("Authen/profile", {
          pageTitle: "Profile",
          path: "/profile",
          isAuthenticate: req.session.LoggedIn,
          isGlobalAuthenticate:req.session.GlobalLoggedIn,
          isAdminAuthenticate:req.session.AdminLoggedIn,
          alertmsg: alertmsg[0],
          user: user,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (req.session.AdminLoggedIn) {
    let alertmsg = req.flash("error");
    // console.log("Profile User",req.session.user);
     AdminUser.findById(req.session.user._id)
      .then((user) => {
        // console.log(user);

        return res.render("Authen/profile", {
          pageTitle: "Profile",
          path: "/profile",
          isAuthenticate: false,
          isGlobalAuthenticate:req.session.GlobalLoggedIn,
          isAdminAuthenticate:req.session.AdminLoggedIn,
          alertmsg: alertmsg[0],
          user: user,
        });
      })
      .catch((err) => {
        console.log(err);
      });

  }
  else {
    res.redirect("/login");
  }
};
/* EditProfile Page=>/EditProfile */
exports.EditProfile = (req, res, next) => {
  console.log("Edit Profile",req.session.LoggedIn);
  if (req.session.LoggedIn) {
    const userId = req.params.userId;

    User.findById(userId)
      .then((user) => {
        console.log("Edit Profile", user);

        return res.render("Authen/editprofile", {
          pageTitle: "Edit Profile",
          path: "/editprofile",
          isAuthenticate: req.session.LoggedIn,
          isGlobalAuthenticate:req.session.GlobalLoggedIn,
          isAdminAuthenticate:req.session.AdminLoggedIn,
          user: user,
          csrfTokens: req.csrfToken(),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }else if(req.session.AdminLoggedIn) {
    const userId = req.params.userId;
    
    AdminUser.findById(userId)
      .then((user) => {
        console.log("Edit Profile", user);

        return res.render("Authen/editprofile", {
          pageTitle: "Admin Edit Profile",
          path: "/editprofile",
          isAuthenticate: req.session.LoggedIn,
          isGlobalAuthenticate:req.session.GlobalLoggedIn,
          isAdminAuthenticate:req.session.AdminLoggedIn,
          user: user,
          csrfTokens: req.csrfToken(),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } 

  else {
    res.redirect("/login");
  }
};

/*updated Profile=>POST=>/updatedprofile */

exports.UpdatedProfile = (req, res, next) => {
    console.log("Welcome to UpdatedProfile");
   


  if (req.session.LoggedIn) {
    
    const { first, last,email ,currentpassword, newpassword, conformpassword } = req.body;
    const image = req.file;
    
    User.findById(req.session.user._id)
      .then((user) => {
        return bcryptjs
          .compare(currentpassword, user.password)
          .then((DoMatch) => {
            if (!DoMatch) {
              req.flash("error", "password Doesn't Match with Current one");
              return res.redirect("/profile");
            } else {
              if (newpassword != conformpassword) {
                req.flash("error", "password have to Match");
                return res.redirect("/profile");
              }
              bcryptjs
                .hash(newpassword, 12)
                .then((encryptedpassword) => {
                  user.password = encryptedpassword;
                  user.username.first = first;
                  user.username.last = last;
                  user.email = email;
                  
                  if (image)
                  {
                    if (user.profileimg!==undefined) {
                       
                      const dest=image.destination+'/'+user.profileimg  
                      fs.deleteFile(dest);  
                    } 
                    
                    user.profileimg = image.filename;
                  } 
                  
                  return user.save();
                })
                .then((result) => {
                  console.log(result);
                  console.log("profile Updated Succesfully!");

                  res.redirect("/profile");
                });
            }
          })
          .catch((err) => {
            console.log("error1", err);
          });
      })
      .catch((err) => {
        console.log("Error2", err);
      });
  }
  else if (req.session.AdminLoggedIn) {
    
    const email = req.body.email;
    const currentpassword = req.body.currentpassword;
    const newpassword = req.body.newpassword;
    const conformpassword = req.body.conformpassword;
    const image = req.file;
    
          
    console.log(req.body,image)
    


    AdminUser.findById(req.session.user._id)
      .then((user) => {
        return bcryptjs
          .compare(currentpassword, user.password)
          .then((DoMatch) => {
            if (!DoMatch) {
              req.flash("error", "password Doesn't Match with Current one");
              return res.redirect("/profile");
            } else {
              if (newpassword != conformpassword) {
                req.flash("error", "password have to Match");
                return res.redirect("/profile");
              }
              bcryptjs
                .hash(newpassword, 12)
                .then((encryptedpassword) => {
                  user.password = encryptedpassword;
                  user.username.first = req.body.first;
                  user.username.last = req.body.last;
                  user.email = email;
                  if (image)
                  {
                  console.log("Profile Exists:",user.profileimg);
                    if (user.profileimg!==undefined) {
                       
                      const dest=image.destination+'/'+user.profileimg  
                      fs.deleteFile(dest);  
                    }  
                    user.profileimg = image.filename;
                  }
                  
                  
                  return user.save();
                })
                .then((result) => {
                  console.log(result);
                  console.log("profile Updated Succesfully!");
                  
                  res.redirect("/profile");
                });
            }
          })
          .catch((err) => {
            console.log("error1", err);
          });
      })
      .catch((err) => {
        console.log("Error2", err);
      });
  } 
  else {
    res.redirect("/login");
  }
};



/* Admin Login for Adding Product*/
exports.AdminLogin = (req, res, next) => {
  if (!req.session.GlobalLoggedIn) {
    let alertmsg = req.flash("error");

    
    return res.render("Authen/adminlogin", {
      pageTitle: "Admin Login",
      path: "/admin-login",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: alertmsg[0],
      userinput: {
        email: "",
        password: "",
      },
      
    });
  } else {
    res.redirect("/admin/add-product");
  } 
     

}

exports.AdminSignup = (req, res, next) => {
  if (!req.session.GlobalLoggedIn) {
    let alertmsg = req.flash("error");

    res.render("Authen/adminsignup", {
      pageTitle: "Admin SignUp",
      path: "/admin-signup",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: alertmsg[0],
      userinput: {
        email: "",
        password: "",
        ConformPassword: "",
      },
      Validation: [],
    });
  } else {
    res.redirect("/admin/add-product");
  }
};
/* Admin Post SignUp */
exports.AdminPostSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body.name, email, password);
  const errors = validationResult(req);
    console.log(errors)
  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg;
    
    console.log(msg);
    return res.status(422).render("Authen/adminsignup", {
      pageTitle: "Admin SignUp",
      path: "/admin-signup",
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: msg,
      userinput: {
        email: email,
        password: password,
        ConformPassword: req.body.ConformPassword,
      },
      Validation: errors.array(),
    });
  }
  
  bcryptjs
    .hash(password, 12)
    .then((encryptedpassword) => {
      const Adminuser = new AdminUser({
        username: {
          first: req.body.first,
          last:req.body.last
        } ,
        email: email,
        password: encryptedpassword,
        product: {
          item: [],
        },
      });
      return Adminuser.save();
    })
    .then((result) => {
      console.log("Admin User SignUp Successfully:", result);
      return res.redirect("/admin-login");
      
    })
    .catch(err => {
      console.log('Error in Admin SignUp', err);
    })
};

/* Post Admin Login */

exports.AdminPostLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg;
    return res.status(422).render("Authen/adminlogin", {
      pageTitle: "Admin Login",
      path: "/admin-login",
      isAuthenticate: req.session.LoggedIn,
      isAdminAuthenticate: req.session.AdminLoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      alertmsg: msg,
      userinput: {
        email: email,
        password: password,
      },
    });
  }

  AdminUser.findOne({ email: email })
    .then((admin) => {
      bcryptjs
        .compare(password, admin.password)
        .then((DoMatch) => {
          if (DoMatch) {
            req.session.GlobalLoggedIn = true;
            req.session.AdminLoggedIn = true;
            req.session.user = admin;
            console.log('LoggedIn Successfully!', admin);
            return req.session.save((err) => {
              if (err) {
                console.log("Error in Admin Login",err);
               }
               res.redirect("/admin/add-product");
            });
          }
          req.flash("error", "Invalid User Password!");
          return res.redirect("/admin-login");
        })
      })
    .catch((err) => {
      console.log("Error Message", err);
    });

  
};
