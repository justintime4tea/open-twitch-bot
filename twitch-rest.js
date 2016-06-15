'use strict';

var request = require('request'),
    tmiPrefix = "http://tmi.twitch.tv/group/user/",
    apiPrefix = "https://api.twitch.tv/kraken",
    headers = {'Accept': 'application/vnd.twitchtv.v3+json'},
    qs = {},
    method = "GET";

function detectChatters(channel) {
    var urlSuffix = "/chatters"
    return new Promise(function(resolve, reject) {
        request({
            url: tmiPrefix + channel + urlSuffix,
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

function detectFollows(channel) {
    var urlSuffix = "/follows"
    return new Promise(function(resolve, reject) {
        request({
            url: apiPrefix + "/channels/" + channel + urlSuffix,
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
    detectChatters,
    detectFollows
};