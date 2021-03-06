const dotenv = require('dotenv').config(); //require env variables to make file independent

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbBase = process.env.DB_BASE;

module.exports = {
    db: {
        development: {
            url: `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5000
        },
        test: {
            url: `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5000
        },
        staging: {
            url: `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5300
        },
        production: {
            url: `mongodb://${dbUser}:${dbPassword}@${dbBase}`,
            port: 5300
        }
    },
    secret: process.env.SECRET,
    emailFrom: process.env.EMAIL_FROM,
    mailgunDomain: process.env.MAILGUN_DOMAIN,
    mailgunKey: process.env.MAILGUN_KEY,
    adminPaginateLimit: process.env.ADMIN_PAGINATION_LIMIT || 20
};