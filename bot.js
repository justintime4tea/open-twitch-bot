'use strict';

var irc         = require("tmi.js"),
    _           = require('underscore'),
    t           = 'hh:mm',
    channels    = [],
    config      = require("./config.js"),
    chalk       = require("chalk"),
    moment      = require('momentjs');

_(config.botSettings.channels).each(function(channel){
  channels.push('#' + channel);
});

var options = {
    options: {
        debug: false
    },
    connection: {
        cluster: "main",
        reconnect: true
    },
    identity: {
        username: config.botSettings.username,
        password: config.botSettings.password
    },
    channels: channels
};

// Connect bot using what's inside our config
var bot = new irc.client(options)

bot.connect().then(function(){

})

console.log(chalk.inverse('[' + moment().format(t) + ']') + ' '
            + chalk.cyan(config.botSettings.username) + ' connected to '
            + chalk.yellow(config.botSettings.server) + ' channels '
            + chalk.red(channels));

bot.on("chat", function(channel, user, message, self) {
    // console.log(chalk.inverse('[' + moment().format(t) + ']') + ' '
    //             + chalk.yellow(channel) + ' ' + chalk.cyan(user['username']) + ': ' + message);
    
});


exports.bot = bot;