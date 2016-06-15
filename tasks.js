'use strict';

var chalk           = require("chalk"),
    moment          = require("momentjs"),
    config          = require("./config.js"),
    api             = require("./twitch-rest.js"),
    _               = require('underscore'),
    t               = 'hh:mm:ss',
    bot             = require("./bot.js").bot,
    db              = require("./db-helper.js"),
    storedFollowers,
    printedFollowCount = false,
    printedChattersCount = false;

function init() {

  // List the channels we are detecting chatters in
  _(config.botSettings.channels).each(function(channel){
    console.log(chalk.inverse('[' + moment().format(t) + ']') + ' '
                + chalk.yellow('Detecting chatters') + ' in '
                + chalk.green(channel))
  });

  // Check the tmi api for each channel every one minute
  (function checkChatters() {

    _(config.botSettings.channels).each(function(channel){
      detectChatters(channel);
    })
      setTimeout(checkChatters, 60000);
  })();

  // Check official twitch rest api for followers every 10 seconds
  (function checkFollowers() {

    _(config.botSettings.channels).each(function(channel){
        detectFollows(channel);
    })
      setTimeout(checkFollowers, 30000);
  })();

};

function detectFollows(channel) {

    var followers = api.detectFollows(channel),
        welcomedFollowers = [],
        newFollowers = "";

    db.getFollowers().then(function(data) {
        storedFollowers = data
        db.getChatters().then(function(storedChatters) {

            Promise.all([channel, followers]).then(function(data) {
                var currentFollowers = JSON.parse(data[1].body).follows,
                followCount = JSON.parse(data[1].body)._total;

                if(!printedFollowCount){
                    console.log(chalk.inverse('[' + moment().format(t) + ']') + ' '
                                + chalk.magenta('Current follow count') + ' in '
                                + chalk.yellow(channel) + ': ' + followCount)
                    printedFollowCount = true
                }


                _(storedFollowers).each(function (follower){
                    if(follower.welcomed) {
                        welcomedFollowers.push(follower.username)
                    }
                })

                currentFollowers = _(currentFollowers).chain()
                     .map(function(data) {
                         var hasBeenWelcomed = false;
                         if(welcomedFollowers.indexOf(data.user.display_name) > -1) {
                             hasBeenWelcomed = true;
                         }
                        return {
                          username: data.user.display_name,
                          logo: data.user.logo === null ? "" : data.user.logo,
                          welcomed: hasBeenWelcomed
                        };
                      })
                      .value();

                _(currentFollowers).each(function (follower){
                    if(!follower.welcomed) {
                        if(bot.readyState() === "OPEN" && storedChatters.indexOf(follower.username.toLowerCase()) > -1) {
                            follower.welcomed = true
                            newFollowers = (newFollowers === "" ? "" : newFollowers + ", ") + follower.username
                            console.log(chalk.inverse('[' + moment().format(t) + ']') + ' '
                                        + chalk.magenta('New follower detected') + ' in '
                                        + chalk.yellow(channel) + ': ' + follower.username)
                        }
                    }
                })

                if(newFollowers !== ""){
                    bot.say(channel, "Let's give a big welcome to our new follower(s)!")
                    bot.say(channel, "New Followers: " + newFollowers + ".")
                }

                db.storeFollowers(currentFollowers)
        })
    })



    }, function(err){
        console.error(err)
    })

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

      db.getChatters().then(function (storedChatters){
          // Find the difference between current and stored then remove the bot from it
          var newChatters = _(currentChatters).chain()
                            .difference(storedChatters[data[0]])
                            .without(config.botSettings.username.toLowerCase())
                            .value()

          // Find the difference between stored and current then remove the bot from it
          var newDisconnectedChatters = _(storedChatters[data[0]]).chain()
                                        .difference(currentChatters)
                                        .without(config.botSettings.username.toLowerCase())
                                        .value()

          // Is the previous data stored equal to the data we just got above
          var areTheArraysEqual = _(currentChatters).isEqual(storedChatters[data[0]])

          if(!printedChattersCount){
              console.log(chalk.inverse('[' + moment().format(t) + ']') + ' '
                          + chalk.magenta('Current user count') + ' in '
                          + chalk.yellow(channel) + ': ' + viewerCount)
              printedChattersCount = true
          }

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
          db.storeChatters(_.union(currentViewers, currentModerators))
      })

  }, function(err){
          console.error(err)
  })
};

module.exports = {
  init
};
