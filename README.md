# Open Twitch Bot
A Twitch bot built using Node.js

## Setup
Run 'npm install' within the project directory to install all required node modules

Create a file in the root directory called personal.js using the content below but replacing channel, username and token with your information:

```
'use strict';

function CHANNEL() {
    return "#channel";
}

function USERNAME() {
    return "username";
}

function OATH() {
    return "oauth:TOKEN";
}

module.exports = {
    CHANNEL,
    USERNAME,
    OATH
};
```
