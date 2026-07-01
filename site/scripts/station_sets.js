
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { processEventSlug } from "./lib/util.js";
import { getStationSetsFactory } from "./lib/api/getStationSets.js";
import { initLayout, makeSetHTML, resetContent } from "./lib/sets_display.js";
import { presentError } from "./lib/error.js";
import { FitText } from "./lib/DOMUtil.js";
import { fitPlayerNames } from "./lib/tracker_pages.js";
import { SwitchElement } from "./lib/switchElement.js";
import { checkLogin } from "./lib/loginCheck.js";
import { LoadingContentManager } from "./lib/contentSwitcher.js";

const contentManager = new LoadingContentManager;

try {

const getStationSets = await getStationSetsFactory();

let content = {
    stations: null,
    streams: null
}
let loaded = false;

// -------- Content update functions

const switchElement = new SwitchElement(document.querySelector(".switch-container"));

function makeSetLists(lists, className, titlePrefix = ""){
    let single = Object.keys(lists).length < 2;

    let html = ""; let index = 0; let list_index = 0;
    for (const list_id in lists){
        const station = lists[list_id];
        let sets_html = "";
        for (const set of station){
            sets_html += makeSetHTML(set, index++);
        }
        html += `<div class = "setlist-container ${className} ${single ? "setlist-wrap" : ""}"><div class = "t${list_index++} setlist-title ${className}-title"><div class = "text">${titlePrefix}${list_id}</div></div><div class = "setlist">${sets_html}</div></div>`
    }
    return {html, count: index, listsCount: list_index};
}

function fitTitles(count){
    for (let i = 0; i < count; i++){
        FitText($(`.t${i}`));
    } 
}

function displayList(list){
    resetContent();
    if (list && list.count){
        $(".content").html(list.html);
        fitPlayerNames(list.count);
        console.log($(".t0 .text")[0].scrollWidth)
        fitTitles(list.listsCount);
    } else {
        $(".content").html('<div class = "no-matches">No matches</div>'); //TODO 
    }
}

function updateContent(streams){
    if (!loaded) return;
    contentManager.showContent();
    if (streams){
        displayList(content.streams);
    } else {
        displayList(content.stations);
    }
}

function updateContentCheck(){
    updateContent(switchElement.isChecked());
}

async function loadStationSets(client, slug, config){

    let res = await getStationSets(slug, client);

    console.log(res);

    content.stations = makeSetLists(res.stations, "station", "Station ");
    content.streams = makeSetLists(res.streams, "stream");
    loaded = true;

    updateContentCheck();
}

// -------- Loading

let [config, token] = await Promise.all([
    fetch("../config.json").then(response => response.json()),
    checkLogin()
]);

//console.log(token);

let searchParameters = new URLSearchParams(window.location.search);
let event = searchParameters.get("event");

let client = new SGGHelperClient("Bearer " + token);

// -------- Callbacks

async function update(){
    await loadStationSets(client, event, config);
}

document.querySelector(".event-input").value = event;

function GOCallback(input){
    let slug = processEventSlug(input.value);
    if (!slug){
        alert("Please input a valid start.gg event URL or slug. Go to the page of your event on start.gg and copy the content of the URL bar.");

        return;
    }

    window.location.href = "/station_sets.html?event=" + slug 
}

const inputElement = document.querySelector(".event-input");
inputElement.addEventListener("keydown", (event) => {
    if (event.code == "Enter"){
        //console.log(event)
        console.log(event.target.value)
        GOCallback(event.target);
    }
})
document.querySelector(".event-input-container .button").addEventListener("click", () => {
    GOCallback(inputElement)
})

switchElement.init(updateContent);

initLayout();
update();
setInterval(() => {
    try {
        update();
    } catch (error){
        presentError(error);
    }
}, 20000);

} catch (error){
    contentManager.showError(error);
}