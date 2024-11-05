import { RateLimitingSGGHelperClient, SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";
import { show, hide, toggleClass } from "./lib/DOMUtil.js";
import { deep_get } from "./lib/util.js";
import { handleSelectedRadioButton, init, Request } from "./rematchbuster-common.js";

//------ LIB --------

let currentData = null;
let currentRequest = null;

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
        currentData = res;
        currentRequest = request;
        res = filterResult(res, getFiltersArray(request));
        console.log(res);
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
    if (!!request.eventFilters){
        document.querySelector(".input.event-filters").value = request.eventFilters
    }
}

function showLoader(){
    show(".loading-container");
    hide(".result");
}

function showResult(){
    hide(".loading-container");
    show(".result");
}

function copyResult(result){
    let out = [];
    for (let entry of result){
        out.push({
            matches: Array.from(entry.matches),
            players: entry.players
        })
    }
    return out;
}

/**
 * @param {Request} request 
 * @returns 
 */
function getFiltersArray(request){
    let filtersString = request.eventFilters;
    let res = filtersString.split(/,/g).concat(request.ignoredEvents);
    return res.map(filter => filter.trim()).filter(filter => !!filter);
}

function filterResult(result, filters = []){
    result = copyResult(result);
    console.log(filters);
    for (let entry of result){
        entry.matches = entry.matches.filter(match => {
            let slug = deep_get(match, "event.slug");
            if (!slug) console.warn("No event slug for match", match);
            console.log(slug, filters);
            for (let filter of filters){
                if (slug.includes(filter)){
                    console.log("Event removed for containing the filter", filter);
                    return false;        
                }
            }
            return true;
        })
    }
    return result.sort((a, b) => b.matches.length - a.matches.length).filter(entry => entry.matches.length > 0);
}

function makeResultHTML(result){
    let html = ""
    for (let entry of result){
        html += `
            <div class = "entry-title" onclick="entryTitleOnClick(this)">
                <span class ="dropdown-button-sideways">►</span>${entry.players[0].name} vs ${entry.players[1].name} - ${entry.matches.length} matches    
            </div>
            <div class ="entry-details">
            ${
                entry.matches.map(match => {
                    const date = new Date(match.completedAt * 1000);
                    return `
                        <div data-event-slug="${match.event.slug}"><a target="_blank" class = "ninja-link" title="Event : ${match.event.slug}" href = "https://start.gg/${match.event.slug}">${match.event.tournament.name} - ${match.event.name} (${date.getFullYear()}/${date.getMonth()}/${date.getDate()}) - ${match.fullRoundText} </a><span class="cross-button" onclick="onCrossClicked(this)" title="Remove this event from everyone's results">❌</span></div><br>
                    `
                }

                ).join("")  
            }
            </div>
        `
    }
    document.querySelector(".result").innerHTML = html;
}

function makeIgnoredEventsHTML(list){
    if (list.length < 1) return "";
    let html = "Ignored Events";
    list.forEach((slug, i) =>{
        html += `<div data-slug="${slug}" data-i=${i}>${slug}<span class="cross-button" onclick="onCrossClicked2(this)" title="Remove this event from ignored events">❌</span></div>`
    })
    return html;
}

function updateIgnoredEventsHTML(list){
    document.querySelector(".ignored-events").innerHTML = makeIgnoredEventsHTML(list);
}

/**
 * @param {HTMLElement} element 
 */
function entryTitleOnClick(element){
    toggleClass(element, "open");
    toggleClass(element.nextElementSibling, "open");
}
window.entryTitleOnClick = entryTitleOnClick;

/**
 * @param {HTMLElement} element 
 */
function redCrossOnClick(element){
    console.log(element.parentElement.dataset.eventSlug);
    let slug = element.parentElement.dataset.eventSlug ?? "";
    //let elt = document.querySelector(".input.event-filters");
    //elt.value += (elt.value.trim() ? "," : "") + slug;
    if (slug){
        window.currentIgnoredEvents.push(slug);
        updateIgnoredEventsHTML(window.currentIgnoredEvents);
        currentRequest.ignoredEvents = window.currentIgnoredEvents
        refreshResult(currentRequest);
    }
}
window.onCrossClicked = redCrossOnClick;

/**
 * @param {HTMLElement} element 
 */
function onCrossClicked2(element){
    let index = Number.parseInt(element.parentElement.dataset.i);
    window.currentIgnoredEvents.splice(index, 1);
    console.log(window.currentIgnoredEvents);
    updateIgnoredEventsHTML(window.currentIgnoredEvents);
    currentRequest.ignoredEvents = window.currentIgnoredEvents
    refreshResult(currentRequest);
}
window.onCrossClicked2 = onCrossClicked2; //HORRIBLE NAMING PLEASE DIE

/**
 * Use when only the filters changed
 * @param {Request} request 
 */
function refreshResult(request){
    console.log(currentData);
    let res = filterResult(currentData, getFiltersArray(request));
    console.log(res);
    makeResultHTML(res);
    showResult();
    window.history.pushState(request, "", window.location.pathname + request.getURL());
    currentRequest = request;
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
    let isSame = currentRequest ? request.compare(currentRequest) : false;

    if (isSame === true){
        return;
    } else if (isSame === 1){
        refreshResult(request);
        currentRequest = request;
    } else {
        window.location.href = window.location.pathname + request.getURL();
    }

    /*
    let url = request.getURL();
    console.log(url, window.location.search);
    if (url != window.location.search){
        console.log(window.location.pathname + url)
        //window.history.pushState(request, "", window.location.pathname + url);
        window.location.href = window.location.pathname + url;
    } else {

    }
    */

})

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
    let res = filterResult(currentData, getFiltersArray(request));
    console.log(res);
    makeResultHTML(res);
    showResult();
})


//-- Starting query
let request = Request.fromURL(window.location.search);

window.currentIgnoredEvents = request.ignoredEvents ?? [];
updateIgnoredEventsHTML(window.currentIgnoredEvents);

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