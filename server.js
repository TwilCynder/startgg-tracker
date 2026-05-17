import express from "express"

// Defaults
const port = process.env.PORT ?? 8090;

const server = express();

server.use(express.static("site"));

server.listen(port);
console.log("Server started, listening on", port);