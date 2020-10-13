const express = require("express");

const router = express.Router();

const User = require("../Modals/user");
const AdminUser = require('../Modals/adminUser');
const { check, body } = require("express-validator/check");

const authController = require("../Controller/auth");
const Authen = require("../Middleware/Authen");
const {GlobalLogin,AdminLogin} =require('../Middleware/AdminLogin')
// const Authen = require("../Middleware/Authen");

router.get("/login", authController.GetLogin);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter Valid Input!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("Please Enter Invalid Email!");
          }
        });
      }),
  ],
  authController.PostLogin
);

router.post("/logout", authController.PostLogout);

router.get("/signup", authController.GetSignup);

router.post(
  "/signup",
  [
    body(
      "first",
      "First name Cannot Be Empty!"
    ).isLength({ min: 3 })
     .trim()
    ,
    body(
      "last",
      "Please Fill last name of  User!"
    ).isLength({ min: 3 })
     .trim()
    ,
    check("email")
      .isEmail()
      .withMessage("Please Enter Valid Input!")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This Email address if forbidden!");
        // }

        // return true;
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "Email exists Already Please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please Enter a Password with only number and text and atLeast 5 character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("ConformPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          console.log(value, req.body.password);
          throw new Error("Password have to Match!");
        }
        return true;
      }),
  ],
  authController.PostSignup
);

router.get("/profile",authController.getprofile);

router.get("/editprofile/:userId",authController.EditProfile);

router.post("/editprofile",authController.UpdatedProfile);

/* Admin Login Page */
router.get('/admin-login', authController.AdminLogin);
router.get('/admin-signup',authController.AdminSignup);
/* Post Request of Admin SignUp */

router.post(
  "/admin-signup",
  [
    body('first','Empty Value is Not Allowed')
      .isLength({ min: 3 })
      .trim(),
    body('last','Empty Value is Not Allowed')
      .isLength({ min: 3 })
      .trim(),
    check("email")
      .isEmail()
      .withMessage("Please Enter Valid Input!")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This Email address if forbidden!");
        // }

        // return true;
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "Email exists Already Please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please Enter a Password with only number and text and atLeast 5 character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("ConformPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          
          throw new Error("Password have to Match!");
        }
        return true;
      }),
  ],
  authController.AdminPostSignup
);
/*Post Request for Admin Login */
router.post(
  "/admin-login",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter Valid Input!")
      .custom((value, { req }) => {
        return AdminUser.findOne({ email: value }).then((user) => {
          if (!user) {
            console.log(value, email);
            return Promise.reject("Please Enter valid Email!");
          }
        });
      }),
  ],
  authController.AdminPostLogin
);


module.exports = router;
