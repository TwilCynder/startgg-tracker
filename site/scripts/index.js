import { testTokenFactory } from "./lib/api/testToken.js"
import { getAuthStatus } from "./lib/auth.js";
import { show, hide, showNotif, hideNotif, showNotifTemp } from "./lib/DOMUtil.js";
import { processEventSlug } from "./lib/util.js";

let testToken = await testTokenFactory();


function displayMainMenu(){
    hide("#login");
    show("#mode-select");
    show("#disconnect");
}

function hideMainMenu(){
    show("#login");
    hide("#mode-select");
    hide("#disconnect");
}

async function performTokenTest(token){
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

async function startButton(){
    const inputElement = document.getElementById("apikey");
    inputElement.disabled = true;
    const buttonElement = document.getElementById("start-button");
    buttonElement.value = "Checking ...";
    
    let token = inputElement.value;

    try {
        await performTokenTest(token);
    } finally {
        inputElement.disabled = false;
        buttonElement.value = "Start";
    }
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

let authStatus;

document.querySelector("#disconnect").addEventListener("click", async () => {
    if (!authStatus) return;
    if (authStatus.mode == "api-key"){
        localStorage.setItem("token", "");
    } else {
        const response = await fetch("/logout", {
            method: "POST"
        });
        if (response.status != 200){
            console.error("Error while trying to log out : server returned", response.status, await response.json());
        }
    }
    hideMainMenu();
})

authStatus = await getAuthStatus();
if (authStatus){
    displayMainMenu();
}
