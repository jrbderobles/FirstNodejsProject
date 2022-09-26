// Core modules
const fs = require('fs');
const path = require('path');
const https = require('https');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config({ debug: true });

// Custom modules
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const rootDir = require('./util/path');

const errorsController = require('./controllers/errors');

const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a'
});
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.set('view engine', 'ejs');
app.set('views', 'views'); // explicit setting of where views are located

app.use(helmet());
app.use(compression());
app.use(morgan('combined', {
  stream: accessLogStream
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));

app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));

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
  .then(() => {
    // https.createServer({
    //   key: privateKey,
    //   cert: certificate
    // }, app).listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => console.log(err));