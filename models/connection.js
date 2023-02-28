var mongoose = require("mongoose");
const db =mongoose .connect("mongodb://0.0.0.0:27017/roshanCart", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));





const userschema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
      phonenumber:{
        type:String,
        // minlength:10,
        unique:true,
      },
      blocked:{
        type:Boolean,default:false
    },
    coupons:Array,
    
   CreatedAt:{
     type:Date,
     deafault:Date.now,
   },
  
   
})
const categorySchema= new mongoose.Schema({
  CategoryName:{
    type:String
  },
  subCategory:Array

})

 const productSchema=new mongoose.Schema({
    Productname:{
      type:String
    },
    ProductDescription:{
      type:String
    },
    Quantity:{
      type:Number
    },
    Image:{
      type:Array,
     
    },
    Price:{
  type:Number
    },
    category:{
      type:String
    }
    

 })

 const cartSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "user"
  } ,
  
  cartItems:[
    {

   productId:{type:mongoose.Schema.Types.ObjectId,ref:'product'},
   Quantity:{type:Number,default:1},
   price:{type:Number}
    }
  ],
 })

 const wishlistSchema= new mongoose.Schema({

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
  
})

 const AddressSchema=new  mongoose.Schema(
  {
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    Address:[
      {
        fname:{type:String},
        lname:{type:String},
        street:{type:String},
        apartment:{type:String},
        city:{type:String},
        state:{type:String},
        pincode:{type:Number},
        mobile:{type:Number},
        email:{type:String}
      }
    ]
  })
 
const orderSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  orders: [
      {
          fname:String,
          lname:String,
          mobile: Number,
          paymentMethod: String,
          paymentStatus: String,
          totalPrice: Number,
          totalQuantity: Number,
          productsDetails: Array,
          shippingAddress: Object,
          status: {
              type: Boolean,
              default: true
                  },
          paymentType:String,
          createdAt: {
              type: Date, 
              default: new Date()
          },
          orderConfirm: {
            type: String,
            default: 'ordered'
        }
      }
  ]
})

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


module.exports={
  user :mongoose.model('user',userschema),
  category:mongoose.model('Category',categorySchema),
  product:mongoose.model('product',productSchema),
  cart:mongoose.model('cart',cartSchema),
  order:mongoose.model('order',orderSchema),
  address:mongoose.model('address',AddressSchema),
  coupen:mongoose.model('coupen',couponSchema),
  wishlist:mongoose.model("wishlist",wishlistSchema)

}



