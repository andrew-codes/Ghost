'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var fs = require('fs');
var handlebars = require('handlebars');
var exec = require('child_process').exec;

var config = args.config || null;

gulp.task('default', [], function () {
    if (config === null) {
        throw new Error('Invalid argument: no config supplied via the command line');
    }
    fs.readFile('./config.hbs', 'utf8', function (readError, data) {
        if (readError) {
            throw readError;
        }
        var template = handlebars.compile(data);
        var configContents = template(config);
        fs.writeFile('./config.js', configContents, function (writeError) {
            if (writeError) {
                throw writeError;
            }
        });
    });
});

function runCommand(cmd) {
    exec(cmd, function (error, stdout, stderror) {
        console.log("stdout: " + stdout);
        if (error != null) {
            console.log('exec error: ' + error);
            throw error;
        }
    });
}
function getThemeDirectories() {
    var themeDirectories = [];
    var root = './content/themes';
    fs.readdirSync(root).forEach(function (item) {
        if (item === '.') {
            return;
        }
        var themePath = root + '/' + item;
        var stats = fs.statSync(themePath);
        if (stats.isDirectory()) {
            themeDirectories.push(themePath);
        }
    });
    return themeDirectories;
}
gulp.task('themes-build', [], function () {
    var themeDirectories = getThemeDirectories();
    themeDirectories.forEach(function (dir) {
        if (fs.existsSync(dir + '/package.json')) {
            runCommand('cd ' + dir + '&& npm install && npm run build');
        }
    });
});
