import { FitText } from "./DOMUtil.js";
import { makeSetHTML } from "./sets_display.js";
export * from "./sets_display.js"

export function fitPlayerNames(totalSets){
    for (let i = 0; i < totalSets; i++){
        FitText($(`.s${i} .p1 .playerName`));
        FitText($(`.s${i} .p2 .playerName`));
    }
}

export function addSets(sets){
    let i = 0;
    let html = "";
    for (let set of sets){
        console.log(set.state == 2 ? "Started" : "Called", set.slots[0].entrant.name, set.slots[1].entrant.name);
        html += makeSetHTML(set, index);

        i++;
    }

    $(".content").html(i ? html : '<div class = "no-matches">No matches</div>')
    fitPlayerNames(i);
}


