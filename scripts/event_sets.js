
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { initLayout } from "./lib/sets_display.js";
import { loadEventSets } from "./lib/loadEventSets.js";
import { processEventSlug } from "./lib/util.js";

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