import { getEventEntrantsFactory } from "./api/getEntrants.js";
import { getSetsFactory } from "./api/getSets.js";
import { TimedQuerySemaphore, SGGHelperClient} from "./api/sgg-helper.js";

const getSets = getSetsFactory();
const getEntrants = getEventEntrantsFactory();

/**
 * 
 * @param {SGGHelperClient} client 
 * @param {string} current_slug 
 * @param {string[]} past_slugs 
 * @param {TimedQuerySemaphore} limiter 
 */
export async function get_rematches(client, current_slug, past_slugs, limiter){
    let [entrants, setsArray] = Promise.all([
        getEntrants(current_slug, client, limiter),
        Promise.all(past_slugs.map(slug => getSets(slug, client, limiter)))
    ]);
 
    console.log(entrants, setsArray)
}