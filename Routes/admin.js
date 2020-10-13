const express = require("express");

const path = require("path");
const router = express.Router();
const Athen = require("../Middleware/Authen");
const {AdminLogin } = require('../Middleware/AdminLogin');
const { body, check } = require("express-validator/check");
/*Accessing Controller Directory*/
const adminControlller = require("../Controller/admin");

router.get("/add-product", AdminLogin, adminControlller.getAddProducts);

//admin/product=>POST
router.post(
  "/product",
  [
    body("title")
      .isLength({ min: 3 })
      .withMessage("Please Enter Valid title!")
      .trim(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage("Please Enter Valid description!"),
  ],
  AdminLogin,
  adminControlller.StoreProducts
);

//admin/product=>GET
router.get("/product", AdminLogin, adminControlller.product);
//edit product
router.get(
  "/editproduct/:productID",

  AdminLogin,
  adminControlller.EditPrpduct
);

router.post(
  "/editproduct",
  [
    body("title")
      .isLength({ min: 3 })

      .withMessage("Please Enter Valid Input!")
      .trim(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage("Please Enter Valid Input!"),
  ],
  AdminLogin,
  adminControlller.PostEditProduct
);
/*Delete Product */
router.delete(
  "/deleteproduct/:productId",
  AdminLogin,
  adminControlller.DeleteProduct
);

module.exports = router;
