import { testTokenFactory } from "./lib/api/testToken.js"

let testToken = await testTokenFactory();



function hide(elementName){
    let element = document.querySelector(elementName);
    
    element.style.setProperty(`display`, "none");
    element.style.setProperty('opacity', "0");
}

function show(elementName){let element = document.querySelector(elementName);
    
    element.style.setProperty(`display`, "flex");
    element.style.setProperty('opacity', "100%");
}


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


new ToggleManager("#token-input", "#mode-select");

function displayMainMenu(){
    hide("#token-input");
    show("#mode-select");
}

document.getElementById("start-button").addEventListener("click", async (element) => {
    
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
})

function eventModeGOCallback(){
    /**@type {string} */
    let slug = document.querySelector("#event-mode .mode-area-input").value;
    
    let split = slug.split("start.gg/");
    if (split.length != 2){
        alert("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        return;
    }
    slug = split[1];
    split = slug.split(/\//)
    if (split[0] != "tournament" || split[2] != "event" || split.length < 4){
        alert("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        return;
    }

    slug = split.slice(0, 4).join("/");
    console.log(slug);

    window.location.href = "./event_sets.html?event=" + slug 
}

document.querySelector("#event-mode .button").addEventListener("click", eventModeGOCallback)
document.querySelector("#event-mode .mode-area-input").addEventListener("keydown", (event) => {
    if (event.code == "Enter"){
        eventModeGOCallback()
    }
})

function playerModeGOCallback(){
    alert("Ce mode n'est pas encore impémenté ! désooooooo")
}

document.querySelector("#player-mode .button").addEventListener("click", async (element) => playerModeGOCallback);
document.querySelector("#player-mode .mode-area-input").addEventListener("keydown", (event) => {
    if (event.code == "Enter"){
        playerModeGOCallback()
    }
});
