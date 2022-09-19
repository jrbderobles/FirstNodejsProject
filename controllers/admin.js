const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const user = req.user;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: user
  });

  product
    .save()
    .then(() => {
      console.log('Product created!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
  
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;

  Product.findById(productId).then(product => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    product.imageUrl = updatedImageUrl;
    return product.save();
  })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      // console.log(products);
      res.render('admin/products', {
        productList: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findByIdAndRemove(productId)
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}