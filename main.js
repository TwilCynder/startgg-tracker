import { FitText } from "./js/DOMUtil.js";
import { fetchSetsFactory } from "./js/api/getCalledSets.js";
const fetchSets = await fetchSetsFactory();

let config = {};
let eventSlug = config.event || "tournament/tournoi-test-halua/event/1v1-ult-2"

function initLayout(){
    $("#content").empty();
    let html = ""
    for (let i = 0; i < (config.columns || 2) ; i++){
        html += `<div class = "column col${i}"></div>`
    }
    $(".content").html(html);
}

function resetContent(){
    $(".column").empty();
}

function makeSetHTML(set, index){
    return `
        <div class = "set s${index} ${set.state == 6 ? "called" : "started"}">
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
    `
}

function addSet(set, index){
    let html = makeSetHTML(set, index);
    $(".column.col" + index % config.columns).append(html);
}

function fitTexts(totalSets){
    for (let i = 0; i < totalSets; i++){
        FitText($(`.s${i} .p1 .playerName`));
        FitText($(`.s${i} .p2 .playerName`));
    }
}

async function loadSets(){
    let event = await fetchSets(eventSlug, "Bearer " + config.token);

    resetContent();

    let i = 0;
    for (let set of event.sets.nodes){
        console.log(set.state == 2 ? "Started" : "Called", set.slots[0].entrant.name, set.slots[1].entrant.name)
        addSet(set, i);
        i++;
    }
    fitTexts(i);

}

function init(){
    initLayout();
}

function update(){
    loadSets();
}


fetch("./config.json")
    .then(response => response.json())
    .then(json => {
        config = json;
    })
    .then(async () => {
        init();
        update();
        setInterval(() => {
            update();
        }, 15000);
    });
