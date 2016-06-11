'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */

var api         = require("./twitch-rest.js"),
    personal    = require("./personal.js"),
    chalk       = require("chalk"),
    fs          = require('fs'),
    fsHelper    = require("./fs-helper.js"),
    _           = require('underscore'),
    storedChatters,
    checkChatters;

function init(channels) {
    // Initialize our variables
    storedChatters = {}

    checkChatters = setInterval(function(){
        channels.forEach(function (channel) {
            detectChatters(channel);
        })
    }, 60000)

}

function detectChatters(channel) {

    var chatters = api.detectChatters(channel)

    Promise.all([channel, chatters]).then(function(data){

        // Get the viewer count, viewers, and moderators from tmi api
        var viewerCount = JSON.parse(data[1].body).chatter_count,
            currentViewers = JSON.parse(data[1].body).chatters.viewers,
            currentModerators= JSON.parse(data[1].body).chatters.moderators;

        // Get both viewers and moderators arrays now and join them into one array
        var currentChatters = _.union(currentViewers, currentModerators)

        // Find the difference between current and stored then remove the bot from it
        var newChatters = _(currentChatters).chain()
                          .difference(storedChatters[data[0]])
                          .without(personal.USERNAME().toLowerCase())
                          .value()

        // Find the difference between stored and current then remove the bot from it
        var newDisconnectedChatters = _(storedChatters[data[0]]).chain()
                                      .difference(currentChatters)
                                      .without(personal.USERNAME().toLowerCase())
                                      .value()

        // Is the previous data stored equal to the data we just got above
        var areTheArraysEqual = _(currentChatters).isEqual(storedChatters[data[0]])

        console.log(chalk.magenta('Current user count: ') + viewerCount)

        // If the arrays aren't equal and we have data in our global variable as well as detected a difference
        if( !areTheArraysEqual 
            && storedChatters[data[0]] != undefined
            && !_(newChatters).isEmpty()
            || !_(newDisconnectedChatters).isEmpty() )
        {
            // If there is new chatters
            if(!_(newChatters).isEmpty()){
                console.log(chalk.green('These user(s) have joined: ') + newChatters)
            }
            // If there is chatters that have disconnected
            if(!_(newDisconnectedChatters).isEmpty()){
                console.log(chalk.red('These user(s) have disconnected: ') + newDisconnectedChatters)
            }
        }

        // Set the current viewers and moderators in a global variable to compare on the next function call
        storedChatters[data[0]] = _.union(currentViewers, currentModerators)
    }, function(err){
            console.error(err)
    })
}

module.exports = {
    init
};