import express from "express"
import session from "express-session";
import { initOauth } from "./server/oauth.js";

// Defaults
const port = process.env.PORT ?? 8090;

const server = express();
server.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        httpOnly: true,
    },
    resave: false, 
}))
server.use(express.static("site"));

initOauth(server);

server.listen(port);
console.log("Server started, listening on", port);