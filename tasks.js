'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */

var api = require("./twitch-rest.js"),
    fs = require('fs'),
    fsHelper = require("./fs-helper.js"),
    channelChatters,
    chattersToWelcome = [],
    chatterChecker,
    _ = require('underscore');

function init(channels) {
    // Initialize our variables
    channelChatters = {}

    chatterChecker = setInterval(function(){
        channels.forEach(function (channel) {
            getChatters(channel);
        })
    }, 3000)

}

function getChatters(channel) {

    var chatters = api.getChatters(channel)

    Promise.all([channel, chatters]).then(function(data){
        if(channelChatters[data[0]]) {
            var oldViewers = channelChatters[data[0]].viewers
            var oldMods    = channelChatters[data[0]].moderators
            var newViewers = JSON.parse(data[1].body).chatters.viewers
            var newMods = JSON.parse(data[1].body).chatters.moderators
        } else {
            console.log("No chatters, initial loading of chatters")
        }

        channelChatters[data[0]] = JSON.parse(data[1].body).chatters
    }, function(err){
        console.error(err)
    })

}

function checkNewChatters(channel){
    var oldChatters = channelChatters[channel]
    console.log("FUNNZIES:", oldChatters)
    getChatters(channel)

    greetNewChatters(chatters);
}


module.exports = {
    init
};