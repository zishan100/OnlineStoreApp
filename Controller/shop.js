const fs = require("fs");
const path = require("path");
const Products = require("../Modals/products");
const User = require("../Modals/user");
const Order = require("../Modals/order");
const pdfkit = require("pdfkit");
const session = require("express-session");

const stripe = require("stripe")(
  "sk_test_51H07jwGJ39NqQOUF68X9msVqHYhQOQp1ZyVo1uQkOLpvNO4rviaucZZvMS7JyggZKkROMZKo2dasXB26YdBAJj5700O5DLszMB"
);

const ITEM_PER_PAGE = 3;

/*Get Product Items */
exports.getProducts = function (req, res, next) {
  // Products.find()
  //   .then((product) => {
  //     // console.log(product);

  //     return res.render("shop/product-list", {
  //       pageTitle: "Product",
  //       products: product,
  //       isAuthenticate: req.session.LoggedIn,
  //       path: "/product",
  //     });
  //   })
  //   .catch((err) => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
  if (!req.session.AdminLoggedIn) {
    const page = +req.query.page || 1;
    let totalItem;
    Products.find()
      .countDocuments()
      .then((numProducts) => {
        totalItem = numProducts;
        return Products.find()
          .skip((page - 1) * ITEM_PER_PAGE)
          .limit(ITEM_PER_PAGE)
          .then((product) => {
            res.render("shop/product-list", {
              pageTitle: "Shop",
              products: product,
              path: "/product",
              isAuthenticate: req.session.LoggedIn,
              isGlobalAuthenticate: req.session.GlobalLoggedIn,
              isAdminAuthenticate: req.session.AdminLoggedIn,
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
  } else {
    res.redirect('/admin/add-product');
  }
};
/*Detail of Product */
exports.ProductDetail = (req, res, next) => {
  const prodId = req.params.productId;

  Products.findById(prodId)
    .then((product) => {
      // console.log(product);

      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/product",
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

/*Main Page of Product*/
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItem;
   
  if (!req.session.AdminLoggedIn) {
    Products.find()
      .countDocuments()
      .then((numProducts) => {
        totalItem = numProducts;
        return Products.find()
          .skip((page - 1) * ITEM_PER_PAGE)
          .limit(ITEM_PER_PAGE)
          .then((product) => {
            res.render("shop/index", {
              pageTitle: "Shop",
              products: product,
              path: "/",
              isAuthenticate: req.session.LoggedIn,
              isGlobalAuthenticate: req.session.GlobalLoggedIn,
              isAdminAuthenticate: req.session.AdminLoggedIn,
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
  } else {
    res.redirect('/admin/add-product');
  } 
  
};
/*getCartItem=>get */
exports.getcart = (req, res, next) => {
  // console.log(req.user_id);
  if (!req.session.AdminLoggedIn) {
    
    User.findById(req.session.user)
      // .select("cart -_id")
      .populate("cart.item.productId")
      // .execPopulate()
      .then((user) => {
        const product = user.cart.item;
           
        return res.render("shop/cart", {
          pageTitle: "Your Cart",
          path: "/cart",
          CartProduct: product,
          isAuthenticate: req.session.LoggedIn,
          isGlobalAuthenticate: req.session.GlobalLoggedIn,
          isAdminAuthenticate: req.session.AdminLoggedIn
        });
      })

      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }else{
    res.redirect('/admin/add-product');
  }
};
/*Add Item to Cart List*/
exports.postcart = (req, res, next) => {
  const prodID = req.body.productId;

  Products.findById(prodID)
    .then((product) => {
      console.log(product);
      req.user.addCartItem(product);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
/*Delete Cart Item=>post*/
exports.DeleteCart = (req, res, next) => {
  const ProdId = req.body.ProdId;
  console.log(ProdId);
  Products.findById(ProdId)
    .then((product) => {
      console.log(product);

      req.user.DeleteCartItem(product);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
/*Rendering checkout Page for Payment*/
exports.getcheckout = (req, res, next) => {
  let total = 0;
  let product = [];
  let userId = Date.now() + 60000;
  User.findById(req.user._id)
    // .select("cart -_id")
    .populate("cart.item.productId")
    // .execPopulate()
    .then((user) => {
      product = user.cart.item;
      console.log(product,product.length); 
      product.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      console.log("Before Stripe Ui");

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: product.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: "usd",
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol +
          "://" +
          req.get("host") +
          `/checkouts/success/${userId}`,
        cancel_url:
          req.protocol + "://" + req.get("host") + "/checkouts/cancel",
      });
    })
    .then((session) => {
      console.log(session);
      console.log(userId);

      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        product: product,
        isAuthenticate: req.session.LoggedIn,
        isGlobalAuthenticate:req.session.GlobalLoggedIn,
        isAdminAuthenticate:req.session.AdminLoggedIn,
        total: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      // console.log("Error occured!", err);
    });
};

/* for Success payment it get redirect to order page */

exports.getcheckoutSuccess = (req, res, next) => {
  let userId = req.params.userId;
  if (userId < Date.now()) {
    return res.redirect("/cart");
  }
  User.findById(req.session.user)
    .populate("cart.item.productId")
    .then((user) => {
      // console.log(user);
      // console.log(user.cart.item);
      const OrderProduct = user.cart.item.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });
      const order = new Order({
        products: OrderProduct,
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
      });
      order.save();
      req.user.ClearCart();
      return res.redirect("/order");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/*checkout Button CartItem */
exports.Postcheckout = (req, res, next) => {
  User.findById(req.session.user)
    .populate("cart.item.productId")
    .then((user) => {
      // console.log(user);
      // console.log(user.cart.item);
      const OrderProduct = user.cart.item.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });
      const order = new Order({
        products: OrderProduct,
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
      });
      order.save();
      req.user.ClearCart();
      return res.redirect("/order");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
/* Get Order Item */

exports.getOrderItem = (req, res, next) => {
  Order.find()
    .populate("user.products")
    .then((order) => {
      let UserOrder = [];
      order.forEach((order) => {
        if (order.user.email.toString() === req.user.email.toString()) {
          UserOrder.push(order);
        }
      });

      return res.render("shop/order", {
        pageTitle: "My Order",
        path: "/order",
        order: UserOrder,
        // total: TotalPrice,
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
/* Get Invoice  */

exports.getInvoice = (req, res, next) => {
  const Invoice = req.params.orderID;
  console.log(Invoice);

  Order.findById(Invoice)
    .then((order) => {
      if (!order) {
        return next(new Error("No Order Id is found!"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("unauthorize"));
      }
      console.log("Invoice Created!!");

      const InvoiceName = "invoice" + Invoice + ".pdf";
      const InvoicePath = path.join("Data", "Invoice", InvoiceName);
      const pdfdoc = new pdfkit();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + InvoiceName + '"'
      );
      pdfdoc.pipe(fs.createWriteStream(InvoicePath));
      pdfdoc.pipe(res);
      pdfdoc.fontSize(20).text("Invoice", {
        underline: true,
        align: "center",
      });
      let totalprice = 0;
      pdfdoc.text("------------------", { align: "center" });
      order.products.forEach((prod) => {
        totalprice += prod.quantity * prod.product.price;
        pdfdoc.text(
          prod.product.title +
            " * " +
            prod.quantity +
            "-->" +
            prod.product.price,
          { align: "center" }
        );
      });
      pdfdoc.text("-----------------", { align: "center" });
      pdfdoc.text("TotalPrice=" + totalprice, { align: "center" });
      pdfdoc.end();
      // fs.readFile(InvoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   console.log("Invoice Created!!!");
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + InvoiceName + '"'
      //   );
      //   res.send(data);
      // });
    })
    .catch((err) => {
      const error = new Error("Error in Finding Invoice!");
      return next(error);
    });
};
