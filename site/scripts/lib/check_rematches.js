import { getEventEntrantsFactory } from "./api/getEntrants.js";
import { getUserSetsFactory } from "./api/getUserSets.js";
import { deep_get_raw } from "./util.js";

const getEventEntrants = await getEventEntrantsFactory();
const getUserSets = await getUserSetsFactory();

const eventFilters = ["ladder", "2v2"]

class Player {
    constructor(user, player){
        this.slug = user.slug;
        this.id = player.id;
        this.name = player.gamerTag;
    }
}

export class LoadError {
    getMessage(){return "Unknown Error"}
    consoleMessage(){return "WHAT THE FUCK"}
}

export class NoPlayerDataError {
    constructor(player){
        this.player = player;
    }

    getMessage(){
        return `Coulnd't fetch data for player ${this.player.name} (ID : ${this.player.id})`
    }

    getConsoleMessage(){
        return this.getMessage();
    }
}

export async function getSets(client, slug, after, limiter, statusCallback, countCallback, errorCallback){
    console.log("Fetching event entrants")
    let entrantsList = await getEventEntrants(slug, client, limiter);
    console.log(entrantsList.length, "entrants");
    if (countCallback) countCallback(entrantsList.length);
    let players = entrantsList.map(entrant => {
        let p = entrant.participants;
        if (!p || p.length != 1) return;
        p = p[0];
        let user = p.user;
        let player = p.player;
        if (!user){
            console.warn("Participant with no user :", player.gamerTag, player.id);
        }
        return new Player(user, player);
    }).filter(player => !!player);

    let count = 0;
    let sets = await Promise.all(players.map( async player => {
        const sets = await getUserSets(player.id, after, client, limiter);
        if (!sets){
            errorCallback(new NoPlayerDataError(player));
        }
        count++;
        if (statusCallback) statusCallback(count)
        return {sets, player};
    }));

    return sets;
}

/**
 * @param {Array<{sets: Array<{}>, player: Player}>} players  
 * @param {boolean | string} streamed 
 * @param {string[]} eventFilters
 */
export function get_rematches(players, eventFilters = [], streamed = false){
    return getRematchesList(buildMatchesMatrix(players, eventFilters, streamed));
}

const unknown_event = {slug: "unknown_event", name: "Unknown Event", tournament: {name: "Unknown Tournament"}}

/**
 * @param {string[]} filters 
 * @param {Object} set 
 */
function isEventFiltered(filters, set){
    let slug = deep_get_raw(set, null, "event", "slug");
    if (!slug) {
        console.warn("No event slug for match", set);
        return true;
    }
    return filters.some(filter => slug.includes(filter));
}

/**
 * 
 * @param {Array<{sets: Array<{}>, player: Player}>} playersLists 
 * @param {string | boolean} streamed 
 * @param {string[]} eventFilters 
 * 
 */
function buildMatchesMatrix(playersLists, eventFilters, streamed){
    let indexes = playersLists.reduce((prev, current, index) => {
        prev[current.player.id] = index;
        return prev;
    }, {});

    let res = playersLists.map((playerData, currentIndex) => {
        let h2h = Array(playersLists.length - currentIndex - 1).fill(null).map(_ => ([]));
        let id = playerData.player.id;
        
        for (let set of playerData.sets){
            
            if (!set.event) continue;
            if (isEventFiltered(eventFilters, set)) continue;
            if (streamed && !set.stream || (typeof streamed == "string") && set.stream.streamName != streamed) continue;

            let currentPlayerSlotIndex = null;
            if (!set.completedAt) continue; //match pas fini
            if (set.slots[0].entrant.participants.length > 1) continue; //2v2
            for (let i = 0; i < 2; i++){
                let p = set.slots[i].entrant.participants[0]
                if (!p.player) continue;
                if (p.player.id == id){
                    currentPlayerSlotIndex = i;
                }
            }
            if (currentPlayerSlotIndex === null){
                console.error("PLAYER NOT FOUND IN OWN SET", set, id, playerData.player.slug);
                continue;
            }
            let otherPlayerID = deep_get_raw(set, null, "slots", 1 - currentPlayerSlotIndex, "entrant", "participants", 0, "player", "id");
            if (otherPlayerID === null){
                console.warn("Other player doesn't have a user ID", set, id, playerData.player.slug);
                continue;
            }
            let otherPlayerEntrantIndex = indexes[otherPlayerID];
            if (otherPlayerEntrantIndex){
                if (otherPlayerEntrantIndex > currentIndex){
                    h2h[otherPlayerEntrantIndex - currentIndex - 1].push(set);
                }
            }
        }
        return {player: playerData.player, h2h}
    })
    return res;
}

/**
 * @param {ReturnType<buildMatchesMatrix>} matrix 
 */
function getRematchesList(matrix){
    let res = [];
    matrix.forEach((playerData, lineIndex) => {
        playerData.h2h.forEach((matches, colIndex) => {
            let otherPlayerData = matrix[lineIndex + colIndex + 1];
            res.push({players: [playerData.player, otherPlayerData.player], matches});
        })
    })

    return res;
}

export function getStreamedSetFilterFunction(streamName){
    return streamName ? 
        (set => set.stream && (set.stream.streamName == streamName)) : 
        (set => !!set.stream)
}

/**
 * 
 * @param {Array<{sets: Array<{}>, player: Player}>} players 
 * @param {string[]} eventFilters 
 * 
 */
export function getStreamedMatchesForPlayer(players, eventFilters = [], streamName = null){
    const filterFunction = getStreamedSetFilterFunction(streamName);

    return players.map(player => {
        const matches = player.sets.filter(set => !isEventFiltered(eventFilters, set) && filterFunction(set));

        return {player: player.player, matches};
    });
}