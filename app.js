require('./data/db');

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const User = require('./model/userModel');
const bcrypt = require('bcrypt');

const app = express();
// const UserRouter = require("./api/user")

const postSchema = new mongoose.Schema({
   title: String,
   content: String
 });
 
 const Post = new mongoose.model("Post", postSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
// app.use('/user', UserRouter)

app.set("view engine", "ejs")

app.get("/", (req, res)=>{
   Post.find({}, (err, posts)=>{
     res.render("home",{
       newContent: posts
     });
   });
 });




 app.post("/", (req, res) => {
   const post = new Post({
     title: req.body.postTitle,
     content: req.body.postBody
   });
 
   post.save((err)=>{
     if(!err){
       res.redirect("/");
     }
   });
 });






//rejestracja
 app.post('/signup', (req, res) => {
    let name = req.body.Name;
    let email = req.body.Email;
    let password = req.body.Password;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if(name == "" || email == "" || password == ""){
      console.log("FAILED Input fields are empty");
    }

    else if(!/^[a-zA-Z ]*$/.test(name)){
      console.log("FAILED Invalid name");
    }

    else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
      console.log("FAILED Invalid email");
    }

    else if(password.length < 8){
      console.log("FAILED Password is too short");
    }

   else{
      //sprawdza czy użytkownik istnieje:
      User.find({email}, (err, users)=>{
        if(users.length){
          //-TAK
          console.log("FAILED User with this email already exists");
        }
          //-NIE
       else{
          const rounds = 10;
          bcrypt.hash(password, rounds).then(hashedPassword =>{
          const newUser = new User({
            name,
            email,
            password: hashedPassword,
          });

            newUser.save((err)=>{
              if(!err){
                console.log("Signup success!");
                res.redirect("/");
              }
              else{
                console.log("FAILED Error while trying to save user account");
              }
            });
          });
        }
      });
    } 
  });
//logowanie

app.post('/signin', (req, res) => {
    let email = req.body.Email;
    let password = req.body.Password;
    email = email.trim();
    password = password.trim();

    if(email == "" || password == ""){
      console.log("Empty credentials");
    }
    else{
      User.find({email}).then(data =>{
         if(data.length){
            const hashedPassword = data[0].password;
            bcrypt.compare(password, hashedPassword).then(users =>{
              if(users){
                console.log("Successfully loged in");
                res.redirect("/");
              }
              else{
                console.log("FAILED Invalid password entered");
              }
            })
          }
      })
    }
})









app.get("/signin", (req, res)=>{
   res.render("signin")
})

app.get("/signup", (req, res)=>{
   res.render("signup")
})

app.listen(3000, (req, res)=>{
   console.log("app is running on port 3000");
})
