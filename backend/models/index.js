// backend/models/index.js
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Cart = require('./Cart');
const Administrador = require('./Administrador'); // ← Esta línea

module.exports = {
    User,
    Product,
    Category,
    Cart,
    Administrador // ← Esta línea
};