const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");
const Jwt=require('jsonwebtoken');
require('dotenv').config();
const port =process.env.PORT || 9000;
const jwtKey=`${process.env.JWT_KEY}`;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  let data = new User(req.body);
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
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({user},jwtKey,{expiresIn:"1h"},(err,token)=>{
        if(err){
          res.send({ result: "something went wrong" });
        }
        res.send({user,auth:token});
      })
    } else {
      res.send({ result: "User not found" });
    }
  } else {
    res.send("Both email and password is required.");
  }
});

app.post("/addProduct",verifyToken, async (req, res) => {
  let product = new Product(req.body);
  product = await product.save();
  res.send(product);
});

app.get("/products",verifyToken, async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({ result: "No products found!" });
  }
});

app.delete("/product/:id",verifyToken, async (req, res) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/product/:id", verifyToken,async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("No record found");
  }
});

app.put('/update/:id',verifyToken,async(req,res)=>{
  let result=await Product.updateOne(
    {_id:req.params.id},
    {$set:req.body}
  )
  res.send(result);
})

app.get('/search/:key',verifyToken,async(req,res)=>{
  let result=await Product.find({
    "$or":[
      {name:{$regex:req.params.key}},
      {company:{$regex:req.params.key}}
    ]
  })
  res.send(result);
})

function verifyToken(req,res,next){
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
// console.log(jwtKey);
app.listen(port);
