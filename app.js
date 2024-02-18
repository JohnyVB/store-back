require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST,PUT,DELETE, PATCH");
  next();
});

const path = {
  users: '/api/users',
  category: '/api/category',
}

app.use(path.users, require('./src/routes/user.route'));
app.use(path.category, require('./src/routes/category.route'));

app.listen(process.env.PORT, () => {
  console.log("Server is running on: " + process.env.PORT);
});
