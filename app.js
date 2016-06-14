'use strict';
 
var irc         = require("irc"),
    mysql       = require('mysql'),
    request     = require('request'),
    _           = require('underscore'),
    chalk       = require("chalk"),
    moment      = require('momentjs'),
    config      = require("./config.js"),
    tasks       = require("./tasks.js"),
    now         = moment(),
    t           = 'hh:mm',
    channels    = [];

_(config.botSettings.channels).each(function(channel){
  channels.push('#' + channel);
});

// Connect bot using what's inside our config
var bot = new irc.Client(config.botSettings.server, config.botSettings.username, {
  channels: [channels + " " + config.botSettings.password],
  debug: false,
  password: config.botSettings.password,
  username: config.botSettings.username
});

console.log(chalk.inverse('[' + now.format(t) + ']') + ' ' 
            + chalk.cyan(config.botSettings.username) + ' connected to ' 
            + chalk.yellow(config.botSettings.server) + ' channels '
            + chalk.red(channels));

// Print all messages to chat
bot.addListener('message', function (from, to, message) {
    console.log(chalk.inverse('[' + now.format(t) + ']') + ' ' 
                + chalk.yellow(to) + ' ' + chalk.cyan(from) + ': ' + message);
});

tasks.init();