
import { SGGHelperClient } from "./lib/api/sgg-helper.js";
import { loadStationSets } from "./lib/loadStationSets.js";
import { initLayout } from "./lib/sets_display.js";
import { processEventSlug } from "./lib/util.js";

let config = await fetch("./config.json")
    .then(response => response.json())

let token = localStorage.getItem("token")

if (!token){
    console.log("No token. Going back to homepage");
    window.location.href = "./index.html"
}

let searchParameters = new URLSearchParams(window.location.search);
let event = searchParameters.get("event");

let client = new SGGHelperClient("Bearer " + token);

function update(){
    loadStationSets(client, event, config);
}

document.querySelector(".event-input").value = event;

document.querySelector(".event-input").addEventListener("keypress", (event) => {
    if (event.key == "Enter"){
        //console.log(event)
        console.log(event.target.value)
        let slug = processEventSlug(event.target.value);
        window.location.href = "./event_sets.html?event=" + slug;
    }
})

initLayout();
update();
setInterval(() => {
    update();
}, 50000);