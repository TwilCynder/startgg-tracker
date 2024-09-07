#! node

import webpack from "webpack"

let compiler = webpack({
    entry: "./entry.js",
    output: {
        filename: "bundle.js",
        library: {
            type: "module"
        }
    },
    mode: process.argv[2] ? "none" : "production",
    experiments: {
        outputModule: true
    }
});

console.log("Running webpack bundler")
compiler.run();
console.log("Bundled npm packages")