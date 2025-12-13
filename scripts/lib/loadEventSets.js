import { getCalledSetsFactory } from "./api/getCalledSets.js";
import { resetContent, fitTexts, addSet } from "./sets_display.js";

const getCalledSets = await getCalledSetsFactory();

export async function loadEventSets(client, slug, config){

    let event = await getCalledSets(slug, client);

    if (!event);

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