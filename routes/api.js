'use strict';
const ThreadHandler = require('../controllers/ThreadHandler');
const ReplyHandler = require('../controllers/ReplyHandler');

module.exports = function(app) {
    const threadHandler = new ThreadHandler();
    const replyHandler = new ReplyHandler();

    app.route('/api/threads/:board')
        .post(threadHandler.postThread)
        .get(threadHandler.getAllThread)
        .delete(threadHandler.deleteThread)
        .put(threadHandler.postThread);

    app.route('/api/replies/:board')
        .post(replyHandler.postReply)
        .get(replyHandler.getAllReply)
        .delete(replyHandler.deleteReply)
        .put(replyHandler.reportReply);
};
