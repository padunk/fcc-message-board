'use strict';
const mongoose = require('mongoose');
const alert = require('alert-node');

const { threadSchema } = require('../schema/Schema');
const handleError = require('../utils/handleError');
const CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

function threadHandler(board) {
    const ThreadModel = mongoose.model(board, threadSchema);

    this.postThread((req, res) => {
        let { board, text, delete_password } = req.body;

        let thread = new ThreadModel({
            text,
            delete_password,
        });

        thread.save((err, data) => {
            if (err) handleError(err);
            res.redirect(`/b/${board}/`);
        });
    });

    this.getAllThread((req, res) => {
        let options = {
            sort: { bumped_on: -1 },
            limit: 10,
        };
        ThreadModel.find()
            .sort(options.sort)
            .limit(options.limit)
            .exec((err, data) => {
                if (err) {
                    handleError(err);
                    return;
                }
                let displayData = data.map(
                    ({ _id, text, created_on, bumped_on, replies }) => {
                        return {
                            _id,
                            text,
                            created_on,
                            bumped_on,
                            replies:
                                replies.length > 3
                                    ? replies.slice(-3)
                                    : replies,
                            replycount: replies.length,
                        };
                    }
                );
                res.json(displayData);
            });
    });

    this.deleteThread((req, res) => {
        let { thread_id, delete_password } = req.body;

        ThreadModel.findById(thread_id).exec((err, data) => {
            if (err) {
                handleError(err);
                return;
            }
            if (data.delete_password === delete_password) {
                ThreadModel.findByIdAndDelete(thread_id).exec(
                    (err, deletedData) => {
                        if (err) {
                            handleError(err);
                            return;
                        }
                        alert('success');
                    }
                );
            } else {
                alert('incorrect password');
            }
        });
    });

    this.reportThread((req, res) => {
        let { thread_id } = req.body;
        ThreadModel.findByIdAndUpdate(thread_id, {
            reported: true,
        }).exec((err, data) => {
            if (err) {
                handleError(err);
                return;
            }
            alert('success');
            res.send('reported');
        });
    });
}

module.exports = threadHandler;
