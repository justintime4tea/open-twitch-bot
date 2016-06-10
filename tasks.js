'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */

var api = require("./twitch-rest.js"),
    fs = require('fs'),
    fsHelper = require("./fs-helper.js"),
    chatterChecker;

function init(channels) {

    // Record chatters in each channel
    channels.forEach(function (channel) {
        fsHelper.deleteFiles([channel + '_chatters.json', channel + '_chatters.json.tmp'])
        writeChattersToFile(channel)
    })

}

function checkNewChatters(channel, newChatters){
    var oldChatters;

    fsHelper.readFile(channel + '_chatters.json').then(function(data) {
        oldChatters = JSON.parse(data[0].body).chatters;
    })

    chatters = compareChatters(oldChatters, newChatters);
    greetNewChatters(chatters);
}

function compareChatters(chatters1, chatters2) {
    console.log(chatters1);
    console.log(chatters2);
}

function writeChattersToFile(channel){
    clearTimeout(chatterChecker)
    fs.stat(channel + '_chatters.json', function(err, stats){
        if(err) {
            chatterChecker = setTimeout(function(){
                // Returns data object with response and body
                var monitorChatters = api.getChatters(channel)
                Promise.all([monitorChatters]).then(function(data){
                    fsHelper.writeToFile(channel + '_chatters.json', JSON.parse(data[0].body))
                }, function(err){
                    console.error(err)
                })
                writeChattersToFile(channel)
            }, 3000)
        } else {
            chatterChecker = setTimeout(function(){
                // Returns data object with response and body
                var monitorChatters = api.getChatters(channel)
                Promise.all([monitorChatters]).then(function(data){
                        fsHelper.writeToFile(channel + '_chatters.json.tmp', JSON.parse(data[0].body))
                        checkNewChatters(channel, JSON.parse(data[0].body))
                }, function(err){
                    console.error(err)
                })
                writeChattersToFile(channel)
            }, 3000)

        }
    })
}

/**
 * Greet the chatters!
 *
 * @param  {[type]} chatters JSON Object which contains moderators, staff, admins, global_mods, viewers
 */
function greetNewChatters(chatters) {

    console.log("Welcome all the mods: ", chatters.moderators);
    console.log("Welcome all the viewers: ", chatters.viewers);
}

module.exports = {
    init,
    greetNewChatters
};