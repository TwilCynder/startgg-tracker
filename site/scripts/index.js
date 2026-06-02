import { testTokenFactory } from "./lib/api/testToken.js"
import { show, hide, showNotif, hideNotif, showNotifTemp } from "./lib/DOMUtil.js";
import { processEventSlug } from "./lib/util.js";

let testToken = await testTokenFactory();

class ToggleManager {
    #ids;
    #currentIdx = 0;

    /**
     * @param {...string} elementsIDs 
     */
    constructor(...elementsIDs){
        this.#ids = elementsIDs;
    }

    #update(){
        for (let i = 0; i < this.#ids.length; i++){
            if (this.#currentIdx == i){
                hide(this.#ids[i]);
            } else {
                show(this.#ids[i]);
            }
        }
    }

    setIndex(i){
        this.#currentIdx = i;
        this.#update();
    }
}


new ToggleManager("#login", "#mode-select");

function displayMainMenu(){
    hide("#login");
    show("#mode-select");
    show("#disconnect");
}

async function startButton(){ 
    let token = document.getElementById("apikey").value;

    let res = await testToken(token);

    switch (res){
        case 0:
            break;
        case 1:
            alert("There seems to be a problem with the start.gg API. Please try again later");
            return;
        case 2:
            alert("The API token you provided is invalid. Please provide a valid API token")
            return;
    }

    localStorage.setItem('token', token);
    displayMainMenu();
}

document.getElementById("start-button").addEventListener("click", async (element) => {
    await startButton();
})
document.getElementById("apikey").addEventListener("keypress", async (event) => {
    if (event.key == "Enter"){
        await startButton();
    }
})

function eventModeGOCallback(){
    /**@type {string} */
    let slug = document.querySelector("#event-mode .mode-area-input").value;
    
    slug = processEventSlug(slug);
    if (!slug){
        alert("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        return;
    }

    window.location.href = "./pages/event_sets.html?event=" + slug 
}
document.querySelector("#event-mode .button").addEventListener("click", eventModeGOCallback)
document.querySelector("#event-mode .mode-area-input").addEventListener("keydown", (event) => {
    if (event.code == "Enter"){
        eventModeGOCallback()
    }
})

function stationModeGOCallback(){
    /**@type {string} */
    let slug = document.querySelector(".station-mode .input").value;

    slug = processEventSlug(slug);
    if (!slug){
        alert("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        return;
    }

    window.location.href = "./pages/station_sets.html?event=" + slug;
}
document.querySelector(".station-mode .button").addEventListener("click", stationModeGOCallback);
document.querySelector(".station-mode .input").addEventListener("keypress", (event) => {
    console.log(event);
    if (event.key == "Enter"){
        stationModeGOCallback()
    }
});

function playerModeGOCallback(){
    alert("Ce mode n'est pas encore impémenté ! désooooooo")
}
document.querySelector("#player-mode .button").addEventListener("click", playerModeGOCallback);
document.querySelector("#player-mode .mode-area-input").addEventListener("keydown", (event) => {
    console.log(event);
    if (event.code == "Enter"){
        playerModeGOCallback()
    }
});

document.querySelector("#disconnect").addEventListener("click", () => {
    localStorage.setItem("token", "");
    window.location.reload();
})

let token = localStorage.getItem("token");
if (token){
    showNotif("Saved token found, verifying ...")
    let res = 0//await testToken(token);
    switch (res){
        case 0:
            hideNotif();
            displayMainMenu();
            break;
        case 1: 
            showNotif("Saved token was invalid");
            break;
        case 2: 
            showNotifTemp("Coulnd't verify the saved token.", 5000)
            break;
    }
}
