import { FitText } from "./DOMUtil.js";
import { makeSetHTML } from "./sets_display.js";
export * from "./sets_display.js"

export function addSet(set, index, config){
    let html = makeSetHTML(set, index);
    $(".content").append(html);
}

export function fitTexts(totalSets){
    for (let i = 0; i < totalSets; i++){
        FitText($(`.s${i} .p1 .playerName`));
        FitText($(`.s${i} .p2 .playerName`));
    }
}
