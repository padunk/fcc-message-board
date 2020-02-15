'use strict';
const mongoose = require('mongoose');
const alert = require('alert-node');

const { threadSchema, repliesSchema } = require('../schema/Schema');
const CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const ThreadModel = mongoose.model('ThreadModel', threadSchema);
const ReplyModel = mongoose.model('ReplyModel', repliesSchema);

module.exports = function(app) {
    app.route('/api/threads/:board')
        .post((req, res) => {
            let { board, text, delete_password } = req.body;

            let thread = new ThreadModel({
                text,
                delete_password,
            });

            thread.save((err, data) => {
                if (err) console.error(err);
            });
            // res.redirect(`/b/${board}`);
        })
        .get((req, res) => {
            let options = {
                sort: {
                    bumped_on: -1,
                },
                limit: 10,
            };
            ThreadModel.find()
                .sort(options.sort)
                .limit(options.limit)
                .exec((err, data) => {
                    console.log(data);
                    let displayData = data.map(
                        ({ _id, text, created_on, bumped_on, replies }) => {
                            return {
                                _id,
                                text,
                                created_on,
                                bumped_on,
                                replies,
                                replycount: replies.length,
                            };
                        }
                    );
                    res.json(displayData);
                });
        })
        .delete((req, res) => {
            let { thread_id, delete_password } = req.body;

            ThreadModel.findById(thread_id).exec((err, data) => {
                if (data.delete_password === delete_password) {
                    ThreadModel.findByIdAndDelete(thread_id).exec(
                        (err, deletedData) => {
                            alert('success');
                        }
                    );
                } else {
                    alert('incorrect password');
                }
            });
        })
        .put((req, res) => {
            console.log(req.body);
            let { thread_id } = req.body;
            ThreadModel.findByIdAndUpdate(thread_id, {
                reported: true,
            }).exec((err, data) => {
                if (err) console.error(err);
                alert('success');
            });
        });

    app.route('/api/replies/:board')
        .post((req, res) => {
            const { board, thread_id, text, delete_password } = req.body;
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
                    console.log(data);
                }
            );
            // res.redirect(`/b/${board}/${thread_id}`);
        })
        .get((req, res) => {
            let { thread_id } = req.query;
            ThreadModel.findById(thread_id, 'replies').exec(
                (err, { replies }) => {
                    console.log(replies);
                    let showReplies = replies.map(
                        ({ _id, text, created_on }) => {
                            return {
                                _id,
                                text,
                                created_on,
                            };
                        }
                    );
                    res.json(showReplies);
                }
            );
        })
        .delete((req, res) => {
            let { reply_id, delete_password: given_password } = req.body;

            let findReply = {
                replies: { $elemMatch: { _id: reply_id } },
            };

            ThreadModel.findOne(findReply)
                .select(findReply)
                .exec((err, data) => {
                    if (err) {
                        console.error(err);
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
                            console.log(data);
                            alert('success');
                        });
                    } else {
                        alert('incorrect password');
                    }
                });
        })
        .put((req, res) => {
            console.log(req.body);
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
                    console.log(data);
                }
            );
        });
};
