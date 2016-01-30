'use strict';

/* jslint node: true */
/* jshint -W117, -W104 */

var fs = require('fs');

function writeToFile(file, data) {
    fs.writeFile(file, JSON.stringify(data) + '\n', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Finished writing data to:", file);
        }
    });
}

function readFile(file) {
    return new Promise(function(resolve, reject){
        fs.readFile(file, function(err, data){
            if (err) {
                reject(Error(err));
            } else {
                resolve(String(data));
            }
        });
    });
}

module.exports = {
    writeToFile,
    readFile
};