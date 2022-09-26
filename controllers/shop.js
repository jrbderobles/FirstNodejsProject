const fs = require('fs');
const path = require('path');

const stripe = require('stripe')(process.env.STRIPE_KEY);
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product
    .find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product
        .find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        productList: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product
    .find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product
        .find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        productList: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product
    .findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect('/cart'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId')
    .then(() => {
      products = req.user.cart.items;

      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: products.map(p => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: 'usd',
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description
              }
            }
          };
        }),
        customer_email: req.user.email,
        success_url: req.protocol + '://' + req.get('host') + '/checkout/sucess',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order
    .findById(orderId)
    .then(order => {
      if (!order) return next(new Error('No order found.'));
      if (order.user.userId.toString() !== req.user._id.toString()) return next(new Error('Unauthorized'));
      
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDocument = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

      pdfDocument.pipe(fs.createWriteStream(invoicePath));
      pdfDocument.pipe(res);

      pdfDocument.fontSize(26).text('Invoice', {
        underline: true
      });

      pdfDocument.text('----------------------');
      
      let totalPrice = 0;
      order.products.forEach(p => {
        totalPrice += p.quantity * p.product.price;
        pdfDocument.fontSize(14).text(p.product.title + ' - ' + p.quantity + ' x ' + '$' + p.product.price);
      });
      pdfDocument.text('---');
      pdfDocument.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDocument.end();

      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      // file.pipe(res);
    })
    .catch(err => next(err));
};