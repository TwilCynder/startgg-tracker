import { getEventEntrantsFactory } from "./api/getEntrants.js"
import { getUserSetsFactory } from "./api/getUserSets.js";
import { deep_get } from "./util.js";

const getEventEntrants = await getEventEntrantsFactory();
const getUserSets = await getUserSetsFactory();

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
            console.warn("Participant with no user :", player.gamerTag);
        }
        return new Player(user, player);
    }).filter(slug => !!slug);
    let sets = await Promise.all(players.slice(0, 20).map( async player => ({sets: await getUserSets(player.id, after, client, limiter), player})));
    console.log(sets);
    getRematchesList(buildMatchesMatrix(sets));
}

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

    let earliest = Infinity
    let res = playersLists.map((playerData, currentIndex) => {
        let h2h = Array(playersLists.length - currentIndex - 1).fill(null).map(_ => ([]));
        let id = playerData.player.id;
        
        for (let set of playerData.sets){
            console.log(set.completedAt) ; if (set.completedAt < 1722513915) {
                console.error("TMRLPT STARTGG", set);
                if (set.completedAt && set.completedAt < earliest){
                    earliest = set.completedAt;
                }
            };
            let currentPlayerSlotIndex = null;
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
    console.warn(earliest)
    return res;
}

/**
 * @param {ReturnType<buildMatchesMatrix>} matrix 
 */
function getRematchesList(matrix){
    for (let p of matrix){
        console.log(p.player.name)
    }
    matrix.forEach((playerData, lineIndex) => {
        playerData.h2h.forEach((matches, colIndex) => {
            if (matches.length > 0){
                let otherPlayerData = matrix[lineIndex + colIndex + 1];
                console.log(playerData.player.name, otherPlayerData.player.name, matches.length, matches);
            }
        })
    })
}