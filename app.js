//jshint esversion:
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/cerebroDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  confirmPassword: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password", "confirmPassword"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/home", function (req, res) {
  res.render("home");
});

app.post("/register", function (req, res) {
  const { username, password, confirmPassword } = req.body;
  if (!username) res.render("register", { error: "Please enter email" });
  if (password === confirmPassword) {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("Successful");
      }
    });
  } else res.render("register", { error: "Please enter same password" });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.render("something went wrong");
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("Successful");
        } else res.render("login", { error: "Invalid Email or Password" });
      } else res.render("login", { error: "Invalid Email or Password" });
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
