
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { initLayout } from "./lib/sets_display.js";
import { processEventSlug } from "./lib/util.js";
import { getCalledSetsFactory } from "./lib/api/getCalledSets.js";
import { resetContent, addSets } from "./lib/tracker_pages.js";
import { PresentableError, presentError } from "./lib/error.js";
import { getAuthStatus } from "./lib/auth.js";
import { checkLogin } from "./lib/loginCheck.js";

const getCalledSets = await getCalledSetsFactory();

export async function loadEventSets(client, slug, config){
    if (!slug || slug == ""){
        throw new PresentableError("Please specify an event's URL or slug")
    }

    let event = await getCalledSets(slug, client);

    resetContent();

    //test
    //event.sets.nodes = Array(5).fill(event.sets.nodes).flat()

    let colsN = Math.ceil(Math.sqrt(event.sets.nodes.length));

    if (window.screen.width > window.screen.height){
        document.querySelector(".content").style.setProperty("grid-template-columns", "1fr ".repeat(colsN > 0 ? colsN : 1))
    } else {
        document.querySelector(".content").style.setProperty("grid-template-columns", "1fr " + (event.sets.nodes.length > 4 ? "1fr" : ""))
    }
    
    addSets(event.sets.nodes);

}

let [config, token] = await Promise.all([
    fetch("../config.json").then(response => response.json()),
    checkLogin()
]);

console.log(token);

/*
let token = localStorage.getItem("token")

if (!token){
    console.log("No token. Going back to homepage");
    window.location.href = "../index.html"
}
*/

let searchParameters = new URLSearchParams(window.location.search);
let event = searchParameters.get("event");

let client = new SGGHelperClient("Bearer " + token);

async function update(){
    try {
        await loadEventSets(client, event, config);
    } catch (err){
        presentError(err);
        return false;
    }
    return true;
}

document.querySelector(".event-input").value = event;

function GOCallback(input){
    let slug = processEventSlug(input.value);
    if (!slug){
        alert("Please input a valid start.gg event URL or slug. Go to the page of your event on start.gg and copy the content of the URL bar.");

        return;
    }

    window.location.href = "./event_sets.html?event=" + slug 
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

function startTimeout(){
    setTimeout(async () => {
        if (await update()) startTimeout();
    }, 5000);
}

initLayout();
if (await update()) startTimeout();