// scripts/init-mongo.js
// Script de inicialización para MongoDB

// Crear la base de datos petstyle
db = db.getSiblingDB('petstyle');

// Crear usuario para la aplicación
db.createUser({
  user: 'petstyle_user',
  pwd: 'petstyle_password',
  roles: [
    {
      role: 'readWrite',
      db: 'petstyle'
    }
  ]
});

// Crear colecciones básicas
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('orders');
db.createCollection('carts');

// Insertar datos iniciales si es necesario
db.categories.insertMany([
  {
    name: 'Comida para Perros',
    description: 'Alimentos nutritivos para perros',
    createdAt: new Date()
  },
  {
    name: 'Comida para Gatos',
    description: 'Alimentos nutritivos para gatos',
    createdAt: new Date()
  },
  {
    name: 'Juguetes',
    description: 'Juguetes para mascotas',
    createdAt: new Date()
  },
  {
    name: 'Accesorios',
    description: 'Accesorios para mascotas',
    createdAt: new Date()
  }
]);

print('Base de datos inicializada correctamente!');