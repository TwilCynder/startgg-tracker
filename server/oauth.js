import express from "express"

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

    app.get("/oauth", (req, res) => {
        console.log("Redirecting to startgg auth page")
        const target_page = req.query.page;
        res.redirect(`https://start.gg/oauth/authorize?client_id=${process.env.SGG_OAUTH_CLIENT_ID}&redirect_uri=${process.env.SGG_OAUTH_REDIRECT_URI}&response_type=code&scope=${SCOPES}${target_page ? '&state='+target_page : ''}`);
    });

    app.get("/callback", async (req, res) => {
        console.log("Redirected to the OAuth callback with query", req.query);

        const code = req.query.code;
        if (!code){
            console.error("No code ?");
            res.send("Start.gg didn't send a code. idk what to tell you man");
        } 

        const responseBody = await fetch("https://api.start.gg/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                client_id: process.env.SGG_OAUTH_CLIENT_ID,
                client_secret: process.env.SGG_OAUTH_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.SGG_OAUTH_REDIRECT_URI,
                scope: SCOPES,
            })
        }).then(response => response.json());

        console.log("Received response from startgg token endpoint", responseBody);

        req.session.startgg = {
            access_token: responseBody.access_token,
            refresh_token: responseBody.refresh_token,
            expires_in: responseBody.expires_in
        }

        let target_page = req.query.state;
        if (target_page && target_page != "undefined"){
            target_page = decodeURIComponent(target_page);
            console.log("Target page :", target_page);
            res.redirect(target_page);
        } else {
            res.redirect("/");
        }
    });

    app.get('/token', async (req, res) => {
        if (req.session.startgg){
            if (Date.now() > req.session.startgg.expires_in){
                console.log("Refreshing")
                const refresh_token = req.session.startgg.refresh_token;
                if (!refresh_token){
                    return res.status(401).json({err: "Not authenticated"})
                }   

                const responseBody = await fetch("https://api.start.gg/oauth/refresh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        client_id: process.env.SGG_OAUTH_CLIENT_ID,
                        client_secret: process.env.SGG_OAUTH_CLIENT_SECRET,
                        refresh_token,
                        grant_type: "refresh_token",
                        redirect_uri: process.env.REDIRECT_URI,
                        scope: SCOPES
                    })
                }).then(response => response.json());

                req.session.startgg = {
                    access_token: responseBody.access_token,
                    refresh_token: responseBody.refresh_token,
                    expires_in: responseBody.expires_in
                }

                console.log("New token :", responseBody.access_token);
            }

            return res.status(200).json({token: req.session.startgg.access_token});
        } else {
            return res.status(401).json({err: "Not authenticated"});
        }
    });

    app.post("/logout", async (req, res) => {
        req.session.startgg = null;
        res.sendStatus(200);
    })
}