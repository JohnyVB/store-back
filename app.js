require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fileUpload = require('express-fileupload');

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
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

const path = {
  auth: '/api/auth',
  article: '/api/article',
  image_url: '/api/image_url',
  user: '/api/user',
  category: '/api/category',
  role: '/api/role',
  income: '/api/income',
}

app.use(path.auth, require('./src/routes/auth.route'));
app.use(path.article, require('./src/routes/article.route'));
app.use(path.image_url, require('./src/routes/image_url.route'));
app.use(path.user, require('./src/routes/user.route'));
app.use(path.category, require('./src/routes/category.route'));
app.use(path.role, require('./src/routes/role.route'));
app.use(path.income, require('./src/routes/income.route'));

app.listen(process.env.PORT, () => {
  console.log("Server is running on: " + process.env.PORT);
});
