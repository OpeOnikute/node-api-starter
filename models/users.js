const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const utils = require('../lib/utils');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: null
    },
    lastName: {
        type: String,
        trim: true,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    adminRole:{
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3]
    },
    confirmationToken: {
        type: String,
        default: null
    },
    accountConfirmed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'enabled',
        enum: ['enabled', 'disabled', 'blocked', 'pending']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, { runSettersOnQuery: true });

/**
 * On every save...
 */
userSchema.pre('save', function(next) {
    const user = this;

    utils.hashPassword(user, function(){
        utils.setTimestamps(user, next);
    });
});

userSchema.pre('findOneAndUpdate', function(next) {
    const user = this;

    // update updateAt value
    const currentDate = new Date();
    user.update({}, { $set: { updatedAt: currentDate } });
    next();
});

userSchema.pre('find', function() {
    this.where({status: {$nin: ['disabled', 'blocked']}});
});

/**
 * Schema plugins
 */
userSchema.plugin(mongoosePaginate);

/**
 * Schema methods
 */
userSchema.methods.comparePassword = utils.comparePassword;
userSchema.methods.compareToken = utils.compareToken;

const user = mongoose.model('User', userSchema);

module.exports = user;