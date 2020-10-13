const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminUser = new Schema({
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
  product: {
    item: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        }
      },
    ],
  },
});

AdminUser.methods.AddItemToAdmin = function (products) {
  
  
  const UpdatedCartItem = [...this.product.item];
   
    UpdatedCartItem.push({
      productId: products._id,
    });
  
  const UpdatedCart = {
    item: UpdatedCartItem,
  };
  this.product = UpdatedCart;
  return this.save();
};
/* Delete ProductId From AdminUser */
AdminUser.methods.DeleteAdminItem = function (products) {
   
  console.log(this.product.item);
  let UpdatedItem = [];
    
   UpdatedItem=this.product.item.filter(product => {
      
    return product.productId.toString()!== products._id.toString();
   })
  
  const NewUpdatedItem = {
    item:UpdatedItem,
  };
  this.product =NewUpdatedItem;
  return this.save();
};

const adminUser = mongoose.model("adminuser", AdminUser);
module.exports = adminUser;



