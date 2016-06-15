'use strict';

var tasks       = require("./tasks.js"),
    bot         = require("./bot.js").bot;

bot.on("connected", function(address, port) {
    tasks.init();
});

