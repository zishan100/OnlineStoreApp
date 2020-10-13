const express = require("express");

const path = require("path");

const Athen = require("../Middleware/Authen");
// /*Accessing Controller Directory*/
const shopControlller = require("../Controller/shop");
const Authen = require("../Middleware/Authen");

const router = express.Router();

router.get("/", shopControlller.getIndex);

router.get("/product", shopControlller.getProducts);

router.get("/product/:productId", shopControlller.ProductDetail);

router.get("/cart", Athen, shopControlller.getcart);

router.post("/cart", Athen, shopControlller.postcart);

router.post("/DeleteCart", Athen, shopControlller.DeleteCart);

router.get("/checkouts", Authen, shopControlller.getcheckout);
router.get("/checkouts/success/:userId", shopControlller.getcheckoutSuccess);
router.get("/checkouts/cancel", shopControlller.getcheckout);

router.post("/checkout", Athen, shopControlller.Postcheckout);

router.get("/order", Athen, shopControlller.getOrderItem);

router.get("/order/:orderID", Athen, shopControlller.getInvoice);
module.exports = router;
