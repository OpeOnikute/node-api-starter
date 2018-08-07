const dotenv = require('dotenv').config(); //require env variables to make file independent

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbBase = process.env.DB_BASE;
const mongoURI = process.env.MONGODB_URI;

module.exports = {
    db: {
        development: {
            url: `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5000
        },
        test: {
            url: `mongodb://${dbUser}:${dbPassword}@localhost/j-test`,
            port: 5000
        },
        staging: {
            url: mongoURI || `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5300
        },
        production: {
            url: mongoURI || `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5300
        }
    },
    secret: process.env.SECRET
};