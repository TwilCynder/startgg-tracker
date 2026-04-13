import { RateLimitingSGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches, getSets, getStreamedMatchesForPlayer } from "./lib/check_rematches.js";
import { show, hide, toggleClass } from "./lib/DOMUtil.js";
import { deep_get } from "./lib/util.js";
import { handleSelectedRadioButton, init, Request } from "./rematchbuster-common.js";

//------ LIB --------

/** @type {Request} */
let currentRequest = null;
let currentData = null;


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
    document.querySelector(".stream-mode").value = request.streamMode ?? "none";
    document.querySelector(".invert-mode").checked = request.invert

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

function sortResultList(result, request){
    return request.invert ? sortResultListAscending(result) : sortResultListDescending(result);
}

function sortResultListDescending(result){
    return result.sort((a, b) => b.matches.length - a.matches.length).filter(entry => entry.matches.length > 0);
}

function sortResultListAscending(result){
    return result.sort((a, b) => a.matches.length - b.matches.length);
}

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
}


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

function applyFilters(result, request){
    return filterResult(result, getFiltersArray(request));
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
 * @param {(entry: T) => string} entryNameFunction 
 * @param {boolean} stream 
 * @returns 
 */
function makeResultHTML(result, entryNameFunction, stream){
    let html = ""
    for (let entry of result){
        const n = result.n ?? entry.matches.length;
        html += `
            <div class = "entry-title" onclick="entryTitleOnClick(this)">
                <span class ="dropdown-button-sideways">►</span>${entryNameFunction(entry)} - ${n} matches    
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
    return html;
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
        //result = applyFilters(result, request)
        for (const entry of result){
            entry.matches = entry.matches ? entry.matches.filter(set => !!set.stream) : [];
        }
        result = sortResultList(result, request);
        let html = '<h3 class="result-title">Steamed sets only</h3>'
        html += makePairsListHTML(result, true);
        return html;
    },
    "stream-individual": (players, request) => {
        let result = getStreamedMatchesForPlayer(players, getFiltersArray(request));
        result = sortResultList(result, request);
        let html = '<h3 class="result-title">Stream appearances</h3>'
        html += makePlayersListHTML(result, false);
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

/**
 * Use when only the filters changed
 * @param {Request} request 
 */
function refreshResult(request){
    updateResultHTML(currentData, request);
    window.history.pushState(request, "", window.location.pathname + request.getURL());
    currentRequest = request;
}

//------ SCRIPT -----

//-- Various init

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

    updateUIFromRequest(request);
    updateResultHTML(currentData, request);
})

let token = localStorage.getItem("token");
if (!token){
    console.error("No token. Going back to homepage");
    window.location.href = "./index.html"
}

let client = new RateLimitingSGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

//-- Page init

document.querySelector(".stream-mode").addEventListener("change", onStreamModeChanged)
document.querySelector(".invert-mode").addEventListener("change", onInvertModeChanged)

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