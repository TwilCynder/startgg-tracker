
import { Client } from "./lib/api/request.js";
import { initLayout, loadSets } from "./lib/lib.js";

let eventSlug = "tournament/tournoi-test-halua/event/1v1-ult-2"

let config = await fetch("./config.json")
    .then(response => response.json())

let client = new Client("Bearer " + config.token);

function update(){
    loadSets(client, eventSlug, config);
}

initLayout();
update();
setInterval(() => {
    update();
}, 50000);
