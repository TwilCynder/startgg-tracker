import { deep_get } from "../util.js";
import queryManager from "../queryManager.js";

const schema_filename = "./schemas/EventEntrants.graphql";

export async function getEventEntrantsFactory(){
    let query = await queryManager.tryQuery("eventEntrants", new URL(schema_filename, import.meta.url));

    return async function getEventEntrants(slug, client, limiter){
        let result = await query.executePaginated(client, {slug}, "event.entrants.nodes", limiter);
        
        if (!result){
            throw new Error("Couldn't fetch events from " + slug + " ; invalid response (might indicate non-existent event) : " + JSON.stringify(response))
        }

        return result;
    }
}