'use strict';
const threadHandler = require('../controllers/ThreadHandler');
const replyHandler = require('../controllers/ReplyHandler');

module.exports = function(app) {
    app.route('/api/threads/:board')
        .post((req, res) => threadHandler(req.body.board).postThread(req, res))
        .get((req, res) => threadHandler(req.body.board).getAllThread(req, res))
        .delete((req, res) =>
            threadHandler(req.body.board).deleteThread(req, res)
        )
        .put((req, res) => threadHandler(req.body.board).reportThread(req, res));

    app.route('/api/replies/:board')
        .post((req, res) => replyHandler(req.body.board).postReply(req, res))
        .get((req, res) => replyHandler(req.body.board).getAllReply(req, res))
        .delete((req, res) =>
            replyHandler(req.body.board).deleteReply(req, res)
        )
        .put((req, res) => replyHandler(req.body.board).reportReply(req, res));
};
