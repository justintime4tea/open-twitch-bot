'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */

var api = require("./twitch-rest.js");

// TEST: listChatters
// audience.listChatters().then(function(data) {
//     var jsonData = JSON.parse(data);
//     console.log("Current viewers:", jsonData.viewers);
// }, function(err) {
//     console.log(err);
// });

function init() {
    setTimeout(function(){
        // Returns data object with response and body
        var monitorChatters = api.getChatters("justintime4tea253");
        // var promMonChatters = monitorChatters();

        Promise.all([monitorChatters]).then(function(data){

            greetNewChatters(JSON.parse(data[0].body).chatters);

            init();
        }, function(err){
            console.error(err);
        });

    }, 3000);
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