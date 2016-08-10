# Open Twitch Bot
A Twitch bot built using Node.js

## Setup
Run 'npm install' within the project directory to install all required node modules

Copy config.js.example to config.js and fill in the details using your Twitch information.
Don't worry config.js will not be committed, it is included in the .gitignore file.

## Running the bot
Run 'node app.js' from within the project directory

## Notes
Still a work in progress.

- Features
  - Keeps a running list of all followers
  - Welcomes new followers
    - Waits until the new follower is in the chat to welcome them
