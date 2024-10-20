import { RateLimitingSGGHelperClient, SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";
import { show, hide } from "./lib/DOMUtil.js";
import { handleSelectedRadioButton, Request } from "./rematchbuster-common.js";

//------ LIB --------

/**
 * @param {Request} request 
 */
async function loadFromRequest(client, request, limiter){
    let date = request.getDate();
    console.log(date.getTime());
    showLoader();
    let res = await get_rematches(client, request.slug, Math.floor(date.getTime() / 1000), limiter);
    showResult();
}

function showLoader(){
    show(".loading-container");
    hide(".result");
}

function showResult(){
    hide(".loading-container");
    show(".result");
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
    document.querySelector("#event").value = request.slug;
    if (request.date){
        document.querySelector("#date-mode").checked = true;
        document.querySelector(".dateInput.timeInput").value = request.date;
    } else {
        document.querySelector("#duration-mode").checked = true;
        document.querySelector(".weeksInput.timeInput").value = request.duration;
    }
    handleSelectedRadioButton();
    console.log(await loadFromRequest(client, request, limiter));
} else {
    document.querySelector(".time-inputs-container #duration-mode").checked = true;
    handleRadioButtons("duration-mode");
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