
import { Client } from "./lib/api/request.js";
import { initLayout, loadSets } from "./lib/lib.js";

let config = await fetch("./config.json")
    .then(response => response.json())

let token = localStorage.getItem("token")

if (!token){
    console.log("No token. Going back to homepage");
    window.location.href = "./index.html"
}

let searchParameters = new URLSearchParams(window.location.search);
let event = searchParameters.get("event");

let client = new Client("Bearer " + token);

function update(){
    loadSets(client, event, config);
}

initLayout();
update();
setInterval(() => {
    update();
}, 50000);