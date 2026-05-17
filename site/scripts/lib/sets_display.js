

export function initLayout(columns){
    $("#content").empty();
    let html = ""

    $(".content").html(html);
}


export function resetContent(){
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
    1: "waiting",
    2: "started",
    3: "finished",
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

export function makeSetHTML(set, index){
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
