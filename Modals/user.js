const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    first: {
      type: String,
      required: true,
    },
    last: {
      type: String,
      required: true,
    },
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileimg: String,
  resetToken: String,
  resetTokenExpiring: String,
  cart: {
    item: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

UserSchema.methods.addCartItem = function (product) {
  const cartProductIndex = this.cart.item.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const UpdatedCartItem = [...this.cart.item];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.item[cartProductIndex].quantity + 1;
    UpdatedCartItem[cartProductIndex].quantity = newQuantity;
  } else {
    UpdatedCartItem.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const UpdatedCart = {
    item: UpdatedCartItem,
  };
  this.cart = UpdatedCart;
  return this.save();
};

UserSchema.methods.DeleteCartItem = function (product) {
  let UpdatedProductItem = [];
  console.log("Delete Cart Item!",this.cart.item,product);
  UpdatedProductItem = this.cart.item.filter((cp) => {
    return cp.productId.toString() !== product._id.toString();
  });

  const NewCartItem = {
    item: UpdatedProductItem,
  };
  this.cart = NewCartItem;
  return this.save();
};
UserSchema.methods.ClearCart = function () {
  const NewCartItem = {
    item: [],
  };
  this.cart = NewCartItem;
  return this.save();
};
const User = mongoose.model("user", UserSchema);
module.exports = User;
