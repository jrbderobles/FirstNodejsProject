const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        productList: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        productList: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(() => {
      const cartProducts = req.user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    })
    .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product
    .findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err));
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(() => {
      const cartProducts = req.user.cart.items.map(i => {
        return {quantity: i.quantity, product: {...i.productId._doc}};
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: cartProducts
      });

      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect('/orders'))
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  Order
    .find({'user.userId': req.user._id})
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      })
    })
    .catch(err => console.log(err));
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  })
}

