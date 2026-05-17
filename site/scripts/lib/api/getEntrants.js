import queryManager from "../queryManager.js";

const schema_filename = "./schemas/EventEntrants.graphql";


export async function getEventEntrantsFactory(){
    let query = await queryManager.tryQuery("eventEntrants", new URL(schema_filename, import.meta.url));

    /**
     * @param {string} slug
     * @param {Client} client
     * @param {TimedQuerySemaphore} limiter
     */
    return async function getEventEntrants(slug, client, limiter){
        /** @type {Object[]?} */
        let result = await query.executePaginated(client, {slug}, "event.entrants", limiter, {
            perPage: 200
        });
        
        if (!result){
            throw new Error("Couldn't fetch events from " + slug + " ; invalid response (might indicate non-existent event)");
        }

        return result;
    }
}