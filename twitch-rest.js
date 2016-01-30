'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */


var request = require('request');
var url = "http://tmi.twitch.tv/group/user/justintime4tea253/chatters";
var headers = {'Accept': 'application/vnd.twitchtv.v3+json'};
var qs = {};
var method = "GET";

function getChatters(channel) {
    return new Promise(function(resolve, reject) {
        request({
            url: url,
            qs: qs,
            method: method,
            headers: headers
        }, function(err, response, body){
            if (err) {
                reject(Error(err));
            } else {
                var data = {
                    response,
                    body
                };
                resolve(data);
            }
        });
    });

}

module.exports = {
    getChatters
};