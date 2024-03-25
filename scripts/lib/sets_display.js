import { FitText } from "./DOMUtil.js";
import { getCalledSetsFactory } from "./api/getCalledSets.js";

const getCalledSets = await getCalledSetsFactory();

export function initLayout(columns){
    $("#content").empty();
    let html = ""
    /*for (let i = 0; i < (columns || 2) ; i++){
        html += `<div class = "column col${i}"></div>`
    }*/
    $(".content").html(html);
}


function resetContent(){
    $(".content").empty();
}

/**
 * @param {number} time 
 */
//the fact that this function is necessary is so fucking stupid LMAOOOO fuck you javascipt
function getTimeString(time){
    let result = "";

    time = Math.floor(time / 1000); //seconds 
    let seconds = time % 60;
    time = Math.floor(time / 60); //minutes
    let minutes = time % 60;
    time = Math.floor(time / 60); //hours

    if (time > 0) result += time.toString().padStart(2, "0") + ":";
    result += minutes.toString().padStart(2, "0") + ":";
    result += seconds.toString().padStart(2, "0");
    
    return result
}

const state_names = {
    2: "started",
    6: "called"
}
function getStateName(state){
    return state_names[state];
}

function setInfoBoxHTML(set){
    let state_name = getStateName(set.state);
    if (!state_name) return "";

    let timeElapsed = new Date() - new Date(set.startedAt * 1000);

    return `
        <div class = "set-infobox set-infobox-${state_name}">${getTimeString(timeElapsed)}</div>
    `
}

function makeSetHTML(set, index){
    return `
        <div class = "set s${index} ${set.state == 6 ? "called" : "started"}">
            <div class = "players-container">
                <div class = "player p1">
                    <div class = "playerName">
                        <div class = "text">
                            ${set.slots[0].entrant.name}
                        </div>
                    </div>
                </div>
                <div class = "player p2">
                    <div class = "playerName">
                        <div class = "text">
                            ${set.slots[1].entrant.name}
                        </div>
                    </div>
                </div>
            </div>
            ${setInfoBoxHTML(set)}
        </div>

    `
}

function addSet(set, index, config){
    let html = makeSetHTML(set, index);
    $(".content").append(html);
}

function fitTexts(totalSets){
    for (let i = 0; i < totalSets; i++){
        FitText($(`.s${i} .p1 .playerName`));
        FitText($(`.s${i} .p2 .playerName`));
    }
}

export async function loadSets(client, slug, config){
    let event = await getCalledSets(slug, client);

    console.log(event);

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
