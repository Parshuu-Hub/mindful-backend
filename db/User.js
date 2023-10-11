const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    phone:Number,
    userId:String
    
});

module.exports=mongoose.model('users',userSchema);


