// Core modules
const path = require('path');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');

// Custom modules
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const rootDir = require('./util/path');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const errorsController = require('./controllers/errors');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); // explicit setting of where views are located

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

User.hasOne(Cart);
User.hasMany(Product);
User.hasMany(Order);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
Product.belongsToMany(Cart, {through: CartItem});
Product.belongsToMany(Order, {through: OrderItem});

Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});

Order.belongsTo(User);
Order.belongsToMany(Product, {through: OrderItem});

sequelize
  // .sync({force: true})
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
       return User.create({
        name: 'John de Robles',
        email: 'jrbderobles@gmail.com'
      });
    }

    return user;
  })
  .then(user => {
    return user.getCart()
      .then(cart => {
        if (!cart) {
          return user.createCart();
        }
        
        return cart;
      });
  })
  .then(cart => app.listen(3000))
  .catch(err => console.log(err));