// Core modules
const path = require('path');

// Dependency modules
const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');

// Custom modules
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');

const app = express();
app.engine('hbs', engine({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout', extname: 'hbs'}));
app.set('view engine', 'hbs');

//app.set('view engine', 'pug');
app.set('views', 'views'); // explicit setting of where views are located; no need to set if in views folder (default) for pug

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', {pageTitle: 'Page Not Found'});
})

app.listen(3000);