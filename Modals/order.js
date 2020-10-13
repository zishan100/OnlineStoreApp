const mongoose = require("mongoose");

const schema = mongoose.Schema;

const OrderSchema = new schema({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    email: { type: String, required: true },
    userId: {
      type: schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
});

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
