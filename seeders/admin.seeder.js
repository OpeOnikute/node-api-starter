const Seeder = require('mongoose-data-seed').Seeder;
const Model = require('../models/users');

const data = [{
    firstName: 'root',
    lastName: 'user',
    email: 'root@gmail.com',
    isAdmin: true,
    adminRole: 3,
    password: 'root'
}];

const AdminSeeder = Seeder.extend({
  run: function () {
    return Model.create(data);
  }
});

module.exports = AdminSeeder;
