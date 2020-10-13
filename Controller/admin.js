const Products = require("../Modals/products");
const mongoose = require("mongoose");
const User = require("../Modals/user");
const AdminUser = require('../Modals/adminUser');

const Product = require("../Modals/products");
const { validationResult } = require("express-validator/check");
const file = require("../Middleware/file");
const { Types, Schema } = require("mongoose");
const ITEM_PER_PAGE = 3;

// const User = require("../Modals/user");
/*Add Product Items */
exports.getAddProducts = function (req, res, next) {
  return res.render("admin/editproduct", {
    pageTitle: "Admin Page",
    path: "/admin/add-product",
    editModal: false,
    isAuthenticate: req.session.LoggedIn,
    isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn,
    alertmsg: null,
    product: {
      title: "",
      imgUrl: "",
      price: "",
      description: "",
    },
  });
};

/*Store Product Items */
exports.StoreProducts = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  

  // console.log(title, image, price, description);
  console.log("Store Product",req.session.user);
  
  if (!image) {
    return res.render("admin/editproduct", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editModal: false,
      isAdminAuthenticate: req.session.AdminLoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: "Attached file is not an image!",
      product: {
        title: title,
        price: price,
        description: description,
      },
    });
  }

  const imgUrl = image.filename;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.render("admin/editproduct", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editModal: false,
      isAdminAuthenticate: req.session.AdminLoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
    isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: error.array()[0].msg,
      product: {
        title: title,
        imgUrl: imgUrl,
        price: price,
        description: description,
      },
    });
  }
  
  const product = new Products({
    title: title,
    price: price,
    imgurl: imgUrl,
    description: description,
    userId: req.session.user._id,
  });

  product
    .save()
    .then((result) => {
      
      req.user.AddItemToAdmin(result);   
      // console.log("Created Product!",result);
      res.redirect("/admin/product");
    })
    .catch((err) => {
      console.log("Error have Occured!");

      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
/*Populate() Method is use after find Method to fetch all related to field/key   */
//Admin Product->admin/product=>GET
exports.product = function (req, res, next) {
  // Products.find({ userId: req.user._id })
  //   // .select("title price description")
  //   .populate("userId")

  //   .then((product) => {
  //     // console.log(product);

  //     return res.render("admin/product", {
  //       pageTitle: "Product",
  //       products: product,
  //       path: "/admin/product",
  //       isAuthenticate: req.session.LoggedIn,
  //     });
  //   })
  //   .catch((err) => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
 
  const page = +req.query.page || 1;
  let totalItem;
  Products.find()
    .countDocuments({ userId: req.session.user._id })
    .then((numProducts) => {
      
      totalItem = numProducts;
      return Products.find({ userId: req.session.user._id })
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
        .then((product) => {
                      
          
          res.render("admin/product", {
            pageTitle: "Product",
            products: product,
            path: "/admin/product",
            isAuthenticate: req.session.LoggedIn,
            isGlobalAuthenticate:req.session.GlobalLoggedIn,
            isAdminAuthenticate:req.session.AdminLoggedIn,
            csrfTokens: req.csrfToken(),
            currentPage: page,
            hasNextPage: ITEM_PER_PAGE * page < totalItem,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItem / ITEM_PER_PAGE),
          });
        })
        .catch((err) => {
          console.log("Inner Error Occured!");

          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      console.log("Outer Error Occured!");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/*Edit Product */
exports.EditPrpduct = (req, res, next) => {
  
  const prodId = req.params.productID;
 
   Products.findById(prodId)
    .then((product) => {
      res.render("admin/editproduct", {
        pageTitle: "Edit product",
        path: "/admin/edit-product",
        product: product,
        editModal: true,
        alertmsg: null,
        isAuthenticate: req.session.LoggedIn,
        isGlobalAuthenticate:req.session.GlobalLoggedIn,
        isAdminAuthenticate:req.session.AdminLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
/*Post Edit Product */
exports.PostEditProduct = (req, res, next) => {
  const prodId = req.body.ProdId;
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const error = validationResult(req);
  console.log(image);

  if (!image) {
    return res.render("admin/editproduct", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editModal: true,
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn,
      alertmsg: "Attached file is not an image!",
      product: {
        id: prodId,
        title: title,
        price: price,
        description: description,
      },
    });
  }

  if (!error.isEmpty()) {
    console.log(error.array());
    Products.findById(prodId).then((product) => {
      if (image) {
        const dest = image.destination + "/" + product.imgurl;
        console.log(dest);

        file.deleteFile(dest);
        product.imgurl = image.filename;
      }

      product.save();
    });
    console.log("Product Updated!!");
    return res.render("admin/editproduct", {
      pageTitle: "Edit product",
      path: "/admin/edit-product",
      alertmsg: error.array()[0].msg,
      editModal: true,
      product: {
        id: prodId,
        title: title,
        price: price,
        description: description,
      },
      isAuthenticate: req.session.LoggedIn,
      isGlobalAuthenticate:req.session.GlobalLoggedIn,
      isAdminAuthenticate:req.session.AdminLoggedIn
    });
  }

  Products.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("No Product Found!"));
      }
      product.title = title;
      product.price = price;

      product.description = description;

      if (image) {
        const dest = image.destination + "/" + product.imgurl;
        console.log(dest);

        file.deleteFile(dest);
        product.imgurl = image.filename;
      }

      return product.save();
    })
    .then(() => {
      console.log("Product Updated!!");
      res.redirect("/admin/product");
    })
    .catch((err) => {
      console.log("Error Occured!");

      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/* Delete Product  */
function findProductId(item, productId) {
  let UpdatedCartItem = [];
  console.log(item,productId);
  UpdatedCartItem = item.filter((item) => {
    return item.productId._id.toString() !== productId._id.toString() ? {
      item,
    } : null; 
  });
  return UpdatedCartItem;
}

exports.DeleteProduct = (req, res, next) => {
  const ProductId = req.params.productId;
   
  Product.findById(ProductId)
    .populate('userId')
    .then((product) => {
      if(!product) {
        return next(new Error("Product not found!"));
      }
       
       console.log(product);
      
       
       //  const dest = "Public/img" + "/" + product.imgurl;
      // file.deleteFile(dest);
       User.find()
        .populate('cart.item.productId')
        .then(users => {
          console.log(users);
           
           users.forEach(users => {
            // console.log(prod.cart.item);
                          
            const cartItem = findProductId(users.cart.item, product);
             users.cart.item = [];
             users.cart.item = cartItem;
             console.log("NewCartItem=", cartItem);
             users.save();
            })
        
        req.user.DeleteAdminItem(product)
        return Product.deleteOne({ _id: ProductId })
       .then((result) => {
        console.log("Product Deleted", result);
        res.status(200).json({ message: "Success" });
       })
            
      })
     })
    .catch((err) => {
      res.status(500).json({ message: "Deleteing Product Fail!" });
    });
};
