const mongooseLib = require('mongoose');
const config = require('./config/config');

mongooseLib.Promise = global.Promise || Promise;

const adminSeeder = require('./seeders/admin.seeder');

const ENV = process.env.NODE_ENV || 'development';
const DB_URI = config.db[ENV].url;

module.exports = {

    // Export the mongoose lib
    mongoose: mongooseLib,

    // Export the mongodb url
    mongoURL: DB_URI,

    /*
      Seeders List
      ------
      order is important
    */
    seedersList: {
        Admin: adminSeeder
    }
};
