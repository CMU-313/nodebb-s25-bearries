'use strict';

const api = require('../../api');
const sockets = require('../index');

module.exports = function (SocketPosts) {
    // SocketPosts.getVoters = async function (socket, data) {
    //         if (!data || !data.pid) {
    //             throw new Error('[[error:invalid-data]]');
    //         }
    //         sockets.warnDeprecated(socket, 'GET /api/v3/posts/:pid/voters');
    //         return await api.posts.getVoters(socket, { pid: data.pid });
    //     }; 
    
    //LYNNCHANGE! Socket we only need upvoters, not total voters

    SocketPosts.getReactors = async function (socket, pids) {
        if (!Array.isArray(pids)) {
            throw new Error('[[error:invalid-data]]');
        }
        sockets.warnDeprecated(socket, 'GET /api/v3/posts/:pid/reactors');
        return await api.posts.getReactors(socket, { pid: pids[0] });
    };
};
