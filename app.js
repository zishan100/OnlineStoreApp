const express = require("express");
const path = require("path");
const port = 8000;
/*For Generating Unique Tokens */
const csrfs = require("csurf");
const csrfProtection = csrfs();

/*express session */
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const flash = require("connect-flash");
const AdminUser = require('./Modals/adminUser');
const User = require("./Modals/user");
const multer = require("multer");
const adminRoutes = require("./Routes/admin");
/*Get Error Method from Controller Directory */
const Error = require("./Controller/error");
/*Get Authen Routes */

const AuthenRoutes = require("./Routes/auth");
const ejs = require("ejs");

const bodyParser = require("body-parser");

const ExpressLayouts = require("express-ejs-layouts");
// const { read } = require("pdfkit/js/data");

// app.use(express.static("StaticAsset"));
const app = express();
// console.log("Process Environment",process.env);
const Mongourl = "mongodb://localhost/ShopApp";
const Store = new MongoDBStore({
  uri: Mongourl,
  collection: "session",
});

const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/img");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.static(path.join(__dirname, "Public/img")));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({
    dest: "Public/img",
    storage: filestorage,
    fileFilter: fileFilter,
  }).single('image')
);

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: Store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {

  // throw new Error("dummy");
  // console.log(req.session.user,req.session.AdminLoggedIn);
  if (req.session.AdminLoggedIn)
  {
     AdminUser.findById(req.session.user._id)
       .then(user => {
        //  console.log( "Initializing of User",user); 
         req.user = user;  
        //  console.log("After Initializing User", req.user);
                  
       })
       return next();
   }
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
   .then((user) => {
     if (!user) {
      
        return next();
     }
     
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});
app.use((req, res, next) => {
  
  if (req.session.AdminLoggedIn) {
    res.locals.isAdminAuthenticate = req.session.AdminLoggedIn;
    res.locals.isGlobalAuthenticate = req.session.GlobalLoggedIn;
    res.locals.csrfTokens = req.csrfToken();
  }
  else {
    res.locals.isGlobalAuthenticate = req.session.GlobalLoggedIn
     res.locals.isAuthenticate = req.session.LoggedIn;
     res.locals.csrfTokens = req.csrfToken();
   } 
      
  
  
  next();
});

app.use("/admin", adminRoutes);
app.use(require("./Routes/shop"));
app.use(AuthenRoutes);

app.get("/500", Error.get500);
//Page not Found Status Code 404
// app.use(Error.getError);

/* Middleware Error Handling 500 page */
app.use((error, req, res, next) => {
  console.log("New Error Occured!",error);
  res.redirect("/500");
});

mongoose
  .connect("mongodb://localhost/ShopApp", { useNewUrlParser: true })
  .then((result) => {
    console.log("MongoDB Connected Sucessfullly!!");
    app.listen(port, function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Server is running up on port:", port);
    });
  })
  .catch((err) => {
    console.log(err);
  });
