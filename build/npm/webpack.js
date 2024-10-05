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
    mode: "none",
    experiments: {
        outputModule: true
    }
});

console.log("Running webpack bundler")
compiler.run();
console.log("Bundled npm packages")