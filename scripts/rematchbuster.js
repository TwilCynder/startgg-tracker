import { RateLimitingSGGHelperClient, SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";
import { Request } from "./rematchbuster-common.js";

//------ LIB --------

/**
 * @param {Request} request 
 */
async function loadFromRequest(client, request, limiter){
    let date = request.getDate();
    console.log(date.getTime());
    return await get_rematches(client, request.slug, Math.floor(date.getTime() / 1000), limiter);
}


//------ SCRIPT -----


let token = localStorage.getItem("token");
if (!token){
    console.error("No token. Going back to homepage");
    window.location.href = "./index.html"
}

let client = new RateLimitingSGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

let request = Request.fromURL(window.location.search);
console.log(request);
if (request){
    console.log(await loadFromRequest(client, request, limiter));
}



/*
let res = [] //await get_rematches(client, "tournament/tls-mad-ness-33/event/1v1-ultimate", 1722513915, limiter);
for (let rematch of res){
    console.log(rematch.players[0].name, rematch.players[1].name, rematch.matches.length)
    document.write(`${rematch.players[0].name} vs ${rematch.players[1].name} - ${rematch.matches.length} times <br>`)
    for (let set of rematch.matches){
        document.write("- - - - " + set.event.tournament.name + " - " + set.event.name + "<br>");
    }
}
//1722513915
//2863f841
*/