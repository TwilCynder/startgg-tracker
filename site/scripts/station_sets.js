
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { HtmlString, htmlT } from "./lib/util.js";
import { getStationSetsFactory } from "./lib/api/getStationSets.js";
import { contentDiv, initSetsDisplayLayout, makeSetHTML, resetContent } from "./lib/sets_display.js";
import { presentError } from "./lib/error.js";
import { FitText } from "./lib/DOMUtil.js";
import { fitPlayerNames } from "./lib/tracker_pages.js";
import { SwitchElement } from "./lib/switchElement.js";
import { checkLogin } from "./lib/loginCheck.js";
import { LoadingContentManagerWithProgress } from "./lib/contentSwitcher.js";
import { goToPageWithInputEvent } from "./lib/UICommon.js";
import { contentManagerErrorCallbackFactory, getEventIdentifierFromParams, runLoop, try_ } from "./lib/contentUtil.js";

const getStationSets = await getStationSetsFactory();

const contentManager = new LoadingContentManagerWithProgress;

let content = {
    stations: null,
    streams: null
}
let loaded = false;

const switchElement = new SwitchElement(document.querySelector(".switch-container"));

// -------- Content update functions

function makeSetLists(lists, className, titlePrefix = ""){
    let single = Object.keys(lists).length < 2;

    let html = new HtmlString; let index = 0; let list_index = 0;
    for (const list_id in lists){
        const station = lists[list_id];
        let sets_html = HtmlString.from(...station.map(set => makeSetHTML(set, index++)));
        html.append(htmlT`<div class = "setlist-container ${className} ${single ? "setlist-wrap" : ""}"><div class = "t${list_index++} setlist-title ${className}-title"><div class = "text">${titlePrefix}${list_id}</div></div><div class = "setlist">${sets_html}</div></div>`)
    }
    return {html, count: index, listsCount: list_index};
}

function fitTitles(count){
    for (let i = 0; i < count; i++){
        FitText(document.querySelector(`.t${i}`));
    } 
}

function displayList(list){
    resetContent();
    if (list && list.count){
        contentDiv().innerHTML = list.html
        fitPlayerNames(list.count);
        fitTitles(list.listsCount);
    } else {
        contentDiv().innerHTML = '<div class = "no-matches">No matches</div>'
    }
}

function updateContent(streams){
    if (!loaded) return;
    if (streams){
        displayList(content.streams);
    } else {
        displayList(content.stations);
    }
    contentManager.showContent();
}

function updateContentCheck(){
    updateContent(switchElement.isChecked());
}

// -------- Callbacks

async function update(client, eventIdentifier, config){
    console.log(client, eventIdentifier, config);
    let res = await getStationSets(eventIdentifier, client, (currentPage, totalPages) => {
        console.log(currentPage, totalPages)
        contentManager.setLoadingProgressText(totalPages ? Math.round(currentPage / totalPages * 100) + "%" : "...")
    });

    console.log(res);

    content.stations = makeSetLists(res.stations, "station", "Station ");
    content.streams = makeSetLists(res.streams, "stream");
    loaded = true;

    updateContentCheck();
}

document.querySelector(".event-input").value = event;

function GOCallback(input){
    goToPageWithInputEvent(input, "station_sets")
}

const inputElement = document.querySelector(".event-input");
inputElement.addEventListener("keydown", (event) => {
    if (event.code == "Enter"){
        GOCallback(event.target);
    }
})
document.querySelector(".event-input-container .button").addEventListener("click", () => {
    GOCallback(inputElement)
})

const errCallback = contentManagerErrorCallbackFactory(contentManager);

async function main(){
    switchElement.init(updateContent);
    initSetsDisplayLayout();

    // -------- Loading

    let [config, token] = await Promise.all([
        fetch("../config.json").then(response => response.json()),
        checkLogin()
    ]);    
    console.log("Token : " + token);

    let client = new SGGHelperClient("Bearer " + token);

    let searchParameters = new URLSearchParams(window.location.search);
    let eventIdentifier = getEventIdentifierFromParams(searchParameters);
    console.log("Event :", eventIdentifier);

    if (!eventIdentifier){
        alert("No event specified");
        return;
    }

    document.querySelector(".event-input").value = eventIdentifier.toString();

    /*
    const updateAndContinue = async () => {if (await update(client, eventIdentifier, config)) startTimeout()};
    await update(client, eventIdentifier, config);
    setInterval(
        try_.bind(undefined, () => update(client, eventIdentifier, config), contentManager), 
        20000
    );
    */

    runLoop(() => update(client, eventIdentifier, config), errCallback, 20000);
}
await try_(main, errCallback);

