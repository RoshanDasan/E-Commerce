var mongoose = require("mongoose");


const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
    // minlength: 5,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: String,
    // minlength:10,
    unique: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  coupons: Array,

  wallet: {
    type: Number,
    default: 0,
  },

  CreatedAt: {
    type: Date,
    deafault: Date.now,
  },
});
const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
  },
  subCategory: Array,
});

const productSchema = new mongoose.Schema({
  Productname: {
    type: String,
  },
  ProductDescription: {
    type: String,
  },
  Quantity: {
    type: Number,
  },
  Image: {
    type: Array,
  },
  Price: {
    type: Number,
  },
  category: {
    type: String,
  },
  offerPrice: {
    type: Number,
    default: function () {
      return this.Price - (this.Price * this.offerPercentage) / 100;
    },
  },
  offerPercentage: {
    type: Number,
    default: 0,
  },
  unlist:{
    type:Boolean,
    default:false
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  cartItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      Quantity: { type: Number, default: 1 },
      price: { type: Number },
    },
  ],
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  wishlistItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    },
  ],
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  Address: [
    {
      fname: { type: String },
      lname: { type: String },
      street: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      mobile: { type: Number },
      email: { type: String },
    },
  ],
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  orders: [
    {
      fname: String,
      lname: String,
      mobile: Number,
      paymentMethod: String,
      paymentStatus: String,
      totalPrice: Number,
      totalQuantity: Number,
      productsDetails: Array,
      shippingAddress: Object,
      paymentmode: String,
      status: {
        type: Boolean,
        default: true,
      },
      paymentType: String,
      createdAt: {
        type: Date,
        default: new Date(),
      },
      orderConfirm: {
        type: String,
        default: "ordered",
      },
    },
  ],
});

const couponSchema = new mongoose.Schema({
  couponName: String,
  expiry: {
    type: Date,
    default: new Date(),
  },
  minPurchase: Number,
  discountPercentage: Number,
  maxDiscountValue: Number,
  description: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  user: mongoose.model("user", userschema),
  category: mongoose.model("Category", categorySchema),
  product: mongoose.model("product", productSchema),
  cart: mongoose.model("cart", cartSchema),
  order: mongoose.model("order", orderSchema),
  address: mongoose.model("address", AddressSchema),
  coupen: mongoose.model("coupen", couponSchema),
  wishlist: mongoose.model("wishlist", wishlistSchema),
  banner: mongoose.model("Banner", bannerSchema),
};
