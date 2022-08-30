const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

   username:{
      type: String,
      required: true
   },
   name:{
      type: String,
      required: true
   },
   dob:{
   type:String,
   required:true
   },
   email:{
      type:String,
      required:true
   },
   occupation:{
      type:String,
      required:true
   },
   aoe:{
      type:String,
      required:true
   },
   pass:{
      type:String,
      required:true
   },
   repass:{
      type:String,
      required:true
   }
   ,
   gender:{
      type:String,
      required:true
   }
});

const Register = mongoose.model("Register", userSchema);

module.exports = Register;