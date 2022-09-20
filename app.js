// Core modules
const path = require('path');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

// Custom modules
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const rootDir = require('./util/path');

const errorsController = require('./controllers/errors');

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://username5263:ThisIsMyDbPass0228@cluster0.2bjd6of.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views'); // explicit setting of where views are located

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));
app.use(session({
  secret: 'secret string value',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }

  User
    .findById(req.session.user._id)
    .then(user => {
      // throw new Error('Dummy');
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorsController.get500);
app.use(errorsController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render();
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => app.listen(3000))
  .catch(err => console.log(err));