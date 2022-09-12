// Core modules
const path = require('path');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');

// Custom modules
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views'); // explicit setting of where views are located

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', {pageTitle: 'Page Not Found'});
})

app.listen(3000);