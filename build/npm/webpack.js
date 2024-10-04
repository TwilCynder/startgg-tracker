#! node

import webpack from "webpack"

let compiler = webpack({
    entry: "./entry.js",
    output: {
        filename: "bundle.js",
        library: {
            type: "module"
        },
    },
    mode: process.argv[2] ? "none" : "production",
    experiments: {
        outputModule: true
    }
});

console.log("Running webpack bundler")
try {
    await new Promise((resolve, reject) => {
        compiler.run((err, result) => {
            if (result.hasErrors()){
                reject("Error(s) in compilation : " + err + "\nResult : \n" + result.toString())
            }
            resolve();
        })
    })
    console.log("Bundled npm packages")
} catch (err){
    console.error("Could not compile npm packages : ")
    console.error(err);
}

