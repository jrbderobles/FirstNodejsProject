const Sequelize = require('sequelize');

const sequelize = new Sequelize('my-first-node-schema', 'root', 'Poopygel!0228', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;