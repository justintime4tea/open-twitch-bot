# Open Twitch Bot
A Twitch bot built using Node.js

## Setup
Run 'npm install' within the project directory to install all required node modules

Create a file in the root directory called personal.js using the content below but replacing channels (multiple channels supported), username and token with your information:

```
'use strict';

function CHANNELS() {
    return ["channel1", "channel2"];
}

function USERNAME() {
    return "username";
}

function OAUTH() {
    return "oauth:TOKEN";
}

module.exports = {
    CHANNELS,
    USERNAME,
    OAUTH
};
```

## Running the bot
Run 'node app.js' from within the project directory

## Notes
Still a work in progress and currently quite useless.