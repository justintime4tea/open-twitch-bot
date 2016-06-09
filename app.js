'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */

// Do NOT include this line if you are using the built js version!
var irc = require("tmi.js");
var personal = require("./personal.js");
var audience = require("./audience.js");
var tasks = require("./tasks.js");

var clientSender,           // Used to send messages to Twitch channel
    clientListener,         // Used to listen to messages from Twitch channel
    lastMessageTime,        // The time of the last message sent by bot to channel, in milleseconds
    currentViewers,         // Array of viewers we have already welcomes
    newViewers,             // Array of viewers we have yet to welcome
    quedMessages,           // Array of messages que'd to be sent to channel
    coolDown = 3000,        // Cooldown ms, time to wait before processing any new sendToChat msgs
    messageQue = [],
    queTime = 6000,
    queTimer;

const delayedBot = DelayQueue(clientListener.say, coolDown);

init();

function init() {

    // tasks.init();
    // TODO: Add check for crash to see if restarting or user initiated launch

    // Initialize variables
    lastMessageTime = 0;
    newViewers = [];
    currentViewers = [];

    // Connect the client to the server
    setupConnection(personal.CHANNEL(), personal.USERNAME(), personal.OATH());
}


/**
 * Setup an IRC connection to the Twitch network
 *
 * @param  {string} initialChannel The channel that the bot will initially connect to
 * @param  {string} username       The Twitch username to be used by the bot
 * @param  {string} password       The password for the username used by the bot
 */
function setupConnection(initialChannel, username, password) {

    // var callback = function(error, response, body){
    //         if (error) {
    //             console.log(error);
    //         } else {
    //             console.log(response.statusCode, body);
    //         }
    // };
    //
    // var viewers = api.getViewers(callback);


    // If we do not already have a clientSender and clientListener then create them
    if(!clientSender && !clientListener){
        var options = {
            options: {
                debug: true
            },
            connection: {
                random: "chat",
                reconnect: true
            },
            identity: {
                username: username,
                password: password
            },
            channels: [initialChannel]
        };

        // clientSender = new irc.client(options);
        clientListener = new irc.client(options);

        // clientSender.connect();
        clientListener.connect();

        // See function description
        setupIncommingEventHandlers(clientListener);
    }

}

/**
 * Setup event handlers for Twitch events such as join, chat, action, ban, etc...
 *
 * @param  {tmi.client} client The object used to communicate with the Twitch chat server
 */
function setupIncommingEventHandlers(client) {

    /**
     * 	Add listeners for all of the Twitch chat events supported by the tmi library
     */

    client.addListener("action", function(channel, user, message, self) {
        onAction(channel, user, message, self);
     });

    client.addListener("chat", function(channel, user, message, self) {

        onChat(channel, user, message, self);
    });

    //NOTE: Handling joins and leaves using Twitch TMI REST endpoint
    // client.addListener("join", function(channel, user) {
    //     onJoin(channel, user);
    // });
    // welcomeViewers();

}

/**
 * Records the time that the last message from Bot was sent to chat
 */
function updateTimeOfLastMessage(){
    lastMessageTime = Date.now();
}

/**
 * Wrapper function to ensure bot does not spam chat with messages
 * @param  {string} channel The channel to send a message to
 * @param  {string} message The message to send to channel
 */
function botSpeak(channel, message) {
    clearTimeout(queTimer);
    // Check if it has been longer than 3 seconds (3000 ms) since the last time the bot has spoke
    if ((Date.now() - lastMessageTime) >= coolDown ) {
        // Send the message provided to the channel provided
        clientListener.say(channel,message);
        console.log(channel, message);
        updateTimeOfLastMessage();
    } else {
        //TODO: Add message to our que of unsent messages
         messageQue.push(message);
    }

    queTimer = setTimeout(function() {
        if(messageQue.length > 0) {
            botSpeak(channel, messageQue.pop());
        }
    }, queTime);
}

/**
 * Welcome all the viewers who have yet to be welcomed to the chat
 */
function welcomeViewers() {

    if (newViewers !== undefined && newViewers.length > 0){
        for (let viewer of newViewers) {
                botSpeak(personal.CHANNEL, "Welcome: " + viewer);
        }
    }

}

/**
 * Handles Twitch action events
 * @param  {string} channel The channel the action is coming from
 * @param  {Object} user['username']    The user that is emitting the action
 * @param  {string} message The message being emitted by user
 * @param  {boolean} self   Whether or not the action is coming from the client application
 */
function onAction(channel, user, message, self) {

}


/**
 * Handles Twitch chat events
 * @param  {string} channel The channel the chat is coming from
 * @param  {Object} user    The user that is emitting the chat message
 * @param  {string} message The message being emitted by user
 * @param  {boolean} self   Whether or not the chat is coming from the client application
 */

function onChat(channel, user, message, self) {
    // console.log("Chat:", user["username"] !== undefined ? user["username"] : "SomeUser", "said:", message);
    if(user["username"] !== personal.USERNAME){
        // botSpeak(channel, user["username"] + " Are you a brony? ...BRONNIES... MOUNT UP!");
        delayedBot(channel, user["username"] + " Are you a brony? ...BRONNIES... MOUNT UP!");
    }
}

/**
 * Handle Twitch join events
 * @param  {string} channel  The channel that is being joined
 * @param  {string} username The username that is joining the channel
 */
function onJoin(channel, username) {
    console.log("Detected a join... no this is not SQL... HA... HA... HA... ", username);
    //TODO: Replace static defined username with the one listed in config.js
    if (username !== undefined && username !== "justintime4tea253") {
        // console.log("User:" + username + "has joined channel", channel);
        // botSpeak("justintime4tea253", "Welcome " + username + " to the channel!");

        // TODO: Check if user is already in list of currentViewers before adding to newViewers

        if (newViewers.length < 1) {
            console.log("First user to be added to newViewers:", username);
            newViewers = [username];
        } else if (!currentViewers.includes(username)) {
            newViewers.push(username);
            console.log("Added user", username, "to newViewers Array");
        } else {
            console.log("User already in currentViewers list");
        }

    }
}

function banUser(channel, user) {

}

function unBanUser(channel, user) {

}

function timeoutUser(channel, user, seconds) {

}

function parseMessage(message, emotes) {

}

function DelayQueue(delayedFunc, delayedMs) {
  let lastCalled = 0
  let queueInterval = null
  const queue = []
  const shouldDelay = () => (Date.now() - lastCalled) <= delayedMs

  return function() {
    if (shouldDelay()) {
      queueFunctionArgs(arguments)
      startWatchingQueue()
    } else {
      applyDelayedFunc(arguments)
      stopWatchingQueue()
    }
  }

  function queueFunctionArgs(args) {
    queue.push(Array.from(args))
  }

  function startWatchingQueue() {
    if (isNotWatchingQueue()) {
      queueInterval = setInterval(shiftQueue, delayedMs)
    }
  }

  function isNotWatchingQueue() {
    return queueInterval === null
  }

  function updateLastCalled() {
    lastCalled = Date.now()
  }

  function stopWatchingQueue() {
    clearInterval(queueInterval)
    queueInterval = null
  }

  function shiftQueue() {
    if (hasQueuedFunction()) {
      applyDelayedFunc(queue.shift())
    } else {
      stopWatchingQueue()
    }
  }

  function hasQueuedFunction() {
    return queue.length > 0
  }

  function applyDelayedFunc(args) {
    delayedFunc.apply(delayedFunc, args)
    updateLastCalled()
  }
}

