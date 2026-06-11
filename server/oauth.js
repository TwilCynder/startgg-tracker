import express from "express"
import { initStartggOauth, logOut } from "startgg-oauth-helper";

const SCOPES = "user.identity";

/**
 * 
 * @param {string[]} names 
 */
function checkEnvironmentVariables(...names){
    for (const name of names){
        if (!process.env[name]){
            throw `Missing Oauth environement variable ${name}`
        }
    }
}

/**
 * Init the oauth endpoints. Requires the session middleware.
 * @param {ReturnType<express>} app 
 */
export async function initOauth(app){
    checkEnvironmentVariables("SGG_OAUTH_CLIENT_ID", "SGG_OAUTH_REDIRECT_URI");

    const callbackEndpoint = process.env.PRODUCTION_MODE ? "/startgg-oauth-callback" : "/callback";

    initStartggOauth(app, process.env.SGG_OAUTH_CLIENT_ID, process.env.SGG_OAUTH_CLIENT_SECRET, process.env.SGG_OAUTH_REDIRECT_URI, SCOPES, {
        authRedirect: "/startgg-oauth",
        callback: callbackEndpoint,
        token: "/token"
    }, {
        tokenEndpoint: true,
        state: (req) => req.query.source,
        finalCallback: (req, res) => {
            let source_page = req.query.state;
            console.log(source_page)
            if (source_page && source_page != "undefined"){
                source_page = decodeURIComponent(source_page);
                console.log("Target page :", source_page);
                res.redirect(source_page);
            } else {
                res.redirect("/");
            }
        }
    })

    app.post("/logout", async (req, res) => {
        logOut(req);
        res.sendStatus(200);
    })
}