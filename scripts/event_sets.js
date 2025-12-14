
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { initLayout } from "./lib/sets_display.js";
import { processEventSlug } from "./lib/util.js";
import { getCalledSetsFactory } from "./lib/api/getCalledSets.js";
import { resetContent, fitTexts, addSet } from "./lib/sets_display.js";
const getCalledSets = await getCalledSetsFactory();

export async function loadEventSets(client, slug, config){

    let event = await getCalledSets(slug, client);

    if (!event);

    resetContent();

    //test
    //event.sets.nodes = Array(5).fill(event.sets.nodes).flat()

    let colsN = Math.ceil(Math.sqrt(event.sets.nodes.length));
    console.log("colsn", colsN);

    if (window.screen.width > window.screen.height){
        document.querySelector(".content").style.setProperty("grid-template-columns", "1fr ".repeat(colsN))
    } else {
        document.querySelector(".content").style.setProperty("grid-template-columns", "1fr " + (event.sets.nodes.length > 4 ? "1fr" : ""))
    }
    

    let i = 0;
    for (let set of event.sets.nodes){
        console.log(set.state == 2 ? "Started" : "Called", set.slots[0].entrant.name, set.slots[1].entrant.name)
        addSet(set, i, config);
        i++;
    }
    fitTexts(i);

}

let config = await fetch("../config.json")
    .then(response => response.json())

let token = localStorage.getItem("token")

if (!token){
    console.log("No token. Going back to homepage");
    window.location.href = "./index.html"
}

let searchParameters = new URLSearchParams(window.location.search);
let event = searchParameters.get("event");

let client = new SGGHelperClient("Bearer " + token);

async function update(){
    try {
        await loadEventSets(client, event, config);
    } catch (err){
        alert(err);
        console.error(err);
    }
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
})


initLayout();
update();
setInterval(() => {
    update();
}, 50000);