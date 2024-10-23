import { RateLimitingSGGHelperClient, SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";
import { show, hide } from "./lib/DOMUtil.js";
import { handleSelectedRadioButton, init, Request } from "./rematchbuster-common.js";

//------ LIB --------

/**
 * @param {Request} request 
 */
async function loadFromRequest(client, request, limiter){
    let date = request.getDate();
    console.log(date.getTime());
    showLoader();
    try {
        console.log(request.eventFilters);
        let res = await get_rematches(client, request.slug, Math.floor(date.getTime() / 1000), limiter);
        
        makeResultHTML(res);
        showResult();
    } catch (err){
        console.error(err);
        alert("There was a problem fetching data from the start.gg API. Please check that the event URL is correct, and try again")
        hide(".loading-container");
    }

}

function updateFormFromRequest(request){
    document.querySelector("#event").value = request.slug;
    if (request.date){
        document.querySelector("#date-mode").checked = true;
        document.querySelector(".dateInput.timeInput").value = request.date;
    } else {
        document.querySelector("#duration-mode").checked = true;
        document.querySelector(".weeksInput.timeInput").value = request.duration;
    }
    handleSelectedRadioButton();
}

function showLoader(){
    show(".loading-container");
    hide(".result");
}

function showResult(){
    hide(".loading-container");
    show(".result");
}

function makeResultHTML(result){
    let html = ""
    for (let entry of result){
        html += `
            <div class = "entry">
                ${entry.players[0].name} vs ${entry.players[1].name} - ${entry.matches.length} matches    
            </div>
            <br>
        `
    }
    document.querySelector(".result").innerHTML = html;
}

//------ SCRIPT -----

//-- Various init
let token = localStorage.getItem("token");
if (!token){
    console.error("No token. Going back to homepage");
    window.location.href = "./index.html"
}

let client = new RateLimitingSGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

//-- Page init
init(request => {
    let url = request.getURL();
    console.log(url, window.location.search);
    if (url != window.location.search){
        console.log(window.location.pathname + url)
        //window.history.pushState(request, "", window.location.pathname + url);
        window.location.href = window.location.pathname + url;
    }
    loadFromRequest(client, request, limiter);

})

/*
window.addEventListener("popstate", (ev) => {
    let state = ev.state;
    let request;
    if (!state){
        try {
            request = Request.fromURL(window.location.search)
        } catch (err) {
            console.error("Tried to make request from stateless popstate event, but failed :", err);
        }
    } else {
        request = state;
    }

    updateFormFromRequest(request);
})
*/

//-- Starting query
let request = Request.fromURL(window.location.search);

if (request){
    updateFormFromRequest(request);
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