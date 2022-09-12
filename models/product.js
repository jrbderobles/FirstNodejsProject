const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const savePath = path.join(rootDir, 'data', 'products.json');
const getProductsFromFile = cb => {
  fs.readFile(savePath, (err, fileContent) => {
    if (err) {
      return cb([]);
    }

    cb(JSON.parse(fileContent));
  });
}

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(savePath, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
}