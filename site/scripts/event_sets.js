
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { initLayout } from "./lib/sets_display.js";
import { getEventIdentifierFromParams, ID, Slug } from "./lib/util.js";
import { getCalledSetsFactory } from "./lib/api/getCalledSets.js";
import { resetContent, addSets } from "./lib/tracker_pages.js";
import { PresentableError, presentError } from "./lib/error.js";
import { getAuthStatus } from "./lib/auth.js";
import { checkLogin } from "./lib/loginCheck.js";
import { goToPageWithInputEvent } from "./lib/UICommon.js";

const getCalledSets = await getCalledSetsFactory();

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
    goToPageWithInputEvent(input, "event_sets")
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
});

async function main(){
    initLayout();

    let [config, token] = await Promise.all([
        fetch("../config.json").then(response => response.json()),
        checkLogin()
    ]);    
    console.log("Token : " + token);

    let client = new SGGHelperClient("Bearer " + token);

    let searchParameters = new URLSearchParams(window.location.search);
    let event = getEventIdentifierFromParams(searchParameters);
    console.log("Event :", event);

    if (!event){
        alert("No event specified");
        return;
    }

    document.querySelector(".event-input").value = event.toString();

    const run = async () => {if (await update(client, config, event)) startTimeout()};

    function startTimeout(){
        setTimeout(() => {
            run();
        }, 5000);
    }
    await run();
}
main();