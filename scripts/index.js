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
    displayMainMenu();
    /*
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
    */
})

document.querySelector("#event-mode .button").addEventListener("click", async (element) => {
    let slug = document.querySelector("#event-mode .mode-area-input").value;
    console.log(slug);
    //window.location.href = "./event_sets.html?slug=" 
})

document.querySelector("#player-mode .button").addEventListener("click", async (element) => {
    alert("Ce mode n'est pas encore impémenté ! désooooooo")
})