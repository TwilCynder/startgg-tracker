
/**
 * 
 * @param {SGGHelperClient} client 
 * @param {string} current_slug 
 * @param {string[]} past_slugs 
 * @param {TimedQuerySemaphore} limiter 
 */
export async function get_rematches(client, entrantsList, sets, limiter){
    let [entrants, setsArray] = Promise.all([
        getEntrants(current_slug, client, limiter),
        Promise.all(past_slugs.map(slug => getSets(slug, client, limiter)))
    ]);
 
    console.log(entrants, setsArray)
}