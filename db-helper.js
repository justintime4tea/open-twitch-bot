'use strict';

var fsHelper = require("./fs-helper.js");

function storeChatters(chatters) {
    fsHelper.writeToFile('chatters.json', chatters)
}

function getChatters() {
    return fsHelper.readFile('chatters.json')
}

function storeFollowers(followers) {
    fsHelper.writeToFile('followers.json', followers)
}

function getFollowers() {
    return fsHelper.readFile('followers.json')
}

module.exports = {
    storeChatters,
    getChatters,
    storeFollowers,
    getFollowers
}