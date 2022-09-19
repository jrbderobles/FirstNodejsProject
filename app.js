// Core modules
const path = require('path');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Custom modules
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const rootDir = require('./util/path');

const errorsController = require('./controllers/errors');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); // explicit setting of where views are located

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
  User.findById('6328781b89ac81ac87a1610b')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

mongoose.connect('mongodb+srv://username5263:ThisIsMyDbPass0228@cluster0.2bjd6of.mongodb.net/shop?retryWrites=true&w=majority')
  .then(() => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'John de Robles',
          email: 'jrbderobles@gmail.com',
          cart: {
            items: []
          }
        });
    
        user.save();
      }
      return user;
    });
  })
  .then(() => {
      app.listen(3000);
    })
  .catch(err => console.log(err));