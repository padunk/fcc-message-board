'use strict';
const mongoose = require('mongoose');
const alert = require('alert-node');

const { repliesSchema } = require('../schema/Schema');
const handleError = require('../utils/handleError');
const CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

function replyHandler(board) {
    const ReplyModel = mongoose.model(board, repliesSchema);

    this.postReply((req, res) => {
        const { thread_id, text, delete_password } = req.body;
        let reply = new ReplyModel({
            text,
            delete_password,
        });
        ThreadModel.findByIdAndUpdate(
            thread_id,
            {
                $push: { replies: reply },
                bumped_on: Date.now(),
            },
            (err, data) => {
                if (err) {
                    handleError(err);
                    return;
                }
                res.redirect(`/b/${board}/${thread_id}`);
            }
        );
    });

    this.getAllReply((req, res) => {
        let { thread_id } = req.query;
        ThreadModel.findById(thread_id, 'replies').exec((err, { replies }) => {
            if (err) {
                handleError(err);
                return;
            }
            let showReplies = replies.map(({ _id, text, created_on }) => {
                return {
                    _id,
                    text,
                    created_on,
                };
            });
            res.json(showReplies);
        });
    });

    this.deleteReply((req, res) => {
        let { reply_id, delete_password: given_password } = req.body;

        let findReply = {
            replies: { $elemMatch: { _id: reply_id } },
        };

        ThreadModel.findOne(findReply)
            .select(findReply)
            .exec((err, data) => {
                if (err) {
                    handleError(err);
                    return;
                }
                let { replies } = data;
                let { delete_password } = replies[0];
                let update = {
                    $set: {
                        'replies.$.text': '[deleted]',
                    },
                };
                let options = {
                    new: true,
                    lean: true,
                    upsert: true,
                    useFindAndModify: false,
                };

                if (given_password === delete_password) {
                    ThreadModel.findOneAndUpdate(
                        findReply,
                        update,
                        options
                    ).exec((err, data) => {
                        alert('success');
                    });
                } else {
                    alert('incorrect password');
                }
            });
    });

    this.reportReply((req, res) => {
        let { reply_id } = req.body;
        let findReply = {
            replies: {
                $elemMatch: { _id: reply_id },
            },
        };

        let update = {
            $set: {
                'replies.$.reported': true,
            },
        };

        let options = {
            useFindAndModify: true,
        };

        ThreadModel.findOneAndUpdate(findReply, update, options).exec(
            (err, data) => {
                if (err) {
                    handleError(err);
                    return;
                }
                alert('success');
                res.send('reported');
            }
        );
    });
}

module.exports = replyHandler;