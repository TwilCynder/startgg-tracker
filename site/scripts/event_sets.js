
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { initSetsDisplayLayout } from "./lib/sets_display.js";
import { ID, Slug } from "./lib/util.js";
import { getCalledSetsFactory } from "./lib/api/getCalledSets.js";
import { resetContent, addSets } from "./lib/tracker_pages.js";
import { PresentableError, presentError } from "./lib/error.js";
import { getAuthStatus } from "./lib/auth.js";
import { checkLogin } from "./lib/loginCheck.js";
import { goToPageWithInputEvent } from "./lib/UICommon.js";
import { LoadingContentManager } from "./lib/contentSwitcher.js";
import { contentManagerErrorCallbackFactory, getEventIdentifierFromParams, runLoop } from "./lib/contentUtil.js";

const getCalledSets = await getCalledSetsFactory();

const contentManager = new LoadingContentManager;

async function loadEventSets(client, eventVariables, config){
    if (!eventVariables){
        throw new PresentableError("Please specify an event's URL or slug")
    }

    let data = await getCalledSets(eventVariables, client);

    resetContent();

    //test
    //event.sets.nodes = Array(5).fill(event.sets.nodes).flat()

    let colsN = Math.ceil(Math.sqrt(data.sets.nodes.length));

    if (window.screen.width > window.screen.height){
        document.querySelector(".content").style.setProperty("grid-template-columns", "1fr ".repeat(colsN > 0 ? colsN : 1))
    } else {
        document.querySelector(".content").style.setProperty("grid-template-columns", "1fr " + (data.sets.nodes.length > 4 ? "1fr" : ""))
    }
    
    addSets(data.sets.nodes);
    contentManager.showContent();

}

async function update(client, config, event){
    try {
        await loadEventSets(client, event.getGraphQLVariables(), config);
    } catch (err){
        presentError(err);
        return false;
    }
    return true;
}

function GOCallback(input){
    try {
        goToPageWithInputEvent(input, "event_sets");
    } catch (err) {
        presentError(err);
    }
}

const inputElement = document.querySelector(".event-input");
inputElement.addEventListener("keydown", (event) => {
    if (event.code == "Enter"){
        //console.log(event)
        console.log(event.target.value)
        GOCallback(event.target);
    }
});
document.querySelector(".event-input-container .button").addEventListener("click", () => {
    GOCallback(inputElement)
});


const errCallback = contentManagerErrorCallbackFactory(contentManager);

async function main(){
    initSetsDisplayLayout();

    let [config, token] = await Promise.all([
        fetch("../config.json").then(response => response.json()),
        checkLogin()
    ]);    
    console.log("Token : " + token);

    let client = new SGGHelperClient("Bearer " + token);

    let searchParameters = new URLSearchParams(window.location.search);
    let event = getEventIdentifierFromParams(searchParameters);
    console.log("Event :", event);

    document.querySelector(".event-input").value = event.toString();

    runLoop(() => update(client, config, event), errCallback, 5000);
}
await try_(main, errCallback)