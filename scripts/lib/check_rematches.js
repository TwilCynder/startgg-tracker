import { getEventEntrantsFactory } from "./api/getEntrants.js"
import { getUserSetsFactory } from "./api/getUserSets.js";
import { deep_get } from "./util.js";

const getEventEntrants = await getEventEntrantsFactory();
const getUserSets = await getUserSetsFactory();

const eventFilters = ["ladder", "2v2"]

class Player {
    constructor(user, player){
        this.slug = user.slug;
        this.id = user.id;
        this.name = player.gamerTag;
    }
}

/**
 * 
 * @param {SGGHelperClient} client 
 * @param {string} current_slug 
 * @param {string[]} past_slugs 
 * @param {TimedQuerySemaphore} limiter 
 */
export async function get_rematches(client, slug, after, limiter){
    let entrantsList = await getEventEntrants(slug, client, limiter);
    console.log(entrantsList.length)
    let players = entrantsList.map(entrant => {
        let p = entrant.participants;
        if (!p || p.length != 1) return;
        p = p[0];
        let user = p.user;
        let player = p.player;
        if (!user){
            console.warn("Participant with no user :", player.gamerTag, "(skipping)");
            return null;
        }
        return new Player(user, player);
    }).filter(player => !!player);
    let sets = await Promise.all(players.map( async player => ({sets: await getUserSets(player.id, after, client, limiter), player})));
    
    return getRematchesList(buildMatchesMatrix(sets));
}

const unknown_event = {slug: "unknown_event", name: "Unknown Event", tournament: {name: "Unknown Tournament"}}

/**
 * 
 * @param {string[]} slugs 
 * @param {Array<{sets: Array<{}>, player: Player}>} playersLists 
 */
function buildMatchesMatrix(playersLists){
    let indexes = playersLists.reduce((prev, current, index) => {
        prev[current.player.id] = index;
        return prev;
    }, {});

    let res = playersLists.map((playerData, currentIndex) => {
        let h2h = Array(playersLists.length - currentIndex - 1).fill(null).map(_ => ([]));
        let id = playerData.player.id;
        
        for (let set of playerData.sets){
            
            if (!set.event) continue;
            if (eventFilters.some(filter => set.event.slug.includes(filter))) continue;

            let currentPlayerSlotIndex = null;
            if (!set.completedAt) continue; //match pas fini
            if (set.slots[0].entrant.participants.length > 1) continue; //2v2
            for (let i = 0; i < 2; i++){
                let p = set.slots[i].entrant.participants[0]
                if (!p.user) continue;
                if (p.user.id == id){
                    currentPlayerSlotIndex = i;
                }
            }
            if (currentPlayerSlotIndex === null){
                console.error("PLAYER NOT FOUND IN OWN SET", set, id, playerData.player.slug);
                continue;
            }
            let otherPlayerID = deep_get(set, `slots.${1 - currentPlayerSlotIndex}.entrant.participants.0.user.id`);
            if (otherPlayerID === null){
                console.warn("Other play doesn't have a user ID", set, id, playerData.player.slug);
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
            if (matches.length > 0){
                let otherPlayerData = matrix[lineIndex + colIndex + 1];
                res.push({players: [playerData.player, otherPlayerData.player], matches});
            }
        })
    })

    return res.sort((a, b) => b.matches.length - a.matches.length);
}