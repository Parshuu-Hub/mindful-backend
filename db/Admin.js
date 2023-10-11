const mongoose=require('mongoose');

const adminSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    phone:Number,
    gender:String,
    source:[String],
    city:String,
    state:String
});

module.exports=mongoose.model('admins',adminSchema);


