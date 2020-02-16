require('dotenv').config();
const assert = require('chai').assert;

const ThreadHandler = require('../controllers/ThreadHandler');
const ReplyHandler = require('../controllers/ReplyHandler');

suite('Unit Tests', function() {
    const th = new ThreadHandler();
    const rh = new ReplyHandler();

    test('ThreadHandler is a class', done => {
        assert.isDefined(th, 'ThreadHandler is defined');
        assert.isObject(th, 'ThreadHandler is a object');
        done();
    });

    test('ThreadHandler class methods', done => {
        assert.isFunction(th.postThread, 'postThread is a function');
        assert.isFunction(th.getAllThread, 'getAllThread is a function');
        assert.isFunction(th.reportThread, 'reportThread is a function');
        assert.isFunction(th.deleteThread, 'deleteThread is a function');
        done();
    });

    test('ReplyHandler is a function', done => {
        assert.isDefined(rh, 'ReplyHandler is defined');
        assert.isObject(rh, 'ReplyHandler is a object');
        done();
    });

    test('ReplyHandler class methods', done => {
        assert.isFunction(rh.postReply, 'postReply is a function');
        assert.isFunction(rh.getAllReply, 'getAllReply is a function');
        assert.isFunction(rh.reportReply, 'reportReply is a function');
        assert.isFunction(rh.deleteReply, 'deleteReply is a function');
        done();
    });
});
