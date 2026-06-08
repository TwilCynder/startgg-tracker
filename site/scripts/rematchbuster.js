import { RateLimitingSGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches, getSets, getStreamedMatchesForPlayer, getStreamedSetFilterFunction } from "./lib/check_rematches.js";
import { show, hide, toggleClass } from "./lib/DOMUtil.js";
import { checkLogin } from "./lib/loginCheck.js";
import { deep_get } from "./lib/util.js";
import { handleSelectedRadioButton, init, Request } from "./rematchbuster-common.js";

//------ Functions --------

/** @type {Request} */
let currentRequest = null;
let currentData = null;

//-- UI Update functions
/**
 * @param {Request} request 
 */
function updateUIFromRequest(request){
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
    document.querySelector("#invert-mode").checked = request.invert
    document.querySelector("#event-count-mode");
    document.querySelector("#stream-mode").value = request.streamMode ?? "none";
    if (request.streamMode.includes("stream")){
        show(".stream-name-container");
        document.querySelector("#stream-name").value = request.streamName;
    } else {
        hide(".stream-name-container");
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

function makeIgnoredEventsHTML(list){
    if (list.length < 1) return "";
    let html = "Ignored Events";
    list.forEach((slug, i) =>{
        html += `<div data-slug="${slug}" data-i=${i}>${slug}<span class="cross-button" onclick="onCrossClicked2(this)" title="Remove this event from ignored events">❌</span></div>`
    })
    return html;
}

function makeStreamHTML(match){
    return `<br > <a class="stream ninja-link" href="https://twitch.tv/${match.stream.streamName}" target="_blank">streamed on <span class="stream-name">${match.stream.streamName}</span></a>`
}

function makePairsListHTML(result, stream){
    return makeResultHTML(result, (entry) => `${entry.players[0].name} vs ${entry.players[1].name}`, stream);
}

function makePlayersListHTML(result, stream){
    console.log(result);
    return makeResultHTML(result, (entry) => entry.player.name, stream);
}

/**
 * @template T
 * @param {T[]} result 
 * @
 * @param {(entry: T) => string} entryNameFunction 
 * @param {boolean} stream 
 * @returns 
 */
function makeResultHTML(result, entryNameFunction, stream){
    let html = ""
    for (let entry of result){
        const n = entry.n ?? entry.matches.length;
        const nText = entry.nText ?? n + " matches";
        if (n < 1){
            html += `
                <div class = "entry-title">${entryNameFunction(entry)} - ${nText}</div>
            `
        } else {
            html += `
                <div class = "entry-title" onclick="entryTitleOnClick(this)">
                    <span class ="dropdown-button-sideways">►</span>${entryNameFunction(entry)} - ${nText}    
                </div>
                <div class ="entry-details">
                ${
                    entry.matches.map(match => {
                        const date = new Date(match.completedAt * 1000);
                        return `
                            <div data-event-slug="${match.event.slug}"><a target="_blank" class = "ninja-link" title="Event : ${match.event.slug}" href = "https://start.gg/${match.event.slug}/set/${match.id}">${match.event.tournament.name} - ${match.event.name} (${date.getFullYear()}/${date.getMonth()}/${date.getDate()}) - ${match.fullRoundText} </a><span class="cross-button" onclick="onCrossClicked(this)" title="Remove this event from everyone's results">❌</span> ${stream && match.stream ? makeStreamHTML(match) : ""}</div><br>
                        `
                    }

                    ).join("")
                }
                </div>
            `
        }
        
    }
    return html;
}

//-- Result computing

/**
 * @param {Request} request 
 * @returns 
 */
function getFiltersArray(request){
    let filtersString = request.eventFilters;
    let res = filtersString.split(/,/g).concat(request.ignoredEvents);
    return res.map(filter => filter.trim()).filter(filter => !!filter);
}

function sortResultListDescending(result){
    return result.sort((a, b) => b.n - a.n).filter(entry => entry.n > 0);
}

function sortResultListAscending(result){
    return result.sort((a, b) => a.n - b.n);
}

function updateNBasic(entry){
    entry.n = entry.matches.length;
    entry.nText = entry.n + " matches"
}

function updateNEventsCount(entry){
    let seenEvents = {};
    entry.n = 0;
    for (const set of entry.matches){
        if (!set.event) continue;
        if (!seenEvents[set.event.slug]){
            seenEvents[set.event.slug] = true;
            entry.n++;
        }
    }
    entry.nText = entry.n + " events"
}

function sortResultList(result, request){
    result.forEach(request.countEvents ? updateNEventsCount : updateNBasic);
    return request.invert ? sortResultListAscending(result) : sortResultListDescending(result);
}

const resultFunctions = {
    "none": (players, request) => {
        let result = get_rematches(players, getFiltersArray(request));
        result = sortResultList(result, request);
        //result = applyFilters(result, request);
        return makePairsListHTML(result, false);
    },
    "stream-pairs": (players, request) => {
        let result = get_rematches(players, getFiltersArray(request));

        const streamFilterFunction = getStreamedSetFilterFunction(request.streamName);
        for (const entry of result){
            entry.matches = entry.matches ? 
                entry.matches.filter(streamFilterFunction) : 
                [];
        }

        result = sortResultList(result, request);
        
        let html = request.streamName ?
            `<h3 class="result-title">Sets streamed on ${request.streamName} only</h3>` + makePairsListHTML(result, false) :
            '<h3 class="result-title">Steamed sets only</h3>' + makePairsListHTML(result, true)

        return html;
    },
    "stream-individual": (players, request) => {
        let result = getStreamedMatchesForPlayer(players, getFiltersArray(request), request.streamName);
        result = sortResultList(result, request);
        
        let html = request.streamName ? 
            `<h3 class="result-title">Stream appearances on ${request.streamName}</h3>` + makePlayersListHTML(result, false) : 
            '<h3 class="result-title">Stream appearances</h3>' + makePlayersListHTML(result, true);

        return html;
    }
}

function updateResultHTML(players, request){
    console.log(request)
    const mode = request.streamMode ?? "none";
    const f = resultFunctions[mode];
    if (!f){
        console.error("Invalid stream mode :", mode);
        f = resultFunctions.none;
    }
    let html = f(players, request);

    document.querySelector(".result").innerHTML = html;
    showResult();
}

//--

/**
 * @param {Request} request
 */
async function loadFromRequest(client, request, limiter){
    let date = request.getDate();
    showLoader();

    console.log("Loading ...");
    try {
        
        console.log("Request : ", request);

        let progressElt = document.getElementById("loading-progress");
        let entrantsCount = "?";

        let errors = [];

        let players = await getSets(client, request.slug, Math.floor(date.getTime() / 1000), limiter, 
            (currentCount) => {
                console.log("Loaded", currentCount);
                progressElt.innerHTML = `(${currentCount}/${entrantsCount})`
            },
            (totalCount) => {
                entrantsCount = totalCount;
                progressElt.innerHTML = `(0/${totalCount})`;
            },
            (error) => {
                errors.push(error.getConsoleMessage());
            }
        );
        if (errors.length > 1){
            console.warn("Errors :")
            for (const err of errors){
                console.warn("-", err);
            }
        }

        
        currentData = players;
        currentRequest = request;

        updateResultHTML(players, request);
    } catch (err){
        console.error(err);
        alert("There was a problem fetching data from the start.gg API. Please check that the event URL is correct, and try again")
        hide(".loading-container");
    }

}

//-- Request and state functions

/**
 * Use when only non-fetch-inducing options changed (filters, stream mode, etc)
 * @param {Request} request 
 */
function refreshResult(request){
    updateResultHTML(currentData, request);
    window.history.pushState(request, "", window.location.pathname + request.getURL());
    currentRequest = request;
}

function onPopstate(ev){
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

    updateUIFromRequest(request);
    updateResultHTML(currentData, request);
}

function goCallback(request){
    let isSame = currentRequest ? request.compare(currentRequest) : false;

    if (isSame === true){
        return;
    } else if (isSame === 1){
        refreshResult(request);
        currentRequest = request;
    } else {
        window.location.href = window.location.pathname + request.getURL();
    }

}

//-- UI callbacks

/**
 * @param {HTMLElement} element 
 */
function entryTitleOnClick(element){
    toggleClass(element, "open");
    let elt = element.nextElementSibling
    //toggleClass(elt, "open");
    if (elt.classList.contains("open")){
        elt.style.height = "0px";
        //elt.style.width = "0px"
        elt.classList.remove("open")
    } else {
        elt.style.height = elt.scrollHeight + "px";
        //elt.style.width = elt.scrollWidth + "px"
        elt.classList.add("open");
    }
}
window.entryTitleOnClick = entryTitleOnClick;

function updateIgnoredEventsHTML(list){
    document.querySelector(".ignored-events").innerHTML = makeIgnoredEventsHTML(list);
}

/**
 * @param {HTMLElement} element 
 */
function redCrossOnClick(element){
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
    updateIgnoredEventsHTML(window.currentIgnoredEvents);
    currentRequest.ignoredEvents = window.currentIgnoredEvents
    refreshResult(currentRequest);
}
window.onCrossClicked2 = onCrossClicked2; //HORRIBLE NAMING PLEASE DIE

function onStreamModeChanged(event){
    const newValue = event.target.value;
    if (!resultFunctions[newValue]){
        console.error("New value for stream mode selector is invalid");
        return;
    }
    currentRequest.streamMode = newValue;

    refreshResult(currentRequest);
}

function onInvertModeChanged(event){
    currentRequest.invert = event.target.checked;
    refreshResult(currentRequest);
}

function onEventCountModeChanged(event){
    currentRequest.countEvents = event.target.checked;
    refreshResult(currentRequest);
}

//------ SCRIPT -----

//-- Page init


document.querySelector("#stream-mode").addEventListener("change", onStreamModeChanged);
document.querySelector("#invert-mode").addEventListener("change", onInvertModeChanged);
document.querySelector("#event-count-mode").addEventListener("change", onEventCountModeChanged);

window.addEventListener("popstate", onPopstate);

init(goCallback)

//-- Various init

let token = await checkLogin();

console.log(token);

let client = new RateLimitingSGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

//-- Starting query
let request = Request.fromURL(window.location.search);

if (request){
    updateUIFromRequest(request);
    window.currentIgnoredEvents = request.ignoredEvents ?? [];
    updateIgnoredEventsHTML(window.currentIgnoredEvents);
    console.log("Request :", request);
    await loadFromRequest(client, request, limiter);
} else {
    document.querySelector(".time-inputs-container #duration-mode").checked = true;
    handleRadioButtons("duration-mode");
}



//-- Graveyard

/*let token = localStorage.getItem("token");
if (!token){
    console.error("No token. Going back to homepage");
    window.location.href = "/index.html"
}*/

/*
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
*/

/*
function filterResult(result, filters = []){
    result = copyResult(result);
    for (let entry of result){
        entry.matches = entry.matches.filter(match => {
            let slug = deep_get(match, "event.slug");
            if (!slug) console.warn("No event slug for match", match);
            for (let filter of filters){
                if (slug.includes(filter)){
                    console.log("Event removed for containing the filter", filter);
                    return false;        
                }
            }
            return true;
        })
    }
    result = sortResultList();
    return result;
}*/


/*
function applyFilters(result, request){
    return filterResult(result, getFiltersArray(request));
}*/