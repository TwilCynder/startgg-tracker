import { getEventEntrantsFactory } from "./api/getEntrants.js"
import { getUserSetsFactory } from "./api/getUserSets.js";
import { deep_get } from "./util.js";

const getEventEntrants = await getEventEntrantsFactory();
const getUserSets = await getUserSetsFactory();

/**
 * 
 * @param {SGGHelperClient} client 
 * @param {string} current_slug 
 * @param {string[]} past_slugs 
 * @param {TimedQuerySemaphore} limiter 
 */
export async function get_rematches(client, slug, after, limiter){
    let entrantsList = await getEventEntrants(slug, client, limiter);
    let slugs = entrantsList.map(entrant => {
        let p = entrant.participants;
        console.log(entrantsList.length)
        if (!p || p.length != 1) return;
        let slug = deep_get(p, "0.user.slug");
        if (!slug) {
            console.warn("User with no slug !");
            return;
        }
        return slug;
    }).filter(slug => !!slug);
    let sets = await Promise.all(slugs.slice(0, 10).map( async slug => ({sets: await getUserSets(slug, after, client, limiter), slug})));
    console.log(sets);
}

/**
 * 
 * @param {string[]} slugs 
 * @param {Array<Array<any>>} setsLists 
 */
function processData(slugs, setsLists){

}