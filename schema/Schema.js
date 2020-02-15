const mongoose = require('mongoose');

const repliesSchema = new mongoose.Schema({
    text: String,
    created_on: {
        type: Date,
        default: Date.now,
    },
    delete_password: String,
    reported: {
        type: Boolean,
        default: false,
    },
});

const threadSchema = new mongoose.Schema({
    text: String,
    created_on: {
        type: Date,
        default: Date.now,
    },
    bumped_on: {
        type: Date,
        default: Date.now,
    },
    reported: {
        type: Boolean,
        default: false,
    },
    delete_password: String,
    replies: [repliesSchema],
});

module.exports = {
    repliesSchema,
    threadSchema,
};
