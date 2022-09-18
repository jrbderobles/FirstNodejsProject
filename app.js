// Core modules
const path = require('path');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');

// Custom modules
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const rootDir = require('./util/path');
const mongoConnect = require('./util/database').mongoConnect;

const errorsController = require('./controllers/errors');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); // explicit setting of where views are located

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
  User.findById('63273b7a6f201307c257edd9')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

mongoConnect(() => {
  app.listen(3000);
});