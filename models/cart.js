const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const savePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(savePath, (err, fileContent) => {
      let cart = {products: [], totalPrice: 0};
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex(product => product.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.quantity += 1;

        // ensures you don't edit old value which might cause bugs, depending on complexity
        // not pointing to the same object in the memory of the machine
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {id: id, quantity: 1};
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice += parseFloat(productPrice);
      fs.writeFile(savePath, JSON.stringify(cart), err => console.log(err));
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(savePath, (err, fileContent) => {
      if (err) {
        return;
      }

      const updatedCart = {...JSON.parse(fileContent)};
      const product = updatedCart.products.find(p => p.id === id);
      if (!product) {
        return;
      }

      const productQuantity = product.quantity;

      updatedCart.products = updatedCart.products.filter(p => p.id !== id);
      updatedCart.totalPrice -= productPrice * productQuantity;

      fs.writeFile(savePath, JSON.stringify(updatedCart), err => console.log(err));
    });
  }

  static getCart(cb) {
    fs.readFile(savePath, (err, fileContent) => {
      if (err) {
        cb(null);
      } else {
        const cart = JSON.parse(fileContent);
        cb(cart);
      }
    });
  }
}