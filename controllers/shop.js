const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(([products, fieldData]) => {
      res.render('shop/index', {
        productList: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([products, fieldData]) => {
      res.render('shop/product-list', {
        productList: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(([product, fieldData]) => {
      res.render('shop/product-detail', {
        product: product[0],
        pageTitle: product[0].title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    if (!cart) {
      return res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: []
      });
    }

    Product.fetchAll(products => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(p => p.id === product.id);
        if (cartProductData) {
          cartProducts.push({productData: product, quantity: cartProductData.quantity});
        }
      }

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });    
  });
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId, product => {
    Cart.addProduct(productId, product.price);
  });

  res.redirect('/cart');
}

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, product => {
    Cart.deleteProduct(productId, product.price);
    res.redirect('/cart');
  });
}

exports.getOrders = (req, res, next) => {

  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  })
}

