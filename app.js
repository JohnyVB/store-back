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
  auth: '/api/auth',
  article: '/api/article',
  user: '/api/user',
  category: '/api/category',
  role: '/api/role',
}

app.use(path.auth, require('./src/routes/auth.route'));
app.use(path.article, require('./src/routes/article.route'));
app.use(path.user, require('./src/routes/user.route'));
app.use(path.category, require('./src/routes/category.route'));
app.use(path.role, require('./src/routes/role.route'));

app.listen(process.env.PORT, () => {
  console.log("Server is running on: " + process.env.PORT);
});
