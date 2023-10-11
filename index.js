const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const Admin = require("./db/Admin");
const Jwt=require('jsonwebtoken');
require('dotenv').config();
const port =process.env.PORT || 9000;
const jwtKey=`${process.env.JWT_KEY}`;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  let data = new Admin(req.body);
  data = await data.save();
  data = data.toObject();
  delete data.password;
  Jwt.sign({data},jwtKey,{expiresIn:"1h"},(err,token)=>{
    if(err){
      res.send({ result: "something went wrong" });
    }
    res.send({data,auth:token});
  })
});

app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let admin = await Admin.findOne(req.body).select("-password");
    if (admin) {
      Jwt.sign({admin},jwtKey,{expiresIn:"1h"},(err,token)=>{
        if(err){
          res.send({ result: "something went wrong" });
        }
        res.send({admin,auth:token});
      })
    } else {
      res.send({ result: "User not found" });
    }
  } else {
    res.send("Both email and password is required.");
  }
});

app.post("/addUser",authentication, async (req, res) => {
  let user = new User(req.body);
  user = await user.save();
  res.send(user);
});

app.get("/usersList",authentication, async (req, res) => {
  let users = await User.find();
  if (users.length > 0) {
    res.send(users);
  } else {
    res.send({ result: "No Data Found!" });
  }
});

app.delete("/user/:id",authentication, async (req, res) => {
  let result = await User.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/user/:id", authentication,async (req, res) => {
  let result = await User.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("No Data Found!");
  }
});

app.put('/update/:id',authentication,async(req,res)=>{
  let result=await User.updateOne(
    {_id:req.params.id},
    {$set:req.body}
  )
  res.send(result);
})

app.get('/search/:key',authentication,async(req,res)=>{
  let result=await User.find({
    "$or":[
      {name:{$regex:req.params.key}},
      {email:{$regex:req.params.key}}
    ]
  })
  res.send(result);
})

function authentication(req,res,next){
  let token=req.headers['authorization'];
  if(token){
    token=token.split(' ')[1];
    Jwt.verify(token,jwtKey,(err,valid)=>{
      if(err){
        res.status(401).send("Invalid token")
      }else{
        next()
      }
    })
  }else{
    res.status(403).send({result:"Please add token with headers"})
  }
}

app.listen(port);
