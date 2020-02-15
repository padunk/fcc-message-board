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

class ThreadHandler {
    
    postThread(req, res) {
        let { board, text, delete_password } = req.body;
        let ThreadModel = mongoose.model(board, threadSchema);

        let thread = new ThreadModel({
            text,
            delete_password,
        });

        thread.save((err, data) => {
            if (err) handleError(err);
            res.redirect(`/b/${board}/`);
        });
    };

    getAllThread(req, res) {
        let ThreadModel = mongoose.model(req.params.board, threadSchema);
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
    };

    deleteThread(req, res) {
        let { board, thread_id, delete_password } = req.body;
        let ThreadModel = mongoose.model(board, threadSchema);

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
    };

    reportThread(req, res) {
        let { board, thread_id } = req.body;
        let ThreadModel = mongoose.model(board, threadSchema);

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
    };
}

module.exports = ThreadHandler;
