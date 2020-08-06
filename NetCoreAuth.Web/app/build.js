'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
  });

// Get command line args
// The first 2 are: node location, script location. So they are useless to this script
const commandLineArgs = process.argv.slice(2);
var scriptVerb = commandLineArgs[0] || "build";

// This is the script name that Create React App uses
var scriptNameForCRA = "build";

// The whole point for this script, add date to the builder
var moment = require('moment');
process.env.REACT_APP_BUILD_DATE = (moment()).toISOString();

// Make the frontend ssl qualified
process.env.HTTPS = true;

// Set build specific args
switch (scriptVerb) {
    case "start":
        // Breaks things, so turn it off in dev
        process.env.HTTPS = false;
        scriptNameForCRA = "start"
        process.env.REACT_APP_ENVIRONMENT = "development";
        break;
    case "build":
        scriptNameForCRA = "build"
        process.env.REACT_APP_ENVIRONMENT = "development";
        break;
    case "build-testqci":
        scriptNameForCRA = "build"
        process.env.REACT_APP_ENVIRONMENT = "testqci";
        break;
    case "build-test":
        scriptNameForCRA = "build"
        process.env.REACT_APP_ENVIRONMENT = "test";
        break;
    case "build-prod":
        scriptNameForCRA = "build"
        process.env.REACT_APP_ENVIRONMENT = "production";
        break;
    default:
        throw new Error("Unknown build type specified. Please edit the build.js file.")
}

console.log("   ### Script Helper 1.4 ###");
console.log("");
console.log(`Build created: ${process.env.REACT_APP_BUILD_DATE}`);
console.log(`Running the build for "${process.env.REACT_APP_ENVIRONMENT}"`);

console.log("");
console.log(`Build Type used "${scriptVerb}"`);
console.log(`CRA script used "${scriptNameForCRA}"`);
console.log("");
console.log("________________________________________________________________________");
console.log("");
console.log("");

// Pulled from here: https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
// child_process is provided by a decent number of frameworks, such as create-react-app, which is where this one 'should' be from
// If you are NOT using create react app, this is where it will blow up. You must import child_process and change the 'exec()' command to suit your build process
const { exec } = require('child_process');
const child = exec(`react-scripts ${scriptNameForCRA}`);
var buildCount = 0;

// This streams the output of the script to the console
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
    // TrimEnd if it exists. If it doesn't, UPDATE YOUR NODE VERSION
    // The trimEnd removes the trailing newLines
    if (chunk.startsWith != null && chunk.startsWith("Compiled success")) {
        let text = chunk.trimEnd != null ? chunk.trimEnd() : chunk;
        buildCount++;
        console.log(text, "Build Count: " + buildCount.toString() + "\n");
    } else {
        // console.log(text);
        process.stdout.write(chunk);
    }
});

// If the script closes, output a friendly message
child.on('close', (code) => {
    console.log('Process has exited. Thank you for choosing Script Helper 1.4!');
    process.exit(code);
});